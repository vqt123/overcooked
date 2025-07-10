import { Ingredient } from './Ingredient'
import { Plate } from './Plate'

export interface Position {
  x: number
  y: number
}

export type HeldItem = Ingredient | Plate | null

export class Player {
  public position: Position
  public size: number = 24
  public speed: number = 150
  public color: string
  public id: string
  public heldItem: HeldItem = null

  constructor(id: string, x: number, y: number, color: string) {
    this.id = id
    this.position = { x, y }
    this.color = color
  }

  update(deltaTime: number, input: { [key: string]: boolean }) {
    const moveDistance = (this.speed * deltaTime) / 1000

    if (input['w'] || input['W']) {
      this.position.y -= moveDistance
    }
    if (input['s'] || input['S']) {
      this.position.y += moveDistance
    }
    if (input['a'] || input['A']) {
      this.position.x -= moveDistance
    }
    if (input['d'] || input['D']) {
      this.position.x += moveDistance
    }

    // Keep player within bounds (800x600 canvas)
    this.position.x = Math.max(this.size / 2, Math.min(800 - this.size / 2, this.position.x))
    this.position.y = Math.max(this.size / 2, Math.min(600 - this.size / 2, this.position.y))
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw player as a circle
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw simple face
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(this.position.x - 4, this.position.y - 4, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(this.position.x + 4, this.position.y - 4, 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw ID above player
    ctx.fillStyle = 'white'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(this.id, this.position.x, this.position.y - 20)

    // Draw held item
    if (this.heldItem) {
      if (this.heldItem instanceof Ingredient) {
        this.heldItem.data.position = { x: this.position.x, y: this.position.y - 30 }
        this.heldItem.draw(ctx)
      } else if (this.heldItem instanceof Plate) {
        this.heldItem.position = { x: this.position.x, y: this.position.y - 30 }
        this.heldItem.draw(ctx)
      }
    }
  }

  pickupItem(item: HeldItem) {
    if (!this.heldItem) {
      this.heldItem = item
    }
  }

  dropItem(): HeldItem {
    const item = this.heldItem
    this.heldItem = null
    return item
  }

  isHolding(itemType: 'ingredient' | 'plate'): boolean {
    if (!this.heldItem) return false
    if (itemType === 'ingredient') return this.heldItem instanceof Ingredient
    if (itemType === 'plate') return this.heldItem instanceof Plate
    return false
  }
}