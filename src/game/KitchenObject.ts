import { GAME_CONFIG } from './GameConfig'

export interface KitchenObjectData {
  id: string
  type: 'stove' | 'prep_counter' | 'serving_counter' | 'ingredient_box' | 'plate_stack' | 'tomato_box' | 'lettuce_box' | 'bread_box' | 'cheese_box'
  position: { x: number; y: number }
  size: { width: number; height: number }
  interactable: boolean
}

export class KitchenObject {
  public data: KitchenObjectData

  constructor(data: KitchenObjectData) {
    this.data = data
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { position, size, type } = this.data
    
    // Set color based on type
    switch (type) {
      case 'stove':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.STOVE
        break
      case 'prep_counter':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.PREP_COUNTER
        break
      case 'serving_counter':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.SERVING_COUNTER
        break
      case 'ingredient_box':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.INGREDIENT_BOX
        break
      case 'plate_stack':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.PLATE_STACK
        break
      case 'tomato_box':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.TOMATO_BOX
        break
      case 'lettuce_box':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.LETTUCE_BOX
        break
      case 'bread_box':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.BREAD_BOX
        break
      case 'cheese_box':
        ctx.fillStyle = GAME_CONFIG.COLORS.KITCHEN.CHEESE_BOX
        break
    }

    ctx.fillRect(position.x, position.y, size.width, size.height)

    // Add highlight for interactable objects
    if (this.data.interactable) {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.strokeRect(position.x, position.y, size.width, size.height)
    }

    // Add labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    const centerX = position.x + size.width / 2
    const centerY = position.y + size.height / 2 + 4
    
    switch (type) {
      case 'stove':
        ctx.fillText('Stove', centerX, centerY)
        break
      case 'prep_counter':
        ctx.fillText('Prep', centerX, centerY)
        break
      case 'serving_counter':
        ctx.fillText('Serve', centerX, centerY)
        break
      case 'ingredient_box':
        ctx.fillText('Ingredients', centerX, centerY)
        break
      case 'plate_stack':
        ctx.fillText('Plates', centerX, centerY)
        break
      case 'tomato_box':
        ctx.fillText('Tomato', centerX, centerY)
        break
      case 'lettuce_box':
        ctx.fillText('Lettuce', centerX, centerY)
        break
      case 'bread_box':
        ctx.fillText('Bread', centerX, centerY)
        break
      case 'cheese_box':
        ctx.fillText('Cheese', centerX, centerY)
        break
    }
  }

  isColliding(playerPos: { x: number; y: number }, playerSize: number): boolean {
    const { position, size } = this.data
    return (
      playerPos.x - playerSize / 2 < position.x + size.width &&
      playerPos.x + playerSize / 2 > position.x &&
      playerPos.y - playerSize / 2 < position.y + size.height &&
      playerPos.y + playerSize / 2 > position.y
    )
  }
}