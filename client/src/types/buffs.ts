export interface Buff {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'economic' | 'defense' | 'special';
  effect: (gameState: any) => any;
}

export const BUFFS: Buff[] = [
  {
    id: 'golden-age',
    name: '黄金时代',
    emoji: '💰',
    category: 'economic',
    description: '农民产出 +50%',
    effect: (state) => {
      // 直接修改配置，简化版
      return { ...state, goldMultiplier: (state.goldMultiplier || 1) * 1.5 };
    }
  },
  {
    id: 'discount',
    name: '节俭专家',
    emoji: '🏷️',
    category: 'economic',
    description: '所有单位成本 -20%',
    effect: (state) => {
      return { ...state, costMultiplier: (state.costMultiplier || 1) * 0.8 };
    }
  },
  {
    id: 'fortress',
    name: '铜墙铁壁',
    emoji: '🛡️',
    category: 'defense',
    description: '所有防御塔血量 +30%',
    effect: (state) => {
      return { ...state, hpMultiplier: (state.hpMultiplier || 1) * 1.3 };
    }
  },
  {
    id: 'rapid-fire',
    name: '狂热射手',
    emoji: '⚡',
    category: 'defense',
    description: '射速 +25%',
    effect: (state) => {
      return { ...state, attackSpeedMultiplier: (state.attackSpeedMultiplier || 1) / 1.25 };
    }
  },
  {
    id: 'vampire',
    name: '吸血鬼',
    emoji: '🩸',
    category: 'special',
    description: '击杀敌人恢复基地1%血量',
    effect: (state) => {
      return { ...state, vampireMode: true };
    }
  },
  {
    id: 'time-warp',
    name: '时间扭曲',
    emoji: '⏰',
    category: 'special',
    description: '每波开始怪物减速50% (5秒)',
    effect: (state) => {
      return { ...state, timeWarpMode: true };
    }
  }
];

export const STAGE_CONFIG = [
  { stage: 1, waves: 3, difficulty: 1, boss: false },
  { stage: 2, waves: 3, difficulty: 1.3, boss: false },
  { stage: 3, waves: 1, difficulty: 2, boss: true }, // Boss stage
];
