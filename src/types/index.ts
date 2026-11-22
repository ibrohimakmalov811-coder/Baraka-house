export type CurrencyCode = 'UZS' | 'USD' | 'EUR';
export type AppLanguage = 'uz' | 'en';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionCategory =
  | 'salary'
  | 'business'
  | 'investment'
  | 'gift'
  | 'utilities'
  | 'groceries'
  | 'transportation'
  | 'education'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'housing'
  | 'dining'
  | 'travel'
  | 'other';

export type PaymentMethod = 'card' | 'cash' | 'transfer';

export type CardType = 'uzcard' | 'humo' | 'visa' | 'mastercard' | 'other';

export type FamilyRole = 'parent_father' | 'parent_mother' | 'child' | 'other';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  avatar?: string;
  primaryCurrency: CurrencyCode;
  language: AppLanguage;
  createdAt: number;
}

export interface UserSession {
  userId: string;
  token: string;
  loggedInAt: number;
}

export interface FamilyMember {
  id: string;
  userId?: string;
  name: string;
  role: FamilyRole;
  roleTitle: string;
  avatar: string;
  color: string;
  isOwner?: boolean;
}

export interface PaymentCard {
  id: string;
  userId?: string;
  nickname: string;
  bankName?: string;
  cardholderName: string;
  cardType: CardType;
  cardNumberMasked: string;
  lastFour: string;
  expiryDate: string;
  balance: number;
  colorGradient: string;
  isDefault: boolean;
  isLocked: boolean;
  onlinePayments: boolean;
  cashTransactions: boolean;
  description?: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  memberId: string;
  cardId?: string;
  paymentMethod: PaymentMethod;
  description?: string;
  linkedPaymentId?: string;
  linkedSubscriptionId?: string;
  linkedGoalId?: string;
  createdAt: number;
}

export type UtilityCategory = 'electricity' | 'gas' | 'water' | 'internet' | 'mobile' | 'communal_other';

export interface UtilityService {
  id: string;
  userId?: string;
  name: string;
  category: UtilityCategory;
  providerName: string;
  accountNumber: string;
  amountDue: number;
  dueDate: string;
  status: 'unpaid' | 'paid';
  lastPaidDate?: string;
  icon: string;
  description?: string;
}

export interface Budget {
  id: string;
  userId?: string;
  category: TransactionCategory;
  month: string; // YYYY-MM
  limitAmount: number;
  notifyThreshold: number; // e.g. 80 for 80%
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  memberId: string;
  type: 'deposit' | 'withdraw';
  note?: string;
  createdAt: number;
}

export interface FamilyGoal {
  id: string;
  userId?: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  isCompleted: boolean;
  contributions: GoalContribution[];
}

export interface Subscription {
  id: string;
  userId?: string;
  name: string;
  provider: string;
  icon: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  cardId: string;
  status: 'active' | 'paused' | 'cancelled';
  category: string;
  lastPaidDate?: string;
}

export interface CalendarEvent {
  id: string;
  userId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'payment' | 'subscription' | 'expense' | 'income' | 'milestone';
  amount?: number;
  isCompleted: boolean;
  linkedId?: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  date: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  isRead: boolean;
  pageLink?: string;
}

export interface FamilySettings {
  id: string;
  familyName: string;
  primaryCurrency: CurrencyCode;
  currencyRateUSD: number;
  currencyRateEUR: number;
  onboardingCompleted: boolean;
  monthlySavingsTarget: number;
  createdDate: string;
}
