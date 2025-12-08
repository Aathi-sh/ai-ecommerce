import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FCMTokenManager from '@/components/admin/FCMTokenManager';
import NotificationToast from '@/components/admin/NotificationToast';
import { useNotification } from '@/hooks/useNotification';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Setup global notification handler
  useEffect(() => {
    if (user?.role === 'admin') {
      // Handle custom notification events
      const handleCustomNotification = (event) => {
        const { type, title, message, data } = event.detail;
        showNotification(title, message, type);
        
        // Refresh data based on notification type
        if (type === 'NEW_ORDER') {
          // Dispatch event to refresh orders
          window.dispatchEvent(new CustomEvent('refresh-orders'));
        }
      };

      window.addEventListener('admin-notification', handleCustomNotification);
      
      return () => {
        window.removeEventListener('admin-notification', handleCustomNotification);
      };
    }
  }, [user, showNotification]);

  return (
    <div className="admin-layout">
      {/* FCM Token Manager for Admin only */}
      {user?.role === 'admin' && <FCMTokenManager />}
      
      {/* Notification Toast Container */}
      <NotificationToast />
      
      {/* Main Content */}
      {children}
    </div>
  );
};

export default AdminLayout;