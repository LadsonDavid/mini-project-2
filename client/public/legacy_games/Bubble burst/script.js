/**
 * Calm Bubbles - script.js
 * Logic for spawning and interaction.
 */

const container = document.getElementById('game-container');

// Vibrant colors for better contrast, still keeping a soft feel
const colors = [
    'rgba(52, 152, 219, 0.8)', // Stronger Blue
    'rgba(46, 204, 113, 0.8)', // Stronger Green
    'rgba(231, 76, 60, 0.7)',  // Soft Red
    'rgba(155, 89, 182, 0.8)', // Stronger Purple
    'rgba(241, 196, 15, 0.8)', // Stronger Yellow
    'rgba(230, 126, 34, 0.8)'  // Stronger Orange
];

/**
 * Creates a new bubble at a random position.
 */
function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    // Randomize size between 60px and 120px for easy clicking
    const size = Math.floor(Math.random() * 60) + 60;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // Ensure the bubble spawns fully within the viewport
    const maxX = window.innerWidth - size;
    const maxY = window.innerHeight - size;
    const posX = Math.random() * maxX;
    const posY = Math.random() * maxY;

    bubble.style.left = `${posX}px`;
    bubble.style.top = `${posY}px`;

    // Apply a random pastel color
    const color = colors[Math.floor(Math.random() * colors.length)];
    bubble.style.background = color;
    bubble.style.border = `2px solid ${color.replace('0.6', '0.8')}`;

    // Add click event to pop the bubble
    bubble.addEventListener('click', () => popBubble(bubble));

    container.appendChild(bubble);

    // Limit maximum bubbles to keep the screen calm and performant
    if (container.children.length > 20) {
        // Remove the oldest bubble if there are too many
        const oldest = container.querySelector('.bubble:not(.popping)');
        if (oldest) oldest.remove();
    }
}

/**
 * Plays a "gentle digital bubble" notification sound using Web Audio API.
 */
function playSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    // 1. Bubble "bloop" component (sine wave with upward sweep)
    const oscBubble = audioCtx.createOscillator();
    const gainBubble = audioCtx.createGain();

    oscBubble.type = 'sine';
    // Fast upward sweep from 400Hz to 1200Hz
    const baseFreq = 400 + Math.random() * 200;
    oscBubble.frequency.setValueAtTime(baseFreq, now);
    oscBubble.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + 0.1);

    gainBubble.gain.setValueAtTime(0, now);
    gainBubble.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gainBubble.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    // 2. Digital "ping" component (triangle wave harmonic)
    const oscPing = audioCtx.createOscillator();
    const gainPing = audioCtx.createGain();

    oscPing.type = 'triangle';
    oscPing.frequency.setValueAtTime(baseFreq * 2.5, now);

    gainPing.gain.setValueAtTime(0, now);
    gainPing.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gainPing.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscBubble.connect(gainBubble);
    gainBubble.connect(audioCtx.destination);

    oscPing.connect(gainPing);
    gainPing.connect(audioCtx.destination);

    oscBubble.start(now);
    oscBubble.stop(now + 0.2);

    oscPing.start(now);
    oscPing.stop(now + 0.15);
}

/**
 * Creates a burst of particles at the given position.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {string} color - The color for the particles.
 */
function createBurst(x, y, color) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Randomize direction and distance
        const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.background = color;
        // Offset by 3px (half of 6px particle width/height) to center the particle itself
        particle.style.left = `${x - 3}px`;
        particle.style.top = `${y - 3}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        container.appendChild(particle);

        // Remove particle after animation
        particle.addEventListener('animationend', () => particle.remove());
    }
}

/**
 * Handles the pop animation and removal.
 * @param {HTMLElement} bubble - The bubble element to pop.
 */
function popBubble(bubble) {
    if (bubble.classList.contains('popping')) return;
    bubble.classList.add('popping');

    // Use offsetLeft/Top + size to find the exact center relative to the container
    const size = parseInt(bubble.style.width);
    const centerX = bubble.offsetLeft + size / 2;
    const centerY = bubble.offsetTop + size / 2;

    playSound();
    createBurst(centerX, centerY, bubble.style.background);

    // Remove from DOM after animation completes
    bubble.addEventListener('animationend', (e) => {
        if (e.animationName === 'pop') {
            bubble.remove();
        }
    });
}

/**
 * Main game loop - spawns bubbles at random intervals.
 */
function gameLoop() {
    createBubble();

    // Random delay between 1 and 2 seconds for a slow, calm pace
    const nextSpawn = Math.floor(Math.random() * 1000) + 1000;
    setTimeout(gameLoop, nextSpawn);
}

// Start the game loop
gameLoop();
