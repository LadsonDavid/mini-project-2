import websocketService from '../services/websocketService.js';

export const getStatus = (req, res) => {
  const isConnected = websocketService.isESP32Connected();
  const sensorData = websocketService.getSensorData();

  res.json({
    success: true,
    connected: isConnected,
    data: sensorData,
    timestamp: Date.now(),
  });
};

export const controlVibration = (req, res) => {
  const { level, duration } = req.body;

  // Validate vibration level
  if (level === undefined || typeof level !== 'number' || level < 0 || level > 3) {
    return res.status(400).json({
      success: false,
      error: 'Invalid vibration level. Must be 0 (Off), 1 (Slow), 2 (Medium), or 3 (High)',
    });
  }

  // Validate duration (if provided)
  const vibrationDuration = duration || 1000;
  if (typeof vibrationDuration !== 'number' || vibrationDuration < 0 || vibrationDuration > 60000) {
    return res.status(400).json({
      success: false,
      error: 'Invalid duration. Must be between 0 and 60000 milliseconds (1 minute)',
    });
  }

  const success = websocketService.sendToESP32({
    type: 'command',
    command: 'vibrate',
    level: level,
    duration: vibrationDuration,
  });

  if (success) {
    res.json({
      success: true,
      message: `Vibration level set to ${level}`,
      level,
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'ESP32 not connected',
    });
  }
};

export const sendMessage = (req, res) => {
  const { message } = req.body;

  // Input validation with length limits
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Message is required and must be a string',
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Message cannot be empty',
    });
  }

  if (message.length > 200) {
    return res.status(400).json({
      success: false,
      error: 'Message too long. Maximum 200 characters allowed',
    });
  }

  const success = websocketService.sendToESP32({
    type: 'command',
    command: 'display',
    message: message,
  });

  if (success) {
    res.json({
      success: true,
      message: 'Message sent to ESP32',
      sentMessage: message,
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'ESP32 not connected',
    });
  }
};

export const toggleMassage = (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'enabled field is required and must be a boolean',
    });
  }

  const success = websocketService.sendToESP32({
    type: 'command',
    command: 'massage',
    enabled: enabled,
  });

  if (success) {
    res.json({
      success: true,
      message: enabled ? 'Massage mode started' : 'Massage mode stopped',
      enabled,
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'ESP32 not connected',
    });
  }
};

