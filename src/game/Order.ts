import { IngredientType, IngredientState } from './Ingredient'

export interface OrderItem {
  type: IngredientType
  state: IngredientState
}

export interface OrderData {
  id: string
  items: OrderItem[]
  timeRemaining: number
  maxTime: number
  points: number
}

export class Order {
  public data: OrderData

  constructor(id: string) {
    this.data = {
      id,
      items: this.generateRandomOrder(),
      timeRemaining: 30000, // 30 seconds
      maxTime: 30000,
      points: 100
    }
  }

  private generateRandomOrder(): OrderItem[] {
    const orderTypes = [
      // Simple orders
      [{ type: 'tomato' as IngredientType, state: 'chopped' as IngredientState }],
      [{ type: 'lettuce' as IngredientType, state: 'chopped' as IngredientState }],
      [{ type: 'bread' as IngredientType, state: 'cooked' as IngredientState }],
      
      // Complex orders (burgers)
      [
        { type: 'bread' as IngredientType, state: 'cooked' as IngredientState },
        { type: 'tomato' as IngredientType, state: 'chopped' as IngredientState },
        { type: 'lettuce' as IngredientType, state: 'chopped' as IngredientState }
      ],
      [
        { type: 'bread' as IngredientType, state: 'cooked' as IngredientState },
        { type: 'cheese' as IngredientType, state: 'cooked' as IngredientState },
        { type: 'tomato' as IngredientType, state: 'chopped' as IngredientState }
      ]
    ]

    return orderTypes[Math.floor(Math.random() * orderTypes.length)]
  }

  update(deltaTime: number): boolean {
    this.data.timeRemaining -= deltaTime
    
    // Reduce points as time passes
    const timeRatio = this.data.timeRemaining / this.data.maxTime
    this.data.points = Math.max(10, Math.floor(100 * timeRatio))
    
    return this.data.timeRemaining > 0
  }

  checkCompletion(ingredients: { type: IngredientType; state: IngredientState }[]): boolean {
    if (ingredients.length !== this.data.items.length) {
      return false
    }

    // Check if all required ingredients are present
    for (const requiredItem of this.data.items) {
      const found = ingredients.find(ing => 
        ing.type === requiredItem.type && ing.state === requiredItem.state
      )
      if (!found) {
        return false
      }
    }

    return true
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Draw order background
    ctx.fillStyle = '#2d3748'
    ctx.fillRect(x, y, 200, 80)
    ctx.strokeStyle = '#4a5568'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, 200, 80)

    // Draw order title
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Order ${this.data.id}`, x + 5, y + 15)

    // Draw time remaining
    const timeLeft = Math.ceil(this.data.timeRemaining / 1000)
    ctx.fillText(`Time: ${timeLeft}s`, x + 100, y + 15)
    
    // Draw points
    ctx.fillText(`Points: ${this.data.points}`, x + 5, y + 75)

    // Draw required ingredients
    let itemY = y + 30
    this.data.items.forEach((item, index) => {
      ctx.fillStyle = this.getIngredientColor(item.type, item.state)
      ctx.fillRect(x + 10 + (index * 25), itemY, 20, 20)
      
      ctx.fillStyle = 'white'
      ctx.font = '8px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(item.type[0].toUpperCase(), x + 20 + (index * 25), itemY + 12)
      ctx.fillText(item.state[0].toUpperCase(), x + 20 + (index * 25), itemY + 20)
    })

    // Draw progress bar for time
    const timeRatio = this.data.timeRemaining / this.data.maxTime
    ctx.fillStyle = timeRatio > 0.5 ? '#48bb78' : timeRatio > 0.25 ? '#ed8936' : '#f56565'
    ctx.fillRect(x + 5, y + 55, 190 * timeRatio, 8)
    ctx.strokeStyle = '#4a5568'
    ctx.strokeRect(x + 5, y + 55, 190, 8)
  }

  private getIngredientColor(type: IngredientType, state: IngredientState): string {
    switch (type) {
      case 'tomato':
        return state === 'cooked' ? '#ff4444' : '#ff6666'
      case 'lettuce':
        return '#66ff66'
      case 'bread':
        return state === 'cooked' ? '#daa520' : '#f5deb3'
      case 'cheese':
        return state === 'cooked' ? '#ffff00' : '#fff8dc'
      default:
        return '#ffffff'
    }
  }
}