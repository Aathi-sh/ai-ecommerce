import { useNotification } from '@/hooks/useNotification';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  XMarkIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'new_order':
        return <BellAlertIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-gray-500" />;
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
      case 'new_order':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-96 max-w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBgColor(
            notification.type
          )} rounded-lg border shadow-lg p-4 transition-all duration-300 animate-slide-in-right`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              type="button"
              className="ml-4 flex-shrink-0"
              onClick={() => removeNotification(notification.id)}
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;