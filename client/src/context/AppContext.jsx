import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [vibrationLevel, setVibrationLevel] = useState(0);
  const [displayMessage, setDisplayMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type, // 'info', 'warning', 'error', 'success'
      timestamp: new Date(),
    };
    setNotifications((prev) => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const addMessage = (content, sender = 'user') => {
    const message = {
      id: Date.now() + Math.random(),
      content,
      sender, // 'user' or 'esp32'
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value = {
    vibrationLevel,
    setVibrationLevel,
    displayMessage,
    setDisplayMessage,
    isRecording,
    setIsRecording,
    notifications,
    addNotification,
    removeNotification,
    messages,
    addMessage,
    clearMessages,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

