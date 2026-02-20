import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

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

// 房间数据结构
interface Player {
  id: string;
  name: string;
  isReady: boolean;
}

interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing';
  createdAt: number;
}

const rooms: Map<string, Room> = new Map();

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
  socket.on('create-room', (playerName: string, callback) => {
    const roomId = generateRoomId();
    const player: Player = {
      id: socket.id,
      name: playerName || `Player-${socket.id.slice(0, 4)}`,
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
  socket.on('join-room', (data: { roomId: string; playerName: string }, callback) => {
    const { roomId, playerName } = data;
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

        // 如果房间空了，删除房间
        if (room.players.length === 0) {
          rooms.delete(roomId);
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
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const PORT = process.env.PORT || 18080;
httpServer.listen(PORT, () => {
  console.log(`🐻 Wombat Tower Defense Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
