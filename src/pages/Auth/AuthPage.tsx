import React, { useState, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../../components/common/Logo';
import { optimizeAvatarImage } from '../../utils/imageOptimizer';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Camera,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthPage: React.FC = () => {
  const { register, login, isDarkMode, toggleDarkMode } = useFinanceStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await optimizeAvatarImage(file, 512, 0.85);
      setAvatarPreview(optimized);
    } catch (err: any) {
      setErrorMsg(err.message || 'Rasmni yuklab boʻlmadi.');
    }
  };

  const validateEmail = (mail: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateEmail(email)) {
      setErrorMsg('Iltimos, toʻgʻri email manzilini kiriting (masalan: user@gmail.com).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Parol kamida 6 ta belgidan iborat boʻlishi kerak.');
      return;
    }

    setIsLoading(true);

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Iltimos, toʻliq ism-sharifingizni kiriting.');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Kiritilgan parollar bir-biriga mos kelmadi.');
        setIsLoading(false);
        return;
      }

      const res = await register(fullName, email, password, avatarPreview || undefined);
      if (!res.success) {
        setErrorMsg(res.error || 'Roʻyxatdan oʻtishda xatolik yuz berdi.');
        setIsLoading(false);
      } else {
        confetti({ particleCount: 60, spread: 70 });
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Email yoki parol notoʻgʻri.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--background)] text-[var(--text-primary)] p-4 sm:p-6 transition-colors duration-200">
      {/* Top Navbar */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <Logo variant="full" size="md" withTagline={true} />

        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          title="Rejimni oʻzgartirish"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="p-7 sm:p-9 rounded-3xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              {mode === 'login' ? 'Hisobingizga Kiring' : 'Yangi Hisob Ochish'}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              {mode === 'login'
                ? 'BARAKA platformasiga kirish uchun maʼlumotlaringizni kiriting'
                : 'Oilangiz moliyaviy boshqaruv markazini noldan boshlang'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {/* Optional Avatar Picker in Register */}
                <div className="flex flex-col items-center gap-2 pb-1">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-blue-600 cursor-pointer group"
                    title="Profil rasmi yuklash (ixtiyoriy)"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-white transition">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                  <span className="text-[11px] text-[var(--text-muted)]">Profil rasmi tanlash (ixtiyoriy)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Toʻliq Ism-Sharifingiz
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Alisher Rahimov"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm placeholder-[var(--input-placeholder)] focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Elektron Pochta (Email)
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5" />
                <input
                  type="email"
                  required
                  placeholder="alisher@baraka.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm placeholder-[var(--input-placeholder)] focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Parol
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm placeholder-[var(--input-placeholder)] focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password in Register */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Parolni Tasdiqlang
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm placeholder-[var(--input-placeholder)] focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50"
            >
              <span>{isLoading ? 'Iltimos, kuting...' : mode === 'login' ? 'Tizimga Kirish' : 'Roʻyxatdan Oʻtish'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            {mode === 'login' ? (
              <p>
                Hali hisobingiz yoʻqmi?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('register');
                  }}
                  className="text-blue-600 dark:text-cyan-400 hover:underline font-bold"
                >
                  Yangi hisob oching
                </button>
              </p>
            ) : (
              <p>
                Hisobingiz bormi?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className="text-blue-600 dark:text-cyan-400 hover:underline font-bold"
                >
                  Tizimga kiring
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-center text-[11px] text-[var(--text-muted)] max-w-md mx-auto">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-500" />
          <span>Local-Only Xavfsizlik: Barcha maʼlumotlar faqat qurilmangizda saqlanadi.</span>
        </p>
      </footer>
    </div>
  );
};
