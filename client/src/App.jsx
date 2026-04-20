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
    const onInit = (data) => setItems(data)
    const onAdded = (item) => setItems((prev) => [...prev, item])
    const onUpdated = (item) => setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
    const onDeleted = ({ id }) => setItems((prev) => prev.filter((i) => i.id !== id))

    socket.on('items:init', onInit)
    socket.on('item:added', onAdded)
    socket.on('item:updated', onUpdated)
    socket.on('item:deleted', onDeleted)

    return () => {
      socket.off('items:init', onInit)
      socket.off('item:added', onAdded)
      socket.off('item:updated', onUpdated)
      socket.off('item:deleted', onDeleted)
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
