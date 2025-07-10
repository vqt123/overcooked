import { Server, Socket } from 'socket.io'
import { OrderManager } from './OrderManager'

export interface Player {
  id: string
  position: { x: number; y: number }
  color: string
  heldItem?: any
}

export interface GameState {
  players: { [id: string]: Player }
  ingredients: any[]
  orders: any[]
  score: number
}

export class SocketHandlers {
  private gameState: GameState
  private orderManager: OrderManager

  constructor(_io: Server, orderManager: OrderManager) {
    this.orderManager = orderManager
    this.gameState = {
      players: {},
      ingredients: [],
      orders: [],
      score: 0
    }
  }

  handleConnection(socket: Socket) {
    console.log(`Player connected: ${socket.id}`)
    
    // Initialize new player
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']
    const playerCount = Object.keys(this.gameState.players).length
    const playerColor = colors[playerCount % colors.length]
    
    this.gameState.players[socket.id] = {
      id: `Player${playerCount + 1}`,
      position: { x: 400 + (playerCount * 50), y: 300 },
      color: playerColor
    }

    // Send initial game state to new player
    socket.emit('gameState', {
      ...this.gameState,
      orders: this.orderManager.getOrders(),
      score: this.orderManager.getScore()
    })
    
    // Broadcast new player to all clients
    socket.broadcast.emit('playerJoined', {
      ...this.gameState.players[socket.id],
      socketId: socket.id
    })

    this.setupEventHandlers(socket)
  }

  private setupEventHandlers(socket: Socket) {
    // Handle player movement
    socket.on('playerMove', (position: { x: number; y: number }) => {
      if (this.gameState.players[socket.id]) {
        this.gameState.players[socket.id].position = position
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
      this.gameState.ingredients = ingredients
      socket.broadcast.emit('ingredientUpdate', ingredients)
    })

    // Handle order updates
    socket.on('orderUpdate', (orders: any[]) => {
      this.orderManager.setOrders(orders)
      socket.broadcast.emit('orderUpdate', orders)
    })

    // Handle score updates
    socket.on('scoreUpdate', (score: number) => {
      this.orderManager.setScore(score)
      socket.broadcast.emit('scoreUpdate', score)
    })

    // Handle player item pickup/drop
    socket.on('playerItemUpdate', (heldItem: any) => {
      if (this.gameState.players[socket.id]) {
        this.gameState.players[socket.id].heldItem = heldItem
        socket.broadcast.emit('playerItemUpdate', {
          playerId: socket.id,
          heldItem
        })
      }
    })

    // Handle order completion
    socket.on('orderCompleted', (data: { orderId: string; points: number }) => {
      this.orderManager.completeOrder(data.orderId, data.points)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`)
      delete this.gameState.players[socket.id]
      socket.broadcast.emit('playerLeft', socket.id)
    })
  }
}