import { GAME_CONFIG } from './GameConfig'

export type IngredientType = 'tomato' | 'lettuce' | 'bread' | 'cheese'
export type IngredientState = 'raw' | 'chopped' | 'cooked' | 'burnt'

export interface IngredientData {
  type: IngredientType
  state: IngredientState
  position: { x: number; y: number }
  cookingTime?: number
}

export class Ingredient {
  public data: IngredientData
  private maxCookingTime = GAME_CONFIG.COOKING.MAX_TIME

  constructor(type: IngredientType, x: number, y: number) {
    this.data = {
      type,
      state: 'raw',
      position: { x, y },
      cookingTime: 0
    }
  }

  chop() {
    if (this.data.state === 'raw') {
      this.data.state = 'chopped'
    }
  }

  startCooking() {
    if (this.data.state === 'chopped') {
      this.data.cookingTime = 0
    }
  }

  updateCooking(deltaTime: number) {
    if (this.data.state === 'chopped' && this.data.cookingTime !== undefined) {
      this.data.cookingTime += deltaTime
      
      if (this.data.cookingTime >= this.maxCookingTime * 1.5) {
        this.data.state = 'burnt'
      } else if (this.data.cookingTime >= this.maxCookingTime) {
        this.data.state = 'cooked'
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { position, type, state } = this.data
    
    // Set color based on type and state
    let color = '#ffffff'
    
    switch (type) {
      case 'tomato':
        color = state === 'burnt' ? '#800000' : state === 'cooked' ? '#ff4444' : '#ff6666'
        break
      case 'lettuce':
        color = state === 'burnt' ? '#004400' : '#66ff66'
        break
      case 'bread':
        color = state === 'burnt' ? '#332211' : state === 'cooked' ? '#daa520' : '#f5deb3'
        break
      case 'cheese':
        color = state === 'burnt' ? '#664400' : state === 'cooked' ? '#ffff00' : '#fff8dc'
        break
    }

    ctx.fillStyle = color
    ctx.fillRect(position.x - 8, position.y - 8, 16, 16)
    
    // Add border for chopped items
    if (state === 'chopped') {
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      ctx.strokeRect(position.x - 8, position.y - 8, 16, 16)
    }
    
    // Add label
    ctx.fillStyle = 'white'
    ctx.font = '8px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(type[0].toUpperCase(), position.x, position.y + 3)
  }

  getColor(): string {
    const { type, state } = this.data
    
    switch (type) {
      case 'tomato':
        return state === 'burnt' ? '#800000' : state === 'cooked' ? '#ff4444' : '#ff6666'
      case 'lettuce':
        return state === 'burnt' ? '#004400' : '#66ff66'
      case 'bread':
        return state === 'burnt' ? '#332211' : state === 'cooked' ? '#daa520' : '#f5deb3'
      case 'cheese':
        return state === 'burnt' ? '#664400' : state === 'cooked' ? '#ffff00' : '#fff8dc'
      default:
        return '#ffffff'
    }
  }
}