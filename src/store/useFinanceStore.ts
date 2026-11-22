import { create } from 'zustand';
import {
  CurrencyCode,
  Transaction,
  PaymentCard,
  UtilityService,
  Budget,
  FamilyGoal,
  Subscription,
  CalendarEvent,
  AppNotification,
  FamilyMember,
  FamilySettings,
} from '../types';
import { db, initializeDatabase } from '../database/db';

interface FinanceState {
  // Navigation & UI state
  activeTab: string;
  isDarkMode: boolean;
  currency: CurrencyCode;
  selectedMonth: string; // YYYY-MM
  isMobileKeypadOpen: boolean;
  selectedCardId: string;
  searchQuery: string;
  isNotificationOpen: boolean;
  isQuickActionOpen: boolean;
  quickActionType: 'income' | 'expense' | 'transfer' | 'goal' | 'card' | null;

  // Live Database collections
  transactions: Transaction[];
  cards: PaymentCard[];
  services: UtilityService[];
  budgets: Budget[];
  goals: FamilyGoal[];
  subscriptions: Subscription[];
  calendarEvents: CalendarEvent[];
  notifications: AppNotification[];
  members: FamilyMember[];
  settings: FamilySettings | null;

  // Actions
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
  setCurrency: (c: CurrencyCode) => void;
  setSelectedMonth: (month: string) => void;
  setSelectedCardId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setIsNotificationOpen: (open: boolean) => void;
  setIsMobileKeypadOpen: (open: boolean) => void;
  openQuickAction: (type: 'income' | 'expense' | 'transfer' | 'goal' | 'card') => void;
  closeQuickAction: () => void;

  // Data Loading & Sync
  loadAllData: () => Promise<void>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Financial CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Card Operations
  addCard: (card: Omit<PaymentCard, 'id'>) => Promise<PaymentCard>;
  updateCard: (id: string, updates: Partial<PaymentCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<void>;
  toggleCardLock: (id: string) => Promise<void>;
  toggleOnlinePayments: (id: string) => Promise<void>;
  toggleCashTransactions: (id: string) => Promise<void>;

  // Payment / Utility Demo Flow
  executeDemoPayment: (serviceId: string, cardId: string, amount: number) => Promise<{ receiptId: string; tx: Transaction }>;

  // Subscriptions Flow
  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<Subscription>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  renewSubscriptionDemo: (subId: string) => Promise<Transaction | null>;

  // Budget Flow
  addBudget: (b: Omit<Budget, 'id'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Goals Flow
  addGoal: (g: Omit<FamilyGoal, 'id' | 'currentAmount' | 'contributions' | 'isCompleted'>) => Promise<FamilyGoal>;
  updateGoal: (id: string, updates: Partial<FamilyGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, memberId: string, note?: string) => Promise<void>;
  withdrawFromGoal: (goalId: string, amount: number, memberId: string, note?: string) => Promise<void>;

  // Family Members Flow
  addMember: (m: Omit<FamilyMember, 'id'>) => Promise<FamilyMember>;
  updateMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  // Calendar
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  toggleCalendarEventCompleted: (id: string) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  // Notifications
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Settings
  updateSettings: (updates: Partial<FamilySettings>) => Promise<void>;

  // Financial Metrics Selectors (Single Source of Truth)
  getTotalIncome: (month?: string) => number;
  getTotalExpenses: (month?: string) => number;
  getNetCashFlow: (month?: string) => number;
  getTotalGoalSavings: () => number;
  getAvailableBalance: () => number;
  getCategoryExpenseTotal: (category: string, month?: string) => number;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  activeTab: 'overview',
  isDarkMode: true,
  currency: 'UZS',
  selectedMonth: '2026-11',
  isMobileKeypadOpen: false,
  selectedCardId: 'card_1',
  searchQuery: '',
  isNotificationOpen: false,
  isQuickActionOpen: false,
  quickActionType: null,

  transactions: [],
  cards: [],
  services: [],
  budgets: [],
  goals: [],
  subscriptions: [],
  calendarEvents: [],
  notifications: [],
  members: [],
  settings: null,

  setActiveTab: (tab: string) => set({ activeTab: tab }),

  toggleDarkMode: () => {
    set((state) => {
      const next = !state.isDarkMode;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('baraka-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('baraka-theme', 'light');
      }
      return { isDarkMode: next };
    });
  },

  setCurrency: (currency: CurrencyCode) => set({ currency }),
  setSelectedMonth: (selectedMonth: string) => set({ selectedMonth }),
  setSelectedCardId: (selectedCardId: string) => set({ selectedCardId }),
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setIsNotificationOpen: (isNotificationOpen: boolean) => set({ isNotificationOpen }),
  setIsMobileKeypadOpen: (isMobileKeypadOpen: boolean) => set({ isMobileKeypadOpen }),

  openQuickAction: (type) => set({ isQuickActionOpen: true, quickActionType: type }),
  closeQuickAction: () => set({ isQuickActionOpen: false, quickActionType: null }),

  loadAllData: async () => {
    await initializeDatabase(false);

    const [
      transactions,
      cards,
      services,
      budgets,
      goals,
      subscriptions,
      calendarEvents,
      notifications,
      members,
      settingsArray,
    ] = await Promise.all([
      db.transactions.reverse().sortBy('date'),
      db.cards.toArray(),
      db.services.toArray(),
      db.budgets.toArray(),
      db.goals.toArray(),
      db.subscriptions.toArray(),
      db.calendarEvents.toArray(),
      db.notifications.reverse().sortBy('date'),
      db.members.toArray(),
      db.settings.toArray(),
    ]);

    const settings = settingsArray[0] || null;

    // Initialize theme from storage
    const savedTheme = localStorage.getItem('baraka-theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    set({
      transactions,
      cards,
      services,
      budgets,
      goals,
      subscriptions,
      calendarEvents,
      notifications,
      members,
      settings,
      isDarkMode: isDark,
      currency: settings?.primaryCurrency || 'UZS',
      selectedCardId: cards[0]?.id || '',
    });
  },

  resetToDemoData: async () => {
    await initializeDatabase(true);
    await get().loadAllData();
  },

  clearAllData: async () => {
    await db.transaction(
      'rw',
      [
        db.transactions,
        db.cards,
        db.services,
        db.budgets,
        db.goals,
        db.subscriptions,
        db.calendarEvents,
        db.notifications,
        db.members,
        db.settings,
      ],
      async () => {
        await db.transactions.clear();
        await db.cards.clear();
        await db.services.clear();
        await db.budgets.clear();
        await db.goals.clear();
        await db.subscriptions.clear();
        await db.calendarEvents.clear();
        await db.notifications.clear();
        await db.members.clear();
        await db.settings.clear();
      }
    );
    await get().loadAllData();
  },

  // Transactions
  addTransaction: async (txData) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    await db.transactions.add(newTx);

    // If card is linked and it is an expense, optionally adjust card balance
    if (newTx.cardId) {
      const card = await db.cards.get(newTx.cardId);
      if (card) {
        const balanceChange = newTx.type === 'income' ? newTx.amount : -newTx.amount;
        await db.cards.update(newTx.cardId, {
          balance: Math.max(0, card.balance + balanceChange),
        });
      }
    }

    await get().loadAllData();
    return newTx;
  },

