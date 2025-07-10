import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { OrderManager } from './OrderManager'
import { SocketHandlers } from './SocketHandlers'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

// Initialize game systems
const orderManager = new OrderManager(io)
const socketHandlers = new SocketHandlers(io, orderManager)

// Handle socket connections
io.on('connection', (socket) => {
  socketHandlers.handleConnection(socket)
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})