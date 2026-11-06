import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { createWithdrawalRequest, mockSettings } from '@/lib/mockData';
import { notificationService } from '@/lib/notifications';
import { ArrowDownCircle, AlertTriangle, Camera, Image as ImageIcon, Upload, X, Loader2, CheckCircle } from 'lucide-react';

export default function WithdrawPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [sendingStage, setSendingStage] = useState<null | 'preparing' | 'sending' | 'notifying' | 'done'>(null);
  const [sendingProgress, setSendingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const settings = mockSettings.getSettings();
  const numAmount = parseInt(amount.replace(/\D/g, '')) || 0;
  const fee = Math.max((numAmount * settings.withdrawalFee) / 100, settings.withdrawalFeeFixed);
  const netAmount = numAmount - fee;

  if (!user) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setAmount(value ? parseInt(value).toLocaleString('id-ID') : '');
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toLocaleString('id-ID'));
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, dll)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    const previewReader = new FileReader();
    previewReader.onloadend = () => {
      setTempPreview(previewReader.result as string);
      setTempFile(file);
    };
    previewReader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const confirmUpload = () => {
    if (!tempFile) return;

    const file = tempFile;
    setIsUploading(true);
    setUploadProgress(0);
    
    const fileSize = file.size;
    const startTime = Date.now();
    const reader = new FileReader();
    
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        
        setUploadProgress(Math.min(progress, 100));
        
        const elapsedTime = (Date.now() - startTime) / 1000;
        const uploadedBytes = (fileSize * progress) / 100;
        const speed = uploadedBytes / 1024 / elapsedTime;
        setUploadSpeed(speed);
        
        const remainingBytes = fileSize - uploadedBytes;
        const timeRemaining = speed > 0 ? remainingBytes / 1024 / speed : 0;
        setEstimatedTime(timeRemaining);
      }, 200);
      
      return interval;
    };
    
    const progressInterval = simulateProgress();
    
    reader.onloadend = () => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setPaymentProof(reader.result as string);
        setIsUploading(false);
        setUploadProgress(0);
        setTempPreview(null);
        setTempFile(null);
        toast.success('Bukti rekening berhasil diupload!');
      }, 500);
    };
    
    reader.onerror = () => {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Gagal mengupload gambar, silakan coba lagi');
    };
    
    reader.readAsDataURL(file);
  };

  const cancelUpload = () => {
    setTempPreview(null);
    setTempFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  const handleRemoveProof = () => {
    setPaymentProof(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
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

    if (numAmount < settings.minWithdrawal) {
      toast.error(`Minimal penarikan ${formatCurrency(settings.minWithdrawal)}`);
      return;
    }

    if (numAmount > user.balance) {
      toast.error('Saldo tidak mencukupi');
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      toast.error('Lengkapi data rekening tujuan');
      return;
    }

    setIsLoading(true);
    setSendingStage('preparing');
    setSendingProgress(0);

    // Stage 1: Preparing (0–30%)
    await new Promise(resolve => setTimeout(resolve, 600));
    setSendingProgress(15);
    await new Promise(resolve => setTimeout(resolve, 400));
    setSendingProgress(30);

    // Stage 2: Sending (30–70%)
    setSendingStage('sending');
    await new Promise(resolve => setTimeout(resolve, 500));
    setSendingProgress(50);

    // Create withdrawal request
    createWithdrawalRequest(user.id, numAmount, bankName, accountNumber, accountName);
    updateUser({ balance: user.balance - numAmount });

    await new Promise(resolve => setTimeout(resolve, 500));
    setSendingProgress(70);

    // Stage 3: Notifying admin (70–100%)
    setSendingStage('notifying');
    await new Promise(resolve => setTimeout(resolve, 400));
    setSendingProgress(85);
    notificationService.notifyAdminNewWithdrawal(numAmount, user.name);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSendingProgress(100);

    // Stage 4: Done
    setSendingStage('done');
    await new Promise(resolve => setTimeout(resolve, 1200));

    setIsLoading(false);
    setSendingStage(null);
    navigate('/transactions');
  };

  // Sending simulation overlay
  if (sendingStage) {
    const stages = [
      { key: 'preparing', label: 'Menyiapkan data penarikan', icon: '📋', done: ['sending', 'notifying', 'done'].includes(sendingStage) },
      { key: 'sending',   label: 'Mengirim pengajuan penarikan', icon: '📤', done: ['notifying', 'done'].includes(sendingStage) },
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
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengajuan Terkirim!</h2>
                  <p className="text-gray-600 mb-1">Pengajuan penarikan telah dikirim ke admin</p>
                  <p className="text-sm text-red-600 font-semibold">Admin sedang menerima notifikasi…</p>
                  <div className="mt-5 p-4 bg-red-50 rounded-xl border border-red-200 text-left">
                    <p className="text-xs text-gray-600 mb-1">Jumlah penarikan</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(numAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1">Menunggu persetujuan admin dalam 1×24 jam</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Mengirim Pengajuan Penarikan</h2>
                  <p className="text-sm text-gray-500 mb-6">Mohon tunggu, jangan tutup halaman ini</p>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{sendingProgress}%</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${sendingProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3 text-left">
                    {stages.map((stage, idx) => {
                      const isActive = stage.key === sendingStage;
                      const isDoneStage = stage.done;
                      const isPending = idx > activeIdx;
                      return (
                        <div key={stage.key} className={cn(
                          'flex items-center gap-3 p-3 rounded-xl transition-all',
                          isActive ? 'bg-red-50 border border-red-200' : '',
                          isDoneStage ? 'opacity-60' : '',
                          isPending ? 'opacity-30' : ''
                        )}>
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm',
                            isDoneStage ? 'bg-green-100' : isActive ? 'bg-red-100' : 'bg-gray-100'
                          )}>
                            {isDoneStage ? '✓' : stage.icon}
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              'text-sm font-medium',
                              isDoneStage ? 'text-green-700 line-through' : isActive ? 'text-red-800' : 'text-gray-400'
                            )}>
                              {stage.label}
                            </p>
                          </div>
                          {isActive && (
                            <Loader2 className="w-4 h-4 text-red-500 animate-spin flex-shrink-0" />
                          )}
                          {isDoneStage && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Tarik Tunai</h1>
        <p className="text-gray-600">Ajukan penarikan dana ke rekening Anda</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Saldo Tersedia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(user.balance)}</div>
              <p className="text-sm text-gray-500 mt-1">
                Minimal penarikan {formatCurrency(settings.minWithdrawal)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Jumlah Penarikan</CardTitle>
              <CardDescription>
                Biaya admin {settings.withdrawalFee}% (min {formatCurrency(settings.withdrawalFeeFixed)})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Nominal Penarikan</Label>
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
                {[50000, 100000, 200000, 500000, 1000000, user.balance].map((value, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(value)}
                    className="text-xs"
                    disabled={value > user.balance}
                  >
                    {idx === 5 ? 'Semua' : value >= 1000000 ? `${value / 1000000}jt` : `${value / 1000}rb`}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rekening Tujuan</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={loadBankAccount}
                >
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
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Sesuai dengan buku tabungan"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Bukti Rekening (Opsional)</CardTitle>
              <CardDescription>Upload foto buku tabungan untuk mempercepat verifikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file inputs - rendered outside drag area to avoid event conflicts */}

              {isUploading ? (
                <div className="space-y-4">
                  <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                    
                    <p className="text-center font-semibold text-gray-900 mb-1">
                      Mengupload Bukti Rekening...
                    </p>
                    <p className="text-center text-sm text-gray-600 mb-4">
                      Mohon tunggu, jangan tutup halaman ini
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold text-blue-700">
                          {Math.round(uploadProgress)}%
                        </span>
                        <span className="text-gray-600">
                          {uploadSpeed > 0 ? `${uploadSpeed.toFixed(1)} KB/s` : 'Menghitung...'}
                        </span>
                      </div>
                      
                      <Progress 
                        value={uploadProgress} 
                        className="h-3 bg-blue-100"
                      />
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {uploadProgress < 100 
                            ? 'Sedang mengupload...' 
                            : 'Menyelesaikan...'}
                        </span>
                        <span>
                          {estimatedTime > 0 && uploadProgress < 100
                            ? `~${Math.ceil(estimatedTime)}s tersisa`
                            : uploadProgress === 100 
                            ? 'Hampir selesai!' 
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : tempPreview ? (
                <div className="space-y-4">
                  <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <p className="font-semibold text-blue-900">Preview Bukti Rekening</p>
                    </div>
                    <img 
                      src={tempPreview} 
                      alt="Preview" 
                      className="w-full h-64 object-contain bg-white rounded-lg border-2 border-blue-300 mb-3"
                    />
                    <p className="text-sm text-blue-800 mb-4">
                      Pastikan foto jelas dan informasi rekening terlihat lengkap
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={confirmUpload}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Konfirmasi & Upload
                      </Button>
                      <Button
                        type="button"
                        onClick={cancelUpload}
                        variant="outline"
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Batal & Pilih Ulang
                      </Button>
                    </div>
                  </div>
                </div>
              ) : !paymentProof ? (
                <div className="space-y-3">
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
                      isDragging 
                        ? "border-blue-500 bg-blue-50 scale-105" 
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    )}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isDragging ? (
                      <>
                        <Upload className="w-16 h-16 mx-auto mb-3 text-blue-600 animate-bounce" />
                        <p className="font-bold text-blue-700 text-lg mb-1">Lepas File di Sini!</p>
                        <p className="text-sm text-blue-600">File akan langsung diupload</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="font-semibold text-gray-700 mb-1">Drag & Drop Bukti Rekening</p>
                        <p className="text-sm text-gray-500 mb-1">atau pilih file dari tombol di bawah</p>
                        <p className="text-xs text-gray-400 mb-4">JPG, PNG maksimal 5MB</p>
                      </>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <label className="relative flex flex-col items-center justify-center py-4 border-2 border-gray-200 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden">
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Camera className="w-6 h-6 text-blue-600 mb-2 pointer-events-none" />
                        <span className="text-sm font-semibold block text-gray-800 pointer-events-none">Ambil Foto</span>
                        <span className="text-xs text-gray-500 pointer-events-none">Buka Kamera</span>
                      </label>

                      <label className="relative flex flex-col items-center justify-center py-4 border-2 border-gray-200 rounded-md cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all overflow-hidden">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <ImageIcon className="w-6 h-6 text-green-600 mb-2 pointer-events-none" />
                        <span className="text-sm font-semibold block text-gray-800 pointer-events-none">Pilih Gambar</span>
                        <span className="text-xs text-gray-500 pointer-events-none">Dari Galeri</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={paymentProof} 
                    alt="Bukti Rekening" 
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg border-2 border-blue-500"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveProof}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Bukti rekening berhasil diupload</p>
                      <p className="text-xs">Ini akan membantu admin memverifikasi penarikan lebih cepat</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Penarikan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah Penarikan</span>
                  <span className="font-semibold">{formatCurrency(numAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Biaya Admin</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(fee)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Yang Diterima</span>
                  <span className="text-green-600">{formatCurrency(netAmount)}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold mb-1">Pengaruh ke Poin Reward</p>
                  <p>Setiap penarikan <strong>Rp 10.000</strong> saldo utama akan:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Mengurangi poin reward <strong>Rp 20.000</strong></li>
                    <li>Menambah <strong>1 hari</strong> waktu tunggu penarikan poin</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold mb-1">Menunggu Persetujuan</p>
                  <p>Penarikan akan diproses oleh admin dalam 1x24 jam</p>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full gap-2" 
                size="lg"
                variant="destructive"
                disabled={
                  numAmount < settings.minWithdrawal || 
                  numAmount > user.balance || 
                  !bankName || 
                  !accountNumber || 
                  !accountName ||
                  isLoading ||
                  isUploading
                }
              >
                <ArrowDownCircle className="w-5 h-5" />
                {isLoading ? 'Memproses...' : 'Ajukan Penarikan'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-blue-50">
            <CardContent className="p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <p className="font-semibold mb-1">Catatan Penting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pastikan data rekening benar</li>
                  <li>Dana akan ditransfer setelah disetujui admin</li>
                  <li>Saldo akan langsung terpotong</li>
                  <li>Jika ditolak, saldo akan dikembalikan</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
