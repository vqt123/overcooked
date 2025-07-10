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
    MAX_TIME: 5000,
    BURN_MULTIPLIER: 1.5,
  },
  ORDERS: {
    MAX_ORDERS: 3,
    FIRST_ORDER_DELAY: 5000,
    MIN_INTERVAL: 15000,
    MAX_INTERVAL: 25000,
    BASE_TIME: 30000,
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
    },
    FLOOR: {
      PRIMARY: '#4a5568',
      SECONDARY: '#2d3748',
    },
  },
} as const

export type GameConfig = typeof GAME_CONFIG