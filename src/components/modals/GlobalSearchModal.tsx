import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, X, ArrowRight, CreditCard, Calendar, Repeat, Target, Users, Receipt } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const {
    transactions,
    services,
    subscriptions,
    goals,
    members,
    cards,
    setActiveTab,
    currency,
  } = useFinanceStore();

  const filteredResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const matchedTxs = transactions
      .filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedServices = services.filter(
      (s) => s.name.toLowerCase().includes(q) || s.providerName.toLowerCase().includes(q)
    );

    const matchedSubs = subscriptions.filter(
      (s) => s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q)
    );

    const matchedGoals = goals.filter((g) => g.title.toLowerCase().includes(q));

    const matchedMembers = members.filter((m) => m.name.toLowerCase().includes(q));

    return {
      transactions: matchedTxs,
      services: matchedServices,
      subscriptions: matchedSubs,
      goals: matchedGoals,
      members: matchedMembers,
    };
  }, [query, transactions, services, subscriptions, goals, members]);

  if (!isOpen) return null;

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--input-background)]">
          <Search className="w-5 h-5 text-blue-500 dark:text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidiruv: amaliyotlar, kommunal, obunalar, maqsadlar, oila aʼzolari..."
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--input-placeholder)] text-base focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="text-center py-10 text-[var(--text-muted)] text-sm">
              <p>Qidirmoqchi boʻlgan soʻzingizni yozing...</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
                {['Elektr', 'Oziq-ovqat', 'Netflix', 'Kottej', 'Jasur', 'Maosh'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredResults && (
            <>
              {/* Transactions */}
              {filteredResults.transactions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" /> Amaliyotlar ({filteredResults.transactions.length})
                    </span>
                    <button onClick={() => navigateTo('transactions')} className="text-blue-600 dark:text-cyan-400 hover:underline">
                      Barchasi
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => navigateTo('transactions')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] cursor-pointer transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{tx.title}</p>
                          <p className="text-xs text-[var(--text-muted)]">{formatDate(tx.date)}</p>
                        </div>
                        <span
                          className={`font-semibold text-sm ${
                            tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {filteredResults.services.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" /> Kommunal toʻlovlar
                    </span>
                    <button onClick={() => navigateTo('payments')} className="text-blue-600 dark:text-cyan-400 hover:underline">
                      Oʻtish
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.services.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => navigateTo('payments')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] cursor-pointer transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{srv.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{srv.providerName} • {srv.accountNumber}</p>
                        </div>
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                          {formatCurrency(srv.amountDue, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscriptions */}
              {filteredResults.subscriptions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-purple-500" /> Obunalar
                    </span>
                    <button onClick={() => navigateTo('subscriptions')} className="text-blue-600 dark:text-cyan-400 hover:underline">
                      Oʻtish
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => navigateTo('subscriptions')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] cursor-pointer transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{sub.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{sub.provider}</p>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] font-semibold">
                          {formatCurrency(sub.amount, currency)} / oy
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {filteredResults.goals.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-500" /> Jamgʻarma maqsadlari
                    </span>
                    <button onClick={() => navigateTo('goals')} className="text-blue-600 dark:text-cyan-400 hover:underline">
                      Oʻtish
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.goals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => navigateTo('goals')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] cursor-pointer transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{g.title}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {formatCurrency(g.currentAmount, currency)} / {formatCurrency(g.targetAmount, currency)}
                          </p>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-cyan-400 font-bold">
                          {Math.round((g.currentAmount / g.targetAmount) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Family members */}
              {filteredResults.members.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-pink-500" /> Oila aʼzolari
                    </span>
                    <button onClick={() => navigateTo('family')} className="text-blue-600 dark:text-cyan-400 hover:underline">
                      Oʻtish
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.members.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => navigateTo('family')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{m.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{m.roleTitle}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
