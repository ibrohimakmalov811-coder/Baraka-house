import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatDate, CATEGORY_DETAILS } from '../../utils/formatters';
import { BankCardVisual } from '../../components/cards/BankCardVisual';
import {
  TrendingUp,
  TrendingDown,
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
  Legend,
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
    openQuickAction,
    setIsMobileKeypadOpen,
    setActiveTab,
  } = useFinanceStore();

  const [chartView, setChartView] = useState<'monthly' | 'weekly' | 'all'>('monthly');

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netCashFlow = getNetCashFlow();
  const totalGoalSavings = getTotalGoalSavings();
  const availableBalance = getAvailableBalance();

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  // Debit & Credit double-bar chart data matching Image 4
  const barChartData = [
    { name: 'Jan', debit: 28, credit: 38 },
    { name: 'Feb', debit: 32, credit: 42 },
    { name: 'Mar', debit: 25, credit: 36 },
    { name: 'Apr', debit: 30, credit: 45 },
    { name: 'May', debit: 28, credit: 39 },
    { name: 'Jun', debit: 35, credit: 48 },
    { name: 'Jul', debit: 32, credit: 44 },
    { name: 'Aug', debit: 29, credit: 40 },
    { name: 'Sep', debit: 34, credit: 46 },
    { name: 'Oct', debit: 31, credit: 49 },
    { name: 'Nov', debit: Math.round(totalExpenses / 1000000) || 12, credit: Math.round(totalIncome / 1000000) || 35 },
    { name: 'Dec', debit: 27, credit: 41 },
  ];

  // Usage statistics donut data matching Image 4
  const usagePieData = [
    { name: 'Uzcard', value: 35, color: '#F59E0B' },
    { name: 'Humo', value: 40, color: '#00D2FF' },
    { name: 'Visa', value: 25, color: '#3B82F6' },
  ];

  // Category spending breakdown
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const categoryPieData = Object.entries(categoryTotals)
    .slice(0, 5)
    .map(([cat, val]) => ({
      name: CATEGORY_DETAILS[cat as keyof typeof CATEGORY_DETAILS]?.labelUz || cat,
      value: val,
      color: CATEGORY_DETAILS[cat as keyof typeof CATEGORY_DETAILS]?.color || '#94A3B8',
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 4 Major Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-baraka-card border border-white/10 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mavjud Balans
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(availableBalance, currency)}
            </h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Faol kartalardagi mablagʻ
            </p>
          </div>
        </div>

        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-baraka-card border border-white/10 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Jami Kirim (Oy)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
              +{formatCurrency(totalIncome, currency)}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              Oylik maosh va biznes tushumlari
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-baraka-card border border-white/10 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Jami Chiqim (Oy)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-400 tracking-tight">
              -{formatCurrency(totalExpenses, currency)}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              {netCashFlow >= 0 ? 'Foydali saldo saqlanmoqda' : 'Xarajatlar koʻp'}
            </p>
          </div>
        </div>

        {/* Total Savings */}
        <div className="p-5 rounded-2xl bg-baraka-card border border-white/10 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Jamgʻarmalar
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-purple-300 tracking-tight">
              {formatCurrency(totalGoalSavings, currency)}
            </h3>
            <p className="text-xs text-purple-400 flex items-center gap-1 mt-1 font-medium">
              {goals.length} ta oilaviy maqsadlar uchun
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE-ONLY: Cards Carousel & Shortcuts (Image 3) */}
      <div className="block lg:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Mening Kartalarim ({cards.length})
          </h2>
          <button
            onClick={() => setActiveTab('cards')}
            className="text-xs text-cyan-400 font-semibold"
          >
            Boshqarish
          </button>
        </div>

        {/* Horizontal scroll cards */}
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

        {/* Quick Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openQuickAction('income')}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs"
          >
            <Plus className="w-4 h-4" /> Pul qoʻshish
          </button>
          <button
            onClick={() => setIsMobileKeypadOpen(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs"
          >
            <ArrowUpRight className="w-4 h-4" /> Oʻtkazish
          </button>
        </div>
      </div>

      {/* CENTER CHARTS ROW — Matching Reference Image 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debit & Credit History Double Bar Chart (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Debit & Credit Tarixi</h2>
              <p className="text-xs text-slate-400">Kirim va Chiqimlarning oylik taqqoslanishi</p>
            </div>

            {/* Monthly / Weekly / All Time switcher */}
            <div className="flex items-center rounded-xl bg-slate-900 border border-white/10 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setChartView('monthly')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartView === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartView === 'weekly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartView('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartView === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} barGap={4}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#FFF',
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
              <span className="text-slate-300">Debit (Chiqimlar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#2563EB]" />
              <span className="text-slate-300">Credit (Kirimlar)</span>
            </div>
          </div>
        </div>

        {/* Usage Statistics Donut Chart (1 column) Matching Image 4 */}
        <div className="p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Kartalar Boʻyicha Taqsimot</h2>
            <p className="text-xs text-slate-400">Toʻlov vositalari faolligi</p>
          </div>

          {/* Donut Chart with center % badge */}
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
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val}%`, '']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>

            {/* Donut Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">40%</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Humo</span>
            </div>
          </div>

          <div className="flex justify-around text-xs text-slate-300 border-t border-white/10 pt-3">
            {usagePieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Goals & Upcoming Utility Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Goals Progress */}
        <div className="p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Oilaviy Jamgʻarmalar</h2>
              <p className="text-xs text-slate-400">Maqsadlar sari erishish dinamikasi</p>
            </div>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              Barchasini koʻrish
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              return (
                <div key={g.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{g.title}</span>
                    <span className="text-cyan-400 font-mono font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Yigʻildi: {formatCurrency(g.currentAmount, currency)}</span>
                    <span>Maqsad: {formatCurrency(g.targetAmount, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Payments & Subscriptions */}
        <div className="p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Yaqinlashayotgan Toʻlovlar</h2>
              <p className="text-xs text-slate-400">Kommunal va servis toʻlovlari muddati</p>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              Toʻlash
            </button>
          </div>

          <div className="space-y-2.5">
            {services.slice(0, 4).map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveTab('payments')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.providerName} • Muddat: {s.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-amber-400">
                    {formatCurrency(s.amountDue, currency)}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold">
                    {s.status === 'paid' ? "To'langan" : "To'lov kutilmoqda"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
