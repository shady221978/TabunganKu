import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, Users, ArrowDownCircle, ArrowUpCircle, Settings, FileText, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import NotificationPermission from '@/components/layout/NotificationPermission';
import NotificationCenter from '@/components/layout/NotificationCenter';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Kelola Anggota', path: '/admin/users' },
    { icon: ArrowUpCircle, label: 'Verifikasi Setoran', path: '/admin/deposits' },
    { icon: ArrowDownCircle, label: 'Penarikan', path: '/admin/withdrawals' },
    { icon: FileText, label: 'Laporan', path: '/admin/reports' },
    { icon: Settings, label: 'Pengaturan', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                💰
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">TabunganKu</span>
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">ADMIN</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {user && <NotificationCenter userId={user.id} />}
            
            <div className="flex items-center gap-3">
              <img src={user?.photo} alt={user?.name} className="w-10 h-10 rounded-full border-2 border-green-500" />
              <div className="hidden md:block text-left">
                <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Keluar">
              <LogOut className="w-5 h-5 text-red-600" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-[65px] left-0 h-[calc(100vh-65px)] bg-white border-r border-gray-200 transition-transform duration-300 z-40 flex-shrink-0",
          "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                    isActive 
                      ? "bg-green-50 text-green-600" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Permission Banner */}
      <NotificationPermission />
    </div>
  );
}
