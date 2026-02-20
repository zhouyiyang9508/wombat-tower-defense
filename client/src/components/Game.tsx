import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { GameBoard } from './GameBoard';
import { BuffSelect } from './BuffSelect';
import { GameInfo } from './GameInfo';
import { RandomEventNotification } from './RandomEventNotification';
import { soundManager } from '../utils/sound';
import { BUFFS } from '../types/buffs';
import { UNIT_DATA, UNIT_CATEGORIES } from '../data/units';
import './Game.css';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface RandomEvent {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  waveTriggered: number;
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
  randomEvents: RandomEvent[];
  status: 'waiting' | 'playing' | 'waveEnd' | 'stageEnd' | 'victory' | 'defeat';
  difficulty: string;
  goldMultiplier: number;
  costMultiplier: number;
  hpMultiplier: number;
  damageMultiplier: number;
  rangeBonus: number;
}

interface GameProps {
  socket: Socket;
  room: any;
  myPlayerId: string;
}

// UNIT_CONFIG moved to ../data/units.ts

export function Game({ socket, room, myPlayerId: _myPlayerId }: GameProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showBuffSelect, setShowBuffSelect] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedUnitForUpgrade, setSelectedUnitForUpgrade] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('economy');
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const prevEventsCountRef = useRef(0);
  const prevEnemyCountRef = useRef(0);
  const prevStatusRef = useRef<string>('');
  
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
      
      // 音效处理 + 随机事件检测
      if (gameState) {
        // 检测Boss出现
        if (newState.enemies.some(e => e.type === 'boss') && 
            !gameState.enemies.some(e => e.type === 'boss')) {
          soundManager.bossAppear();
        }
        
        // 检测敌人数量变化（敌人死亡）
        if (newState.enemies.length < prevEnemyCountRef.current) {
          soundManager.enemyDeath();
        }
        
        // 检测随机事件
        if (newState.randomEvents && newState.randomEvents.length > prevEventsCountRef.current) {
          const latestEvent = newState.randomEvents[newState.randomEvents.length - 1];
          setCurrentEvent(latestEvent);
        }
        prevEventsCountRef.current = newState.randomEvents?.length || 0;
        
        // 检测状态变化
        if (newState.status !== prevStatusRef.current) {
          if (newState.status === 'playing' && prevStatusRef.current === 'waiting') {
            soundManager.waveStart();
          } else if (newState.status === 'victory') {
            soundManager.victory();
          } else if (newState.status === 'defeat') {
            soundManager.defeat();
          }
        }
        
        prevStatusRef.current = newState.status;
      }
      
      prevEnemyCountRef.current = newState.enemies.length;
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
  }, [socket, cells, gameState]);

  if (!gameState) {
    return (
      <div className="game-loading">
        <h2>⏳ 游戏加载中...</h2>
        <p>等待服务器初始化游戏状态</p>
      </div>
    );
  }

  const handleCellClick = (row: number, col: number) => {
    if (!selectedUnit) {
      return;
    }
    
    // 检查金币
    const unitData = UNIT_DATA[selectedUnit as keyof typeof UNIT_DATA];
    if (!unitData) return;
    
    const cost = unitData.cost * (gameState?.costMultiplier || 1);
    if (gameState && gameState.gold < cost) {
      alert('金币不足！');
      return;
    }
    
    // 检查格子
    if (cells[row][col].type !== 'empty' || cells[row][col].unit) {
      alert('该格子不可用！');
      return;
    }
    
    // 直接部署，不需要确认
    soundManager.deploy();
    
    socket.emit('deploy-unit', {
      roomId: room.id,
      unit: { type: selectedUnit, row, col, id: `unit-${Date.now()}` }
    });
    
    setSelectedUnit(null);
  };

  const toggleSound = () => {
    const enabled = soundManager.toggle();
    setSoundEnabled(enabled);
  };

  const handleUnitClick = (unit: any) => {
    if (unit.level >= 3) {
      alert('该单位已达到最高等级！');
      return;
    }
    setSelectedUnitForUpgrade(unit);
  };

  const confirmUpgrade = () => {
    if (!selectedUnitForUpgrade) return;
    
    const upgradeCost = 100 * selectedUnitForUpgrade.level;
    
    if (gameState && gameState.gold < upgradeCost) {
      alert('金币不足！');
      return;
    }
    
    socket.emit('upgrade-unit', {
      roomId: room.id,
      unitId: selectedUnitForUpgrade.id
    });
    
    setSelectedUnitForUpgrade(null);
  };

  const cancelUpgrade = () => {
    setSelectedUnitForUpgrade(null);
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

  return (
    <div className="game">
      {/* 帮助按钮 */}
      <GameInfo />
      
      {/* 音效开关 */}
      <button className="sound-toggle" onClick={toggleSound} title={soundEnabled ? '关闭音效' : '开启音效'}>
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      
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
        <GameBoard cells={cells} onCellClick={handleCellClick} onUnitClick={handleUnitClick} />
        
        {/* 敌人显示 */}
        <div className="enemies-layer">
          {gameState.enemies.map(enemy => {
            const isStunned = enemy.stunnedUntil && Date.now() < enemy.stunnedUntil;
            const isSlowed = enemy.slowMultiplier && enemy.slowMultiplier < 1;
            
            return (
              <div
                key={enemy.id}
                className={`enemy ${isStunned ? 'enemy-stunned' : ''} ${isSlowed ? 'enemy-slowed' : ''}`}
                style={{
                  top: `${enemy.row * 64 + 20}px`,
                  left: `${enemy.progress * 960 + 60}px`
                }}
              >
                {enemy.type === 'zombie' && '🧟'}
                {enemy.type === 'tank' && '🛡️'}
                {enemy.type === 'boss' && '👹'}
                
                {/* 状态指示 */}
                {isStunned && <span className="enemy-status">⚡</span>}
                {isSlowed && !isStunned && <span className="enemy-status">❄️</span>}
                
                <div className="enemy-hp">
                  <div className="enemy-hp-bar" style={{ width: `${(enemy.hp / enemy.maxHP) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部单位选择栏 */}
      <div className="unit-bar-container">
        {/* 分类选择 */}
        <div className="category-tabs">
          {Object.entries(UNIT_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(key)}
              style={{ borderColor: selectedCategory === key ? cat.color : '#ddd' }}
            >
              {cat.name}
            </button>
          ))}
        </div>
        
        {/* 当前分类的单位 */}
        <div className="unit-bar">
          {Object.entries(UNIT_DATA)
            .filter(([_, data]) => data.category === selectedCategory)
            .map(([type, data]) => {
              const cost = Math.floor(data.cost * gameState.costMultiplier);
              const canAfford = gameState.gold >= cost;
              
              return (
                <button
                  key={type}
                  className={`unit-button ${selectedUnit === type ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                  onClick={() => setSelectedUnit(type)}
                  disabled={!canAfford}
                  title={data.desc}
                >
                  <div className="unit-button-content">
                    <span className="unit-icon">{data.name.split(' ')[0]}</span>
                    <span className="unit-name">{data.name.split(' ').slice(1).join(' ')}</span>
                    <span className="unit-cost">💰{cost}</span>
                  </div>
                </button>
              );
            })}
        </div>
        
        {/* 组合加成提示 */}
        <div className="combo-tip">
          💡 相同塔相邻：3连+20%，5连+50%，8连+100%
        </div>
      </div>

      {/* 升级确认弹窗 */}
      {selectedUnitForUpgrade && gameState && (
        <div className="modal-overlay" onClick={cancelUpgrade}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>升级单位</h3>
            <p>
              升级 <strong>
                {UNIT_DATA[selectedUnitForUpgrade.type as keyof typeof UNIT_DATA]?.name || selectedUnitForUpgrade.type}
              </strong> 到 Lv.{selectedUnitForUpgrade.level + 1}
            </p>
            {selectedUnitForUpgrade.comboBonus > 0 && (
              <p className="combo-bonus">
                🎉 组合加成: +{Math.floor(selectedUnitForUpgrade.comboBonus * 100)}%
              </p>
            )}
            <div className="upgrade-stats">
              <div className="stat-change">
                <span>攻击力</span>
                <strong>{Math.floor(selectedUnitForUpgrade.attack)} → {Math.floor(selectedUnitForUpgrade.attack * 1.5)}</strong>
              </div>
              <div className="stat-change">
                <span>血量</span>
                <strong>{Math.floor(selectedUnitForUpgrade.maxHP)} → {Math.floor(selectedUnitForUpgrade.maxHP * 1.5)}</strong>
              </div>
              {selectedUnitForUpgrade.goldPerSecond && (
                <div className="stat-change">
                  <span>金币产出</span>
                  <strong>{selectedUnitForUpgrade.goldPerSecond}/s → {Math.floor(selectedUnitForUpgrade.goldPerSecond * 1.5)}/s</strong>
                </div>
              )}
            </div>
            <p className="modal-cost">
              升级费用: <strong>💰 {100 * selectedUnitForUpgrade.level}</strong>
            </p>
            <div className="modal-buttons">
              <button onClick={cancelUpgrade} className="btn-secondary">
                取消
              </button>
              <button onClick={confirmUpgrade} className="btn-primary">
                ✅ 升级
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
      
      {/* 随机事件通知 */}
      <RandomEventNotification 
        event={currentEvent} 
        onDismiss={() => setCurrentEvent(null)} 
      />
    </div>
  );
}
