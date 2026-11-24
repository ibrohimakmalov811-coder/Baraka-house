import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../common/Logo';
import {
  X,
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
  ChevronRight,
  Sun,
  Moon,
  Lock,
} from 'lucide-react';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, isDarkMode, toggleDarkMode, settings, lockApp } = useFinanceStore();

  if (!isOpen) return null;

  // Exact navigation categories matching Image 1
  const categories = [
    {
      id: 'overview',
      name: 'Overview',
      desc: 'Boshqaruv paneli',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      name: 'Transactions',
      desc: 'Barcha kirim va chiqimlar',
      icon: ArrowLeftRight,
    },
    {
      id: 'payments',
      name: 'Payments',
      desc: 'Kommunal va boshqa toʻlovlar',
      icon: Receipt,
    },
    {
      id: 'cards',
      name: 'My Cards',
      desc: 'Kartalarni boshqarish',
      icon: CreditCard,
    },
    {
      id: 'budget',
      name: 'Smart Budget',
      desc: 'Byudjet va limitlar',
      icon: PieChart,
    },
    {
      id: 'goals',
      name: 'Family Goals',
      desc: 'Jamgʻarma maqsadlari',
      icon: Target,
    },
    {
      id: 'calendar',
      name: 'Financial Calendar',
      desc: 'Toʻlovlar taqvimi',
      icon: Calendar,
    },
    {
      id: 'family',
      name: 'Family Space',
      desc: 'Oila aʼzolari va profillar',
      icon: Users,
    },
    {
      id: 'subscriptions',
      name: 'Subscriptions',
      desc: 'Muntazam servislar',
      icon: Repeat,
    },
    {
      id: 'settings',
      name: 'Settings',
      desc: 'Maʼlumotlar va sozlamalar',
      icon: Settings,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-t border-[var(--border)] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl p-5 animate-in slide-in-from-bottom duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <Logo variant="full" size="sm" withTagline={false} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List — Exactly matches Image 1 */}
        <div className="overflow-y-auto py-3 space-y-2 flex-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition text-left border ${
                  isActive
                    ? 'bg-blue-600/10 dark:bg-blue-600/20 border-blue-500 text-blue-600 dark:text-cyan-400 font-semibold'
                    : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2 rounded-xl ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 dark:bg-cyan-950/50 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{cat.name}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-tight mt-0.5">{cat.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            );
          })}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              lockApp();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400 border border-amber-500/25 transition"
            title="Ilovani qulflash"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Qulflash</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
            <span className="hidden sm:inline">Rejim</span>
          </button>

          <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400 truncate max-w-[100px]">
            {settings?.familyName || 'Akmalovlar Oilasi'}
          </span>
        </div>
      </div>
    </div>
  );
};
