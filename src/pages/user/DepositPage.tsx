import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { mockSettings, mockTransactions } from '@/lib/mockData';
import { notificationService } from '@/lib/notifications';
import { ArrowUpCircle, Info, Gift, Upload, X, Image as ImageIcon, Camera, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { PAYMENT_METHODS } from '@/constants';

export default function DepositPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
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
  const pointsToEarn = numAmount * settings.pointsMultiplier;

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, dll)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    // Show instant preview for confirmation
    const previewReader = new FileReader();
    previewReader.onloadend = () => {
      setTempPreview(previewReader.result as string);
      setTempFile(file);
    };
    previewReader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed');
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log('⚠️ No file selected');
      return;
    }
    
    console.log('✅ File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    processFile(file);
  };

  const confirmUpload = () => {
    if (!tempFile) return;

    const file = tempFile;

    // Start upload simulation
    setIsUploading(true);
    setUploadProgress(0);
    
    const fileSize = file.size;
    const startTime = Date.now();
    
    // Convert to base64 with progress simulation
    const reader = new FileReader();
    
    // Simulate realistic upload progress
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random increment between 5-20
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        
        setUploadProgress(Math.min(progress, 100));
        
        // Calculate upload speed (KB/s)
        const elapsedTime = (Date.now() - startTime) / 1000;
        const uploadedBytes = (fileSize * progress) / 100;
        const speed = uploadedBytes / 1024 / elapsedTime;
        setUploadSpeed(speed);
        
        // Calculate estimated time remaining
        const remainingBytes = fileSize - uploadedBytes;
        const timeRemaining = speed > 0 ? remainingBytes / 1024 / speed : 0;
        setEstimatedTime(timeRemaining);
      }, 200); // Update every 200ms
      
      return interval;
    };
    
    const progressInterval = simulateProgress();
    
    reader.onloadend = () => {
      // Ensure progress reaches 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setPaymentProof(reader.result as string);
        setIsUploading(false);
        setUploadProgress(0);
        setTempPreview(null);
        setTempFile(null);
        toast.success('Bukti transfer berhasil diupload!');
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

  // Drag and Drop Handlers
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (numAmount < settings.minDeposit) {
      toast.error(`Minimal setoran ${formatCurrency(settings.minDeposit)}`);
      return;
    }

    if (!paymentMethod) {
      toast.error('Pilih metode pembayaran');
      return;
    }

    if (!paymentProof) {
      toast.error('Upload bukti transfer terlebih dahulu');
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
    await new Promise(resolve => setTimeout(resolve, 500));
    setSendingProgress(70);

    // Create transaction in mock DB
    const transaction = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId: user.id,
      type: 'deposit' as const,
      amount: numAmount,
      pointsEarned: pointsToEarn,
      status: 'pending' as const,
      paymentMethod,
      paymentProof,
      proofStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    const transactions = mockTransactions.getTransactions();
    transactions.push(transaction);
    mockTransactions.saveTransactions(transactions);

    // Stage 3: Notifying admin (70–100%)
    setSendingStage('notifying');
    await new Promise(resolve => setTimeout(resolve, 400));
    setSendingProgress(85);
    notificationService.notifyAdminNewDeposit(numAmount, user.name);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSendingProgress(100);

    // Stage 4: Done
    setSendingStage('done');
    await new Promise(resolve => setTimeout(resolve, 1200));

    setIsLoading(false);
    setSendingStage(null);
    navigate('/transactions');
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === paymentMethod);
  const bankAccount = settings.banks.find(b => b.name === selectedMethod?.label.replace('Bank ', ''));
  const ewallet = settings.ewallets.find(e => e.name === selectedMethod?.label);

  // Sending simulation overlay
  if (sendingStage) {
    const stages = [
      { key: 'preparing', label: 'Menyiapkan data setoran', icon: '📋', done: ['sending', 'notifying', 'done'].includes(sendingStage) },
      { key: 'sending', label: 'Mengirim bukti transfer', icon: '📤', done: ['notifying', 'done'].includes(sendingStage) },
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
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil Terkirim!</h2>
                  <p className="text-gray-600 mb-1">Bukti transfer telah dikirim ke admin</p>
                  <p className="text-sm text-green-600 font-semibold">Admin sedang menerima notifikasi…</p>
                  <div className="mt-5 p-4 bg-green-50 rounded-xl border border-green-200 text-left">
                    <p className="text-xs text-gray-600 mb-1">Jumlah setoran</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(numAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1">Menunggu verifikasi admin dalam 1×24 jam</p>
                  </div>
                  <a
                    href={`https://wa.me/6282194909137?text=${encodeURIComponent('Halo Admin, saya sudah transfer setoran sebesar ' + formatCurrency(numAmount) + '. Mohon segera diverifikasi. Terima kasih!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-xl transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Konfirmasi via WhatsApp Admin
                  </a>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Mengirim Bukti Transfer</h2>
                  <p className="text-sm text-gray-500 mb-6">Mohon tunggu, jangan tutup halaman ini</p>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{sendingProgress}%</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
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
                          isActive ? 'bg-blue-50 border border-blue-200' : '',
                          isDoneStage ? 'opacity-60' : '',
                          isPending ? 'opacity-30' : ''
                        )}>
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm',
                            isDoneStage ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'
                          )}>
                            {isDoneStage ? '✓' : stage.icon}
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              'text-sm font-medium',
                              isDoneStage ? 'text-green-700 line-through' : isActive ? 'text-blue-800' : 'text-gray-400'
                            )}>
                              {stage.label}
                            </p>
                          </div>
                          {isActive && (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Setor Tunai</h1>
        <p className="text-gray-600">Tambah saldo tabungan Anda dan dapatkan poin reward!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Nominal Setoran</CardTitle>
              <CardDescription>
                Minimal setoran {formatCurrency(settings.minDeposit)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah Setoran</Label>
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
                {[10000, 50000, 100000, 200000, 500000, 1000000].map(value => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(value)}
                    className="text-xs"
                  >
                    {value >= 1000000 ? `${value / 1000000}jt` : `${value / 1000}rb`}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
              <CardDescription>Pilih bank atau e-wallet untuk transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-700 mt-2">Transfer Bank</div>
                  {PAYMENT_METHODS.filter(m => m.type === 'bank').map(method => (
                    <div key={method.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={method.value} id={method.value} />
                      <Label htmlFor={method.value} className="flex-1 cursor-pointer">
                        {method.label}
                      </Label>
                    </div>
                  ))}

                  <div className="text-sm font-semibold text-gray-700 mt-4">E-Wallet</div>
                  {PAYMENT_METHODS.filter(m => m.type === 'ewallet').map(method => (
                    <div key={method.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={method.value} id={method.value} />
                      <Label htmlFor={method.value} className="flex-1 cursor-pointer">
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {selectedMethod && (bankAccount || ewallet) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Transfer ke {selectedMethod.label}:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">No. Rekening/HP:</span> <span className="font-semibold">{bankAccount?.accountNumber || ewallet?.accountNumber}</span></p>
                    <p><span className="text-gray-600">Atas Nama:</span> <span className="font-semibold">{bankAccount?.accountName || ewallet?.accountName}</span></p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Bukti Transfer</CardTitle>
              <CardDescription>Upload foto/screenshot bukti transfer Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file inputs - rendered outside drag area to avoid event conflicts */}

              {isUploading ? (
                <div className="space-y-4">
                  <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                    </div>
                    
                    <p className="text-center font-semibold text-gray-900 mb-1">
                      Mengupload Bukti Transfer...
                    </p>
                    <p className="text-center text-sm text-gray-600 mb-4">
                      Mohon tunggu, jangan tutup halaman ini
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold text-green-700">
                          {Math.round(uploadProgress)}%
                        </span>
                        <span className="text-gray-600">
                          {uploadSpeed > 0 ? `${uploadSpeed.toFixed(1)} KB/s` : 'Menghitung...'}
                        </span>
                      </div>
                      
                      <Progress 
                        value={uploadProgress} 
                        className="h-3 bg-green-100"
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

                    {/* Progress Milestones */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className={uploadProgress >= 33 ? 'text-green-600' : 'text-gray-400'}>
                        <div className="text-lg mb-1">
                          {uploadProgress >= 33 ? '✓' : '○'}
                        </div>
                        <div className="text-xs font-medium">Membaca</div>
                      </div>
                      <div className={uploadProgress >= 66 ? 'text-green-600' : 'text-gray-400'}>
                        <div className="text-lg mb-1">
                          {uploadProgress >= 66 ? '✓' : '○'}
                        </div>
                        <div className="text-xs font-medium">Mengupload</div>
                      </div>
                      <div className={uploadProgress === 100 ? 'text-green-600' : 'text-gray-400'}>
                        <div className="text-lg mb-1">
                          {uploadProgress === 100 ? '✓' : '○'}
                        </div>
                        <div className="text-xs font-medium">Selesai</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : tempPreview ? (
                // Confirmation Preview
                <div className="space-y-4">
                  <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <p className="font-semibold text-blue-900">Preview Bukti Transfer</p>
                    </div>
                    <img 
                      src={tempPreview} 
                      alt="Preview" 
                      className="w-full h-64 object-contain bg-white rounded-lg border-2 border-blue-300 mb-3"
                    />
                    <p className="text-sm text-blue-800 mb-4">
                      Pastikan foto jelas dan informasi transfer terlihat lengkap sebelum melanjutkan
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={confirmUpload}
                        className="gap-2 bg-green-600 hover:bg-green-700"
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
                  {/* Drag and Drop Area */}
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
                      isDragging 
                        ? "border-green-500 bg-green-50 scale-105" 
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    )}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isDragging ? (
                      <>
                        <Upload className="w-16 h-16 mx-auto mb-3 text-green-600 animate-bounce" />
                        <p className="font-bold text-green-700 text-lg mb-1">Lepas File di Sini!</p>
                        <p className="text-sm text-green-600">File akan langsung diupload</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="font-semibold text-gray-700 mb-1">Drag & Drop Bukti Transfer</p>
                        <p className="text-sm text-gray-500 mb-1">atau pilih file dari tombol di bawah</p>
                        <p className="text-xs text-gray-400 mb-4">JPG, PNG maksimal 5MB</p>
                      </>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <label className="relative flex flex-col items-center justify-center py-4 border-2 border-gray-200 rounded-md cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all overflow-hidden">
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Camera className="w-6 h-6 text-green-600 mb-2 pointer-events-none" />
                        <span className="text-sm font-semibold block text-gray-800 pointer-events-none">Ambil Foto</span>
                        <span className="text-xs text-gray-500 pointer-events-none">Buka Kamera</span>
                      </label>

                      <label className="relative flex flex-col items-center justify-center py-4 border-2 border-gray-200 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <ImageIcon className="w-6 h-6 text-blue-600 mb-2 pointer-events-none" />
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
                    alt="Bukti Transfer" 
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg border-2 border-green-500"
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
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <ImageIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">Bukti transfer berhasil diupload</p>
                      <p className="text-xs">Pastikan nominal dan rekening tujuan terlihat jelas</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Setoran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah Setoran</span>
                  <span className="font-semibold">{formatCurrency(numAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Poin Reward ({settings.pointsMultiplier}x)</span>
                  <span className="font-semibold text-green-600">{formatCurrency(pointsToEarn)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total Diterima</span>
                  <span className="text-green-600">{formatCurrency(numAmount)}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                <Gift className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold mb-1">Bonus Poin Reward!</p>
                  <p>Setiap setoran akan mendapat poin {settings.pointsMultiplier}x lipat dari nominal</p>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full gap-2" 
                size="lg"
                disabled={numAmount < settings.minDeposit || !paymentMethod || !paymentProof || isLoading}
              >
                <ArrowUpCircle className="w-5 h-5" />
                {isLoading ? 'Memproses...' : 'Konfirmasi Setoran'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-blue-50">
            <CardContent className="p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <p className="font-semibold mb-1">Catatan Penting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Transfer sesuai nominal yang tertera</li>
                  <li>Upload bukti transfer yang jelas</li>
                  <li>Admin akan verifikasi dalam 1x24 jam</li>
                  <li>Saldo dan poin masuk setelah disetujui</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-green-900 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                Sudah Transfer? Konfirmasi ke Admin
              </p>
              <p className="text-xs text-green-700 mb-3">Kirim pesan WhatsApp untuk konfirmasi pembayaran lebih cepat</p>
              <a
                href="https://wa.me/6282194909137?text=Halo%20Admin%2C%20saya%20sudah%20melakukan%20transfer%20setoran.%20Mohon%20segera%20diverifikasi.%20Terima%20kasih!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold rounded-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Chat WhatsApp Admin
              </a>
              <p className="text-xs text-green-700 text-center mt-2">082194909137</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
