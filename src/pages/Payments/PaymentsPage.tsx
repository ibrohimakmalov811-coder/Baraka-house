import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { UtilityService, UtilityCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DemoPaymentModal } from '../../components/modals/DemoPaymentModal';
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
  AlertCircle,
  Receipt,
  Search,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { services, transactions, currency } = useFinanceStore();

  const [activeCategory, setActiveCategory] = useState<'all' | UtilityCategory>('all');
  const [selectedService, setSelectedService] = useState<UtilityService | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [search, setSearch] = useState('');

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

  // Payment history (linked to utility transactions)
  const paymentHistory = transactions.filter(
    (t) => t.category === 'utilities' || t.linkedPaymentId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Kommunal va Davlat Xizmatlari Toʻlovi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Uy-joy, gaz, elektr, suv, internet va aloqa toʻlovlarini bir joyda boshqaring
          </p>
        </div>

        {/* Demo Mode Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Demo Toʻlov Rejimi Faol</span>
        </div>
      </div>

      {/* Filter Categories Bar */}
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
                : 'bg-baraka-card border border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const IconComponent = categoryIcons[service.category] || Receipt;
          const isPaid = service.status === 'paid';

          return (
            <div
              key={service.id}
              className="p-5 rounded-2xl bg-baraka-card border border-white/10 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 transition group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isPaid
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-white text-base leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium mt-0.5">
                    {service.providerName}
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Abonent hisob raqami:</span>
                    <span className="font-mono font-bold text-white">
                      {service.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Toʻlov muddati:</span>
                    <span className="text-slate-300 font-medium">{service.dueDate}</span>
                  </div>
                  {service.lastPaidDate && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Oxirgi toʻlov:</span>
                      <span>{service.lastPaidDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Payment Button */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Qarz / Miqdor</p>
                  <p className="font-mono text-lg font-black text-white">
                    {formatCurrency(service.amountDue, currency)}
                  </p>
                </div>

                <button
                  onClick={() => handlePayClick(service)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition active:scale-95 ${
                    isPaid
                      ? 'bg-white/10 hover:bg-white/20 text-slate-200'
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
      <div className="mt-8 p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Kommunal Toʻlovlar Tarixi</h3>
          </div>
          <span className="text-xs text-slate-400">{paymentHistory.length} ta yozuv</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-white/10 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Xizmat nomi</th>
                <th className="py-3 px-4">Sana va Vaqt</th>
                <th className="py-3 px-4">Tafsilotlar</th>
                <th className="py-3 px-4 text-right">Toʻlangan summa</th>
                <th className="py-3 px-4 text-center">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paymentHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-white">{tx.title}</td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(tx.date)} {tx.time || ''}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{tx.description}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(tx.amount, currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      BAJARILDI
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DemoPaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        preselectedService={selectedService}
      />
    </div>
  );
};
