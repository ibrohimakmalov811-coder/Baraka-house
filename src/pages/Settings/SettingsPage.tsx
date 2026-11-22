import React, { useState, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { db } from '../../database/db';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Globe,
  Settings as SettingsIcon,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    clearAllData,
    currency,
    setCurrency,
  } = useFinanceStore();

  const [familyName, setFamilyName] = useState(settings?.familyName || 'Rahimovlar Oilasi');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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
  const handleExportJSON = async () => {
    const [
      transactions,
      cards,
      services,
      budgets,
      goals,
      subscriptions,
      calendarEvents,
      notifications,
      members,
      settingsArray,
    ] = await Promise.all([
      db.transactions.toArray(),
      db.cards.toArray(),
      db.services.toArray(),
      db.budgets.toArray(),
      db.goals.toArray(),
      db.subscriptions.toArray(),
      db.calendarEvents.toArray(),
      db.notifications.toArray(),
      db.members.toArray(),
      db.settings.toArray(),
    ]);

    const backupData = {
      version: 1,
      appName: 'BARAKA FinTech',
      exportedAt: new Date().toISOString(),
      data: {
        transactions,
        cards,
        services,
        budgets,
        goals,
        subscriptions,
        calendarEvents,
        notifications,
        members,
        settings: settingsArray[0],
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BARAKA_Zaxira_Nusxa_${new Date().toISOString().slice(0, 10)}.json`;
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

        if (!parsed.data) {
          alert("Noto'g'ri fayl formati!");
          return;
        }

        const { data } = parsed;

        await db.transaction(
          'rw',
          [
            db.transactions,
            db.cards,
            db.services,
            db.budgets,
            db.goals,
            db.subscriptions,
            db.calendarEvents,
            db.notifications,
            db.members,
            db.settings,
          ],
          async () => {
            if (data.transactions) {
              await db.transactions.clear();
              await db.transactions.bulkAdd(data.transactions);
            }
            if (data.cards) {
              await db.cards.clear();
              await db.cards.bulkAdd(data.cards);
            }
            if (data.services) {
              await db.services.clear();
              await db.services.bulkAdd(data.services);
            }
            if (data.budgets) {
              await db.budgets.clear();
              await db.budgets.bulkAdd(data.budgets);
            }
            if (data.goals) {
              await db.goals.clear();
              await db.goals.bulkAdd(data.goals);
            }
            if (data.subscriptions) {
              await db.subscriptions.clear();
              await db.subscriptions.bulkAdd(data.subscriptions);
            }
            if (data.members) {
              await db.members.clear();
              await db.members.bulkAdd(data.members);
            }
          }
        );

        window.location.reload();
      } catch (err) {
        alert("Zaxira nusxasini tiklashda xatolik yuz berdi!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Tizim Sozlamalari va Maʼlumotlar Xavfsizligi</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Oila sozlamalari, valyuta parametrlari va toʻliq zaxira nusxalarini boshqarish
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Family Settings Form */}
      <div className="p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Oila Profili Sozlamalari</h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Oila yoki Profil nomi
              </label>
              <input
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Asosiy Valyuta
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
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

      {/* Backup and Data Safety (IndexedDB) */}
      <div className="p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">Maʼlumotlar Xavfsizligi va Zaxira</h3>
            <p className="text-xs text-slate-400">
              Barcha moliyaviy maʼlumotlar xavfsiz tarzda brauzeringizning IndexedDB xotirasida saqlanadi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Toʻliq Zaxirani Yuklab Olish (JSON)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Barcha amaliyotlar, kartalar, kommunal toʻlovlar va byudjetlarni bitta fayl koʻrinishida saqlang.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition"
            >
              Faylni Eksport Qilish
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Zaxiradan Qayta Tiklash (JSON)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Avval saqlab olingan JSON fayli orqali barcha maʼlumotlarni qayta tiklang.
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
              className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition"
            >
              Faylni Tanlash va Tiklash
            </button>
          </div>
        </div>

        {/* Reset and Clear Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Namunaviy Demo Maʼlumotlarni Qayta Yuklash</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Barcha Maʼlumotlarni Tozalash (0 dan boshlash)</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-baraka-card rounded-2xl border border-white/10 p-6 shadow-2xl text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Namunaviy maʼlumotlarni qaytarish</h3>
            <p className="text-xs text-slate-400">
              Ushbu amal barcha amaldagi maʼlumotlarni dastlabki oʻzbek oilasi demo koʻrinishiga qaytaradi.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  await resetToDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold"
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
          <div className="w-full max-w-sm bg-baraka-card rounded-2xl border border-white/10 p-6 shadow-2xl text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Toʻliq tozalash</h3>
            <p className="text-xs text-slate-400">
              Barcha amaliyotlar, kartalar va maqsadlar butunlay oʻchiriladi. Ilovani noldan boshlaysiz.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  await clearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
              >
                Barchasini tozalash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
