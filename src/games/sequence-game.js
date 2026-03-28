export class SequenceGame {
  constructor(container, difficulty = 0) {
    this.container = container;
    this.sequence = [];
    this.userSequence = [];
    this.level = 0;
    this.playingSequence = false;
    this.colors = ['#00f2ff', '#ff00ea', '#00ff4c', '#ffea00'];
    this.speed = 500 - (difficulty * 100); // Higher difficulty = faster
    this.gameOver = false;
    this.message = "";
  }

  destroy() {
    this.playingSequence = false;
    this.gameOver = true;
  }

  static getInstructions() {
    return `
      <h2 style="color: var(--accent-tertiary); margin-bottom: 1rem;">Neon Sequence Guide</h2>
      <p style="margin-bottom: 1rem; line-height: 1.6;">Synchronize your mind with the <b>NEURAL PATTERN</b>.</p>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 0.5rem;">🧠 Watch the pads flash in a specific order.</li>
        <li style="margin-bottom: 0.5rem;">🧠 Repeat the sequence exactly by clicking the pads.</li>
        <li style="margin-bottom: 0.5rem;">🧠 Speed increases each level. Don't lose focus!</li>
      </ul>
    `;
  }

  init() {
    this.level = 0;
    this.sequence = [];
    this.gameOver = false;
    this.nextLevel();
  }

  nextLevel() {
    if (this.gameOver) return;
    this.level++;
    this.userSequence = [];
    this.sequence.push(Math.floor(Math.random() * 4));
    this.render();
    setTimeout(() => this.playSequence(), 1000);
  }

  async playSequence() {
    if (this.gameOver) return;
    this.playingSequence = true;
    for (let i = 0; i < this.sequence.length; i++) {
      if (this.gameOver) break;
      const index = this.sequence[i];
      await this.flashPad(index);
      await this.wait(this.speed / 2);
    }
    this.playingSequence = false;
  }

  flashPad(index) {
    return new Promise(resolve => {
      const pad = this.container.querySelector(`.pad[data-index="${index}"]`);
      if (!pad) return resolve();
      pad.classList.add('active');
      setTimeout(() => {
        pad.classList.remove('active');
        resolve();
      }, this.speed);
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handlePadClick(index) {
    if (this.playingSequence || this.gameOver) return;
    
    this.userSequence.push(index);
    const lastIdx = this.userSequence.length - 1;

    if (this.userSequence[lastIdx] !== this.sequence[lastIdx]) {
      this.gameOver = true;
      this.message = `NEURAL SYNC LOST. LEVEL: ${this.level}`;
      this.render();
      return;
    }

    if (this.userSequence.length === this.sequence.length) {
      setTimeout(() => this.nextLevel(), 500);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="sequence-game fade-in">
        <h2 style="margin-bottom: 0.5rem; color: var(--accent-tertiary);">NEON SEQUENCE</h2>
        <p style="margin-bottom: 2rem; color: #666; font-size: 0.9rem;">Neural Link Level: ${this.level}</p>
        
        <div class="pads-grid">
          ${[0, 1, 2, 3].map(i => `<div class="pad" data-index="${i}" style="--pad-color: ${this.colors[i]}"></div>`).join('')}
        </div>

        ${this.gameOver ? `
          <div class="win-screen fade-in" style="margin-top: 2rem; padding: 1.5rem; background: rgba(255, 0, 50, 0.05); border: 1px solid var(--accent-tertiary); border-radius: 8px;">
            <h3 style="color: var(--accent-tertiary); margin-bottom: 0.5rem;">${this.message}</h3>
            <button class="btn-primary" style="margin-top: 1rem;" onclick="window.dispatchEvent(new CustomEvent('restart-game'))">REBOOT SYSTEM</button>
          </div>
        ` : `
          <button class="btn-primary" style="margin-top: 2rem; background: none; border: 1px solid var(--glass-border);" onclick="window.dispatchEvent(new CustomEvent('restart-game'))">REBOOT SYSTEM</button>
        `}
      </div>
    `;

    this.container.querySelectorAll('.pad').forEach(pad => {
      pad.addEventListener('click', () => this.handlePadClick(parseInt(pad.dataset.index)));
    });
  }
}
