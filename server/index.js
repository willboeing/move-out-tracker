import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { getAllItems, getItemById, insertItem, updateItem, deleteItem } from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

if (isProd) {
  app.use(express.static(join(__dirname, '../client/dist')))
}

app.get('/api/items', (req, res) => {
  res.json(getAllItems())
})

app.post('/api/items', (req, res) => {
  const item = insertItem({ name: '', original_cost: null, claimed_by: null, fb_price: null })
  res.json(item)
})

app.put('/api/items/:id', (req, res) => {
  const { name, original_cost, claimed_by, fb_price } = req.body
  const item = updateItem({ id: Number(req.params.id), name, original_cost, claimed_by, fb_price })
  res.json(item)
})

app.delete('/api/items/:id', (req, res) => {
  deleteItem(Number(req.params.id))
  res.json({ success: true })
})

io.on('connection', (socket) => {
  socket.emit('items:init', getAllItems())

  socket.on('item:add', () => {
    try {
      const item = insertItem({ name: '', original_cost: null, claimed_by: null, fb_price: null })
      io.emit('item:added', item)
    } catch (e) {
      socket.emit('error', { message: 'Failed to add item', detail: e.message })
    }
  })

  socket.on('item:update', (payload) => {
    try {
      const { id, name, original_cost, claimed_by, fb_price } = payload
      const item = updateItem({
        id: Number(id),
        name: name ?? '',
        original_cost: original_cost ?? null,
        claimed_by: claimed_by ?? null,
        fb_price: fb_price ?? null
      })
      if (item) io.emit('item:updated', item)
    } catch (e) {
      socket.emit('error', { message: 'Failed to update item', detail: e.message })
    }
  })

  socket.on('item:delete', ({ id }) => {
    try {
      deleteItem(Number(id))
      io.emit('item:deleted', { id: Number(id) })
    } catch (e) {
      socket.emit('error', { message: 'Failed to delete item', detail: e.message })
    }
  })
})

// In production, serve React app for all non-API routes
if (isProd) {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'))
  })
}

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
