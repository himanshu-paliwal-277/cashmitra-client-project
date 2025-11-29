import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle,
  Package,
  DollarSign,
  User,
  TrendingUp,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

// Styled Components
const NotificationContainer = styled.div`
  position: relative;
`;

const NotificationButton = styled.button`
  position: relative;
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${props => props.theme.colors.gray[50]};
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  background: #EF4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.25rem;
`;

const NotificationPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 600px;
  background: ${props => props.theme.colors.white};
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid ${props => props.theme.colors.border};
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
  display: ${props => props.isOpen ? 'block' : 'none'};

  @media (max-width: 480px) {
    width: 320px;
    right: -100px;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.gray[50]};
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const NotificationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.25rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text};
  }
`;

const NotificationList = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: start;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.isRead ? 'transparent' : props.theme.colors.blue[50]};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.gray[50]};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationText = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
  line-height: 1.4;
`;

const NotificationMeta = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const NotificationTime = styled.span``;

const NotificationCategory = styled.span`
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  background: ${props => props.theme.colors.gray[100]};
  font-weight: 500;
`;

const NotificationActions2 = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
`;

const QuickAction = styled.button`
  padding: 0.25rem;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: ${props => props.theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyText = styled.div`
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
`;

const Toast = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${props => props.theme.colors.white};
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid ${props => props.color};
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const ToastIcon = styled.div`
  color: ${props => props.color};
  flex-shrink: 0;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const ToastMessage = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ToastClose = styled.button`
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
  }
