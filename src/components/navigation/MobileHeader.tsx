import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../common/Logo';
import { Bell, Search, Sun, Moon, Lock } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface MobileHeaderProps {
  onOpenMenu?: () => void;
  onOpenSearch?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenMenu, onOpenSearch }) => {
  const {
    members,
    notifications,
    setIsNotificationOpen,
    isDarkMode,
    toggleDarkMode,
    settings,
    currentUser,
    lockApp,
  } = useFinanceStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const primaryUser = members[0] || {
    name: 'Alisher',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[var(--header-background)]/90 backdrop-blur-md border-b border-[var(--border)] lg:hidden transition-colors">
      {/* User profile & greeting */}
      <div className="flex items-center gap-2.5">
        <UserAvatar
          avatarUrl={currentUser?.avatar || primaryUser.avatar}
          name={currentUser?.fullName || primaryUser.name}
          size="sm"
          showEditButton={false}
        />
        <div>
          <p className="text-[10px] text-[var(--text-muted)] font-medium">Xush kelibsiz,</p>
          <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[120px]">
            {currentUser?.displayName || currentUser?.fullName?.split(' ')[0] || primaryUser.name.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Center Logo */}
      <div className="flex items-center">
        <Logo variant="symbol" size="sm" />
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        <button
          onClick={lockApp}
          className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 transition"
          title="Ilovani qulflash"
        >
          <Lock className="w-4 h-4" />
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>

        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-2 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition"
        >
          <Bell className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
          {unreadCount > 0 && (
            <span className="absolute 0 top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[var(--surface)]" />
          )}
        </button>
      </div>
    </header>
  );
};
