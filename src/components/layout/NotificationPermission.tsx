import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { notificationService } from '@/lib/notifications';
import { toast } from 'sonner';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check initial permission
    const currentPermission = notificationService.getPermission();
    setPermission(currentPermission);

    // Check if banner was dismissed
    const dismissed = localStorage.getItem('notificationBannerDismissed');
    setIsDismissed(dismissed === 'true');

    // Show banner if permission is default and not dismissed
    if (currentPermission === 'default' && !dismissed) {
      setTimeout(() => setShowBanner(true), 2000);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast.success('Notifikasi berhasil diaktifkan! Anda akan menerima pemberitahuan penting');
      setShowBanner(false);
      
      // Show test notification
      notificationService.showNotification('🔔 Notifikasi Aktif!', {
        body: 'Anda akan menerima pemberitahuan untuk transaksi penting',
        tag: 'notification-enabled',
      });
    } else if (result === 'denied') {
      toast.error('Notifikasi ditolak. Anda dapat mengaktifkannya kembali di pengaturan browser');
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('notificationBannerDismissed', 'true');
  };

  if (!showBanner || isDismissed || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Card className="border-2 border-green-500 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Aktifkan Notifikasi Push
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Dapatkan pemberitahuan real-time untuk transaksi dan verifikasi Anda
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleEnableNotifications}
                  size="sm"
                  className="gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Aktifkan Sekarang
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <BellOff className="w-4 h-4" />
                  Nanti Saja
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
