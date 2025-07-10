import { io, Socket } from 'socket.io-client'
import { Player } from './Player'
import { Ingredient } from './Ingredient'
import { Order } from './Order'
import { NetworkEventHandlers } from './NetworkEventHandlers'

export class MultiplayerManager {
  private socket: Socket
  private remotePlayers: Map<string, Player> = new Map()
  private onGameStateUpdate?: (gameState: any) => void
  private onPlayerUpdate?: (players: Player[]) => void
  private eventHandlers: NetworkEventHandlers

  constructor() {
    this.socket = io('http://localhost:3001')
    this.eventHandlers = new NetworkEventHandlers(
      this.socket,
      this.remotePlayers,
      (gameState) => this.handleGameStateUpdate(gameState),
      (players) => this.handlePlayerUpdate(players)
    )
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    this.eventHandlers.setupGameStateHandlers()
    this.eventHandlers.setupPlayerHandlers()
  }

  private handleGameStateUpdate(gameState: any) {
    if (this.onGameStateUpdate) {
      this.onGameStateUpdate(gameState)
    }
  }

  private handlePlayerUpdate(players: Player[]) {
    if (this.onPlayerUpdate) {
      this.onPlayerUpdate(players)
    }
  }

  sendPlayerMove(position: { x: number; y: number }) {
    this.socket.emit('playerMove', position)
  }

  sendPlayerItemUpdate(heldItem: Ingredient | null) {
    this.socket.emit('playerItemUpdate', heldItem)
  }

  sendIngredientUpdate(ingredients: Ingredient[]) {
    this.socket.emit('ingredientUpdate', ingredients)
  }

  sendOrderUpdate(orders: Order[]) {
    this.socket.emit('orderUpdate', orders)
  }

  sendScoreUpdate(score: number) {
    this.socket.emit('scoreUpdate', score)
  }

  sendOrderCompletion(orderId: string, points: number) {
    this.socket.emit('orderCompleted', { orderId, points })
  }

  onGameStateChange(callback: (gameState: any) => void) {
    this.onGameStateUpdate = callback
  }

  onPlayersChange(callback: (players: Player[]) => void) {
    this.onPlayerUpdate = callback
  }

  getRemotePlayers(): Player[] {
    return Array.from(this.remotePlayers.values())
  }

  disconnect() {
    this.socket.disconnect()
  }
}