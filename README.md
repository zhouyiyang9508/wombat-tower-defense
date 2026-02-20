# 🐻 Wombat Tower Defense

A cooperative tower defense rogue-like game for two players, inspired by Plants vs. Zombies but with hardcore difficulty and strategic depth.

## 🎮 Features

- 🤝 **Real-time Co-op**: Play with your partner over the internet
- 🎭 **Character Customization**: Upload avatars and simple face creation
- 🎲 **Rogue-like Progression**: Choose buffs after each stage, build powerful combos
- 💰 **Resource Production**: Deploy workers instead of manually collecting resources
- 🔥 **High Difficulty**: Hybrid PvZ-style challenge with Boss battles
- 🗺️ **Multi-path System**: Defend against enemies from multiple lanes

## 📋 Development Status

Currently in design phase. See [DESIGN.md](./DESIGN.md) for full game design document.

**Planned Development**: 13 phases × 3 hours = ~39 hours total

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + PixiJS
- **Backend**: Node.js + Socket.IO
- **Storage**: SQLite + In-memory state

## 🚀 Getting Started

### Development

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

Then open http://localhost:5173

### Production

```bash
# Build
./deploy.sh

# Start with PM2
pm2 start ecosystem.config.js

# Or start manually
cd server && npm start
```

Access at http://124.156.207.60:18080

## 📝 Development Progress

- [x] **Phase 1**: Basic multiplayer framework (✅ Complete)
  - Room system with 4-digit codes
  - Ready/start mechanism
  - Real-time sync via Socket.IO
  - [View Phase 1 Report](./PHASE1_REPORT.md)
- [ ] **Phase 2**: Face customization system (Next)
- [ ] **Phase 3-13**: Game mechanics, Rogue-like system, polish

## 📝 License

MIT

---

Made with ❤️ by 代码熊 🐻
