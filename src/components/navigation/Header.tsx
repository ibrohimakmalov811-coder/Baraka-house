import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Search, Bell, Plus, Calendar, Lock } from 'lucide-react';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { UserAvatar } from '../common/UserAvatar';

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
    currentUser,
    lockApp,
  } = useFinanceStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const primaryUser = members[0] || {
    name: 'Akmalov Jasur',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[var(--header-background)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[var(--input-background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs w-48 lg:w-64 transition shadow-sm"
        >
          <Search className="w-4 h-4 text-blue-500 dark:text-cyan-400 shrink-0" />
          <span className="truncate">Qidiruv... (Ctrl+K)</span>
          <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-[var(--surface-hover)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-secondary)] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Month Selector */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-xs text-[var(--text-secondary)] shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-[var(--text-primary)] font-medium focus:outline-none cursor-pointer"
          >
            <option value="2026-11" className="bg-[var(--surface)] text-[var(--text-primary)]">Noyabr 2026</option>
            <option value="2026-10" className="bg-[var(--surface)] text-[var(--text-primary)]">Oktyabr 2026</option>
            <option value="2026-09" className="bg-[var(--surface)] text-[var(--text-primary)]">Sentabr 2026</option>
            <option value="" className="bg-[var(--surface)] text-[var(--text-primary)]">Barcha davr</option>
          </select>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] p-0.5 text-xs font-semibold">
          {(['UZS', 'USD', 'EUR'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                currency === curr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
          className="relative p-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition shadow-sm"
          title="Bildirishnomalar"
        >
          <Bell className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Lock Application Button */}
        <button
          onClick={lockApp}
          className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-600 dark:text-amber-400 transition shadow-sm"
          title="Ilovani qulflash (Lock App)"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Profile Avatar */}
        <UserAvatar
          avatarUrl={currentUser?.avatar || primaryUser.avatar}
          name={currentUser?.fullName || primaryUser.name}
          size="sm"
          showEditButton={false}
        />
      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};
