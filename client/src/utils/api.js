// Backend API base URL (uses env var or falls back to default)
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8080/api';

// Utility: Fetch with timeout and retry logic
const fetchWithTimeout = async (url, options = {}, timeout = 10000, retries = 2) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Don't retry on abort or if it's the last attempt
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }

      if (attempt === retries) {
        throw new Error(error.message || 'Network error - please try again');
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
    }
  }
};

// HTTP API functions
export const api = {
  // Get device status
  getStatus: async () => {
    try {
      return await fetchWithTimeout(`${API_BASE_URL}/status`, {}, 5000);
    } catch (error) {
      console.error('Error fetching status:', error);
      throw error;
    }
  },

  // Send vibration command
  vibrate: async (level, duration = 1000) => {
    try {
      return await fetchWithTimeout(
        `${API_BASE_URL}/vibrate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, duration }),
        },
        8000
      );
    } catch (error) {
      console.error('Error sending vibration:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (message) => {
    try {
      return await fetchWithTimeout(
        `${API_BASE_URL}/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        },
        8000
      );
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Toggle massage mode
  toggleMassage: async (enabled) => {
    try {
      return await fetchWithTimeout(
        `${API_BASE_URL}/massage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        },
        8000
      );
    } catch (error) {
      console.error('Error toggling massage:', error);
      throw error;
    }
  },

  // AI Chat (longer timeout for AI responses)
  chatWithAI: async (message) => {
    try {
      return await fetchWithTimeout(
        `${API_BASE_URL}/ai/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        },
        30000, // 30 second timeout for AI
        1 // Only 1 retry for AI to avoid duplicate messages
      );
    } catch (error) {
      console.error('Error chatting with AI:', error);
      throw error;
    }
  },

  // Check AI status
  getAIStatus: async () => {
    try {
      return await fetchWithTimeout(`${API_BASE_URL}/ai/status`, {}, 5000);
    } catch (error) {
      console.error('Error checking AI status:', error);
      throw error;
    }
  },
};

// WebSocket URL (uses env var or falls back to default)
export const WS_URL = import.meta.env.VITE_WS_URL 
  ? `${import.meta.env.VITE_WS_URL}/frontend`
  : 'ws://localhost:8080/frontend';

