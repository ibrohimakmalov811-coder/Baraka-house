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
} from 'lucide-react';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, isDarkMode, toggleDarkMode, settings } = useFinanceStore();

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
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full bg-[#07111F] border-t border-white/10 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl p-5 animate-in slide-in-from-bottom duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <Logo variant="full" size="sm" withTagline={false} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 text-slate-300 hover:text-white"
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
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition text-left ${
                  isActive
                    ? 'bg-blue-600/30 border border-blue-500/50 text-white'
                    : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2 rounded-xl ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-cyan-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{cat.name}</p>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">{cat.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            );
          })}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-xs text-slate-300"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            <span>Rejimni oʻzgartirish</span>
          </button>

          <span className="text-xs font-mono text-cyan-400">
            {settings?.familyName || 'Rahimovlar Oilasi'}
          </span>
        </div>
      </div>
    </div>
  );
};
