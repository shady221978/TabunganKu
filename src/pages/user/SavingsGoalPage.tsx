import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn, formatCurrency } from '@/lib/utils';
import { mockTransactions } from '@/lib/mockData';
import {
  CheckCircle2,
  Target,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar,
  Wallet,
  Edit3,
  Save,
  BarChart3,
  Clock,
} from 'lucide-react';

import goalMotor from '@/assets/goal-motor.jpg';
import goalMobil from '@/assets/goal-mobil.jpg';
import goalPendidikan from '@/assets/goal-pendidikan.jpg';
import goalUsaha from '@/assets/goal-usaha.jpg';
import goalRumah from '@/assets/goal-rumah.jpg';

interface SavingsGoal {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
  accentColor: string;
  borderColor: string;
  badgeColor: string;
  estimatedRange: string;
  defaultTarget: number;
  tips: string[];
  popular?: boolean;
}

const SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'motor',
    title: 'Tabungan Motor',
    description: 'Wujudkan impian memiliki kendaraan roda dua untuk mobilitas sehari-hari',
    image: goalMotor,
    color: 'from-orange-50 to-amber-50',
    accentColor: 'text-orange-600',
    borderColor: 'border-orange-400',
    badgeColor: 'bg-orange-100 text-orange-700',
    estimatedRange: 'Rp 15 jt – Rp 35 jt',
    defaultTarget: 25000000,
    tips: ['Cicilan ringan mulai Rp 500rb/bln', 'Uang muka min 20%', 'Setor rutin setiap bulan'],
    popular: true,
  },
  {
    id: 'mobil',
    title: 'Tabungan Mobil',
    description: 'Rencanakan pembelian kendaraan roda empat untuk kenyamanan keluarga',
    image: goalMobil,
    color: 'from-blue-50 to-sky-50',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-400',
    badgeColor: 'bg-blue-100 text-blue-700',
    estimatedRange: 'Rp 100 jt – Rp 300 jt',
    defaultTarget: 150000000,
    tips: ['Target uang muka 30%', 'Tabung konsisten 3–5 tahun', 'Manfaatkan poin reward'],
  },
  {
    id: 'pendidikan',
    title: 'Tabungan Pendidikan',
    description: 'Investasi terbaik untuk masa depan anak dan pengembangan diri',
    image: goalPendidikan,
    color: 'from-purple-50 to-violet-50',
    accentColor: 'text-purple-600',
    borderColor: 'border-purple-400',
    badgeColor: 'bg-purple-100 text-purple-700',
    estimatedRange: 'Rp 20 jt – Rp 150 jt',
    defaultTarget: 50000000,
    tips: ['Mulai sedini mungkin', 'Biaya pendidikan naik 10%/tahun', 'Tabungan berbunga ganda'],
    popular: true,
  },
  {
    id: 'usaha',
    title: 'Tabungan Usaha',
    description: 'Bangun modal untuk memulai atau mengembangkan bisnis Anda sendiri',
    image: goalUsaha,
    color: 'from-green-50 to-emerald-50',
    accentColor: 'text-green-600',
    borderColor: 'border-green-400',
    badgeColor: 'bg-green-100 text-green-700',
    estimatedRange: 'Rp 5 jt – Rp 50 jt',
    defaultTarget: 20000000,
    tips: ['Modal usaha kecil mulai Rp 5jt', 'Pisahkan tabungan usaha & pribadi', 'Target 6 bulan operasional'],
  },
  {
    id: 'rumah',
    title: 'Tabungan Rumah',
    description: 'Raih hunian impian dengan perencanaan tabungan yang terstruktur',
    image: goalRumah,
    color: 'from-rose-50 to-pink-50',
    accentColor: 'text-rose-600',
    borderColor: 'border-rose-400',
    badgeColor: 'bg-rose-100 text-rose-700',
    estimatedRange: 'Rp 50 jt – Rp 500 jt',
    defaultTarget: 200000000,
    tips: ['Uang muka KPR min 10–30%', 'Tabung 10 tahun untuk rumah impian', 'Poin reward bantu percepat target'],
  },
];

