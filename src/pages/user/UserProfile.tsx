import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDate, formatCurrency, getPointsDaysRemaining, arePointsUnlocked } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { User, Camera, Clock, CheckCircle, Coins, TrendingUp, CalendarDays, ArrowRight } from 'lucide-react';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState(user?.photo || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bankName: user?.bankAccount?.bankName || '',
    accountNumber: user?.bankAccount?.accountNumber || '',
    accountName: user?.bankAccount?.accountName || '',
  });

  if (!user) return null;

  const daysRemaining = getPointsDaysRemaining(user);
  const pointsUnlocked = arePointsUnlocked(user);

  // Calculate the exact unlock date
  const unlockDateStr = (() => {
    const startDate = user.firstDepositApprovedDate;
    if (!startDate) return null;
    const offset = user.pointsDayOffset ?? 0;
    const unlockMs = new Date(startDate).getTime() + (100 + offset) * 24 * 60 * 60 * 1000;
    return new Date(unlockMs).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  })();

  const progressPercent = daysRemaining === null
    ? 0
    : Math.max(0, Math.min(100, 100 - daysRemaining));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 Photo input changed');
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

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      updateUser({ photo: reader.result as string });
      setIsUploadingPhoto(false);
      toast.success('Foto profil berhasil diperbarui');
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      toast.error('Gagal mengupload foto');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateUser({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      photo,
      bankAccount: formData.bankName ? {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
      } : undefined,
    });

    setIsEditing(false);
    toast.success('Profil berhasil diperbarui');
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      phone: user.phone,
      address: user.address,
      bankName: user.bankAccount?.bankName || '',
      accountNumber: user.bankAccount?.accountNumber || '',
      accountName: user.bankAccount?.accountName || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profil Saya</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profil
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img 
                  src={photo} 
                  alt={user.name} 
                  className="w-32 h-32 rounded-full border-4 border-green-500 object-cover"
                />
                {isEditing && (
                  <label
                    className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors cursor-pointer overflow-hidden"
                  >
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {isUploadingPhoto ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin pointer-events-none" />
                    ) : (
                      <Camera className="w-5 h-5 pointer-events-none" />
                    )}
                  </label>
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{user.memberNumber}</p>
                <p className="text-xs text-gray-500">No. Anggota</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationDate">Terdaftar Sejak</Label>
                  <Input
                    id="registrationDate"
                    value={formatDate(user.registrationDate)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Simpan Perubahan
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    Batal
                  </Button>
                </div>
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      {/* ── Points Countdown Card ── */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className={`p-5 text-white ${
          pointsUnlocked
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : daysRemaining === null
            ? 'bg-gradient-to-br from-gray-400 to-gray-500'
            : daysRemaining <= 1
            ? 'bg-gradient-to-br from-red-500 to-rose-600'
            : daysRemaining <= 5
            ? 'bg-gradient-to-br from-orange-500 to-amber-500'
            : 'bg-gradient-to-br from-yellow-500 to-amber-400'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              <h3 className="font-bold text-base">Countdown Poin Reward</h3>
            </div>
            <Badge className="bg-white/20 border-white/30 text-white text-xs border">
              {pointsUnlocked ? '🎉 Terbuka' : daysRemaining === null ? '⏳ Belum Mulai' : `🔒 Terkunci`}
            </Badge>
          </div>

          {daysRemaining === null ? (
            /* No deposit yet */
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-10 h-10 text-white/70" />
              </div>
              <p className="font-semibold text-white/90">Belum Ada Setoran</p>
              <p className="text-xs text-white/70 mt-1">Lakukan setoran pertama untuk memulai countdown 100 hari</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Big countdown ring */}
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" strokeWidth="7" stroke="rgba(255,255,255,0.2)" fill="none" />
                    <circle
                      cx="40" cy="40" r="34" strokeWidth="7"
                      stroke="white" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {pointsUnlocked ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <>
                        <span className="text-2xl font-black leading-none">{daysRemaining}</span>
                        <span className="text-[10px] text-white/80 font-medium">hari</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {pointsUnlocked ? (
                    <>
                      <p className="font-bold text-lg">Poin Siap Ditarik!</p>
                      <p className="text-white/80 text-sm">Masa tunggu 100 hari telah selesai.</p>
                      <p className="text-white/70 text-xs">
                        Total poin: <span className="font-bold text-white">{formatCurrency(user.points)}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg">{daysRemaining} Hari Lagi</p>
                      <p className="text-white/80 text-sm">
                        dari <span className="font-bold text-white">100 hari</span> masa tunggu
                      </p>
                      <p className="text-white/70 text-xs">
                        Sudah berjalan: <span className="font-semibold text-white">{progressPercent.toFixed(0)}%</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {!pointsUnlocked && (
                <div>
                  <div className="flex justify-between text-xs text-white/70 mb-1.5">
                    <span>Hari ke-{100 - (daysRemaining ?? 100)}</span>
                    <span>Hari ke-100</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Exact unlock date */}
              {unlockDateStr && (
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 flex items-start gap-2.5">
                  <CalendarDays className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white/70">Estimasi tanggal poin bisa ditarik</p>
                    <p className="font-bold text-sm mt-0.5 capitalize">{unlockDateStr}</p>
                  </div>
                </div>
              )}

              {/* Points total */}
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs text-white/80">Total Poin Reward</span>
                </div>
                <span className="font-bold text-base">{formatCurrency(user.points)}</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA Footer */}
        <div className="px-5 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {pointsUnlocked
              ? 'Segera cairkan poin Anda'
              : daysRemaining === null
              ? 'Setor pertama untuk mulai countdown'
              : `${progressPercent.toFixed(1)}% dari target 100 hari`}
          </p>
          <Link to="/points-withdraw">
            <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              pointsUnlocked
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}>
              {pointsUnlocked ? 'Tarik Sekarang' : 'Lihat Detail'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Informasi Rekening Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Nama Bank</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Contoh: BNI"
                  value={formData.bankName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">No. Rekening</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder="1234567890"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Nama Pemilik</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  placeholder="Sesuai KTP"
                  value={formData.accountName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Simpan Perubahan
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Batal
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
