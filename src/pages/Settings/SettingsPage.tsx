import React, { useState, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { storageService } from '../../services/storageService';
import { UserAvatar } from '../../components/common/UserAvatar';
import { AvatarUploadModal } from '../../components/modals/AvatarUploadModal';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Settings as SettingsIcon,
  User,
  LogOut,
  Moon,
  Sun,
  ShieldAlert,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    clearAllData,
    loadAllData,
    currency,
    setCurrency,
    currentUser,
    logout,
    isDarkMode,
    toggleDarkMode,
  } = useFinanceStore();

  const [familyName, setFamilyName] = useState(settings?.familyName || 'Rahimovlar Oilasi');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      familyName,
      primaryCurrency: currency,
    });
    setSuccessMsg("Sozlamalar muvaffaqiyatli saqlandi!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Full Database Backup Export as JSON
  const handleExportJSON = () => {
    const userId = currentUser?.id || 'guest';
    const backupData = storageService.exportUserData(userId);

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BARAKA_Zaxira_${(currentUser?.fullName || currentUser?.displayName || 'Foydalanuvchi').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        const userId = currentUser?.id || 'guest';
        const ok = storageService.importUserData(userId, parsed);
        if (ok) {
          await loadAllData();
          setSuccessMsg("Zaxira nusxasi muvaffaqiyatli tiklandi!");
          setTimeout(() => setSuccessMsg(null), 3500);
        } else {
          alert("Noto'g'ri fayl formati!");
        }
      } catch (err) {
        alert("Zaxira nusxasini tiklashda xatolik yuz berdi!");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    storageService.deleteUserAccount(currentUser.id);
    logout();
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Tizim Sozlamalari va Maʼlumotlar Xavfsizligi</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Oila sozlamalari, shaxsiy hisob, vizual rejim va zaxira nusxalarini boshqarish
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Account Info Card */}
      {currentUser && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-cyan-500" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">Foydalanuvchi Profili</h3>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/20 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                avatarUrl={currentUser.avatar}
                name={currentUser.fullName || currentUser.displayName}
                size="lg"
                showEditButton={true}
              />
              <div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  {currentUser.fullName || currentUser.displayName}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-cyan-300 text-[10px] font-bold border border-blue-500/20">
                    PBKDF2 Xavfsiz Shaxsiy Hisob
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] text-xs font-semibold border border-[var(--border)] transition self-start sm:self-auto"
            >
              Rasmni oʻzgartirish
            </button>
          </div>
        </div>
      )}

      {/* Theme & Display Mode */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isDarkMode ? <Moon className="w-5 h-5 text-cyan-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Vizual Mavzu (Theme)</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Hozirgi faol rejim: <strong className="text-[var(--text-primary)]">{isDarkMode ? 'Qorongʻi (Dark Mode)' : 'Yorugʻ (Light Mode)'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-bold transition"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Yorugʻ Rejimga oʻtish</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-500" />
                <span>Qorongʻi Rejimga oʻtish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Family Settings Form */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
          <SettingsIcon className="w-5 h-5 text-cyan-500" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">Oila Profili Sozlamalari</h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Oila yoki Profil nomi
              </label>
              <input
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Asosiy Valyuta
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
              >
                <option value="UZS">UZS — Oʻzbekiston soʻmi (soʻm)</option>
                <option value="USD">USD — AQSH dollari ($)</option>
                <option value="EUR">EUR — Yevro (€)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Data Safety */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
          <HardDrive className="w-5 h-5 text-cyan-500" />
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Maʼlumotlar Xavfsizligi va Zaxira</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Barcha moliyaviy maʼlumotlaringiz shaxsiy hisobingizga biriktirilgan holda lokal xotirada saqlanadi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-xl bg-[var(--input-background)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-500" />
                <span>Toʻliq Zaxirani Yuklab Olish (JSON)</span>
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Barcha amaliyotlar, kartalar, kommunal toʻlovlar va byudjetlarni shaxsiy JSON fayl koʻrinishida saqlang.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition"
            >
              Faylni Eksport Qilish
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl bg-[var(--input-background)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-500" />
                <span>Zaxiradan Qayta Tiklash (JSON)</span>
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Avval saqlab olingan JSON fayli orqali barcha shaxsiy maʼlumotlarni qayta tiklang.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition"
            >
              Faylni Tanlash va Tiklash
            </button>
          </div>
        </div>

        {/* Reset and Clear Actions */}
        <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] text-xs font-semibold border border-[var(--border)] transition"
          >
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span>Namunaviy Demo Maʼlumotlarni Yuklash</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold border border-rose-500/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Barcha Maʼlumotlarni Tozalash (0 dan boshlash)</span>
          </button>
        </div>

        {/* Delete Account */}
        {currentUser && (
          <div className="pt-3 border-t border-[var(--border)] flex justify-end">
            <button
              onClick={() => setShowDeleteAccountConfirm(true)}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium underline underline-offset-4"
            >
              Shaxsiy hisobni butunlay oʻchirish
            </button>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">Namunaviy maʼlumotlarni qaytarish</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Ushbu amal barcha amaldagi maʼlumotlarni dastlabki oʻzbek oilasi demo koʻrinishiga qaytaradi.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] border border-[var(--border)]"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  await resetToDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500 shadow-md shadow-amber-600/20"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">Toʻliq tozalash</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Barcha amaliyotlar, kartalar va maqsadlar butunlay oʻchiriladi. Ilovani noldan boshlaysiz.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] border border-[var(--border)]"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  await clearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-md shadow-rose-600/20"
              >
                Barchasini tozalash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl text-center space-y-4">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">Hisobni oʻchirish</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Haqiqatan ham hisobingizni va barcha bogʻliq maʼlumotlarni oʻchirmoqchimisiz? Ushbu amalni qaytarib boʻlmaydi.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] border border-[var(--border)]"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-md shadow-rose-600/20"
              >
                Hisobni oʻchirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentUser?.avatar}
        userName={currentUser?.fullName || currentUser?.displayName || 'Foydalanuvchi'}
      />
    </div>
  );
};
