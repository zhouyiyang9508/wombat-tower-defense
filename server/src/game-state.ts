// 游戏状态管理（服务器端）

export interface Unit {
  id: string;
  type: 'worker' | 'archer' | 'cannon';
  row: number;
  col: number;
  level: number;
  hp: number;
  maxHP: number;
  attack: number;
  attackSpeed: number;
  range: number;
  lastAttackTime: number;
  goldPerSecond?: number;
  ownerId: string; // 部署该单位的玩家ID
}

export interface Enemy {
  id: string;
  type: 'zombie' | 'tank' | 'boss';
  row: number;
  progress: number;
  hp: number;
  maxHP: number;
  speed: number;
  damage: number;
}

export interface Buff {
  id: string;
  name: string;
  selectedBy: string; // 选择该Buff的玩家ID
}

export interface GameState {
  roomId: string;
  gold: number;
  baseHP: number;
  maxBaseHP: number;
  wave: number;
  totalWaves: number;
  stage: number;
  totalStages: number;
  units: Unit[];
  enemies: Enemy[];
  buffs: Buff[];
  status: 'waiting' | 'playing' | 'waveEnd' | 'stageEnd' | 'victory' | 'defeat';
  difficulty: 'easy' | 'normal' | 'hard';
  // Buff效果倍数
  goldMultiplier: number;
  costMultiplier: number;
  hpMultiplier: number;
  attackSpeedMultiplier: number;
  vampireMode: boolean;
  timeWarpMode: boolean;
}

export const UNIT_CONFIG = {
  worker: { cost: 50, hp: 50, attack: 0, attackSpeed: 0, range: 0, goldPerSecond: 5 },
  archer: { cost: 100, hp: 80, attack: 15, attackSpeed: 1, range: 3 },
  cannon: { cost: 200, hp: 120, attack: 50, attackSpeed: 2, range: 2 }
};

export const ENEMY_CONFIG = {
  zombie: { hp: 50, speed: 0.5, damage: 10 },
  tank: { hp: 200, speed: 0.3, damage: 20 },
  boss: { hp: 1000, speed: 0.2, damage: 50 }
};

export const DIFFICULTY_CONFIG = {
  easy: { baseHP: 150, gold: 800, enemyHPMultiplier: 0.7, goldMultiplier: 1.4 },
  normal: { baseHP: 100, gold: 500, enemyHPMultiplier: 1.0, goldMultiplier: 1.0 },
  hard: { baseHP: 80, gold: 300, enemyHPMultiplier: 1.5, goldMultiplier: 0.6 }
};

export function createGameState(roomId: string, difficulty: 'easy' | 'normal' | 'hard' = 'normal'): GameState {
  const config = DIFFICULTY_CONFIG[difficulty];
  
  return {
    roomId,
    gold: config.gold,
    baseHP: config.baseHP,
    maxBaseHP: config.baseHP,
    wave: 1,
    totalWaves: 10,
    stage: 1,
    totalStages: 3,
    units: [],
    enemies: [],
    buffs: [],
    status: 'waiting',
    difficulty,
    goldMultiplier: config.goldMultiplier,
    costMultiplier: 1,
    hpMultiplier: 1,
    attackSpeedMultiplier: 1,
    vampireMode: false,
    timeWarpMode: false
  };
}

export function spawnWave(state: GameState): GameState {
  const newEnemies: Enemy[] = [];
  const baseCount = 5 + state.wave * 2;
  const enemyCount = Math.floor(baseCount * (state.stage * 0.5 + 0.5));
  
  // Boss关（每个stage的最后一波）
  const isBossWave = state.wave === state.totalWaves;
  
  if (isBossWave) {
    // Boss + 小怪
    const bossRow = Math.floor(Math.random() * 5);
    newEnemies.push({
      id: `boss-${Date.now()}`,
      type: 'boss',
      row: bossRow,
      progress: 0,
      hp: ENEMY_CONFIG.boss.hp * state.stage,
      maxHP: ENEMY_CONFIG.boss.hp * state.stage,
      speed: ENEMY_CONFIG.boss.speed,
      damage: ENEMY_CONFIG.boss.damage
    });
    
    // 小怪
    for (let i = 0; i < 10; i++) {
      const type = Math.random() > 0.5 ? 'tank' : 'zombie';
      const config = ENEMY_CONFIG[type];
      const row = Math.floor(Math.random() * 5);
      
      newEnemies.push({
        id: `enemy-${Date.now()}-${i}`,
        type,
        row,
        progress: Math.random() * 0.3, // 分散出生
        hp: config.hp * DIFFICULTY_CONFIG[state.difficulty].enemyHPMultiplier,
        maxHP: config.hp * DIFFICULTY_CONFIG[state.difficulty].enemyHPMultiplier,
        speed: config.speed,
        damage: config.damage
      });
    }
  } else {
    // 普通波次
    for (let i = 0; i < enemyCount; i++) {
      const type = Math.random() > 0.7 ? 'tank' : 'zombie';
      const config = ENEMY_CONFIG[type];
      const row = Math.floor(Math.random() * 5);
      
      newEnemies.push({
        id: `enemy-${Date.now()}-${i}`,
        type,
        row,
        progress: 0,
        hp: config.hp * DIFFICULTY_CONFIG[state.difficulty].enemyHPMultiplier,
        maxHP: config.hp * DIFFICULTY_CONFIG[state.difficulty].enemyHPMultiplier,
        speed: config.speed,
        damage: config.damage
      });
    }
  }
  
  return {
    ...state,
    enemies: [...state.enemies, ...newEnemies],
    status: 'playing'
  };
}

