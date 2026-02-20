export interface Unit {
  id: string;
  type: 'worker' | 'archer' | 'cannon';
  row: number;
  col: number;
  level: number;
  hp: number;
  maxHP: number;
  attack: number;
  attackSpeed: number; // 秒
  range: number; // 格子数
  lastAttackTime: number;
  goldPerSecond?: number; // 农民专用
}

export interface Enemy {
  id: string;
  type: 'zombie' | 'tank' | 'flying' | 'bomber';
  row: number;
  progress: number; // 0-1, 进度
  hp: number;
  maxHP: number;
  speed: number; // 格子/秒
  damage: number; // 攻击基地的伤害
}

export interface GameState {
  gold: number;
  baseHP: number;
  wave: number;
  totalWaves: number;
  stage: number;
  units: Unit[];
  enemies: Enemy[];
  status: 'waiting' | 'playing' | 'waveEnd' | 'victory' | 'defeat';
}

export const UNIT_CONFIG = {
  worker: {
    name: '👷 农民',
    cost: 50,
    hp: 50,
    attack: 0,
    attackSpeed: 0,
    range: 0,
    goldPerSecond: 5
  },
  archer: {
    name: '🏹 弓箭手',
    cost: 100,
    hp: 80,
    attack: 15,
    attackSpeed: 1, // 每秒1次
    range: 3
  },
  cannon: {
    name: '💣 炮塔',
    cost: 200,
    hp: 120,
    attack: 50,
    attackSpeed: 2, // 每2秒1次
    range: 2
  }
};

export const ENEMY_CONFIG = {
  zombie: {
    name: '🧟 僵尸',
    hp: 50,
    speed: 0.5, // 格子/秒
    damage: 10
  },
  tank: {
    name: '🛡️ 坦克',
    hp: 200,
    speed: 0.3,
    damage: 20
  }
};
