import React, { useEffect } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { RightWalletPanel } from './components/layout/RightWalletPanel';
import { MobileHeader } from './components/navigation/MobileHeader';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { MobileKeypadModal } from './components/modals/MobileKeypadModal';

// Pages
import { OverviewPage } from './pages/Overview/OverviewPage';
import { TransactionsPage } from './pages/Transactions/TransactionsPage';
import { PaymentsPage } from './pages/Payments/PaymentsPage';
import { CardsPage } from './pages/Cards/CardsPage';
import { BudgetPage } from './pages/Budget/BudgetPage';
import { GoalsPage } from './pages/Goals/GoalsPage';
import { CalendarPage } from './pages/Calendar/CalendarPage';
import { FamilyPage } from './pages/Family/FamilyPage';
import { SubscriptionsPage } from './pages/Subscriptions/SubscriptionsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { AuthPage } from './pages/Auth/AuthPage';
import { LockScreen } from './pages/Auth/LockScreen';
import { useInactivityLock } from './hooks/useInactivityLock';

export function App() {
  const {
    activeTab,
    isUnlocked,
    lockedUser,
    showAccountSwitcher,
    isAuthLoading,
    initAuthAndData,
  } = useFinanceStore();

  // Inactivity auto-lock hook (5 minutes)
  useInactivityLock();

  useEffect(() => {
    initAuthAndData();
  }, [initAuthAndData]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center text-[var(--text-primary)]">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
        <p className="font-bold tracking-widest text-sm text-cyan-500">BARAKA YUKLANMOQDA...</p>
      </div>
    );
  }

  // Mandatory App Lock Check:
  // If not unlocked, check if returning user lock screen or auth registration/login page
  if (!isUnlocked) {
    if (lockedUser && !showAccountSwitcher) {
      return <LockScreen />;
    }
    return <AuthPage />;
  }

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'cards':
        return <CardsPage />;
      case 'budget':
        return <BudgetPage />;
      case 'goals':
        return <GoalsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'family':
        return <FamilyPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Boshqaruv Paneli';
      case 'transactions':
        return 'Moliya Tarixi';
      case 'payments':
        return 'Kommunal Toʻlovlar';
      case 'cards':
        return 'Mening Kartalarim';
      case 'budget':
        return 'Aqlli Byudjet';
      case 'goals':
        return 'Oilaviy Jamgʻarmalar';
      case 'calendar':
        return 'Moliyaviy Taqvim';
      case 'family':
        return 'Oila Xonasi';
      case 'subscriptions':
        return 'Muntazam Obunalar';
      case 'settings':
        return 'Tizim Sozlamalari';
      default:
        return 'BARAKA';
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* DESKTOP LEFT COLUMN: Sidebar (Fixed & Persistent) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* MOBILE TOP HEADER */}
      <MobileHeader />

      {/* CENTER COLUMN: Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header title={getPageTitle()} subtitle="Oilangiz moliyaviy boshqaruv markazi" />
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* DESKTOP RIGHT COLUMN: Wallet & Activity Panel */}
      <div className="hidden xl:block">
        <RightWalletPanel />
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav />

      {/* GLOBAL MODALS */}
      <QuickActionModal />
      <NotificationDrawer />
      <MobileKeypadModal />
    </div>
  );
}

export default App;
