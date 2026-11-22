import {
  UserAccount,
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

const ACCOUNTS_KEY = 'baraka:accounts:v1';
const SESSION_KEY = 'baraka:session:v1';
const LAST_ACCOUNT_KEY = 'baraka:last_account_id';

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err: any) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      alert('Brauzer xotirasi (LocalStorage) toʻldi! Iltimos, eski maʼlumotlarni tozalang yoki eksport qiling.');
    }
    console.error(`Error writing ${key} to localStorage:`, err);
    return false;
  }
}

export const storageService = {
  // Accounts
  getAccounts(): UserAccount[] {
    return getStorageItem<UserAccount[]>(ACCOUNTS_KEY, []);
  },

  saveAccount(account: UserAccount): boolean {
    const accounts = this.getAccounts();
    const existingIdx = accounts.findIndex((a) => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase());
    if (existingIdx >= 0) {
      accounts[existingIdx] = account;
    } else {
      accounts.push(account);
    }
    return setStorageItem(ACCOUNTS_KEY, accounts);
  },

  findAccountByEmail(email: string): UserAccount | undefined {
    const accounts = this.getAccounts();
    return accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  },

  findAccountById(id: string): UserAccount | undefined {
    const accounts = this.getAccounts();
    return accounts.find((a) => a.id === id);
  },

  updateAccountPassword(userId: string, newHash: string, newSalt: string): boolean {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx === -1) return false;
    accounts[idx].passwordHash = newHash;
    accounts[idx].salt = newSalt;
    return setStorageItem(ACCOUNTS_KEY, accounts);
  },

  // Last Selected Local Account for Password-Only Entry
  getLastAccountId(): string | null {
    return localStorage.getItem(LAST_ACCOUNT_KEY);
  },

  setLastAccountId(userId: string): void {
    try {
      localStorage.setItem(LAST_ACCOUNT_KEY, userId);
    } catch (e) {
      console.error('Failed to save last account ID', e);
    }
  },

  clearLastAccountId(): void {
    localStorage.removeItem(LAST_ACCOUNT_KEY);
  },

  // Session
  getSession(): UserSession | null {
    return getStorageItem<UserSession | null>(SESSION_KEY, null);
  },

  setSession(session: UserSession): boolean {
    return setStorageItem(SESSION_KEY, session);
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  // User Profile
  getUserProfile(userId: string): UserProfile | null {
    return getStorageItem<UserProfile | null>(`baraka:user:${userId}:profile`, null);
  },

  setUserProfile(userId: string, profile: UserProfile): boolean {
    return setStorageItem(`baraka:user:${userId}:profile`, profile);
  },

  // Generic User Collections
  getUserCollection<T>(userId: string, collection: string, defaultValue: T[] = []): T[] {
    return getStorageItem<T[]>(`baraka:user:${userId}:${collection}`, defaultValue);
  },

  setUserCollection<T>(userId: string, collection: string, items: T[]): boolean {
    return setStorageItem(`baraka:user:${userId}:${collection}`, items);
  },

  // Specific collection helpers
  getTransactions(userId: string): Transaction[] {
    return this.getUserCollection<Transaction>(userId, 'transactions', []);
  },
  setTransactions(userId: string, txs: Transaction[]): boolean {
    return this.setUserCollection(userId, 'transactions', txs);
  },

  getCards(userId: string): PaymentCard[] {
    return this.getUserCollection<PaymentCard>(userId, 'cards', []);
  },
  setCards(userId: string, cards: PaymentCard[]): boolean {
    return this.setUserCollection(userId, 'cards', cards);
  },

  getServices(userId: string): UtilityService[] {
    return this.getUserCollection<UtilityService>(userId, 'payments', []);
  },
  setServices(userId: string, services: UtilityService[]): boolean {
    return this.setUserCollection(userId, 'payments', services);
  },

  getBudgets(userId: string): Budget[] {
    return this.getUserCollection<Budget>(userId, 'budgets', []);
  },
  setBudgets(userId: string, budgets: Budget[]): boolean {
    return this.setUserCollection(userId, 'budgets', budgets);
  },

  getGoals(userId: string): FamilyGoal[] {
    return this.getUserCollection<FamilyGoal>(userId, 'goals', []);
  },
  setGoals(userId: string, goals: FamilyGoal[]): boolean {
    return this.setUserCollection(userId, 'goals', goals);
  },

  getSubscriptions(userId: string): Subscription[] {
    return this.getUserCollection<Subscription>(userId, 'subscriptions', []);
  },
  setSubscriptions(userId: string, subs: Subscription[]): boolean {
    return this.setUserCollection(userId, 'subscriptions', subs);
  },

  getCalendar(userId: string): CalendarEvent[] {
    return this.getUserCollection<CalendarEvent>(userId, 'calendar', []);
  },
  setCalendar(userId: string, events: CalendarEvent[]): boolean {
    return this.setUserCollection(userId, 'calendar', events);
  },

  getFamilyMembers(userId: string): FamilyMember[] {
    return this.getUserCollection<FamilyMember>(userId, 'family', []);
  },
  setFamilyMembers(userId: string, members: FamilyMember[]): boolean {
    return this.setUserCollection(userId, 'family', members);
  },

  getNotifications(userId: string): AppNotification[] {
    return this.getUserCollection<AppNotification>(userId, 'notifications', []);
  },
  setNotifications(userId: string, notifs: AppNotification[]): boolean {
    return this.setUserCollection(userId, 'notifications', notifs);
  },

  // Delete User Account and all data
  deleteUserAccount(userId: string): void {
    // Remove from accounts
    const accounts = this.getAccounts().filter((a) => a.id !== userId);
    setStorageItem(ACCOUNTS_KEY, accounts);

    // Clear session if active
    const session = this.getSession();
    if (session?.userId === userId) {
      this.clearSession();
    }

    if (this.getLastAccountId() === userId) {
      this.clearLastAccountId();
    }

    // Remove all user keys
    const userKeys = [
      `baraka:user:${userId}:profile`,
      `baraka:user:${userId}:transactions`,
      `baraka:user:${userId}:cards`,
      `baraka:user:${userId}:payments`,
      `baraka:user:${userId}:budgets`,
      `baraka:user:${userId}:goals`,
      `baraka:user:${userId}:subscriptions`,
      `baraka:user:${userId}:calendar`,
      `baraka:user:${userId}:family`,
      `baraka:user:${userId}:notifications`,
    ];

    userKeys.forEach((key) => localStorage.removeItem(key));
  },

  // Export & Import
  exportUserData(userId: string) {
    return {
      version: 1,
      appName: 'BARAKA FinTech',
      exportedAt: new Date().toISOString(),
      userId,
      profile: this.getUserProfile(userId),
      transactions: this.getTransactions(userId),
      cards: this.getCards(userId),
      services: this.getServices(userId),
      budgets: this.getBudgets(userId),
      goals: this.getGoals(userId),
      subscriptions: this.getSubscriptions(userId),
      calendar: this.getCalendar(userId),
      family: this.getFamilyMembers(userId),
      notifications: this.getNotifications(userId),
    };
  },

  importUserData(userId: string, data: any): boolean {
    if (!data) return false;
    if (data.profile) this.setUserProfile(userId, { ...data.profile, id: userId });
    if (data.transactions) this.setTransactions(userId, data.transactions);
    if (data.cards) this.setCards(userId, data.cards);
    if (data.services) this.setServices(userId, data.services);
    if (data.budgets) this.setBudgets(userId, data.budgets);
    if (data.goals) this.setGoals(userId, data.goals);
    if (data.subscriptions) this.setSubscriptions(userId, data.subscriptions);
    if (data.calendar) this.setCalendar(userId, data.calendar);
    if (data.family) this.setFamilyMembers(userId, data.family);
    if (data.notifications) this.setNotifications(userId, data.notifications);
    return true;
  },
};
