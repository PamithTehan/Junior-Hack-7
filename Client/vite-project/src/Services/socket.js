import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

let socket = null;

export const initializeSocket = (token) => {
  // If socket exists and is connected, return it
  if (socket?.connected) {
    return socket;
  }

  // If socket exists but not connected, disconnect and create new one
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  if (!token) {
    console.warn('Cannot initialize socket: No token provided');
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    transports: ['polling', 'websocket'], // Try polling first, then websocket
    reconnection: true,
    reconnectionDelay: 2000, // Wait 2 seconds before retrying
    reconnectionAttempts: 3, // Limit reconnection attempts to avoid spam
    reconnectionDelayMax: 5000,
    timeout: 10000, // Reduce timeout to fail faster
    autoConnect: true,
    forceNew: false,
    // Suppress connection errors when server is not available
    extraHeaders: {},
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.IO disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    // Suppress connection refused errors (server not running) to avoid console spam
    // Only log other types of connection errors
    const isConnectionRefused = error.message?.includes('xhr poll error') || 
                                 error.message?.includes('ERR_CONNECTION_REFUSED') ||
                                 error.type === 'TransportError';
    
    if (!isConnectionRefused && import.meta.env.DEV) {
      console.error('Socket.IO connection error:', error.message);
    }
    // Don't disconnect on error, let it retry silently
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    // Remove all listeners before disconnecting
    socket.removeAllListeners();
    if (socket.connected) {
      socket.disconnect();
    }
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

// Helper functions for emitting events
export const emitFoodAdded = (data) => {
  if (socket?.connected) {
    socket.emit('food:added', data);
  }
};

export const emitFoodRemoved = (data) => {
  if (socket?.connected) {
    socket.emit('food:removed', data);
  }
};

export const emitMealPlanGenerated = (data) => {
  if (socket?.connected) {
    socket.emit('mealplan:generated', data);
  }
};

export const emitProfileUpdated = (data) => {
  if (socket?.connected) {
    socket.emit('profile:updated', data);
  }
};

