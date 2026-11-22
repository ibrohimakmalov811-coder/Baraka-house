import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatDate, CATEGORY_DETAILS } from '../../utils/formatters';
import { Transaction, TransactionType, TransactionCategory } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  X,
  CreditCard,
  Receipt,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    members,
    cards,
    deleteTransaction,
    updateTransaction,
    openQuickAction,
    currency,
  } = useFinanceStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<TransactionCategory>('groceries');
  const [editMemberId, setEditMemberId] = useState('');

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchDesc) return false;
        }
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (memberFilter !== 'all' && t.memberId !== memberFilter) return false;
        if (methodFilter !== 'all' && t.paymentMethod !== methodFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, search, typeFilter, categoryFilter, memberFilter, methodFilter, sortBy]);

  const exportToCSV = () => {
    const headers = ['ID', 'Sana', 'Vaqt', 'Turi', 'Kategoriya', 'Nomi', 'Summa', 'Aʼzo', 'Toʻlov usuli', 'Izoh'];
    const rows = filteredTransactions.map((t) => {
      const member = members.find((m) => m.id === t.memberId)?.name || '';
      return [
        t.id,
        t.date,
        t.time || '',
        t.type,
        t.category,
        `"${t.title.replace(/"/g, '""')}"`,
        t.amount,
        `"${member}"`,
        t.paymentMethod,
        `"${(t.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BARAKA_Amaliyotlar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    setEditMemberId(tx.memberId);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const numAmount = parseFloat(editAmount);
    if (!numAmount || numAmount <= 0) return;

    await updateTransaction(editingTx.id, {
      title: editTitle,
      amount: numAmount,
      category: editCategory,
      memberId: editMemberId,
    });

    setEditingTx(null);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteTransaction(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Moliya Tarixi va Amaliyotlar</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Jami {filteredTransactions.length} ta operatsiya
          </p>
        </div>

        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>CSV Eksport</span>
            </button>
          )}

          <button
            onClick={() => openQuickAction('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Kirim</span>
          </button>

          <button
            onClick={() => openQuickAction('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Chiqim</span>
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Hozircha moliyaviy amaliyotlar yoʻq"
          description="Siz hali birorta ham daromad yoki xarajat kiritmadingiz. Birinchi amaliyotni qoʻshishdan boshlang."
          actionText="Kirim qoʻshish"
          onAction={() => openQuickAction('income')}
          secondaryActionText="Chiqim qoʻshish"
          onSecondaryAction={() => openQuickAction('expense')}
        />
      ) : (
        <>
          {/* Search & Multi-Filters Toolbar */}
          <div className="p-4 rounded-2xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-lg space-y-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--input-background)] border border-[var(--border)]">
              <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Amaliyot nomi yoki tavsif boʻyicha qidirish..."
                className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--input-placeholder)] focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-[var(--surface-hover)] p-1 rounded-xl border border-[var(--border)]">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    typeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setTypeFilter('income')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    typeFilter === 'income' ? 'bg-emerald-600 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Kirim
                </button>
                <button
                  onClick={() => setTypeFilter('expense')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    typeFilter === 'expense' ? 'bg-rose-600 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Chiqim
                </button>
                <button
                  onClick={() => setTypeFilter('transfer')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    typeFilter === 'transfer' ? 'bg-purple-600 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Oʻtkazma
                </button>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[var(--surface)] text-[var(--text-primary)]">Barcha kategoriyalar</option>
                {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                  <option key={key} value={key} className="bg-[var(--surface)] text-[var(--text-primary)]">
                    {item.labelUz}
                  </option>
                ))}
              </select>

              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[var(--surface)] text-[var(--text-primary)]">Barcha aʼzolar</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[var(--surface)] text-[var(--text-primary)]">
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="ml-auto px-3 py-1.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-blue-600 dark:text-cyan-400 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="date_desc" className="bg-[var(--surface)] text-[var(--text-primary)]">Eng soʻnggi sana</option>
                <option value="date_asc" className="bg-[var(--surface)] text-[var(--text-primary)]">Eng avvalgi sana</option>
                <option value="amount_desc" className="bg-[var(--surface)] text-[var(--text-primary)]">Katta summa</option>
                <option value="amount_asc" className="bg-[var(--surface)] text-[var(--text-primary)]">Kichik summa</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--table-header)] border-b border-[var(--border)] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Amaliyot / Tavsif</th>
                    <th className="py-3.5 px-4">Kategoriya</th>
                    <th className="py-3.5 px-4">Oila Aʼzosi</th>
                    <th className="py-3.5 px-4">Toʻlov usuli</th>
                    <th className="py-3.5 px-4">Sana va Vaqt</th>
                    <th className="py-3.5 px-4 text-right">Summa</th>
                    <th className="py-3.5 px-4 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredTransactions.map((tx) => {
                    const member = members.find((m) => m.id === tx.memberId);
                    const card = cards.find((c) => c.id === tx.cardId);
                    const catDetail = CATEGORY_DETAILS[tx.category];

                    return (
                      <tr key={tx.id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                tx.type === 'income'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : tx.type === 'expense'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                              }`}
                            >
                              {tx.type === 'income' && <ArrowDownRight className="w-4 h-4" />}
                              {tx.type === 'expense' && <ArrowUpRight className="w-4 h-4" />}
                              {tx.type === 'transfer' && <ArrowLeftRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-bold text-[var(--text-primary)] text-sm">{tx.title}</p>
                              {tx.description && (
                                <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{tx.description}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold"
                            style={{
                              backgroundColor: `${catDetail?.color || '#94A3B8'}20`,
                              color: catDetail?.color || '#94A3B8',
                            }}
                          >
                            {catDetail?.labelUz || tx.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[var(--text-secondary)] font-medium">
                            {member?.name || 'Hisob egasi'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[var(--text-muted)]">
                          {card ? (
                            <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)]">
                              <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> •••• {card.lastFour}
                            </span>
                          ) : (
                            <span className="capitalize">{tx.paymentMethod}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[var(--text-muted)]">
                          <p className="text-[var(--text-secondary)] font-medium">{formatDate(tx.date)}</p>
                          {tx.time && <p className="text-[10px] text-[var(--text-muted)]">{tx.time}</p>}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`font-mono font-bold text-sm ${
                              tx.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : tx.type === 'expense'
                                ? 'text-[var(--text-primary)]'
                                : 'text-purple-600 dark:text-purple-300'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '⇄'}{' '}
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition">
                            <button
                              onClick={() => openEdit(tx)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-[var(--surface-hover)] transition"
                              title="Tahrirlash"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingId(tx.id)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[var(--surface-hover)] transition"
                              title="Oʻchirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] text-[var(--text-primary)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Amaliyotni tahrirlash</h3>
              <button onClick={() => setEditingTx(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Amaliyot nomi</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Summa (soʻm)</label>
                  <input
                    type="number"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Kategoriya</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                      <option key={key} value={key} className="bg-[var(--surface)] text-[var(--text-primary)]">
                        {item.labelUz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-xs font-medium transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  Oʻzgarishlarni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[var(--surface)] text-[var(--text-primary)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Amaliyotni oʻchirish</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Haqiqatan ham ushbu yozuvni oʻchirmoqchimisiz?
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition"
              >
                Oʻchirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
