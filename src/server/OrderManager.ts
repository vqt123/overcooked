import { Server } from 'socket.io'
import { GAME_CONFIG } from '../game/GameConfig'

export interface OrderData {
  id: string
  items: Array<{ type: string; state: string }>
  timeRemaining: number
  maxTime: number
  points: number
}

export interface Order {
  data: OrderData
}

export class OrderManager {
  private orderIdCounter = 1
  private nextOrderTime = GAME_CONFIG.ORDERS.FIRST_ORDER_DELAY
  private orders: Order[] = []
  private score = 0
  private io: Server
  private gameLoopInterval: NodeJS.Timeout | null = null

  constructor(io: Server) {
    this.io = io
    this.startGameLoop()
  }

  getOrders(): Order[] {
    return this.orders
  }

  getScore(): number {
    return this.score
  }

  setOrders(orders: Order[]) {
    this.orders = orders
  }

  setScore(score: number) {
    this.score = score
  }

  completeOrder(orderId: string, points: number): boolean {
    const orderIndex = this.orders.findIndex(order => order.data.id === orderId)
    if (orderIndex !== -1) {
      this.orders.splice(orderIndex, 1)
      this.score += points
      
      // Broadcast updated orders and score to all clients
      this.io.emit('orderUpdate', this.orders)
      this.io.emit('scoreUpdate', this.score)
      
      console.log(`Order ${orderId} completed for ${points} points. Total score: ${this.score}`)
      return true
    }
    return false
  }

  private generateOrder(): Order {
    const orderTypes = [
      // Simple orders only (until plate system is fixed)
      [{ type: 'tomato', state: 'chopped' }],
      [{ type: 'lettuce', state: 'chopped' }],
      [{ type: 'bread', state: 'cooked' }],
      [{ type: 'cheese', state: 'cooked' }],
      
      // TODO: Re-enable complex orders when plate system works
      // [
      //   { type: 'bread', state: 'cooked' },
      //   { type: 'tomato', state: 'chopped' },
      //   { type: 'lettuce', state: 'chopped' }
      // ],
      // [
      //   { type: 'bread', state: 'cooked' },
      //   { type: 'cheese', state: 'cooked' },
      //   { type: 'tomato', state: 'chopped' }
      // ]
    ]

    const selectedOrder = orderTypes[Math.floor(Math.random() * orderTypes.length)]
    
    return {
      data: {
        id: `#${this.orderIdCounter++}`,
        items: selectedOrder,
        timeRemaining: GAME_CONFIG.ORDERS.BASE_TIME,
        maxTime: GAME_CONFIG.ORDERS.BASE_TIME,
        points: GAME_CONFIG.ORDERS.BASE_POINTS
      }
    }
  }

  private startGameLoop() {
    this.gameLoopInterval = setInterval(() => {
      this.nextOrderTime -= 1000 // 1 second intervals
      
      if (this.nextOrderTime <= 0 && this.orders.length < GAME_CONFIG.ORDERS.MAX_ORDERS) {
        const newOrder = this.generateOrder()
        this.orders.push(newOrder)
        this.nextOrderTime = GAME_CONFIG.ORDERS.MIN_INTERVAL + Math.random() * (GAME_CONFIG.ORDERS.MAX_INTERVAL - GAME_CONFIG.ORDERS.MIN_INTERVAL)
        
        console.log(`Generated new order: ${newOrder.data.id}`)
        
        // Broadcast new order to all clients
        this.io.emit('orderUpdate', this.orders)
      }
      
      // Update existing orders
      this.orders = this.orders.filter(order => {
        order.data.timeRemaining -= 1000
        
        // Reduce points as time passes
        const timeRatio = order.data.timeRemaining / order.data.maxTime
        order.data.points = Math.max(GAME_CONFIG.ORDERS.MIN_POINTS, Math.floor(GAME_CONFIG.ORDERS.BASE_POINTS * timeRatio))
        
        if (order.data.timeRemaining <= 0) {
          // Order expired - lose points
          this.score = Math.max(0, this.score - 50)
          this.io.emit('scoreUpdate', this.score)
          return false
        }
        return true
      })
      
      // Broadcast updated orders if any changed
      if (this.orders.length > 0) {
        this.io.emit('orderUpdate', this.orders)
      }
    }, 1000)
  }

  stop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval)
    }
  }
}