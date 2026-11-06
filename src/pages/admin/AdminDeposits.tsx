import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { mockTransactions, mockUsers } from '@/lib/mockData';
import { notificationService } from '@/lib/notifications';
import { CheckCircle, XCircle, Clock, AlertCircle, Image as ImageIcon, X, BellRing, Volume2 } from 'lucide-react';
import { soundService } from '@/lib/sound';
import { toast } from 'sonner';

export default function AdminDeposits() {
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [incomingAlert, setIncomingAlert] = useState<{ name: string; amount: number } | null>(null);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const prevCountRef = useRef<number>(-1);

  const users = mockUsers.getUsers();

  const loadDeposits = () => {
    const allTx = mockTransactions.getTransactions();
    return allTx
      .filter(t => t.type === 'deposit' && t.paymentProof)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  useEffect(() => {
    const initial = loadDeposits();
    setDeposits(initial);
    prevCountRef.current = initial.filter((d: any) => d.proofStatus === 'pending').length;

    // Poll every 3 seconds to detect new deposits
    const interval = setInterval(() => {
      const fresh = loadDeposits();
      const freshPending = fresh.filter((d: any) => d.proofStatus === 'pending');

      if (prevCountRef.current >= 0 && freshPending.length > prevCountRef.current) {
        // New incoming deposit detected
        const newest = freshPending[0];
        const user = users.find((u: any) => u.id === newest.userId);
        if (user) {
          setIncomingAlert({ name: user.name, amount: newest.amount });
          setNewItemId(newest.id);
          setTimeout(() => setIncomingAlert(null), 7000);
          setTimeout(() => setNewItemId(null), 5000);
          // Play alert sound + vibrate
          soundService.playNewDeposit();
        }
      }
      prevCountRef.current = freshPending.length;
      setDeposits(fresh);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const pendingDeposits = deposits.filter((d: any) => d.proofStatus === 'pending');
  const processedDeposits = deposits.filter((d: any) => d.proofStatus !== 'pending');

  const handleVerify = (deposit: any) => {
    const allTransactions = mockTransactions.getTransactions();
    const index = allTransactions.findIndex((t: any) => t.id === deposit.id);

    if (index !== -1) {
      allTransactions[index].status = 'completed';
      allTransactions[index].proofStatus = 'verified';
      allTransactions[index].processedAt = new Date().toISOString();
      allTransactions[index].processedBy = 'Admin';
      allTransactions[index].notes = notes || 'Bukti transfer terverifikasi';

      mockTransactions.saveTransactions(allTransactions);

      // Update user balance and points + points-unlock countdown
      const allUsers = mockUsers.getUsers();
      const userIndex = allUsers.findIndex((u: any) => u.id === deposit.userId);
      if (userIndex !== -1) {
        allUsers[userIndex].balance += deposit.amount;
        allUsers[userIndex].points += (deposit.pointsEarned || 0);

        // Set firstDepositApprovedDate if not yet set
        if (!allUsers[userIndex].firstDepositApprovedDate) {
          allUsers[userIndex].firstDepositApprovedDate = new Date().toISOString();
        }

        // Reduce dayOffset for new deposit (Rp10k = -1 day)
        const currentOffset = allUsers[userIndex].pointsDayOffset ?? 0;
        const depositUnits = Math.floor(deposit.amount / 10000);
        allUsers[userIndex].pointsDayOffset = Math.max(0, currentOffset - depositUnits);

        mockUsers.saveUsers(allUsers);
      }

      // Send notification to user
      notificationService.notifyUserDepositStatus(
        deposit.userId,
        'verified',
        deposit.amount,
        deposit.pointsEarned || 0,
        notes || 'Bukti transfer terverifikasi'
      );

      toast.success(`Setoran ${formatCurrency(deposit.amount)} berhasil diverifikasi`);
      setSelectedDeposit(null);
      setNotes('');
      setDeposits(loadDeposits());
    }
  };

  const handleReject = (deposit: any) => {
    if (!notes) {
      toast.error('Harap berikan alasan penolakan');
      return;
    }

    const allTransactions = mockTransactions.getTransactions();
    const index = allTransactions.findIndex((t: any) => t.id === deposit.id);

    if (index !== -1) {
      allTransactions[index].status = 'rejected';
      allTransactions[index].proofStatus = 'rejected';
      allTransactions[index].processedAt = new Date().toISOString();
      allTransactions[index].processedBy = 'Admin';
      allTransactions[index].notes = notes;

      mockTransactions.saveTransactions(allTransactions);

      notificationService.notifyUserDepositStatus(
        deposit.userId,
        'rejected',
        deposit.amount,
        0,
        notes
      );

      toast.success('Setoran ditolak');
      setSelectedDeposit(null);
      setNotes('');
      setDeposits(loadDeposits());
    }
  };

  return (
    <div className="space-y-6">
      {/* Incoming notification banner */}
      {incomingAlert && (
        <div className="fixed top-20 right-4 z-50">
          <div className="bg-white border-2 border-green-500 rounded-2xl shadow-2xl p-4 max-w-xs flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BellRing className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">🔔 Bukti Transfer Masuk!</p>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                <span className="font-semibold text-green-700">{incomingAlert.name}</span> mengirim bukti transfer
              </p>
              <p className="text-base font-bold text-green-700 mt-1">{formatCurrency(incomingAlert.amount)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Menunggu verifikasi Anda</p>
            </div>
            <button onClick={() => setIncomingAlert(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Verifikasi Setoran</h1>
          <p className="text-gray-600">Periksa dan verifikasi bukti transfer dari anggota</p>
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
                <div className="text-2xl font-bold text-gray-900">{pendingDeposits.length}</div>
                <p className="text-xs text-gray-500">Menunggu Verifikasi</p>
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
                  {deposits.filter((d: any) => d.proofStatus === 'verified').length}
                </div>
                <p className="text-xs text-gray-500">Terverifikasi</p>
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
                  {deposits.filter((d: any) => d.proofStatus === 'rejected').length}
                </div>
                <p className="text-xs text-gray-500">Ditolak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Deposits */}
      {pendingDeposits.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Menunggu Verifikasi ({pendingDeposits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDeposits.map((d: any) => {
                const user = users.find((u: any) => u.id === d.userId);
                if (!user) return null;
                const isNew = newItemId === d.id;

                return (
                  <div
                    key={d.id}
                    className={`border-2 rounded-lg p-4 transition-all duration-700 ${
                      isNew
                        ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    {isNew && (
                      <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold w-fit">
                        <BellRing className="w-3.5 h-3.5" />
                        Bukti Transfer Baru Masuk!
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <img
                        src={user.photo}
                        alt={user.name}
                        className={`w-14 h-14 rounded-full border-2 ${isNew ? 'border-green-500' : 'border-yellow-500'}`}
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.memberNumber}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(d.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(d.amount)}</p>
                            <p className="text-sm text-gray-600">+{formatCurrency(d.pointsEarned || 0)} poin</p>
                            <Badge variant="outline" className="mt-1">{d.paymentMethod?.toUpperCase()}</Badge>
                          </div>
                        </div>

                        {/* Payment Proof Preview */}
                        <div className="mb-3 bg-white p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <img
                              src={d.paymentProof}
                              alt="Bukti Transfer"
                              className="w-24 h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setPreviewImage(d.paymentProof)}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm mb-1">Bukti Transfer</p>
                              <p className="text-xs text-gray-600 mb-2">Klik untuk memperbesar</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewImage(d.paymentProof)}
                                className="gap-2"
                              >
                                <ImageIcon className="w-4 h-4" />
                                Lihat Full Size
                              </Button>
                            </div>
                          </div>
                        </div>

                        {selectedDeposit?.id === d.id ? (
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
                              <Button onClick={() => handleVerify(d)} className="flex-1 gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Verifikasi & Tambahkan Saldo
                              </Button>
                              <Button onClick={() => handleReject(d)} variant="destructive" className="flex-1 gap-2">
                                <XCircle className="w-4 h-4" />
                                Tolak
                              </Button>
                              <Button
                                onClick={() => { setSelectedDeposit(null); setNotes(''); }}
                                variant="outline"
                              >
                                Batal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button onClick={() => setSelectedDeposit(d)} className="w-full" variant="outline">
                            Proses Verifikasi
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

      {/* Empty state for pending */}
      {pendingDeposits.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-14 h-14 mx-auto text-green-400 mb-3" />
            <p className="text-gray-600 font-semibold">Semua setoran sudah diverifikasi</p>
            <p className="text-sm text-gray-400 mt-1">Akan muncul notifikasi saat ada bukti transfer baru</p>
          </CardContent>
        </Card>
      )}

      {/* Processed Deposits */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Riwayat Verifikasi ({processedDeposits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {processedDeposits.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada setoran yang diproses</p>
          ) : (
            <div className="space-y-3">
              {processedDeposits.map((d: any) => {
                const user = users.find((u: any) => u.id === d.userId);
                if (!user) return null;

                return (
                  <div key={d.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-gray-300"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-xs text-gray-500">{formatDateTime(d.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(d.amount)}</p>
                            <Badge className={d.proofStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {d.proofStatus === 'verified' ? '✓ Terverifikasi' : '✗ Ditolak'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={d.paymentProof}
                            alt="Bukti Transfer"
                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => setPreviewImage(d.paymentProof)}
                          />
                          <div className="text-sm text-gray-600">
                            <p><strong>Metode:</strong> {d.paymentMethod?.toUpperCase()}</p>
                            <p><strong>Diproses:</strong> {d.processedAt ? formatDateTime(d.processedAt) : '-'}</p>
                          </div>
                        </div>

                        {d.notes && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <strong>Catatan:</strong> {d.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={previewImage}
              alt="Bukti Transfer"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
