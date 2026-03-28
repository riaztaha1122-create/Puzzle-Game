const WORDS = {
  4: ["ATOM", "BLUE", "CORE", "DATA", "ECHO", "FLUX", "GRID", "HALO", "IONIC", "JUMP"],
  5: ["AMBER", "BLAST", "CLOUD", "DIGIT", "ETHER", "FROST", "GHOST", "HYPER", "IMAGE", "LASER"],
  6: ["NEBULA", "COSMOS", "GALAXY", "PIXEL", "CYBER", "MATRIX", "VECTOR", "BINARY", "SYSTEM", "ORBIT"]
};

export class WordGame {
  constructor(container, wordLength = 6) {
    this.container = container;
    this.wordLength = wordLength;
    this.maxGuesses = 6;
    this.currentGuess = "";
    this.guesses = [];
    const pool = WORDS[this.wordLength];
    this.targetWord = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
    this.gameOver = false;
    this.message = "";
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  static getInstructions() {
    return `
      <h2 style="color: var(--accent-color); margin-bottom: 1rem;">Cyber Word Guide</h2>
      <p style="margin-bottom: 1rem; line-height: 1.6;">Guess the hidden <b>SYSTEM KEY</b> in 6 tries.</p>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 0.5rem;"><span style="color: #00ff4c;">■</span> <b>Green:</b> Correct letter, correct position.</li>
        <li style="margin-bottom: 0.5rem;"><span style="color: #ffea00;">■</span> <b>Yellow:</b> Correct letter, wrong position.</li>
        <li style="margin-bottom: 0.5rem;"><span style="color: #444;">■</span> <b>Gray:</b> Letter not in the word.</li>
      </ul>
    `;
  }

  init() {
    this.render();
    this._keydownHandler = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this._keydownHandler);
  }

  cleanup() {
    window.removeEventListener('keydown', this._keydownHandler);
  }

  handleKeyDown(e) {
    if (this.gameOver) return;
    if (e.key === 'Backspace') {
      this.currentGuess = this.currentGuess.slice(0, -1);
    } else if (e.key === 'Enter') {
      if (this.currentGuess.length === this.wordLength) {
        this.submitGuess();
      }
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      if (this.currentGuess.length < this.wordLength) {
        this.currentGuess += e.key.toUpperCase();
      }
    }
    this.render();
  }

  submitGuess() {
    const targetArr = this.targetWord.split('');
    const guessArr = this.currentGuess.split('');
    const result = new Array(this.wordLength).fill('absent');
    const usedIndices = new Set();

    // First pass: Correct position
    for (let i = 0; i < this.wordLength; i++) {
        if (guessArr[i] === targetArr[i]) {
            result[i] = 'correct';
            usedIndices.add(i);
        }
    }

    // Second pass: Present in word
    for (let i = 0; i < this.wordLength; i++) {
        if (result[i] === 'correct') continue;
        const foundIndex = targetArr.findIndex((char, idx) => char === guessArr[i] && !usedIndices.has(idx));
        if (foundIndex !== -1) {
            result[i] = 'present';
            usedIndices.add(foundIndex);
        }
    }

    this.guesses.push({ word: this.currentGuess, result });
    
    if (this.currentGuess === this.targetWord) {
      this.gameOver = true;
      this.message = "SYSTEM BREACH SUCCESSFUL!";
    } else if (this.guesses.length === this.maxGuesses) {
      this.gameOver = true;
      this.message = `ACCESS DENIED. ID: ${this.targetWord}`;
    }
    
    this.currentGuess = "";
  }

  render() {
    this.container.innerHTML = `
      <div class="word-game fade-in">
        <h2 style="margin-bottom: 0.5rem; color: var(--accent-color);">CYBER WORD BREACH</h2>
        <p style="margin-bottom: 2rem; color: #666; font-size: 0.9rem;">Level: ${this.wordLength === 4 ? 'Novice' : (this.wordLength === 5 ? 'Pro' : 'Expert')}</p>
        
        <div class="grid" style="gap: 10px;">
          ${this.renderGrid()}
        </div>

        <div class="keyboard" style="margin-top: 2rem; width: 100%;">
          ${this.renderKeyboard()}
        </div>

        ${this.gameOver ? `
          <div class="win-screen fade-in" style="margin-top: 2rem; padding: 1.5rem; background: rgba(0, 255, 76, 0.05); border: 1px solid var(--accent-color); border-radius: 8px;">
            <h3 style="color: var(--accent-color); margin-bottom: 0.5rem;">${this.message}</h3>
            <button class="btn-primary" style="margin-top: 1rem;" onclick="window.dispatchEvent(new CustomEvent('restart-game'))">NEW BREACH</button>
          </div>
        ` : ""}
      </div>
    `;
  }

  renderGrid() {
    let html = "";
    for (let i = 0; i < this.maxGuesses; i++) {
      const guess = this.guesses[i];
      const active = i === this.guesses.length;
      html += `<div class="row" style="gap: 10px;">`;
      for (let j = 0; j < this.wordLength; j++) {
        let char = "";
        let state = "empty";
        if (guess) {
          char = guess.word[j];
          state = guess.result[j];
        } else if (active) {
          char = this.currentGuess[j] || "";
          state = char ? "toggled" : "empty";
        }
        html += `<div class="cell ${state}" style="width: ${this.wordLength === 6 ? '45px' : '55px'}; height: ${this.wordLength === 6 ? '45px' : '55px'};">${char}</div>`;
      }
      html += `</div>`;
    }
    return html;
  }

  renderKeyboard() {
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    return rows.map(row => `
      <div style="display: flex; justify-content: center; gap: 6px; margin-bottom: 6px;">
        ${row.split('').map(char => `<div class="key" style="padding: 12px 10px; min-width: 30px; text-align: center;">${char}</div>`).join('')}
      </div>
    `).join('');
  }
}
