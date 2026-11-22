import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { PaymentCard } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { BankCardVisual } from '../cards/BankCardVisual';
import { X, Lock, Unlock, Globe, Banknote, ShieldCheck, KeyRound, PlusCircle, MinusCircle } from 'lucide-react';

interface CardControlsModalProps {
  card: PaymentCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CardControlsModal: React.FC<CardControlsModalProps> = ({ card, isOpen, onClose }) => {
  const {
    toggleCardLock,
    toggleOnlinePayments,
    toggleCashTransactions,
    updateCard,
    currency,
  } = useFinanceStore();

  const [fundsAmount, setFundsAmount] = useState('');
  const [showFundsInput, setShowFundsInput] = useState<'add' | 'withdraw' | null>(null);
  const [pinNotice, setPinNotice] = useState(false);

  if (!isOpen || !card) return null;

  const handleFundsSubmit = async () => {
    const num = parseFloat(fundsAmount);
    if (!num || num <= 0) return;

    const newBalance =
      showFundsInput === 'add'
        ? card.balance + num
        : Math.max(0, card.balance - num);

    await updateCard(card.id, { balance: newBalance });
    setFundsAmount('');
    setShowFundsInput(null);
  };

  const handleResetPin = () => {
    setPinNotice(true);
    setTimeout(() => setPinNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-baraka-card border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h2 className="text-base font-bold text-white">Karta sozlamalari va nazorati</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card preview */}
        <div className="mb-5">
          <BankCardVisual card={card} />
        </div>

        {/* Controls list matching reference Image 3 */}
        <div className="space-y-3">
          {/* Lock Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                {card.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Kartani bloklash</p>
                <p className="text-xs text-slate-400">
                  {card.isLocked ? 'Karta vaqtincha muzlatilgan' : 'Barcha amaliyotlar faol'}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleCardLock(card.id)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                card.isLocked ? 'bg-red-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Online Payments */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Internet toʻlovlari</p>
                <p className="text-xs text-slate-400">Onlayn xaridlar va obunalar uchun ruxsat</p>
              </div>
            </div>
            <button
              onClick={() => toggleOnlinePayments(card.id)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                card.onlinePayments ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Cash Transactions */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Bankomatdan naqd pul yechish</p>
                <p className="text-xs text-slate-400">Bankomat orqali operatsiyalarga ruxsat</p>
              </div>
            </div>
            <button
              onClick={() => toggleCashTransactions(card.id)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                card.cashTransactions ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Reset PIN Demo */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">PIN kodni yangilash</p>
                <p className="text-xs text-slate-400">SMS-kod orqali xavfsiz yangilash</p>
              </div>
            </div>
            <button
              onClick={handleResetPin}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition"
            >
              Oʻzgartirish
            </button>
          </div>

          {pinNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Karta PIN kodi muvaffaqiyatli tiklandi va SMS yuborildi.</span>
            </div>
          )}

          {/* Quick Balance Add/Withdraw */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Balansni toʻldirish / yechish:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFundsInput('add')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-medium"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Toʻldirish
                </button>
                <button
                  onClick={() => setShowFundsInput('withdraw')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-medium"
                >
                  <MinusCircle className="w-3.5 h-3.5" /> Yechish
                </button>
              </div>
            </div>

            {showFundsInput && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <input
                  type="number"
                  placeholder="Summa..."
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                />
                <button
                  onClick={handleFundsSubmit}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Bajarish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
