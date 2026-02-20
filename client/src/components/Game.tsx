import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameBoard } from './GameBoard';
import { BuffSelect } from './BuffSelect';
import { BUFFS } from '../types/buffs';
import './Game.css';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface GameState {
  gold: number;
  baseHP: number;
  maxBaseHP: number;
  wave: number;
  totalWaves: number;
  stage: number;
  totalStages: number;
  units: any[];
  enemies: any[];
  buffs: any[];
  status: 'waiting' | 'playing' | 'waveEnd' | 'stageEnd' | 'victory' | 'defeat';
  difficulty: string;
  goldMultiplier: number;
  costMultiplier: number;
  hpMultiplier: number;
}

interface GameProps {
  socket: Socket;
  room: any;
  myPlayerId: string;
}

const UNIT_CONFIG = {
  worker: { name: '👷 农民', cost: 50 },
  archer: { name: '🏹 弓箭手', cost: 100 },
  cannon: { name: '💣 炮塔', cost: 200 }
};

export function Game({ socket, room, myPlayerId }: GameProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [pendingUnit, setPendingUnit] = useState<{ row: number; col: number; type: string } | null>(null);
  const [showBuffSelect, setShowBuffSelect] = useState(false);
  
  // 初始化5x15网格
  const [cells, setCells] = useState(() => {
    const initialCells = [];
    for (let row = 0; row < 5; row++) {
      const rowCells = [];
      for (let col = 0; col < 15; col++) {
        let type: 'empty' | 'base' | 'spawn' = 'empty';
        if (col === 0 && row === 2) type = 'base';
        if (col === 14) type = 'spawn';
        rowCells.push({ row, col, type, unit: null });
      }
      initialCells.push(rowCells);
    }
    return initialCells;
  });

  // 监听服务器的游戏状态更新
  useEffect(() => {
    const handleGameStateUpdate = (newState: GameState) => {
      console.log('Game state updated:', newState);
      setGameState(newState);
      
      // 更新格子状态（显示单位）
      const newCells = cells.map(row => 
        row.map(cell => ({
          ...cell,
          unit: newState.units.find(u => u.row === cell.row && u.col === cell.col) || null
        }))
      );
      setCells(newCells);
      
      // 检查是否需要显示Buff选择
      if (newState.status === 'stageEnd') {
        setShowBuffSelect(true);
      }
    };

    socket.on('game-state-update', handleGameStateUpdate);

    return () => {
      socket.off('game-state-update', handleGameStateUpdate);
    };
  }, [socket, cells]);

  if (!gameState) {
    return (
      <div className="game-loading">
        <h2>⏳ 游戏加载中...</h2>
        <p>等待服务器初始化游戏状态</p>
      </div>
    );
  }

  const handleCellClick = (row: number, col: number) => {
    if (!selectedUnit) return;
    
    // 检查金币
    const cost = UNIT_CONFIG[selectedUnit as keyof typeof UNIT_CONFIG].cost * gameState.costMultiplier;
    if (gameState.gold < cost) {
      alert('金币不足！');
      return;
    }
    
    // 检查格子
    if (cells[row][col].type !== 'empty' || cells[row][col].unit) {
      alert('该格子不可用！');
      return;
    }
    
    // 显示预购确认
    setPendingUnit({ row, col, type: selectedUnit });
  };

  const confirmDeploy = () => {
    if (!pendingUnit) return;
    
    const { row, col, type } = pendingUnit;
    
    // 发送到服务器
    socket.emit('deploy-unit', {
      roomId: room.id,
      unit: { type, row, col, id: `unit-${Date.now()}` }
    });
    
    setPendingUnit(null);
    setSelectedUnit(null);
  };

  const cancelDeploy = () => {
    setPendingUnit(null);
  };

  const handleSpawnWave = () => {
    socket.emit('spawn-wave', room.id);
  };

  const handleNextWave = () => {
    socket.emit('next-wave', room.id);
  };

  const handleBuffSelect = (buff: any) => {
    socket.emit('select-buff', { roomId: room.id, buffId: buff.id });
    setShowBuffSelect(false);
  };

  const units = [
    { type: 'worker', ...UNIT_CONFIG.worker },
    { type: 'archer', ...UNIT_CONFIG.archer },
    { type: 'cannon', ...UNIT_CONFIG.cannon }
  ];

  return (
    <div className="game">
      {/* 顶部状态栏 */}
      <div className="game-header">
        <div className="game-stats">
          <div className="stat">
            <span className="stat-icon">💰</span>
            <span className="stat-value">{Math.floor(gameState.gold)}</span>
            {gameState.goldMultiplier > 1 && (
              <span className="stat-multiplier">×{gameState.goldMultiplier.toFixed(1)}</span>
            )}
          </div>
          <div className="stat">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{Math.floor(gameState.baseHP)}/{gameState.maxBaseHP}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">🏰</span>
            <span className="stat-value">关卡 {gameState.stage}/{gameState.totalStages}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">🌊</span>
            <span className="stat-value">波次 {gameState.wave}/{gameState.totalWaves}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">👾</span>
            <span className="stat-value">{gameState.enemies.length} 敌人</span>
          </div>
        </div>
        
        {/* Buff列表 */}
        {gameState.buffs.length > 0 && (
          <div className="active-buffs">
            {gameState.buffs.map((buff, index) => {
              const buffData = BUFFS.find(b => b.id === buff.id);
              return buffData ? (
                <div key={index} className="active-buff" title={buffData.description}>
                  <span className="buff-emoji">{buffData.emoji}</span>
                </div>
              ) : null;
            })}
          </div>
        )}
        
        <div className="players-mini">
          {room.players.map((player: Player) => (
            <div key={player.id} className="player-mini">
              <div className="player-mini-avatar">
                {player.avatar?.startsWith('data:') ? (
                  <img src={player.avatar} alt={player.name} />
                ) : (
                  <span>{player.avatar}</span>
                )}
              </div>
              <span className="player-mini-name">{player.name}</span>
            </div>
          ))}
        </div>

        {gameState.status === 'waiting' && (
          <button onClick={handleSpawnWave} className="btn-wave">
            开始波次 {gameState.wave}
          </button>
        )}

        {gameState.status === 'waveEnd' && (
          <button onClick={handleNextWave} className="btn-wave">
            继续下一波
          </button>
        )}
      </div>

      {/* 游戏区域 */}
      <div className="game-area">
        <GameBoard cells={cells} onCellClick={handleCellClick} />
        
        {/* 敌人显示 */}
        <div className="enemies-layer">
          {gameState.enemies.map(enemy => (
            <div
              key={enemy.id}
              className="enemy"
              style={{
                top: `${enemy.row * 64 + 20}px`,
                left: `${enemy.progress * 960 + 60}px`
              }}
            >
              {enemy.type === 'zombie' && '🧟'}
              {enemy.type === 'tank' && '🛡️'}
              {enemy.type === 'boss' && '👹'}
              <div className="enemy-hp">
                <div className="enemy-hp-bar" style={{ width: `${(enemy.hp / enemy.maxHP) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部单位选择栏 */}
      <div className="unit-bar">
        {units.map(unit => {
          const cost = Math.floor(unit.cost * gameState.costMultiplier);
          return (
            <button
              key={unit.type}
              className={`unit-button ${selectedUnit === unit.type ? 'selected' : ''} ${gameState.gold < cost ? 'disabled' : ''}`}
              onClick={() => setSelectedUnit(unit.type)}
              disabled={gameState.gold < cost}
            >
              <div className="unit-button-content">
                <span className="unit-icon">{unit.name}</span>
                <span className="unit-cost">💰 {cost}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 预购确认弹窗 */}
      {pendingUnit && (
        <div className="modal-overlay" onClick={cancelDeploy}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>确认部署</h3>
            <p>
              {room.players.find((p: Player) => p.id === myPlayerId)?.name} 想在 ({pendingUnit.row}, {pendingUnit.col}) 部署
              <strong> {UNIT_CONFIG[pendingUnit.type as keyof typeof UNIT_CONFIG].name}</strong>
            </p>
            <p className="modal-cost">
              花费: <strong>💰 {Math.floor(UNIT_CONFIG[pendingUnit.type as keyof typeof UNIT_CONFIG].cost * gameState.costMultiplier)}</strong>
            </p>
            <div className="modal-buttons">
              <button onClick={cancelDeploy} className="btn-secondary">
                取消
              </button>
              <button onClick={confirmDeploy} className="btn-primary">
                ✅ 确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buff选择 */}
      {showBuffSelect && (
        <BuffSelect buffs={BUFFS.slice(0, 3)} onSelect={handleBuffSelect} />
      )}

      {/* 波次结束提示 */}
      {gameState.status === 'waveEnd' && (
        <div className="wave-end-banner">
          <div className="wave-end-content">
            <h3>✅ 波次 {gameState.wave - 1} 完成！</h3>
            <p>准备好迎接下一波敌人</p>
          </div>
        </div>
      )}

      {/* 游戏结束 */}
      {gameState.status === 'victory' && (
        <div className="modal-overlay">
          <div className="modal victory-modal">
            <div className="victory-animation">🎉</div>
            <h2>胜利！</h2>
            <p className="victory-message">你们成功守住了基地！</p>
            <div className="victory-stats">
              <div className="stat-row">
                <span>完成关卡</span>
                <strong>{gameState.stage}/{gameState.totalStages}</strong>
              </div>
              <div className="stat-row">
                <span>难度</span>
                <strong>{gameState.difficulty.toUpperCase()}</strong>
              </div>
              <div className="stat-row">
                <span>剩余血量</span>
                <strong>{Math.floor(gameState.baseHP)}</strong>
              </div>
              <div className="stat-row">
                <span>获得Buff</span>
                <strong>{gameState.buffs.length}个</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState.status === 'defeat' && (
        <div className="modal-overlay">
          <div className="modal defeat-modal">
            <div className="defeat-animation">💀</div>
            <h2>失败</h2>
            <p className="defeat-message">基地被摧毁了...</p>
            <div className="defeat-stats">
              <div className="stat-row">
                <span>存活关卡</span>
                <strong>{gameState.stage}</strong>
              </div>
              <div className="stat-row">
                <span>波次</span>
                <strong>{gameState.wave}/{gameState.totalWaves}</strong>
              </div>
              <div className="stat-row">
                <span>难度</span>
                <strong>{gameState.difficulty.toUpperCase()}</strong>
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="btn-retry">
              重新开始
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
