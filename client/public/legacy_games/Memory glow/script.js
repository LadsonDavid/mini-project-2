/**
 * Memory Glow - Core Logic
 * Focuses on a calm, sequence-driven experience.
 */

// --- Game State ---
let masterSequence = [];
let userSequence = [];
let level = 1;
let isPlaying = false;
let canClick = false;

// --- DOM Elements ---
const tiles = document.querySelectorAll('.tile');
const levelDisplay = document.getElementById('level-count');
const statusMessage = document.getElementById('status-message');
const startBtn = document.getElementById('start-btn');

// --- Audio Setup ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const tileFrequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00]; // C4 to A4 (Pentatonic/Harmonious)
const mistakeFrequency = 110.00; // Low A2 for mistake

/**
 * Plays a clean, soft tone
 */
function playTone(freq, duration) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1000);
}

// --- Initialization ---
function init() {
    startBtn.addEventListener('click', startGame);
    tiles.forEach(tile => {
        tile.addEventListener('click', () => handleTileClick(tile));
    });
}

/**
 * Starts a new game session
 */
function startGame() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    masterSequence = [];
    userSequence = [];
    level = 1;
    updateLevelDisplay();
    startBtn.classList.add('hidden');
    nextLevel();
}

/**
 * Progresses the game to the next level
 */
function nextLevel() {
    userSequence = [];
    canClick = false;

    // Add a random tile (0-5) to the sequence
    const nextTileIndex = Math.floor(Math.random() * 6);
    masterSequence.push(nextTileIndex);

    updateLevelDisplay();
    playSequence();
}

/**
 * Plays back the master sequence for the user to watch
 */
function playSequence() {
    isPlaying = true;
    updateStatus('Watch carefully...');

    let i = 0;
    const interval = setInterval(() => {
        glowTile(masterSequence[i]);
        i++;

        if (i >= masterSequence.length) {
            clearInterval(interval);
            setTimeout(() => {
                isPlaying = false;
                canClick = true;
                updateStatus('Your turn');
            }, 800);
        }
    }, 1000); // Slow, predictable pace (1s per tile)
}

/**
 * Handles user tile clicks
 */
function handleTileClick(tile) {
    if (!canClick || isPlaying) return;

    const index = parseInt(tile.dataset.index);
    userSequence.push(index);

    // Visual and Audio feedback
    glowTile(index, 400);

    // Validate the current step
    const currentStep = userSequence.length - 1;
    if (userSequence[currentStep] !== masterSequence[currentStep]) {
        handleMistake();
        return;
    }

    // Check if sequence is complete
    if (userSequence.length === masterSequence.length) {
        canClick = false;
        updateStatus('Well done!', 'success');
        level++;
        setTimeout(nextLevel, 1200);
    }
}

/**
 * Gently handles mistakes by replaying the current sequence
 */
function handleMistake() {
    canClick = false;
    updateStatus('Not quite... let\'s try again.', 'error');

    // Play mistake sound
    playTone(mistakeFrequency, 600);

    setTimeout(() => {
        userSequence = [];
        playSequence();
    }, 1500);
}

/**
 * Activates the glow effect on a specific tile and plays its tone
 */
function glowTile(index, duration = 600) {
    const tile = document.getElementById(`tile-${index}`);
    tile.classList.add('glow');

    // Play tile specific tone
    playTone(tileFrequencies[index], duration);

    setTimeout(() => {
        tile.classList.remove('glow');
    }, duration);
}

// --- Helper Functions ---

function updateLevelDisplay() {
    levelDisplay.textContent = level;
}

function updateStatus(msg, type = 'default') {
    statusMessage.style.opacity = '0';
    setTimeout(() => {
        statusMessage.textContent = msg;

        // Reset classes
        statusMessage.classList.remove('error', 'success');

        // Add new class if applicable
        if (type !== 'default') {
            statusMessage.classList.add(type);
        }

        statusMessage.style.opacity = '1';
    }, 300);
}

// Run init
init();
