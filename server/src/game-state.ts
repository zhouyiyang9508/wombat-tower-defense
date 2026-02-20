// 游戏状态管理（服务器端）

export type UnitType = 
  // 经济类
  'worker' | 'gold-mine' | 
  // 攻击类
  'archer' | 'cannon' | 'sniper' | 'machine-gun' | 'laser' |
  // 控制类
  'ice' | 'electric' | 'poison' | 'glue' |
  // 特殊类
  'wall' | 'bomb' | 'mine' | 'healer' |
  // 辅助类
  'aura-damage' | 'aura-speed' | 'aura-range';

export interface Unit {
  id: string;
  type: UnitType;
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
  ownerId: string;
  // 特效
  slowEffect?: number;
  stunDuration?: number;
  poisonDPS?: number;
  glueDuration?: number;
  // 辅助光环
  damageBonus?: number;
  speedBonus?: number;
  rangeBonus?: number;
  // 特殊
  isWall?: boolean;
  isBomb?: boolean;
  isMine?: boolean;
  healPerSecond?: number;
  // 组合加成
  comboBonus?: number;
}

export interface Enemy {
  id: string;
  type: 'zombie' | 'tank' | 'boss';
  row: number;
  path: number; // 路径ID（0=上路，1=中上路，2=中路，3=中下路，4=下路）
  progress: number;
  hp: number;
  maxHP: number;
  speed: number;
  damage: number;
  slowMultiplier: number; // 减速倍数（1=正常，0.5=减速50%）
  stunnedUntil: number; // 眩晕到何时（timestamp）
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

export const UNIT_CONFIG: Record<UnitType, any> = {
  // 经济类
  'worker': { cost: 50, hp: 50, attack: 0, attackSpeed: 0, range: 0, goldPerSecond: 5 },
  'gold-mine': { cost: 200, hp: 100, attack: 0, attackSpeed: 0, range: 0, goldPerSecond: 20 },
  
  // 攻击类
  'archer': { cost: 100, hp: 80, attack: 15, attackSpeed: 1, range: 3 },
  'cannon': { cost: 200, hp: 120, attack: 50, attackSpeed: 2, range: 2 },
  'sniper': { cost: 300, hp: 60, attack: 100, attackSpeed: 3, range: 5 }, // 高伤远程
  'machine-gun': { cost: 150, hp: 70, attack: 8, attackSpeed: 0.3, range: 2 }, // 快速扫射
  'laser': { cost: 350, hp: 100, attack: 30, attackSpeed: 0.5, range: 4, penetrate: true }, // 穿透
  
  // 控制类
  'ice': { cost: 150, hp: 90, attack: 10, attackSpeed: 1, range: 3, slowEffect: 0.5 },
  'electric': { cost: 250, hp: 100, attack: 0, attackSpeed: 3, range: 2, stunDuration: 2 },
  'poison': { cost: 180, hp: 85, attack: 5, attackSpeed: 1.5, range: 3, poisonDPS: 10 }, // 中毒持续伤害
  'glue': { cost: 120, hp: 80, attack: 0, attackSpeed: 2, range: 2, glueDuration: 3 }, // 黏住减速
  
  // 特殊类
  'wall': { cost: 50, hp: 500, attack: 0, attackSpeed: 0, range: 0, isWall: true }, // 纯肉盾
  'bomb': { cost: 100, hp: 50, attack: 200, attackSpeed: 0, range: 2, isBomb: true }, // 一次性爆炸
  'mine': { cost: 80, hp: 10, attack: 150, attackSpeed: 0, range: 0, isMine: true }, // 地雷
  'healer': { cost: 150, hp: 100, attack: 0, attackSpeed: 1, range: 2, healPerSecond: 5 }, // 治疗
  
  // 辅助类（光环）
  'aura-damage': { cost: 200, hp: 80, attack: 0, attackSpeed: 0, range: 2, damageBonus: 0.5 }, // 周围+50%攻击
  'aura-speed': { cost: 180, hp: 80, attack: 0, attackSpeed: 0, range: 2, speedBonus: 0.3 }, // 周围+30%射速
  'aura-range': { cost: 160, hp: 80, attack: 0, attackSpeed: 0, range: 2, rangeBonus: 1 } // 周围+1射程
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

// 5条路径定义（row值）
const PATHS = [
  0, // 上路
  1, // 中上路
  2, // 中路
  3, // 中下路
  4  // 下路
];

export function spawnWave(state: GameState): GameState {
  const newEnemies: Enemy[] = [];
  const baseCount = 5 + state.wave * 2;
  const enemyCount = Math.floor(baseCount * (state.stage * 0.5 + 0.5));
  
  // Boss关（每个stage的最后一波）
  const isBossWave = state.wave === state.totalWaves;
  
  if (isBossWave) {
    // Boss + 小怪
    const bossPath = Math.floor(Math.random() * 5);
    newEnemies.push({
      id: `boss-${Date.now()}`,
      type: 'boss',
      row: PATHS[bossPath],
      path: bossPath,
      progress: 0,
      hp: ENEMY_CONFIG.boss.hp * state.stage,
      maxHP: ENEMY_CONFIG.boss.hp * state.stage,
      speed: ENEMY_CONFIG.boss.speed,
      damage: ENEMY_CONFIG.boss.damage,
      slowMultiplier: 1,
      stunnedUntil: 0
    });
    
    // 小怪（多路径进攻）
    for (let i = 0; i < 10; i++) {
      const type = Math.random() > 0.5 ? 'tank' : 'zombie';
      const config = ENEMY_CONFIG[type];
      const pathIndex = Math.floor(Math.random() * 5);
      
      newEnemies.push({
        id: `enemy-${Date.now()}-${i}`,
        type,
        row: PATHS[pathIndex],
        path: pathIndex,
        progress: Math.random() * 0.3, // 分散出生
        hp: config.hp * DIFFICULTY_CONFIG[state.difficulty].enemyHPMultiplier,
        maxHP: config.hp * DIFFICULTY_CONFIG[state.difficulty].enemyHPMultiplier,
        speed: config.speed,
        damage: config.damage,
        slowMultiplier: 1,
        stunnedUntil: 0
      });
    }
  } else {
    // 普通波次（多路径随机）
    for (let i = 0; i < enemyCount; i++) {
      const type = Math.random() > 0.7 ? 'tank' : 'zombie';
      const config = ENEMY_CONFIG[type];
      const pathIndex = Math.floor(Math.random() * 5);
      
      newEnemies.push({
        id: `enemy-${Date.now()}-${i}`,
        type,
        row: PATHS[pathIndex],
        path: pathIndex,
        progress: 0,
        hp: config.hp * DIFFICULTY_CONFIG[state.difficulty].enemyHPMultiplier,
        maxHP: config.hp * DIFFICULTY_CONFIG[state.difficulty].enemyHPMultiplier,
        speed: config.speed,
        damage: config.damage,
        slowMultiplier: 1,
        stunnedUntil: 0
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
  
  // 0. 应用光环和组合加成
  newState.units = applyAuraEffects(newState.units);
  
  // 1. 生产金币（农民和金矿）
  newState.units.forEach(unit => {
    if (unit.goldPerSecond) {
      newState.gold += unit.goldPerSecond * deltaTime * newState.goldMultiplier * (1 + (unit.comboBonus || 0));
    }
  });
  
  // 1.5 治疗塔治疗周围单位
  newState.units.forEach(healer => {
    if (healer.healPerSecond) {
      newState.units.forEach(target => {
        if (target.id !== healer.id) {
          const dist = Math.abs(target.row - healer.row) + Math.abs(target.col - healer.col);
          if (dist <= healer.range && target.hp < target.maxHP) {
            target.hp = Math.min(target.maxHP, target.hp + healer.healPerSecond * deltaTime);
          }
        }
      });
    }
  });
  
  // 2. 敌人移动（考虑减速和眩晕）
  newState.enemies = newState.enemies.map(enemy => {
    // 检查是否被眩晕
    if (now < enemy.stunnedUntil) {
      return enemy; // 眩晕中，不移动
    }
    
    // 移动（应用减速效果）
    const effectiveSpeed = enemy.speed * enemy.slowMultiplier;
    return {
      ...enemy,
      progress: Math.min(1, enemy.progress + effectiveSpeed * deltaTime / 14),
      slowMultiplier: Math.min(1, enemy.slowMultiplier + deltaTime * 0.5) // 减速效果衰减
    };
  });
  
  // 3. 检查敌人到达基地
  const reachedEnemies = newState.enemies.filter(e => e.progress >= 1);
  reachedEnemies.forEach(enemy => {
    newState.baseHP -= enemy.damage;
  });
  newState.enemies = newState.enemies.filter(e => e.progress < 1);
  
  // 4. 单位攻击
  newState.units = newState.units.filter(unit => {
    // 地雷检测：敌人接触时爆炸
    if (unit.isMine) {
      const nearbyEnemy = newState.enemies.find(e => 
        e.row === unit.row && Math.abs(e.progress * 14 - unit.col) < 0.5
      );
      if (nearbyEnemy) {
        // 地雷爆炸！范围伤害
        newState.enemies.forEach(e => {
          const dist = Math.sqrt(Math.pow(e.row - unit.row, 2) + Math.pow(e.progress * 14 - unit.col, 2));
          if (dist < 2) {
            e.hp -= unit.attack;
          }
        });
        return false; // 移除地雷
      }
      return true; // 保留地雷
    }
    
    // 炸弹：手动触发或时间到爆炸
    if (unit.isBomb && unit.lastAttackTime > 0 && now - unit.lastAttackTime > 5000) {
      // 5秒后自动爆炸
      newState.enemies.forEach(e => {
        const dist = Math.sqrt(Math.pow(e.row - unit.row, 2) + Math.pow(e.progress * 14 - unit.col, 2));
        if (dist < unit.range) {
          e.hp -= unit.attack;
        }
      });
      return false; // 移除炸弹
    }
    
    // 墙：不攻击，只防御
    if (unit.isWall) {
      return true;
    }
    
    // 光环塔：不直接攻击
    if (unit.damageBonus || unit.speedBonus || unit.rangeBonus) {
      return true;
    }
    
    // 治疗塔：不攻击
    if (unit.healPerSecond) {
      return true;
    }
    
    // 普通攻击塔
    if (now - unit.lastAttackTime > unit.attackSpeed * 1000 * newState.attackSpeedMultiplier) {
      const config = UNIT_CONFIG[unit.type];
      
      // 激光塔：穿透攻击所有敌人在一条线上
      if (config.penetrate) {
        const targets = newState.enemies.filter(e => 
          Math.abs(e.row - unit.row) <= 1 && e.progress * 14 >= unit.col
        );
        targets.forEach(t => {
          t.hp -= unit.attack;
        });
        unit.lastAttackTime = now;
      }
      // 胶水塔：黏住效果
      else if (unit.type === 'glue' && config.glueDuration) {
        const target = findNearestEnemy(unit, newState.enemies);
        if (target) {
          target.slowMultiplier = 0.3; // 减速70%
          target.stunnedUntil = now + config.glueDuration * 1000;
          unit.lastAttackTime = now;
        }
      }
      // 毒塔：中毒持续伤害
      else if (unit.type === 'poison' && config.poisonDPS) {
        const target = findNearestEnemy(unit, newState.enemies);
        if (target) {
          target.hp -= unit.attack;
          // 标记中毒（在敌人数据结构中）
          (target as any).poisonDamage = config.poisonDPS;
          (target as any).poisonUntil = now + 3000; // 持续3秒
          unit.lastAttackTime = now;
        }
      }
      // 冰冻塔
      else if (unit.type === 'ice' && unit.slowEffect) {
        const target = findNearestEnemy(unit, newState.enemies);
        if (target) {
          target.slowMultiplier = Math.min(target.slowMultiplier, unit.slowEffect);
          target.hp -= unit.attack;
          unit.lastAttackTime = now;
        }
      }
      // 电磁塔
      else if (unit.type === 'electric' && unit.stunDuration) {
        const target = findNearestEnemy(unit, newState.enemies);
        if (target) {
          target.stunnedUntil = now + unit.stunDuration * 1000;
          unit.lastAttackTime = now;
        }
      }
      // 普通攻击
      else if (unit.attack > 0) {
        const target = findNearestEnemy(unit, newState.enemies);
        if (target) {
          target.hp -= unit.attack;
          unit.lastAttackTime = now;
          
          if (newState.vampireMode && target.hp <= 0) {
            newState.baseHP = Math.min(newState.maxBaseHP, newState.baseHP + newState.maxBaseHP * 0.01);
          }
        }
      }
    }
    
    return true; // 保留单位
  });
  
  // 应用中毒持续伤害
  newState.enemies.forEach(e => {
    const enemy = e as any;
    if (enemy.poisonDamage && now < enemy.poisonUntil) {
      e.hp -= enemy.poisonDamage * deltaTime;
    }
  });
  
  // 移除死亡的敌人
  newState.enemies = newState.enemies.filter(e => e.hp > 0);
  
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

// 检测麻将组合加成
function calculateComboBonus(unit: Unit, allUnits: Unit[]): number {
  let bonus = 0;
  
  // 查找相邻的相同类型塔
  const adjacentSameType = allUnits.filter(u => {
    if (u.type !== unit.type || u.id === unit.id) return false;
    const rowDist = Math.abs(u.row - unit.row);
    const colDist = Math.abs(u.col - unit.col);
    return (rowDist <= 1 && colDist <= 1); // 8方向相邻
  });
  
  const comboSize = adjacentSameType.length + 1; // 包括自己
  
  // 3连：+20%
  if (comboSize >= 3) {
    bonus += 0.2;
  }
  
  // 5连：再+30%（总+50%）
  if (comboSize >= 5) {
    bonus += 0.3;
  }
  
  // 8连：再+50%（总+100%）
  if (comboSize >= 8) {
    bonus += 0.5;
  }
  
  return bonus;
}

// 应用光环效果
function applyAuraEffects(units: Unit[]): Unit[] {
  return units.map(unit => {
    let damageMultiplier = 1;
    let speedMultiplier = 1;
    let extraRange = 0;
    
    // 查找周围的光环塔
    units.forEach(other => {
      const dist = Math.abs(unit.row - other.row) + Math.abs(unit.col - other.col);
      
      if (other.damageBonus && dist <= (other.range || 2)) {
        damageMultiplier *= (1 + other.damageBonus);
      }
      if (other.speedBonus && dist <= (other.range || 2)) {
        speedMultiplier *= (1 + other.speedBonus);
      }
      if (other.rangeBonus && dist <= (other.range || 2)) {
        extraRange += other.rangeBonus;
      }
    });
    
    // 应用组合加成
    const comboBonus = calculateComboBonus(unit, units);
    damageMultiplier *= (1 + comboBonus);
    
    return {
      ...unit,
      attack: unit.attack * damageMultiplier,
      attackSpeed: unit.attackSpeed / speedMultiplier,
      range: unit.range + extraRange,
      comboBonus
    };
  });
}

export function upgradeUnit(state: GameState, unitId: string): GameState {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit || unit.level >= 3) return state;
  
  const upgradeCost = 100 * unit.level;
  
  if (state.gold < upgradeCost) return state;
  
  unit.level += 1;
  unit.maxHP *= 1.5;
  unit.hp = unit.maxHP;
  unit.attack *= 1.5;
  
  if (unit.goldPerSecond) {
    unit.goldPerSecond *= 1.5;
  }
  
  return {
    ...state,
    gold: state.gold - upgradeCost,
    units: [...state.units]
  };
}
