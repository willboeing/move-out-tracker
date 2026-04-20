import { useState, useEffect } from 'react'
import socket from './socket'
import SummaryBar from './components/SummaryBar'
import ItemTable from './components/ItemTable'
import ExportButton from './components/ExportButton'

export default function App() {
  const [items, setItems] = useState([])

  // Android Chrome doesn't fire blur when tapping non-focusable areas.
  // This forces blur on the active input whenever a touch lands outside an input/select.
  useEffect(() => {
    const handleTouchStart = (e) => {
      const active = document.activeElement
      if (!active) return
      const tag = active.tagName
      if (tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') return
      if (!active.contains(e.target)) active.blur()
    }
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    return () => document.removeEventListener('touchstart', handleTouchStart)
  }, [])

  useEffect(() => {
    // Single handler: server always sends the full authoritative list.
    // Used for initial load (on connect) and after every mutation.
    const onSync = (data) => setItems(data)
    socket.on('items:sync', onSync)

    // socket.js creates the connection at module import time, before React
    // mounts. The server emits items:sync on connect, but this effect runs
    // after the first render — so that initial event is often already gone.
    // If already connected, request a sync now. Re-request on every
    // reconnect so server restarts/redeploys never leave stale UI.
    const requestSync = () => socket.emit('items:get')
    socket.on('connect', requestSync)
    if (socket.connected) requestSync()

    return () => {
      socket.off('items:sync', onSync)
      socket.off('connect', requestSync)
    }
  }, [])

  const handleAdd = () => socket.emit('item:add')

  const handleUpdate = (id, fields) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    socket.emit('item:update', { ...item, ...fields })
  }

  const handleDelete = (id) => socket.emit('item:delete', { id })

  return (
    <div className="app">
      <header className="app-header">
        <h1>Move-Out Tracker</h1>
        <p className="app-subtitle">Real-time shared inventory for the move-out</p>
      </header>

      <SummaryBar items={items} />

      <div className="table-section">
        <div className="table-actions">
          <button className="btn-add" onClick={handleAdd}>
            + Add Item
          </button>
          <ExportButton items={items} />
        </div>
        <ItemTable items={items} onUpdate={handleUpdate} onDelete={handleDelete} />
      </div>
    </div>
  )
}
