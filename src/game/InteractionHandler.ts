import { Player, HeldItem } from './Player'
import { KitchenObject } from './KitchenObject'
import { Ingredient, IngredientType } from './Ingredient'
import { Plate } from './Plate'
import { Order } from './Order'
import { MultiplayerManager } from './MultiplayerManager'
import { GAME_CONFIG } from './GameConfig'

export class InteractionHandler {
  constructor(private multiplayerManager: MultiplayerManager) {}

  handlePlayerInteraction(
    player: Player,
    kitchenObjects: KitchenObject[],
    ingredients: Ingredient[],
    plates: Plate[],
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
        
        if (this.handlePlatePickup(player, kitchenObject)) {
          break
        }
        
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
        
        if (this.handleIngredientToPlate(player, kitchenObject, plates)) {
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
    if (!player.heldItem) {
      let ingredientType: IngredientType | null = null
      
      switch (kitchenObject.data.type) {
        case 'ingredient_box':
          // Random ingredient from the general box
          const ingredientTypes: IngredientType[] = ['tomato', 'lettuce', 'bread', 'cheese']
          ingredientType = ingredientTypes[Math.floor(Math.random() * ingredientTypes.length)]
          break
        case 'tomato_box':
          ingredientType = 'tomato'
          break
        case 'lettuce_box':
          ingredientType = 'lettuce'
          break
        case 'bread_box':
          ingredientType = 'bread'
          break
        case 'cheese_box':
          ingredientType = 'cheese'
          break
      }
      
      if (ingredientType) {
        const ingredient = new Ingredient(ingredientType, player.position.x, player.position.y)
        player.pickupItem(ingredient)
        this.multiplayerManager.sendPlayerItemUpdate(ingredient)
        return true
      }
    }
    return false
  }

  private handleIngredientChopping(player: Player, kitchenObject: KitchenObject): boolean {
    if (kitchenObject.data.type === 'prep_counter' && 
        player.heldItem && 
        player.heldItem instanceof Ingredient) {
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
        player.heldItem instanceof Ingredient &&
        player.heldItem.data.state === 'chopped') {
      
      player.heldItem.startCooking()
      const ingredient = player.dropItem() as Ingredient
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

  private handlePlatePickup(player: Player, kitchenObject: KitchenObject): boolean {
    if (kitchenObject.data.type === 'plate_stack' && !player.heldItem) {
      const plate = new Plate(player.position.x, player.position.y)
      player.pickupItem(plate)
      this.multiplayerManager.sendPlayerItemUpdate(null) // TODO: Handle plate updates
      return true
    }
    return false
  }

  private handleIngredientToPlate(player: Player, kitchenObject: KitchenObject, _plates: Plate[]): boolean {
    // If player has a plate and there's an ingredient, add it to the plate
    if (kitchenObject.data.type === 'prep_counter' && 
        player.heldItem && 
        player.heldItem instanceof Plate) {
      
      // For now, just return false - we'll implement ingredient-to-plate logic later
      // The current logic creates infinite plate creation loops
      return false
    }
    return false
  }

  private checkOrderCompletion(deliveredItem: HeldItem, order: Order): boolean {
    // For now, only support single ingredient orders to fix the stuck issue
    if (deliveredItem instanceof Ingredient && order.data.items.length === 1) {
      const requiredItem = order.data.items[0]
      return deliveredItem.data.type === requiredItem.type && 
             deliveredItem.data.state === requiredItem.state
    }
    
    // TODO: Re-implement plate-based orders later
    // if (deliveredItem instanceof Plate) {
    //   // Plate logic here
    // }
    
    return false
  }
}