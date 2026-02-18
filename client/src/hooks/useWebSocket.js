import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_CONFIG } from '../utils/constants';

export const useWebSocket = (url, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  // Update message handler ref when it changes (without reconnecting)
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!url) return;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WebSocket] Connected to backend');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (error) {
          console.error('[WebSocket] Parse error:', error);
        }
      };

      ws.onerror = (err) => {
        // Only log if not a standard close event
        if (err.type !== 'error' || ws.readyState !== WebSocket.CLOSING) {
          console.error('[WebSocket] Connection error:', err);
        }
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Auto-reconnect logic with exponential backoff
        if (reconnectAttemptsRef.current < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          const backoffDelay = Math.min(
            WS_CONFIG.RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttemptsRef.current),
            10000 // Max 10 seconds
          );
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttemptsRef.current + 1}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS})`);
            reconnectAttemptsRef.current += 1;
            connect();
          }, backoffDelay);
        } else {
          console.error('[WebSocket] Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      setError(err.message || 'Failed to connect');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendCommand = useCallback((command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        ...command,
      }));
      return true;
    }
    console.error('[WebSocket] Cannot send command - not connected');
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    sendCommand,
    reconnect: connect,
  };
};

