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
              <h3>🏗️ 单位类型（共18种！）</h3>
              
              <h4>💰 经济类</h4>
              <ul>
                <li><strong>👷 农民 (50💰)</strong>: 生产5金币/秒</li>
                <li><strong>⛏️ 金矿 (200💰)</strong>: 生产20金币/秒，高产</li>
              </ul>

              <h4>⚔️ 攻击类</h4>
              <ul>
                <li><strong>🏹 弓箭手 (100💰)</strong>: 基础远程，射程3</li>
                <li><strong>💣 炮塔 (200💰)</strong>: 高伤害，射程2</li>
                <li><strong>🎯 狙击手 (300💰)</strong>: 超远射程5，高伤害</li>
                <li><strong>🔫 机枪 (150💰)</strong>: 快速扫射</li>
                <li><strong>🔴 激光塔 (350💰)</strong>: 穿透攻击全部敌人</li>
              </ul>

              <h4>🧊 控制类</h4>
              <ul>
                <li><strong>❄️ 冰冻塔 (150💰)</strong>: 减速50%</li>
                <li><strong>⚡ 电磁塔 (250💰)</strong>: 眩晕2秒</li>
                <li><strong>☠️ 毒塔 (180💰)</strong>: 中毒持续伤害</li>
                <li><strong>🍯 胶水塔 (120💰)</strong>: 黏住减速70%</li>
              </ul>

              <h4>✨ 特殊类</h4>
              <ul>
                <li><strong>🧱 墙 (50💰)</strong>: 500血量肉盾</li>
                <li><strong>💥 炸弹 (100💰)</strong>: 5秒后爆炸，200伤害</li>
                <li><strong>💎 地雷 (80💰)</strong>: 敌人接触爆炸，150伤害</li>
                <li><strong>💚 治疗塔 (150💰)</strong>: 治疗周围塔，5HP/秒</li>
              </ul>

              <h4>🌟 辅助类（光环）</h4>
              <ul>
                <li><strong>🔥 伤害光环 (200💰)</strong>: 周围塔+50%攻击</li>
                <li><strong>⏱️ 速度光环 (180💰)</strong>: 周围塔+30%射速</li>
                <li><strong>🎯 射程光环 (160💰)</strong>: 周围塔+1射程</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>🀄 麻将组合系统</h3>
              <p>相同类型的塔相邻摆放可获得加成！</p>
              <ul>
                <li><strong>3连（3个相邻）</strong>: +20% 效果</li>
                <li><strong>5连（5个相邻）</strong>: +50% 效果</li>
                <li><strong>8连（8个相邻）</strong>: +100% 效果（翻倍！）</li>
              </ul>
              <p>组合塔会显示 ✨ 特效，升级时可看到加成数值！</p>
            </div>

            <div className="info-section">
              <h3>💡 战术组合</h3>
              <ul>
                <li><strong>经济爆发</strong>: 3-4个金矿组合 → 超高产出</li>
                <li><strong>炮塔阵</strong>: 5-8个炮塔 → 伤害爆炸</li>
                <li><strong>光环核心</strong>: 伤害光环+速度光环 → 周围塔双加成</li>
                <li><strong>治疗墙</strong>: 墙+治疗塔 → 不死防线</li>
                <li><strong>地雷阵</strong>: 一排地雷 → Boss克星</li>
                <li><strong>控制链</strong>: 冰冻+胶水+电磁 → 敌人走不动</li>
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
