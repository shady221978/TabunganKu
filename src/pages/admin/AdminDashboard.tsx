import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { mockUsers, mockTransactions, mockWithdrawals } from '@/lib/mockData';
import { Users, Wallet, Gift, Clock, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const users = mockUsers.getUsers();
  const transactions = mockTransactions.getTransactions();
  const withdrawals = mockWithdrawals.getWithdrawals();

  // Calculate stats
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

  // Today's transactions
  const today = new Date().toISOString().split('T')[0];
  const todayDeposits = transactions
    .filter(t => t.type === 'deposit' && t.createdAt.startsWith(today))
    .reduce((sum, t) => sum + t.amount, 0);
  const todayWithdrawals = withdrawals
    .filter(w => w.requestedAt.startsWith(today))
    .reduce((sum, w) => sum + w.amount, 0);

  // Monthly data for charts (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const deposits = transactions
      .filter(t => t.type === 'deposit' && t.createdAt.startsWith(date))
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawalsAmount = withdrawals
      .filter(w => w.requestedAt.startsWith(date))
      .reduce((sum, w) => sum + w.amount, 0);
    
    return {
      date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      Setoran: deposits,
      Penarikan: withdrawalsAmount,
    };
  });

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel administrasi TabunganKu</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
            <p className="text-xs text-gray-500">Total Anggota</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-gray-500">Total Saldo</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPoints)}</div>
            <p className="text-xs text-gray-500">Total Poin</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{pendingWithdrawals}</div>
            <p className="text-xs text-gray-500">Penarikan Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Setoran Hari Ini</p>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(todayDeposits)}</div>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Penarikan Hari Ini</p>
                <div className="text-3xl font-bold text-red-600">{formatCurrency(todayWithdrawals)}</div>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Grafik Transaksi 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="Setoran" fill="#22c55e" />
              <Bar dataKey="Penarikan" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map(t => {
              const user = users.find(u => u.id === t.userId);
              return (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {t.type === 'deposit' ? 
                        <ArrowUpCircle className="w-5 h-5 text-green-600" /> : 
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{t.type === 'deposit' ? 'Setoran' : 'Penarikan'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(t.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
