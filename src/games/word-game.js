const WORDS = {
  4: [
    { word: "ATOM", hint: "Basic unit of matter" },
    { word: "BLUE", hint: "Color of the clear sky" },
    { word: "CORE", hint: "The central processing part" },
    { word: "DATA", hint: "Information processed by computers" },
    { word: "ECHO", hint: "A reflection of sound" },
    { word: "FLUX", hint: "State of continuous change" },
    { word: "GRID", hint: "A network of intersecting lines" },
    { word: "HALO", hint: "A circle of light" },
    { word: "BYTE", hint: "A unit of digital information" },
    { word: "JUMP", hint: "Move quickly off the ground" }
  ],
  5: [
    { word: "AMBER", hint: "Fossilized tree resin" },
    { word: "BLAST", hint: "A destructive wave of energy" },
    { word: "CLOUD", hint: "A visible mass of condensed water" },
    { word: "DIGIT", hint: "A single numerical symbol" },
    { word: "ETHER", hint: "The upper regions of space" },
    { word: "FROST", hint: "A deposit of small white ice crystals" },
    { word: "GHOST", hint: "An apparition or trace" },
    { word: "HYPER", hint: "Overly energetic or active" },
    { word: "IMAGE", hint: "A representation of external form" },
    { word: "LASER", hint: "An intense beam of light" }
  ],
  6: [
    { word: "NEBULA", hint: "A cloud of gas and dust in space" },
    { word: "COSMOS", hint: "The universe as a well-ordered whole" },
    { word: "GALAXY", hint: "A system of millions of stars" },
    { word: "SERVER", hint: "A computer managing network resources" },
    { word: "ROUTER", hint: "A device forwarding data packets" },
    { word: "MATRIX", hint: "An environment in which something develops" },
    { word: "VECTOR", hint: "Quantity with direction and magnitude" },
    { word: "BINARY", hint: "Base 2 numerical system" },
    { word: "SYSTEM", hint: "A set of connected parts forming a whole" },
    { word: "PORTAL", hint: "A doorway or entrance" }
  ]
};

export class WordGame {
  constructor(container, wordLength = 6) {
    this.container = container;
    this.wordLength = wordLength;
    this.maxGuesses = 6;
    this.currentGuess = "";
    this.guesses = [];
    const pool = WORDS[this.wordLength];
    const selected = pool[Math.floor(Math.random() * pool.length)];
    this.targetWord = selected.word.toUpperCase();
    this.targetHint = selected.hint;
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
        <p style="margin-bottom: 0.5rem; color: #666; font-size: 0.9rem;">Level: ${this.wordLength === 4 ? 'Novice' : (this.wordLength === 5 ? 'Pro' : 'Expert')}</p>
        <div style="margin-bottom: 2rem; padding: 0.75rem 1rem; background: rgba(0, 255, 76, 0.05); border-left: 3px solid var(--accent-color); border-radius: 0 4px 4px 0; max-width: 400px; margin-left: auto; margin-right: auto; text-align: left;">
          <p style="color: var(--accent-color); font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin-bottom: 0.25rem;">System Hint</p>
          <p style="color: #ddd; font-style: italic; font-size: 0.95rem;">"${this.targetHint}"</p>
        </div>
        
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
