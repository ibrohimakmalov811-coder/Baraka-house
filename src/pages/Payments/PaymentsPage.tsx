import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { UtilityService, UtilityCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DemoPaymentModal } from '../../components/modals/DemoPaymentModal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Zap,
  Flame,
  Droplets,
  Wifi,
  Smartphone,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Receipt,
  Search,
  RefreshCw,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const {
    services,
    transactions,
    currency,
    openQuickAction,
    deleteService,
    populateOfficialServices,
  } = useFinanceStore();

  const [activeCategory, setActiveCategory] = useState<'all' | UtilityCategory>('all');
  const [selectedService, setSelectedService] = useState<UtilityService | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Auto-populate all 6 official utility services with exact account numbers if missing or has old test data
  useEffect(() => {
    if (services.length < 6 || services.some((s) => s.accountNumber === '23456789765434567')) {
      populateOfficialServices();
    }
  }, [services.length, populateOfficialServices]);

  const categoryIcons: Record<UtilityCategory, React.ElementType> = {
    electricity: Zap,
    gas: Flame,
    water: Droplets,
    internet: Wifi,
    mobile: Smartphone,
    communal_other: Trash2,
  };

  const filteredServices = services.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.providerName.toLowerCase().includes(q) ||
        s.accountNumber.includes(q)
      );
    }
    return true;
  });

  const handlePayClick = (service: UtilityService) => {
    setSelectedService(service);
    setIsPayModalOpen(true);
  };

  const paymentHistory = transactions.filter(
    (t) => t.category === 'utilities' || t.linkedPaymentId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Kommunal va Davlat Xizmatlari Toʻlovi
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Uy-joy, gaz, elektr, suv, internet va aloqa toʻlovlarini bir joyda boshqaring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {services.length < 6 && (
            <button
              onClick={() => populateOfficialServices()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs border border-cyan-500/30 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Barcha hisoblarni tiklash (6 xizmat)</span>
            </button>
          )}

          <button
            onClick={() => openQuickAction('service')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Xizmat Qoʻshish</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>Demo Rejim</span>
          </div>
        </div>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="Kommunal xizmatlar ulanmagan"
          description="Elektr energiyasi, gaz, suv, internet yoki aloqa provayderlarini hisob raqami bilan kiriting."
          actionText="Yangi Xizmat Qoʻshish"
          onAction={() => openQuickAction('service')}
        />
      ) : (
        <>
          {/* Filter Categories Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'electricity', label: 'Elektr energiyasi' },
                { id: 'gas', label: 'Tabiiy Gaz' },
                { id: 'water', label: 'Suv taʼminoti' },
                { id: 'internet', label: 'Internet' },
                { id: 'mobile', label: 'Mobil aloqa' },
                { id: 'communal_other', label: 'Boshqa xizmatlar' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl font-semibold transition ${
                    activeCategory === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Xizmatlarni qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-xs text-[var(--input-text)] placeholder-[var(--input-placeholder)]"
              />
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const IconComponent = categoryIcons[service.category] || Receipt;
              const isPaid = service.status === 'paid';

              return (
                <div
                  key={service.id}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg flex flex-col justify-between hover:border-cyan-500/40 transition group relative"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Toʻlangan
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Toʻlov kutilmoqda
                            </>
                          )}
                        </span>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-500 transition"
                          title="Xizmatni o'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-bold text-[var(--text-primary)] text-base leading-snug">
                        {service.name}
                      </h3>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">
                        {service.providerName}
                      </p>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-[var(--input-background)] border border-[var(--border)] space-y-1.5 text-xs">
                      <div className="flex justify-between text-[var(--text-muted)]">
                        <span>Abonent hisob raqami:</span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {service.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-[var(--text-muted)]">
                        <span>Toʻlov muddati:</span>
                        <span className="text-[var(--text-secondary)] font-medium">{service.dueDate}</span>
                      </div>
                      {service.lastPaidDate && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Oxirgi toʻlov:</span>
                          <span>{service.lastPaidDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Payment Button */}
                  <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Qarz / Miqdor</p>
                      <p className="font-mono text-lg font-black text-[var(--text-primary)]">
                        {formatCurrency(service.amountDue, currency)}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePayClick(service)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition active:scale-95 ${
                        isPaid
                          ? 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-500/25'
                      }`}
                    >
                      {isPaid ? 'Qayta toʻlash' : 'Toʻlash'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment History Table */}
          {paymentHistory.length > 0 && (
            <div className="mt-8 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Kommunal Toʻlovlar Tarixi</h3>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{paymentHistory.length} ta yozuv</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--table-header)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Xizmat nomi</th>
                      <th className="py-3 px-4">Sana va Vaqt</th>
                      <th className="py-3 px-4">Tafsilotlar</th>
                      <th className="py-3 px-4 text-right">Toʻlangan summa</th>
                      <th className="py-3 px-4 text-center">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {paymentHistory.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[var(--surface-hover)] transition">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{tx.title}</td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">{formatDate(tx.date)} {tx.time || ''}</td>
                        <td className="py-3 px-4 text-[var(--text-muted)] font-mono text-[11px]">{tx.description}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(tx.amount, currency)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                            BAJARILDI
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <DemoPaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        preselectedService={selectedService}
      />
    </div>
  );
};
