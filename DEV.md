# Wombat Tower Defense - 开发文档

## 📋 项目概览

这是一个**双人实时合作塔防游戏**，专为异地情侣设计。核心特点：

- **真·双人合作**：两个玩家共享金币、基地血量，必须配合才能通关
- **服务器端逻辑**：防作弊，所有游戏状态在服务器计算
- **Rogue-like 元素**：18 个 Buff（含赌博/诅咒）+ 12 种随机事件
- **无需游戏引擎**：纯 Web 技术（React + Socket.IO）

**开发时长**：约 4 小时（2026-02-20 ~ 2026-02-21）

**仓库**：https://github.com/zhouyiyang9508/wombat-tower-defense

---

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript** + **Vite**
- **Socket.IO Client**（实时通信）
- **CSS Grid**（地图布局）
- **Web Audio API**（合成音效，无需音频文件）

### 后端
- **Node.js** + **Express** + **TypeScript**
- **Socket.IO Server**（30fps 游戏循环）
- 服务器端游戏状态管理

### 部署
- **生产模式**：后端 serve 前端静态文件（单端口 18080）
- **开发模式**：前端 5173 + 后端 18080 分离

---

## 📁 项目结构

```
wombat-tower-defense/
├── client/                      # 前端（React）
│   ├── src/
│   │   ├── components/          # UI 组件
│   │   │   ├── Game.tsx         # 🎯 主游戏组件（核心）
│   │   │   ├── GameBoard.tsx    # 地图网格
│   │   │   ├── BuffSelect.tsx   # Buff 选择界面
│   │   │   ├── RandomEventNotification.tsx  # 随机事件通知
│   │   │   ├── AvatarPicker.tsx # 头像选择器
│   │   │   ├── DifficultySelect.tsx # 难度选择
│   │   │   └── GameInfo.tsx     # 游戏帮助说明
│   │   ├── data/
│   │   │   └── units.ts         # 📊 单位数据配置
│   │   ├── types/
│   │   │   └── buffs.ts         # 🎁 Buff 数据配置
│   │   ├── utils/
│   │   │   └── sound.ts         # 🔊 音效管理器
│   │   └── App.tsx              # 根组件（房间管理）
│   └── dist/                    # 构建产物（npm run build）
│
├── server/                      # 后端（Socket.IO）
│   ├── src/
│   │   ├── index.ts             # 🌐 服务器入口 + Socket.IO 事件
│   │   └── game-state.ts        # 🎮 核心游戏逻辑（最重要！）
│   └── dist/                    # 编译产物（npm run build）
│       └── public/              # 前端静态文件（生产部署）
│
└── README.md                    # 用户文档
```

---

## 🔑 关键文件详解

### 1. `server/src/game-state.ts` ⭐⭐⭐⭐⭐
**最重要的文件！** 包含所有游戏逻辑：

- **游戏状态管理**：`GameState` 接口（金币、血量、波次、Buff 等）
- **单位配置**：`UNIT_CONFIG`（18 种单位的属性）
- **敌人配置**：`ENEMY_CONFIG`（3 种敌人）
- **难度配置**：`DIFFICULTY_CONFIG`（简单/正常/困难）
- **核心函数**：
  - `updateGameState()`：30fps 游戏循环，处理攻击、移动、金币产出
  - `spawnWave()`：生成敌人 + 触发随机事件
  - `selectBuff()`：应用 Buff 效果
  - `deployUnit()`：部署单位
  - `upgradeUnit()`：单位升级

**修改游戏平衡性？→ 改这个文件！**

### 2. `client/src/components/Game.tsx` ⭐⭐⭐⭐
前端主游戏组件：

- Socket.IO 事件监听（`game-state-update`）
- 单位选择 + 部署逻辑
- 音效触发
- UI 渲染（按钮、状态栏、波次控制）

### 3. `client/src/data/units.ts` ⭐⭐⭐
前端单位数据（名称、描述、emoji）

**注意**：这里只是 UI 显示数据，真实属性在 `server/src/game-state.ts` 的 `UNIT_CONFIG`

### 4. `client/src/types/buffs.ts` ⭐⭐⭐
18 个 Buff 的配置：

- 标准 Buff（12 个）
- 赌博 Buff（3 个）：梭哈、狂暴、贪婪
- 诅咒 Buff（3 个）：贫穷、脆弱、迟缓

### 5. `server/src/index.ts` ⭐⭐⭐
Socket.IO 服务器：

- 房间管理（创建/加入/准备）
- 游戏循环（30fps `setInterval`）
- 事件转发（部署、出兵、Buff 选择）
- 生产环境静态文件服务

---

## 🎨 如何修改常见功能

