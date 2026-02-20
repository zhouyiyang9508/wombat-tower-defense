// 完整的单位配置（客户端）
export const UNIT_DATA = {
  // 经济类 💰
  'worker': { 
    name: '👷 农民', 
    cost: 50, 
    desc: '生产5金币/秒',
    category: 'economy'
  },
  'gold-mine': { 
    name: '⛏️ 金矿', 
    cost: 200, 
    desc: '生产20金币/秒，高产',
    category: 'economy'
  },
  
  // 攻击类 ⚔️
  'archer': { 
    name: '🏹 弓箭手', 
    cost: 100, 
    desc: '基础远程，射程3',
    category: 'attack'
  },
  'cannon': { 
    name: '💣 炮塔', 
    cost: 200, 
    desc: '高伤害，射程2',
    category: 'attack'
  },
  'sniper': { 
    name: '🎯 狙击手', 
    cost: 300, 
    desc: '超远射程5，高伤害',
    category: 'attack'
  },
  'machine-gun': { 
    name: '🔫 机枪', 
    cost: 150, 
    desc: '快速扫射，射程2',
    category: 'attack'
  },
  'laser': { 
    name: '🔴 激光塔', 
    cost: 350, 
    desc: '穿透攻击，射程4',
    category: 'attack'
  },
  
  // 控制类 🧊
  'ice': { 
    name: '❄️ 冰冻塔', 
    cost: 150, 
    desc: '减速50%，射程3',
    category: 'control'
  },
  'electric': { 
    name: '⚡ 电磁塔', 
    cost: 250, 
    desc: '眩晕2秒，射程2',
    category: 'control'
  },
  'poison': { 
    name: '☠️ 毒塔', 
    cost: 180, 
    desc: '中毒持续伤害，射程3',
    category: 'control'
  },
  'glue': { 
    name: '🍯 胶水塔', 
    cost: 120, 
    desc: '黏住减速70%，射程2',
    category: 'control'
  },
  
  // 特殊类 ✨
  'wall': { 
    name: '🧱 墙', 
    cost: 50, 
    desc: '500血量肉盾',
    category: 'special'
  },
  'bomb': { 
    name: '💥 炸弹', 
    cost: 100, 
    desc: '5秒后爆炸，AOE 200伤害',
    category: 'special'
  },
  'mine': { 
    name: '💎 地雷', 
    cost: 80, 
    desc: '敌人接触爆炸，150伤害',
    category: 'special'
  },
  'healer': { 
    name: '💚 治疗塔', 
    cost: 150, 
    desc: '治疗周围塔，5HP/秒',
    category: 'special'
  },
  
  // 辅助类 🌟
  'aura-damage': { 
    name: '🔥 伤害光环', 
    cost: 200, 
    desc: '周围塔+50%攻击',
    category: 'support'
  },
  'aura-speed': { 
    name: '⏱️ 速度光环', 
    cost: 180, 
    desc: '周围塔+30%射速',
    category: 'support'
  },
  'aura-range': { 
    name: '🎯 射程光环', 
    cost: 160, 
    desc: '周围塔+1射程',
    category: 'support'
  }
};

export const UNIT_CATEGORIES = {
  economy: { name: '💰 经济', color: '#f1c40f' },
  attack: { name: '⚔️ 攻击', color: '#e74c3c' },
  control: { name: '🧊 控制', color: '#3498db' },
  special: { name: '✨ 特殊', color: '#9b59b6' },
  support: { name: '🌟 辅助', color: '#2ecc71' }
};
