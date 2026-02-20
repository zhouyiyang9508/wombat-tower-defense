import { useEffect, useState } from 'react';
import './AttackEffect.css';

interface Attack {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'arrow' | 'cannon' | 'hit';
}

interface AttackEffectProps {
  attacks: Attack[];
}

export function AttackEffect({ attacks }: AttackEffectProps) {
  const [activeAttacks, setActiveAttacks] = useState<Attack[]>([]);

  useEffect(() => {
    if (attacks.length > 0) {
      setActiveAttacks(attacks);
      
      // 移除旧的攻击特效
      const timeout = setTimeout(() => {
        setActiveAttacks([]);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [attacks]);

  return (
    <div className="attack-effects-layer">
      {activeAttacks.map(attack => {
        const dx = attack.toX - attack.fromX;
        const dy = attack.toY - attack.fromY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const length = Math.sqrt(dx * dx + dy * dy);
        
        return (
          <div
            key={attack.id}
            className={`attack-line attack-${attack.type}`}
            style={{
              left: `${attack.fromX}px`,
              top: `${attack.fromY}px`,
              width: `${length}px`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 50%'
            }}
          />
        );
      })}
    </div>
  );
}
