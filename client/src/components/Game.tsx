import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameBoard } from './GameBoard';
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
  const [gold, setGold] = useState(500);
  const [baseHP, setBaseHP] = useState(100);
  const [wave, setWave] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  
  // 初始化5x15网格
  const [cells, setCells] = useState(() => {
    const initialCells = [];
    for (let row = 0; row < 5; row++) {
      const rowCells = [];
      for (let col = 0; col < 15; col++) {
        let type: 'empty' | 'base' | 'spawn' = 'empty';
        
        // 最左边是基地
        if (col === 0 && row === 2) {
          type = 'base';
        }
        // 最右边是敌人出生点
        if (col === 14) {
          type = 'spawn';
        }
        
        rowCells.push({ row, col, type, unit: null });
      }
      initialCells.push(rowCells);
    }
    return initialCells;
  });

  const handleCellClick = (row: number, col: number) => {
    console.log(`Clicked cell: ${row}, ${col}`);
    
    // 如果选择了单位，尝试部署
    if (selectedUnit) {
      const cost = getUnitCost(selectedUnit);
      
      // 检查是否有足够金币
      if (gold < cost) {
        alert('金币不足！');
        return;
      }
      
      // 检查格子是否可用
      if (cells[row][col].type !== 'empty' || cells[row][col].unit) {
        alert('该格子不可用！');
        return;
      }
      
      // 部署单位
      const newCells = [...cells];
      newCells[row][col] = {
        ...newCells[row][col],
        unit: { type: selectedUnit, level: 1, hp: 100 }
      };
      setCells(newCells);
      setGold(gold - cost);
      setSelectedUnit(null);
      
      // TODO: 通知服务器
      socket.emit('deploy-unit', { roomId: room.id, row, col, unitType: selectedUnit });
    }
  };

  const getUnitCost = (type: string) => {
    const costs: Record<string, number> = {
      worker: 50,
      archer: 100,
      cannon: 200
    };
    return costs[type] || 0;
  };

  const getUnitName = (type: string) => {
    const names: Record<string, string> = {
      worker: '👷 农民',
      archer: '🏹 弓箭手',
      cannon: '💣 炮塔'
    };
    return names[type] || type;
  };

  const units = [
    { type: 'worker', cost: 50 },
    { type: 'archer', cost: 100 },
    { type: 'cannon', cost: 200 }
  ];

  return (
    <div className="game">
      {/* 顶部状态栏 */}
      <div className="game-header">
        <div className="game-stats">
          <div className="stat">
            <span className="stat-icon">💰</span>
            <span className="stat-value">{gold}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{baseHP}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">🌊</span>
            <span className="stat-value">波次 {wave}/10</span>
          </div>
        </div>
        
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
      </div>

      {/* 游戏区域 */}
      <GameBoard cells={cells} onCellClick={handleCellClick} />

      {/* 底部单位选择栏 */}
      <div className="unit-bar">
        {units.map(unit => (
          <button
            key={unit.type}
            className={`unit-button ${selectedUnit === unit.type ? 'selected' : ''} ${gold < unit.cost ? 'disabled' : ''}`}
            onClick={() => setSelectedUnit(unit.type)}
            disabled={gold < unit.cost}
          >
            <div className="unit-button-content">
              <span className="unit-icon">{getUnitName(unit.type)}</span>
              <span className="unit-cost">💰 {unit.cost}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
