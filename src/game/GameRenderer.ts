import { Player } from './Player'
import { KitchenObject } from './KitchenObject'
import { Ingredient } from './Ingredient'
import { Plate } from './Plate'
import { Order } from './Order'
import { GAME_CONFIG } from './GameConfig'

export class GameRenderer {
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not get 2D context')
    }
    this.ctx = context
  }

  render(
    kitchenObjects: KitchenObject[],
    ingredients: Ingredient[],
    plates: Plate[],
    localPlayer: Player,
    remotePlayers: Player[],
    orders: Order[],
    score: number
  ) {
    this.clearCanvas()
    this.drawKitchenFloor()
    this.drawKitchenObjects(kitchenObjects)
    this.drawIngredients(ingredients)
    this.drawPlates(plates)
    this.drawLocalPlayer(localPlayer)
    this.drawRemotePlayers(remotePlayers)
    this.drawUI(orders, score)
  }

  private clearCanvas() {
    this.ctx.fillStyle = GAME_CONFIG.COLORS.FLOOR.PRIMARY
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private drawKitchenFloor() {
    const tileSize = 32
    this.ctx.fillStyle = GAME_CONFIG.COLORS.FLOOR.SECONDARY
    
    for (let x = 0; x < this.canvas.width; x += tileSize) {
      for (let y = 0; y < this.canvas.height; y += tileSize) {
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          this.ctx.fillRect(x, y, tileSize, tileSize)
        }
      }
    }
  }

  private drawKitchenObjects(kitchenObjects: KitchenObject[]) {
    kitchenObjects.forEach(obj => obj.draw(this.ctx))
  }

  private drawIngredients(ingredients: Ingredient[]) {
    ingredients.forEach(ingredient => {
      ingredient.draw(this.ctx)
      
      // Draw cooking progress bar for ingredients that are cooking
      if (ingredient.data.state === 'chopped' && ingredient.data.cookingTime !== undefined && ingredient.data.cookingTime > 0) {
        this.drawCookingProgress(ingredient)
      }
    })
  }

  private drawPlates(plates: Plate[]) {
    plates.forEach(plate => plate.draw(this.ctx))
  }

  private drawLocalPlayer(player: Player) {
    player.draw(this.ctx)
  }

  private drawRemotePlayers(players: Player[]) {
    players.forEach(player => player.draw(this.ctx))
  }

  private drawUI(orders: Order[], score: number) {
    this.drawScore(score)
    this.drawOrders(orders)
    this.drawInstructions()
  }

  private drawScore(score: number) {
    this.ctx.fillStyle = 'white'
    this.ctx.font = '20px Arial'
    this.ctx.textAlign = 'right'
    this.ctx.fillText(`Score: ${score}`, this.canvas.width - 20, 30)
  }

  private drawOrders(orders: Order[]) {
    orders.forEach((order, index) => {
      order.draw(this.ctx, this.canvas.width - 220, 50 + (index * 90))
    })
  }

  private drawInstructions() {
    this.ctx.font = 'bold 16px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.strokeStyle = 'black'
    this.ctx.lineWidth = 3
    this.ctx.fillStyle = 'white'
    
    const text = 'WASD: Move | SPACE: Interact | Q: Drop Item | Yellow counter: Serve orders'
    
    // Draw text outline for better readability
    this.ctx.strokeText(text, 10, this.canvas.height - 20)
    this.ctx.fillText(text, 10, this.canvas.height - 20)
  }

  private drawCookingProgress(ingredient: Ingredient) {
    const COOKING_TIME = GAME_CONFIG.COOKING.MAX_TIME
    const cookingTime = ingredient.data.cookingTime || 0
    const progress = Math.min(cookingTime / COOKING_TIME, 1)
    
    const barWidth = 30
    const barHeight = 4
    const x = ingredient.data.position.x - barWidth / 2
    const y = ingredient.data.position.y - 20
    
    // Background bar
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(x, y, barWidth, barHeight)
    
    // Progress bar
    if (progress < 0.75) {
      this.ctx.fillStyle = '#ffdd44' // Yellow while cooking
    } else if (progress < 1.0) {
      this.ctx.fillStyle = '#44ff44' // Green when almost done
    } else {
      this.ctx.fillStyle = '#ff4444' // Red when burning
    }
    
    this.ctx.fillRect(x, y, barWidth * progress, barHeight)
    
    // Border
    this.ctx.strokeStyle = 'white'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x, y, barWidth, barHeight)
  }
}