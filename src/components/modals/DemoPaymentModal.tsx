import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { UtilityService } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { X, CheckCircle, ShieldCheck, ArrowRight, Printer, AlertTriangle, Fingerprint } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DemoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: UtilityService | null;
}

export const DemoPaymentModal: React.FC<DemoPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedService,
}) => {
  const { services, cards, executeDemoPayment, currency } = useFinanceStore();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedService?.id || services[0]?.id || ''
  );
  const [accountNumber, setAccountNumber] = useState<string>(
    preselectedService?.accountNumber || ''
  );
  const [amount, setAmount] = useState<string>(
    preselectedService?.amountDue ? preselectedService.amountDue.toString() : '150000'
  );
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [receiptData, setReceiptData] = useState<{
    receiptId: string;
    serviceName: string;
    account: string;
    amount: number;
    cardLastFour: string;
    date: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || preselectedService || services[0];
  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleServiceChange = (id: string) => {
    setSelectedServiceId(id);
    const s = services.find((item) => item.id === id);
    if (s) {
      setAccountNumber(s.accountNumber);
      setAmount(s.amountDue ? s.amountDue.toString() : '100000');
    }
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleConfirmPayment = async () => {
    const numAmount = parseFloat(amount.replace(/\s/g, ''));
    if (!numAmount || !currentService || !currentCard) return;

    const res = await executeDemoPayment(currentService.id, currentCard.id, numAmount);

    setReceiptData({
      receiptId: res.receiptId,
      serviceName: currentService.name,
      account: accountNumber || currentService.accountNumber,
      amount: numAmount,
      cardLastFour: currentCard.lastFour,
      date: new Date().toLocaleString('uz-UZ'),
    });

    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    setStep('success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setStep('form');
    setReceiptData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] p-6 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {step === 'form' && "Kommunal to'lov (Demo)"}
              {step === 'review' && "To'lovni tasdiqlash"}
              {step === 'success' && "To'lov Cheki"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="my-4 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-500/30 flex items-center gap-2.5 text-xs text-blue-700 dark:text-cyan-200">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
          <span>
            <strong>DEMO TOʻLOV REJIMI:</strong> Haqiqiy mablagʻ yechilmaydi. Amaliyot brauzer xotirasida test tariqasida bajariladi.
          </span>
        </div>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={handleProceedToReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Xizmat turi va provayder
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[var(--surface)] text-[var(--text-primary)]">
                    {s.name} — {s.providerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Abonent / Hisob raqami
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="100482931"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] placeholder-[var(--input-placeholder)] font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Toʻlov summasi (soʻm)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] placeholder-[var(--input-placeholder)] text-sm font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Toʻlov kartasi
                </label>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[var(--surface)] text-[var(--text-primary)]">
                      {c.nickname} ({formatCurrency(c.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-sm font-medium transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition active:scale-95"
              >
                <span>Davom etish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW */}
        {step === 'review' && currentService && currentCard && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-muted)]">Xizmat nomi:</span>
                <span className="font-semibold text-[var(--text-primary)]">{currentService.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-muted)]">Provayder:</span>
                <span className="font-medium text-blue-600 dark:text-cyan-300">{currentService.providerName}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-muted)]">Abonent raqami:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{accountNumber || currentService.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-muted)]">Toʻlov kartasi:</span>
                <span className="font-medium text-[var(--text-primary)]">{currentCard.nickname} (•••• {currentCard.lastFour})</span>
              </div>
              <div className="flex justify-between items-center text-base pt-1">
                <span className="text-[var(--text-secondary)] font-semibold">Toʻlov miqdori:</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(parseFloat(amount) || 0, currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-4 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-sm font-medium transition"
              >
                Orqaga
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95"
              >
                <Fingerprint className="w-5 h-5" />
                <span>Toʻlovni tasdiqlash</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS RECEIPT */}
        {step === 'success' && receiptData && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-xl space-y-4 font-mono text-xs">
              <div className="text-center border-b border-dashed border-[var(--border-strong)] pb-3">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle className="w-5 h-5 text-emerald-600 inline" />
                  <span className="font-black text-sm tracking-wider text-[var(--text-primary)]">BARAKA FINTECH</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">Elektron Toʻlov Cheki (Demo)</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Chek raqami: #{receiptData.receiptId}</p>
              </div>

              <div className="space-y-2 py-1">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Xizmat:</span>
                  <span className="font-bold text-[var(--text-primary)]">{receiptData.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Abonent:</span>
                  <span className="font-bold text-[var(--text-primary)]">{receiptData.account}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Toʻlov kartasi:</span>
                  <span className="text-[var(--text-secondary)]">•••• {receiptData.cardLastFour}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Sana va vaqt:</span>
                  <span className="text-[var(--text-secondary)]">{receiptData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Holat:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">MUVAFFAQIYATLI</span>
                </div>
              </div>

              <div className="border-t border-dashed border-[var(--border-strong)] pt-3 flex justify-between items-center text-sm font-bold">
                <span className="text-[var(--text-primary)]">JAMI TOʻLANDI:</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400 font-black">
                  {formatCurrency(receiptData.amount, currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-xs font-semibold border border-[var(--border)] transition"
              >
                <Printer className="w-4 h-4" />
                <span>Chop etish</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition"
              >
                Yopish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
