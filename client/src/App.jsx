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
    // REST fetch handles initial load and reconnects — avoids the socket
    // timing race where the server fires items:sync before this listener
    // is registered (socket connects at module import, before React mounts).
    const fetchItems = () =>
      fetch('/api/items').then((r) => r.json()).then(setItems).catch(() => {})

    fetchItems()
    socket.on('connect', fetchItems)

    // Socket handles all real-time push updates after mutations.
    const onSync = (data) => setItems(data)
    socket.on('items:sync', onSync)

    return () => {
      socket.off('connect', fetchItems)
      socket.off('items:sync', onSync)
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
