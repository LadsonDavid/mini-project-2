import { useState, useEffect } from 'react';
import { SENSOR_THRESHOLDS } from '../utils/constants';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import VibrationIcon from '@mui/icons-material/Vibration';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const SensorCard = ({ title, value, unit, type, trend }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    if (value !== prevValue) {
      setIsAnimating(true);
      setLastUpdated(Date.now());
      setTimeout(() => setIsAnimating(false), 300);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const getPercentage = () => {
    const threshold = SENSOR_THRESHOLDS[type.toUpperCase()];
    if (!threshold) return 0;
    return Math.min((value / threshold.MAX) * 100, 100);
  };



  return (
    <div className="relative group animate-fade-in-up h-full">
      {/* Clean data card */}
      <div className="relative premium-card h-full flex flex-col transition-all var(--transition-base)"
        style={{ padding: '20px' }}>

        {/* Professional Header with Trend */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {type === 'heart_rate' ? (
                <FavoriteIcon sx={{ fontSize: 22, color: 'rgb(239, 68, 68)' }} />
              ) : type === 'temperature' ? (
                <ThermostatIcon sx={{ fontSize: 22, color: 'rgb(59, 130, 246)' }} />
              ) : (
                <VibrationIcon sx={{ fontSize: 22, color: 'rgb(139, 92, 246)' }} />
              )}
              <h3 className="text-label text-[var(--text-secondary)]" style={{ fontSize: '13px' }}>
                {title}
              </h3>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-semibold transition-all var(--transition-base) ${value >= SENSOR_THRESHOLDS[type.toUpperCase()]?.DANGER ? 'status-pill-offline' :
              value >= SENSOR_THRESHOLDS[type.toUpperCase()]?.WARNING ? 'status-pill-warning' :
                'status-pill-connected'
              }`}>
              <span className={`status-indicator ${value >= SENSOR_THRESHOLDS[type.toUpperCase()]?.DANGER ||
                value >= SENSOR_THRESHOLDS[type.toUpperCase()]?.WARNING ? 'status-indicator-pulse' :
                value > 0 ? 'status-glow' : ''
                }`}></span>
              <span>
                {value >= SENSOR_THRESHOLDS[type.toUpperCase()]?.DANGER
                  ? 'Alert'
                  : value >= SENSOR_THRESHOLDS[type.toUpperCase()]?.WARNING
                    ? 'Elevated'
                    : 'Normal'}
              </span>
            </div>
          </div>

          {/* Large Value Display */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className={`transition-all var(--transition-base) ${type === 'heart_rate' ? 'accent-heart' :
                type === 'temperature' ? 'accent-temperature' :
                  'accent-vibration'
                } ${isAnimating ? 'scale-105' : 'scale-100'} ${value === 0 ? 'skeleton-loading' : ''}`}
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  animation: type === 'heart_rate' && value > 0 ? 'heartbeat 1.2s ease-in-out infinite' : 'none'
                }}>
                {value === 0 ? '—' : value.toFixed(1)}
              </span>
              <span className="font-medium text-[var(--text-tertiary)] mb-1" style={{ fontSize: '13px' }}>
                {unit}
              </span>
            </div>

            {/* Integrated Trend Indicator */}
            {trend !== undefined && trend !== 0 && !isNaN(trend) && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                {trend > 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 16 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16 }} />
                )}
                <span className="text-sm font-semibold">
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Refined progress bar */}
        <div className="flex-1">
          <div className="w-full h-2 bg-white/10 rounded-none overflow-hidden">
            <div
              className={`h-full rounded-none transition-all duration-700 ease-out ${type === 'heart_rate' ? 'bg-accent-heart' :
                type === 'temperature' ? 'bg-accent-temperature' :
                  'bg-accent-vibration'
                }`}
              style={{
                width: `${getPercentage()}%`,
                boxShadow: `0 0 12px ${type === 'heart_rate' ? 'rgba(255, 79, 94, 0.5)' :
                  type === 'temperature' ? 'rgba(0, 174, 239, 0.5)' :
                    'rgba(139, 92, 246, 0.5)'
                  }`
              }}
            />
          </div>
          <div className="flex justify-between mt-2 items-center">
            <span className="text-xs text-[var(--text-tertiary)]">0</span>
            <span className="text-xs text-[var(--text-muted)] italic opacity-60">
              Updated {getTimeSinceUpdate()}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">{SENSOR_THRESHOLDS[type.toUpperCase()]?.MAX || 100}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;

