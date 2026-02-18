import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { VIBRATION_LEVELS } from '../utils/constants';
import VibrationIcon from '@mui/icons-material/Vibration';

const VibrationControl = ({ onSendVibration }) => {
  const { vibrationLevel, setVibrationLevel } = useAppContext();
  const [duration, setDuration] = useState(1000);

  const handleSendVibration = () => {
    if (onSendVibration) {
      onSendVibration({ level: vibrationLevel, duration });
    }
  };

  const vibrationLabels = {
    [VIBRATION_LEVELS.OFF]: 'Off',
    [VIBRATION_LEVELS.LOW]: 'Low',
    [VIBRATION_LEVELS.MEDIUM]: 'Medium',
    [VIBRATION_LEVELS.HIGH]: 'High',
  };

  return (
    <div className="group premium-card h-full flex flex-col p-6 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-8">
        <VibrationIcon sx={{ fontSize: 28, color: 'rgb(139, 92, 246)' }} />
        <div>
          <h3 className="text-title text-[var(--text-primary)]" style={{ fontSize: '16px' }}>
            Pulse therapy
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Customize intensity and timing
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Vibration Level */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-label text-[var(--text-secondary)]">
              Intensity
            </label>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-none transition-all var(--transition-base) ${vibrationLevel === VIBRATION_LEVELS.OFF ? 'status-pill-offline' :
              vibrationLevel === VIBRATION_LEVELS.LOW ? 'status-pill-connected' :
                vibrationLevel === VIBRATION_LEVELS.MEDIUM ? 'status-pill-warning' :
                  'status-pill-offline'
              }`} style={vibrationLevel === VIBRATION_LEVELS.OFF ? {
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-medium)',
                color: 'var(--text-muted)'
              } : {}}>
              {vibrationLabels[vibrationLevel]}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={VIBRATION_LEVELS.OFF}
              max={VIBRATION_LEVELS.HIGH}
              value={vibrationLevel}
              onChange={(e) => setVibrationLevel(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-none appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                      var(--accent-vibration) 0%, 
                      var(--accent-vibration) ${(vibrationLevel / VIBRATION_LEVELS.HIGH) * 100}%, 
                      var(--border-subtle) ${(vibrationLevel / VIBRATION_LEVELS.HIGH) * 100}%, 
                      var(--border-subtle) 100%)`
              }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[var(--text-tertiary)]">Off</span>
              <span className="text-xs text-[var(--text-tertiary)]">Low</span>
              <span className="text-xs text-[var(--text-tertiary)]">Med</span>
              <span className="text-xs text-[var(--text-tertiary)]">High</span>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-label text-[var(--text-secondary)]">
              Duration
            </label>
            <span className="text-xs font-semibold px-3 py-1 rounded-none" style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}>
              {(duration / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-none appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                      var(--accent-vibration) 0%, 
                      var(--accent-vibration) ${((duration - 100) / 4900) * 100}%, 
                      var(--border-subtle) ${((duration - 100) / 4900) * 100}%, 
                      var(--border-subtle) 100%)`
              }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[var(--text-tertiary)]">0.1s</span>
              <span className="text-xs text-[var(--text-tertiary)]">5s</span>
            </div>
          </div>
        </div>

        {/* Professional CTA Button with Gradient Pulse */}
        <button
          onClick={handleSendVibration}
          disabled={vibrationLevel === VIBRATION_LEVELS.OFF}
          className={`w-full py-3 px-5 rounded-none font-semibold text-sm transition-all var(--transition-base) flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${vibrationLevel === VIBRATION_LEVELS.OFF
            ? 'bg-white/10 text-white/40 cursor-not-allowed'
            : 'bg-secondary text-white hover:scale-[1.01]'
            }`}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <VibrationIcon sx={{ fontSize: 18 }} />
          <span>Activate pulse</span>
        </button>
      </div>
    </div>
  );
};

export default VibrationControl;

