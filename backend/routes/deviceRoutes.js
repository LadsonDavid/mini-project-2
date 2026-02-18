import express from 'express';
import {
  getStatus,
  controlVibration,
  sendMessage,
  toggleMassage,
} from '../controllers/deviceController.js';
import {
  chatWithAI,
  getAIStatus,
} from '../controllers/aiController.js';

const router = express.Router();

// GET /api/status - Check device connection status
router.get('/status', getStatus);

// POST /api/vibrate - Control vibration motor
router.post('/vibrate', controlVibration);

// POST /api/message - Send message to ESP32 display
router.post('/message', sendMessage);

// POST /api/massage - Toggle massage mode
router.post('/massage', toggleMassage);

// POST /api/ai/chat - AI chatbot endpoint
router.post('/ai/chat', chatWithAI);

// GET /api/ai/status - Check AI availability
router.get('/ai/status', getAIStatus);

export default router;

