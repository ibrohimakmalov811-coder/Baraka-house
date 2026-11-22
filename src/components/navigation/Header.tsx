import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Search, Bell, Plus, Calendar, DollarSign } from 'lucide-react';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const {
    selectedMonth,
    setSelectedMonth,
    currency,
    setCurrency,
    notifications,
    setIsNotificationOpen,
    openQuickAction,
    members,
  } = useFinanceStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const primaryUser = members[0] || {
    name: 'Alisher Rahimov',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-baraka-card/80 backdrop-blur-md border-b border-white/5 transition-colors">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-slate-400 text-xs w-48 lg:w-64 transition"
        >
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">Qidiruv... (Ctrl+K)</span>
          <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Month Selector */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="2026-11" className="bg-slate-900 text-white">Noyabr 2026</option>
            <option value="2026-10" className="bg-slate-900 text-white">Oktyabr 2026</option>
            <option value="2026-09" className="bg-slate-900 text-white">Sentabr 2026</option>
            <option value="" className="bg-slate-900 text-white">Barcha davr</option>
          </select>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center rounded-xl bg-slate-900/60 border border-white/10 p-0.5 text-xs font-semibold">
          {(['UZS', 'USD', 'EUR'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                currency === curr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Quick Add Action Button */}
        <button
          onClick={() => openQuickAction('expense')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Amaliyot</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-slate-300 transition"
        >
          <Bell className="w-4 h-4 text-cyan-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar */}
        <img
          src={primaryUser.avatar}
          alt={primaryUser.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/50"
        />
      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};
