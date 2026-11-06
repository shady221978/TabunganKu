import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Wallet } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login berhasil!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
              💰
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">TabunganKu</h1>
              <p className="text-gray-600">Sistem Tabungan Digital Terpercaya</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Keuntungan Menabung Bersama Kami</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Poin Reward 2x Lipat</h3>
                  <p className="text-sm text-gray-600">Setiap nabung Rp 10.000, dapatkan poin senilai Rp 20.000!</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Withdraw Cepat</h3>
                  <p className="text-sm text-gray-600">Proses penarikan mudah ke berbagai bank dan e-wallet</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Aman & Terpercaya</h3>
                  <p className="text-sm text-gray-600">Data terenkripsi dengan sistem keamanan berlapis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full shadow-xl border-0">
          <CardHeader className="space-y-1">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl">
                💰
              </div>
              <div>
                <CardTitle className="text-2xl">TabunganKu</CardTitle>
                <CardDescription>Sistem Tabungan Digital</CardDescription>
              </div>
            </div>
            <CardTitle className="text-2xl">Masuk ke Akun Anda</CardTitle>
            <CardDescription>
              Masukkan email dan password untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Demo Akun</span>
                </div>
              </div>

              <div className="grid gap-2 text-sm bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">Akun Demo:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Admin:</strong> admin@tabunganku.com</p>
                  <p><strong>User:</strong> budi@example.com</p>
                  <p className="text-muted-foreground italic">Password: bebas (demo mode)</p>
                </div>
              </div>

              <div className="text-center text-sm">
                Belum punya akun?{' '}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Daftar sekarang
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
