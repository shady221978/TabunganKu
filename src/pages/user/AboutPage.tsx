import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Shield, Clock, Gift, Users, Zap, Award, MessageCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto shadow-lg">
          💰
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Tentang TabunganKu</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Platform tabungan digital terpercaya dengan sistem poin reward hingga 2x lipat
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="text-2xl">Apa itu TabunganKu?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            TabunganKu adalah sistem tabungan digital modern yang dirancang untuk membantu Anda menabung dengan lebih mudah, 
            aman, dan menguntungkan. Dengan teknologi terkini, kami memberikan pengalaman menabung yang praktis melalui 
            berbagai metode pembayaran.
          </p>
          <p>
            Yang membuat TabunganKu istimewa adalah <strong className="text-green-600">sistem poin reward 2x lipat</strong> - 
            setiap kali Anda menabung, Anda tidak hanya mendapat tabungan, tapi juga bonus poin senilai 2x dari nominal tabungan 
            yang dapat digunakan untuk berbagai keuntungan.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-green-600" />
              Cara Menabung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-green-600 text-xs">
                1
              </div>
              <div>
                <p className="font-semibold">Pilih Nominal</p>
                <p className="text-gray-600">Tentukan jumlah uang yang ingin ditabung (minimal Rp 10.000)</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-green-600 text-xs">
                2
              </div>
              <div>
                <p className="font-semibold">Pilih Metode Pembayaran</p>
                <p className="text-gray-600">Transfer via BNI, BRI, Mandiri, OVO, atau DANA</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-green-600 text-xs">
                3
              </div>
              <div>
                <p className="font-semibold">Transfer & Konfirmasi</p>
                <p className="text-gray-600">Lakukan transfer dan saldo otomatis masuk ke akun Anda</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-green-600 text-xs">
                4
              </div>
              <div>
                <p className="font-semibold">Dapatkan Poin Reward 2x</p>
                <p className="text-gray-600">Bonus poin langsung masuk 2x dari nominal tabungan!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Cara Penarikan Dana
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-blue-600 text-xs">
                1
              </div>
              <div>
                <p className="font-semibold">Tentukan Jumlah</p>
                <p className="text-gray-600">Minimal penarikan Rp 50.000 dari saldo Anda</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-blue-600 text-xs">
                2
              </div>
              <div>
                <p className="font-semibold">Isi Data Rekening</p>
                <p className="text-gray-600">Masukkan bank dan nomor rekening tujuan</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-blue-600 text-xs">
                3
              </div>
              <div>
                <p className="font-semibold">Tunggu Persetujuan Admin</p>
                <p className="text-gray-600">Penarikan akan diproses dalam 1x24 jam</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-blue-600 text-xs">
                4
              </div>
              <div>
                <p className="font-semibold">Dana Ditransfer</p>
                <p className="text-gray-600">Setelah disetujui, dana langsung masuk ke rekening Anda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Keuntungan Menabung di TabunganKu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3 p-3 bg-purple-50 rounded-lg">
              <Award className="w-10 h-10 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Poin Reward 2x Lipat</h4>
                <p className="text-sm text-gray-600">Setiap nabung Rp 10.000, dapat bonus poin Rp 20.000</p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
              <Zap className="w-10 h-10 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Proses Cepat & Mudah</h4>
                <p className="text-sm text-gray-600">Setoran otomatis masuk, penarikan diproses 1x24 jam</p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
              <Shield className="w-10 h-10 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Aman & Terpercaya</h4>
                <p className="text-sm text-gray-600">Data terenkripsi dengan sistem keamanan berlapis</p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-10 h-10 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Akses 24/7</h4>
                <p className="text-sm text-gray-600">Kelola tabungan kapan saja, di mana saja</p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-pink-50 rounded-lg">
              <Users className="w-10 h-10 text-pink-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Program Referral</h4>
                <p className="text-sm text-gray-600">Ajak teman, dapat bonus Rp 50.000 poin per referral</p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-indigo-50 rounded-lg">
              <TrendingUp className="w-10 h-10 text-indigo-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Tanpa Biaya Admin Bulanan</h4>
                <p className="text-sm text-gray-600">Hanya ada biaya saat penarikan (1% atau min Rp 2.500)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white border border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Hubungi Admin via WhatsApp</h3>
              <p className="text-sm text-gray-600 mb-3">
                Butuh bantuan atau konfirmasi transfer? Chat langsung dengan admin kami untuk respons cepat.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <a
                  href="https://wa.me/6282194909137?text=Halo%20Admin%20TabunganKu%2C%20saya%20butuh%20bantuan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-lg transition-all text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat di WhatsApp
                </a>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">082194909137</span>
                  <span className="ml-2 text-xs text-green-600 font-medium">(Admin TabunganKu)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Siap Mulai Menabung?</h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Bergabunglah dengan ribuan penabung cerdas yang sudah merasakan keuntungan menabung dengan TabunganKu
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">2x</div>
              <div className="text-sm text-gray-400">Bonus Poin</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-gray-400">Akses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">5+</div>
              <div className="text-sm text-gray-400">Metode Bayar</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
