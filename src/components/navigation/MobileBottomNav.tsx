import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Home, Receipt, CreditCard, Menu, PlusCircle, ArrowLeftRight } from 'lucide-react';
import { MobileMenuDrawer } from './MobileMenuDrawer';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsMobileKeypadOpen, openQuickAction } = useFinanceStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07111F]/95 backdrop-blur-lg border-t border-white/10 px-3 py-2 flex items-center justify-around lg:hidden shadow-2xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 p-1 text-xs font-semibold transition ${
            activeTab === 'overview' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Asosiy</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 p-1 text-xs font-semibold transition ${
            activeTab === 'transactions' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px]">Tarix</span>
        </button>

        {/* Center Floating Quick Action Button */}
        <button
          onClick={() => setIsMobileKeypadOpen(true)}
          className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 active:scale-95 transition"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex flex-col items-center gap-1 p-1 text-xs font-semibold transition ${
            activeTab === 'payments' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">Toʻlovlar</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center gap-1 p-1 text-xs font-semibold transition ${
            isDrawerOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
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
