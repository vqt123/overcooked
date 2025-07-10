import { Ingredient, IngredientType, IngredientState } from './Ingredient'

export interface PlateIngredient {
  type: IngredientType
  state: IngredientState
}

export class Plate {
  public ingredients: PlateIngredient[] = []
  public position: { x: number; y: number }

  constructor(x: number, y: number) {
    this.position = { x, y }
  }

  addIngredient(ingredient: Ingredient): boolean {
    // Add ingredient to plate
    this.ingredients.push({
      type: ingredient.data.type,
      state: ingredient.data.state
    })
    return true
  }

  clear() {
    this.ingredients = []
  }

  getIngredients(): PlateIngredient[] {
    return [...this.ingredients]
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw plate base
    ctx.fillStyle = '#f5f5f5'
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Draw ingredients on plate
    this.ingredients.forEach((ingredient, index) => {
      const angle = (index / this.ingredients.length) * Math.PI * 2
      const ingredientX = this.position.x + Math.cos(angle) * 10
      const ingredientY = this.position.y + Math.sin(angle) * 10

      // Draw ingredient as small colored square
      let color = '#ffffff'
      switch (ingredient.type) {
        case 'tomato':
          color = ingredient.state === 'burnt' ? '#800000' : ingredient.state === 'cooked' ? '#ff4444' : '#ff6666'
          break
        case 'lettuce':
          color = ingredient.state === 'burnt' ? '#004400' : '#66ff66'
          break
        case 'bread':
          color = ingredient.state === 'burnt' ? '#332211' : ingredient.state === 'cooked' ? '#daa520' : '#f5deb3'
          break
        case 'cheese':
          color = ingredient.state === 'burnt' ? '#664400' : ingredient.state === 'cooked' ? '#ffff00' : '#fff8dc'
          break
      }

      ctx.fillStyle = color
      ctx.fillRect(ingredientX - 4, ingredientY - 4, 8, 8)

      // Add border for chopped items
      if (ingredient.state === 'chopped') {
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 1
        ctx.strokeRect(ingredientX - 4, ingredientY - 4, 8, 8)
      }
    })

    // Draw ingredient count
    if (this.ingredients.length > 0) {
      ctx.fillStyle = 'black'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(this.ingredients.length.toString(), this.position.x, this.position.y + 30)
    }
  }
}