  updateTransaction: async (id, updates) => {
    await db.transactions.update(id, updates);
    await get().loadAllData();
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    await get().loadAllData();
  },

  // Cards
  addCard: async (cardData) => {
    const newCard: PaymentCard = {
      ...cardData,
      id: `card_${Date.now()}`,
    };
    if (newCard.isDefault) {
      // unset other defaults
      const existing = await db.cards.toArray();
      for (const c of existing) {
        if (c.isDefault) await db.cards.update(c.id, { isDefault: false });
      }
    }
    await db.cards.add(newCard);
    await get().loadAllData();
    return newCard;
  },

  updateCard: async (id, updates) => {
    if (updates.isDefault) {
      const existing = await db.cards.toArray();
      for (const c of existing) {
        if (c.id !== id && c.isDefault) await db.cards.update(c.id, { isDefault: false });
      }
    }
    await db.cards.update(id, updates);
    await get().loadAllData();
  },

  deleteCard: async (id) => {
    await db.cards.delete(id);
    await get().loadAllData();
  },

  setDefaultCard: async (id) => {
    const cards = await db.cards.toArray();
    for (const c of cards) {
      await db.cards.update(c.id, { isDefault: c.id === id });
    }
    set({ selectedCardId: id });
    await get().loadAllData();
  },

  toggleCardLock: async (id) => {
    const card = await db.cards.get(id);
    if (card) {
      await db.cards.update(id, { isLocked: !card.isLocked });
      await get().loadAllData();
    }
  },

  toggleOnlinePayments: async (id) => {
    const card = await db.cards.get(id);
    if (card) {
      await db.cards.update(id, { onlinePayments: !card.onlinePayments });
      await get().loadAllData();
    }
  },

  toggleCashTransactions: async (id) => {
    const card = await db.cards.get(id);
    if (card) {
      await db.cards.update(id, { cashTransactions: !card.cashTransactions });
      await get().loadAllData();
    }
  },

