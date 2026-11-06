import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Users, Gift, TrendingUp } from 'lucide-react';
import { mockUsers } from '@/lib/mockData';

export default function ReferralPage() {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState('');

  if (!user) return null;

  const baseUrl = window.location.origin;
  const fullReferralLink = `${baseUrl}/register?ref=${user.referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Berhasil disalin!');
  };

  const referredUsers = mockUsers.getUsers().filter(u => u.referredBy === user.referralCode);
  const totalReferrals = referredUsers.length;
  const totalBonus = totalReferrals * 50000; // 50k per referral

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Program Referral</h1>
        <p className="text-gray-600">Ajak teman dan dapatkan bonus poin!</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Kode Referral Anda</h2>
              <p className="text-purple-100">Bagikan kode ini ke teman dan keluarga</p>
            </div>
            <Users className="w-12 h-12 opacity-50" />
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-3xl font-bold tracking-wider">
                {user.referralCode}
              </div>
              <Button
                onClick={() => copyToClipboard(user.referralCode)}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Salin Kode
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralLink" className="text-white">Link Referral</Label>
            <div className="flex gap-2">
              <Input
                id="referralLink"
                value={fullReferralLink}
                readOnly
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
              />
              <Button
                onClick={() => copyToClipboard(fullReferralLink)}
                variant="secondary"
                className="gap-2 flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
                Salin Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Referral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalReferrals}</div>
            <p className="text-xs text-gray-500 mt-1">Teman yang bergabung</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Bonus Didapat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalBonus)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total poin bonus</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Per Referral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">Rp 50K</div>
            <p className="text-xs text-gray-500 mt-1">Bonus poin per teman</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Cara Kerja Program Referral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-purple-600">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Bagikan Kode/Link Referral</h3>
              <p className="text-sm text-gray-600">Kirim kode atau link referral Anda ke teman melalui WhatsApp, email, atau media sosial</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-purple-600">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Teman Mendaftar</h3>
              <p className="text-sm text-gray-600">Teman menggunakan kode referral Anda saat mendaftar akun baru</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-purple-600">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Dapatkan Bonus</h3>
              <p className="text-sm text-gray-600">Anda langsung mendapat bonus 50.000 poin untuk setiap teman yang berhasil mendaftar!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {referredUsers.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Teman yang Bergabung ({referredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referredUsers.map(referredUser => (
                <div key={referredUser.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={referredUser.photo} 
                    alt={referredUser.name} 
                    className="w-10 h-10 rounded-full border-2 border-purple-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{referredUser.name}</p>
                    <p className="text-xs text-gray-500">
                      Bergabung {new Date(referredUser.registrationDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+Rp 50.000</p>
                    <p className="text-xs text-gray-500">Bonus</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
