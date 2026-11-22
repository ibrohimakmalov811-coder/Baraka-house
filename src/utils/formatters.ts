import { CurrencyCode, TransactionCategory } from '../types';

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'UZS',
  rateUSD = 12800,
  rateEUR = 13600
): string {
  let displayAmount = amount;

  if (currency === 'USD') {
    displayAmount = amount / rateUSD;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 1,
    }).format(displayAmount);
  }

  if (currency === 'EUR') {
    displayAmount = amount / rateEUR;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 1,
    }).format(displayAmount);
  }

  // UZS (Default)
  const formatted = Math.round(displayAmount).toLocaleString('uz-UZ').replace(/,/g, ' ');
  return `${formatted} so'm`;
}

export function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const monthsUz = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${monthsUz[mIdx]} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const [, month, day] = dateStr.split('-');
    const monthsUz = [
      'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun',
      'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'
    ];
    return `${parseInt(day, 10)} ${monthsUz[parseInt(month, 10) - 1]}`;
  } catch {
    return dateStr;
  }
}

export const CATEGORY_DETAILS: Record<
  TransactionCategory,
  { labelUz: string; labelEn: string; color: string; icon: string }
> = {
  salary: { labelUz: 'Oylik maosh', labelEn: 'Salary', color: '#10B981', icon: 'Briefcase' },
  business: { labelUz: 'Biznes daromad', labelEn: 'Business', color: '#3B82F6', icon: 'TrendingUp' },
  investment: { labelUz: 'Investitsiyalar', labelEn: 'Investment', color: '#8B5CF6', icon: 'LineChart' },
  gift: { labelUz: "Sovg'a va mukofot", labelEn: 'Gifts', color: '#EC4899', icon: 'Gift' },
  utilities: { labelUz: "Kommunal to'lovlar", labelEn: 'Utilities', color: '#06B6D4', icon: 'Zap' },
  groceries: { labelUz: 'Oziq-ovqat va bozor', labelEn: 'Groceries', color: '#F59E0B', icon: 'ShoppingCart' },
  transportation: { labelUz: 'Transport va yoqilgʻi', labelEn: 'Transportation', color: '#6366F1', icon: 'Car' },
  education: { labelUz: "Ta'lim va to'garaklar", labelEn: 'Education', color: '#3B82F6', icon: 'GraduationCap' },
  healthcare: { labelUz: "Salomatlik va dori", labelEn: 'Healthcare', color: '#EF4444', icon: 'HeartPulse' },
  entertainment: { labelUz: 'Dam olish va hordiq', labelEn: 'Entertainment', color: '#A855F7', icon: 'Film' },
  shopping: { labelUz: 'Kiyim va xaridlar', labelEn: 'Shopping', color: '#F43F5E', icon: 'ShoppingBag' },
  housing: { labelUz: 'Uy-joy va ta’mir', labelEn: 'Housing', color: '#14B8A6', icon: 'Home' },
  dining: { labelUz: 'Kafexona va restoran', labelEn: 'Dining Out', color: '#FB923C', icon: 'Utensils' },
  travel: { labelUz: 'Sayohat va ta’til', labelEn: 'Travel', color: '#0284C7', icon: 'Plane' },
  other: { labelUz: 'Boshqa xarajatlar', labelEn: 'Other', color: '#64748B', icon: 'MoreHorizontal' },
};
