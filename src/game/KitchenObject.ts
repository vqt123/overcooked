export interface KitchenObjectData {
  id: string
  type: 'stove' | 'prep_counter' | 'serving_counter' | 'ingredient_box'
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
        ctx.fillStyle = '#8b4513'
        break
      case 'prep_counter':
        ctx.fillStyle = '#c0c0c0'
        break
      case 'serving_counter':
        ctx.fillStyle = '#ffd700'
        break
      case 'ingredient_box':
        ctx.fillStyle = '#90ee90'
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