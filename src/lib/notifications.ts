import { User } from '@/types';
import { soundService } from '@/lib/sound';

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  body: string;
  icon?: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  
  constructor() {
    this.permission = this.getPermission();
  }

  // Get current notification permission
  getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    // Save permission preference
    localStorage.setItem('notificationPermission', permission);
    
    return permission;
  }

  // Show browser notification
  showNotification(title: string, options?: NotificationOptions): void {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (!('Notification' in window)) {
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo-192.png',
        badge: '/logo-192.png',
        ...options,
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Save notification to localStorage for retrieval
  private saveNotification(notification: NotificationData): void {
    const notifications = this.getStoredNotifications();
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  // Get all stored notifications
  private getStoredNotifications(): NotificationData[] {
    const notifications = localStorage.getItem('notifications');
    return notifications ? JSON.parse(notifications) : [];
  }

  // Get notifications for specific user
  getUserNotifications(userId: string): NotificationData[] {
    return this.getStoredNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notifications = this.getStoredNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

  // Clear all notifications for user
  clearUserNotifications(userId: string): void {
    const notifications = this.getStoredNotifications();
    const filtered = notifications.filter(n => n.userId !== userId);
    localStorage.setItem('notifications', JSON.stringify(filtered));
  }

  // Send notification to admin about new deposit proof
  notifyAdminNewDeposit(depositAmount: number, userName: string, playSound = true): void {
    const admins = this.getAdminUsers();
    
    admins.forEach(admin => {
      const notification: NotificationData = {
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: admin.id,
        title: '💰 Bukti Transfer Baru',
        body: `${userName} mengirim bukti transfer sebesar Rp ${depositAmount.toLocaleString('id-ID')}`,
        icon: '💰',
        data: { url: '/admin/deposits' },
        timestamp: new Date().toISOString(),
        read: false,
      };

      this.saveNotification(notification);

      // Show browser notification if permission granted
      if (this.permission === 'granted') {
        this.showNotification(notification.title, {
          body: notification.body,
          tag: 'deposit-proof',
          data: notification.data,
        });
      }
    });

    // Play sound + vibrate
    if (playSound) soundService.playNewDeposit();
  }

  // Send notification to admin about new withdrawal request
  notifyAdminNewWithdrawal(amount: number, userName: string, playSound = true): void {
    const admins = this.getAdminUsers();

    admins.forEach(admin => {
      const notification: NotificationData = {
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: admin.id,
        title: '💸 Pengajuan Penarikan Baru',
        body: `${userName} mengajukan penarikan sebesar Rp ${amount.toLocaleString('id-ID')}`,
        icon: '💸',
        data: { url: '/admin/withdrawals' },
        timestamp: new Date().toISOString(),
        read: false,
      };

      this.saveNotification(notification);

      if (this.permission === 'granted') {
        this.showNotification(notification.title, {
          body: notification.body,
          tag: 'withdrawal-request',
          data: notification.data,
        });
      }
    });

    if (playSound) soundService.playNewWithdrawal();
  }

  // Send notification to user about deposit verification
  notifyUserDepositStatus(
    userId: string,
    status: 'verified' | 'rejected',
    amount: number,
    points: number,
    notes?: string,
    playSound = true
  ): void {
    const isApproved = status === 'verified';
    
    const notification: NotificationData = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId,
      title: isApproved ? '✅ Setoran Disetujui!' : '❌ Setoran Ditolak',
      body: isApproved 
        ? `Setoran Rp ${amount.toLocaleString('id-ID')} telah disetujui. +${points.toLocaleString('id-ID')} poin bonus!`
        : `Setoran Rp ${amount.toLocaleString('id-ID')} ditolak. ${notes || 'Silakan hubungi admin'}`,
      icon: isApproved ? '✅' : '❌',
      data: { url: '/transactions' },
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.saveNotification(notification);

    // Show browser notification if permission granted
    if (this.permission === 'granted') {
      this.showNotification(notification.title, {
        body: notification.body,
        tag: 'deposit-status',
        data: notification.data,
      });
    }

    if (playSound) {
      if (isApproved) soundService.playApproved();
      else soundService.playRejected();
    }
  }

  // Send notification to user about withdrawal status
  notifyUserWithdrawalStatus(
    userId: string,
    status: 'approved' | 'rejected',
    amount: number,
    notes?: string,
    playSound = true
  ): void {
    const isApproved = status === 'approved';
    
    const notification: NotificationData = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId,
      title: isApproved ? '✅ Penarikan Disetujui!' : '❌ Penarikan Ditolak',
      body: isApproved 
        ? `Penarikan Rp ${amount.toLocaleString('id-ID')} telah disetujui dan sedang diproses`
        : `Penarikan Rp ${amount.toLocaleString('id-ID')} ditolak. ${notes || 'Silakan hubungi admin'}`,
      icon: isApproved ? '✅' : '❌',
      data: { url: '/transactions' },
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.saveNotification(notification);

    // Show browser notification if permission granted
    if (this.permission === 'granted') {
      this.showNotification(notification.title, {
        body: notification.body,
        tag: 'withdrawal-status',
        data: notification.data,
      });
    }

    if (playSound) {
      if (isApproved) soundService.playApproved();
      else soundService.playRejected();
    }
  }

  // Get admin users
  private getAdminUsers(): User[] {
    const users = localStorage.getItem('users');
    if (!users) return [];
    
    const allUsers: User[] = JSON.parse(users);
    return allUsers.filter(u => u.role === 'admin');
  }

  // Get unread count for user
  getUnreadCount(userId: string): number {
    return this.getUserNotifications(userId).filter(n => !n.read).length;
  }
}

export const notificationService = new NotificationService();
