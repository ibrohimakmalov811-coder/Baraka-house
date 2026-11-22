import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Subscription } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  X,
  Video,
  Tv,
  Music,
  Cloud,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SubscriptionsPage: React.FC = () => {
  const {
    subscriptions,
    cards,
    renewSubscriptionDemo,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    currency,
  } = useFinanceStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [cardId, setCardId] = useState(cards[0]?.id || '');
  const [nextDate, setNextDate] = useState('2026-12-01');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const totalMonthlySpend = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      const monthlyAmount = s.billingCycle === 'yearly' ? s.amount / 12 : s.amount;
      return sum + monthlyAmount;
    }, 0);

  const handleRenew = async (sub: Subscription) => {
    const tx = await renewSubscriptionDemo(sub.id);
    if (tx) {
      confetti({ particleCount: 40, spread: 60 });
      setStatusNotice(`"${sub.name}" obunasi toʻlovi qayd etildi va xarajatlarga qoʻshildi.`);
    } else {
      setStatusNotice(`"${sub.name}" uchun ushbu oyda toʻlov allaqachon amalga oshirilgan.`);
    }
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleToggleStatus = async (sub: Subscription) => {
    const nextStatus = sub.status === 'active' ? 'paused' : 'active';
    await updateSubscription(sub.id, { status: nextStatus });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/\s/g, ''));
    if (!num || num <= 0) return;

    await addSubscription({
      name: subName,
      provider: provider || 'Online Servis',
      icon: 'Repeat',
      amount: num,
      billingCycle,
      nextBillingDate: nextDate,
      cardId: cardId || cards[0]?.id || '',
      status: 'active',
      category: 'entertainment',
    });

    setIsAddOpen(false);
    setSubName('');
    setAmount('');
  };

  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('youtube')) return Video;
    if (lower.includes('netflix') || lower.includes('tv')) return Tv;
    if (lower.includes('spotify') || lower.includes('music')) return Music;
    if (lower.includes('cloud') || lower.includes('apple')) return Cloud;
    return Sparkles;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Muntazam Obunalar va Xizmatlar</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Oylik obunalar nazorati: <strong className="text-[var(--text-primary)] font-mono">{formatCurrency(totalMonthlySpend, currency)} / oy</strong>
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Obuna Qoʻshish</span>
        </button>
      </div>

      {statusNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subscriptions.map((sub) => {
          const IconComponent = getServiceIcon(sub.name);
          const card = cards.find((c) => c.id === sub.cardId);
          const isActive = sub.status === 'active';

          return (
            <div
              key={sub.id}
              className={`p-5 rounded-2xl bg-[var(--surface)] border transition-all duration-300 flex flex-col justify-between shadow-lg space-y-4 ${
                isActive ? 'border-[var(--border)] hover:border-cyan-500/30' : 'border-[var(--border)] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-base leading-snug">{sub.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{sub.provider}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isActive ? 'Faol' : 'Toʻxtatilgan'}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[var(--input-background)] border border-[var(--border)] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Keyingi toʻlov sanasi:</span>
                    <span className="text-[var(--text-primary)] font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                      {sub.nextBillingDate}
                    </span>
                  </div>

                  {card && (
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Toʻlov kartasi:</span>
                      <span className="text-[var(--text-secondary)] font-mono text-[11px]">
                        {card.nickname} (•••• {card.lastFour})
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Davriylik:</span>
                    <span className="text-[var(--text-secondary)] capitalize">{sub.billingCycle === 'monthly' ? 'Har oy' : 'Yillik'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Tarif narxi</p>
                  <p className="font-mono text-base font-black text-[var(--text-primary)]">
                    {formatCurrency(sub.amount, currency)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(sub)}
                    className="p-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                    title={isActive ? "To'xtatish" : "Faollashtirish"}
                  >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500" />}
                  </button>

                  <button
                    onClick={() => handleRenew(sub)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 active:scale-95 transition"
                  >
                    Toʻlash (Demo)
                  </button>

                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--surface-hover)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Yangi Obuna Qoʻshish</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Xizmat nomi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: YouTube Premium"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Provayder / Kompaniya</label>
                  <input
                    type="text"
                    placeholder="Masalan: Google LLC"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Narxi (soʻm)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="50 000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Toʻlov davri
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                  >
                    <option value="monthly">Har oy</option>
                    <option value="yearly">Yillik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Keyingi toʻlov sanasi
                  </label>
                  <input
                    type="date"
                    required
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Toʻlov kartasi
                  </label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nickname} ({c.cardType.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] text-xs font-medium border border-[var(--border)]"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
