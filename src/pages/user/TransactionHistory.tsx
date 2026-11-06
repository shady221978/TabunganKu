import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { mockTransactions, mockWithdrawals } from '@/lib/mockData';
import {
  ArrowUpCircle, ArrowDownCircle, Gift, AlertCircle, Image as ImageIcon,
  X, Coins, Wallet, Clock, CheckCircle, XCircle, Banknote,
} from 'lucide-react';
import { TRANSACTION_STATUS_LABELS, TRANSACTION_STATUS_COLORS } from '@/constants';

type TabType = 'all' | 'balance' | 'points';

export default function TransactionHistory() {
  const { user } = useAuth();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  if (!user) return null;

  const transactions = mockTransactions.getTransactions()
    .filter(t => t.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const withdrawals = mockWithdrawals.getWithdrawals()
    .filter(w => w.userId === user.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  // Combine and sort all transactions
  const allTransactions = [
    ...transactions.map(t => ({ ...t, category: 'transaction' as const })),
    ...withdrawals.map(w => ({
      id: w.id,
      type: 'withdraw' as const,
      amount: w.amount,
      status: w.status,
      createdAt: w.requestedAt,
      category: 'withdrawal' as const,
      bankName: w.bankName,
      accountNumber: w.accountNumber,
      accountName: w.accountName,
      fee: w.fee,
      netAmount: w.netAmount,
      notes: (w as any).notes,
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const balanceTransactions = allTransactions.filter(item => {
    if (item.category === 'withdrawal') {
      return !(item as any).bankName?.startsWith('[POIN]');
    }
    return true;
  });

  const pointsTransactions = allTransactions.filter(item =>
    item.category === 'withdrawal' && (item as any).bankName?.startsWith('[POIN]')
  );

  const displayedTransactions =
    activeTab === 'all' ? allTransactions :
    activeTab === 'balance' ? balanceTransactions :
    pointsTransactions;

  const tabConfig: { key: TabType; label: string; count: number; activeClass: string }[] = [
    { key: 'all', label: 'Semua', count: allTransactions.length, activeClass: 'bg-gray-900 text-white shadow-md' },
    { key: 'balance', label: 'Saldo & Setoran', count: balanceTransactions.length, activeClass: 'bg-blue-600 text-white shadow-md' },
    { key: 'points', label: 'Poin Reward', count: pointsTransactions.length, activeClass: 'bg-yellow-500 text-white shadow-md' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
        <p className="text-gray-600">Semua aktivitas tabungan Anda</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 p-1.5 bg-gray-100 rounded-xl">
        {tabConfig.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex-1 ${
              activeTab === tab.key
                ? tab.activeClass
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/70'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-xs">
              {tab.key === 'all' ? 'Semua' : tab.key === 'balance' ? 'Saldo' : 'Poin'}
            </span>
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
              activeTab === tab.key ? 'bg-white/30' : 'bg-gray-200 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Points Tab — dedicated layout */}
      {activeTab === 'points' && pointsTransactions.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-gray-500">
            <Coins className="w-16 h-16 mx-auto mb-4 opacity-30 text-yellow-500" />
            <p className="text-lg font-semibold mb-2">Belum Ada Penarikan Poin</p>
            <p className="text-sm">Histori penarikan poin reward Anda akan muncul di sini</p>
          </CardContent>
        </Card>
      ) : activeTab === 'points' ? (
        <div className="space-y-3">
          {pointsTransactions.map((item) => {
            const rawBank = (item as any).bankName as string;
            const displayBank = rawBank?.replace('[POIN] ', '') || '-';
            const st = item.status;
            const statusIcon =
              st === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> :
              st === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> :
              <Clock className="w-3.5 h-3.5" />;
            const statusLabel =
              st === 'approved' ? 'Disetujui' :
              st === 'rejected' ? 'Ditolak' : 'Menunggu';
            const statusClass =
              st === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
              st === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
              'bg-yellow-100 text-yellow-800 border border-yellow-200';

            return (
              <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-yellow-400">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Coins className="w-6 h-6 text-yellow-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">Penarikan Poin Reward</h3>
                          <p className="text-xs text-gray-500">{formatDateTime(item.createdAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-lg text-yellow-600">
                            -{formatCurrency(item.amount)}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            Diterima: {formatCurrency((item as any).netAmount ?? 0)}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge className={`gap-1.5 ${statusClass}`}>
                          {statusIcon}
                          {statusLabel}
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 gap-1">
                          <Coins className="w-3 h-3" />
                          Poin Reward
                        </Badge>
                      </div>

                      {/* Bank Detail Card */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-yellow-800 mb-1.5">Rekening Tujuan</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2 border border-yellow-100">
                            <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                              <Banknote className="w-3 h-3" />Bank
                            </p>
                            <p className="text-sm font-bold text-gray-800">{displayBank}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-yellow-100">
                            <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                              <Wallet className="w-3 h-3" />No. Rekening
                            </p>
                            <p className="text-sm font-mono font-bold text-gray-800">
                              {(item as any).accountNumber || '-'}
                            </p>
                          </div>
                        </div>
                        {(item as any).accountName && (
                          <div className="bg-white rounded-lg p-2 border border-yellow-100">
                            <p className="text-xs text-gray-400 mb-0.5">Atas Nama</p>
                            <p className="text-sm font-semibold text-gray-800">{(item as any).accountName}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-yellow-200">
                          <span className="text-gray-500">Biaya Admin</span>
                          <span className="text-red-600 font-semibold">-{formatCurrency((item as any).fee ?? 0)}</span>
                        </div>
                      </div>

                      {(item as any).notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                          <strong>Catatan:</strong> {(item as any).notes}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : displayedTransactions.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-gray-500">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">Belum Ada Transaksi</p>
            <p className="text-sm">Riwayat setoran dan penarikan Anda akan muncul di sini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedTransactions.map((item) => (
            <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.type === 'deposit' ? 'bg-green-100' :
                    item.type === 'withdraw' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {item.type === 'deposit' ?
                      <ArrowUpCircle className="w-6 h-6 text-green-600" /> :
                      item.type === 'withdraw' ?
                      <ArrowDownCircle className="w-6 h-6 text-red-600" /> :
                      <Gift className="w-6 h-6 text-blue-600" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.type === 'deposit' ? 'Setoran Tabungan' :
                           item.type === 'withdraw' ?
                             (item.category === 'withdrawal' && (item as any).bankName?.startsWith('[POIN]')
                               ? 'Penarikan Poin Reward'
                               : 'Penarikan Saldo')
                           : 'Bonus Poin'}
                        </h3>
                        <p className="text-sm text-gray-500">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          item.type === 'deposit' ? 'text-green-600' :
                          item.type === 'withdraw' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {item.type === 'deposit' ? '+' : '-'}{formatCurrency(item.amount)}
                        </p>
                        {'pointsEarned' in item && item.pointsEarned && (
                          <p className="text-xs text-blue-600">+{formatCurrency(item.pointsEarned)} poin</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <Badge className={TRANSACTION_STATUS_COLORS[item.status]}>
                        {TRANSACTION_STATUS_LABELS[item.status]}
                      </Badge>

                      {'paymentMethod' in item && item.paymentMethod && (
                        <Badge variant="outline">{item.paymentMethod.toUpperCase()}</Badge>
                      )}

                      {item.category === 'withdrawal' && 'bankName' in item && (() => {
                        const rawBank = (item as any).bankName as string;
                        const isPoin = rawBank?.startsWith('[POIN]');
                        return (
                          <>
                            {isPoin && (
                              <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                                <Coins className="w-3 h-3" />Poin Reward
                              </Badge>
                            )}
                            <Badge variant="outline">{isPoin ? rawBank.replace('[POIN] ', '') : rawBank}</Badge>
                            <span className="text-xs text-gray-500">{(item as any).accountNumber}</span>
                          </>
                        );
                      })()}
                    </div>

                    {item.category === 'withdrawal' && 'fee' in item && (
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <p>Biaya Admin: {formatCurrency((item as any).fee)}</p>
                        <p>Diterima: {formatCurrency((item as any).netAmount)}</p>
                      </div>
                    )}

                    {item.category === 'transaction' && 'paymentProof' in item && item.paymentProof && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewImage((item as any).paymentProof || null)}
                          className="gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Lihat Bukti Transfer
                        </Button>
                        {'proofStatus' in item && (
                          <Badge className={`ml-2 ${
                            (item as any).proofStatus === 'verified' ? 'bg-green-100 text-green-800' :
                            (item as any).proofStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {(item as any).proofStatus === 'verified' ? '✓ Terverifikasi' :
                             (item as any).proofStatus === 'rejected' ? '✗ Ditolak' :
                             '⏳ Menunggu Verifikasi'}
                          </Badge>
                        )}
                      </div>
                    )}

                    {'notes' in item && (item as any).notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <strong>Catatan:</strong> {(item as any).notes}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
