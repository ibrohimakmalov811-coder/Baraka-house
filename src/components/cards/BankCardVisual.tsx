import React from 'react';
import { PaymentCard } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Wifi, Lock, CheckCircle2 } from 'lucide-react';

interface BankCardVisualProps {
  card: PaymentCard;
  isSelected?: boolean;
  onClick?: () => void;
  showBalance?: boolean;
  className?: string;
  compact?: boolean;
}

export const BankCardVisual: React.FC<BankCardVisualProps> = ({
  card,
  isSelected = false,
  onClick,
  showBalance = true,
  className = '',
  compact = false,
}) => {
  const { currency } = useFinanceStore();

  const getGradientClass = (gradient: string) => {
    switch (gradient) {
      case 'gradient-gold-amber':
        return 'from-amber-500 via-orange-600 to-amber-700 text-white';
      case 'gradient-purple-blue':
        return 'from-indigo-600 via-purple-600 to-pink-600 text-white';
      case 'gradient-black-slate':
        return 'from-slate-900 via-gray-900 to-zinc-950 text-white border border-white/20';
      case 'gradient-emerald-teal':
        return 'from-emerald-500 via-teal-600 to-cyan-700 text-white';
      case 'gradient-blue-cyan':
      default:
        return 'from-cyan-500 via-blue-600 to-indigo-700 text-white';
    }
  };

  const renderCardTypeLogo = () => {
    switch (card.cardType) {
      case 'uzcard':
        return (
          <div className="flex items-center gap-1 font-black text-sm tracking-widest text-emerald-300 bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
            <span>UZCARD</span>
          </div>
        );
      case 'humo':
        return (
          <div className="flex items-center gap-1 font-black text-sm tracking-wider text-amber-300 bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
            <span>HUMO</span>
          </div>
        );
      case 'visa':
        return (
          <span className="font-extrabold italic text-lg tracking-wider text-white">
            VISA
          </span>
        );
      case 'mastercard':
        return (
          <div className="flex items-center -space-x-2">
            <div className="w-5 h-5 rounded-full bg-red-500 opacity-90" />
            <div className="w-5 h-5 rounded-full bg-amber-400 opacity-90" />
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-5 overflow-hidden shadow-xl transition-all duration-300 bg-gradient-to-tr ${getGradientClass(
        card.colorGradient
      )} ${isSelected ? 'ring-2 ring-blue-500 dark:ring-cyan-400 ring-offset-2 ring-offset-[var(--surface)] scale-[1.02]' : 'hover:scale-[1.01]'} ${
        card.isLocked ? 'grayscale-[0.7] opacity-80' : ''
      } ${compact ? 'min-w-[270px] h-[160px]' : 'w-full min-h-[195px]'} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Background card texture lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <circle cx="90%" cy="10%" r="90" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="90%" cy="10%" r="130" stroke="white" strokeWidth="1.5" fill="none" />
          <circle cx="10%" cy="90%" r="110" stroke="white" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top bar: Chip, Contactless, Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Chip */}
            <div className="w-8 h-6 rounded bg-gradient-to-tr from-amber-200 to-amber-400 shadow-inner flex items-center justify-center p-0.5 border border-amber-300">
              <div className="w-full h-full border border-amber-600/40 rounded-sm grid grid-cols-2 gap-0.5" />
            </div>
            {/* Contactless */}
            <Wifi className="w-4 h-4 rotate-90 text-white/80" />
            {card.isLocked && (
              <span className="flex items-center gap-1 text-[11px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
                <Lock className="w-3 h-3" /> Bloklangan
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {card.isDefault && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-cyan-300" /> Asosiy
              </span>
            )}
            {renderCardTypeLogo()}
          </div>
        </div>

        {/* Middle: Masked card number */}
        <div className="my-auto py-2">
          <p className="font-mono text-lg tracking-[0.25em] text-white/95 font-semibold drop-shadow-sm">
            {card.cardNumberMasked}
          </p>
          {showBalance && (
            <p className="text-xs text-white/75 font-medium mt-1">
              Balans:{' '}
              <span className="text-sm font-bold text-white tracking-wide">
                {formatCurrency(card.balance, currency)}
              </span>
            </p>
          )}
        </div>

        {/* Bottom bar: Cardholder name & Expiry */}
        <div className="flex items-end justify-between text-xs pt-1 border-t border-white/10">
          <div>
            <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
              Karta egasi
            </p>
            <p className="font-bold tracking-wider text-white text-sm">
              {card.cardholderName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
              Muddati
            </p>
            <p className="font-mono font-bold text-white text-sm">
              {card.expiryDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