  // Demo Payment
  executeDemoPayment: async (serviceId, cardId, amount) => {
    const service = await db.services.get(serviceId);
    if (!service) throw new Error('Service not found');

    const receiptId = `RCP-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    // Create linked expense transaction
    const newTx: Transaction = {
      id: `tx_pay_${Date.now()}`,
      title: `${service.name} toʻlovi (${service.providerName})`,
      amount,
      type: 'expense',
      category: 'utilities',
      date: today,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberId: get().members[0]?.id || 'mem_1',
      cardId,
      paymentMethod: 'card',
      description: `Abonent raqami: ${service.accountNumber}. Chek: ${receiptId}`,
      linkedPaymentId: serviceId,
      createdAt: Date.now(),
    };

    await db.transactions.add(newTx);

    // Update service status
    await db.services.update(serviceId, {
      status: 'paid',
      lastPaidDate: today,
    });

    // Update card balance
    const card = await db.cards.get(cardId);
    if (card) {
      await db.cards.update(cardId, {
        balance: Math.max(0, card.balance - amount),
      });
    }

    // Add in-app notification
    await db.notifications.add({
      id: `notif_${Date.now()}`,
      title: `Toʻlov muvaffaqiyatli bajarildi`,
      message: `${service.name} uchun ${amount.toLocaleString()} soʻm toʻlandi. Chek raqami: ${receiptId}`,
      date: today,
      type: 'success',
      isRead: false,
      pageLink: 'payments',
    });

    await get().loadAllData();
    return { receiptId, tx: newTx };
  },

  // Subscriptions
  addSubscription: async (subData) => {
    const newSub: Subscription = {
      ...subData,
      id: `sub_${Date.now()}`,
    };
    await db.subscriptions.add(newSub);
    await get().loadAllData();
    return newSub;
  },

  updateSubscription: async (id, updates) => {
    await db.subscriptions.update(id, updates);
    await get().loadAllData();
  },

  deleteSubscription: async (id) => {
    await db.subscriptions.delete(id);
    await get().loadAllData();
  },

  renewSubscriptionDemo: async (subId) => {
    const sub = await db.subscriptions.get(subId);
    if (!sub) return null;

    const today = new Date().toISOString().split('T')[0];

    // Check if already paid this month to prevent duplicates
    const currentMonth = today.slice(0, 7);
    const existingTx = await db.transactions
      .where('linkedSubscriptionId')
      .equals(subId)
      .toArray();

    const alreadyPaidThisMonth = existingTx.some((tx) => tx.date.startsWith(currentMonth));
    if (alreadyPaidThisMonth) {
      return null;
    }

    const newTx: Transaction = {
      id: `tx_sub_${Date.now()}`,
      title: `${sub.name} obunasi toʻlovi`,
      amount: sub.amount,
      type: 'expense',
      category: (sub.category as any) || 'entertainment',
      date: today,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberId: get().members[0]?.id || 'mem_1',
      cardId: sub.cardId,
      paymentMethod: 'card',
      description: `${sub.provider} servis obunasi yangilanishi`,
      linkedSubscriptionId: subId,
      createdAt: Date.now(),
    };

    await db.transactions.add(newTx);

    // Calculate next billing date (+ 1 month)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextBillingDate = nextDate.toISOString().split('T')[0];

    await db.subscriptions.update(subId, {
      lastPaidDate: today,
      nextBillingDate,
    });

    // Update card balance
    const card = await db.cards.get(sub.cardId);
    if (card) {
      await db.cards.update(sub.cardId, {
        balance: Math.max(0, card.balance - sub.amount),
      });
    }

    await get().loadAllData();
    return newTx;
  },

  // Budgets
  addBudget: async (budgetData) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `bud_${Date.now()}`,
    };
    await db.budgets.add(newBudget);
    await get().loadAllData();
    return newBudget;
  },

  updateBudget: async (id, updates) => {
    await db.budgets.update(id, updates);
    await get().loadAllData();
  },

  deleteBudget: async (id) => {
    await db.budgets.delete(id);
    await get().loadAllData();
  },

  // Goals
  addGoal: async (goalData) => {
    const newGoal: FamilyGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      currentAmount: 0,
      contributions: [],
      isCompleted: false,
    };
    await db.goals.add(newGoal);
    await get().loadAllData();
    return newGoal;
  },

  updateGoal: async (id, updates) => {
    await db.goals.update(id, updates);
    await get().loadAllData();
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id);
    await get().loadAllData();
  },

  contributeToGoal: async (goalId, amount, memberId, note) => {
    const goal = await db.goals.get(goalId);
    if (!goal) return;

    const contribution = {
      id: `c_${Date.now()}`,
      goalId,
      amount,
      date: new Date().toISOString().split('T')[0],
      memberId,
      type: 'deposit' as const,
      note: note || "Maqsad uchun qo'shildi",
      createdAt: Date.now(),
    };

    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount;

    await db.goals.update(goalId, {
      currentAmount: newAmount,
      isCompleted,
      contributions: [...(goal.contributions || []), contribution],
    });

    // Record timeline transfer (Internal Transfer - NOT income, NOT expense!)
    await db.transactions.add({
      id: `tx_goal_dep_${Date.now()}`,
      title: `Jamgʻarma: ${goal.title}`,
      amount,
      type: 'transfer',
      category: 'other',
      date: contribution.date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberId,
      paymentMethod: 'transfer',
      description: `Maqsad jamgʻarmasiga ichki oʻtkazma. ${note || ''}`,
      linkedGoalId: goalId,
      createdAt: Date.now(),
    });

    await get().loadAllData();
  },

  withdrawFromGoal: async (goalId, amount, memberId, note) => {
    const goal = await db.goals.get(goalId);
    if (!goal) return;

    const contribution = {
      id: `c_${Date.now()}`,
      goalId,
      amount,
      date: new Date().toISOString().split('T')[0],
      memberId,
      type: 'withdraw' as const,
      note: note || "Jamg'armadan yechib olindi",
      createdAt: Date.now(),
    };

    const newAmount = Math.max(0, goal.currentAmount - amount);

    await db.goals.update(goalId, {
      currentAmount: newAmount,
      isCompleted: false,
      contributions: [...(goal.contributions || []), contribution],
    });

    await db.transactions.add({
      id: `tx_goal_wth_${Date.now()}`,
      title: `Jamgʻarmadan yechish: ${goal.title}`,
      amount,
      type: 'transfer',
      category: 'other',
      date: contribution.date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberId,
      paymentMethod: 'transfer',
      description: `Maqsad jamgʻarmasidan mavjud mablagʻga qaytarildi. ${note || ''}`,
      linkedGoalId: goalId,
      createdAt: Date.now(),
    });

    await get().loadAllData();
  },

  // Members
  addMember: async (memberData) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: `mem_${Date.now()}`,
    };
    await db.members.add(newMember);
    await get().loadAllData();
    return newMember;
  },

  updateMember: async (id, updates) => {
    await db.members.update(id, updates);
    await get().loadAllData();
  },

  deleteMember: async (id) => {
    await db.members.delete(id);
    await get().loadAllData();
  },

  // Calendar
  addCalendarEvent: async (e) => {
    const newEvent: CalendarEvent = {
      ...e,
      id: `cal_${Date.now()}`,
    };
    await db.calendarEvents.add(newEvent);
    await get().loadAllData();
    return newEvent;
  },

  toggleCalendarEventCompleted: async (id) => {
    const ev = await db.calendarEvents.get(id);
    if (ev) {
      await db.calendarEvents.update(id, { isCompleted: !ev.isCompleted });
      await get().loadAllData();
    }
  },

  deleteCalendarEvent: async (id) => {
    await db.calendarEvents.delete(id);
    await get().loadAllData();
  },

  // Notifications
  markNotificationAsRead: async (id) => {
    await db.notifications.update(id, { isRead: true });
    await get().loadAllData();
  },

  markAllNotificationsAsRead: async () => {
    const notifs = await db.notifications.toArray();
    for (const n of notifs) {
      await db.notifications.update(n.id, { isRead: true });
    }
    await get().loadAllData();
  },

  // Settings
  updateSettings: async (updates) => {
    const settings = get().settings;
    if (settings) {
      await db.settings.update(settings.id, updates);
      await get().loadAllData();
    }
  },

  // --- SINGLE SOURCE OF TRUTH FINANCIAL METRICS ---
  getTotalIncome: (month) => {
    const txs = get().transactions;
    const targetMonth = month || get().selectedMonth;
    return txs
      .filter((t) => t.type === 'income' && (!targetMonth || t.date.startsWith(targetMonth)))
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalExpenses: (month) => {
    const txs = get().transactions;
    const targetMonth = month || get().selectedMonth;
    return txs
      .filter((t) => t.type === 'expense' && (!targetMonth || t.date.startsWith(targetMonth)))
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getNetCashFlow: (month) => {
    const income = get().getTotalIncome(month);
    const expenses = get().getTotalExpenses(month);
    return income - expenses;
  },

  getTotalGoalSavings: () => {
    const goals = get().goals;
    return goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  },

  getAvailableBalance: () => {
    // Sum of all active cards' balances
    const cards = get().cards;
    const cardTotal = cards.reduce((sum, c) => sum + (c.isLocked ? 0 : c.balance), 0);
    return cardTotal;
  },

  getCategoryExpenseTotal: (category, month) => {
    const txs = get().transactions;
    const targetMonth = month || get().selectedMonth;
    return txs
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category === category &&
          (!targetMonth || t.date.startsWith(targetMonth))
      )
      .reduce((sum, t) => sum + t.amount, 0);
  },
}));
