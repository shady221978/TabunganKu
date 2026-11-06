import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth';
import SplashScreen from '@/components/layout/SplashScreen';
import { soundService } from '@/lib/sound';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// User Pages
import UserDashboard from '@/pages/user/UserDashboard';
import UserProfile from '@/pages/user/UserProfile';
import DepositPage from '@/pages/user/DepositPage';
import WithdrawPage from '@/pages/user/WithdrawPage';
import TransactionHistory from '@/pages/user/TransactionHistory';
import ReferralPage from '@/pages/user/ReferralPage';
import AboutPage from '@/pages/user/AboutPage';
import SavingsGoalPage from '@/pages/user/SavingsGoalPage';
import PointsWithdrawPage from '@/pages/user/PointsWithdrawPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminDeposits from '@/pages/admin/AdminDeposits';
import AdminWithdrawals from '@/pages/admin/AdminWithdrawals';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminReports from '@/pages/admin/AdminReports';

// Error Page
import NotFoundPage from '@/pages/NotFoundPage';

// Route Guards
import PrivateRoute from '@/components/layout/PrivateRoute';
import AdminRoute from '@/components/layout/AdminRoute';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Unlock AudioContext on first user interaction (required by all browsers)
  useEffect(() => {
    const unlock = () => {
      soundService.unlock();
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* User Routes */}
          <Route path="/" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/deposit" element={<PrivateRoute><DepositPage /></PrivateRoute>} />
          <Route path="/withdraw" element={<PrivateRoute><WithdrawPage /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
          <Route path="/referral" element={<PrivateRoute><ReferralPage /></PrivateRoute>} />
          <Route path="/about" element={<PrivateRoute><AboutPage /></PrivateRoute>} />
          <Route path="/savings-goal" element={<PrivateRoute><SavingsGoalPage /></PrivateRoute>} />
          <Route path="/points-withdraw" element={<PrivateRoute><PointsWithdrawPage /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/deposits" element={<AdminRoute><AdminDeposits /></AdminRoute>} />
          <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
