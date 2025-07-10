export const GAME_CONFIG = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
  },
  PLAYER: {
    SPEED: 150,
    SIZE: 24,
    INTERACTION_RANGE: 20,
  },
  COOKING: {
    MAX_TIME: 20000,    // 5s -> 20s (cooking time)
    BURN_MULTIPLIER: 1.5,
  },
  ORDERS: {
    MAX_ORDERS: 3,
    FIRST_ORDER_DELAY: 20000,    // 5s -> 20s
    MIN_INTERVAL: 60000,         // 15s -> 60s  
    MAX_INTERVAL: 100000,        // 25s -> 100s
    BASE_TIME: 120000,           // 30s -> 120s (2 minutes per order)
    BASE_POINTS: 100,
    MIN_POINTS: 10,
  },
  COLORS: {
    PLAYER_COLORS: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
    KITCHEN: {
      STOVE: '#8b4513',
      PREP_COUNTER: '#c0c0c0',
      SERVING_COUNTER: '#ffd700',
      INGREDIENT_BOX: '#90ee90',
      PLATE_STACK: '#dcdcdc',
      TOMATO_BOX: '#ff6b6b',
      LETTUCE_BOX: '#66ff66',
      BREAD_BOX: '#f5deb3',
      CHEESE_BOX: '#fff8dc',
    },
    FLOOR: {
      PRIMARY: '#4a5568',
      SECONDARY: '#2d3748',
    },
  },
}

export type GameConfig = typeof GAME_CONFIG