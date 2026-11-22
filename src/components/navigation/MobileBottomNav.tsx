import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Home, Receipt, CreditCard, Menu, PlusCircle, ArrowLeftRight } from 'lucide-react';
import { MobileMenuDrawer } from './MobileMenuDrawer';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsMobileKeypadOpen, openQuickAction } = useFinanceStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-lg border-t border-[var(--border)] px-3 py-2 flex items-center justify-around lg:hidden shadow-2xl transition-colors">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 p-1 text-xs font-semibold transition ${
            activeTab === 'overview' ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Asosiy</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 p-1 text-xs font-semibold transition ${
            activeTab === 'transactions' ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px]">Tarix</span>
        </button>

        {/* Center Floating Quick Action Button */}
        <button
          onClick={() => setIsMobileKeypadOpen(true)}
          className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex flex-col items-center gap-1 p-1 text-xs font-semibold transition ${
            activeTab === 'payments' ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">Toʻlovlar</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center gap-1 p-1 text-xs font-semibold transition ${
            isDrawerOpen ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Katalog</span>
        </button>
      </nav>

      <MobileMenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
