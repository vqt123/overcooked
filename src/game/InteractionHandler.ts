import { Player } from './Player'
import { KitchenObject } from './KitchenObject'
import { Ingredient, IngredientType } from './Ingredient'
import { Order } from './Order'
import { MultiplayerManager } from './MultiplayerManager'
import { GAME_CONFIG } from './GameConfig'

export class InteractionHandler {
  constructor(private multiplayerManager: MultiplayerManager) {}

  handlePlayerInteraction(
    player: Player,
    kitchenObjects: KitchenObject[],
    ingredients: Ingredient[],
    orders: Order[]
  ): {
    ingredientsUpdated: boolean
    orderCompleted: boolean
    completedOrder?: Order
  } {
    let ingredientsUpdated = false
    let orderCompleted = false
    let completedOrder: Order | undefined

    for (const kitchenObject of kitchenObjects) {
      if (this.isInInteractionRange(player, kitchenObject)) {
        
        if (this.handleIngredientPickup(player, kitchenObject)) {
          break
        }
        
        if (this.handleIngredientChopping(player, kitchenObject)) {
          break
        }
        
        if (this.handleCookingStart(player, kitchenObject, ingredients)) {
          ingredientsUpdated = true
          break
        }
        
        if (this.handleCookedIngredientPickup(player, kitchenObject, ingredients)) {
          ingredientsUpdated = true
          break
        }
        
        const completionResult = this.handleOrderServing(player, kitchenObject, orders)
        if (completionResult.completed) {
          orderCompleted = true
          completedOrder = completionResult.order
          break
        }
      }
    }

    return { ingredientsUpdated, orderCompleted, completedOrder }
  }

  private isInInteractionRange(player: Player, kitchenObject: KitchenObject): boolean {
    return kitchenObject.isColliding(
      player.position, 
      player.size + GAME_CONFIG.PLAYER.INTERACTION_RANGE
    )
  }

  private handleIngredientPickup(player: Player, kitchenObject: KitchenObject): boolean {
    if (kitchenObject.data.type === 'ingredient_box' && !player.heldItem) {
      const ingredientTypes: IngredientType[] = ['tomato', 'lettuce', 'bread', 'cheese']
      const randomType = ingredientTypes[Math.floor(Math.random() * ingredientTypes.length)]
      const ingredient = new Ingredient(randomType, player.position.x, player.position.y)
      
      player.pickupItem(ingredient)
      this.multiplayerManager.sendPlayerItemUpdate(ingredient)
      return true
    }
    return false
  }

  private handleIngredientChopping(player: Player, kitchenObject: KitchenObject): boolean {
    if (kitchenObject.data.type === 'prep_counter' && player.heldItem) {
      player.heldItem.chop()
      this.multiplayerManager.sendPlayerItemUpdate(player.heldItem)
      return true
    }
    return false
  }

  private handleCookingStart(
    player: Player, 
    kitchenObject: KitchenObject, 
    ingredients: Ingredient[]
  ): boolean {
    if (kitchenObject.data.type === 'stove' && 
        player.heldItem && 
        player.heldItem.data.state === 'chopped') {
      
      player.heldItem.startCooking()
      const ingredient = player.dropItem()!
      ingredient.data.position = { 
        x: kitchenObject.data.position.x + 40, 
        y: kitchenObject.data.position.y + 20 
      }
      ingredients.push(ingredient)
      
      this.multiplayerManager.sendPlayerItemUpdate(null)
      this.multiplayerManager.sendIngredientUpdate(ingredients)
      return true
    }
    return false
  }

  private handleCookedIngredientPickup(
    player: Player,
    kitchenObject: KitchenObject,
    ingredients: Ingredient[]
  ): boolean {
    if (kitchenObject.data.type === 'stove' && !player.heldItem) {
      const nearbyIngredient = this.findNearbyIngredient(kitchenObject, ingredients)
      
      if (nearbyIngredient) {
        player.pickupItem(nearbyIngredient)
        const index = ingredients.indexOf(nearbyIngredient)
        ingredients.splice(index, 1)
        
        this.multiplayerManager.sendPlayerItemUpdate(nearbyIngredient)
        this.multiplayerManager.sendIngredientUpdate(ingredients)
        return true
      }
    }
    return false
  }

  private handleOrderServing(
    player: Player, 
    kitchenObject: KitchenObject, 
    orders: Order[]
  ): { completed: boolean; order?: Order } {
    if (kitchenObject.data.type === 'serving_counter' && player.heldItem) {
      for (const order of orders) {
        if (this.checkOrderCompletion(player.heldItem, order)) {
          player.dropItem()
          this.multiplayerManager.sendPlayerItemUpdate(null)
          this.multiplayerManager.sendOrderCompletion(order.data.id, order.data.points)
          return { completed: true, order }
        }
      }
    }
    return { completed: false }
  }

  private findNearbyIngredient(kitchenObject: KitchenObject, ingredients: Ingredient[]): Ingredient | undefined {
    return ingredients.find(ingredient => 
      Math.abs(ingredient.data.position.x - kitchenObject.data.position.x - 40) < 20 &&
      Math.abs(ingredient.data.position.y - kitchenObject.data.position.y - 20) < 20
    )
  }

  private checkOrderCompletion(deliveredItem: Ingredient, order: Order): boolean {
    if (order.data.items.length === 1) {
      const requiredItem = order.data.items[0]
      return deliveredItem.data.type === requiredItem.type && 
             deliveredItem.data.state === requiredItem.state
    }
    return false
  }
}