import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server:', newSocket.id);
      if (user?._id || user?.id) {
        newSocket.emit('join:user', user._id || user.id);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [SOCKET_URL]);

  useEffect(() => {
    if (socket && (user?._id || user?.id)) {
      socket.emit('join:user', user._id || user.id);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
