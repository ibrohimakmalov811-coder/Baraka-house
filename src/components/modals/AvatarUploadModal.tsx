import React, { useState, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { optimizeAvatarImage } from '../../utils/imageOptimizer';
import { X, Upload, Trash2, Check, AlertCircle, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AvatarUploadModalProps {
  isOpen: boolean;
  currentAvatar?: string;
  userName: string;
  onClose: () => void;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  currentAvatar,
  userName,
  onClose,
}) => {
  const { updateAvatar } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const optimized = await optimizeAvatarImage(file, 512, 0.85);
      setPreviewUrl(optimized);
    } catch (err: any) {
      setErrorMsg(err.message || 'Rasmni yuklashda xatolik yuz berdi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (previewUrl) {
      updateAvatar(previewUrl);
      confetti({ particleCount: 40, spread: 60 });
    }
    onClose();
  };

  const handleRemove = () => {
    updateAvatar('');
    setPreviewUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] p-6 shadow-2xl space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Profil Rasmini Oʻzgartirish</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Circular Preview with gradient ring matching reference image */}
        <div className="flex justify-center py-2">
          <div className="relative rounded-full p-[3px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-xl">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={userName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-700 to-cyan-600 text-white font-black text-3xl">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          JPG, PNG yoki WEBP formatidagi rasmni tanlang. Tizim uni avtomatik kvadrat qilib moslashtiradi.
        </p>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Camera className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>{isProcessing ? 'Qayta ishlanmoqda...' : 'Qurilmadan rasm tanlash'}</span>
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="w-full py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Rasmni olib tashlash (Harflarga qaytish)</span>
            </button>
          )}
        </div>

        {/* Footer Confirmation */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-xs font-medium transition"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition"
          >
            Tasdiqlash va Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};
