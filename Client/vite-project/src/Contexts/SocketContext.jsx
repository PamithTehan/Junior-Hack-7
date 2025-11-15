import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { initializeSocket, disconnectSocket, getSocket } from '../Services/socket';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Get token from Redux state or localStorage
  const token = useSelector((state) => state.auth.token) || localStorage.getItem('token');

  useEffect(() => {
    // Only connect if authenticated and have a token
    if (!isAuthenticated || !token) {
      // Clean up if not authenticated
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    let socketInstance;
    try {
      socketInstance = initializeSocket(token);
      
      if (!socketInstance) {
        console.warn('Socket initialization returned null');
        return;
      }
      
      setSocket(socketInstance);

      const handleConnect = () => {
        setIsConnected(true);
        console.log('Socket connected in context');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        console.log('Socket disconnected in context');
      };

      const handleConnectError = (error) => {
        // Suppress connection refused errors (server not running) to avoid console spam
        const isConnectionRefused = error.message?.includes('xhr poll error') || 
                                     error.message?.includes('ERR_CONNECTION_REFUSED') ||
                                     error.type === 'TransportError';
        
        if (!isConnectionRefused && import.meta.env.DEV) {
          console.error('Socket connection error in context:', error);
        }
        setIsConnected(false);
      };

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('connect_error', handleConnectError);

      // Cleanup function
      return () => {
        if (socketInstance) {
          socketInstance.off('connect', handleConnect);
          socketInstance.off('disconnect', handleDisconnect);
          socketInstance.off('connect_error', handleConnectError);
        }
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
      setIsConnected(false);
    }
  }, [isAuthenticated, token]);

  const value = {
    socket,
    isConnected,
    emitFoodAdded: (data) => {
      if (socket?.connected) {
        socket.emit('food:added', data);
      }
    },
    emitFoodRemoved: (data) => {
      if (socket?.connected) {
        socket.emit('food:removed', data);
      }
    },
    emitMealPlanGenerated: (data) => {
      if (socket?.connected) {
        socket.emit('mealplan:generated', data);
      }
    },
    emitProfileUpdated: (data) => {
      if (socket?.connected) {
        socket.emit('profile:updated', data);
      }
    },
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

