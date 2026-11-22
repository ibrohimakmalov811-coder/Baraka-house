import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  PieChart,
  Target,
  Calendar,
  Users,
  Repeat,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const {
    activeTab,
    setActiveTab,
    isDarkMode,
    toggleDarkMode,
    members,
    settings,
    openQuickAction,
  } = useFinanceStore();

  const navItems = [
    {
      id: 'overview',
      labelUz: 'Umumiy koʻrinish',
      labelEn: 'Overview',
      desc: 'Boshqaruv paneli',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      labelUz: 'Amaliyotlar',
      labelEn: 'Transactions',
      desc: 'Barcha kirim va chiqimlar',
      icon: ArrowLeftRight,
    },
    {
      id: 'payments',
      labelUz: 'Toʻlovlar',
      labelEn: 'Payments',
      desc: 'Kommunal va boshqa toʻlovlar',
      icon: Receipt,
    },
    {
      id: 'cards',
      labelUz: 'Mening kartalarim',
      labelEn: 'My Cards',
      desc: 'Kartalarni boshqarish',
      icon: CreditCard,
    },
    {
      id: 'budget',
      labelUz: 'Aqlli byudjet',
      labelEn: 'Smart Budget',
      desc: 'Byudjet va limitlar',
      icon: PieChart,
    },
    {
      id: 'goals',
      labelUz: 'Oilaviy maqsadlar',
      labelEn: 'Family Goals',
      desc: 'Jamgʻarma maqsadlari',
      icon: Target,
    },
    {
      id: 'calendar',
      labelUz: 'Moliyaviy taqvim',
      labelEn: 'Financial Calendar',
      desc: 'Toʻlovlar taqvimi',
      icon: Calendar,
    },
    {
      id: 'family',
      labelUz: 'Oila xonasi',
      labelEn: 'Family Space',
      desc: 'Oila aʼzolari va profillar',
      icon: Users,
    },
    {
      id: 'subscriptions',
      labelUz: 'Obunalar',
      labelEn: 'Subscriptions',
      desc: 'Muntazam servislar',
      icon: Repeat,
    },
    {
      id: 'settings',
      labelUz: 'Sozlamalar',
      labelEn: 'Settings',
      desc: 'Maʼlumotlar va eksport',
      icon: Settings,
    },
  ];

  const primaryUser = members[0] || {
    name: 'Alisher Rahimov',
    roleTitle: 'Oila boshligʻi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <aside
      className={`w-64 shrink-0 h-screen sticky top-0 flex flex-col justify-between p-4 bg-[var(--sidebar-background)] border-r border-[var(--border)] transition-colors duration-200 select-none ${className}`}
    >
      <div>
        {/* Brand Logo */}
        <div className="px-2 pt-2 pb-6">
          <Logo size="md" withTagline={true} />
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-blue-500 dark:group-hover:text-cyan-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate leading-snug">{item.labelUz}</p>
                  <p
                    className={`text-[10px] truncate ${
                      isActive ? 'text-blue-100' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/90 shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Theme controls */}
      <div className="pt-4 border-t border-[var(--border)] space-y-3">
        {/* Theme & Currency Controls */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Yorugʻ rejim</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600" />
                <span>Tungi rejim</span>
              </>
            )}
          </button>

          <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-500/20">
            {settings?.primaryCurrency || 'UZS'}
          </span>
        </div>

        {/* User Card */}
        <div
          onClick={() => setActiveTab('family')}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] cursor-pointer transition border border-[var(--border)]"
        >
          <img
            src={primaryUser.avatar}
            alt={primaryUser.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/50 dark:ring-cyan-500/40"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">{primaryUser.name}</p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{settings?.familyName || 'Rahimovlar Oilasi'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
