import { useState } from 'react';
import './GameBoard.css';

interface Cell {
  row: number;
  col: number;
  type: 'empty' | 'base' | 'spawn' | 'worker' | 'tower';
  unit?: any;
}

interface GameBoardProps {
  onCellClick: (row: number, col: number) => void;
  onUnitClick?: (unit: any) => void;
  cells: Cell[][];
}

export function GameBoard({ onCellClick, onUnitClick, cells }: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{row: number; col: number} | null>(null);

  const getCellClass = (cell: Cell) => {
    const classes = ['cell'];
    
    if (cell.type === 'base') classes.push('cell-base');
    if (cell.type === 'spawn') classes.push('cell-spawn');
    if (cell.unit) classes.push('cell-occupied');
    
    if (hoveredCell && hoveredCell.row === cell.row && hoveredCell.col === cell.col) {
      classes.push('cell-hovered');
    }
    
    return classes.join(' ');
  };

  const getCellContent = (cell: Cell) => {
    if (cell.type === 'base') return '🏰';
    if (cell.type === 'spawn') return '☠️';
    if (cell.unit) {
      const levelStars = '⭐'.repeat(cell.unit.level || 1);
      let emoji = '❓';
      switch (cell.unit.type) {
        case 'worker': emoji = '👷'; break;
        case 'archer': emoji = '🏹'; break;
        case 'cannon': emoji = '💣'; break;
        case 'ice': emoji = '❄️'; break;
        case 'electric': emoji = '⚡'; break;
      }
      return (
        <div className="unit-display">
          <span className="unit-emoji">{emoji}</span>
          {cell.unit.level > 1 && <span className="unit-level">{levelStars}</span>}
        </div>
      );
    }
    return '';
  };

  const handleCellClick = (cell: Cell) => {
    if (cell.unit && onUnitClick) {
      onUnitClick(cell.unit);
    } else {
      onCellClick(cell.row, cell.col);
    }
  };

  return (
    <div className="game-board">
      <div className="board-grid">
        {cells.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell)}
                onClick={() => handleCellClick(cell)}
                onMouseEnter={() => setHoveredCell({row: rowIndex, col: colIndex})}
                onMouseLeave={() => setHoveredCell(null)}
              >
                <span className="cell-content">{getCellContent(cell)}</span>
                <div className="cell-coords">{rowIndex},{colIndex}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
