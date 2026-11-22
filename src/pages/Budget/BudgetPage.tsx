import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Budget, TransactionCategory } from '../../types';
import { formatCurrency, CATEGORY_DETAILS } from '../../utils/formatters';
import { EmptyState } from '../../components/common/EmptyState';
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
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
    { name: 'Xarajat qilindi', value: totalSpent > 0 ? totalSpent : 1, color: '#3B82F6' },
    { name: 'Qolgan limit', value: Math.max(0, totalPlanned - totalSpent), color: '#10B981' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Aqlli Byudjet va Cheklovlar</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
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

      {budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="Byudjet rejalari mavjud emas"
          description="Oylik xarajatlar toifalari boʻyicha limitlar belgilang va ortiqcha xarajatlarning oldini oling."
          actionText="Birinchi Byudjetni Yaratish"
          onAction={() => {
            setEditingBudget(null);
            setLimitAmount('');
            setIsAddOpen(true);
          }}
        />
      ) : (
        <>
          {/* Overview Donut & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
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
                        backgroundColor: 'var(--surface-elevated)',
                        color: 'var(--text-primary)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        fontSize: '11px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                      formatter={(val: any) => [formatCurrency(val, currency), '']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[var(--text-primary)]">{overallPercentage}%</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Sarflangan</span>
                </div>
              </div>

              <div className="text-xs text-[var(--text-secondary)] mt-2 font-mono">
                <span className="font-bold text-[var(--text-primary)]">{formatCurrency(totalSpent, currency)}</span>
                <span className="text-[var(--text-muted)]"> / {formatCurrency(totalPlanned, currency)}</span>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg flex flex-col justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Rejalashtirilgan Jami Limit</span>
                <h3 className="text-2xl font-black text-[var(--text-primary)] mt-2">
                  {formatCurrency(totalPlanned, currency)}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-3">
                  {budgets.length} ta kategoriya boʻyicha oylik chegara
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg flex flex-col justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Qolgan Erkin Byudjet</span>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatCurrency(Math.max(0, totalPlanned - totalSpent), currency)}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-3">
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
                  className={`p-5 rounded-2xl bg-[var(--surface)] border transition-all duration-300 space-y-3 shadow-lg ${
                    item.isExceeded
                      ? 'border-rose-500/50 bg-rose-500/5'
                      : item.isWarning
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: detail?.color || '#3B82F6' }}
                      />
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
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
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-cyan-500 hover:bg-[var(--surface-hover)]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBudget(item.id)}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--surface-hover)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-muted)]">
                        Sarflangan: <strong className="text-[var(--text-primary)]">{formatCurrency(item.spent, currency)}</strong>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          item.isExceeded
                            ? 'text-rose-500'
                            : item.isWarning
                            ? 'text-amber-500'
                            : 'text-cyan-600 dark:text-cyan-400'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-[var(--background-secondary)] rounded-full h-2.5 overflow-hidden border border-[var(--border)]">
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

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">
                      Limit: <strong className="text-[var(--text-secondary)]">{formatCurrency(item.limitAmount, currency)}</strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        item.isExceeded ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
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
        </>
      )}

      {/* Add / Edit Budget Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingBudget ? 'Byudjet limitini tahrirlash' : 'Yangi Byudjet Qoʻshish'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Xarajat toifasi
                </label>
                <select
                  disabled={!!editingBudget}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm disabled:opacity-50"
                >
                  {Object.entries(CATEGORY_DETAILS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.labelUz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Oylik limit summasi (soʻm)
                </label>
                <input
                  type="number"
                  required
                  placeholder="2 000 000"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm font-semibold"
                />
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  {editingBudget ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
