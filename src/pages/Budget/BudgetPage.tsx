import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Budget, TransactionCategory } from '../../types';
import { formatCurrency, CATEGORY_DETAILS } from '../../utils/formatters';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
  X,
  ShieldAlert,
} from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';

export const BudgetPage: React.FC = () => {
  const {
    budgets,
    getCategoryExpenseTotal,
    addBudget,
    updateBudget,
    deleteBudget,
    currency,
    selectedMonth,
  } = useFinanceStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('groceries');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Calculate totals
  let totalPlanned = 0;
  let totalSpent = 0;

  const budgetItemsWithMetrics = budgets.map((b) => {
    const spent = getCategoryExpenseTotal(b.category, selectedMonth);
    const remaining = Math.max(0, b.limitAmount - spent);
    const percentage = b.limitAmount > 0 ? Math.round((spent / b.limitAmount) * 100) : 0;
    const isExceeded = spent > b.limitAmount;
    const isWarning = percentage >= b.notifyThreshold && !isExceeded;

    totalPlanned += b.limitAmount;
    totalSpent += spent;

    return {
      ...b,
      spent,
      remaining,
      percentage,
      isExceeded,
      isWarning,
    };
  });

  const overallPercentage = totalPlanned > 0 ? Math.round((totalSpent / totalPlanned) * 100) : 0;

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(limitAmount.replace(/\s/g, ''));
    if (!num || num <= 0) return;

    if (editingBudget) {
      await updateBudget(editingBudget.id, {
        limitAmount: num,
      });
      setEditingBudget(null);
    } else {
      await addBudget({
        category: selectedCategory,
        month: selectedMonth || '2026-11',
        limitAmount: num,
        notifyThreshold: 80,
      });
      setIsAddOpen(false);
    }
    setLimitAmount('');
  };

  const donutData = [
    { name: 'Xarajat qilindi', value: totalSpent, color: '#3B82F6' },
    { name: 'Qolgan limit', value: Math.max(0, totalPlanned - totalSpent), color: '#10B981' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Aqlli Byudjet va Cheklovlar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Xarajatlarni rejalashtirish va oilaviy limitlarni avtomatik nazorat qilish
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setLimitAmount('');
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Byudjet Qoʻshish</span>
        </button>
      </div>

      {/* Overview Donut & Summary (Matching Image 3 Spendings Limit) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spending Ring Donut matching mobile image 3 */}
        <div className="p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Oylik Xarajat Nazorati
          </p>

          <div className="relative w-44 h-44 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    borderColor: 'rgba(255,255,255,0.1)',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [formatCurrency(val, currency), '']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{overallPercentage}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Sarflangan</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 mt-2 font-mono">
            <span className="font-bold text-white">{formatCurrency(totalSpent, currency)}</span>
            <span className="text-slate-400"> / {formatCurrency(totalPlanned, currency)}</span>
          </div>
        </div>

        {/* 2 Summary KPI Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-baraka-card border border-white/10 shadow-lg flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Rejalashtirilgan Jami Limit</span>
            <h3 className="text-2xl font-black text-white mt-2">
              {formatCurrency(totalPlanned, currency)}
            </h3>
            <p className="text-xs text-slate-400 mt-3">
              {budgets.length} ta kategoriya boʻyicha oylik chegara
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-baraka-card border border-white/10 shadow-lg flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Qolgan Erkin Byudjet</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-2">
              {formatCurrency(Math.max(0, totalPlanned - totalSpent), currency)}
            </h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Rejadan chiqilmagan
            </p>
          </div>
        </div>
      </div>

      {/* Budget Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetItemsWithMetrics.map((item) => {
          const detail = CATEGORY_DETAILS[item.category];

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-baraka-card border transition-all duration-300 space-y-3 shadow-lg ${
                item.isExceeded
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : item.isWarning
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: detail?.color || '#3B82F6' }}
                  />
                  <h3 className="text-sm font-bold text-white">
                    {detail?.labelUz || item.category}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingBudget(item);
                      setLimitAmount(item.limitAmount.toString());
                      setIsAddOpen(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/10"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteBudget(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Sarflangan: <strong className="text-white">{formatCurrency(item.spent, currency)}</strong>
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      item.isExceeded
                        ? 'text-rose-400'
                        : item.isWarning
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      item.isExceeded
                        ? 'bg-rose-500'
                        : item.isWarning
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Status and Remaining */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <span className="text-slate-400">
                  Limit: <strong className="text-slate-200">{formatCurrency(item.limitAmount, currency)}</strong>
                </span>
                <span
                  className={`font-semibold ${
                    item.isExceeded ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {item.isExceeded
                    ? `Limitdan oshdi (+${formatCurrency(item.spent - item.limitAmount, currency)})`
                    : `Qoldi: ${formatCurrency(item.remaining, currency)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Budget Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-baraka-card rounded-2xl border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingBudget ? 'Byudjet limitini tahrirlash' : 'Yangi Byudjet Qoʻshish'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {!editingBudget && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Kategoriya</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  >
                    {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.labelUz}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Oylik limit miqdori (soʻm)
                </label>
                <input
                  type="number"
                  required
                  placeholder="3 000 000"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/10 text-xs font-medium"
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
