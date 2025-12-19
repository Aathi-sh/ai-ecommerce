import { useState, useCallback, useEffect, useRef } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false); // ✅ Changed from true to false
  const [position, setPosition] = useState('top-right');
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const timeoutRefs = useRef(new Map());

  // Track user interaction for audio permissions
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserHasInteracted(true);
    };

    // Listen for user interaction events
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedAudioPref = localStorage.getItem('notification_audio_enabled');
      if (savedAudioPref !== null) {
        setAudioEnabled(savedAudioPref === 'true');
      }
      
      const savedPosition = localStorage.getItem('notification_position');
      if (savedPosition && ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(savedPosition)) {
        setPosition(savedPosition);
      }
    } catch (error) {
      console.warn('Could not load notification preferences:', error);
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const newValue = !audioEnabled;
    setAudioEnabled(newValue);
    try {
      localStorage.setItem('notification_audio_enabled', newValue.toString());
      
      // If enabling audio, ensure user has interacted
      if (newValue && !userHasInteracted) {
        console.log('Audio enabled but user needs to interact with page first');
      }
    } catch (error) {
      console.warn('Could not save audio preference:', error);
    }
  }, [audioEnabled, userHasInteracted]);

  // Change position
  const setNotificationPosition = useCallback((newPosition) => {
    if (!['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(newPosition)) {
      console.warn('Invalid notification position:', newPosition);
      return;
    }
    setPosition(newPosition);
    try {
      localStorage.setItem('notification_position', newPosition);
    } catch (error) {
      console.warn('Could not save position preference:', error);
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    // Clear any pending timeout
    if (timeoutRefs.current.has(id)) {
      clearTimeout(timeoutRefs.current.get(id));
      timeoutRefs.current.delete(id);
    }
  }, []);

  // Play notification sound - FIXED with user interaction check
  const playNotificationSound = useCallback((type, customSoundUrl) => {
    // Don't play sound if audio is disabled
    if (!audioEnabled) return;
    
    // Don't play sound if user hasn't interacted with the page yet
    if (!userHasInteracted) {
      console.log('Audio skipped: User needs to interact with page first');
      return;
    }
    
    try {
      let soundUrl = customSoundUrl;
      
      if (!soundUrl) {
        switch (type) {
          case 'success':
            soundUrl = '/sounds/success.mp3';
            break;
          case 'error':
            soundUrl = '/sounds/error.mp3';
            break;
          case 'warning':
            soundUrl = '/sounds/warning.mp3';
            break;
          case 'info':
          default:
            soundUrl = '/sounds/info.mp3';
            break;
        }
      }
      
      // Use Web Audio API for better control
      const audio = new Audio(soundUrl);
      audio.volume = 0.3;
      
      // Play with error handling
      audio.play().catch((error) => {
        if (error.name === 'NotAllowedError') {
          console.warn('Audio playback blocked by browser. User needs to interact with page.');
          setUserHasInteracted(false); // Reset interaction flag
        } else if (error.name === 'NotSupportedError') {
          console.warn('Audio file not supported');
        } else {
          console.error('Error playing notification sound:', error);
        }
      });
    } catch (error) {
      console.error('Error creating audio:', error);
    }
  }, [audioEnabled, userHasInteracted]);

  // Show notification
  const showNotification = useCallback((title, message, type = 'info', duration = 5000, options = {}) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newNotification = {
      id,
      title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notification'),
      message: message || '',
      type: type || 'info',
      timestamp: new Date(),
      duration: typeof duration === 'number' ? duration : 5000,
      data: options.data || {},
      onClick: options.onClick,
      icon: options.icon,
      actions: options.actions || [],
      persistent: options.persistent || false,
    };

    setNotifications((prev) => {
      const newNotifications = [...prev, newNotification];
      
      // Limit maximum notifications (optional)
      if (newNotifications.length > 10) {
        return newNotifications.slice(-10); // Keep only last 10
      }
      return newNotifications;
    });

    // Auto remove after duration (if not persistent)
    if (duration > 0 && !options.persistent) {
      const timeoutId = setTimeout(() => {
        removeNotification(id);
        timeoutRefs.current.delete(id);
      }, duration);
      
      timeoutRefs.current.set(id, timeoutId);
    }

    // Play sound for important notifications - with better logic
    if (options.playSound !== false) { // Only play if not explicitly disabled
      const shouldPlaySound = audioEnabled && 
        (type === 'success' || type === 'error' || type === 'warning' || options.playSound);
      
      if (shouldPlaySound) {
        playNotificationSound(type, options.soundUrl);
      }
    }

    // Trigger vibration on mobile devices
    if (options.vibrate && 'vibrate' in navigator) {
      try {
        const pattern = Array.isArray(options.vibrate) ? options.vibrate : [200, 100, 200];
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Vibration failed:', error);
      }
    }

    // Log notification for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📢 Notification shown:', { id, title, type, duration });
    }

    return id;
  }, [audioEnabled, removeNotification, playNotificationSound]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    setNotifications([]);
  }, []);

  // Clear notifications by type
  const clearNotificationsByType = useCallback((type) => {
    setNotifications((prev) => {
      const remaining = prev.filter(n => n.type !== type);
      
      // Clear timeouts for removed notifications
      prev.forEach(notification => {
        if (notification.type === type && timeoutRefs.current.has(notification.id)) {
          clearTimeout(timeoutRefs.current.get(notification.id));
          timeoutRefs.current.delete(notification.id);
        }
      });
      
      return remaining;
    });
  }, []);

  // Update notification
  const updateNotification = useCallback((id, updates) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, ...updates, updatedAt: new Date() }
          : notification
      )
    );
  }, []);

  // Add notification (alias for showNotification with backward compatibility)
  const addNotification = useCallback((notification) => {
    const { title, message, type, duration, ...options } = notification;
    return showNotification(title, message, type, duration, options);
  }, [showNotification]);

  // Get notification count by type
  const getNotificationCount = useCallback((type) => {
    if (!type) return notifications.length;
    return notifications.filter(n => n.type === type).length;
  }, [notifications]);

  // Check if there are unread notifications
  const hasUnreadNotifications = useCallback(() => {
    return notifications.length > 0;
  }, [notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    // This could be extended to update notifications with a 'read' property
    console.log('All notifications marked as read');
  }, []);

  // Get position styles for NotificationToast component
  const getPositionStyle = useCallback(() => {
    switch (position) {
      case 'top-left':
        return { top: '1rem', left: '1rem' };
      case 'bottom-left':
        return { bottom: '1rem', left: '1rem' };
      case 'bottom-right':
        return { bottom: '1rem', right: '1rem' };
      case 'top-right':
      default:
        return { top: '1rem', right: '1rem' };
    }
  }, [position]);

  // Enable audio with user interaction
  const enableAudioWithPermission = useCallback(() => {
    if (!userHasInteracted) {
      console.log('Please click/tap somewhere on the page to enable audio');
      return false;
    }
    
    setAudioEnabled(true);
    try {
      localStorage.setItem('notification_audio_enabled', 'true');
    } catch (error) {
      console.warn('Could not save audio preference:', error);
    }
    
    // Test audio to ensure it works
    try {
      const audio = new Audio();
      audio.volume = 0.1;
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ'; // Silent audio
      audio.play().then(() => {
        console.log('✅ Audio enabled successfully');
      }).catch(() => {
        console.warn('⚠️ Audio may still be blocked by browser');
      });
    } catch (error) {
      console.error('Audio test failed:', error);
    }
    
    return true;
  }, [userHasInteracted]);

  return {
    // State
    notifications,
    audioEnabled,
    position,
    userHasInteracted,
    
    // Actions
    showNotification,
    addNotification,
    removeNotification,
    updateNotification,
    clearNotifications,
    clearNotificationsByType,
    
    // Settings
    toggleAudio,
    setNotificationPosition,
    enableAudioWithPermission, // New: safer way to enable audio
    
    // Helpers
    getNotificationCount,
    hasUnreadNotifications,
    markAllAsRead,
    getPositionStyle,
    
    // For debugging/development
    _dev: process.env.NODE_ENV === 'development' ? {
      getTimeoutCount: () => timeoutRefs.current.size,
      clearAllTimeouts: () => {
        timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
        timeoutRefs.current.clear();
      },
      getUserInteractionStatus: () => userHasInteracted,
    } : undefined,
  };
};