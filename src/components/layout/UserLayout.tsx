import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Home, User, ArrowUpCircle, ArrowDownCircle, History, Users, Info, LogOut, Target, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, arePointsUnlocked } from '@/lib/utils';
import NotificationPermission from '@/components/layout/NotificationPermission';
import NotificationCenter from '@/components/layout/NotificationCenter';

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Beranda', path: '/' },
    { icon: ArrowUpCircle, label: 'Setor', path: '/deposit' },
    { icon: ArrowDownCircle, label: 'Tarik', path: '/withdraw' },
    { icon: History, label: 'Riwayat', path: '/transactions' },
    { icon: Target, label: 'Tujuan', path: '/savings-goal' },
    { icon: Coins, label: 'Poin', path: '/points-withdraw' },
    { icon: Info, label: 'Tentang', path: '/about' },
  ];

  const pointsUnlocked = user ? arePointsUnlocked(user) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row: Logo + User controls */}
          <div className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                💰
              </div>
              <span className="text-xl font-bold text-gray-900">TabunganKu</span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isPoints = item.path === '/points-withdraw';
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
                    {item.label}
                    {isPoints && pointsUnlocked && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User + notifications */}
            <div className="flex items-center gap-1">
              {user && <NotificationCenter userId={user.id} />}
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
              >
                <img
                  src={user?.photo}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border-2 border-green-500 object-cover"
                />
                <div className="hidden lg:block text-left">
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-500 leading-tight">{user?.memberNumber}</p>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} title="Keluar" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-40">
        <div className="grid grid-cols-7 px-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isPoints = item.path === '/points-withdraw';
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-2 rounded-lg transition-colors relative",
                  isActive ? "text-green-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-6 rounded-md mb-0.5 transition-colors relative",
                  isActive ? "bg-green-50" : ""
                )}>
                  <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
                  {isPoints && pointsUnlocked && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
                  )}
                </div>
                <span className="text-[9px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Notification Permission Banner */}
      <NotificationPermission />
    </div>
  );
}
