import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="text-9xl font-bold text-green-500">404</div>
        <h1 className="text-3xl font-bold text-gray-900">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