### 调整单位属性（攻击力、血量、成本）

**文件**：`server/src/game-state.ts`

找到 `UNIT_CONFIG`：

```typescript
export const UNIT_CONFIG: Record<UnitType, any> = {
  'archer': { 
    cost: 100,        // 建造成本
    hp: 80,           // 血量
    attack: 15,       // 攻击力
    attackSpeed: 1,   // 攻速（秒）
    range: 3          // 射程
  },
  // ...
};
```

修改后：
1. `cd server && npm run build`
2. 重启服务器

### 添加新的 Buff

**步骤**：

1. **前端**（`client/src/types/buffs.ts`）添加配置：
```typescript
{
  id: 'super-buff',
  name: '超级增幅',
  emoji: '⚡',
  category: 'defense',
  rarity: 'legendary',
  description: '攻击力 +200%',
  effect: (state) => ({ ...state, damageMultiplier: 3.0 })
}
```

2. **后端**（`server/src/game-state.ts`）添加应用逻辑：

在 `selectBuff()` 函数的 `switch` 中添加：
```typescript
case 'super-buff':
  newState.damageMultiplier *= 3.0;
  break;
```

3. **更新 GameState 接口**（如果需要新字段）

4. 重新构建 + 部署

### 调整游戏难度

**文件**：`server/src/game-state.ts`

```typescript
export const DIFFICULTY_CONFIG = {
  easy: { 
    baseHP: 150,              // 基地血量
    gold: 800,                // 初始金币
    enemyHPMultiplier: 0.7,   // 敌人血量倍数
    goldMultiplier: 1.4       // 产金倍数
  },
  normal: { baseHP: 100, gold: 500, enemyHPMultiplier: 1.0, goldMultiplier: 1.0 },
  hard: { baseHP: 80, gold: 300, enemyHPMultiplier: 1.5, goldMultiplier: 0.6 }
};
```

### 修改 UI 样式

**文件**：`client/src/components/*.css`

例如调整格子大小（`GameBoard.css`）：
```css
.cell {
  width: 60px;   /* 格子宽度 */
  height: 60px;  /* 格子高度 */
}

.unit-emoji {
  font-size: 1.8em;  /* 单位图标大小 */
}
```

### 添加新的随机事件

**文件**：`server/src/game-state.ts`

找到 `RANDOM_EVENTS` 数组，添加新事件：
```typescript
{ 
  id: 'meteor', 
  title: '☄️ 陨石雨', 
  description: '所有塔和敌人受到 20 点伤害', 
  type: 'neutral' as const, 
  effect: (state: GameState) => ({
    ...state,
    units: state.units.map(u => ({ ...u, hp: Math.max(1, u.hp - 20) })),
    enemies: state.enemies.map(e => ({ ...e, hp: e.hp - 20 }))
  })
}
```

---

## 🚀 开发 & 部署流程

### 本地开发

```bash
# 1. 启动后端（开发模式）
cd server
npm install
npm run dev   # 监听 18080

# 2. 启动前端（新终端）
cd client
npm install
npm run dev   # 监听 5173

# 3. 访问 http://localhost:5173
```

### 生产部署

```bash
# 1. 构建前端
cd client
npm run build   # 生成 dist/

# 2. 构建后端
cd ../server
npm run build   # 生成 dist/

# 3. 复制前端文件到后端
cp -r ../client/dist/* dist/public/

# 4. 启动生产服务器
NODE_ENV=production npm start   # 监听 18080

# 访问 http://YOUR_SERVER_IP:18080
```

### Git 提交

```bash
git add -A
git commit -m "feat: 描述你的改动"
git push origin master
```

---

## 🎮 游戏平衡性调整指南

### 游戏太难？

1. **增加初始金币**（`DIFFICULTY_CONFIG.normal.gold`：500 → 800）
2. **降低敌人血量**（`DIFFICULTY_CONFIG.normal.enemyHPMultiplier`：1.0 → 0.8）
3. **增加基地血量**（`DIFFICULTY_CONFIG.normal.baseHP`：100 → 150）
4. **降低单位成本**（`UNIT_CONFIG.*.cost` 统一 ×0.8）

### 游戏太简单？

1. **减少初始金币**（500 → 300）
2. **增加敌人血量**（1.0 → 1.3）
3. **减少金币产出**（`goldMultiplier` 1.0 → 0.7）
4. **增加敌人数量**（`spawnWave()` 中的 `baseCount` 公式）

### 某个单位太强/太弱？

**示例**：狙击塔太强

```typescript
// 调整前
'sniper': { cost: 300, attack: 100, attackSpeed: 3, range: 5 }

// 调整后（降低攻击力，增加成本）
'sniper': { cost: 350, attack: 80, attackSpeed: 3, range: 5 }
```

