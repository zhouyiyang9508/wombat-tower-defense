import { useState } from 'react';
import type { Buff } from '../types/buffs';
import './BuffSelect.css';

interface BuffSelectProps {
  buffs: Buff[];
  onSelect: (buff: Buff) => void;
}

export function BuffSelect({ buffs, onSelect }: BuffSelectProps) {
  const [selectedBuff, setSelectedBuff] = useState<Buff | null>(null);

  const handleSelect = (buff: Buff) => {
    setSelectedBuff(buff);
  };

  const handleConfirm = () => {
    if (selectedBuff) {
      onSelect(selectedBuff);
    }
  };

  return (
    <div className="buff-select-overlay">
      <div className="buff-select">
        <h2>🎁 选择一个Buff</h2>
        <p className="buff-subtitle">增强你的防御能力！</p>
        
        <div className="buff-cards">
          {buffs.map(buff => (
            <div
              key={buff.id}
              className={`buff-card rarity-${buff.rarity} category-${buff.category} ${selectedBuff?.id === buff.id ? 'selected' : ''}`}
              onClick={() => handleSelect(buff)}
            >
              <div className="buff-emoji">{buff.emoji}</div>
              <div className="buff-name">{buff.name}</div>
              <div className="buff-category">
                {buff.category === 'gamble' && '⚠️ 赌博'}
                {buff.category === 'curse' && '☠️ 诅咒'}
                {buff.category === 'economic' && '💰 经济'}
                {buff.category === 'defense' && '🛡️ 防御'}
                {buff.category === 'special' && '✨ 特殊'}
                {' · '}
                {buff.rarity === 'common' && '普通'}
                {buff.rarity === 'rare' && '稀有'}
                {buff.rarity === 'legendary' && '传说'}
              </div>
              <div className="buff-description">{buff.description}</div>
            </div>
          ))}
        </div>

        <button
          className="btn-confirm-buff"
          onClick={handleConfirm}
          disabled={!selectedBuff}
        >
          确认选择
        </button>
      </div>
    </div>
  );
}
