/**
 * Calm Tracking - Logic
 * Smooth, frame-independent animation for eye tracking
 */

const canvas = document.getElementById('calmCanvas');
const ctx = canvas.getContext('2d');

// Configuration
const CONFIG = {
    dotSize: 12,           // px radius
    speed: 1.5,            // Base speed (pixels per frame at 60fps)
    color: '#80cbc4',      // Soft teal
    glowSize: 40,          // Glow radius
    glowOpacity: 0.3,
    colors: ['#80cbc4', '#ffab91', '#ce93d8', '#90caf9', '#a5d6a7', '#fff59d'] // Calming palette
};

let currentColorIndex = 0;
let width, height;
let animationId;
let isRunning = false;

// Dot state
const dot = {
    x: 0,
    y: 0,
    vx: CONFIG.speed,
    vy: CONFIG.speed * 0.7 // Slightly different to ensure diagonal variety
};

/**
 * Handle canvas resizing
 */
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Center dot if it's first run
    if (dot.x === 0 && dot.y === 0) {
        dot.x = width / 2;
        dot.y = height / 2;
    }
}

/**
 * Update dot position and check for bounces
 */
function update() {
    dot.x += dot.vx;
    dot.y += dot.vy;

    let bounced = false;

    // Horizontal bounce
    if (dot.x + CONFIG.dotSize > width || dot.x - CONFIG.dotSize < 0) {
        dot.vx *= -1;
        dot.x = dot.x < CONFIG.dotSize ? CONFIG.dotSize : width - CONFIG.dotSize;
        bounced = true;
    }

    // Vertical bounce
    if (dot.y + CONFIG.dotSize > height || dot.y - CONFIG.dotSize < 0) {
        dot.vy *= -1;
        dot.y = dot.y < CONFIG.dotSize ? CONFIG.dotSize : height - CONFIG.dotSize;
        bounced = true;
    }

    if (bounced) {
        currentColorIndex = (currentColorIndex + 1) % CONFIG.colors.length;
        CONFIG.color = CONFIG.colors[currentColorIndex];
    }
}

/**
 * Draw the dot and its glow
 */
function draw() {
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, width, height);

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, CONFIG.glowSize);
    gradient.addColorStop(0, hexToRgba(CONFIG.color, CONFIG.glowOpacity));
    gradient.addColorStop(1, 'rgba(15, 17, 21, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, CONFIG.glowSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = CONFIG.color;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = CONFIG.color;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, CONFIG.dotSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

/**
 * Main animation loop
 */
function animate() {
    update();
    draw();
    animationId = requestAnimationFrame(animate);
}

/**
 * Toggle start / pause
 */
function toggle() {
    if (isRunning) {
        cancelAnimationFrame(animationId);
        document.body.classList.remove('running');
    } else {
        animate();
        document.body.classList.add('running');
    }
    isRunning = !isRunning;
}

/**
 * Helper: Hex to RGBA
 */
function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Initial Setup
window.addEventListener('resize', resize);
resize();
draw();

// Global click listener for seamless interaction
window.addEventListener('click', toggle);
