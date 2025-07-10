import { io, Socket } from 'socket.io-client'
import { Player } from './Player'
import { Ingredient } from './Ingredient'
import { Order } from './Order'

interface RemotePlayer {
  id: string
  position: { x: number; y: number }
  color: string
  heldItem?: any
  socketId?: string
}

export class MultiplayerManager {
  private socket: Socket
  private remotePlayers: Map<string, Player> = new Map()
  private onGameStateUpdate?: (gameState: any) => void
  private onPlayerUpdate?: (players: Player[]) => void

  constructor() {
    this.socket = io('http://localhost:3001')
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server')
    })

    this.socket.on('gameState', (gameState: any) => {
      // Initialize remote players
      this.remotePlayers.clear()
      Object.entries(gameState.players).forEach(([playerId, playerData]: [string, any]) => {
        if (playerId !== this.socket.id) {
          const player = new Player(
            playerData.id,
            playerData.position.x,
            playerData.position.y,
            playerData.color
          )
          if (playerData.heldItem) {
            const ingredient = new Ingredient(
              playerData.heldItem.data.type,
              playerData.heldItem.data.position.x,
              playerData.heldItem.data.position.y
            )
            ingredient.data = playerData.heldItem.data
            player.heldItem = ingredient
          }
          this.remotePlayers.set(playerId, player)
        }
      })

      if (this.onGameStateUpdate) {
        this.onGameStateUpdate(gameState)
      }
    })

    this.socket.on('playerJoined', (playerData: RemotePlayer) => {
      const player = new Player(
        playerData.id,
        playerData.position.x,
        playerData.position.y,
        playerData.color
      )
      if (playerData.socketId) {
        this.remotePlayers.set(playerData.socketId, player)
        console.log('Player joined:', playerData.id, 'Socket:', playerData.socketId)
        this.notifyPlayerUpdate()
      }
    })

    this.socket.on('playerMoved', (data: { playerId: string; position: { x: number; y: number } }) => {
      const player = this.remotePlayers.get(data.playerId)
      if (player) {
        player.position = data.position
        this.notifyPlayerUpdate()
      }
    })

    this.socket.on('playerItemUpdate', (data: { playerId: string; heldItem: any }) => {
      const player = this.remotePlayers.get(data.playerId)
      if (player) {
        if (data.heldItem) {
          const ingredient = new Ingredient(
            data.heldItem.data.type,
            data.heldItem.data.position.x,
            data.heldItem.data.position.y
          )
          ingredient.data = data.heldItem.data
          player.heldItem = ingredient
        } else {
          player.heldItem = null
        }
        this.notifyPlayerUpdate()
      }
    })

    this.socket.on('playerLeft', (playerId: string) => {
      this.remotePlayers.delete(playerId)
      this.notifyPlayerUpdate()
    })

    this.socket.on('ingredientUpdate', (ingredients: any[]) => {
      if (this.onGameStateUpdate) {
        this.onGameStateUpdate({ ingredients })
      }
    })

    this.socket.on('orderUpdate', (orders: any[]) => {
      if (this.onGameStateUpdate) {
        this.onGameStateUpdate({ orders })
      }
    })

    this.socket.on('scoreUpdate', (score: number) => {
      if (this.onGameStateUpdate) {
        this.onGameStateUpdate({ score })
      }
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })
  }

  private notifyPlayerUpdate() {
    if (this.onPlayerUpdate) {
      this.onPlayerUpdate(Array.from(this.remotePlayers.values()))
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