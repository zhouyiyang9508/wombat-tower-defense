// 简单的音效系统（使用Web Audio API）

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.3;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio context not supported');
    }
  }

  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 部署单位音效
  deploy() {
    this.playTone(600, 0.1);
    setTimeout(() => this.playTone(800, 0.1), 50);
  }

  // 攻击音效
  attack() {
    this.playTone(300, 0.05, 0.2);
  }

  // 金币获得音效
  coin() {
    this.playTone(1000, 0.05);
    setTimeout(() => this.playTone(1200, 0.05), 30);
  }

  // 敌人死亡音效
  enemyDeath() {
    this.playTone(200, 0.2, 0.15);
  }

  // 波次开始音效
  waveStart() {
    this.playTone(400, 0.1);
    setTimeout(() => this.playTone(500, 0.1), 50);
    setTimeout(() => this.playTone(600, 0.15), 100);
  }

  // 胜利音效
  victory() {
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.3), i * 150);
    });
  }

  // 失败音效
  defeat() {
    const notes = [400, 350, 300, 250];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2), i * 100);
    });
  }

  // Boss出现音效
  bossAppear() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(100 + i * 20, 0.1, 0.3), i * 100);
    }
  }

  // 切换音效开关
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // 设置音量
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