### Buff 失衡？

在 `selectBuff()` 中调整倍数：

```typescript
// 调整前：梭哈 buff
case 'all-in':
  newState.damageMultiplier *= 2.0;  // 太强了！
  newState.maxBaseHP *= 0.7;

// 调整后
case 'all-in':
  newState.damageMultiplier *= 1.5;  // 改为 +50%
  newState.maxBaseHP *= 0.7;
```

---

## 🐛 已知问题 & 解决方案

### 1. 服务器重启导致游戏中断

**现状**：更新代码需要重启服务器，正在进行的游戏会被中断

**临时方案**：
- 在游戏间隙更新
- 提前通知玩家

**未来改进**：
- 使用 PM2 零停机重启
- 或者迁移到持久化存储（Redis）+ 多进程

### 2. 端口 18080 可能被防火墙拦截

**症状**：本地能访问，外部访问超时

**解决**：在云服务器控制台（腾讯云/阿里云）安全组开放 `TCP:18080`

### 3. 音效在某些浏览器不工作

**原因**：浏览器自动播放策略要求用户交互后才能播放

**现状**：已在用户点击后初始化音效管理器

### 4. 移动端体验待优化

**现状**：已支持响应式布局，但触控体验还需优化

**建议**：
- 增大按钮点击区域
- 优化单位选择流程（移动端长按？）

---

## 🤖 给 AI Agent 的提示

### 如果你是接手这个项目的 AI：

1. **先读这个文件**（DEV.md），了解整体架构
2. **重点关注**：`server/src/game-state.ts`（核心逻辑）
3. **修改游戏平衡性**：只需改 `UNIT_CONFIG` / `ENEMY_CONFIG` / `DIFFICULTY_CONFIG`
4. **添加新功能**：
   - 前端：`client/src/components/`
   - 后端：`server/src/index.ts`（Socket 事件）+ `game-state.ts`（逻辑）
5. **部署**：记住三步（构建前端 → 构建后端 → 复制文件）

### 常见任务快速索引

| 任务 | 文件位置 |
|------|---------|
| 调整单位属性 | `server/src/game-state.ts` → `UNIT_CONFIG` |
| 修改难度 | `server/src/game-state.ts` → `DIFFICULTY_CONFIG` |
| 添加 Buff | `client/src/types/buffs.ts` + `server/src/game-state.ts` → `selectBuff()` |
| 添加随机事件 | `server/src/game-state.ts` → `RANDOM_EVENTS` |
| 修改 UI | `client/src/components/*.tsx` + `*.css` |
| 调整音效 | `client/src/utils/sound.ts` |
| 改变游戏节奏 | `server/src/game-state.ts` → `spawnWave()` |

### 调试技巧

1. **查看游戏状态**：浏览器控制台会打印 `game-state-update`
2. **服务器日志**：后端终端会显示连接/房间/游戏事件
3. **健康检查**：访问 `http://localhost:18080/health`

### 安全注意事项

- ✅ 游戏逻辑在服务器端（防作弊）
- ✅ 成本计算在服务器验证
- ⚠️ 没有用户认证（适合私人部署，不适合公开服务）
- ⚠️ 没有持久化存储（重启清空所有房间）

---

## 📊 性能指标

- **游戏循环**：30fps（每 33ms 更新一次）
- **网络延迟**：通常 <50ms（局域网）/ <200ms（跨地区）
- **并发支持**：单进程约 20-30 个房间（每房间 2 人）
- **内存占用**：~50MB（空闲）/ ~100MB（10 个活跃游戏）

---

## 📚 参考资源

- **Socket.IO 文档**：https://socket.io/docs/v4/
- **React 文档**：https://react.dev/
- **TypeScript 文档**：https://www.typescriptlang.org/docs/
- **Web Audio API**：https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## 🎯 未来改进方向

1. **持久化**：Redis 存储游戏状态（支持重启恢复）
2. **排行榜**：记录最快通关时间
3. **更多关卡**：当前 3 个 stage，可扩展到 10+
4. **更多单位/敌人**：当前 18 个单位 + 3 种敌人
5. **音效升级**：使用真实音频文件（当前合成音效）
6. **观战模式**：支持第三方观看
7. **重播系统**：保存游戏回放
8. **AI 对手**：单人模式 + 电脑队友

---

**最后更新**：2026-02-21  
**维护者**：代码熊 🐻  
**联系方式**：通过 GitHub Issues 或 Discord

---

祝你接手顺利！如果有问题，检查这个文件 + `server/src/game-state.ts`，90% 的答案都在那里 😊
