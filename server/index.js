import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { getAllItems, insertItem, updateItem, deleteItem } from './db.js'

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

// Broadcast the full authoritative list to every connected client.
// Called after every mutation so all clients converge on the same state
// regardless of missed events, batching, or brief disconnects.
function syncAll() {
  io.emit('items:sync', getAllItems())
}

io.on('connection', (socket) => {
  // Send full list to the newly connected client
  socket.emit('items:sync', getAllItems())

  socket.on('items:get', () => {
    socket.emit('items:sync', getAllItems())
  })

  socket.on('item:add', () => {
    try {
      insertItem({ name: '', original_cost: null, claimed_by: null, fb_price: null })
      syncAll()
    } catch (e) {
      socket.emit('server:error', { message: 'Failed to add item', detail: e.message })
    }
  })

  socket.on('item:update', (payload) => {
    try {
      const { id, name, original_cost, claimed_by, fb_price } = payload
      updateItem({
        id: Number(id),
        name: name ?? '',
        original_cost: original_cost ?? null,
        claimed_by: claimed_by ?? null,
        fb_price: fb_price ?? null
      })
      syncAll()
    } catch (e) {
      socket.emit('server:error', { message: 'Failed to update item', detail: e.message })
    }
  })

  socket.on('item:delete', ({ id }) => {
    try {
      deleteItem(Number(id))
      syncAll()
    } catch (e) {
      socket.emit('server:error', { message: 'Failed to delete item', detail: e.message })
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
