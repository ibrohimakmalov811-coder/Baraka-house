import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatDate, CATEGORY_DETAILS } from '../../utils/formatters';
import { Transaction, TransactionType, TransactionCategory } from '../../types';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  X,
  CreditCard,
  Calendar,
  User,
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

  // CSV Export
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
          <h2 className="text-xl font-bold text-white tracking-tight">Moliya Tarixi va Amaliyotlar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Jami {filteredTransactions.length} ta operatsiya topildi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>CSV Eksport</span>
          </button>

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

      {/* Search & Multi-Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-baraka-card border border-white/10 shadow-lg space-y-3">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Amaliyot nomi yoki tavsif boʻyicha qidirish..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Type filter */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                typeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kirim
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chiqim
            </button>
            <button
              onClick={() => setTypeFilter('transfer')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                typeFilter === 'transfer' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Oʻtkazma
            </button>
          </div>

          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="all">Barcha kategoriyalar</option>
            {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
              <option key={key} value={key} className="bg-slate-900 text-white">
                {item.labelUz}
              </option>
            ))}
          </select>

          {/* Member Select */}
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="all">Barcha oila aʼzolari</option>
            {members.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.name}
              </option>
            ))}
          </select>

          {/* Payment Method Select */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="all">Barcha toʻlov usullari</option>
            <option value="card">Bank Kartasi</option>
            <option value="cash">Naqd pul</option>
            <option value="transfer">Oʻtkazma</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="ml-auto px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-cyan-400 text-xs font-semibold focus:outline-none"
          >
            <option value="date_desc">Eng soʻnggi sana</option>
            <option value="date_asc">Eng avvalgi sana</option>
            <option value="amount_desc">Katta summa</option>
            <option value="amount_asc">Kichik summa</option>
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-2xl bg-baraka-card border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
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
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Hech qanday amaliyot topilmadi
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const member = members.find((m) => m.id === tx.memberId);
                  const card = cards.find((c) => c.id === tx.cardId);
                  const catDetail = CATEGORY_DETAILS[tx.category];

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {/* Title & Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              tx.type === 'income'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : tx.type === 'expense'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}
                          >
                            {tx.type === 'income' && <ArrowDownRight className="w-4 h-4" />}
                            {tx.type === 'expense' && <ArrowUpRight className="w-4 h-4" />}
                            {tx.type === 'transfer' && <ArrowLeftRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{tx.title}</p>
                            {tx.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
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

                      {/* Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {member?.avatar && (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="text-slate-300 font-medium">
                            {member?.name || 'Nomaʼlum'}
                          </span>
                        </div>
                      </td>

                      {/* Payment method */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {card ? (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                            <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> •••• {card.lastFour}
                          </span>
                        ) : (
                          <span className="capitalize">{tx.paymentMethod}</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400">
                        <p className="text-slate-200 font-medium">{formatDate(tx.date)}</p>
                        {tx.time && <p className="text-[10px] text-slate-500">{tx.time}</p>}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            tx.type === 'income'
                              ? 'text-emerald-400'
                              : tx.type === 'expense'
                              ? 'text-slate-100'
                              : 'text-purple-300'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '⇄'}{' '}
                          {formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition">
                          <button
                            onClick={() => openEdit(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/10"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10"
                            title="Oʻchirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-baraka-card rounded-2xl border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Amaliyotni tahrirlash</h3>
              <button onClick={() => setEditingTx(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Amaliyot nomi</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Summa (soʻm)</label>
                  <input
                    type="number"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Kategoriya</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  >
                    {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.labelUz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Oila aʼzosi</label>
                <select
                  value={editMemberId}
                  onChange={(e) => setEditMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/10 text-xs font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
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
          <div className="w-full max-w-sm bg-baraka-card rounded-2xl border border-white/10 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Amaliyotni oʻchirish</h3>
              <p className="text-xs text-slate-400 mt-1">
                Haqiqatan ham ushbu yozuvni oʻchirmoqchimisiz? Balans va hisobotlar qayta hisoblanadi.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold hover:bg-white/20"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
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
