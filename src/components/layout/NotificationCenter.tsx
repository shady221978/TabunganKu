import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationService, NotificationData } from '@/lib/notifications';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  userId: string;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = () => {
    const userNotifications = notificationService.getUserNotifications(userId);
    setNotifications(userNotifications);
    setUnreadCount(notificationService.getUnreadCount(userId));
  };

  useEffect(() => {
    loadNotifications();
    
    // Refresh notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        notificationService.markAsRead(n.id);
      }
    });
    loadNotifications();
  };

  const handleClearAll = () => {
    notificationService.clearUserNotifications(userId);
    loadNotifications();
  };

  const handleNotificationClick = (notification: NotificationData) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate if has URL
    if (notification.data?.url) {
      setIsOpen(false);
      navigate(notification.data.url);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-sm">Notifikasi</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                Tandai Semua
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearAll}
                className="h-8 w-8"
                title="Hapus Semua"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-medium">Tidak ada notifikasi</p>
              <p className="text-xs text-gray-400 mt-1">Notifikasi Anda akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group",
                    !notification.read && "bg-blue-50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-2xl mt-0.5">
                      {notification.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm mb-1",
                        !notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(notification.timestamp)}
                      </p>
                    </div>

                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          title="Tandai sudah dibaca"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t px-4 py-2 text-center">
            <p className="text-xs text-gray-500">
              {unreadCount > 0 
                ? `${unreadCount} notifikasi belum dibaca`
                : 'Semua notifikasi sudah dibaca'
              }
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
