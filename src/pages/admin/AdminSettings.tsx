import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockSettings } from '@/lib/mockData';
import { toast } from 'sonner';
import { Settings, DollarSign, Percent, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSettings() {
  const [settings, setSettings] = useState(mockSettings.getSettings());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    mockSettings.saveSettings(settings);
    setIsEditing(false);
    toast.success('Pengaturan berhasil disimpan');
  };

  const handleCancel = () => {
    setSettings(mockSettings.getSettings());
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pengaturan Sistem</h1>
          <p className="text-gray-600">Kelola parameter dan konfigurasi TabunganKu</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Settings className="w-4 h-4" />
            Edit Pengaturan
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-green-600" />
            Konfigurasi Poin & Bonus
          </CardTitle>
          <CardDescription>Atur multiplier dan bonus untuk penabung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pointsMultiplier">Multiplier Poin Reward</Label>
            <div className="flex items-center gap-3">
              <Input
                id="pointsMultiplier"
                type="number"
                min="1"
                max="10"
                value={settings.pointsMultiplier}
                onChange={(e) => setSettings({ ...settings, pointsMultiplier: parseInt(e.target.value) })}
                disabled={!isEditing}
                className="max-w-xs"
              />
              <span className="text-sm text-gray-600">x lipat dari nominal setoran</span>
            </div>
            <p className="text-xs text-gray-500">
              Contoh: Jika 2x, setoran Rp 10.000 akan dapat poin Rp 20.000
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Minimal Transaksi
          </CardTitle>
          <CardDescription>Batas minimal untuk setoran dan penarikan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minDeposit">Minimal Setoran</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <Input
                  id="minDeposit"
                  type="number"
                  min="0"
                  step="1000"
                  value={settings.minDeposit}
                  onChange={(e) => setSettings({ ...settings, minDeposit: parseInt(e.target.value) })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Saat ini: {formatCurrency(settings.minDeposit)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">Minimal Penarikan</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <Input
                  id="minWithdrawal"
                  type="number"
                  min="0"
                  step="1000"
                  value={settings.minWithdrawal}
                  onChange={(e) => setSettings({ ...settings, minWithdrawal: parseInt(e.target.value) })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Saat ini: {formatCurrency(settings.minWithdrawal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600" />
            Biaya Penarikan
          </CardTitle>
          <CardDescription>Atur biaya admin untuk penarikan dana</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawalFee">Biaya Persentase (%)</Label>
              <div className="relative">
                <Input
                  id="withdrawalFee"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.withdrawalFee}
                  onChange={(e) => setSettings({ ...settings, withdrawalFee: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500">Saat ini: {settings.withdrawalFee}%</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawalFeeFixed">Biaya Minimum</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <Input
                  id="withdrawalFeeFixed"
                  type="number"
                  min="0"
                  step="500"
                  value={settings.withdrawalFeeFixed}
                  onChange={(e) => setSettings({ ...settings, withdrawalFeeFixed: parseInt(e.target.value) })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Saat ini: {formatCurrency(settings.withdrawalFeeFixed)}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900 mb-1">Cara Kerja:</p>
            <p className="text-blue-800">
              Biaya admin yang dikenakan adalah <strong>nilai tertinggi</strong> antara persentase atau minimum. 
              Contoh: Penarikan Rp 100.000 dengan 1% = Rp 1.000, tetapi karena minimum Rp 2.500, maka biaya = Rp 2.500
            </p>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1" size="lg">
            Simpan Pengaturan
          </Button>
          <Button onClick={handleCancel} variant="outline" className="flex-1" size="lg">
            Batal
          </Button>
        </div>
      )}

      <Card className="border-0 shadow-lg bg-yellow-50">
        <CardContent className="p-4 flex gap-3">
          <Settings className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-900">
            <p className="font-semibold mb-1">Catatan Penting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Perubahan pengaturan berlaku untuk transaksi baru</li>
              <li>Transaksi yang sudah berjalan tidak terpengaruh</li>
              <li>Pastikan nilai yang dimasukkan sudah benar sebelum menyimpan</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
