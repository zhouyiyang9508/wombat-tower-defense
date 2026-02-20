import { useState } from 'react';
import './GameInfo.css';

export function GameInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="info-button" onClick={() => setIsOpen(true)}>
        ❓ 帮助
      </button>

      {isOpen && (
        <div className="info-overlay" onClick={() => setIsOpen(false)}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="info-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
            
            <h2>🎮 游戏说明</h2>
            
            <div className="info-section">
              <h3>🎯 游戏目标</h3>
              <p>部署防御单位阻止敌人到达基地，守住基地血量，完成所有关卡！</p>
            </div>

            <div className="info-section">
              <h3>🏗️ 单位类型</h3>
              <ul>
                <li><strong>👷 农民 (50金币)</strong>: 每秒生产5金币，是经济的基础</li>
                <li><strong>🏹 弓箭手 (100金币)</strong>: 远程攻击单位，射程3格</li>
                <li><strong>💣 炮塔 (200金币)</strong>: 高伤害单位，适合对付坦克僵尸</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>👾 敌人类型</h3>
              <ul>
                <li><strong>🧟 僵尸</strong>: 速度快，血量低</li>
                <li><strong>🛡️ 坦克</strong>: 速度慢，血量高</li>
                <li><strong>👹 Boss</strong>: 超高血量，会召唤小怪</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>🎁 Buff系统</h3>
              <p>每完成一个关卡（10波），可以选择一个Buff增强能力：</p>
              <ul>
                <li><strong>💰 黄金时代</strong>: 农民产出 +50%</li>
                <li><strong>🏷️ 节俭专家</strong>: 所有单位成本 -20%</li>
                <li><strong>🛡️ 铜墙铁壁</strong>: 防御塔血量 +30%</li>
                <li><strong>⚡ 狂热射手</strong>: 射速 +25%</li>
                <li><strong>🩸 吸血鬼</strong>: 击杀敌人恢复基地1%血量</li>
                <li><strong>⏰ 时间扭曲</strong>: 每波开始怪物减速</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>😊 难度说明</h3>
              <ul>
                <li><strong>甜蜜双排</strong>: 怪物血量-30%, 金币+60% (适合休闲)</li>
                <li><strong>正常模式</strong>: 平衡体验</li>
                <li><strong>硬核模式</strong>: 怪物血量+50%, 金币-40% (挑战极限)</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>🤝 双人合作技巧</h3>
              <ul>
                <li>共享金币池，需要配合决策</li>
                <li>一人专注经济（造农民），一人专注防御</li>
                <li>或者双人平衡发展</li>
                <li>部署前有确认机制，避免抢资源</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>⌨️ 操作说明</h3>
              <ul>
                <li>点击底部单位按钮选择要部署的单位</li>
                <li>点击地图空格子部署单位</li>
                <li>点击"开始波次"按钮生成敌人</li>
                <li>单位会自动攻击范围内的敌人</li>
                <li>农民会自动生产金币</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
