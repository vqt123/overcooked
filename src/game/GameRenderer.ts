import { Player } from './Player'
import { KitchenObject } from './KitchenObject'
import { Ingredient } from './Ingredient'
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
    localPlayer: Player,
    remotePlayers: Player[],
    orders: Order[],
    score: number
  ) {
    this.clearCanvas()
    this.drawKitchenFloor()
    this.drawKitchenObjects(kitchenObjects)
    this.drawIngredients(ingredients)
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
    ingredients.forEach(ingredient => ingredient.draw(this.ctx))
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
    this.ctx.font = '12px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(
      'WASD: Move | SPACE: Interact | Yellow counter: Serve orders', 
      10, 
      this.canvas.height - 20
    )
  }
}