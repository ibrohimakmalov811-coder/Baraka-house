import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BankCardVisual } from '../cards/BankCardVisual';
import { CardControlsModal } from '../modals/CardControlsModal';
import {
  CreditCard,
  Send,
  Plus,
  Users,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const RightWalletPanel: React.FC = () => {
  const {
    cards,
    selectedCardId,
    setSelectedCardId,
    members,
    transactions,
    currency,
    openQuickAction,
    setIsMobileKeypadOpen,
    setActiveTab,
  } = useFinanceStore();

  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  // Recent 5 transactions
  const recentTxs = transactions.slice(0, 5);

  return (
    <aside className="w-80 shrink-0 h-screen sticky top-0 flex flex-col p-5 bg-[var(--sidebar-background)] border-l border-[var(--border)] overflow-y-auto space-y-5 select-none">
      {/* Wallet Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Hamyon va Kartalar</h2>
          <p className="text-xs text-[var(--text-muted)]">Tezkor moliyaviy panel</p>
        </div>
        <button
          onClick={() => openQuickAction('card')}
          className="p-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] text-blue-600 dark:text-cyan-400 border border-[var(--border)] transition"
          title="Yangi karta qo'shish"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Card Visual */}
      {selectedCard ? (
        <div className="space-y-2">
          <BankCardVisual
            card={selectedCard}
            onClick={() => setIsControlsOpen(true)}
            className="cursor-pointer"
          />

          <div className="flex items-center justify-between text-xs px-1 text-[var(--text-muted)]">
            <button
              onClick={() => setIsControlsOpen(true)}
              className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Karta nazorati</span>
            </button>

            {/* Other card selectors */}
            <div className="flex items-center gap-1.5">
              {cards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCardId(c.id)}
                  title={c.nickname}
                  className={`w-3 h-3 rounded-full transition-all ${
                    c.id === selectedCard.id
                      ? 'bg-blue-600 dark:bg-cyan-400 scale-125'
                      : 'bg-[var(--border-strong)] hover:bg-[var(--text-muted)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] text-center">
          <CreditCard className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2" />
          <p className="text-sm text-[var(--text-muted)]">Karta mavjud emas</p>
          <button
            onClick={() => openQuickAction('card')}
            className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
          >
            + Karta qoʻshish
          </button>
        </div>
      )}

      {/* Quick Family Transfer Shortcuts */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> Oila aʼzolariga oʻtkazma
          </span>
          <button
            onClick={() => setActiveTab('family')}
            className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline"
          >
            Barchasi
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setIsMobileKeypadOpen(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] min-w-[62px] transition group"
            >
              <img
                src={m.avatar}
                alt={m.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-500 dark:group-hover:ring-cyan-400 transition"
              />
              <span className="text-[11px] text-[var(--text-primary)] font-medium truncate max-w-[55px]">
                {m.name.split(' ')[0]}
              </span>
            </button>
          ))}
          <button
            onClick={() => setIsMobileKeypadOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-cyan-950/40 hover:bg-blue-100 dark:hover:bg-cyan-900/50 border border-blue-200 dark:border-cyan-500/20 min-w-[62px] h-[68px] text-blue-600 dark:text-cyan-300 transition"
          >
            <Send className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-bold">Oʻtkazish</span>
          </button>
        </div>
      </div>

      {/* Recent Activity / Invoices (Matching Image 4 Right Column) */}
      <div className="flex-1 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> Soʻnggi amaliyotlar
          </span>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline"
          >
            Tarix
          </button>
        </div>

        <div className="space-y-2">
          {recentTxs.map((tx) => {
            const member = members.find((m) => m.id === tx.memberId);
            return (
              <div
                key={tx.id}
                onClick={() => setActiveTab('transactions')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] cursor-pointer transition border border-[var(--border)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[130px]">
                      {tx.title}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <span>{formatDate(tx.date)}</span>
                      {member && <span>• {member.name.split(' ')[0]}</span>}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CardControlsModal
        card={selectedCard}
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />
    </aside>
  );
};
