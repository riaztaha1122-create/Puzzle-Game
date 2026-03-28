import { WordGame } from './src/games/word-game.js';
import { JigsawGame } from './src/games/jigsaw-v6.js';
import { SequenceGame } from './src/games/sequence-game.js';

const container = document.querySelector('#game-container');
const modal = document.querySelector('#modal');
const modalBody = document.querySelector('#modal-body');
const closeModal = document.querySelector('.close-modal');
const helpBtn = document.querySelector('#main-help-btn');

let currentGame = null;
let currentAppMode = 'home'; // 'home', 'levels', 'playing'
let lastGameType = null;

const GAME_TYPES = {
  word: { class: WordGame, title: 'Cyber Word', levels: [4, 5, 6], labels: ['Novice', 'Pro', 'Expert'] },
  jigsaw: { class: JigsawGame, title: 'Fractal Jigsaw', levels: [3, 4, 5], labels: ['3x3 Easy', '4x4 Normal', '5x5 Hard'] },
  sequence: { class: SequenceGame, title: 'Neon Sequence', levels: [0, 1, 2], labels: ['Slow', 'Medium', 'Hyper'] }
};

function showHome() {
  currentAppMode = 'home';
  currentGame = null;
  container.innerHTML = `
    <div class="fade-in" style="text-align: center; max-width: 800px;">
      <h1>Puzzle Nebula</h1>
      <p style="color: #666; margin-bottom: 3rem; font-size: 1.1rem;">Elite cognitive training for the digital age.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
        <div class="glass-panel" style="cursor: pointer;" id="card-word">
          <h3 style="margin-bottom: 1rem; color: var(--accent-color);">Cyber Word</h3>
          <p style="font-size: 0.9rem; color: #888;">Decrypt the hidden key before the system locks down.</p>
        </div>
        <div class="glass-panel" style="cursor: pointer;" id="card-jigsaw">
          <h3 style="margin-bottom: 1rem; color: var(--accent-secondary);">Fractal Jigsaw</h3>
          <p style="font-size: 0.9rem; color: #888;">Reconstruct cosmic vistas from fragmented shards.</p>
        </div>
        <div class="glass-panel" style="cursor: pointer;" id="card-sequence">
          <h3 style="margin-bottom: 1rem; color: var(--accent-tertiary);">Neon Sequence</h3>
          <p style="font-size: 0.9rem; color: #888;">Test your neural synchronization with light patterns.</p>
        </div>
      </div>
    </div>
  `;

  ['word', 'jigsaw', 'sequence'].forEach(type => {
    document.querySelector(`#card-${type}`).addEventListener('click', () => showLevelSelection(type));
  });
}

function showLevelSelection(type) {
  currentAppMode = 'levels';
  lastGameType = type;
  const gameInfo = GAME_TYPES[type];
  
  container.innerHTML = `
    <div class="fade-in" style="text-align: center; width: 100%; max-width: 400px;">
      <h2 style="margin-bottom: 2rem; color: white;">SELECT DIFFICULTY</h2>
      ${gameInfo.levels.map((lvl, i) => `
        <div class="level-card" data-level="${lvl}">
          <h4 style="margin-bottom: 4px; color: var(--accent-color);">${gameInfo.labels[i]}</h4>
          <p style="font-size: 0.8rem; color: #666;">Challenge level assigned by Nebula AI.</p>
        </div>
      `).join('')}
      <button class="btn-primary" style="margin-top: 1rem; width: 100%; background: none; border: 1px solid var(--glass-border);" id="back-home">BACK TO NEBULA</button>
    </div>
  `;

  container.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => startGame(type, parseInt(card.dataset.level)));
  });
  document.querySelector('#back-home').addEventListener('click', showHome);
}

function startGame(type, level) {
  if (currentGame && typeof currentGame.destroy === 'function') {
    currentGame.destroy();
  }
  currentAppMode = 'playing';
  const GameClass = GAME_TYPES[type].class;
  currentGame = new GameClass(container, level);
  currentGame.init();
}

// Modal Logic
function showModal(content) {
  modalBody.innerHTML = content;
  modal.classList.add('active');
}

function hideModal() {
  modal.classList.remove('active');
}

closeModal.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

helpBtn.addEventListener('click', () => {
  if (currentAppMode === 'playing' && currentGame) {
    showModal(currentGame.constructor.getInstructions());
  } else {
    showModal(`
      <h2 style="color: white; margin-bottom: 1rem;">Nebula Core Guide</h2>
      <p style="line-height: 1.6;">Select a game and difficulty to begin your cognitive session. Use the navigation bar to switch between challenges at any time.</p>
    `);
  }
});

// Event Listeners for Nav
document.querySelector('#nav-home').addEventListener('click', () => {
  setActiveNav('#nav-home');
  showHome();
});
document.querySelector('#nav-word').addEventListener('click', () => {
  setActiveNav('#nav-word');
  showLevelSelection('word');
});
document.querySelector('#nav-jigsaw').addEventListener('click', () => {
  setActiveNav('#nav-jigsaw');
  showLevelSelection('jigsaw');
});
document.querySelector('#nav-sequence').addEventListener('click', () => {
  setActiveNav('#nav-sequence');
  showLevelSelection('sequence');
});

function setActiveNav(selector) {
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.querySelector(selector).classList.add('active');
}

window.addEventListener('restart-game', () => {
  if (lastGameType) showLevelSelection(lastGameType);
});

showHome();
