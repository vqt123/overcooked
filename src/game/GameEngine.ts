import { Player } from './Player'
import { InputManager } from './InputManager'
import { KitchenObject, KitchenObjectData } from './KitchenObject'
import { Ingredient } from './Ingredient'
import { Order } from './Order'
import { MultiplayerManager } from './MultiplayerManager'
import { GameRenderer } from './GameRenderer'
import { InteractionHandler } from './InteractionHandler'
import { GAME_CONFIG } from './GameConfig'

export class GameEngine {
  private animationId: number | null = null
  private lastTime = 0
  private inputManager: InputManager
  private localPlayer: Player
  private kitchenObjects: KitchenObject[] = []
  private ingredients: Ingredient[] = []
  private orders: Order[] = []
  private score: number = 0
  private multiplayerManager!: MultiplayerManager
  private remotePlayers: Player[] = []
  private lastPlayerPosition: { x: number; y: number } = { x: 0, y: 0 }
  private gameRenderer: GameRenderer
  private interactionHandler: InteractionHandler

  constructor(canvas: HTMLCanvasElement) {
    this.inputManager = new InputManager()
    this.localPlayer = new Player('Player1', 400, 300, GAME_CONFIG.COLORS.PLAYER_COLORS[0])
    this.gameRenderer = new GameRenderer(canvas)
    this.initializeKitchen()
    this.initializeMultiplayer()
    this.interactionHandler = new InteractionHandler(this.multiplayerManager)
  }

  private initializeKitchen() {
    const kitchenData: KitchenObjectData[] = [
      {
        id: 'stove1',
        type: 'stove',
        position: { x: 100, y: 100 },
        size: { width: 80, height: 40 },
        interactable: true
      },
      {
        id: 'prep1',
        type: 'prep_counter',
        position: { x: 200, y: 100 },
        size: { width: 80, height: 40 },
        interactable: true
      },
      {
        id: 'serve1',
        type: 'serving_counter',
        position: { x: 300, y: 100 },
        size: { width: 80, height: 40 },
        interactable: true
      },
      {
        id: 'ingredients1',
        type: 'ingredient_box',
        position: { x: 50, y: 200 },
        size: { width: 60, height: 60 },
        interactable: true
      }
    ]

    this.kitchenObjects = kitchenData.map(data => new KitchenObject(data))
  }

  private initializeMultiplayer() {
    this.multiplayerManager = new MultiplayerManager()
    
    this.multiplayerManager.onPlayersChange((players) => {
      this.remotePlayers = players
    })

    this.multiplayerManager.onGameStateChange((gameState) => {
      // Sync shared game state from other players
      if (gameState.ingredients) {
        this.ingredients = gameState.ingredients.map((ing: any) => {
          const ingredient = new Ingredient(ing.data.type, ing.data.position.x, ing.data.position.y)
          ingredient.data = ing.data
          return ingredient
        })
      }
      if (gameState.orders) {
        this.orders = gameState.orders.map((order: any) => {
          const newOrder = new Order(order.data.id)
          newOrder.data = order.data
          return newOrder
        })
      }
      if (gameState.score !== undefined) {
        this.score = gameState.score
      }
    })

    this.lastPlayerPosition = { ...this.localPlayer.position }
  }

  start() {
    this.gameLoop(0)
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.multiplayerManager.disconnect()
  }

  private gameLoop = (currentTime: number) => {
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    this.animationId = requestAnimationFrame(this.gameLoop)
  }

  private update(deltaTime: number) {
    const input = this.inputManager.getKeys()
    this.localPlayer.update(deltaTime, input)
    
    // Update cooking ingredients
    this.ingredients.forEach(ingredient => {
      ingredient.updateCooking(deltaTime)
    })
    
    // Orders are now managed by the server, no client-side generation
    
    // Send player position to other players if moved
    if (this.lastPlayerPosition.x !== this.localPlayer.position.x || 
        this.lastPlayerPosition.y !== this.localPlayer.position.y) {
      this.multiplayerManager.sendPlayerMove(this.localPlayer.position)
      this.lastPlayerPosition = { ...this.localPlayer.position }
    }
    
    // Handle interactions
    if (input[' ']) { // Spacebar for interactions
      this.handleInteraction()
    }
  }

  private handleInteraction() {
    const result = this.interactionHandler.handlePlayerInteraction(
      this.localPlayer,
      this.kitchenObjects,
      this.ingredients,
      this.orders
    )

    // Handle any state changes from interactions
    if (result.ingredientsUpdated) {
      // Ingredients were updated, no additional action needed
    }

    if (result.orderCompleted && result.completedOrder) {
      // Order was completed, will be handled by server
    }
  }

  private render() {
    this.gameRenderer.render(
      this.kitchenObjects,
      this.ingredients,
      this.localPlayer,
      this.remotePlayers,
      this.orders,
      this.score
    )
  }

}