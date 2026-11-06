import { useMemo, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, cn, getPointsDaysRemaining, arePointsUnlocked } from '@/lib/utils';
import { Wallet, Gift, ArrowUpCircle, ArrowDownCircle, History, Download, Users, Info, Target, ChevronRight, Clock, TrendingUp, Coins, CheckCircle, Bell, X, Star, Trophy, Sparkles } from 'lucide-react';
import { mockTransactions } from '@/lib/mockData';
import { generateTransactionPDF } from '@/lib/pdf';
import { soundService } from '@/lib/sound';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function UserDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [dismissedMilestone, setDismissedMilestone] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const confettiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!user) return null;

  const daysRemaining = getPointsDaysRemaining(user);
  const pointsUnlocked = arePointsUnlocked(user);

  // Determine active milestone (1, 5, or 10 days)
  const activeMilestone: 1 | 5 | 10 | null =
    daysRemaining === 1 ? 1 :
    daysRemaining === 5 ? 5 :
    daysRemaining === 10 ? 10 :
    null;

  // Sound + browser notification for each milestone (fires once per milestone per user)
  useEffect(() => {
    if (!user || daysRemaining === null) return;

    // Check and play milestones
    const checkMilestone = async (days: 1 | 5 | 10, storageKey: string) => {
      if (daysRemaining !== days) return;
      const notified = localStorage.getItem(storageKey);
      if (notified) return;

      localStorage.setItem(storageKey, 'true');

      const messages: Record<number, { title: string; body: string }> = {
        10: { title: '⏰ Poin Reward: 10 Hari Lagi!', body: `Countdown poin reward Anda tersisa 10 hari. Siapkan rekening untuk pencairan ${formatCurrency(user.points)}.` },
        5:  { title: '⚠️ Poin Reward: 5 Hari Lagi!', body: `Hampir tiba! Poin reward ${formatCurrency(user.points)} bisa ditarik dalam 5 hari lagi.` },
        1:  { title: '🚨 Poin Reward: BESOK Bisa Ditarik!', body: `Besok adalah hari ke-100! Poin reward ${formatCurrency(user.points)} siap dicairkan besok.` },
      };

      if (days === 10) soundService.playMilestone10Days();
      else if (days === 5) soundService.playMilestone5Days();
      else soundService.playMilestone1Day();

      const msg = messages[days];
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(msg.title, { body: msg.body });
      }
    };

    checkMilestone(10, `pointsMilestone10_${user.id}`);
    checkMilestone(5, `pointsMilestone5_${user.id}`);
    checkMilestone(1, `pointsMilestone1_${user.id}`);
  }, [daysRemaining, user?.id]);

  // Check and send unlock notification when days first reach 0
  useEffect(() => {
    if (pointsUnlocked && !user.pointsUnlockNotified) {
      // Mark as notified
      updateUser({ pointsUnlockNotified: true } as any);
      soundService.playPointsUnlocked();
      // Show in-app notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 Poin Reward Siap Ditarik!', {
          body: `Selamat! Poin reward Anda sebesar ${formatCurrency(user.points)} sudah bisa ditarik sekarang.`,
        });
      }
    }
  }, [pointsUnlocked]);

  // 🎉 Celebration overlay — show once when 100-day countdown first completes
  useEffect(() => {
    if (!user || !pointsUnlocked) return;
    const celebratedKey = `pointsCelebrated_${user.id}`;
    if (localStorage.getItem(celebratedKey)) return;
    // First time unlock detected
    localStorage.setItem(celebratedKey, 'true');
    setShowCelebration(true);
  }, [pointsUnlocked, user?.id]);

  // Confetti burst when celebration overlay is shown
  useEffect(() => {
    if (!showCelebration) {
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
        confettiIntervalRef.current = null;
      }
      return;
    }

    // Initial big burst
    const fireBurst = () => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#22c55e', '#facc15', '#3b82f6', '#a855f7', '#ef4444', '#f97316'],
        scalar: 1.1,
      });
    };
    fireBurst();

    // Side cannons
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors: ['#22c55e', '#facc15', '#3b82f6'] });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: ['#a855f7', '#ef4444', '#f97316'] });

    // Repeating confetti every 1.8s
    confettiIntervalRef.current = setInterval(() => {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: Math.random() * 0.6 + 0.2, y: 0.35 },
        colors: ['#22c55e', '#facc15', '#3b82f6', '#a855f7'],
        scalar: 0.9,
      });
    }, 1800);

    // Auto-stop confetti after 8 seconds
    const stopTimer = setTimeout(() => {
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
        confettiIntervalRef.current = null;
      }
    }, 8000);

    return () => {
      if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
      clearTimeout(stopTimer);
    };
  }, [showCelebration]);

  const GOAL_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
    motor: { label: 'Tabungan Motor', color: 'from-orange-400 to-amber-500', emoji: '🏍️' },
    mobil: { label: 'Tabungan Mobil', color: 'from-blue-400 to-sky-500', emoji: '🚗' },
    pendidikan: { label: 'Tabungan Pendidikan', color: 'from-purple-400 to-violet-500', emoji: '🎓' },
    usaha: { label: 'Tabungan Usaha', color: 'from-green-400 to-emerald-500', emoji: '🏪' },
    rumah: { label: 'Tabungan Rumah', color: 'from-rose-400 to-pink-500', emoji: '🏠' },
  };

  const activeGoal = (user as any).savingsGoal ? GOAL_LABELS[(user as any).savingsGoal] : null;

  // Goal progress calculations
  const goalStats = useMemo(() => {
    const goalId = (user as any).savingsGoal as string | undefined;
    if (!goalId) return null;

    // Get stored target
    const GOAL_DEFAULTS: Record<string, number> = {
      motor: 25000000, mobil: 150000000, pendidikan: 50000000,
      usaha: 20000000, rumah: 200000000,
    };
    let targetAmount = GOAL_DEFAULTS[goalId] || 0;
    try {
      const stored = localStorage.getItem('savingsGoalTargets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[goalId]) targetAmount = parsed[goalId];
      }
    } catch {}

    const currentBalance = user.balance;
    const progressPercent = targetAmount > 0 ? Math.min((currentBalance / targetAmount) * 100, 100) : 0;
    const remaining = Math.max(targetAmount - currentBalance, 0);

    // Average monthly deposit
    const allTx = mockTransactions.getTransactions().filter(
      t => t.userId === user.id && t.type === 'deposit' && t.status === 'completed'
    );
    const totalDeposited = allTx.reduce((sum, t) => sum + t.amount, 0);
    let avgMonthlyDeposit = 0;
    if (allTx.length > 0) {
      const dates = allTx.map(t => new Date(t.createdAt).getTime());
      const earliest = Math.min(...dates);
      const monthsElapsed = Math.max(1, (Date.now() - earliest) / (1000 * 60 * 60 * 24 * 30));
      avgMonthlyDeposit = totalDeposited / monthsElapsed;
    }
    const estimatedMonths = avgMonthlyDeposit > 0 && remaining > 0
      ? Math.ceil(remaining / avgMonthlyDeposit)
      : null;

    return { targetAmount, progressPercent, remaining, estimatedMonths, avgMonthlyDeposit };
  }, [user]);

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return 'bg-white';
    if (pct >= 75) return 'bg-white';
    if (pct >= 50) return 'bg-white/90';
    if (pct >= 25) return 'bg-white/80';
    return 'bg-white/70';
  };

  const transactions = mockTransactions.getTransactions()
    .filter(t => t.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleDownloadPDF = async () => {
    try {
      await generateTransactionPDF(user);
      toast.success('PDF berhasil dibuat! Silakan cek jendela baru');
    } catch (error) {
      toast.error('Gagal membuat PDF');
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    confetti.reset();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* 🎉 100-Day Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}>
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleCloseCelebration}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>

            {/* Gradient header */}
            <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 px-6 pt-10 pb-8 text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto mb-4">
                {/* Animated ring */}
                <span className="absolute inset-0 rounded-full bg-white/25 animate-ping" style={{ animationDuration: '1.4s' }} />
                <span className="absolute inset-2 rounded-full bg-white/20" />
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-1 leading-tight">Selamat! 🎉</h2>
              <p className="text-white/90 font-semibold text-sm">100 Hari Berhasil Tercapai!</p>
            </div>

            {/* Body */}
            <div className="px-6 py-6 text-center space-y-4">
              {/* Stars row */}
              <div className="flex justify-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">
                Anda telah menabung selama <span className="font-bold text-green-600">100 hari</span> dan poin reward Anda kini <span className="font-bold text-green-600">siap untuk dicairkan</span>!
              </p>

              {/* Points amount highlight */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-5 py-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" /> Total Poin Reward
                </p>
                <p className="text-3xl font-black text-green-600">{formatCurrency(user.points)}</p>
                <p className="text-xs text-gray-500 mt-1">Siap dicairkan ke rekening Anda</p>
              </div>

              {/* Sparkles note */}
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Ayo cairkan sebelum saldo berubah!
              </p>

              {/* CTA buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => { handleCloseCelebration(); navigate('/points-withdraw'); }}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  Tarik Poin Sekarang
                </button>
                <button
                  onClick={handleCloseCelebration}
                  className="w-full py-2.5 text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Selamat Datang, {user.name}!</h1>
        <p className="text-green-50">No. Anggota: {user.memberNumber}</p>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Saldo Tabungan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(user.balance)}</div>
            <p className="text-xs text-gray-500 mt-2">Saldo aktif Anda</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Total Poin Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(user.points)}</div>
            {daysRemaining === null ? (
              <p className="text-xs text-gray-500 mt-2">Mulai menabung untuk unlock poin</p>
            ) : pointsUnlocked ? (
              <div className="mt-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-green-700 font-semibold">Poin siap ditarik!</span>
              </div>
            ) : (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysRemaining} hari lagi</span>
                  <span>{100 - daysRemaining}/100</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, 100 - daysRemaining))}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/deposit">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-green-500">
            <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <ArrowUpCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-sm">Setor Tunai</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/withdraw">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-red-500">
            <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <ArrowDownCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="font-semibold text-sm">Tarik Tunai</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/transactions">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
            <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-semibold text-sm">Riwayat</p>
            </CardContent>
          </Card>
        </Link>

        <button onClick={handleDownloadPDF}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 w-full">
            <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-semibold text-sm">Download PDF</p>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Milestone Alert Banners — 10, 5, 1 day */}
      {activeMilestone !== null && dismissedMilestone !== activeMilestone && daysRemaining !== null && (
        <div className={`rounded-2xl shadow-lg overflow-hidden ${
          activeMilestone === 1
            ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
            : activeMilestone === 5
            ? 'bg-gradient-to-r from-orange-500 to-amber-500'
            : 'bg-gradient-to-r from-blue-500 to-sky-500'
        }`}>
          <div className="p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {activeMilestone === 1 ? '🚨' : activeMilestone === 5 ? '⚠️' : '⏰'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight">
                  {activeMilestone === 1
                    ? 'Besok Poin Reward Bisa Ditarik!'
                    : activeMilestone === 5
                    ? `Poin Reward: ${activeMilestone} Hari Lagi!`
                    : `Poin Reward: ${activeMilestone} Hari Lagi!`}
                </p>
                <p className="text-white/85 text-xs mt-0.5 leading-relaxed">
                  {activeMilestone === 1
                    ? `Ini adalah hari ke-99! Besok ${formatCurrency(user.points)} poin reward Anda sudah bisa dicairkan.`
                    : `Countdown poin reward ${formatCurrency(user.points)} tersisa ${activeMilestone} hari. Siapkan data rekening Anda.`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Link to="/points-withdraw">
                    <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
                      <Bell className="w-3 h-3" /> Lihat Detail Poin
                    </button>
                  </Link>
                  <button
                    onClick={() => setDismissedMilestone(activeMilestone)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Tutup
                  </button>
                </div>
              </div>
              {/* Milestone progress ring */}
              <div className="flex-shrink-0 text-right">
                <div className="bg-white/20 rounded-xl px-2.5 py-1.5 text-center">
                  <p className="text-2xl font-black">{activeMilestone}</p>
                  <p className="text-xs text-white/80">hari</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points Unlock Banner */}
      {daysRemaining !== null && (
        <Card className={`border-0 shadow-lg overflow-hidden ${
          pointsUnlocked
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500'
        }`}>
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {pointsUnlocked ? '🎉' : '🔒'}
                </div>
                <div>
                  <p className="font-bold text-base leading-tight">
                    {pointsUnlocked ? 'Poin Reward Siap Ditarik!' : 'Poin Reward Terkunci'}
                  </p>
                  {pointsUnlocked ? (
                    <p className="text-white/80 text-xs mt-0.5">
                      {formatCurrency(user.points)} poin siap dicairkan ke rekening Anda
                    </p>
                  ) : (
                    <p className="text-white/80 text-xs mt-0.5">
                      Dapat ditarik dalam <span className="font-bold text-white">{daysRemaining} hari</span> lagi ({100 - daysRemaining}/100 hari)
                    </p>
                  )}
                  {!pointsUnlocked && (
                    <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden w-48">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${Math.max(0, 100 - daysRemaining)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {pointsUnlocked && (
                <Link to="/points-withdraw">
                  <Button size="sm" className="bg-white text-green-700 hover:bg-green-50 font-bold gap-1.5 flex-shrink-0">
                    <Coins className="w-4 h-4" />
                    Tarik Sekarang
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Goal Banner */}
      <Link to="/savings-goal">
        <Card className="border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all group">
          <CardContent className="p-0">
            <div className={`bg-gradient-to-r ${
              activeGoal ? activeGoal.color : 'from-gray-400 to-gray-500'
            } p-5 text-white`}>
              {/* Top Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    {activeGoal ? activeGoal.emoji : '🎯'}
                  </div>
                  <div>
                    <p className="text-white/80 text-xs mb-0.5 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Tujuan Tabungan
                    </p>
                    <p className="font-bold text-base leading-tight">
                      {activeGoal ? activeGoal.label : 'Belum dipilih'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>

              {/* Progress Section - only if goal is set */}
              {activeGoal && goalStats ? (
                <>
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-white/90 mb-1">
                      <span className="font-semibold">
                        {goalStats.progressPercent >= 100 ? '🎉 Target Tercapai!' : `${goalStats.progressPercent.toFixed(1)}% tercapai`}
                      </span>
                      <span className="opacity-80">
                        {formatCurrency(user.balance)} / {formatCurrency(goalStats.targetAmount)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-700"
                        style={{ width: `${goalStats.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs text-white/80">
                    {goalStats.progressPercent < 100 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Sisa: {formatCurrency(goalStats.remaining)}
                      </span>
                    )}
                    {goalStats.estimatedMonths !== null && goalStats.progressPercent < 100 ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{goalStats.estimatedMonths < 12
                          ? `${goalStats.estimatedMonths} bulan lagi`
                          : `${(goalStats.estimatedMonths / 12).toFixed(1)} tahun lagi`}
                      </span>
                    ) : goalStats.progressPercent < 100 ? (
                      <span className="opacity-70">Mulai menabung untuk estimasi</span>
                    ) : null}
                    {goalStats.progressPercent >= 100 && (
                      <span className="font-semibold">Selamat, target berhasil dicapai! 🎊</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-white/70 text-xs">
                  Tap untuk pilih tujuan tabungan Anda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/referral">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Program Referral</h3>
                  <p className="text-purple-100 text-sm mb-3">Ajak teman, dapatkan bonus poin!</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
                    <p className="text-xs mb-1">Kode Referral Anda:</p>
                    <p className="font-bold text-lg">{user.referralCode}</p>
                  </div>
                </div>
                <Users className="w-12 h-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/about">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Tentang TabunganKu</h3>
                  <p className="text-blue-100 text-sm mb-3">Pelajari cara menabung & keuntungannya</p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Pelajari Lebih Lanjut
                  </Button>
                </div>
                <Info className="w-12 h-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaksi Terakhir</CardTitle>
            <Link to="/transactions">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {t.type === 'deposit' ? 
                        <ArrowUpCircle className="w-5 h-5 text-green-600" /> : 
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {t.type === 'deposit' ? 'Setoran' : 'Penarikan'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    {t.pointsEarned && (
                      <p className="text-xs text-blue-600">+{formatCurrency(t.pointsEarned)} poin</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