// localStorage helpers for goal target
const GOAL_TARGETS_KEY = 'savingsGoalTargets';
const getGoalTargets = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(GOAL_TARGETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
const saveGoalTarget = (goalId: string, target: number) => {
  const targets = getGoalTargets();
  targets[goalId] = target;
  localStorage.setItem(GOAL_TARGETS_KEY, JSON.stringify(targets));
};

export default function SavingsGoalPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<string>((user as any)?.savingsGoal || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Load stored targets from localStorage
  const storedTargets = getGoalTargets();

  // Get current goal object
  const currentGoal = SAVINGS_GOALS.find(g => g.id === selectedGoal);

  // Target amount state
  const [targetInput, setTargetInput] = useState<string>(() => {
    if (selectedGoal && storedTargets[selectedGoal]) {
      return storedTargets[selectedGoal].toLocaleString('id-ID');
    }
    const goal = SAVINGS_GOALS.find(g => g.id === selectedGoal);
    return goal ? goal.defaultTarget.toLocaleString('id-ID') : '';
  });

  const targetAmount = useMemo(() => {
    const raw = parseInt(targetInput.replace(/\D/g, '')) || 0;
    return raw;
  }, [targetInput]);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setTargetInput(value ? parseInt(value).toLocaleString('id-ID') : '');
  };

  const handleSaveTarget = () => {
    if (targetAmount < 100000) {
      toast.error('Target minimal Rp 100.000');
      return;
    }
    saveGoalTarget(selectedGoal, targetAmount);
    setIsEditingTarget(false);
    toast.success('Target tabungan diperbarui!');
  };

  // Calculate average monthly deposit from approved transactions
  const { avgMonthlyDeposit, totalDeposited, monthsElapsed } = useMemo(() => {
    if (!user) return { avgMonthlyDeposit: 0, totalDeposited: 0, monthsElapsed: 0 };

    const allTx = mockTransactions.getTransactions().filter(
      t => t.userId === user.id && t.type === 'deposit' && t.status === 'completed'
    );

    const totalDeposited = allTx.reduce((sum, t) => sum + t.amount, 0);

    if (allTx.length === 0) return { avgMonthlyDeposit: 0, totalDeposited: 0, monthsElapsed: 0 };

    // Find earliest and latest transaction date
    const dates = allTx.map(t => new Date(t.createdAt).getTime());
    const earliest = Math.min(...dates);
    const now = Date.now();
    const monthsElapsed = Math.max(1, (now - earliest) / (1000 * 60 * 60 * 24 * 30));
    const avgMonthlyDeposit = totalDeposited / monthsElapsed;

    return { avgMonthlyDeposit, totalDeposited, monthsElapsed: Math.round(monthsElapsed) };
  }, [user]);

  // Progress calculations
  const currentBalance = user?.balance || 0;
  const progressPercent = targetAmount > 0 ? Math.min((currentBalance / targetAmount) * 100, 100) : 0;
  const remaining = Math.max(targetAmount - currentBalance, 0);
  const estimatedMonths = avgMonthlyDeposit > 0
    ? Math.ceil(remaining / avgMonthlyDeposit)
    : null;

  const handleSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    // Update target input for newly selected goal
    const stored = getGoalTargets();
    const goal = SAVINGS_GOALS.find(g => g.id === goalId);
    if (stored[goalId]) {
      setTargetInput(stored[goalId].toLocaleString('id-ID'));
    } else if (goal) {
      setTargetInput(goal.defaultTarget.toLocaleString('id-ID'));
    }
    setIsEditingTarget(false);
  };

  const handleSave = async () => {
    if (!selectedGoal) {
      toast.error('Pilih salah satu tujuan tabungan terlebih dahulu');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 600));
    // Save target if set
    if (targetAmount > 0) {
      saveGoalTarget(selectedGoal, targetAmount);
    }
    updateUser({ savingsGoal: selectedGoal } as any);
    toast.success('Tujuan tabungan berhasil disimpan!');
    setIsSaving(false);
    setTimeout(() => navigate('/'), 500);
  };

  // Progress bar color based on percentage
  const getProgressColor = (pct: number) => {
    if (pct >= 100) return 'bg-green-500';
    if (pct >= 75) return 'bg-emerald-400';
    if (pct >= 50) return 'bg-blue-500';
    if (pct >= 25) return 'bg-yellow-500';
    return 'bg-orange-400';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-4 shadow-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Pilih Tujuan Tabungan
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Tentukan tujuan tabunganmu agar lebih terarah dan termotivasi untuk menabung setiap hari
        </p>
      </div>

      {/* Progress Panel - shown when goal is selected */}
      {selectedGoal && currentGoal && (
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className={`bg-gradient-to-r ${
            selectedGoal === 'motor' ? 'from-orange-500 to-amber-500' :
            selectedGoal === 'mobil' ? 'from-blue-500 to-sky-500' :
            selectedGoal === 'pendidikan' ? 'from-purple-500 to-violet-500' :
            selectedGoal === 'usaha' ? 'from-green-500 to-emerald-500' :
            'from-rose-500 to-pink-500'
          } p-5 text-white`}>
            <div className="flex items-center gap-3 mb-1">
              <BarChart3 className="w-5 h-5 opacity-80" />
              <span className="font-semibold text-sm opacity-90">Progress Pencapaian — {currentGoal.title}</span>
            </div>
          </div>

          <CardContent className="p-5 space-y-5">
            {/* Target Input Row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Target Tabungan
                </Label>
                {isEditingTarget ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                      <Input
                        value={targetInput}
                        onChange={handleTargetChange}
                        className="pl-10 font-semibold text-base h-11"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveTarget(); if (e.key === 'Escape') setIsEditingTarget(false); }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleSaveTarget}
                      size="icon"
                      className="h-11 w-11 bg-green-600 hover:bg-green-700 flex-shrink-0"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingTarget(true)}
                    className="group flex items-center gap-2 text-left w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(targetAmount)}</span>
                    <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                )}
              </div>

              <div className="flex gap-4 sm:gap-6 text-center sm:pb-1">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1 justify-center">
                    <Wallet className="w-3 h-3" /> Saldo Saat Ini
                  </p>
                  <p className="font-bold text-gray-900">{formatCurrency(currentBalance)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1 justify-center">
                    <TrendingUp className="w-3 h-3" /> Sisa Target
                  </p>
                  <p className="font-bold text-red-500">{formatCurrency(remaining)}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">
                  {progressPercent >= 100 ? '🎉 Target Tercapai!' : `Progres: ${progressPercent.toFixed(1)}%`}
                </span>
                <span className="text-gray-500 font-medium">
                  {formatCurrency(currentBalance)} / {formatCurrency(targetAmount)}
                </span>
              </div>

              <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 relative",
                    getProgressColor(progressPercent)
                  )}
                  style={{ width: `${progressPercent}%` }}
                >
                  {progressPercent >= 15 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">
                      {progressPercent.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Milestone markers */}
              <div className="flex justify-between text-xs text-gray-400 px-0.5">
                {[0, 25, 50, 75, 100].map(pct => (
                  <span
                    key={pct}
                    className={cn(
                      "font-medium",
                      progressPercent >= pct && pct > 0 ? 'text-green-600' : 'text-gray-400'
                    )}
                  >
                    {pct}%
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 justify-center">
                  <TrendingUp className="w-3 h-3" /> Rata-rata Setor/Bulan
                </p>
                <p className="font-bold text-gray-900 text-sm">
                  {avgMonthlyDeposit > 0 ? formatCurrency(Math.round(avgMonthlyDeposit)) : '—'}
                </p>
                {avgMonthlyDeposit === 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">Belum ada data</p>
                )}
              </div>

              <div className={cn(
                "rounded-xl p-3 text-center",
                estimatedMonths !== null && estimatedMonths <= 12 ? 'bg-green-50' : 'bg-blue-50'
              )}>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 justify-center">
                  <Clock className="w-3 h-3" /> Estimasi Tercapai
                </p>
                {progressPercent >= 100 ? (
                  <p className="font-bold text-green-600 text-sm">Sudah Tercapai! 🎉</p>
                ) : estimatedMonths !== null ? (
                  <>
                    <p className="font-bold text-gray-900 text-sm">
                      {estimatedMonths <= 0 ? 'Bulan ini!' : `${estimatedMonths} bulan`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ≈ {estimatedMonths <= 0 ? 'Sebentar lagi!' : estimatedMonths < 12
                        ? `${estimatedMonths} bln lagi`
                        : `${(estimatedMonths / 12).toFixed(1)} tahun`}
                    </p>
                  </>
                ) : (
                  <p className="font-bold text-gray-400 text-sm">Mulai menabung</p>
                )}
              </div>

              <div className="bg-purple-50 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 justify-center">
                  <Calendar className="w-3 h-3" /> Setoran Diperlukan/Bln
                </p>
                {estimatedMonths !== null && estimatedMonths > 0 ? (
                  <>
                    <p className="font-bold text-purple-700 text-sm">
                      {formatCurrency(Math.ceil(remaining / estimatedMonths))}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">untuk capai target</p>
                  </>
                ) : progressPercent >= 100 ? (
                  <p className="font-bold text-green-600 text-sm">Selesai! ✓</p>
                ) : (
                  <p className="font-bold text-gray-400 text-sm">—</p>
                )}
              </div>
            </div>

            {/* Quick target presets */}
            {isEditingTarget && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Pilih cepat:</p>
                <div className="flex flex-wrap gap-2">
                  {(currentGoal.id === 'motor' ? [15000000, 20000000, 25000000, 30000000, 35000000] :
                    currentGoal.id === 'mobil' ? [100000000, 150000000, 200000000, 250000000, 300000000] :
                    currentGoal.id === 'pendidikan' ? [20000000, 50000000, 75000000, 100000000, 150000000] :
                    currentGoal.id === 'usaha' ? [5000000, 10000000, 20000000, 30000000, 50000000] :
                    [50000000, 100000000, 200000000, 300000000, 500000000]
                  ).map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setTargetInput(preset.toLocaleString('id-ID'));
                      }}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
                        targetAmount === preset
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                      )}
                    >
                      {preset >= 1000000 ? `${(preset / 1000000).toFixed(0)} Jt` : `${preset / 1000} Rb`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {avgMonthlyDeposit === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Estimasi belum tersedia. Lakukan setoran rutin agar sistem dapat menghitung rata-rata dan proyeksi pencapaian target Anda.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Goal Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAVINGS_GOALS.map((goal) => {
          const isSelected = selectedGoal === goal.id;
          const storedTarget = storedTargets[goal.id] || goal.defaultTarget;
          const goalProgress = currentBalance > 0
            ? Math.min((currentBalance / storedTarget) * 100, 100)
            : 0;

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => handleSelect(goal.id)}
              className={cn(
                "relative text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden group focus:outline-none",
                isSelected
                  ? `${goal.borderColor} shadow-lg scale-[1.02]`
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              )}
            >
              {/* Popular Badge */}
              {goal.popular && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    <Star className="w-3 h-3 fill-yellow-900" />
                    Populer
                  </span>
                </div>
              )}

              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <CheckCircle2 className={cn("w-7 h-7 fill-white", goal.accentColor)} />
                </div>
              )}

              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={goal.image}
                  alt={goal.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Mini progress badge on image */}
                {goalProgress > 0 && (
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1">
                    <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", getProgressColor(goalProgress))}
                        style={{ width: `${goalProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700">{goalProgress.toFixed(0)}%</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={cn("p-4 bg-gradient-to-br", goal.color)}>
                <h3 className="font-bold text-gray-900 text-base mb-1">{goal.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">{goal.description}</p>

                {/* Target & Range */}
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className={cn("w-3.5 h-3.5", goal.accentColor)} />
                  <span className={cn("text-xs font-semibold", goal.accentColor)}>
                    Target: {goal.estimatedRange}
                  </span>
                </div>

                {/* Stored target */}
                <div className="flex items-center gap-1 mb-3">
                  <Target className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Target saya: {formatCurrency(storedTarget)}
                  </span>
                </div>

                {/* Tips */}
                <ul className="space-y-1">
                  {goal.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className={cn("mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1", goal.accentColor.replace('text-', 'bg-'))} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Summary + Save */}
      <div className="sticky bottom-20 md:bottom-6">
        <Card className={cn(
          "border-0 shadow-xl transition-all duration-300",
          currentGoal ? 'bg-white' : 'bg-gray-50'
        )}>
          <CardContent className="p-4">
            {currentGoal ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow relative">
                  <img src={currentGoal.image} alt={currentGoal.title} className="w-full h-full object-cover" />
                  {progressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                      <div
                        className={cn("h-full", getProgressColor(progressPercent))}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Tujuan dipilih:</p>
                  <p className="font-bold text-gray-900">{currentGoal.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(currentBalance)} / {formatCurrency(targetAmount)} &nbsp;•&nbsp; {progressPercent.toFixed(0)}%
                  </p>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "gap-2 flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md",
                  )}
                  size="lg"
                >
                  {isSaving ? 'Menyimpan...' : (
                    <>
                      Simpan
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">Pilih salah satu tujuan tabungan di atas</p>
                <Button disabled size="lg" className="gap-2">
                  Simpan
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
