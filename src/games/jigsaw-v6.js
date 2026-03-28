const PICTURE_PATHS = [
  "/assets/jigsaw/puzzle1.jpg",
  "/assets/jigsaw/puzzle2.jpg",
  "/assets/jigsaw/puzzle3.jpg",
  "/assets/jigsaw/puzzle4.jpg",
  "/assets/jigsaw/puzzle5.jpg",
  "/assets/jigsaw/puzzle6.jpg",
  "/assets/jigsaw/puzzle7.jpg",
  "/assets/jigsaw/puzzle8.jpg",
  "/assets/jigsaw/puzzle9.jpg",
  "/assets/jigsaw/puzzle10.jpg",
  "/assets/jigsaw/puzzle11.jpg",
  "/assets/jigsaw/puzzle12.jpg"
];

// Fallback to Unsplash if local assets are missing (during dev/build edge cases)
const FALLBACK_PICTURES = [
  "https://images.unsplash.com/photo-1541339902099-13d44299127d?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531050117355-c22fbb3d8499?q=80&w=1000&auto=format&fit=crop"
];

export class JigsawGame {
  constructor(container, size = 3) {
    this.container = container;
    this.size = size;
    this.imageUrl = this.getSmartRandomImage();
    this.board = Array(size * size).fill(null);
    this.pool = [];
    this.selectedPoolIndex = null;
    this.phase = "loading"; // "loading", "preview", "solving", "won", "error", "destroyed"
    this.timer = null;
    this.piecesInitialized = false;
    console.log("JIGSAW ENGINE V6 - NO ALERTS MODE");
  }

  getSmartRandomImage() {
    const history = JSON.parse(localStorage.getItem('jigsaw_history') || '[]');
    const available = PICTURE_PATHS.filter(p => !history.includes(p));
    const choices = available.length > 0 ? available : PICTURE_PATHS;
    const selected = choices[Math.floor(Math.random() * choices.length)];
    
    const newHistory = [selected, ...history].slice(0, 5);
    localStorage.setItem('jigsaw_history', JSON.stringify(newHistory));
    return selected;
  }

