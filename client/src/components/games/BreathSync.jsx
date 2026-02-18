import React, { useState, useEffect, useRef } from 'react';
import { PlayArrow as Play, Pause, Settings, Close as X } from '@mui/icons-material';

const BreathSync = ({ onExit }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('Prepare'); // 'Inhale', 'Hold', 'Exhale', 'Prepare'
  const [timings, setTimings] = useState({
    inhale: 4,
    hold: 4,
    exhale: 4,
  });
  const [tempTimings, setTempTimings] = useState({ ...timings });
  const [sessionTime, setSessionTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  const playBeep = (frequency = 440, duration = 0.1) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const oscillator = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      const now = audioCtxRef.current.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    let timeoutId;

    if (isRunning) {
      const phases = [
        { name: 'Inhale', duration: timings.inhale, freq: 440 },
        { name: 'Hold', duration: timings.hold, freq: 554.37 },
        { name: 'Exhale', duration: timings.exhale, freq: 659.25 }
      ];

      let currentPhaseIdx = 0;

      const nextStep = () => {
        const p = phases[currentPhaseIdx];
        setPhase(p.name);
        playBeep(p.freq, p.name === 'Hold' ? p.duration : 0.1);

        timeoutId = setTimeout(() => {
          currentPhaseIdx = (currentPhaseIdx + 1) % phases.length;
          nextStep();
        }, p.duration * 1000);
      };

      nextStep();
    } else {
      setPhase('Prepare');
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRunning, timings]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => setIsRunning(!isRunning);

  const saveSettings = () => {
    setTimings(tempTimings);
    setShowSettings(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-[var(--color-card)] rounded-none border border-[var(--border-subtle)] shadow-xl overflow-hidden min-h-[500px] w-full max-w-2xl mx-auto">
      {/* Background Glow */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${phase === 'Inhale' ? 'bg-blue-500/10' :
        phase === 'Hold' ? 'bg-purple-500/10' :
          phase === 'Exhale' ? 'bg-teal-500/10' : 'bg-transparent'
        }`} />

      <div className="relative z-10 w-full flex items-center justify-between mb-12 px-2">
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 rounded-none bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          title="Settings"
        >
          <Settings className="w-6 h-6 text-[var(--text-secondary)]" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-1">Session Duration</span>
          <div className="text-3xl font-mono font-bold text-[var(--text-primary)]">{formatTime(sessionTime)}</div>
        </div>

        <button
          onClick={onExit}
          className="p-3 rounded-none bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
          title="Exit Game"
        >
          <X className="w-6 h-6 text-red-500" />
        </button>
      </div>


      <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-12">
        {/* Breathing Circle */}
        <div
          className={`w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center transition-all ease-in-out`}
          style={{
            transform: phase === 'Inhale' ? 'scale(1.5)' : phase === 'Hold' ? 'scale(1.5)' : 'scale(1)',
            transitionDuration: phase === 'Inhale' ? `${timings.inhale}s` : phase === 'Exhale' ? `${timings.exhale}s` : '0.5s',
            boxShadow: phase !== 'Prepare' ? '0 0 60px rgba(139, 92, 246, 0.4)' : 'none',
            backgroundColor: 'rgba(139, 92, 246, 0.2)'
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white drop-shadow-md uppercase tracking-wider">{phase}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-12 w-full flex flex-col items-center gap-4">
        <button
          onClick={handleToggle}
          className={`w-full max-w-xs py-4 rounded-none font-bold text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg ${isRunning
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
            }`}
        >
          {isRunning ? <><Pause className="w-6 h-6" /> Stop session</> : <><Play className="w-6 h-6" /> Start breathing</>}
        </button>

        <p className="text-sm text-[var(--text-tertiary)] italic">
          {isRunning ? 'Follow the circle and audio cues...' : 'Ready to start your calming session?'}
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--color-card)] border border-[var(--border-medium)] rounded-none p-8 w-full max-w-sm shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Breathing Rhythm</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Adjust the timing for each phase</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              {['inhale', 'hold', 'exhale'].map((key) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {key}
                    </label>
                    <span className="text-sm font-mono text-[var(--color-primary)]">{tempTimings[key]}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={tempTimings[key]}
                    onChange={(e) => setTempTimings({ ...tempTimings, [key]: parseInt(e.target.value) || 1 })}
                    className="w-full accent-[var(--color-primary)]"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={saveSettings}
              className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-none hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default BreathSync;
