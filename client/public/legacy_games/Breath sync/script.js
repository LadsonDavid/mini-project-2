/**
 * Breath Sync - Guided Breathing Companion
 * 
 * Logic handles the timing and state transitions between Inhale, Hold, and Exhale.
 */

const circle = document.getElementById('breathing-circle');
const textCue = document.getElementById('text-cue');
const toggleBtn = document.getElementById('toggle-btn');
const timerDisplay = document.getElementById('session-timer');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');

// Inputs
const inhaleInput = document.getElementById('inhale-time');
const holdInput = document.getElementById('hold-time');
const exhaleInput = document.getElementById('exhale-time');

// Initial Timing Variables (ms)
let timings = {
    inhale: 4000,
    hold: 4000,
    exhale: 4000
};

let isRunning = false;
let timeoutId = null;
let timerIntervalId = null;
let secondsElapsed = 0;
let audioCtx = null;

/**
 * Generates and plays a short beep sound using Web Audio API
 */
function playBeep(frequency = 440, duration = 0.1) {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume context if it was suspended (browser policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
}


/**
 * Formats seconds into MM:SS
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Updates the timer display
 */
function updateTimer() {
    secondsElapsed++;
    timerDisplay.textContent = formatTime(secondsElapsed);
}



/**
 * Updates the CSS custom properties to sync animation duration with settings
 */
function updateCSSVariables() {
    document.documentElement.style.setProperty('--inhale-time', `${timings.inhale}ms`);
    document.documentElement.style.setProperty('--hold-time', `${timings.exhale}ms`); // Note: CSS uses this for the exhale animation duration
}


/**
 * The main breathing loop
 * Phases: Inhale -> Hold -> Exhale
 */
function breathingCycle() {
    if (!isRunning) return;

    // phase 1: Inhale
    playBeep(440); // Standard A4 beep
    textCue.textContent = 'Inhale';
    circle.className = 'circle inhaling';

    timeoutId = setTimeout(() => {
        if (!isRunning) return;

        // Phase 2: Hold
        playBeep(554.37, timings.hold / 1000); // Continuous beep for the duration of hold
        textCue.textContent = 'Hold';


        circle.className = 'circle';
        circle.style.transform = 'scale(2)'; // Keep it expanded

        timeoutId = setTimeout(() => {
            if (!isRunning) return;

            // Phase 3: Exhale
            playBeep(659.25); // E5 beep
            textCue.textContent = 'Exhale';
            circle.style.transform = ''; // Clear inline scale to let animation take over
            circle.className = 'circle exhaling';

            timeoutId = setTimeout(() => {
                if (!isRunning) return;

                // Restart cycle
                breathingCycle();
            }, timings.exhale);

        }, timings.hold);

    }, timings.inhale);
}


/**
 * Starts the breathing animation cycle
 */
function startCycle() {
    updateCSSVariables();
    breathingCycle();
}

/**
 * Stops the breathing animation cycle and clears timeouts
 */
function stopCycle() {
    clearTimeout(timeoutId);
    // We don't change isRunning here because it's used globally for both cycle and timer
}

/**
 * Toggles the breathing exercise
 */
function toggleBreathing() {
    isRunning = !isRunning;

    if (isRunning) {
        toggleBtn.textContent = 'Pause';
        startCycle();
        if (!timerIntervalId) {
            timerIntervalId = setInterval(updateTimer, 1000);
        }
    } else {
        toggleBtn.textContent = 'Start';
        textCue.textContent = 'Prepare';
        circle.className = 'circle';
        circle.style.transform = '';
        stopCycle();
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
        }
    }
}


// Event Listeners
toggleBtn.addEventListener('click', toggleBreathing);

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', () => {
    // Update timings from inputs
    timings.inhale = inhaleInput.value * 1000;
    timings.hold = holdInput.value * 1000;
    timings.exhale = exhaleInput.value * 1000;

    settingsModal.classList.add('hidden');

    // If running, restart the cycle to apply new timings immediately.
    // The session timer remains unaffected.
    if (isRunning) {
        stopCycle();
        startCycle();
    }
});



// Sync initial variables
updateCSSVariables();
