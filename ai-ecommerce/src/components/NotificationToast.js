import { useState, useEffect } from 'react';
import { useNotification } from "../../hooks/useNotification";
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  XMarkIcon,
  BellAlertIcon,
  ShoppingCartIcon,
  UserIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();
  const [isPaused, setIsPaused] = useState(false);

  // Auto-remove notifications after their duration
  useEffect(() => {
    if (notifications.length === 0 || isPaused) return;

    const autoRemoveTimers = notifications.map(notification => {
      if (notification.duration > 0) {
        return setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
      }
      return null;
    });

    return () => {
      autoRemoveTimers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [notifications, removeNotification, isPaused]);

  // Pause auto-removal when hovering
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (notifications.length === 0) return null;

  const getIcon = (type) => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'error':
        return <ExclamationCircleIcon className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <ExclamationCircleIcon className={`${iconClass} text-yellow-500`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
      case 'new_order':
        return <ShoppingCartIcon className={`${iconClass} text-purple-500`} />;
      case 'order_updated':
        return <BellAlertIcon className={`${iconClass} text-indigo-500`} />;
      case 'new_user':
        return <UserIcon className={`${iconClass} text-teal-500`} />;
      case 'security':
        return <ShieldExclamationIcon className={`${iconClass} text-orange-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'new_order':
        return 'bg-purple-50 border-purple-200';
      case 'order_updated':
        return 'bg-indigo-50 border-indigo-200';
      case 'new_user':
        return 'bg-teal-50 border-teal-200';
      case 'security':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-400';
      case 'error':
        return 'border-l-4 border-red-400';
      case 'warning':
        return 'border-l-4 border-yellow-400';
      case 'info':
        return 'border-l-4 border-blue-400';
      case 'new_order':
        return 'border-l-4 border-purple-400';
      case 'order_updated':
        return 'border-l-4 border-indigo-400';
      case 'new_user':
        return 'border-l-4 border-teal-400';
      case 'security':
        return 'border-l-4 border-orange-400';
      default:
        return 'border-l-4 border-gray-400';
    }
  };

  const handleNotificationClick = (notification) => {
    // Handle notification click action
    if (notification.data?.action) {
      window.dispatchEvent(new CustomEvent(notification.data.action, {
        detail: notification.data
      }));
    }
    
    // Close the notification
    removeNotification(notification.id);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 w-96 max-w-[calc(100vw-2rem)]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getBgColor(notification.type)}
            ${getBorderColor(notification.type)}
            rounded-r-lg shadow-lg p-4 
            transition-all duration-300 ease-out
            transform hover:scale-[1.02] hover:shadow-xl
            animate-slide-in-right
            cursor-pointer
          `}
          onClick={() => handleNotificationClick(notification)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {notification.message}
              </p>
              
              {/* Show data if available */}
              {notification.data && Object.keys(notification.data).length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {notification.data.orderId && (
                    <div>Order: #{notification.data.orderId}</div>
                  )}
                  {notification.data.userId && (
                    <div>User ID: {notification.data.userId}</div>
                  )}
                  {notification.data.timestamp && (
                    <div>Time: {new Date(notification.data.timestamp).toLocaleTimeString()}</div>
                  )}
                </div>
              )}
              
              <p className="mt-2 text-xs text-gray-400">
                {new Date(notification.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
            <button
              type="button"
              className="ml-4 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              aria-label="Close notification"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          </div>
          
          {/* Progress bar for auto-dismiss notifications */}
          {notification.duration > 0 && !isPaused && (
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 rounded-full animate-progress"
                style={{
                  animationDuration: `${notification.duration}ms`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                }}
              />
            </div>
          )}
        </div>
      ))}
      
      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-progress {
          animation: progress linear;
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;