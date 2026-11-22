import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { FamilyGoal } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  Target,
  Plus,
  TrendingUp,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    members,
    addGoal,
    deleteGoal,
    contributeToGoal,
    withdrawFromGoal,
    currency,
  } = useFinanceStore();

  const [activeGoal, setActiveGoal] = useState<FamilyGoal | null>(null);
  const [modalType, setModalType] = useState<'create' | 'deposit' | 'withdraw' | 'history' | null>(null);

  // Form states
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('2027-12-31');
  const [goalIcon, setGoalIcon] = useState('Home');

  // Contribution states
  const [contribAmount, setContribAmount] = useState('');
  const [contribMemberId, setContribMemberId] = useState(members[0]?.id || '');
  const [contribNote, setContribNote] = useState('');

  const totalTargetAllGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedAllGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const handleOpenDeposit = (goal: FamilyGoal) => {
    setActiveGoal(goal);
    setContribAmount('');
    setContribNote('');
    setModalType('deposit');
  };

  const handleOpenWithdraw = (goal: FamilyGoal) => {
    setActiveGoal(goal);
    setContribAmount('');
    setContribNote('');
    setModalType('withdraw');
  };

  const handleOpenHistory = (goal: FamilyGoal) => {
    setActiveGoal(goal);
    setModalType('history');
  };

  const handleCreateGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget.replace(/\s/g, ''));
    if (!target || target <= 0) return;

    await addGoal({
      title: goalTitle,
      category: 'other',
      targetAmount: target,
      deadline: goalDeadline,
      icon: goalIcon,
      color: '#3B82F6',
    });

    confetti({ particleCount: 50, spread: 70 });
    setModalType(null);
    setGoalTitle('');
    setGoalTarget('');
  };

  const handleContribSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;

    const num = parseFloat(contribAmount.replace(/\s/g, ''));
    if (!num || num <= 0) return;

    if (modalType === 'deposit') {
      await contributeToGoal(activeGoal.id, num, contribMemberId, contribNote);
      if (activeGoal.currentAmount + num >= activeGoal.targetAmount) {
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 40, spread: 60 });
      }
    } else if (modalType === 'withdraw') {
      await withdrawFromGoal(activeGoal.id, num, contribMemberId, contribNote);
    }

    setModalType(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Oilaviy Jamgʻarma Maqsadlari</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Orzudagi uy, avtomobil, sayohat va bolalar kelajagi uchun maqsadli jamgʻarmalar
          </p>
        </div>

        <button
          onClick={() => {
            setGoalTitle('');
            setGoalTarget('');
            setModalType('create');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Maqsad Qoʻshish</span>
        </button>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Jami Toʻplangan Jamgʻarma</span>
          <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-300 mt-2">
            {formatCurrency(totalSavedAllGoals, currency)}
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Barcha maqsadlar boʻyicha
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Kerakli Umumiy Summa</span>
          <h3 className="text-2xl font-black text-[var(--text-primary)] mt-2">
            {formatCurrency(totalTargetAllGoals, currency)}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {goals.length} ta umumiy oilaviy maqsad
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Umumiy Progress</span>
          <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
            {totalTargetAllGoals > 0 ? Math.round((totalSavedAllGoals / totalTargetAllGoals) * 100) : 0}%
          </h3>
          <p className="text-xs text-purple-600 dark:text-purple-300 mt-2">Reja boʻyicha ketmoqda</p>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl bg-[var(--surface)] border transition-all duration-300 flex flex-col justify-between shadow-xl space-y-4 ${
                goal.isCompleted
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-[var(--border)] hover:border-cyan-500/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{goal.title}</h3>
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>Muddat: {goal.deadline}</span>
                      </p>
                    </div>
                  </div>

                  {goal.isCompleted ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                      <Award className="w-4 h-4" /> Bajarildi!
                    </span>
                  ) : (
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--surface-hover)] transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)]">Jamgʻarilgan summa:</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">{pct}%</span>
                  </div>

                  <div className="w-full bg-[var(--background-secondary)] rounded-full h-3 overflow-hidden border border-[var(--border)]">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] pt-1">
                    <span className="font-bold text-[var(--text-primary)] font-mono">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-[var(--text-muted)] font-mono">
                      Maqsad: {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Remaining Amount */}
                <div className="mt-4 p-3 rounded-xl bg-[var(--input-background)] border border-[var(--border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Yana kerak:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-300 font-mono">
                    {formatCurrency(remaining, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenHistory(goal)}
                  className="px-3 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-secondary)] font-semibold border border-[var(--border)]"
                >
                  Tarix ({goal.contributions?.length || 0})
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenWithdraw(goal)}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold"
                  >
                    Yechish
                  </button>

                  <button
                    onClick={() => handleOpenDeposit(goal)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition active:scale-95"
                  >
                    + Qoʻshish
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Goal */}
      {modalType === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Yangi Jamgʻarma Maqsadi</h3>
              <button onClick={() => setModalType(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Maqsad nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Yangi Kottej Uy, Taʼtil"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Kerakli summa (soʻm)
                </label>
                <input
                  type="number"
                  required
                  placeholder="150 000 000"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Rejalashtirilgan sana
                </label>
                <input
                  type="date"
                  required
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] text-xs font-medium border border-[var(--border)]"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit / Withdraw Contribution */}
      {(modalType === 'deposit' || modalType === 'withdraw') && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {modalType === 'deposit' ? 'Jamgʻarmaga Pul Qoʻshish' : 'Jamgʻarmadan Pul Yechish'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">{activeGoal.title}</p>

            {/* Accounting Rule Notice */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-700 dark:text-blue-200 leading-relaxed">
              💡 <strong>Ichki oʻtkazma qoidasi:</strong> Ushbu mablagʻ erkin qoldiqdan jamgʻarma maqsadiga oʻtkaziladi. Bu amaliyot yangi xarajat yoki daromad sifatida hisoblanmaydi.
            </div>

            <form onSubmit={handleContribSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Summa (soʻm)
                </label>
                <input
                  type="number"
                  required
                  placeholder="5 000 000"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Oila aʼzosi
                </label>
                <select
                  value={contribMemberId}
                  onChange={(e) => setContribMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Izoh (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Oylik jamgʻarmadan"
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] text-xs font-medium border border-[var(--border)]"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Goal Contribution History */}
      {modalType === 'history' && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {activeGoal.title} — Jamgʻarma Tarixi
              </h3>
              <button onClick={() => setModalType(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 py-2">
              {!activeGoal.contributions || activeGoal.contributions.length === 0 ? (
                <p className="text-center py-8 text-xs text-[var(--text-muted)]">Hozircha tarix mavjud emas</p>
              ) : (
                activeGoal.contributions.map((c) => {
                  const m = members.find((mem) => mem.id === c.memberId);
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[var(--input-background)] border border-[var(--border)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            c.type === 'deposit'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {c.type === 'deposit' ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">
                            {c.type === 'deposit' ? "Qo'shildi" : "Yechildi"}
                            {m && ` • ${m.name}`}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)]">{c.date} • {c.note || ''}</p>
                        </div>
                      </div>

                      <span
                        className={`font-mono font-bold ${
                          c.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                        }`}
                      >
                        {c.type === 'deposit' ? '+' : '-'} {formatCurrency(c.amount, currency)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] border border-[var(--border)]"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
