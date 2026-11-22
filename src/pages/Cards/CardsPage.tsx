import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { PaymentCard } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { BankCardVisual } from '../../components/cards/BankCardVisual';
import { CardControlsModal } from '../../components/modals/CardControlsModal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Plus,
  SlidersHorizontal,
  Trash2,
  CheckCircle,
  CreditCard,
  Globe,
  Banknote,
  ShieldAlert,
} from 'lucide-react';

export const CardsPage: React.FC = () => {
  const {
    cards,
    selectedCardId,
    setSelectedCardId,
    setDefaultCard,
    deleteCard,
    openQuickAction,
    currency,
  } = useFinanceStore();

  const [activeCardForControls, setActiveCardForControls] = useState<PaymentCard | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const totalCardsBalance = cards.reduce((sum, c) => sum + (c.isLocked ? 0 : c.balance), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Mening Kartalarim va Raqamli Hamyon</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Jami faol mablagʻ: <strong className="text-[var(--text-primary)] font-mono">{formatCurrency(totalCardsBalance, currency)}</strong>
          </p>
        </div>

        <button
          onClick={() => openQuickAction('card')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Karta Qoʻshish</span>
        </button>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Birorta ham toʻlov kartasi qoʻshilmagan"
          description="Raqamli hamyoningizga Uzcard, Humo, Visa yoki Mastercard kartalaringizni kiriting."
          actionText="Birinchi Kartani Qoʻshish"
          onAction={() => openQuickAction('card')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => {
            const isSelected = card.id === selectedCardId;

            return (
              <div
                key={card.id}
                className={`p-6 rounded-3xl bg-[var(--surface)] border transition-all duration-300 flex flex-col justify-between shadow-xl ${
                  isSelected
                    ? 'border-cyan-400 shadow-cyan-500/10'
                    : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                {/* Card Visualization */}
                <div className="mb-5">
                  <BankCardVisual
                    card={card}
                    isSelected={isSelected}
                    onClick={() => setSelectedCardId(card.id)}
                  />
                </div>

                {/* Status & Controls Bar */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          card.isLocked ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {card.isLocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <span title="Internet to'lovlari">
                        <Globe
                          className={`w-4 h-4 ${card.onlinePayments ? 'text-cyan-500' : 'text-[var(--text-muted)] opacity-40'}`}
                        />
                      </span>
                      <span title="Bankomat operatsiyalari">
                        <Banknote
                          className={`w-4 h-4 ${card.cashTransactions ? 'text-amber-500' : 'text-[var(--text-muted)] opacity-40'}`}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      {!card.isDefault && (
                        <button
                          onClick={() => setDefaultCard(card.id)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-secondary)] border border-[var(--border)] transition"
                        >
                          Asosiy qilish
                        </button>
                      )}
                      {card.isDefault && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5" /> Asosiy karta
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveCardForControls(card)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-cyan-300 text-xs font-semibold border border-blue-500/30 transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Boshqarish</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(card.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition"
                        title="Kartani o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Kartani oʻchirish</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Ushbu kartani roʻyxatdan oʻchirmoqchimisiz?
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] border border-[var(--border)]"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  await deleteCard(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-md shadow-rose-600/20"
              >
                Oʻchirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Controls Modal */}
      <CardControlsModal
        card={activeCardForControls}
        isOpen={!!activeCardForControls}
        onClose={() => setActiveCardForControls(null)}
      />
    </div>
  );
};
