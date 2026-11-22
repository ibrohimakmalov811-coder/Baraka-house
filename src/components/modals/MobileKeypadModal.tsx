import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/formatters';
import { X, Delete, Fingerprint, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MobileKeypadModal: React.FC = () => {
  const {
    isMobileKeypadOpen,
    setIsMobileKeypadOpen,
    members,
    cards,
    addTransaction,
    currency,
  } = useFinanceStore();

  const [inputVal, setInputVal] = useState('150000');
  const [selectedMemberId, setSelectedMemberId] = useState(members[1]?.id || members[0]?.id || '');
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');
  const [tag, setTag] = useState('Oilaviy');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isMobileKeypadOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (inputVal.length > 9) return;
    if (inputVal === '0') {
      setInputVal(digit);
    } else {
      setInputVal((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setInputVal((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleClear = () => {
    setInputVal('0');
  };

  const handleConfirmTransfer = async () => {
    const numAmount = parseFloat(inputVal);
    if (!numAmount || numAmount <= 0) return;

    const recipient = members.find((m) => m.id === selectedMemberId);

    await addTransaction({
      title: `${recipient?.name || "Oila a'zosi"}ga o'tkazma (${tag})`,
      amount: numAmount,
      type: 'expense',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberId: members[0]?.id || 'mem_1',
      cardId: selectedCardId,
      paymentMethod: 'card',
      description: note || `Tezkor demo o'tkazma. Teg: ${tag}`,
    });

    confetti({ particleCount: 60, spread: 70 });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsMobileKeypadOpen(false);
      setInputVal('150000');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200 sm:items-center sm:justify-center sm:p-4">
      <div className="w-full sm:max-w-md bg-[var(--surface)] text-[var(--text-primary)] rounded-t-3xl sm:rounded-3xl border border-[var(--border)] p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">
            Tezkor Oʻtkazma / Toʻlov
          </span>
          <button
            onClick={() => setIsMobileKeypadOpen(false)}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--surface-hover)] border border-[var(--border)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Muvaffaqiyatli oʻtkazildi!</h3>
            <p className="text-[var(--text-muted)] text-sm">{formatCurrency(parseFloat(inputVal) || 0, currency)}</p>
          </div>
        ) : (
          <>
            {/* Recipient Picker */}
            <div className="py-3">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Qabul qiluvchi:</p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shrink-0 transition ${
                      selectedMemberId === m.id
                        ? 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-cyan-400'
                        : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{m.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Amount */}
            <div className="text-center py-4 bg-[var(--surface-hover)] rounded-2xl border border-[var(--border)] my-2">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Oʻtkaziladigan summa</p>
              <p className="font-mono text-3xl font-black text-[var(--text-primary)] tracking-wider">
                {formatCurrency(parseFloat(inputVal) || 0, currency)}
              </p>
            </div>

            {/* Tags */}
            <div className="flex justify-center gap-2 my-2 text-xs">
              {['Oilaviy', 'Oziq-ovqat', 'Kvartira', 'Sovgʻa'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    tag === t
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5 my-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="h-12 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-xl flex items-center justify-center transition active:scale-95 shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold text-sm flex items-center justify-center transition"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-xl flex items-center justify-center transition active:scale-95 shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-12 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition active:scale-95"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Confirm Touch ID / Biometric Button */}
            <button
              type="button"
              onClick={handleConfirmTransfer}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-98"
            >
              <Fingerprint className="w-5 h-5 text-cyan-200" />
              <span>Tasdiqlash (Touch ID)</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
