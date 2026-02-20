import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { AvatarPicker } from './components/AvatarPicker';
import './App.css';

const SERVER_URL = import.meta.env.PROD 
  ? 'http://124.156.207.60:18080' 
  : 'http://localhost:18080';

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
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'avatar' | 'room'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState('🐻');
  const [roomId, setRoomId] = useState('');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 连接到服务器
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setMyPlayerId(newSocket.id || '');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('room-update', (room: Room) => {
      console.log('Room updated:', room);
      setCurrentRoom(room);
    });

    newSocket.on('player-joined', ({ room }: { player: Player; room: Room }) => {
      console.log('Player joined:', room);
      setCurrentRoom(room);
    });

    newSocket.on('player-left', ({ room }: { playerId: string; room: Room }) => {
      console.log('Player left:', room);
      setCurrentRoom(room);
    });

    newSocket.on('game-start', (room: Room) => {
      console.log('Game started!', room);
      setCurrentRoom(room);
      alert('游戏开始！🎮');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleNext = (creating: boolean) => {
    if (!playerName.trim()) {
      alert('请输入你的名字');
      return;
    }
    if (!creating && !roomId.trim()) {
      alert('请输入房间号');
      return;
    }
    setIsCreating(creating);
    setCurrentScreen('avatar');
  };

  const handleCreateRoom = () => {
    if (!socket) return;

    socket.emit('create-room', { playerName, avatar: playerAvatar }, (response: any) => {
      if (response.success) {
        console.log('Room created:', response);
        setCurrentRoom(response.room);
        setRoomId(response.roomId);
        setCurrentScreen('room');
      } else {
        alert('创建房间失败');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!socket) return;

    socket.emit('join-room', { 
      roomId: roomId.toUpperCase(), 
      playerName, 
      avatar: playerAvatar 
    }, (response: any) => {
      if (response.success) {
        console.log('Joined room:', response);
        setCurrentRoom(response.room);
        setCurrentScreen('room');
      } else {
        alert('加入房间失败: ' + response.error);
      }
    });
  };

  const handleReady = () => {
    if (!socket || !currentRoom) return;
    socket.emit('player-ready', currentRoom.id);
  };

  const renderMenu = () => (
    <div className="menu">
      <h1>🐻 袋熊塔防</h1>
      <p className="subtitle">Wombat Tower Defense</p>
      
      <div className="connection-status">
        {connected ? (
          <span className="status-connected">✅ 已连接到服务器</span>
        ) : (
          <span className="status-disconnected">⚠️ 连接中...</span>
        )}
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="输入你的名字"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
        />
      </div>

      <div className="button-group">
        <button 
          onClick={() => handleNext(true)}
          disabled={!connected || !playerName.trim()}
          className="btn-primary"
        >
          下一步 →
        </button>
      </div>

      <div className="divider">或加入现有房间</div>

      <div className="input-group">
        <input
          type="text"
          placeholder="输入房间号 (4位)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          maxLength={4}
        />
      </div>

      <div className="button-group">
        <button 
          onClick={() => handleNext(false)}
          disabled={!connected || !playerName.trim() || !roomId.trim()}
          className="btn-secondary"
        >
          加入房间 →
        </button>
      </div>
    </div>
  );

  const renderRoom = () => {
    if (!currentRoom) return null;

    const myPlayer = currentRoom.players.find(p => p.id === myPlayerId);
    const otherPlayer = currentRoom.players.find(p => p.id !== myPlayerId);

    return (
      <div className="room">
        <h2>房间: {currentRoom.id}</h2>
        <p className="room-status">
          状态: {currentRoom.status === 'waiting' ? '等待中...' : '游戏中'}
        </p>

        <div className="players">
          <div className="player-card">
            <div className="player-avatar">
              {myPlayer?.avatar?.startsWith('data:') ? (
                <img src={myPlayer.avatar} alt="Avatar" />
              ) : (
                <span>{myPlayer?.avatar || '🐻'}</span>
              )}
            </div>
            <h3>{myPlayer?.name || '我'}</h3>
            <p>{myPlayer?.isReady ? '✅ 已准备' : '⏳ 未准备'}</p>
          </div>

          {otherPlayer ? (
            <div className="player-card">
              <div className="player-avatar">
                {otherPlayer.avatar?.startsWith('data:') ? (
                  <img src={otherPlayer.avatar} alt="Avatar" />
                ) : (
                  <span>{otherPlayer.avatar || '🐨'}</span>
                )}
              </div>
              <h3>{otherPlayer.name}</h3>
              <p>{otherPlayer.isReady ? '✅ 已准备' : '⏳ 未准备'}</p>
            </div>
          ) : (
            <div className="player-card empty">
              <h3>等待玩家加入...</h3>
              <p className="share-code">分享房间号: <strong>{currentRoom.id}</strong></p>
            </div>
          )}
        </div>

        {currentRoom.status === 'waiting' && (
          <div className="button-group">
            <button 
              onClick={handleReady}
              className={myPlayer?.isReady ? 'btn-secondary' : 'btn-primary'}
            >
              {myPlayer?.isReady ? '取消准备' : '准备'}
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('menu');
                setCurrentRoom(null);
                socket?.disconnect();
                window.location.reload();
              }}
              className="btn-danger"
            >
              离开房间
            </button>
          </div>
        )}

        {currentRoom.status === 'playing' && (
          <div className="game-area">
            <p>🎮 游戏已开始！</p>
            <p>（Phase 1 完成 - 游戏玩法将在后续阶段实现）</p>
          </div>
        )}
      </div>
    );
  };

  const renderAvatar = () => (
    <div className="menu">
      <h2>选择你的头像</h2>
      <AvatarPicker 
        onSelect={setPlayerAvatar}
        initialAvatar={playerAvatar}
      />
      <div className="button-group">
        <button 
          onClick={() => setCurrentScreen('menu')}
          className="btn-secondary"
        >
          ← 返回
        </button>
        <button 
          onClick={isCreating ? handleCreateRoom : handleJoinRoom}
          className="btn-primary"
        >
          {isCreating ? '创建房间' : '加入房间'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="app">
      {currentScreen === 'menu' && renderMenu()}
      {currentScreen === 'avatar' && renderAvatar()}
      {currentScreen === 'room' && renderRoom()}
    </div>
  );
}

export default App;
