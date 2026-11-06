import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { mockUsers, mockTransactions, mockWithdrawals } from '@/lib/mockData';
import { FileText, TrendingUp, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminReports() {
  const users = mockUsers.getUsers().filter(u => u.role === 'user');
  const transactions = mockTransactions.getTransactions();
  const withdrawals = mockWithdrawals.getWithdrawals();

  // Total calculations
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);

  // Monthly data (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      deposits: Math.floor(Math.random() * 10000000) + 5000000,
      withdrawals: Math.floor(Math.random() * 5000000) + 2000000,
    };
  });

  // User growth data
  const usersByMonth = users.reduce((acc, user) => {
    const month = new Date(user.registrationDate).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userGrowthData = Object.entries(usersByMonth).map(([month, count]) => ({
    month,
    users: count,
  }));

  // Transaction type distribution
  const depositCount = transactions.filter(t => t.type === 'deposit').length;
  const withdrawalCount = withdrawals.length;
  
  const transactionTypeData = [
    { name: 'Setoran', value: depositCount, color: '#22c55e' },
    { name: 'Penarikan', value: withdrawalCount, color: '#ef4444' },
  ];

  // Top users by balance
  const topUsers = [...users]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Laporan & Statistik</h1>
        <p className="text-gray-600">Analisis keuangan dan performa TabunganKu</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(totalDeposits)}</div>
            <p className="text-sm text-green-100">Total Setoran</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(totalWithdrawals)}</div>
            <p className="text-sm text-red-100">Total Penarikan</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(totalBalance)}</div>
            <p className="text-sm text-blue-100">Saldo Terkumpul</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{users.length}</div>
            <p className="text-sm text-purple-100">Total Anggota</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Tren Transaksi 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="deposits" fill="#22c55e" name="Setoran" />
                <Bar dataKey="withdrawals" fill="#ef4444" name="Penarikan" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Distribusi Jenis Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top 5 Anggota dengan Saldo Terbesar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-600' :
                  'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full border-2 border-green-500"
                />
                
                <div className="flex-1">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.memberNumber}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(user.balance)}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(user.points)} poin</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Ringkasan Statistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600">Rata-rata Saldo per Anggota</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(users.length > 0 ? totalBalance / users.length : 0)}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Transaksi</h3>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.length + withdrawals.length}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600">Poin Reward Terdistribusi</h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalPoints)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
