import { Socket } from 'socket.io-client'
import { Player } from './Player'
import { Ingredient } from './Ingredient'

export interface RemotePlayer {
  id: string
  position: { x: number; y: number }
  color: string
  heldItem?: any
  socketId?: string
}

export class NetworkEventHandlers {
  private socket: Socket
  private remotePlayers: Map<string, Player>
  private onGameStateUpdate?: (gameState: any) => void
  private onPlayerUpdate?: (players: Player[]) => void

  constructor(
    socket: Socket,
    remotePlayers: Map<string, Player>,
    onGameStateUpdate?: (gameState: any) => void,
    onPlayerUpdate?: (players: Player[]) => void
  ) {
    this.socket = socket
    this.remotePlayers = remotePlayers
    this.onGameStateUpdate = onGameStateUpdate
    this.onPlayerUpdate = onPlayerUpdate
  }

  setupGameStateHandlers() {
    this.socket.on('gameState', (gameState: any) => {
      // Initialize remote players
      this.remotePlayers.clear()
      Object.entries(gameState.players).forEach(([playerId, playerData]: [string, any]) => {
        if (playerId !== this.socket.id) {
          const player = this.createPlayerFromData(playerData)
          this.remotePlayers.set(playerId, player)
        }
      })

      if (this.onGameStateUpdate) {
        this.onGameStateUpdate(gameState)
      }
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
  }

  setupPlayerHandlers() {
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
  }

  private createPlayerFromData(playerData: any): Player {
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
    
    return player
  }

  private notifyPlayerUpdate() {
    if (this.onPlayerUpdate) {
      this.onPlayerUpdate(Array.from(this.remotePlayers.values()))
    }
  }
}