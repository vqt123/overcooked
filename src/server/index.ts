import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

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

interface Player {
  id: string
  position: { x: number; y: number }
  color: string
  heldItem?: any
}

interface GameState {
  players: { [id: string]: Player }
  ingredients: any[]
  orders: any[]
  score: number
}

const gameState: GameState = {
  players: {},
  ingredients: [],
  orders: [],
  score: 0
}

// Server manages order generation
let orderIdCounter = 1
let nextOrderTime = 5000 // First order in 5 seconds

function generateOrder() {
  const orderTypes = [
    // Simple orders
    [{ type: 'tomato', state: 'chopped' }],
    [{ type: 'lettuce', state: 'chopped' }],
    [{ type: 'bread', state: 'cooked' }],
    
    // Complex orders (burgers)
    [
      { type: 'bread', state: 'cooked' },
      { type: 'tomato', state: 'chopped' },
      { type: 'lettuce', state: 'chopped' }
    ],
    [
      { type: 'bread', state: 'cooked' },
      { type: 'cheese', state: 'cooked' },
      { type: 'tomato', state: 'chopped' }
    ]
  ]

  const selectedOrder = orderTypes[Math.floor(Math.random() * orderTypes.length)]
  
  return {
    data: {
      id: `#${orderIdCounter++}`,
      items: selectedOrder,
      timeRemaining: 30000, // 30 seconds
      maxTime: 30000,
      points: 100
    }
  }
}

// Server game loop for order generation
setInterval(() => {
  nextOrderTime -= 1000 // 1 second intervals
  
  if (nextOrderTime <= 0 && gameState.orders.length < 3) {
    const newOrder = generateOrder()
    gameState.orders.push(newOrder)
    nextOrderTime = 15000 + Math.random() * 10000 // 15-25 seconds
    
    console.log(`Generated new order: ${newOrder.data.id}`)
    
    // Broadcast new order to all clients
    io.emit('orderUpdate', gameState.orders)
  }
  
  // Update existing orders
  gameState.orders = gameState.orders.filter(order => {
    order.data.timeRemaining -= 1000
    
    // Reduce points as time passes
    const timeRatio = order.data.timeRemaining / order.data.maxTime
    order.data.points = Math.max(10, Math.floor(100 * timeRatio))
    
    if (order.data.timeRemaining <= 0) {
      // Order expired - lose points
      gameState.score = Math.max(0, gameState.score - 50)
      io.emit('scoreUpdate', gameState.score)
      return false
    }
    return true
  })
  
  // Broadcast updated orders if any changed
  if (gameState.orders.length > 0) {
    io.emit('orderUpdate', gameState.orders)
  }
}, 1000)

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`)
  
  // Initialize new player
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']
  const playerCount = Object.keys(gameState.players).length
  const playerColor = colors[playerCount % colors.length]
  
  gameState.players[socket.id] = {
    id: `Player${playerCount + 1}`,
    position: { x: 400 + (playerCount * 50), y: 300 },
    color: playerColor
  }

  // Send initial game state to new player
  socket.emit('gameState', gameState)
  
  // Broadcast new player to all clients
  socket.broadcast.emit('playerJoined', {
    ...gameState.players[socket.id],
    socketId: socket.id
  })

  // Handle player movement
  socket.on('playerMove', (position: { x: number; y: number }) => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].position = position
      socket.broadcast.emit('playerMoved', {
        playerId: socket.id,
        position
      })
    }
  })

  // Handle player interactions
  socket.on('playerInteraction', (data: any) => {
    socket.broadcast.emit('playerInteraction', {
      playerId: socket.id,
      ...data
    })
  })

  // Handle ingredient updates
  socket.on('ingredientUpdate', (ingredients: any[]) => {
    gameState.ingredients = ingredients
    socket.broadcast.emit('ingredientUpdate', ingredients)
  })

  // Handle order updates
  socket.on('orderUpdate', (orders: any[]) => {
    gameState.orders = orders
    socket.broadcast.emit('orderUpdate', orders)
  })

  // Handle score updates
  socket.on('scoreUpdate', (score: number) => {
    gameState.score = score
    socket.broadcast.emit('scoreUpdate', score)
  })

  // Handle player item pickup/drop
  socket.on('playerItemUpdate', (heldItem: any) => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].heldItem = heldItem
      socket.broadcast.emit('playerItemUpdate', {
        playerId: socket.id,
        heldItem
      })
    }
  })

  // Handle order completion
  socket.on('orderCompleted', (data: { orderId: string; points: number }) => {
    // Find and remove the completed order
    const orderIndex = gameState.orders.findIndex(order => order.data.id === data.orderId)
    if (orderIndex !== -1) {
      gameState.orders.splice(orderIndex, 1)
      gameState.score += data.points
      
      // Broadcast updated orders and score to all clients
      io.emit('orderUpdate', gameState.orders)
      io.emit('scoreUpdate', gameState.score)
      
      console.log(`Order ${data.orderId} completed for ${data.points} points. Total score: ${gameState.score}`)
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`)
    delete gameState.players[socket.id]
    socket.broadcast.emit('playerLeft', socket.id)
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})