  static getInstructions() {
    return `
      <h2 style="color: var(--accent-secondary); margin-bottom: 1rem;">Picture Match Guide</h2>
      <p style="margin-bottom: 1rem; line-height: 1.6;">Reconstruct highly detailed patterns by placing pieces into their correct slots.</p>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 0.5rem;">📸 <b>Phase 1 (Preview):</b> Memorize the high-detail image.</li>
        <li style="margin-bottom: 0.5rem;">🧩 <b>Phase 2 (Solve):</b> Click a piece from the <b>POOL</b> at the bottom.</li>
        <li style="margin-bottom: 0.5rem;">🎯 Each piece has unique details, making it easy to identify!</li>
        <li style="margin-bottom: 0.5rem;">🎁 <b>Reward:</b> Success unlocks the full image for download!</li>
      </ul>
    `;
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer);
    this.phase = "destroyed";
  }

  init() {
    this.phase = "loading";
    this.render();
    this.loadImage();
  }

  loadImage() {
    const img = new Image();
    img.onload = () => {
      if (this.phase === "destroyed") return;
      this.phase = "preview";
      this.render();
      this.startSolvingPhase();
    };
    img.onerror = () => {
      if (this.phase === "destroyed") return;
      console.error(`Failed to load image: ${this.imageUrl}. Trying fallback.`);
      if (!this.imageUrl.startsWith('http')) {
        this.imageUrl = FALLBACK_PICTURES[0];
        this.loadImage();
      } else {
        this.phase = "error";
        this.render();
      }
    };
    img.src = this.imageUrl;
  }

  startSolvingPhase() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.phase !== "preview") return;
      this.phase = "solving";
      this.generatePieces();
      this.render();
    }, 4000);
  }

  generatePieces() {
    const pieces = [];
    for (let i = 0; i < this.size * this.size; i++) {
      pieces.push({ id: i, r: Math.floor(i / this.size), c: i % this.size });
    }
    this.pool = [...pieces].sort(() => Math.random() - 0.5);
    this.board = Array(this.size * this.size).fill(null);
    this.piecesInitialized = true;
  }

  handlePoolClick(index) {
    if (this.phase !== "solving") return;
    this.selectedPoolIndex = index;
    this.render();
  }

  handleBoardClick(index) {
    if (this.phase !== "solving" || this.selectedPoolIndex === null) return;
    
    const piece = this.pool[this.selectedPoolIndex];
    if (piece.id === index) {
      this.board[index] = piece;
      this.pool.splice(this.selectedPoolIndex, 1);
      this.selectedPoolIndex = null;
      this.checkWin();
    } else {
      const slot = this.container.querySelector(`.board-slot[data-index="${index}"]`);
      if (slot) {
        slot.classList.add('shake');
        setTimeout(() => slot.classList.remove('shake'), 500);
      }
      this.selectedPoolIndex = null;
    }
    this.render();
  }

  downloadImage() {
    const link = document.createElement('a');
    link.href = this.imageUrl;
    link.download = 'nebula-reward.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  checkWin() {
    if (this.phase !== "solving" || !this.piecesInitialized) return;
    const piecesPlaced = this.board.filter(slot => slot !== null).length;
    if (piecesPlaced === this.size * this.size && this.pool.length === 0) {
      this.phase = "won";
      this.render();
    }
  }

  render() {
    if (this.phase === "destroyed") return;
    const gridSize = Math.min(window.innerWidth * 0.9, 400);
    
    if (this.phase === "loading") {
      this.container.innerHTML = `
        <div class="jigsaw-game fade-in">
          <h2 style="color: var(--accent-secondary);">SYNCING NEURAL LINK...</h2>
          <div class="loader" style="margin-top: 2rem;"></div>
        </div>
      `;
    } else if (this.phase === "error") {
      this.container.innerHTML = `
        <div class="jigsaw-game fade-in">
          <h2 style="color: #ff3333;">SYSTEM ERROR</h2>
          <p style="margin: 1rem 0;">Unable to retrieve visual data shards. Linking to fallback flux.</p>
          <button class="btn-primary" onclick="window.dispatchEvent(new CustomEvent('restart-game'))">RETRY LINK</button>
        </div>
      `;
    } else if (this.phase === "preview") {
      this.renderPreview(gridSize);
    } else {
      this.renderSolving(gridSize);
    }
  }

  renderPreview(gridSize) {
    this.container.innerHTML = `
      <div class="jigsaw-game fade-in">
        <h2 style="margin-bottom: 0.5rem; color: var(--accent-secondary);">MEMORIZE THE DETAIL</h2>
        <p style="margin-bottom: 2rem; color: #666; font-size: 0.9rem;">Starting in 4s...</p>
        <div class="preview-image" style="width: ${gridSize}px; height: ${gridSize}px; background-image: url('${this.imageUrl}'); background-size: cover; border-radius: 12px; border: 2px solid var(--accent-secondary); box-shadow: 0 0 30px rgba(255, 0, 234, 0.2);"></div>
      </div>
    `;
  }

  renderSolving(gridSize) {
    this.container.innerHTML = `
      <div class="jigsaw-game fade-in">
        <h2 style="margin-bottom: 0.5rem; color: var(--accent-secondary);">RESTORE IMAGE</h2>
        <p style="margin-bottom: 1.5rem; color: #666; font-size: 0.9rem;">Combine the unique details.</p>
        
        <div class="puzzle-board" style="display: grid; grid-template-columns: repeat(${this.size}, 1fr); width: ${gridSize}px; height: ${gridSize}px;">
          ${this.renderBoard()}
        </div>

        ${this.phase === "solving" ? `
          <div class="pool-container" style="margin-top: 2rem; width: 100%;">
            <p style="font-size: 0.8rem; color: #888; margin-bottom: 1rem;">PIECE POOL (Click to Select)</p>
            <div class="pool-grid">
              ${this.renderPool()}
            </div>
          </div>
        ` : ''}

        ${this.phase === "won" ? `
          <div class="win-screen fade-in" style="margin-top: 2rem; padding: 2rem; background: rgba(0, 255, 76, 0.1); border: 1px solid #00ff4c; border-radius: 12px;">
            <h3 style="color: #00ff4c; margin-bottom: 1rem;">IMAGE RESTORED PERFECTLY!</h3>
            <p style="margin-bottom: 2rem; font-size: 0.9rem;">Reward unlocked from the Nebula vault.</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              <button class="btn-primary" id="download-reward">DOWNLOAD PHOTO</button>
              <button class="btn-primary" style="background: none; border: 1px solid var(--glass-border);" onclick="window.dispatchEvent(new CustomEvent('restart-game'))">NEXT CHALLENGE</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;

    this.container.querySelectorAll('.board-slot').forEach(slot => {
      slot.addEventListener('click', () => this.handleBoardClick(parseInt(slot.dataset.index)));
    });

    this.container.querySelectorAll('.pool-piece').forEach(piece => {
      piece.addEventListener('click', () => this.handlePoolClick(parseInt(piece.dataset.index)));
    });

    if (this.phase === 'won') {
      const btn = document.querySelector('#download-reward');
      if (btn) btn.addEventListener('click', () => this.downloadImage());
    }
  }

  renderBoard() {
    let html = "";
    for (let i = 0; i < this.size * this.size; i++) {
      const piece = this.board[i];
      if (piece) {
        const posX = (piece.c / (this.size - 1)) * 100;
        const posY = (piece.r / (this.size - 1)) * 100;
        html += `<div class="board-slot placed" data-index="${i}" style="background-image: url('${this.imageUrl}'); background-size: ${this.size * 100}% ${this.size * 100}%; background-position: ${posX}% ${posY}%;"></div>`;
      } else {
        html += `<div class="board-slot empty" data-index="${i}">${this.phase === 'won' ? '' : '?'}</div>`;
      }
    }
    return html;
  }

  renderPool() {
    return this.pool.map((piece, i) => {
      const posX = (piece.c / (this.size - 1)) * 100;
      const posY = (piece.r / (this.size - 1)) * 100;
      return `<div class="pool-piece ${this.selectedPoolIndex === i ? 'selected' : ''}" data-index="${i}" style="background-image: url('${this.imageUrl}'); background-size: ${this.size * 100}% ${this.size * 100}%; background-position: ${posX}% ${posY}%;"></div>`;
    }).join("");
  }
}
