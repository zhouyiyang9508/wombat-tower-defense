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

**Total Time Used**: ~60 minutes (out of planned 39 hours)  
**Playability**: ✅ Core game loop完全可玩！

### Completed
- [x] **Phase 1**: Basic multiplayer framework (✅ 4 min)
  - [View Phase 1 Report](./PHASE1_REPORT.md)
- [x] **Phase 2**: Avatar system (✅ 10 min)
  - Preset emojis + custom upload
- [x] **Phase 3**: Game board (✅ 15 min)
  - 5×15 grid, responsive design
- [x] **Phase 4-5**: Units + Enemies (✅ 20 min)
  - 3 units (worker/archer/cannon)
  - 2 enemy types
  - Auto-attack, gold production
  - Deployment confirmation ✨
  - Game loop (60fps)

### Partial
- [~] **Phase 6-7-8**: Game loop + Buffs + Stages (🟡 40%)
  - ✅ Buff data structure (6 buffs)
  - ✅ BuffSelect UI
  - ❌ Buff activation logic
  - ❌ Multi-stage system
  - ❌ Boss battles

### Not Started
- [ ] **Phase 9**: Multi-path system
- [ ] **Phase 10**: Multiplayer sync optimization

[📊 View Full Progress Report](./PROGRESS_REPORT.md)

## 🎮 Current Playability

**What Works:**
- ✅ Create/join rooms
- ✅ Avatar customization
- ✅ Deploy units (workers produce gold, towers attack)
- ✅ Spawn enemies (manual wave button)
- ✅ Auto-combat (units vs enemies)
- ✅ Victory/defeat conditions

**What's Missing:**
- ❌ Multiplayer game state sync (opponent can't see your units)
- ❌ Buff system activation
- ❌ Multi-stage progression
- ❌ Boss battles
- ❌ Difficulty selection

## 📝 License

MIT

---

Made with ❤️ by 代码熊 🐻
