import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { FamilyMember } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Plus,
  UserCheck,
  Shield,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  Target,
  X,
  CreditCard,
  Heart,
} from 'lucide-react';

export const FamilyPage: React.FC = () => {
  const {
    members,
    transactions,
    goals,
    addMember,
    updateMember,
    deleteMember,
    currency,
    settings,
  } = useFinanceStore();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  // Selected member statistics
  const memberTransactions = transactions.filter((t) => t.memberId === selectedMember?.id);
  const memberIncome = memberTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const memberExpenses = memberTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Contributions made by member
  let memberGoalTotal = 0;
  goals.forEach((g) => {
    (g.contributions || []).forEach((c) => {
      if (c.memberId === selectedMember?.id && c.type === 'deposit') {
        memberGoalTotal += c.amount;
      }
    });
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addMember({
      name,
      role: 'child',
      roleTitle: roleTitle || "Oila a'zosi",
      avatar,
      color: '#3B82F6',
    });

    setIsAddOpen(false);
    setName('');
    setRoleTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Oila Xonasi va Aʼzolar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {settings?.familyName || 'Rahimovlar Oilasi'} — Oila aʼzolari faolligi va xarajatlari
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Aʼzo Qoʻshish</span>
        </button>
      </div>

      {/* Members Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((m) => {
          const isSelected = m.id === selectedMember?.id;
          const txCount = transactions.filter((t) => t.memberId === m.id).length;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className={`p-5 rounded-2xl bg-baraka-card border cursor-pointer transition-all duration-300 shadow-lg relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-400 shadow-cyan-500/15 scale-[1.02]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-400/50 shadow-md"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{m.name}</h3>
                  <p className="text-xs text-cyan-400 font-medium truncate">{m.roleTitle}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Amaliyotlar:</span>
                <span className="font-bold text-white font-mono">{txCount} ta</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Member Detail Section */}
      {selectedMember && (
        <div className="p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg space-y-6">
          {/* Member Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-cyan-500/30 shadow-xl"
              />
              <div>
                <h3 className="text-lg font-black text-white">{selectedMember.name}</h3>
                <p className="text-xs text-cyan-400 font-semibold">{selectedMember.roleTitle}</p>
              </div>
            </div>

            {members.length > 1 && (
              <button
                onClick={() => deleteMember(selectedMember.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/20 self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Aʼzoni oʻchirish</span>
              </button>
            )}
          </div>

          {/* Member 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Jami Kirim</span>
              <p className="text-lg font-black text-emerald-400 mt-1">
                +{formatCurrency(memberIncome, currency)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Jami Chiqim</span>
              <p className="text-lg font-black text-rose-400 mt-1">
                -{formatCurrency(memberExpenses, currency)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Maqsadlarga Jamgʻarma</span>
              <p className="text-lg font-black text-cyan-400 mt-1">
                {formatCurrency(memberGoalTotal, currency)}
              </p>
            </div>
          </div>

          {/* Member Transactions Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>{selectedMember.name}ning shaxsiy amaliyotlari</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Amaliyot</th>
                    <th className="py-3 px-4">Kategoriya</th>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4 text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {memberTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Ushbu aʼzoga tegishli amaliyotlar yoʻq
                      </td>
                    </tr>
                  ) : (
                    memberTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4 font-bold text-white">{tx.title}</td>
                        <td className="py-3 px-4 text-slate-400 capitalize">{tx.category}</td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(tx.date)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span
                            className={
                              tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                            }
                          >
                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-baraka-card rounded-2xl border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Yangi Oila Aʼzosi Qoʻshish</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ism va Familiya</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Rahimov"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Rol / Mavqei
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Oʻgʻil, Qiz, Katta farzand, Bobo"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Profil Rasmi (Avatar URL)
                </label>
                <input
                  type="url"
                  required
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono text-xs"
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
                  Qoʻshish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
