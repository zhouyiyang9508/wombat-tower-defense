import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { GameBoard } from './GameBoard';
import { Unit, Enemy, GameState, UNIT_CONFIG, ENEMY_CONFIG } from '../types/game';
import './Game.css';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface GameProps {
  socket: Socket;
  room: any;
  myPlayerId: string;
}

export function Game({ socket, room, myPlayerId }: GameProps) {
  const [gameState, setGameState] = useState<GameState>({
    gold: 500,
    baseHP: 100,
    wave: 1,
    totalWaves: 10,
    stage: 1,
    units: [],
    enemies: [],
    status: 'playing'
  });
  
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [pendingUnit, setPendingUnit] = useState<{ row: number; col: number; type: string } | null>(null);
  const gameLoopRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

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

  // 游戏主循环
  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // 秒
      lastUpdateRef.current = now;

      setGameState(prevState => {
        if (prevState.status !== 'playing') return prevState;

        let newState = { ...prevState };
        
        // 1. 农民生产金币
        newState.units.forEach(unit => {
          if (unit.type === 'worker' && unit.goldPerSecond) {
            newState.gold += unit.goldPerSecond * deltaTime;
          }
        });

        // 2. 敌人移动
        newState.enemies = newState.enemies.map(enemy => ({
          ...enemy,
          progress: Math.min(1, enemy.progress + enemy.speed * deltaTime / 14)
        }));

        // 3. 检查敌人是否到达基地
        const reachedEnemies = newState.enemies.filter(e => e.progress >= 1);
        reachedEnemies.forEach(enemy => {
          newState.baseHP -= enemy.damage;
        });
        newState.enemies = newState.enemies.filter(e => e.progress < 1);

        // 4. 单位攻击
        newState.units.forEach(unit => {
          if (unit.attack > 0 && now - unit.lastAttackTime > unit.attackSpeed * 1000) {
            // 查找范围内的敌人
            const target = findNearestEnemy(unit, newState.enemies);
            if (target) {
              target.hp -= unit.attack;
              unit.lastAttackTime = now;
              
              // 移除死亡的敌人
              newState.enemies = newState.enemies.filter(e => e.hp > 0);
            }
          }
        });

        // 5. 检查基地血量
        if (newState.baseHP <= 0) {
          newState.status = 'defeat';
        }

        // 6. 检查是否清空所有敌人（波次结束）
        if (newState.enemies.length === 0 && newState.status === 'playing') {
          if (newState.wave >= newState.totalWaves) {
            newState.status = 'victory';
          } else {
            // 暂时不自动开始下一波，等待实现
          }
        }

        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // 生成敌人波次
  const spawnWave = () => {
    const newEnemies: Enemy[] = [];
    const enemyCount = 5 + gameState.wave * 2;
    
    for (let i = 0; i < enemyCount; i++) {
      const type = Math.random() > 0.7 ? 'tank' : 'zombie';
      const config = ENEMY_CONFIG[type];
      const row = Math.floor(Math.random() * 5);
      
      newEnemies.push({
        id: `enemy-${Date.now()}-${i}`,
        type,
        row,
        progress: 0,
        hp: config.hp,
        maxHP: config.hp,
        speed: config.speed,
        damage: config.damage
      });
    }
    
    setGameState(prev => ({
      ...prev,
      enemies: [...prev.enemies, ...newEnemies]
    }));
  };

  const findNearestEnemy = (unit: Unit, enemies: Enemy[]): Enemy | null => {
    // 简化版：找同一行或附近行的敌人
    const sameRowEnemies = enemies.filter(e => Math.abs(e.row - unit.row) <= 1);
    if (sameRowEnemies.length === 0) return null;
    
    // 找最近的（progress最高的）
    return sameRowEnemies.reduce((nearest, enemy) => 
      enemy.progress > nearest.progress ? enemy : nearest
    );
  };

  const handleCellClick = (row: number, col: number) => {
    if (!selectedUnit) return;
    
    // 检查金币
    const cost = UNIT_CONFIG[selectedUnit as keyof typeof UNIT_CONFIG].cost;
    if (gameState.gold < cost) {
      alert('金币不足！');
      return;
    }
    
    // 检查格子
    if (cells[row][col].type !== 'empty' || cells[row][col].unit) {
      alert('该格子不可用！');
      return;
    }
    
    // 显示预购确认（小袋熊建议）
    setPendingUnit({ row, col, type: selectedUnit });
  };

  const confirmDeploy = () => {
    if (!pendingUnit) return;
    
    const { row, col, type } = pendingUnit;
    const config = UNIT_CONFIG[type as keyof typeof UNIT_CONFIG];
    const cost = config.cost;
    
    // 创建单位
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      type: type as any,
      row,
      col,
      level: 1,
      hp: config.hp,
      maxHP: config.hp,
      attack: config.attack,
      attackSpeed: config.attackSpeed,
      range: config.range,
      lastAttackTime: 0,
      goldPerSecond: config.goldPerSecond
    };
    
    // 更新游戏状态
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - cost,
      units: [...prev.units, newUnit]
    }));
    
    // 更新格子
    const newCells = [...cells];
    newCells[row][col] = { ...newCells[row][col], unit: newUnit };
    setCells(newCells);
    
    setPendingUnit(null);
    setSelectedUnit(null);
    
    // TODO: 通知服务器
    socket.emit('deploy-unit', { roomId: room.id, unit: newUnit });
  };

  const cancelDeploy = () => {
    setPendingUnit(null);
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
          </div>
          <div className="stat">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{Math.floor(gameState.baseHP)}</span>
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
        
        <button onClick={spawnWave} className="btn-wave">
          开始波次
        </button>
      </div>

      {/* 游戏区域（合并单位和敌人显示） */}
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
              {enemy.type === 'zombie' ? '🧟' : '🛡️'}
              <div className="enemy-hp">
                <div className="enemy-hp-bar" style={{ width: `${(enemy.hp / enemy.maxHP) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部单位选择栏 */}
      <div className="unit-bar">
        {units.map(unit => (
          <button
            key={unit.type}
            className={`unit-button ${selectedUnit === unit.type ? 'selected' : ''} ${gameState.gold < unit.cost ? 'disabled' : ''}`}
            onClick={() => setSelectedUnit(unit.type)}
            disabled={gameState.gold < unit.cost}
          >
            <div className="unit-button-content">
              <span className="unit-icon">{unit.name}</span>
              <span className="unit-cost">💰 {unit.cost}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 预购确认弹窗（小袋熊建议） */}
      {pendingUnit && (
        <div className="modal-overlay" onClick={cancelDeploy}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>确认部署</h3>
            <p>
              {room.players.find((p: Player) => p.id === myPlayerId)?.name} 想在 ({pendingUnit.row}, {pendingUnit.col}) 部署
              <strong> {UNIT_CONFIG[pendingUnit.type as keyof typeof UNIT_CONFIG].name}</strong>
            </p>
            <p className="modal-cost">
              花费: <strong>💰 {UNIT_CONFIG[pendingUnit.type as keyof typeof UNIT_CONFIG].cost}</strong>
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

      {/* 游戏结束 */}
      {gameState.status === 'victory' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🎉 胜利！</h2>
            <p>你们成功守住了基地！</p>
          </div>
        </div>
      )}

      {gameState.status === 'defeat' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>💀 失败</h2>
            <p>基地被摧毁了...</p>
          </div>
        </div>
      )}
    </div>
  );
}
