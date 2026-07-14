import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({}); // teamId -> Set of usernames
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const newSocket = io(backendUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });

    setSocket(newSocket);

    // Alert server we are online
    newSocket.emit('user_connected', user.id);

    newSocket.on('user_status_changed', ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    newSocket.on('notification_received', (notification) => {
      setLiveNotifications((prev) => [notification, ...prev]);
    });

    newSocket.on('typing_status', ({ teamId, username, isTyping }) => {
      setTypingUsers((prev) => {
        const currentSet = new Set(prev[teamId] || []);
        if (isTyping) {
          currentSet.add(username);
        } else {
          currentSet.delete(username);
        }
        return {
          ...prev,
          [teamId]: currentSet,
        };
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinTeamChat = (teamId) => {
    if (socket) {
      socket.emit('join_room', { teamId });
    }
  };

  const leaveTeamChat = (teamId) => {
    if (socket) {
      socket.emit('leave_room', { teamId });
    }
  };

  const sendChatMessage = (teamId, content, attachments) => {
    if (socket) {
      socket.emit('send_message', { teamId, content, attachments });
    }
  };

  const emitTypingStatus = (teamId, username, isTyping) => {
    if (socket) {
      socket.emit('typing', { teamId, username, isTyping });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        typingUsers,
        liveNotifications,
        setLiveNotifications,
        joinTeamChat,
        leaveTeamChat,
        sendChatMessage,
        emitTypingStatus,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
