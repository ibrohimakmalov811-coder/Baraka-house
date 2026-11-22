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
      <div className="relative w-full max-w-2xl rounded-2xl bg-baraka-card border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-slate-900/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidiruv: amaliyotlar, kommunal, obunalar, maqsadlar, oila aʼzolari..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded bg-white/10 text-slate-300 hover:bg-white/20"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="text-center py-10 text-slate-400 text-sm">
              <p>Qidirmoqchi boʻlgan soʻzingizni yozing...</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
                {['Elektr', 'Oziq-ovqat', 'Netflix', 'Kottej', 'Jasur', 'Maosh'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
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
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-cyan-400" /> Amaliyotlar ({filteredResults.transactions.length})
                    </span>
                    <button onClick={() => navigateTo('transactions')} className="text-cyan-400 hover:underline">
                      Barchasi
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => navigateTo('transactions')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{tx.title}</p>
                          <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                        </div>
                        <span
                          className={`font-semibold text-sm ${
                            tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
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
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Kommunal toʻlovlar
                    </span>
                    <button onClick={() => navigateTo('payments')} className="text-cyan-400 hover:underline">
                      Oʻtish
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.services.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => navigateTo('payments')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{srv.name}</p>
                          <p className="text-xs text-slate-400">{srv.providerName} • {srv.accountNumber}</p>
                        </div>
                        <span className="text-xs text-amber-400 font-semibold">
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
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-purple-400" /> Obunalar
                    </span>
                    <button onClick={() => navigateTo('subscriptions')} className="text-cyan-400 hover:underline">
                      Oʻtish
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => navigateTo('subscriptions')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{sub.name}</p>
                          <p className="text-xs text-slate-400">{sub.provider}</p>
                        </div>
                        <span className="text-xs text-slate-300 font-semibold">
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
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" /> Jamgʻarma maqsadlari
                    </span>
                    <button onClick={() => navigateTo('goals')} className="text-cyan-400 hover:underline">
                      Oʻtish
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.goals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => navigateTo('goals')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{g.title}</p>
                          <p className="text-xs text-slate-400">
                            {formatCurrency(g.currentAmount, currency)} / {formatCurrency(g.targetAmount, currency)}
                          </p>
                        </div>
                        <span className="text-xs text-cyan-400 font-bold">
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
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-pink-400" /> Oila aʼzolari
                    </span>
                    <button onClick={() => navigateTo('family')} className="text-cyan-400 hover:underline">
                      Oʻtish
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredResults.members.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => navigateTo('family')}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-medium text-white">{m.name}</p>
                            <p className="text-xs text-slate-400">{m.roleTitle}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
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
