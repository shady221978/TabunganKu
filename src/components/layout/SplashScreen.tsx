import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    // Phase 1: enter animation (0 -> 600ms)
    const enterTimer = setTimeout(() => setPhase('visible'), 100);

    // Phase 2: stay visible (600ms -> 2400ms)
    const exitTimer = setTimeout(() => setPhase('exit'), 2400);

    // Phase 3: exit done, notify parent
    const doneTimer = setTimeout(() => onFinish(), 3000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center',
        'bg-gradient-to-br from-green-600 via-green-500 to-emerald-400',
        'transition-opacity duration-700',
        phase === 'enter' ? 'opacity-0' : phase === 'visible' ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Background decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

      {/* Content */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center gap-5 px-8 text-center',
          'transition-all duration-700',
          phase === 'enter' ? 'scale-90 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        )}
      >
        {/* Logo icon */}
        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-5xl mb-2 animate-[bounce_1.2s_ease-in-out_1]">
          💰
        </div>

        {/* App name */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            TabunganKu
          </h1>
          <div className="mt-1.5 h-1 w-16 bg-white/60 rounded-full mx-auto" />
        </div>

        {/* Tagline / welcome */}
        <div className="space-y-1">
          <p className="text-white/90 text-lg font-semibold">Selamat Datang!</p>
          <p className="text-white/70 text-sm max-w-xs leading-relaxed">
            Platform tabungan digital dengan reward <span className="font-bold text-white">2x lipat</span> untuk masa depan lebih cerah
          </p>
        </div>

        {/* Animated dots loader */}
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-white/80 rounded-full"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div className={cn(
        'absolute bottom-10 text-white/50 text-xs transition-all duration-700 delay-300',
        phase === 'enter' ? 'opacity-0' : 'opacity-100'
      )}>
        Aman · Cepat · Terpercaya
      </div>
    </div>
  );
}
