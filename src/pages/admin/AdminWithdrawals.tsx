import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { mockWithdrawals, mockUsers } from '@/lib/mockData';
import { CheckCircle, XCircle, Clock, AlertCircle, Coins, Wallet, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { TRANSACTION_STATUS_COLORS } from '@/constants';
import { soundService } from '@/lib/sound';

export default function AdminWithdrawals() {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  
  const withdrawals = mockWithdrawals.getWithdrawals()
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const processedWithdrawals = withdrawals.filter(w => w.status !== 'pending');

  const handleApprove = (withdrawal: any) => {
    const allWithdrawals = mockWithdrawals.getWithdrawals();
    const index = allWithdrawals.findIndex(w => w.id === withdrawal.id);
    
    if (index !== -1) {
      allWithdrawals[index].status = 'approved';
      allWithdrawals[index].processedAt = new Date().toISOString();
      allWithdrawals[index].processedBy = 'Admin';
      allWithdrawals[index].notes = notes || 'Penarikan disetujui';
      
      mockWithdrawals.saveWithdrawals(allWithdrawals);

      const isPointsWithdrawal = withdrawal.bankName?.startsWith('[POIN]');
      if (!isPointsWithdrawal) {
        // Normal balance withdrawal: deduct points 2x and add day penalty
        const users = mockUsers.getUsers();
        const userIdx = users.findIndex(u => u.id === withdrawal.userId);
        if (userIdx !== -1) {
          const pointsPenalty = withdrawal.amount * 2;
          users[userIdx].points = Math.max(0, (users[userIdx].points ?? 0) - pointsPenalty);
          const currentOffset = users[userIdx].pointsDayOffset ?? 0;
          const penaltyDays = Math.floor(withdrawal.amount / 10000);
          users[userIdx].pointsDayOffset = currentOffset + penaltyDays;
          mockUsers.saveUsers(users);
        }
      }
      // For points withdrawal: points are already deducted upfront — no further action needed on approve

      const typeLabel = withdrawal.bankName?.startsWith('[POIN]') ? 'Poin' : 'Saldo';
      toast.success(`Penarikan ${typeLabel} ${withdrawal.userName} sebesar ${formatCurrency(withdrawal.amount)} disetujui`);
      setSelectedWithdrawal(null);
      setNotes('');
      window.location.reload();
    }
  };

  const handleReject = (withdrawal: any) => {
    if (!notes) {
      toast.error('Harap berikan alasan penolakan');
      return;
    }

    const allWithdrawals = mockWithdrawals.getWithdrawals();
    const index = allWithdrawals.findIndex(w => w.id === withdrawal.id);
    
    if (index !== -1) {
      allWithdrawals[index].status = 'rejected';
      allWithdrawals[index].processedAt = new Date().toISOString();
      allWithdrawals[index].processedBy = 'Admin';
      allWithdrawals[index].notes = notes;
      
      mockWithdrawals.saveWithdrawals(allWithdrawals);

      // Refund: if points withdrawal → refund points, else refund balance
      const usersR = mockUsers.getUsers();
      const userIndexR = usersR.findIndex(u => u.id === withdrawal.userId);
      if (userIndexR !== -1) {
        const isPointsWD = withdrawal.bankName?.startsWith('[POIN]');
        if (isPointsWD) {
          usersR[userIndexR].points = (usersR[userIndexR].points ?? 0) + withdrawal.amount;
        } else {
          usersR[userIndexR].balance += withdrawal.amount;
        }
        mockUsers.saveUsers(usersR);
      }

      const refundLabel = withdrawal.bankName?.startsWith('[POIN]') ? 'poin' : 'saldo';
      toast.success(`Penarikan ditolak, ${refundLabel} ${formatCurrency(withdrawal.amount)} dikembalikan`);
      
      setSelectedWithdrawal(null);
      setNotes('');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Kelola Penarikan</h1>
            <p className="text-gray-600">Setujui atau tolak permintaan penarikan dana</p>
          </div>
          {!soundUnlocked && (
            <button
              onClick={() => { soundService.unlock(); soundService.playPing(); setSoundUnlocked(true); }}
              className="flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              title="Aktifkan notifikasi suara"
            >
              <Volume2 className="w-4 h-4" />
              Aktifkan Suara
            </button>
          )}
          {soundUnlocked && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <Volume2 className="w-3.5 h-3.5" /> Suara Aktif
            </span>
          )}
        </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingWithdrawals.length}</div>
                <p className="text-xs text-gray-500">Menunggu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {withdrawals.filter(w => w.status === 'approved').length}
                </div>
                <p className="text-xs text-gray-500">Disetujui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {withdrawals.filter(w => w.status === 'rejected').length}
                </div>
                <p className="text-xs text-gray-500">Ditolak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Menunggu Persetujuan ({pendingWithdrawals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingWithdrawals.map(w => {
                const isPoinWD = w.bankName?.startsWith('[POIN]');
                const displayBank = isPoinWD ? w.bankName.replace('[POIN] ', '') : w.bankName;
                return (
                <div key={w.id} className={`border-2 rounded-lg p-4 ${isPoinWD ? 'border-yellow-400 bg-yellow-50' : 'border-orange-200 bg-orange-50'}`}>
                  <div className="flex items-start gap-4">
                    <img 
                      src={w.userPhoto} 
                      alt={w.userName} 
                      className={`w-14 h-14 rounded-full border-2 ${isPoinWD ? 'border-yellow-500' : 'border-orange-400'}`}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{w.userName}</h3>
                            <Badge className={isPoinWD ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-orange-100 text-orange-800 border border-orange-300'}>
                              {isPoinWD ? <><Coins className="w-3 h-3 mr-1 inline" />Poin Reward</> : <><Wallet className="w-3 h-3 mr-1 inline" />Saldo Utama</>}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(w.requestedAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isPoinWD ? 'text-yellow-600' : 'text-red-600'}`}>{formatCurrency(w.amount)}</p>
                          <p className="text-xs text-gray-500">Biaya: {formatCurrency(w.fee)}</p>
                          <p className="text-sm font-semibold text-green-600">Diterima: {formatCurrency(w.netAmount)}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-3 mb-3 text-sm">
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500 text-xs">Bank</p>
                          <p className="font-semibold">{displayBank}</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500 text-xs">No. Rekening</p>
                          <p className="font-semibold">{w.accountNumber}</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500 text-xs">Atas Nama</p>
                          <p className="font-semibold">{w.accountName}</p>
                        </div>
                      </div>

                      {selectedWithdrawal?.id === w.id ? (
                        <div className="space-y-3 mt-4 border-t pt-4">
                          <div>
                            <Label htmlFor="notes">Catatan</Label>
                            <Textarea
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Tambahkan catatan (wajib untuk penolakan)"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(w)}
                              className="flex-1 gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Setujui
                            </Button>
                            <Button
                              onClick={() => handleReject(w)}
                              variant="destructive"
                              className="flex-1 gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Tolak
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedWithdrawal(null);
                                setNotes('');
                              }}
                              variant="outline"
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedWithdrawal(w)}
                          className="w-full"
                          variant="outline"
                        >
                          Proses Penarikan
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Withdrawals */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Riwayat Penarikan ({processedWithdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {processedWithdrawals.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada penarikan yang diproses</p>
          ) : (
            <div className="space-y-3">
              {processedWithdrawals.map(w => (
                <div key={w.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <img 
                      src={w.userPhoto} 
                      alt={w.userName} 
                      className="w-12 h-12 rounded-full border-2 border-gray-300"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{w.userName}</h3>
                          <p className="text-xs text-gray-500">{formatDateTime(w.requestedAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(w.amount)}</p>
                          <Badge className={TRANSACTION_STATUS_COLORS[w.status]}>
                            {w.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-sm space-y-1 text-gray-600">
                        {w.bankName?.startsWith('[POIN]') && (
                          <Badge className="mb-1 bg-yellow-100 text-yellow-800 text-xs"><Coins className="w-3 h-3 mr-1 inline" />Penarikan Poin Reward</Badge>
                        )}
                        <p><strong>Bank:</strong> {w.bankName?.replace('[POIN] ', '')} - {w.accountNumber} ({w.accountName})</p>
                        <p><strong>Diproses:</strong> {w.processedAt ? formatDateTime(w.processedAt) : '-'}</p>
                        {w.notes && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <strong>Catatan:</strong> {w.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
