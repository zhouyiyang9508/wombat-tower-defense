import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { 
  GameState, 
  createGameState, 
  updateGameState, 
  spawnWave, 
  deployUnit,
  selectBuff,
  upgradeUnit,
  Unit,
  UNIT_CONFIG
} from './game-state';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/health') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(publicPath, 'index.html'));
    }
  });
}

// 数据结构
interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
}

interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing';
  createdAt: number;
  difficulty?: 'easy' | 'normal' | 'hard';
}

const rooms: Map<string, Room> = new Map();
const gameStates: Map<string, GameState> = new Map();
const gameLoops: Map<string, NodeJS.Timeout> = new Map();

// 游戏循环管理
function startGameLoop(roomId: string) {
  // 如果已经有循环在运行，先停止
  if (gameLoops.has(roomId)) {
    clearInterval(gameLoops.get(roomId)!);
  }
  
  let lastUpdate = Date.now();
  
  const interval = setInterval(() => {
    const gameState = gameStates.get(roomId);
    if (!gameState) {
      stopGameLoop(roomId);
      return;
    }
    
    const now = Date.now();
    const deltaTime = (now - lastUpdate) / 1000; // 秒
    lastUpdate = now;
    
    // 更新游戏状态
    const newState = updateGameState(gameState, deltaTime);
    gameStates.set(roomId, newState);
    
    // 广播给房间内所有人
    io.to(roomId).emit('game-state-update', newState);
    
    // 如果游戏结束，停止循环
    if (newState.status === 'victory' || newState.status === 'defeat') {
      console.log(`[${new Date().toISOString()}] Game ended in ${roomId}: ${newState.status}`);
      stopGameLoop(roomId);
    }
  }, 1000 / 30); // 30fps
  
  gameLoops.set(roomId, interval);
  console.log(`[${new Date().toISOString()}] Game loop started for room ${roomId}`);
}

function stopGameLoop(roomId: string) {
  const interval = gameLoops.get(roomId);
  if (interval) {
    clearInterval(interval);
    gameLoops.delete(roomId);
    console.log(`[${new Date().toISOString()}] Game loop stopped for room ${roomId}`);
  }
}

