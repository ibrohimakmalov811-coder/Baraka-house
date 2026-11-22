import { create } from 'zustand';
import {
  CurrencyCode,
  UserProfile,
  UserSession,
  Transaction,
  PaymentCard,
  UtilityService,
  Budget,
  FamilyGoal,
  Subscription,
  CalendarEvent,
  AppNotification,
  FamilyMember,
} from '../types';
import { storageService } from '../services/storageService';
import { hashPassword, verifyPassword } from '../utils/crypto';

interface FinanceState {
  // Auth & Session
  currentUser: UserProfile | null;
  session: UserSession | null;
  isAuthLoading: boolean;

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
  quickActionType: 'income' | 'expense' | 'transfer' | 'goal' | 'card' | 'service' | null;

  // Active User Collections
  settings: { familyName: string; primaryCurrency: CurrencyCode };
  transactions: Transaction[];
  cards: PaymentCard[];
  services: UtilityService[];
  budgets: Budget[];
  goals: FamilyGoal[];
  subscriptions: Subscription[];
  calendarEvents: CalendarEvent[];
  notifications: AppNotification[];
  members: FamilyMember[];

  // Auth Actions
  initAuthAndData: () => Promise<void>;
  register: (fullName: string, email: string, password: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteCurrentAccount: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateAvatar: (avatarDataUrl: string) => void;

  // UI Actions
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
  setCurrency: (c: CurrencyCode) => void;
  setSelectedMonth: (month: string) => void;
  setSelectedCardId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setIsNotificationOpen: (open: boolean) => void;
  setIsMobileKeypadOpen: (open: boolean) => void;
  openQuickAction: (type: 'income' | 'expense' | 'transfer' | 'goal' | 'card' | 'service') => void;
  closeQuickAction: () => void;

  // Data Actions (Persistent per user)
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addCard: (card: Omit<PaymentCard, 'id'>) => Promise<PaymentCard>;
  updateCard: (id: string, updates: Partial<PaymentCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<void>;
  toggleCardLock: (id: string) => Promise<void>;
  toggleOnlinePayments: (id: string) => Promise<void>;
  toggleCashTransactions: (id: string) => Promise<void>;

  addService: (srv: Omit<UtilityService, 'id'>) => Promise<UtilityService>;
  updateService: (id: string, updates: Partial<UtilityService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  executeDemoPayment: (serviceId: string, cardId: string, amount: number) => Promise<{ receiptId: string; tx: Transaction }>;

  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<Subscription>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  renewSubscriptionDemo: (subId: string) => Promise<Transaction | null>;

  addBudget: (b: Omit<Budget, 'id'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  addGoal: (g: Omit<FamilyGoal, 'id' | 'currentAmount' | 'contributions' | 'isCompleted'>) => Promise<FamilyGoal>;
  updateGoal: (id: string, updates: Partial<FamilyGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, memberId: string, note?: string) => Promise<void>;
  withdrawFromGoal: (goalId: string, amount: number, memberId: string, note?: string) => Promise<void>;

  addMember: (m: Omit<FamilyMember, 'id'>) => Promise<FamilyMember>;
  updateMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  toggleCalendarEventCompleted: (id: string) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Settings & Data Management
  updateSettings: (updates: Partial<{ familyName: string; primaryCurrency: CurrencyCode }>) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  loadAllData: () => Promise<void>;

  // Financial Metrics Selectors (Single Source of Truth)
  getTotalIncome: (month?: string) => number;
  getTotalExpenses: (month?: string) => number;
  getNetCashFlow: (month?: string) => number;
  getTotalGoalSavings: () => number;
  getAvailableBalance: () => number;
  getCategoryExpenseTotal: (category: string, month?: string) => number;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  currentUser: null,
  session: null,
  isAuthLoading: true,

  activeTab: 'overview',
  isDarkMode: true,
  currency: 'UZS',
  selectedMonth: '2026-11',
  isMobileKeypadOpen: false,
  selectedCardId: '',
  searchQuery: '',
  isNotificationOpen: false,
  isQuickActionOpen: false,
  quickActionType: null,

  settings: {
    familyName: 'Rahimovlar Oilasi',
    primaryCurrency: 'UZS',
  },
  transactions: [],
  cards: [],
  services: [],
  budgets: [],
  goals: [],
  subscriptions: [],
  calendarEvents: [],
  notifications: [],
  members: [],

  initAuthAndData: async () => {
    // Check saved theme
    const savedTheme = localStorage.getItem('baraka-theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check active session
    const session = storageService.getSession();
    if (session && session.userId) {
      const profile = storageService.getUserProfile(session.userId);
      if (profile) {
        // Load user data
        const uid = session.userId;
        const transactions = storageService.getTransactions(uid);
        const cards = storageService.getCards(uid);
        const services = storageService.getServices(uid);
        const budgets = storageService.getBudgets(uid);
        const goals = storageService.getGoals(uid);
        const subscriptions = storageService.getSubscriptions(uid);
        const calendarEvents = storageService.getCalendar(uid);
        const notifications = storageService.getNotifications(uid);
        const members = storageService.getFamilyMembers(uid);

        set({
          currentUser: profile,
          session,
          currency: profile.primaryCurrency || 'UZS',
          transactions,
          cards,
          services,
          budgets,
          goals,
          subscriptions,
          calendarEvents,
          notifications,
          members,
          selectedCardId: cards[0]?.id || '',
          isDarkMode: isDark,
          isAuthLoading: false,
        });
        return;
      }
    }

    set({ currentUser: null, session: null, isAuthLoading: false, isDarkMode: isDark });
  },

  register: async (fullName, email, password, avatar) => {
    const existing = storageService.findAccountByEmail(email);
    if (existing) {
      return { success: false, error: 'Ushbu email bilan avval roʻyxatdan oʻtilgan.' };
    }

    const { hash, salt } = await hashPassword(password);
    const userId = `usr_${Date.now()}`;

    const newAccount = {
      id: userId,
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      createdAt: Date.now(),
    };

    const newProfile: UserProfile = {
      id: userId,
      fullName: fullName.trim(),
      displayName: fullName.trim().split(' ')[0],
      email: email.trim().toLowerCase(),
      avatar: avatar || undefined,
      primaryCurrency: 'UZS',
      language: 'uz',
      createdAt: Date.now(),
    };

    const newSession: UserSession = {
      userId,
      token: `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      loggedInAt: Date.now(),
    };

    // Owner member for family space
    const ownerMember: FamilyMember = {
      id: `mem_owner_${userId}`,
      userId,
      name: fullName.trim(),
      role: 'parent_father',
      roleTitle: 'Hisob egasi',
      avatar: avatar || '',
      color: '#3B82F6',
      isOwner: true,
    };

    storageService.saveAccount(newAccount);
    storageService.setUserProfile(userId, newProfile);
    storageService.setSession(newSession);

    // BRAND-NEW ACCOUNT STARTS 100% EMPTY!
    storageService.setTransactions(userId, []);
    storageService.setCards(userId, []);
    storageService.setServices(userId, []);
    storageService.setBudgets(userId, []);
    storageService.setGoals(userId, []);
    storageService.setSubscriptions(userId, []);
    storageService.setCalendar(userId, []);
    storageService.setNotifications(userId, []);
    storageService.setFamilyMembers(userId, [ownerMember]);

    set({
      currentUser: newProfile,
      session: newSession,
      currency: 'UZS',
      settings: {
    familyName: 'Rahimovlar Oilasi',
    primaryCurrency: 'UZS',
  },
  transactions: [],
      cards: [],
      services: [],
      budgets: [],
      goals: [],
      subscriptions: [],
      calendarEvents: [],
      notifications: [],
      members: [ownerMember],
      selectedCardId: '',
      activeTab: 'overview',
    });

    return { success: true };
  },

  login: async (email, password) => {
    const account = storageService.findAccountByEmail(email);
    if (!account) {
      return { success: false, error: 'Bunday email mavjud emas yoki parol notoʻgʻri.' };
    }

    const isValid = await verifyPassword(password, account.passwordHash, account.salt);
    if (!isValid) {
      return { success: false, error: 'Email yoki parol notoʻgʻri kiritildi.' };
    }

    const profile = storageService.getUserProfile(account.id);
    if (!profile) {
      return { success: false, error: 'Profil maʼlumotlari topilmadi.' };
    }

    const newSession: UserSession = {
      userId: account.id,
      token: `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      loggedInAt: Date.now(),
    };

    storageService.setSession(newSession);

    // Load ONLY this user's data
    const uid = account.id;
    const transactions = storageService.getTransactions(uid);
    const cards = storageService.getCards(uid);
    const services = storageService.getServices(uid);
    const budgets = storageService.getBudgets(uid);
    const goals = storageService.getGoals(uid);
    const subscriptions = storageService.getSubscriptions(uid);
    const calendarEvents = storageService.getCalendar(uid);
    const notifications = storageService.getNotifications(uid);
    const members = storageService.getFamilyMembers(uid);

    set({
      currentUser: profile,
      session: newSession,
      currency: profile.primaryCurrency || 'UZS',
      transactions,
      cards,
      services,
      budgets,
      goals,
      subscriptions,
      calendarEvents,
      notifications,
      members,
      selectedCardId: cards[0]?.id || '',
      activeTab: 'overview',
    });

    return { success: true };
  },

  logout: () => {
    storageService.clearSession();
    set({
      currentUser: null,
      session: null,
      settings: {
    familyName: 'Rahimovlar Oilasi',
    primaryCurrency: 'UZS',
  },
  transactions: [],
      cards: [],
      services: [],
      budgets: [],
      goals: [],
      subscriptions: [],
      calendarEvents: [],
      notifications: [],
      members: [],
      selectedCardId: '',
      activeTab: 'overview',
    });
  },

  deleteCurrentAccount: () => {
    const user = get().currentUser;
    if (user) {
      storageService.deleteUserAccount(user.id);
      get().logout();
    }
  },

  updateProfile: (updates) => {
    const user = get().currentUser;
    if (!user) return;

    const updated: UserProfile = { ...user, ...updates };
    storageService.setUserProfile(user.id, updated);

    // Also update owner member if name or avatar changed
    const members = get().members.map((m) => {
      if (m.isOwner || m.userId === user.id) {
        return {
          ...m,
          name: updated.fullName,
          avatar: updated.avatar || m.avatar,
        };
      }
      return m;
    });
    storageService.setFamilyMembers(user.id, members);

    set({ currentUser: updated, members });
  },

  updateAvatar: (avatarDataUrl) => {
    get().updateProfile({ avatar: avatarDataUrl });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

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

  setCurrency: (currency) => {
    set({ currency });
    const user = get().currentUser;
    if (user) {
      get().updateProfile({ primaryCurrency: currency });
    }
  },

  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedCardId: (selectedCardId) => set({ selectedCardId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsNotificationOpen: (isNotificationOpen) => set({ isNotificationOpen }),
  setIsMobileKeypadOpen: (isMobileKeypadOpen) => set({ isMobileKeypadOpen }),

  openQuickAction: (type) => set({ isQuickActionOpen: true, quickActionType: type }),
  closeQuickAction: () => set({ isQuickActionOpen: false, quickActionType: null }),

  // Transactions
  addTransaction: async (txData) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      createdAt: Date.now(),
    };

    const currentTxs = storageService.getTransactions(user.id);
    const updatedTxs = [newTx, ...currentTxs];
    storageService.setTransactions(user.id, updatedTxs);

    // Adjust card balance if linked
    if (newTx.cardId) {
      const cards = storageService.getCards(user.id);
      const card = cards.find((c) => c.id === newTx.cardId);
      if (card) {
        const balanceChange = newTx.type === 'income' ? newTx.amount : -newTx.amount;
        card.balance = Math.max(0, card.balance + balanceChange);
        storageService.setCards(user.id, cards);
      }
    }

    set({
      transactions: updatedTxs,
      cards: storageService.getCards(user.id),
    });

    return newTx;
  },

  updateTransaction: async (id, updates) => {
    const user = get().currentUser;
    if (!user) return;

    const txs = storageService.getTransactions(user.id).map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    storageService.setTransactions(user.id, txs);
    set({ transactions: txs });
  },

  deleteTransaction: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const txs = storageService.getTransactions(user.id).filter((t) => t.id !== id);
    storageService.setTransactions(user.id, txs);
    set({ transactions: txs });
  },

  // Cards
  addCard: async (cardData) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const cards = storageService.getCards(user.id);
    const newCard: PaymentCard = {
      ...cardData,
      id: `card_${Date.now()}`,
      userId: user.id,
      isDefault: cards.length === 0 ? true : cardData.isDefault,
    };

    if (newCard.isDefault) {
      cards.forEach((c) => (c.isDefault = false));
    }

    const updatedCards = [...cards, newCard];
    storageService.setCards(user.id, updatedCards);

    set({
      cards: updatedCards,
      selectedCardId: updatedCards.length === 1 ? newCard.id : get().selectedCardId || newCard.id,
    });

    return newCard;
  },

  updateCard: async (id, updates) => {
    const user = get().currentUser;
    if (!user) return;

    const cards = storageService.getCards(user.id);
    if (updates.isDefault) {
      cards.forEach((c) => (c.isDefault = c.id === id));
    }

    const updatedCards = cards.map((c) => (c.id === id ? { ...c, ...updates } : c));
    storageService.setCards(user.id, updatedCards);
    set({ cards: updatedCards });
  },

  deleteCard: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const cards = storageService.getCards(user.id).filter((c) => c.id !== id);
    storageService.setCards(user.id, cards);
    set({
      cards,
      selectedCardId: cards[0]?.id || '',
    });
  },

  setDefaultCard: async (id) => {
    await get().updateCard(id, { isDefault: true });
    set({ selectedCardId: id });
  },

  toggleCardLock: async (id) => {
    const card = get().cards.find((c) => c.id === id);
    if (card) {
      await get().updateCard(id, { isLocked: !card.isLocked });
    }
  },

  toggleOnlinePayments: async (id) => {
    const card = get().cards.find((c) => c.id === id);
    if (card) {
      await get().updateCard(id, { onlinePayments: !card.onlinePayments });
    }
  },

  toggleCashTransactions: async (id) => {
    const card = get().cards.find((c) => c.id === id);
    if (card) {
      await get().updateCard(id, { cashTransactions: !card.cashTransactions });
    }
  },

  // Services
  addService: async (srvData) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const services = storageService.getServices(user.id);
    const newSrv: UtilityService = {
      ...srvData,
      id: `srv_${Date.now()}`,
      userId: user.id,
    };

    const updated = [...services, newSrv];
    storageService.setServices(user.id, updated);
    set({ services: updated });
    return newSrv;
  },

  updateService: async (id, updates) => {
    const user = get().currentUser;
    if (!user) return;

    const services = storageService.getServices(user.id).map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    storageService.setServices(user.id, services);
    set({ services });
  },

  deleteService: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const services = storageService.getServices(user.id).filter((s) => s.id !== id);
    storageService.setServices(user.id, services);
    set({ services });
  },

  // Demo Payment
  executeDemoPayment: async (serviceId, cardId, amount) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const service = get().services.find((s) => s.id === serviceId);
    if (!service) throw new Error('Service not found');

    const receiptId = `RCP-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    const newTx: Transaction = {
      id: `tx_pay_${Date.now()}`,
      userId: user.id,
      title: `${service.name} toʻlovi (${service.providerName})`,
      amount,
      type: 'expense',
      category: 'utilities',
      date: today,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberId: get().members[0]?.id || `mem_owner_${user.id}`,
      cardId,
      paymentMethod: 'card',
      description: `Abonent raqami: ${service.accountNumber}. Chek: ${receiptId}`,
      linkedPaymentId: serviceId,
      createdAt: Date.now(),
    };

    // Save transaction
    const txs = [newTx, ...storageService.getTransactions(user.id)];
    storageService.setTransactions(user.id, txs);

    // Update service
    const services = storageService.getServices(user.id).map((s) =>
      s.id === serviceId ? { ...s, status: 'paid' as const, lastPaidDate: today } : s
    );
    storageService.setServices(user.id, services);

    // Update card balance
    const cards = storageService.getCards(user.id).map((c) =>
      c.id === cardId ? { ...c, balance: Math.max(0, c.balance - amount) } : c
    );
    storageService.setCards(user.id, cards);

    // Notification
    const notifs = [
      {
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: 'Toʻlov muvaffaqiyatli bajarildi',
        message: `${service.name} uchun ${amount.toLocaleString()} soʻm toʻlandi. Chek raqami: ${receiptId}`,
        date: today,
        type: 'success' as const,
        isRead: false,
        pageLink: 'payments',
      },
      ...storageService.getNotifications(user.id),
    ];
    storageService.setNotifications(user.id, notifs);

    set({
      transactions: txs,
      services,
      cards,
      notifications: notifs,
    });

    return { receiptId, tx: newTx };
  },

  // Subscriptions
  addSubscription: async (subData) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const subs = storageService.getSubscriptions(user.id);
    const newSub: Subscription = {
      ...subData,
      id: `sub_${Date.now()}`,
      userId: user.id,
    };

    const updated = [...subs, newSub];
    storageService.setSubscriptions(user.id, updated);
    set({ subscriptions: updated });
    return newSub;
  },

  updateSubscription: async (id, updates) => {
    const user = get().currentUser;
    if (!user) return;

    const subs = storageService.getSubscriptions(user.id).map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    storageService.setSubscriptions(user.id, subs);
    set({ subscriptions: subs });
  },

  deleteSubscription: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const subs = storageService.getSubscriptions(user.id).filter((s) => s.id !== id);
    storageService.setSubscriptions(user.id, subs);
    set({ subscriptions: subs });
  },

  renewSubscriptionDemo: async (subId) => {
    const user = get().currentUser;
    if (!user) return null;

    const sub = get().subscriptions.find((s) => s.id === subId);
    if (!sub) return null;

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);

    // Duplicate prevention
    const txs = storageService.getTransactions(user.id);
    const alreadyPaidThisMonth = txs.some(
      (t) => t.linkedSubscriptionId === subId && t.date.startsWith(currentMonth)
    );
    if (alreadyPaidThisMonth) return null;

    const newTx: Transaction = {
      id: `tx_sub_${Date.now()}`,
      userId: user.id,
      title: `${sub.name} obunasi toʻlovi`,
      amount: sub.amount,
      type: 'expense',
      category: (sub.category as any) || 'entertainment',
      date: today,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberId: get().members[0]?.id || `mem_owner_${user.id}`,
      cardId: sub.cardId,
      paymentMethod: 'card',
      description: `${sub.provider} servis obunasi yangilanishi`,
      linkedSubscriptionId: subId,
      createdAt: Date.now(),
    };

    const updatedTxs = [newTx, ...txs];
    storageService.setTransactions(user.id, updatedTxs);

    // Next billing date
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextBillingDate = nextDate.toISOString().split('T')[0];

    const updatedSubs = storageService.getSubscriptions(user.id).map((s) =>
      s.id === subId ? { ...s, lastPaidDate: today, nextBillingDate } : s
    );
    storageService.setSubscriptions(user.id, updatedSubs);

    // Card balance deduction
    if (sub.cardId) {
      const cards = storageService.getCards(user.id).map((c) =>
        c.id === sub.cardId ? { ...c, balance: Math.max(0, c.balance - sub.amount) } : c
      );
      storageService.setCards(user.id, cards);
      set({ cards });
    }

    set({
      transactions: updatedTxs,
      subscriptions: updatedSubs,
    });

    return newTx;
  },

  // Budgets
  addBudget: async (budgetData) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const budgets = storageService.getBudgets(user.id);
    const newBudget: Budget = {
      ...budgetData,
      id: `bud_${Date.now()}`,
      userId: user.id,
    };

    const updated = [...budgets, newBudget];
    storageService.setBudgets(user.id, updated);
    set({ budgets: updated });
    return newBudget;
  },

  updateBudget: async (id, updates) => {
    const user = get().currentUser;
    if (!user) return;

    const budgets = storageService.getBudgets(user.id).map((b) =>
      b.id === id ? { ...b, ...updates } : b
    );
    storageService.setBudgets(user.id, budgets);
    set({ budgets });
  },

  deleteBudget: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const budgets = storageService.getBudgets(user.id).filter((b) => b.id !== id);
    storageService.setBudgets(user.id, budgets);
    set({ budgets });
  },

  // Goals
  addGoal: async (goalData) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const goals = storageService.getGoals(user.id);
    const newGoal: FamilyGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      userId: user.id,
      currentAmount: 0,
      contributions: [],
      isCompleted: false,
    };

    const updated = [...goals, newGoal];
    storageService.setGoals(user.id, updated);
    set({ goals: updated });
    return newGoal;
  },

  updateGoal: async (id, updates) => {
    const user = get().currentUser;
    if (!user) return;

    const goals = storageService.getGoals(user.id).map((g) =>
      g.id === id ? { ...g, ...updates } : g
    );
    storageService.setGoals(user.id, goals);
    set({ goals });
  },

  deleteGoal: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const goals = storageService.getGoals(user.id).filter((g) => g.id !== id);
    storageService.setGoals(user.id, goals);
    set({ goals });
  },

  contributeToGoal: async (goalId, amount, memberId, note) => {
    const user = get().currentUser;
    if (!user) return;

    const goals = storageService.getGoals(user.id);
    const goal = goals.find((g) => g.id === goalId);
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

    goal.currentAmount = newAmount;
    goal.isCompleted = isCompleted;
    goal.contributions = [...(goal.contributions || []), contribution];

    storageService.setGoals(user.id, goals);

    // Record internal transfer transaction
    const newTx: Transaction = {
      id: `tx_goal_dep_${Date.now()}`,
      userId: user.id,
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
    };

    const txs = [newTx, ...storageService.getTransactions(user.id)];
    storageService.setTransactions(user.id, txs);

    set({ goals, transactions: txs });
  },

  withdrawFromGoal: async (goalId, amount, memberId, note) => {
    const user = get().currentUser;
    if (!user) return;

    const goals = storageService.getGoals(user.id);
    const goal = goals.find((g) => g.id === goalId);
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

    goal.currentAmount = Math.max(0, goal.currentAmount - amount);
    goal.isCompleted = false;
    goal.contributions = [...(goal.contributions || []), contribution];

    storageService.setGoals(user.id, goals);

    const newTx: Transaction = {
      id: `tx_goal_wth_${Date.now()}`,
      userId: user.id,
      title: `Jamgʻarmadan yechish: ${goal.title}`,
      amount,
      type: 'transfer',
      category: 'other',
      date: contribution.date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberId,
      paymentMethod: 'transfer',
      description: `Maqsad jamgʻarmasidan mablagʻ qaytarildi. ${note || ''}`,
      linkedGoalId: goalId,
      createdAt: Date.now(),
    };

    const txs = [newTx, ...storageService.getTransactions(user.id)];
    storageService.setTransactions(user.id, txs);

    set({ goals, transactions: txs });
  },

  // Members
  addMember: async (memberData) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const members = storageService.getFamilyMembers(user.id);
    const newMember: FamilyMember = {
      ...memberData,
      id: `mem_${Date.now()}`,
      userId: user.id,
    };

    const updated = [...members, newMember];
    storageService.setFamilyMembers(user.id, updated);
    set({ members: updated });
    return newMember;
  },

  updateMember: async (id, updates) => {
    const user = get().currentUser;
    if (!user) return;

    const members = storageService.getFamilyMembers(user.id).map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    storageService.setFamilyMembers(user.id, members);
    set({ members });
  },

  deleteMember: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const members = storageService.getFamilyMembers(user.id).filter((m) => m.id !== id);
    storageService.setFamilyMembers(user.id, members);
    set({ members });
  },

  // Calendar
  addCalendarEvent: async (e) => {
    const user = get().currentUser;
    if (!user) throw new Error('No user session');

    const events = storageService.getCalendar(user.id);
    const newEvent: CalendarEvent = {
      ...e,
      id: `cal_${Date.now()}`,
      userId: user.id,
    };

    const updated = [...events, newEvent];
    storageService.setCalendar(user.id, updated);
    set({ calendarEvents: updated });
    return newEvent;
  },

  toggleCalendarEventCompleted: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const events = storageService.getCalendar(user.id).map((ev) =>
      ev.id === id ? { ...ev, isCompleted: !ev.isCompleted } : ev
    );
    storageService.setCalendar(user.id, events);
    set({ calendarEvents: events });
  },

  deleteCalendarEvent: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const events = storageService.getCalendar(user.id).filter((ev) => ev.id !== id);
    storageService.setCalendar(user.id, events);
    set({ calendarEvents: events });
  },

  // Notifications
  markNotificationAsRead: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    const notifs = storageService.getNotifications(user.id).map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    storageService.setNotifications(user.id, notifs);
    set({ notifications: notifs });
  },

  markAllNotificationsAsRead: async () => {
    const user = get().currentUser;
    if (!user) return;

    const notifs = storageService.getNotifications(user.id).map((n) => ({ ...n, isRead: true }));
    storageService.setNotifications(user.id, notifs);
    set({ notifications: notifs });
  },

  updateSettings: async (updates) => {
    const current = get().settings;
    const next = { ...current, ...updates };
    set({ settings: next });
    if (updates.primaryCurrency) {
      set({ currency: updates.primaryCurrency });
      const user = get().currentUser;
      if (user) {
        storageService.setUserProfile(user.id, { ...user, primaryCurrency: updates.primaryCurrency });
      }
    }
  },

  resetToDemoData: async () => {
    const user = get().currentUser;
    if (!user) return;
    // Clear user data to clean slate
    storageService.setTransactions(user.id, []);
    storageService.setCards(user.id, []);
    storageService.setServices(user.id, []);
    storageService.setBudgets(user.id, []);
    storageService.setGoals(user.id, []);
    storageService.setSubscriptions(user.id, []);
    storageService.setCalendar(user.id, []);
    storageService.setNotifications(user.id, []);
    set({
      transactions: [],
      cards: [],
      services: [],
      budgets: [],
      goals: [],
      subscriptions: [],
      calendarEvents: [],
      notifications: [],
      selectedCardId: '',
    });
  },

  clearAllData: async () => {
    const user = get().currentUser;
    if (!user) return;
    storageService.setTransactions(user.id, []);
    storageService.setCards(user.id, []);
    storageService.setServices(user.id, []);
    storageService.setBudgets(user.id, []);
    storageService.setGoals(user.id, []);
    storageService.setSubscriptions(user.id, []);
    storageService.setCalendar(user.id, []);
    storageService.setNotifications(user.id, []);
    set({
      transactions: [],
      cards: [],
      services: [],
      budgets: [],
      goals: [],
      subscriptions: [],
      calendarEvents: [],
      notifications: [],
      selectedCardId: '',
    });
  },

  loadAllData: async () => {
    await get().initAuthAndData();
  },

  // --- FINANCIAL ENGINE (SINGLE SOURCE OF TRUTH) ---
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
    const cards = get().cards;
    return cards.reduce((sum, c) => sum + (c.isLocked ? 0 : c.balance), 0);
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
