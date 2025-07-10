# 🍳 Overcooked Multiplayer Game

A realtime multiplayer web-based cooking game inspired by Overcooked, built with React, TypeScript, and Socket.io.

![Game Screenshot](screenshots/game-ui-elements.png)

## 🎮 Play the Game

1. **Start the servers:**
   ```bash
   npm install
   npm run server &    # Start backend on port 3001
   npm run dev         # Start frontend on port 3000
   ```

2. **Open multiple browser windows:**
   - Navigate to `http://localhost:3000`
   - Each window creates a new player
   - Up to 4 players with different colors

3. **Game Controls:**
   - **WASD**: Move player
   - **SPACE**: Interact with stations
   - **Q**: Drop held items

## 🎯 How to Play

### Complete Orders
1. **Check orders** (colored squares on right side)
2. **Pick up ingredients** from colored boxes (tomato=red, lettuce=green, bread=beige, cheese=cream)
3. **Chop ingredients** on gray Prep Counter
4. **Cook ingredients** (bread/cheese) on brown Stove (watch progress bar!)
5. **Serve completed items** at yellow Serving Counter

### Kitchen Stations
- 🟩 **Ingredient Boxes**: Pick up specific ingredients (tomato, lettuce, bread, cheese)
- ⬜ **Prep Counter**: Chop raw ingredients 
- 🟫 **Stove**: Cook chopped ingredients (20 seconds with progress bar)
- 🟨 **Serving Counter**: Complete orders here
- ⬜ **Plate Stack**: Pick up plates (for future multi-ingredient orders)

### Visual Indicators
- **Raw ingredients**: Solid colors
- **Chopped ingredients**: Black border around ingredient
- **Cooking progress**: Color-coded bars (yellow → green → red)
- **Orders**: Show exactly what you need to deliver

## 🚀 Technical Features

### Frontend
- **React 19.1.0** + **TypeScript** + **Vite 5.4.10**
- **Custom 2D Canvas Game Engine** (60fps)
- **Real-time multiplayer** with Socket.io client
- **Responsive input handling** with debouncing
- **Visual progress indicators** and cooking timers

### Backend
- **Node.js** + **Express** + **Socket.io 4.8.1**
- **Server-authoritative game state** management
- **Real-time synchronization** of players, ingredients, orders
- **Dynamic order generation** with 2-minute timers
- **Scalable multiplayer architecture**

### Game Mechanics
- **4 ingredient types**: Tomato, Lettuce, Bread, Cheese
- **3 cooking states**: Raw → Chopped → Cooked → Burnt
- **Smart order system**: 2-minute orders with dynamic scoring
- **Cooking timers**: 20-second cooking with visual progress
- **Input debouncing**: 300ms cooldown prevents button bouncing

## 🛠 Development

### Project Structure
```
src/
├── components/
│   └── GameCanvas.tsx          # React wrapper
├── game/
│   ├── GameEngine.ts           # Main game loop & state
│   ├── GameRenderer.ts         # Canvas rendering
│   ├── Player.ts               # Player entity
│   ├── Ingredient.ts           # Ingredient system
│   ├── Order.ts                # Order management
│   ├── InteractionHandler.ts   # Player interactions
│   ├── KitchenObject.ts        # Kitchen stations
│   ├── InputManager.ts         # Input handling
│   └── MultiplayerManager.ts   # Socket.io client
├── server/
│   ├── index.ts                # Main server
│   ├── OrderManager.ts         # Order generation
│   └── SocketHandlers.ts       # Socket event handling
└── shared/
    └── GameTypes.ts            # Shared type definitions
```

### Scripts
```bash
npm run dev        # Start frontend development server
npm run server     # Start backend server  
npm run build      # Build for production
npm test          # Run Playwright end-to-end tests
```

### Testing
- **Playwright** end-to-end tests with screenshot verification
- **6 test scenarios**: Loading, movement, interactions, multiplayer
- **Visual regression testing** with automated screenshots

## 🎨 Game Design

### Visual Style
- **Colorful pixel art** aesthetic
- **Clear visual hierarchy** with bold outlined text
- **Intuitive color coding** for ingredients and stations
- **Real-time feedback** with progress bars and animations

### User Experience
- **Responsive controls** with input debouncing
- **Clear visual feedback** for all interactions
- **Readable UI** with high-contrast text
- **Forgiving timers** (2-minute orders, 20-second cooking)

## 🔧 Configuration

All game timing and balance can be adjusted in `src/game/GameConfig.ts`:

```typescript
export const GAME_CONFIG = {
  ORDERS: {
    BASE_TIME: 120000,     // 2 minutes per order
    MIN_INTERVAL: 60000,   // 1 minute between orders
    MAX_INTERVAL: 100000,  // ~1.5 minutes between orders
  },
  COOKING: {
    MAX_TIME: 20000,       // 20 seconds cooking time
  },
  // ... more settings
}
```

## 🚧 Future Features

- **Multi-ingredient recipes** (burgers, salads) with plate assembly
- **Multiple kitchen layouts** and difficulty levels  
- **Power-ups** and special events
- **Audio system** with sound effects and music
- **Mobile support** with touch controls
- **Spectator mode** and replay system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Overcooked!** by Ghost Town Games for the original inspiration
- **Socket.io** for real-time multiplayer functionality
- **React** and **TypeScript** for the robust development experience
- **Playwright** for reliable end-to-end testing

---

Built with ❤️ using **React**, **TypeScript**, **Socket.io**, and **Canvas API**