// 生成4位房间号
function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomId = '';
  do {
    roomId = '';
    for (let i = 0; i < 4; i++) {
      roomId += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(roomId));
  return roomId;
}

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Player connected: ${socket.id}`);

  // 创建房间
  socket.on('create-room', (data: { playerName: string; avatar: string }, callback) => {
    const roomId = generateRoomId();
    const player: Player = {
      id: socket.id,
      name: data.playerName || `Player-${socket.id.slice(0, 4)}`,
      avatar: data.avatar || '🐻',
      isReady: false
    };

    const room: Room = {
      id: roomId,
      players: [player],
      status: 'waiting',
      createdAt: Date.now()
    };

    rooms.set(roomId, room);
    socket.join(roomId);

    console.log(`[${new Date().toISOString()}] Room created: ${roomId} by ${player.name}`);
    
    callback({ success: true, roomId, room });
  });

  // 加入房间
  socket.on('join-room', (data: { roomId: string; playerName: string; avatar: string }, callback) => {
    const { roomId, playerName, avatar } = data;
    const room = rooms.get(roomId);

    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.players.length >= 2) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    if (room.status !== 'waiting') {
      callback({ success: false, error: 'Game already started' });
      return;
    }

    const player: Player = {
      id: socket.id,
      name: playerName || `Player-${socket.id.slice(0, 4)}`,
      avatar: avatar || '🐨',
      isReady: false
    };

    room.players.push(player);
    socket.join(roomId);

    console.log(`[${new Date().toISOString()}] ${player.name} joined room: ${roomId}`);

    // 通知房间内所有人
    io.to(roomId).emit('player-joined', { player, room });
    
    callback({ success: true, room });
  });

  // 玩家准备
  socket.on('player-ready', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isReady = !player.isReady;
    
    console.log(`[${new Date().toISOString()}] ${player.name} ready status: ${player.isReady}`);

    io.to(roomId).emit('room-update', room);

    // 检查是否都准备好了
    if (room.players.length === 2 && room.players.every(p => p.isReady)) {
      room.status = 'playing';
      io.to(roomId).emit('game-start', room);
      console.log(`[${new Date().toISOString()}] Game started in room: ${roomId}`);
    }
  });

  // 选择难度并开始游戏
  socket.on('select-difficulty', (data: { roomId: string; difficulty: 'easy' | 'normal' | 'hard' }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;
    
    room.difficulty = data.difficulty;
    
    // 创建游戏状态
    const gameState = createGameState(data.roomId, data.difficulty);
    gameStates.set(data.roomId, gameState);
    
    // 启动游戏循环
    startGameLoop(data.roomId);
    
    // 广播游戏状态
    io.to(data.roomId).emit('game-state-update', gameState);
    
    console.log(`[${new Date().toISOString()}] Game started in ${data.roomId} with ${data.difficulty} difficulty`);
  });

  // 部署单位
  socket.on('deploy-unit', (data: { roomId: string; unit: Partial<Unit> }) => {
    const gameState = gameStates.get(data.roomId);
    if (!gameState) return;
    
    const config = UNIT_CONFIG[data.unit.type!];
    const fullUnit: Unit = {
      id: data.unit.id || `unit-${Date.now()}`,
      type: data.unit.type!,
      row: data.unit.row!,
      col: data.unit.col!,
      level: 1,
      hp: config.hp,
      maxHP: config.hp,
      attack: config.attack,
      attackSpeed: config.attackSpeed,
      range: config.range,
      lastAttackTime: 0,
      goldPerSecond: 'goldPerSecond' in config ? config.goldPerSecond : undefined,
      ownerId: socket.id
    };
    
    const newState = deployUnit(gameState, fullUnit);
    gameStates.set(data.roomId, newState);
    
    // 广播给房间内所有人
    io.to(data.roomId).emit('game-state-update', newState);
  });

  // 开始波次
  socket.on('spawn-wave', (roomId: string) => {
    const gameState = gameStates.get(roomId);
    if (!gameState) return;
    
    const newState = spawnWave(gameState);
    gameStates.set(roomId, newState);
    
    io.to(roomId).emit('game-state-update', newState);
    
    console.log(`[${new Date().toISOString()}] Wave ${newState.wave} spawned in ${roomId}`);
  });

  // 选择Buff
  socket.on('select-buff', (data: { roomId: string; buffId: string }) => {
    const gameState = gameStates.get(data.roomId);
    if (!gameState) return;
    
    const newState = selectBuff(gameState, data.buffId, socket.id);
    gameStates.set(data.roomId, newState);
    
    io.to(data.roomId).emit('game-state-update', newState);
    
    console.log(`[${new Date().toISOString()}] Buff ${data.buffId} selected in ${data.roomId}`);
  });

  // 继续下一波
  socket.on('next-wave', (roomId: string) => {
    const gameState = gameStates.get(roomId);
    if (!gameState) return;
    
    const newState = { ...gameState, status: 'waiting' as const };
    gameStates.set(roomId, newState);
    
    io.to(roomId).emit('game-state-update', newState);
  });

  // 升级单位
  socket.on('upgrade-unit', (data: { roomId: string; unitId: string }) => {
    const gameState = gameStates.get(data.roomId);
    if (!gameState) return;
    
    const newState = upgradeUnit(gameState, data.unitId);
    gameStates.set(data.roomId, newState);
    
    io.to(data.roomId).emit('game-state-update', newState);
    
    console.log(`[${new Date().toISOString()}] Unit ${data.unitId} upgraded in ${data.roomId}`);
  });

  // 获取房间列表
  socket.on('get-rooms', (callback) => {
    const roomList = Array.from(rooms.values()).map(room => ({
      id: room.id,
      playerCount: room.players.length,
      status: room.status
    }));
    callback(roomList);
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Player disconnected: ${socket.id}`);

    // 从所有房间中移除该玩家
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        console.log(`[${new Date().toISOString()}] ${player.name} left room: ${roomId}`);

        // 如果房间空了，删除房间并停止游戏循环
        if (room.players.length === 0) {
          rooms.delete(roomId);
          gameStates.delete(roomId);
          stopGameLoop(roomId);
          console.log(`[${new Date().toISOString()}] Room deleted: ${roomId}`);
        } else {
          // 通知剩余玩家
          io.to(roomId).emit('player-left', { playerId: socket.id, room });
        }
      }
    });
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: rooms.size,
    activeGames: gameStates.size,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const PORT = process.env.PORT || 18080;
httpServer.listen(PORT, () => {
  console.log(`🐻 Wombat Tower Defense Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
