import { Player } from './Player'
import { InputManager } from './InputManager'
import { KitchenObject, KitchenObjectData } from './KitchenObject'
import { Ingredient, IngredientType } from './Ingredient'
import { Order } from './Order'
import { MultiplayerManager } from './MultiplayerManager'

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationId: number | null = null
  private lastTime = 0
  private inputManager: InputManager
  private localPlayer: Player
  private kitchenObjects: KitchenObject[] = []
  private ingredients: Ingredient[] = []
  private orders: Order[] = []
  private score: number = 0
  private multiplayerManager: MultiplayerManager
  private remotePlayers: Player[] = []
  private lastPlayerPosition: { x: number; y: number } = { x: 0, y: 0 }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not get 2D context')
    }
    this.ctx = context
    this.inputManager = new InputManager()
    this.localPlayer = new Player('Player1', 400, 300, '#ff6b6b')
    this.initializeKitchen()
    this.initializeMultiplayer()
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
    const player = this.localPlayer
    
    // Check interaction with kitchen objects
    for (const obj of this.kitchenObjects) {
      if (obj.isColliding(player.position, player.size + 20)) { // Extended range for interaction
        
        if (obj.data.type === 'ingredient_box' && !player.heldItem) {
          // Pick up ingredient
          const ingredientTypes: IngredientType[] = ['tomato', 'lettuce', 'bread', 'cheese']
          const randomType = ingredientTypes[Math.floor(Math.random() * ingredientTypes.length)]
          const ingredient = new Ingredient(randomType, player.position.x, player.position.y)
          player.pickupItem(ingredient)
          this.multiplayerManager.sendPlayerItemUpdate(ingredient)
          break
        }
        
        if (obj.data.type === 'prep_counter' && player.heldItem) {
          // Chop ingredient
          player.heldItem.chop()
          this.multiplayerManager.sendPlayerItemUpdate(player.heldItem)
          break
        }
        
        if (obj.data.type === 'stove' && player.heldItem && player.heldItem.data.state === 'chopped') {
          // Start cooking
          player.heldItem.startCooking()
          const ingredient = player.dropItem()!
          ingredient.data.position = { x: obj.data.position.x + 40, y: obj.data.position.y + 20 }
          this.ingredients.push(ingredient)
          this.multiplayerManager.sendPlayerItemUpdate(null)
          this.multiplayerManager.sendIngredientUpdate(this.ingredients)
          break
        }
        
        if (obj.data.type === 'stove') {
          // Pick up cooked ingredient
          const nearbyIngredient = this.ingredients.find(ing => 
            Math.abs(ing.data.position.x - obj.data.position.x - 40) < 20 &&
            Math.abs(ing.data.position.y - obj.data.position.y - 20) < 20
          )
          
          if (nearbyIngredient && !player.heldItem) {
            player.pickupItem(nearbyIngredient)
            this.ingredients = this.ingredients.filter(ing => ing !== nearbyIngredient)
            this.multiplayerManager.sendPlayerItemUpdate(nearbyIngredient)
            this.multiplayerManager.sendIngredientUpdate(this.ingredients)
            break
          }
        }
        
        if (obj.data.type === 'serving_counter' && player.heldItem) {
          // Try to complete orders
          this.checkOrderCompletion(player.heldItem)
          break
        }
      }
    }
  }

  private checkOrderCompletion(deliveredItem: Ingredient) {
    for (let i = 0; i < this.orders.length; i++) {
      const order = this.orders[i]
      
      // For simple single-item orders
      if (order.data.items.length === 1) {
        const requiredItem = order.data.items[0]
        if (deliveredItem.data.type === requiredItem.type && 
            deliveredItem.data.state === requiredItem.state) {
          
          // Order completed! Send to server for processing
          this.localPlayer.dropItem() // Remove the delivered item
          this.multiplayerManager.sendPlayerItemUpdate(null)
          // Send order completion to server
          this.multiplayerManager.sendOrderCompletion(order.data.id, order.data.points)
          break
        }
      }
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#4a5568'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw kitchen floor tiles
    this.drawKitchenFloor()
    
    // Draw kitchen objects
    this.kitchenObjects.forEach(obj => obj.draw(this.ctx))
    
    // Draw ingredients on counters/stoves
    this.ingredients.forEach(ingredient => ingredient.draw(this.ctx))
    
    // Draw local player
    this.localPlayer.draw(this.ctx)
    
    // Draw remote players
    this.remotePlayers.forEach(player => player.draw(this.ctx))
    
    // Draw UI
    this.drawUI()
  }

  private drawKitchenFloor() {
    const tileSize = 32
    this.ctx.fillStyle = '#2d3748'
    
    for (let x = 0; x < this.canvas.width; x += tileSize) {
      for (let y = 0; y < this.canvas.height; y += tileSize) {
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          this.ctx.fillRect(x, y, tileSize, tileSize)
        }
      }
    }
  }

  private drawUI() {
    // Draw score
    this.ctx.fillStyle = 'white'
    this.ctx.font = '20px Arial'
    this.ctx.textAlign = 'right'
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 20, 30)
    
    // Draw orders
    this.orders.forEach((order, index) => {
      order.draw(this.ctx, this.canvas.width - 220, 50 + (index * 90))
    })
    
    // Draw instructions at bottom
    this.ctx.font = '12px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.fillText('WASD: Move | SPACE: Interact | Yellow counter: Serve orders', 10, this.canvas.height - 20)
  }

}