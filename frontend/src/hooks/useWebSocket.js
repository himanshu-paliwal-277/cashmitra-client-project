import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const wsUrl = `${url}?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Send authentication message
        ws.send(
          JSON.stringify({
            type: 'auth',
            token: token,
          })
        );
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);

          // Handle different message types
          if (options.onMessage) {
            options.onMessage(data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = event => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Maximum reconnection attempts reached');
        }
      };

      ws.onerror = error => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

      setSocket(ws);
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [url, maxReconnectAttempts, reconnectInterval, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socket) {
      socket.close(1000, 'Manual disconnect');
    }

    setSocket(null);
    setIsConnected(false);
    setError(null);
  }, [socket]);

  const sendMessage = useCallback(
    message => {
      if (socket && isConnected) {
        try {
          socket.send(JSON.stringify(message));
          return true;
        } catch (err) {
          console.error('Error sending WebSocket message:', err);
          setError('Failed to send message');
          return false;
        }
      }
      return false;
    },
    [socket, isConnected]
  );

  const subscribe = useCallback(
    channel => {
      return sendMessage({
        type: 'subscribe',
        channel: channel,
      });
    },
    [sendMessage]
  );

  const unsubscribe = useCallback(
    channel => {
      return sendMessage({
        type: 'unsubscribe',
        channel: channel,
      });
    },
    [sendMessage]
  );

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.autoConnect]);

  return {
    socket,
    isConnected,
    error,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
  };
};

export default useWebSocket;
