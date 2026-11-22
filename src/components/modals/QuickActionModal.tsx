import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CATEGORY_DETAILS } from '../../utils/formatters';
import { TransactionCategory } from '../../types';
import { X, PlusCircle, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuickActionModal: React.FC = () => {
  const {
    isQuickActionOpen,
    quickActionType,
    closeQuickAction,
    addTransaction,
    addCard,
    addGoal,
    members,
    cards,
    selectedMonth,
  } = useFinanceStore();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('groceries');
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [cardId, setCardId] = useState(cards[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'transfer'>('card');
  const [description, setDescription] = useState('');

  // Card specific fields
  const [cardNickname, setCardNickname] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [cardType, setCardType] = useState<'uzcard' | 'humo' | 'visa' | 'mastercard'>('humo');
  const [cardGradient, setCardGradient] = useState('gradient-blue-cyan');

  // Goal specific fields
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('2027-12-31');

  if (!isQuickActionOpen || !quickActionType) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quickActionType === 'income' || quickActionType === 'expense') {
      const numAmount = parseFloat(amount.replace(/\s/g, ''));
      if (!numAmount || isNaN(numAmount) || numAmount <= 0) return;

      const today = new Date().toISOString().split('T')[0];
      await addTransaction({
        title: title || (quickActionType === 'income' ? 'Kirim amaliyoti' : 'Chiqim amaliyoti'),
        amount: numAmount,
        type: quickActionType,
        category,
        date: today,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memberId: memberId || members[0]?.id,
        cardId: paymentMethod === 'card' ? cardId || cards[0]?.id : undefined,
        paymentMethod,
        description,
      });

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      closeQuickAction();
    } else if (quickActionType === 'card') {
      const lastFour = cardNumber.slice(-4) || '1234';
      await addCard({
        nickname: cardNickname || 'Yangi Karta',
        cardholderName: (cardholder || 'BARAKA USER').toUpperCase(),
        cardType,
        cardNumberMasked: `${cardNumber.slice(0, 4) || '9860'} •••• •••• ${lastFour}`,
        lastFour,
        expiryDate: '12/28',
        balance: parseFloat(amount) || 0,
        colorGradient: cardGradient,
        isDefault: false,
        isLocked: false,
        onlinePayments: true,
        cashTransactions: true,
      });
      confetti({ particleCount: 50, spread: 70 });
      closeQuickAction();
    } else if (quickActionType === 'goal') {
      const targetNum = parseFloat(goalTarget.replace(/\s/g, ''));
      if (!targetNum || targetNum <= 0) return;

      await addGoal({
        title: title || 'Yangi Jamgʻarma Maqsadi',
        category: 'other',
        targetAmount: targetNum,
        deadline: goalDeadline,
        icon: 'Target',
        color: '#3B82F6',
      });
      confetti({ particleCount: 50, spread: 70 });
      closeQuickAction();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-baraka-card border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            {quickActionType === 'income' && <ArrowDownRight className="w-5 h-5 text-emerald-400" />}
            {quickActionType === 'expense' && <ArrowUpRight className="w-5 h-5 text-rose-400" />}
            {quickActionType === 'card' && <PlusCircle className="w-5 h-5 text-cyan-400" />}
            {quickActionType === 'goal' && <PlusCircle className="w-5 h-5 text-purple-400" />}
            <h2 className="text-lg font-bold text-slate-100">
              {quickActionType === 'income' && 'Yangi Kirim Qoʻshish'}
              {quickActionType === 'expense' && 'Yangi Chiqim Qoʻshish'}
              {quickActionType === 'card' && 'Yangi Bank Kartasi Qoʻshish'}
              {quickActionType === 'goal' && 'Yangi Jamgʻarma Maqsadi'}
            </h2>
          </div>
          <button
            onClick={closeQuickAction}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {(quickActionType === 'income' || quickActionType === 'expense') && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Amaliyot nomi / Tavsif
                </label>
                <input
                  type="text"
                  required
                  placeholder={quickActionType === 'income' ? 'Masalan: Oylik maosh, Bonus' : 'Masalan: Korzinka xaridi, Benzin'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Miqdor (soʻm)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  >
                    {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                      <option key={key} value={key} className="bg-slate-900 text-white">
                        {item.labelUz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Oila aʼzosi
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                        {m.name} ({m.roleTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Toʻlov usuli
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  >
                    <option value="card" className="bg-slate-900 text-white">Bank Kartasi</option>
                    <option value="cash" className="bg-slate-900 text-white">Naqd pul</option>
                    <option value="transfer" className="bg-slate-900 text-white">Oʻtkazma</option>
                  </select>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Qaysi kartadan?
                  </label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.nickname} ({c.cardNumberMasked})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Qoʻshimcha izoh (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  placeholder="Amaliyot haqida qisqacha maʼlumot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>
            </>
          )}

          {quickActionType === 'card' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Karta nomi / Bank
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Humo Aloqabank, Uzcard NBU"
                  value={cardNickname}
                  onChange={(e) => setCardNickname(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Karta turi
                  </label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  >
                    <option value="humo">HUMO</option>
                    <option value="uzcard">UZCARD</option>
                    <option value="visa">VISA</option>
                    <option value="mastercard">MASTERCARD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Karta raqami (oxirgi 4 ta yoki toʻliq)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="9860 0000 0000 1234"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Karta egasi ismi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ALISHER RAKHIMOV"
                    value={cardholder}
                    onChange={(e) => setCardholder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Boshlangʻich balans (soʻm)
                  </label>
                  <input
                    type="number"
                    placeholder="5 000 000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Karta dizayni / Gradient
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'gradient-blue-cyan', color: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
                    { id: 'gradient-gold-amber', color: 'bg-gradient-to-r from-amber-500 to-orange-600' },
                    { id: 'gradient-purple-blue', color: 'bg-gradient-to-r from-indigo-600 to-purple-600' },
                    { id: 'gradient-black-slate', color: 'bg-gradient-to-r from-slate-800 to-slate-950' },
                    { id: 'gradient-emerald-teal', color: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setCardGradient(g.id)}
                      className={`w-10 h-10 rounded-xl ${g.color} flex items-center justify-center transition-all ${
                        cardGradient === g.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {cardGradient === g.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {quickActionType === 'goal' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Maqsad nomi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Yangi Kottej, Avtomobil, Sayohat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Kerakli summa (soʻm)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100 000 000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Tugash muddati
                  </label>
                  <input
                    type="date"
                    required
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={closeQuickAction}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 text-sm font-medium transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition active:scale-95"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