export function updateGameState(state: GameState, deltaTime: number): GameState {
  if (state.status !== 'playing') return state;
  
  let newState = { ...state };
  const now = Date.now();
  
  // 1. 农民生产金币
  newState.units.forEach(unit => {
    if (unit.type === 'worker' && unit.goldPerSecond) {
      newState.gold += unit.goldPerSecond * deltaTime * newState.goldMultiplier;
    }
  });
  
  // 2. 敌人移动
  newState.enemies = newState.enemies.map(enemy => ({
    ...enemy,
    progress: Math.min(1, enemy.progress + enemy.speed * deltaTime / 14)
  }));
  
  // 3. 检查敌人到达基地
  const reachedEnemies = newState.enemies.filter(e => e.progress >= 1);
  reachedEnemies.forEach(enemy => {
    newState.baseHP -= enemy.damage;
  });
  newState.enemies = newState.enemies.filter(e => e.progress < 1);
  
  // 4. 单位攻击
  newState.units.forEach(unit => {
    if (unit.attack > 0 && now - unit.lastAttackTime > unit.attackSpeed * 1000 * newState.attackSpeedMultiplier) {
      const target = findNearestEnemy(unit, newState.enemies);
      if (target) {
        target.hp -= unit.attack;
        unit.lastAttackTime = now;
        
        // 吸血模式
        if (newState.vampireMode && target.hp <= 0) {
          newState.baseHP = Math.min(newState.maxBaseHP, newState.baseHP + newState.maxBaseHP * 0.01);
        }
        
        // 移除死亡的敌人
        newState.enemies = newState.enemies.filter(e => e.hp > 0);
      }
    }
  });
  
  // 5. 检查基地血量
  if (newState.baseHP <= 0) {
    newState.status = 'defeat';
  }
  
  // 6. 检查波次结束
  if (newState.enemies.length === 0 && newState.status === 'playing') {
    if (newState.wave >= newState.totalWaves) {
      if (newState.stage >= newState.totalStages) {
        newState.status = 'victory';
      } else {
        newState.status = 'stageEnd'; // 选择Buff
      }
    } else {
      newState.status = 'waveEnd';
      newState.wave += 1;
    }
  }
  
  return newState;
}

function findNearestEnemy(unit: Unit, enemies: Enemy[]): Enemy | null {
  const nearbyEnemies = enemies.filter(e => {
    const rowDist = Math.abs(e.row - unit.row);
    const colDist = Math.abs(e.progress * 14 - unit.col);
    return rowDist <= 1 && colDist <= unit.range;
  });
  
  if (nearbyEnemies.length === 0) return null;
  
  return nearbyEnemies.reduce((nearest, enemy) =>
    enemy.progress > nearest.progress ? enemy : nearest
  );
}

export function deployUnit(state: GameState, unit: Unit): GameState {
  const cost = UNIT_CONFIG[unit.type].cost * state.costMultiplier;
  
  if (state.gold < cost) {
    return state; // 金币不足
  }
  
  // 应用HP倍数
  const enhancedUnit = {
    ...unit,
    maxHP: unit.maxHP * state.hpMultiplier,
    hp: unit.hp * state.hpMultiplier
  };
  
  return {
    ...state,
    gold: state.gold - cost,
    units: [...state.units, enhancedUnit]
  };
}

export function selectBuff(state: GameState, buffId: string, playerId: string): GameState {
  const newState = { ...state };
  
  newState.buffs.push({ id: buffId, name: buffId, selectedBy: playerId });
  
  // 应用Buff效果
  switch (buffId) {
    case 'golden-age':
      newState.goldMultiplier *= 1.5;
      break;
    case 'discount':
      newState.costMultiplier *= 0.8;
      break;
    case 'fortress':
      newState.hpMultiplier *= 1.3;
      break;
    case 'rapid-fire':
      newState.attackSpeedMultiplier *= 0.75; // 更快攻击（数值越小越快）
      break;
    case 'vampire':
      newState.vampireMode = true;
      break;
    case 'time-warp':
      newState.timeWarpMode = true;
      break;
  }
  
  // 进入下一关
  newState.stage += 1;
  newState.wave = 1;
  newState.status = 'waiting';
  
  return newState;
}
