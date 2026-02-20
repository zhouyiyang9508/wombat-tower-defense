import './DifficultySelect.css';

interface DifficultySelectProps {
  onSelect: (difficulty: 'easy' | 'normal' | 'hard') => void;
}

export function DifficultySelect({ onSelect }: DifficultySelectProps) {
  const difficulties = [
    {
      id: 'easy',
      name: '😊 甜蜜双排',
      emoji: '💕',
      description: '怪物血量 -30%, 初始金币 +60%',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'normal',
      name: '⚔️ 正常模式',
      emoji: '⚖️',
      description: '平衡的游戏体验',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'hard',
      name: '💀 硬核模式',
      emoji: '🔥',
      description: '怪物血量 +50%, 初始金币 -40%',
      color: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    }
  ];

  return (
    <div className="difficulty-select-overlay">
      <div className="difficulty-select">
        <h2>选择难度</h2>
        <p className="difficulty-subtitle">开始你们的塔防冒险！</p>
        
        <div className="difficulty-cards">
          {difficulties.map(diff => (
            <div
              key={diff.id}
              className="difficulty-card"
              style={{ background: diff.color }}
              onClick={() => onSelect(diff.id as any)}
            >
              <div className="difficulty-emoji">{diff.emoji}</div>
              <div className="difficulty-name">{diff.name}</div>
              <div className="difficulty-description">{diff.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
