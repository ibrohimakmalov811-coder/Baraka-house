import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatDate, CATEGORY_DETAILS } from '../../utils/formatters';
import { BankCardVisual } from '../../components/cards/BankCardVisual';
import { EmptyState } from '../../components/common/EmptyState';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Receipt,
  Repeat,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const {
    getTotalIncome,
    getTotalExpenses,
    getNetCashFlow,
    getTotalGoalSavings,
    getAvailableBalance,
    currency,
    transactions,
    cards,
    selectedCardId,
    setSelectedCardId,
    services,
    subscriptions,
    goals,
    members,
    currentUser,
    openQuickAction,
    setIsMobileKeypadOpen,
    setActiveTab,
    isDarkMode,
  } = useFinanceStore();

  const [chartView, setChartView] = useState<'monthly' | 'weekly' | 'all'>('monthly');

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netCashFlow = getNetCashFlow();
  const totalGoalSavings = getTotalGoalSavings();
  const availableBalance = getAvailableBalance();

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  // Dynamic bar chart data: uses actual transactions across the months of the year
  const monthLabels = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const barChartData = monthLabels.map((name, i) => {
    const monthNum = String(i + 1).padStart(2, '0');
    const monthKey = `2026-${monthNum}`;
    const exp = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0);
    const inc = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name,
      debit: Math.round((exp / 1000000) * 10) / 10,
      credit: Math.round((inc / 1000000) * 10) / 10,
    };
  });

  // Usage statistics donut data
  const usagePieData = cards.length > 0
    ? cards.map((c, i) => ({
        name: c.nickname,
        value: c.balance > 0 ? c.balance : 1,
        color: ['#00D2FF', '#2563EB', '#F59E0B', '#10B981', '#8B5CF6'][i % 5],
      }))
    : [{ name: 'Karta yoʻq', value: 1, color: '#334155' }];

  const isBrandNewAccount = cards.length === 0 && transactions.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Personalized Welcome Banner if brand new */}
      {isBrandNewAccount && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/60 dark:via-slate-900 dark:to-cyan-950/60 border border-blue-200 dark:border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)]">
              Xush kelibsiz, {currentUser?.displayName || currentUser?.fullName || 'Foydalanuvchi'}! 👋
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl leading-relaxed">
              Sizning yangi shaxsiy hisobingiz muvaffaqiyatli ochildi. Hozircha barcha balanslar 0 soʻm. Boshlash uchun birinchi bank kartangizni yoki kirim amaliyotini qoʻshing.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => openQuickAction('card')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition active:scale-95"
            >
              + Karta qoʻshish
            </button>
            <button
              onClick={() => openQuickAction('income')}
              className="px-4 py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-semibold text-xs border border-[var(--border)] transition"
            >
              + Kirim kiritish
            </button>
          </div>
        </div>
      )}

      {/* 4 Major Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Mavjud Balans
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight font-mono">
              {formatCurrency(availableBalance, currency)}
            </h3>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> {cards.length} ta faol karta
            </p>
          </div>
        </div>

        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Jami Kirim (Oy)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
              +{formatCurrency(totalIncome, currency)}
            </h3>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
              Oylik maosh va daromadlar
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Jami Chiqim (Oy)
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
              -{formatCurrency(totalExpenses, currency)}
            </h3>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
              {netCashFlow >= 0 ? 'Foydali saldo saqlanmoqda' : 'Xarajatlar koʻp'}
            </p>
          </div>
        </div>

        {/* Total Savings */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Jamgʻarmalar
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-300 tracking-tight font-mono">
              {formatCurrency(totalGoalSavings, currency)}
            </h3>
            <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1 font-medium">
              {goals.length} ta maqsad boʻyicha
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE-ONLY: Cards Carousel & Shortcuts (Image 3) */}
      <div className="block lg:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Mening Kartalarim ({cards.length})
          </h2>
          <button
            onClick={() => setActiveTab('cards')}
            className="text-xs text-blue-600 dark:text-cyan-400 font-semibold"
          >
            Boshqarish
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-3">
            <CreditCard className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
            <p className="text-xs text-[var(--text-muted)]">Birorta ham toʻlov kartasi qoʻshilmagan</p>
            <button
              onClick={() => openQuickAction('card')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              + Birinchi kartani qoʻshish
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {cards.map((c) => (
              <div key={c.id} className="snap-start shrink-0 w-[290px]">
                <BankCardVisual
                  card={c}
                  isSelected={c.id === selectedCardId}
                  onClick={() => setSelectedCardId(c.id)}
                  compact={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openQuickAction('income')}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold text-xs transition"
          >
            <Plus className="w-4 h-4" /> Pul qoʻshish
          </button>
          <button
            onClick={() => setIsMobileKeypadOpen(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-cyan-300 font-bold text-xs transition"
          >
            <ArrowUpRight className="w-4 h-4" /> Oʻtkazish
          </button>
        </div>
      </div>

      {/* CENTER CHARTS ROW — Matching Reference Image 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debit & Credit History Double Bar Chart (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Debit & Credit Tarixi</h2>
              <p className="text-xs text-[var(--text-muted)]">Kirim va Chiqimlarning oylik taqqoslanishi</p>
            </div>

            <div className="flex items-center rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] p-0.5 text-xs font-semibold">
              <button
                onClick={() => setChartView('monthly')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartView === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartView === 'weekly' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartView('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartView === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} barGap={4}>
                <XAxis dataKey="name" stroke={isDarkMode ? '#94A3B8' : '#64748B'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDarkMode ? '#94A3B8' : '#64748B'} fontSize={11} tickLine={false} tickFormatter={(v) => `${v}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#E2E8F0',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F8FAFC' : '#0F172A',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} mln so'm`, '']}
                />
                <Bar dataKey="debit" name="Chiqim (Debit)" fill="#00D2FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="credit" name="Kirim (Credit)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#00D2FF]" />
              <span className="text-[var(--text-secondary)] font-medium">Debit (Chiqimlar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#2563EB]" />
              <span className="text-[var(--text-secondary)] font-medium">Credit (Kirimlar)</span>
            </div>
          </div>
        </div>

        {/* Usage Statistics Donut Chart (1 column) Matching Image 4 */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Kartalar Boʻyicha Taqsimot</h2>
            <p className="text-xs text-[var(--text-muted)]">Toʻlov vositalari balansi</p>
          </div>

          <div className="relative h-48 my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={usagePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {usagePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#E2E8F0',
                    borderRadius: '10px',
                    color: isDarkMode ? '#F8FAFC' : '#0F172A',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [formatCurrency(val, currency), '']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-[var(--text-primary)]">{cards.length}</span>
              <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase tracking-wider">Karta</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-around text-xs text-[var(--text-secondary)] border-t border-[var(--border)] pt-3 gap-2">
            {cards.length === 0 ? (
              <span className="text-[var(--text-muted)] text-xs">Kartalar qoʻshilmagan</span>
            ) : (
              usagePieData.slice(0, 3).map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[80px]">{item.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Goals & Upcoming Utility Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Goals Progress */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Oilaviy Jamgʻarmalar</h2>
              <p className="text-xs text-[var(--text-muted)]">Maqsadlar sari erishish dinamikasi</p>
            </div>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              Barchasi
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="py-8 text-center text-[var(--text-muted)] text-xs space-y-2">
              <p>Hozircha jamgʻarma maqsadlari yoʻq</p>
              <button
                onClick={() => openQuickAction('goal')}
                className="text-blue-600 dark:text-cyan-400 hover:underline font-bold"
              >
                + Yangi maqsad yaratish
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 3).map((g) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id} className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[var(--text-primary)]">{g.title}</span>
                      <span className="text-blue-600 dark:text-cyan-400 font-mono font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
                      <span>Yigʻildi: {formatCurrency(g.currentAmount, currency)}</span>
                      <span>Maqsad: {formatCurrency(g.targetAmount, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Payments & Subscriptions */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Yaqinlashayotgan Toʻlovlar</h2>
              <p className="text-xs text-[var(--text-muted)]">Kommunal va servis toʻlovlari muddati</p>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              Toʻlash
            </button>
          </div>

          {services.length === 0 ? (
            <div className="py-8 text-center text-[var(--text-muted)] text-xs space-y-2">
              <p>Kommunal xizmatlar ulanmagan</p>
              <button
                onClick={() => openQuickAction('service')}
                className="text-blue-600 dark:text-cyan-400 hover:underline font-bold"
              >
                + Xizmat ulash
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {services.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveTab('payments')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] cursor-pointer transition border border-[var(--border)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{s.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{s.providerName} • Muddat: {s.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {formatCurrency(s.amountDue, currency)}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 font-semibold">
                      {s.status === 'paid' ? "To'langan" : "To'lov kutilmoqda"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
