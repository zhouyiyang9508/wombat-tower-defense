# 🐻 Wombat Tower Defense

A cooperative tower defense rogue-like game for two players, inspired by Plants vs. Zombies but with hardcore difficulty and strategic depth.

**🎮 Live Demo**: `http://124.156.207.60:18080` (when deployed)  
**📦 GitHub**: https://github.com/zhouyiyang9508/wombat-tower-defense

---

## ✨ Features

### 🤝 Real-time Co-op
- Play with your partner over the internet
- Server-side game state (30fps game loop)
- Real-time synchronization via Socket.IO
- Shared gold pool and defense line
- Deployment confirmation system (prevent resource conflicts)

### 🎭 Character Customization
- 10 preset emoji avatars
- Custom image upload (up to 2MB)
- Avatar preview in-game
- Face customization system

### 😊 Difficulty Levels
- **甜蜜双排 (Easy)**: Enemies -30% HP, Gold +60% (for casual play)
- **正常模式 (Normal)**: Balanced experience
- **硬核模式 (Hard)**: Enemies +50% HP, Gold -40% (for hardcore players)

### 🏗️ Unit System
- **👷 Worker (50💰)**: Produces 5 gold/sec
- **🏹 Archer (100💰)**: Ranged attack, 3-tile range
- **💣 Cannon (200💰)**: High damage, good vs tanks

**Upgrade System** (Lv1 → Lv3):
- Click units to upgrade
- +50% attack, HP, production per level
- Progressive cost: 100/200 gold
- Visual level indicators (⭐⭐⭐)

### 👾 Enemy Types
- **🧟 Zombie**: Fast, low HP
- **🛡️ Tank**: Slow, high HP
- **👹 Boss**: Ultra-high HP, summons minions

### 🎁 Rogue-like Buff System
Choose 1 buff after each stage (10 waves):
- **💰 Golden Age**: Worker production +50%
- **🏷️ Discount**: All unit costs -20%
- **🛡️ Fortress**: Tower HP +30%
- **⚡ Rapid Fire**: Attack speed +25%
- **🩸 Vampire**: Heal base 1% per kill
- **⏰ Time Warp**: Wave start with slowed enemies

### 🏆 Game Progression
- 3 Stages × 10 Waves each
- Boss battle every 10 waves
- Progressive difficulty scaling
- Multiple paths (3 lanes)
- Victory/defeat conditions

### 🔊 Sound System
- Synthesized sound effects (Web Audio API)
- Deploy, attack, wave start, victory/defeat sounds
- Boss appear theme
- Toggle on/off (🔊/🔇)

### 💅 Polish & UX
- Responsive design (mobile + desktop)
- Animated UI (cards, modals, banners)
- Real-time buff indicators
- Gold multiplier display
- Wave completion banner
- Comprehensive help system
- Beautiful gradient themes

---

## 🚀 Getting Started

### Development

```bash
# Clone repository
git clone https://github.com/zhouyiyang9508/wombat-tower-defense.git
cd wombat-tower-defense

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

---

## 🎮 How to Play

### Basic Controls
1. Click bottom unit buttons to select a unit
2. Click empty map cells to deploy units
3. Click "开始波次" to spawn enemies
4. Units auto-attack enemies in range
5. Workers auto-produce gold

### Co-op Tips
- Share gold pool wisely
- One player focuses on economy (workers), other on defense
- Use deployment confirmation to avoid conflicts
- Coordinate buff selections
- Communicate via voice/text chat

### Winning Strategy
- **Early game**: Build 2-3 workers for economy
- **Mid game**: Deploy archers/cannons on frontline
- **Late game**: Upgrade units, select powerful buff combos
- **Boss fights**: Focus fire with upgraded cannons

---

## 📊 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: React Hooks
- **Styling**: CSS3 (no framework - pure custom)
- **Real-time**: Socket.IO Client
- **Audio**: Web Audio API
- **Build**: Vite

### Backend
- **Server**: Node.js + Express
- **Real-time**: Socket.IO
- **Game Loop**: setInterval (30fps)
- **Language**: TypeScript
- **Storage**: In-memory (no database needed)

### Deployment
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx (optional)
- **Platform**: Ubuntu 20.04
- **Network**: Direct internet access

---

## 📝 Development Progress

**Total Time**: ~3 hours (from design to playable)  
**Commits**: 20+  
**Lines of Code**: ~3000

### Completed Phases

- [x] **Phase 1**: Multiplayer framework (4 min)
- [x] **Phase 2**: Avatar system (10 min)
- [x] **Phase 3**: Game board (15 min)
- [x] **Phase 4-5**: Units + Enemies (20 min)
- [x] **Phase 6-7-8**: Buff + Stages (partial, 1 hour)
- [x] **Server-side sync**: Real-time state management
- [x] **Sound system**: Web Audio API
- [x] **Upgrade system**: Unit leveling
- [x] **UI polish**: Help, animations, effects

### Not Implemented (Future)
- [ ] More unit/enemy types
- [ ] Leaderboard
- [ ] Replay system
- [ ] Advanced AI pathfinding
- [ ] More visual effects (particles)
- [ ] Music tracks
- [ ] Achievements persistence

---

## 🐛 Known Issues

- Refresh loses game progress (no save/load yet)
- Audio may not work on some mobile browsers (Web Audio limitations)
- No lag compensation (local prediction not implemented)

---

## 📚 Documentation

- [DESIGN.md](./DESIGN.md) - Original design document
- [PROGRESS_REPORT.md](./PROGRESS_REPORT.md) - Development progress
- [PHASE1_REPORT.md](./PHASE1_REPORT.md) - Phase 1 details

---

## 👥 Credits

- **Designer & Developer**: 代码熊 🐻 (Code Bear)
- **Code Reviewer**: 小袋熊 🐨 (Little Wombat)
- **Player**: 大袋熊 (Big Wombat)
- **Inspiration**: Plants vs. Zombies, Slay the Spire

---

## 📄 License

MIT

---

## 🎉 Highlights

**What makes this special:**
- Built in ~3 hours from scratch
- No game engine (pure web tech)
- Server authoritative (no cheating)
- Beautiful UI without UI framework
- Synthesized sounds (no audio files)
- Fully multiplayer-synced

**Perfect for:**
- Long-distance couples 💕
- Friends who want co-op challenges
- Rogue-like enthusiasts
- Tower defense fans

---

Made with ❤️ by 代码熊 🐻  
*"From design to playable in 3 hours. That's the power of focus."*
