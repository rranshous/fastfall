# FastFall 🎈

A high-speed first-person perspective falling game where you jump from a hot air balloon and navigate through increasingly complex platforms as you plummet toward the ground.

## 🎮 Game Concept

Experience the thrill of freefall! You've just jumped from a hot air balloon at 10,000 feet and must navigate through stationary platforms, rings, and maze-like structures as you fall. The entire game takes place from a first-person POV - you ARE the falling skydiver.

## ✨ Features

- **Full POV Experience**: The game canvas takes up your entire viewport, immersing you in the falling experience
- **3D-like Perspective**: Platforms scale and move realistically as you approach them
- **Dynamic Obstacles**: 
  - Solid platforms to avoid
  - Ring platforms to fly through
  - Moving platforms that shift around
  - Complex maze structures at higher speeds
- **Realistic Physics**: 
  - Wind effects that push you around
  - Increasing speed as you fall
  - Camera shake and tilt based on movement
  - Precise 3D collision detection system
- **Debug Mode**: Toggle detailed technical overlay showing collision zones, platform positions, and game state
- **Atmospheric Progression**: Sky changes from blue to black as you fall from 10,000 feet to ground level
- **High Score Tracking**: Beat your previous best falling distance

## 🕹️ Controls

- **WASD**: Steer your freefall (A/D for left/right, W/S for up/down)
- **SPACE**: Start your descent from the balloon / Restart after game over
- **F**: Toggle debug mode (shows collision zones, platform data, and technical info)
- **Click**: Focus the game window (if keys aren't responding)

## 🚀 Getting Started

### Prerequisites
- Node.js
- npm

### Installation & Running

```bash
# Install dependencies
npm install

# Build the game
npm run build:game

# Start the development server
npm run serve
```

The game will open in your browser at `http://localhost:3000`

### Development

```bash
# Watch mode for development
npm run dev

# Build everything
npm run build
```

## 🎯 Gameplay

1. **Jump**: Press SPACE to leap from the hot air balloon
2. **Navigate**: Use WASD to steer around, through, and between platforms
3. **Survive**: Avoid hitting solid platforms and ring edges
4. **Score**: Try to fall as far as possible before impact
5. **Repeat**: Press SPACE to jump again and beat your high score

## 🛠️ Tech Stack

- **TypeScript**: Game logic and type safety
- **HTML5 Canvas**: High-performance 2D rendering with 3D-like effects
- **Express**: Development server
- **Vanilla JS/CSS**: No frameworks - pure performance

## 🎨 Visual Design

- **Sky-to-Ground Gradient**: Atmospheric color progression during fall
- **3D Projection**: Realistic depth perception and scaling
- **Particle Effects**: Wind and speed indicators
- **Camera Effects**: Shake, tilt, and motion blur simulation
- **Crosshair HUD**: First-person targeting system

## 🌪️ Game Mechanics

- **Altitude System**: Start at 10,000ft, fall to 0ft
- **Speed Progression**: Accelerate from 45mph to 225mph
- **Wind Simulation**: Dynamic wind direction and strength
- **Collision Detection**: Precise 3D collision for all platform types with realistic timing
- **Platform Generation**: Procedural obstacle placement with increasing complexity
- **Debug System**: Technical overlay for development and gameplay analysis

## 📁 Project Structure

```
fastfall/
├── src/
│   ├── game.ts          # Main game logic
│   ├── server.ts        # Express server
│   └── public/
│       ├── index.html   # Game interface
│       └── game.js      # Compiled JavaScript
├── docs/
│   └── idea.md         # Original game concept
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Recent Improvements (v1.3.0)

- **Major Coordinate System Rework**: Complete redesign of 3D coordinate system for intuitive collision detection
- **Enhanced Collision Timing**: Platforms now visually "hit the screen" when collisions occur, making gameplay feel much more natural
- **Advanced Debug Mode**: Press `F` to toggle detailed technical overlay showing:
  - Real-time collision zones with perfect alignment
  - Platform positions and Z-distances
  - Player movement data and active keys
  - Game state information and version tracking
- **Improved 3D Projection**: Simplified and more accurate depth perception with camera positioned at z=0
- **Better Visual Feedback**: Platforms now scale and approach realistically, enhancing the falling sensation

## 🎯 Future Enhancements

- Sound effects and atmospheric audio
- Different balloon types and starting conditions
- Weather effects (rain, snow, storms)
- Multiplayer racing modes
- Mobile touch controls
- VR support for ultimate immersion

## 🔧 Scripts

- `npm run build:game` - Compile TypeScript to JavaScript
- `npm run dev` - TypeScript watch mode
- `npm run start` - Start Express server
- `npm run serve` - Development server with auto-open
- `npm run build` - Full production build

## 📝 License

ISC

---

**Ready to take the leap? Press SPACE and feel the rush of freefall! 🪂**
