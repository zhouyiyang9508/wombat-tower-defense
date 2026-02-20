export interface Buff {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'economic' | 'defense' | 'special' | 'gamble' | 'curse';
  rarity: 'common' | 'rare' | 'legendary';
  effect: (gameState: any) => any;
}

export const BUFFS: Buff[] = [
  // ===== 标准 Buff（原有6个）=====
  {
    id: 'golden-age',
    name: '黄金时代',
    emoji: '💰',
    category: 'economic',
    rarity: 'common',
    description: '农民产出 +50%',
    effect: (state) => {
      return { ...state, goldMultiplier: (state.goldMultiplier || 1) * 1.5 };
    }
  },
  {
    id: 'discount',
    name: '节俭专家',
    emoji: '🏷️',
    category: 'economic',
    rarity: 'common',
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
    rarity: 'common',
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
    rarity: 'common',
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
    rarity: 'rare',
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
    rarity: 'rare',
    description: '每波开始怪物减速50% (5秒)',
    effect: (state) => {
      return { ...state, timeWarpMode: true };
    }
  },

  // ===== 新增标准 Buff（6个）=====
  {
    id: 'engineer',
    name: '工程师',
    emoji: '🔧',
    category: 'economic',
    rarity: 'rare',
    description: '立即获得 500 金币',
    effect: (state) => {
      return { ...state, gold: (state.gold || 0) + 500 };
    }
  },
  {
    id: 'artillery',
    name: '炮兵连',
    emoji: '💣',
    category: 'defense',
    rarity: 'rare',
    description: '所有单位攻击力 +40%',
    effect: (state) => {
      return { ...state, damageMultiplier: (state.damageMultiplier || 1) * 1.4 };
    }
  },
  {
    id: 'sniper-nest',
    name: '狙击巢穴',
    emoji: '🎯',
    category: 'defense',
    rarity: 'rare',
    description: '所有单位射程 +1',
    effect: (state) => {
      return { ...state, rangeBonus: (state.rangeBonus || 0) + 1 };
    }
  },
  {
    id: 'recycler',
    name: '回收站',
    emoji: '♻️',
    category: 'special',
    rarity: 'common',
    description: '卖单位返还 80% 金币（原50%）',
    effect: (state) => {
      return { ...state, sellRefund: 0.8 };
    }
  },
  {
    id: 'medic',
    name: '战地医疗',
    emoji: '🏥',
    category: 'special',
    rarity: 'rare',
    description: '基地每秒恢复 1 点血量',
    effect: (state) => {
      return { ...state, baseRegen: (state.baseRegen || 0) + 1 };
    }
  },
  {
    id: 'commander',
    name: '指挥官',
    emoji: '👑',
    category: 'special',
    rarity: 'legendary',
    description: '所有效果加成 +10%',
    effect: (state) => {
      return { ...state, commanderBonus: 1.1 };
    }
  },

  // ===== 赌博 Buff（高风险高回报，3个）=====
  {
    id: 'all-in',
    name: '梭哈',
    emoji: '🎰',
    category: 'gamble',
    rarity: 'legendary',
    description: '攻击力 +100%，但基地血量 -30%',
    effect: (state) => {
      return { 
        ...state, 
        damageMultiplier: (state.damageMultiplier || 1) * 2.0,
        maxBaseHP: Math.floor((state.maxBaseHP || 100) * 0.7),
        baseHP: Math.min(state.baseHP || 100, Math.floor((state.maxBaseHP || 100) * 0.7))
      };
    }
  },
  {
    id: 'berserk',
    name: '狂暴',
    emoji: '😡',
    category: 'gamble',
    rarity: 'legendary',
    description: '射速 +80%，但单位建造成本 +50%',
    effect: (state) => {
      return { 
        ...state, 
        attackSpeedMultiplier: (state.attackSpeedMultiplier || 1) / 1.8,
        costMultiplier: (state.costMultiplier || 1) * 1.5
      };
    }
  },
  {
    id: 'greed',
    name: '贪婪',
    emoji: '🤑',
    category: 'gamble',
    rarity: 'legendary',
    description: '金币产出 +200%，但每波敌人血量 +30%',
    effect: (state) => {
      return { 
        ...state, 
        goldMultiplier: (state.goldMultiplier || 1) * 3.0,
        enemyHPMultiplier: (state.enemyHPMultiplier || 1) * 1.3
      };
    }
  },

  // ===== 诅咒 Buff（负面效果 + 金币奖励，3个）=====
  {
    id: 'curse-poverty',
    name: '贫穷诅咒',
    emoji: '💸',
    category: 'curse',
    rarity: 'rare',
    description: '立即 +800 金币，但之后产金 -40%',
    effect: (state) => {
      return { 
        ...state, 
        gold: (state.gold || 0) + 800,
        goldMultiplier: (state.goldMultiplier || 1) * 0.6
      };
    }
  },
  {
    id: 'curse-fragile',
    name: '脆弱诅咒',
    emoji: '🥚',
    category: 'curse',
    rarity: 'rare',
    description: '立即 +600 金币，但塔血量 -25%',
    effect: (state) => {
      return { 
        ...state, 
        gold: (state.gold || 0) + 600,
        hpMultiplier: (state.hpMultiplier || 1) * 0.75
      };
    }
  },
  {
    id: 'curse-slow',
    name: '迟缓诅咒',
    emoji: '🐌',
    category: 'curse',
    rarity: 'rare',
    description: '立即 +700 金币，但射速 -30%',
    effect: (state) => {
      return { 
        ...state, 
        gold: (state.gold || 0) + 700,
        attackSpeedMultiplier: (state.attackSpeedMultiplier || 1) * 1.3
      };
    }
  }
];

export const STAGE_CONFIG = [
  { stage: 1, waves: 3, difficulty: 1, boss: false },
  { stage: 2, waves: 3, difficulty: 1.3, boss: false },
  { stage: 3, waves: 1, difficulty: 2, boss: true }, // Boss stage
];