`;

// Notification Types
const NOTIFICATION_TYPES = {
  ORDER_NEW: { icon: Package, color: '#3B82F6', category: 'Orders' },
  ORDER_UPDATED: { icon: Package, color: '#F59E0B', category: 'Orders' },
  ORDER_COMPLETED: { icon: CheckCircle, color: '#10B981', category: 'Orders' },
  ORDER_CANCELLED: { icon: XCircle, color: '#EF4444', category: 'Orders' },
  PAYMENT_RECEIVED: { icon: DollarSign, color: '#10B981', category: 'Payments' },
  PAYMENT_FAILED: { icon: AlertCircle, color: '#EF4444', category: 'Payments' },
  USER_REGISTERED: { icon: User, color: '#8B5CF6', category: 'Users' },
  INVENTORY_LOW: { icon: AlertCircle, color: '#F59E0B', category: 'Inventory' },
  SYSTEM_UPDATE: { icon: Settings, color: '#6B7280', category: 'System' },
  ANALYTICS_ALERT: { icon: TrendingUp, color: '#3B82F6', category: 'Analytics' }
};

// Main Component
const RealTimeNotifications = ({ 
  notifications = [], 
  onNotificationRead, 
  onNotificationDelete, 
  onMarkAllRead,
  soundEnabled = true,
  onSoundToggle 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [filter, setFilter] = useState('all');
  const panelRef = useRef(null);
  const audioRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play notification sound
  useEffect(() => {
    if (soundEnabled && notifications.length > 0) {
      const latestNotification = notifications[0];
      if (latestNotification && !latestNotification.isRead) {
        // Create audio element for notification sound
        if (!audioRef.current) {
          audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        }
        audioRef.current.play().catch(() => {
          // Ignore audio play errors (browser restrictions)
        });
      }
    }
  }, [notifications, soundEnabled]);

  // Show toast for new notifications
  useEffect(() => {
    const newNotifications = notifications.filter(n => !n.isRead).slice(0, 3);
    newNotifications.forEach(notification => {
      showToast(notification);
    });
  }, [notifications]);

  const showToast = (notification) => {
    const toastId = Date.now() + Math.random();
    const notificationType = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.SYSTEM_UPDATE;
    
    const toast = {
      id: toastId,
      title: getNotificationTitle(notification),
      message: notification.message,
      color: notificationType.color,
      icon: notificationType.icon
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      removeToast(toastId);
    }, 5000);
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  const getNotificationTitle = (notification) => {
    switch (notification.type) {
      case 'ORDER_NEW': return 'New Order';
      case 'ORDER_UPDATED': return 'Order Updated';
      case 'ORDER_COMPLETED': return 'Order Completed';
      case 'ORDER_CANCELLED': return 'Order Cancelled';
      case 'PAYMENT_RECEIVED': return 'Payment Received';
      case 'PAYMENT_FAILED': return 'Payment Failed';
      case 'USER_REGISTERED': return 'New User';
      case 'INVENTORY_LOW': return 'Low Inventory';
      case 'SYSTEM_UPDATE': return 'System Update';
      case 'ANALYTICS_ALERT': return 'Analytics Alert';
      default: return 'Notification';
    }
  };

  const getNotificationIcon = (type) => {
    const notificationType = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.SYSTEM_UPDATE;
    const IconComponent = notificationType.icon;
    return <IconComponent size={20} />;
  };

  const getNotificationColor = (type) => {
    const notificationType = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.SYSTEM_UPDATE;
    return notificationType.color;
  };

  const getNotificationCategory = (type) => {
    const notificationType = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.SYSTEM_UPDATE;
    return notificationType.category;
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return getNotificationCategory(notification.type).toLowerCase() === filter;
  });

  const categories = ['all', 'orders', 'payments', 'users', 'inventory', 'system', 'analytics'];

  return (
    <>
      <NotificationContainer ref={panelRef}>
        <NotificationButton onClick={() => setIsOpen(!isOpen)}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <NotificationBadge>
              {unreadCount > 99 ? '99+' : unreadCount}
            </NotificationBadge>
          )}
        </NotificationButton>

        <NotificationPanel isOpen={isOpen}>
          <NotificationHeader>
            <NotificationTitle>Notifications</NotificationTitle>
            <NotificationActions>
              <ActionButton 
                onClick={onSoundToggle}
                title={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </ActionButton>
              <ActionButton onClick={onMarkAllRead} title="Mark all as read">
                <Check size={16} />
              </ActionButton>
              <ActionButton onClick={() => setIsOpen(false)} title="Close">
                <X size={16} />
              </ActionButton>
            </NotificationActions>
          </NotificationHeader>

          {/* Filter Tabs */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    border: 'none',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    background: filter === category ? '#3B82F6' : '#F3F4F6',
                    color: filter === category ? 'white' : '#6B7280',
                    transition: 'all 0.2s'
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <NotificationList>
            {filteredNotifications.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <Bell size={24} />
                </EmptyIcon>
                <EmptyText>No notifications</EmptyText>
                <EmptySubtext>You're all caught up!</EmptySubtext>
              </EmptyState>
            ) : (
              filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  isRead={notification.isRead}
                  onClick={() => onNotificationRead(notification.id)}
                >
                  <NotificationIcon color={getNotificationColor(notification.type)}>
                    {getNotificationIcon(notification.type)}
                  </NotificationIcon>
                  
                  <NotificationContent>
                    <NotificationText>{notification.message}</NotificationText>
                    <NotificationMeta>
                      <NotificationTime>{formatTime(notification.timestamp)}</NotificationTime>
                      <NotificationCategory>
                        {getNotificationCategory(notification.type)}
                      </NotificationCategory>
                    </NotificationMeta>
                  </NotificationContent>

                  <NotificationActions2>
                    <QuickAction
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotificationDelete(notification.id);
                      }}
                      title="Delete notification"
                    >
                      <X size={14} />
                    </QuickAction>
                  </NotificationActions2>
                </NotificationItem>
              ))
            )}
          </NotificationList>
        </NotificationPanel>
      </NotificationContainer>

      {/* Toast Notifications */}
      <ToastContainer>
        {toasts.map(toast => {
          const IconComponent = toast.icon;
          return (
            <Toast key={toast.id} color={toast.color}>
              <ToastIcon color={toast.color}>
                <IconComponent size={20} />
              </ToastIcon>
              <ToastContent>
                <ToastTitle>{toast.title}</ToastTitle>
                <ToastMessage>{toast.message}</ToastMessage>
              </ToastContent>
              <ToastClose onClick={() => removeToast(toast.id)}>
                <X size={16} />
              </ToastClose>
            </Toast>
          );
        })}
      </ToastContainer>
    </>
  );
};

export default RealTimeNotifications;