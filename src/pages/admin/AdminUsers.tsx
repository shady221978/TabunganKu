import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { mockUsers, mockTransactions } from '@/lib/mockData';
import { Search, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const users = mockUsers.getUsers().filter(u => u.role === 'user');
  const allTransactions = mockTransactions.getTransactions();

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.memberNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserTransactionCount = (userId: string) => {
    return allTransactions.filter(t => t.userId === userId).length;
  };

  const handleEditBalance = (user: any) => {
    const newBalance = prompt(`Edit saldo untuk ${user.name}:\n\nSaldo saat ini: ${formatCurrency(user.balance)}\n\nMasukkan saldo baru (dalam Rupiah):`, user.balance.toString());
    
    if (newBalance !== null) {
      const amount = parseInt(newBalance);
      if (isNaN(amount) || amount < 0) {
        toast.error('Nominal tidak valid');
        return;
      }

      const allUsers = mockUsers.getUsers();
      const userIndex = allUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        allUsers[userIndex].balance = amount;
        mockUsers.saveUsers(allUsers);
        toast.success(`Saldo ${user.name} berhasil diubah menjadi ${formatCurrency(amount)}`);
        window.location.reload();
      }
    }
  };

  const handleEditPoints = (user: any) => {
    const newPoints = prompt(`Edit poin untuk ${user.name}:\n\nPoin saat ini: ${formatCurrency(user.points)}\n\nMasukkan poin baru:`, user.points.toString());
    
    if (newPoints !== null) {
      const amount = parseInt(newPoints);
      if (isNaN(amount) || amount < 0) {
        toast.error('Nominal tidak valid');
        return;
      }

      const allUsers = mockUsers.getUsers();
      const userIndex = allUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        allUsers[userIndex].points = amount;
        mockUsers.saveUsers(allUsers);
        toast.success(`Poin ${user.name} berhasil diubah menjadi ${formatCurrency(amount)}`);
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Kelola Anggota</h1>
          <p className="text-gray-600">Daftar semua anggota TabunganKu</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari anggota (nama, email, nomor anggota)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <p className="text-xs text-gray-500">Total Anggota</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(users.reduce((sum, u) => sum + u.balance, 0))}
            </div>
            <p className="text-xs text-gray-500">Total Saldo</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(users.reduce((sum, u) => sum + u.points, 0))}
            </div>
            <p className="text-xs text-gray-500">Total Poin</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{allTransactions.length}</div>
            <p className="text-xs text-gray-500">Total Transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Anggota ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Anggota</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Kontak</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">Saldo</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">Poin</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Transaksi</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photo} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full border-2 border-green-500"
                        />
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.memberNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(user.balance)}</p>
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-semibold text-blue-600">{formatCurrency(user.points)}</p>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">{getUserTransactionCount(user.id)}x</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBalance(user)}
                          title="Edit Saldo"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPoints(user)}
                          title="Edit Poin"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
