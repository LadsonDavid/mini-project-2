// Vibration intensity levels
export const VIBRATION_LEVELS = {
  OFF: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

// Sensor thresholds
export const SENSOR_THRESHOLDS = {
  HEART_RATE: {
    MIN: 40,
    MAX: 200,
    WARNING: 100,
    DANGER: 150,
  },
  TEMPERATURE: {
    MIN: 35,
    MAX: 42,
    WARNING: 37.5,
    DANGER: 39,
  },
  EEG: {
    MIN: 0,
    MAX: 100,
    WARNING: 70,
    DANGER: 85,
  },
};

// WebSocket connection settings
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 10,
};

// Chart colors
export const CHART_COLORS = {
  heartRate: '#ef4444',
  temperature: '#f59e0b',
  eeg: '#6366f1',
};

