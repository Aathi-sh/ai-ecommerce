import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  // Show notification
  const showNotification = useCallback((title, message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      title,
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    // Play sound for important notifications
    if (type === 'success' || type === 'error') {
      playNotificationSound(type);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Play notification sound
  const playNotificationSound = (type) => {
    try {
      const audio = new Audio(
        type === 'success' 
          ? '/sounds/success.mp3' 
          : '/sounds/alert.mp3'
      );
      audio.volume = 0.3;
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  return {
    notifications,
    showNotification,
    removeNotification,
    clearNotifications,
  };
};