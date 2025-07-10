export type IngredientType = 'tomato' | 'lettuce' | 'bread' | 'cheese'
export type IngredientState = 'raw' | 'chopped' | 'cooked' | 'burnt'
export type KitchenObjectType = 'stove' | 'prep_counter' | 'serving_counter' | 'ingredient_box'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface IngredientData {
  type: IngredientType
  state: IngredientState
  position: Position
  cookingTime?: number
}

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

export interface KitchenObjectData {
  id: string
  type: KitchenObjectType
  position: Position
  size: Size
  interactable: boolean
}

// Network Types
export interface PlayerMoveData {
  x: number
  y: number
}

export interface PlayerItemUpdateData {
  playerId: string
  heldItem: IngredientData | null
}

export interface OrderCompletionData {
  orderId: string
  points: number
}

export interface GameStateData {
  players: { [id: string]: any }
  ingredients: IngredientData[]
  orders: OrderData[]
  score: number
}