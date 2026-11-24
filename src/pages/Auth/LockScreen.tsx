import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../../components/common/Logo';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sun,
  Moon,
  Users,
  KeyRound,
} from 'lucide-react';

export const LockScreen: React.FC = () => {
  const {
    lockedUser,
    unlockApp,
    switchAccount,
    isDarkMode,
    toggleDarkMode,
    failedUnlockAttempts,
  } = useFinanceStore();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the password input automatically
    passwordInputRef.current?.focus();
  }, []);

  // Progressive delay after multiple failed attempts
  useEffect(() => {
    if (lockoutCountdown > 0) {
      const timer = setTimeout(() => {
        setLockoutCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutCountdown]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutCountdown > 0) return;
    if (!password) {
      setErrorMsg('Iltimos, parolingizni kiriting.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    const res = await unlockApp(password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Kiritilgan parol notoʻgʻri.');
      setPassword('');
      passwordInputRef.current?.focus();

      // If multiple failed attempts, impose temporary cooldown
      if (failedUnlockAttempts >= 2) {
        setLockoutCountdown(Math.min(10, (failedUnlockAttempts + 1) * 2));
      }
    }
  };

  const displayName = lockedUser?.displayName || lockedUser?.fullName?.split(' ')[0] || 'Foydalanuvchi';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--background)] text-[var(--text-primary)] p-4 sm:p-6 transition-colors duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Logo size="md" withTagline={true} />

        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          title={isDarkMode ? "Yorug' rejim" : "Tungi rejim"}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Yorugʻ rejim</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Tungi rejim</span>
            </>
          )}
        </button>
      </div>

      {/* Center Lock Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="p-7 sm:p-9 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
          {/* Decorative subtle ambient gradient glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* User Profile Visual */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <UserAvatar
                avatarUrl={lockedUser?.avatar}
                name={lockedUser?.fullName || displayName}
                size="xl"
                showEditButton={false}
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-[var(--surface)]">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-muted)] font-medium">Xush kelibsiz,</p>
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight mt-0.5">
                {lockedUser?.fullName || displayName}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                Ilovaga kirish uchun shaxsiy parolingizni kiriting
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}

          {/* Temporary lockout countdown notice */}
          {lockoutCountdown > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Xavfsizlik: keyingi urinishgacha {lockoutCountdown} soniya kuting...</span>
            </div>
          )}

          {/* Quick Demo Pill if Jasur / Demo account */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setPassword('baraka2026');
                setErrorMsg(null);
              }}
              className="px-3 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-medium text-cyan-600 dark:text-cyan-400 transition flex items-center gap-1.5"
            >
              <span>💡 Demo paroli:</span>
              <strong className="font-mono underline">baraka2026</strong>
              <span className="opacity-75">(toʻldirish)</span>
            </button>
          </div>

          {/* Unlock Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading || lockoutCountdown > 0}
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm placeholder-[var(--input-placeholder)] focus:outline-none focus:border-cyan-500 transition shadow-inner disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutCountdown > 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Ilovani ochish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Account Switcher Option */}
          <div className="pt-4 border-t border-[var(--border)] text-center space-y-2">
            <button
              type="button"
              onClick={switchAccount}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition"
            >
              <Users className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
              <span>Boshqa hisob bilan kirish (yoki roʻyxatdan oʻtish)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Security Notice */}
      <div className="max-w-md mx-auto text-center space-y-1 pb-2">
        <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>PBKDF2 SHA-256 shifrlangan lokal xavfsizlik qulfi</span>
        </p>
        <p className="text-[10px] text-[var(--text-muted)] opacity-75">
          BARAKA FinTech Platform • Barcha huquqlar himoyalangan
        </p>
      </div>
    </div>
  );
};
