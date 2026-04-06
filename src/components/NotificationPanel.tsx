import { useState } from 'react';
import { X, Bell, Mail, Smartphone, CheckCircle, Trash2, CheckSquare } from 'lucide-react';

interface AppNotification {
  id: string;
  type: 'push' | 'email' | 'sms';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationPanelProps {
  onClose: () => void;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export default function NotificationPanel({ onClose, notifications, setNotifications }: NotificationPanelProps) {

  const markAsRead = (id: string) => {
    setNotifications((prev: AppNotification[]) => 
      prev.map((n: AppNotification) => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev: AppNotification[]) => prev.map((n: AppNotification) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: 'push' | 'email' | 'sms') => {
    switch (type) {
      case 'push':
        return <Bell className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'sms':
        return <Smartphone className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: 'push' | 'email' | 'sms') => {
    switch (type) {
      case 'push':
        return 'bg-blue-100 text-blue-700';
      case 'email':
        return 'bg-purple-100 text-purple-700';
      case 'sms':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
      <div className="bg-blue-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-7 h-7" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-blue-100 mt-2">Stay updated with real-time alerts</p>
      </div>

      {/* Notification Settings */}
      <div className="p-4 bg-gray-50 border-b-2 border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
          <h4 className="font-bold text-gray-800">Notification Preferences</h4>
          <div className="flex gap-2">
            <button 
              onClick={markAllAsRead}
              className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 font-medium"
            >
              <CheckSquare className="w-4 h-4" /> Mark all read
            </button>
            <button 
              onClick={clearAll}
              className="text-sm bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-blue-200">
            <div className={`p-1.5 rounded-lg ${getNotificationColor('push')}`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Push</p>
            </div>
            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
          </div>

          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-purple-200">
            <div className={`p-1.5 rounded-lg ${getNotificationColor('email')}`}>
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Email</p>
            </div>
            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
          </div>

          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-green-200">
            <div className={`p-1.5 rounded-lg ${getNotificationColor('sms')}`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">SMS</p>
            </div>
            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
             <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
             <p>No notifications right now.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                notification.read
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className={`font-bold truncate ${notification.read ? 'text-gray-700' : 'text-blue-900'}`}>
                      {notification.title}
                    </h5>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                       {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 w-full">{notification.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${getNotificationColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    {!notification.read && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 shadow-sm animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 text-center">
        💡 <span className="font-semibold">Smart Alerts:</span> You'll receive real-time notifications when food matches your radius.
      </div>
    </div>
  );
}
