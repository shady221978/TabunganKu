import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatCurrency, arePointsUnlocked, getPointsDaysRemaining } from '@/lib/utils';
import { mockWithdrawals, mockUsers, mockSettings } from '@/lib/mockData';
import { notificationService } from '@/lib/notifications';
import { Gift, AlertTriangle, Coins, Clock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function PointsWithdrawPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendingStage, setSendingStage] = useState<null | 'preparing' | 'sending' | 'notifying' | 'done'>(null);
  const [sendingProgress, setSendingProgress] = useState(0);

  if (!user) return null;

  const settings = mockSettings.getSettings();
  const numAmount = parseInt(amount.replace(/\D/g, '')) || 0;
  const daysRemaining = getPointsDaysRemaining(user);
  const unlocked = arePointsUnlocked(user);
  const fee = Math.max((numAmount * settings.withdrawalFee) / 100, settings.withdrawalFeeFixed);
  const netAmount = numAmount - fee;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setAmount(value ? parseInt(value).toLocaleString('id-ID') : '');
  };

  const loadBankAccount = () => {
    if (user.bankAccount) {
      setBankName(user.bankAccount.bankName);
      setAccountNumber(user.bankAccount.accountNumber);
      setAccountName(user.bankAccount.accountName);
      toast.success('Data rekening dimuat');
    } else {
      toast.error('Anda belum mengatur rekening bank. Silakan atur di halaman Profil');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unlocked) {
      toast.error('Poin belum bisa ditarik. Tunggu hingga 100 hari.');
      return;
    }
    if (numAmount < settings.minWithdrawal) {
      toast.error(`Minimal penarikan poin ${formatCurrency(settings.minWithdrawal)}`);
      return;
    }
    if (numAmount > user.points) {
      toast.error('Poin tidak mencukupi');
      return;
    }
    if (!bankName || !accountNumber || !accountName) {
      toast.error('Lengkapi data rekening tujuan');
      return;
    }

    setIsLoading(true);
    setSendingStage('preparing');
    setSendingProgress(0);

    await new Promise(r => setTimeout(r, 600));
    setSendingProgress(15);
    await new Promise(r => setTimeout(r, 400));
    setSendingProgress(30);

    setSendingStage('sending');
    await new Promise(r => setTimeout(r, 500));
    setSendingProgress(50);

    // Deduct points immediately (will be refunded if admin rejects)
    const users = mockUsers.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      toast.error('User tidak ditemukan');
      setIsLoading(false);
      setSendingStage(null);
      return;
    }
    users[userIndex].points = Math.max(0, (users[userIndex].points ?? 0) - numAmount);
    mockUsers.saveUsers(users);
    // Update currentUser in localStorage so UI reflects immediately
    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    updateUser({ points: users[userIndex].points });

    // Record as withdrawal request with bankName prefixed "[POIN]"
    const allWithdrawals = mockWithdrawals.getWithdrawals();
    allWithdrawals.push({
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId: user.id,
      userName: user.name,
      userPhoto: user.photo,
      amount: numAmount,
      bankName: `[POIN] ${bankName}`,
      accountNumber,
      accountName,
      fee,
      netAmount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    });
    mockWithdrawals.saveWithdrawals(allWithdrawals);

    await new Promise(r => setTimeout(r, 500));
    setSendingProgress(70);

    setSendingStage('notifying');
    await new Promise(r => setTimeout(r, 400));
    setSendingProgress(85);
    notificationService.notifyAdminNewWithdrawal(numAmount, user.name);
    await new Promise(r => setTimeout(r, 500));
    setSendingProgress(100);

    setSendingStage('done');
    await new Promise(r => setTimeout(r, 1300));

    setIsLoading(false);
    setSendingStage(null);
    navigate('/transactions');
  };

  // Sending overlay
  if (sendingStage) {
    const stages = [
      { key: 'preparing', label: 'Menyiapkan data penarikan poin', icon: '📋', done: ['sending', 'notifying', 'done'].includes(sendingStage) },
      { key: 'sending', label: 'Mengirim pengajuan penarikan poin', icon: '💰', done: ['notifying', 'done'].includes(sendingStage) },
      { key: 'notifying', label: 'Mengirim notifikasi ke admin', icon: '🔔', done: ['done'].includes(sendingStage) },
    ];
    const activeIdx = stages.findIndex(s => s.key === sendingStage);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="min-h-[70vh] flex items-center justify-center">
          <Card className="border-0 shadow-2xl w-full max-w-md">
            <CardContent className="p-8 text-center">
              {sendingStage === 'done' ? (
                <>
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengajuan Terkirim!</h2>
                  <p className="text-gray-600 mb-1">Pengajuan penarikan poin telah dikirim ke admin</p>
                  <p className="text-sm text-yellow-600 font-semibold">Admin sedang menerima notifikasi…</p>
                  <div className="mt-5 p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-left">
                    <p className="text-xs text-gray-600 mb-1">Jumlah poin yang ditarik</p>
                    <p className="text-xl font-bold text-yellow-700">{formatCurrency(numAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1">Dana akan ditransfer setelah admin menyetujui (1×24 jam)</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Mengirim Pengajuan Penarikan Poin</h2>
                  <p className="text-sm text-gray-500 mb-6">Mohon tunggu, jangan tutup halaman ini</p>
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{sendingProgress}%</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${sendingProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3 text-left">
                    {stages.map((stage, idx) => {
                      const isActive = stage.key === sendingStage;
                      const isDoneStage = stage.done;
                      const isPending = idx > activeIdx;
                      return (
                        <div key={stage.key} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-yellow-50 border border-yellow-200' : ''} ${isDoneStage ? 'opacity-60' : ''} ${isPending ? 'opacity-30' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${isDoneStage ? 'bg-green-100' : isActive ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            {isDoneStage ? '✓' : stage.icon}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isDoneStage ? 'text-green-700 line-through' : isActive ? 'text-yellow-800' : 'text-gray-400'}`}>
                              {stage.label}
                            </p>
                          </div>
                          {isActive && <Loader2 className="w-4 h-4 text-yellow-500 animate-spin flex-shrink-0" />}
                          {isDoneStage && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tarik Poin Reward</h1>
          <p className="text-gray-600">Cairkan poin reward Anda ke rekening bank</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">

          {/* Points balance + unlock status */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <Coins className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Poin Reward</p>
                  <p className="text-3xl font-bold text-yellow-600">{formatCurrency(user.points)}</p>
                </div>
              </div>

              {/* Unlock status */}
              {daysRemaining === null ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-700">Belum Ada Setoran</p>
                    <p className="text-sm text-gray-500">Lakukan setoran pertama untuk memulai countdown 100 hari penarikan poin.</p>
                  </div>
                </div>
              ) : unlocked ? (
                <div className="p-4 bg-green-50 border border-green-300 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">🎉 Poin Siap Ditarik!</p>
                    <p className="text-sm text-green-700">Masa tunggu 100 hari telah selesai. Anda dapat menarik poin reward sekarang.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-orange-800">Poin Belum Bisa Ditarik</p>
                      <p className="text-sm text-orange-700">
                        Anda dapat menarik poin dalam <span className="font-bold text-orange-900">{daysRemaining} hari</span> lagi
                      </p>
                    </div>
                  </div>
                  {/* Countdown progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-orange-700 mb-1">
                      <span>Hari ke-{100 - (daysRemaining ?? 100)}</span>
                      <span>Hari ke-100</span>
                    </div>
                    <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, 100 - (daysRemaining ?? 100)))}%` }}
                      />
                    </div>
                    <p className="text-xs text-orange-600 mt-1 text-center">
                      {100 - (daysRemaining ?? 100)} / 100 hari
                    </p>
                  </div>
                  <p className="text-xs text-orange-600 mt-3 bg-orange-100 rounded-lg p-2">
                    💡 <strong>Tips:</strong> Setiap penarikan saldo utama Rp 10.000 akan menambah 1 hari. Setiap setoran Rp 10.000 akan mengurangi 1 hari.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form — only show if unlocked */}
          {unlocked && (
            <>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Jumlah Poin Yang Ditarik</CardTitle>
                  <CardDescription>Nominal poin yang ingin dicairkan ke rekening</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah Penarikan Poin</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                      <Input
                        id="amount"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="pl-10 text-lg font-semibold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[50000, 100000, 200000, 500000, 1000000, user.points].map((value, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(value.toLocaleString('id-ID'))}
                        className="text-xs"
                        disabled={value > user.points}
                      >
                        {idx === 5 ? 'Semua Poin' : value >= 1000000 ? `${value / 1000000}jt` : `${value / 1000}rb`}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Rekening Tujuan</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={loadBankAccount}>
                      Gunakan Rekening Saya
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nama Bank</Label>
                    <Select value={bankName} onValueChange={setBankName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BNI">Bank BNI</SelectItem>
                        <SelectItem value="BRI">Bank BRI</SelectItem>
                        <SelectItem value="Mandiri">Bank Mandiri</SelectItem>
                        <SelectItem value="BCA">Bank BCA</SelectItem>
                        <SelectItem value="CIMB">Bank CIMB Niaga</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">No. Rekening</Label>
                    <Input id="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
                    <Input id="accountName" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Sesuai buku tabungan" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-white sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-600" />
                Ringkasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Poin Reward</span>
                  <span className="font-bold text-yellow-600">{formatCurrency(user.points)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ditarik</span>
                  <span className="font-semibold">{formatCurrency(numAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya Admin</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(fee)}</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Yang Diterima</span>
                  <span className="text-green-600">{formatCurrency(Math.max(0, netAmount))}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={unlocked ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                  {unlocked ? '✓ Terbuka' : `🔒 ${daysRemaining ?? 100} hari lagi`}
                </Badge>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                size="lg"
                disabled={
                  !unlocked ||
                  numAmount < settings.minWithdrawal ||
                  numAmount > user.points ||
                  !bankName || !accountNumber || !accountName ||
                  isLoading
                }
              >
                <Coins className="w-5 h-5" />
                {isLoading ? 'Memproses...' : 'Tarik Poin Sekarang'}
              </Button>

              {!unlocked && daysRemaining !== null && (
                <p className="text-xs text-center text-gray-500">
                  Poin dapat ditarik setelah {daysRemaining} hari lagi
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-blue-50">
            <CardContent className="p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <p className="font-semibold mb-1">Cara Kerja Poin:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Poin = 2x dari setiap setoran</li>
                  <li>Dapat ditarik setelah 100 hari</li>
                  <li>Penarikan saldo utama kurangi poin (1:2)</li>
                  <li>Penarikan saldo tambah hari penantian</li>
                  <li>Setoran baru kurangi hari penantian</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
