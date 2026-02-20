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
  cells: Cell[][];
}

export function GameBoard({ onCellClick, cells }: GameBoardProps) {
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
      if (cell.unit.type === 'worker') return '👷';
      if (cell.unit.type === 'archer') return '🏹';
      if (cell.unit.type === 'cannon') return '💣';
    }
    return '';
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
                onClick={() => onCellClick(rowIndex, colIndex)}
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
