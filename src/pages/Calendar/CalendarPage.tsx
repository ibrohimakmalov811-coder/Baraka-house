import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CalendarEvent } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Receipt,
  Repeat,
  ArrowDownRight,
  Trash2,
  X,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    toggleCalendarEventCompleted,
    deleteCalendarEvent,
    currency,
  } = useFinanceStore();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 22)); // November 2026
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-25');
  const [eventType, setEventType] = useState<'payment' | 'subscription' | 'income' | 'milestone'>('payment');
  const [amount, setAmount] = useState('');

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (10 = November)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const monthNamesUz = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addCalendarEvent({
      title,
      date: eventDate,
      type: eventType,
      amount: parseFloat(amount) || undefined,
      isCompleted: false,
    });

    setIsAddOpen(false);
    setTitle('');
    setAmount('');
  };

  const getEventsForDay = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter((e) => e.date === formattedDate);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Moliyaviy Taqvim va Eslatmalar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kommunal toʻlovlar, kreditlar, obunalar va oylik daromadlar jadvali
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode buttons */}
          <div className="flex items-center rounded-xl bg-baraka-card border border-white/10 p-0.5 text-xs font-semibold">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  viewMode === mode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'month' ? 'Oylik' : mode === 'week' ? 'Haftalik' : 'Kunlik'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Eslatma Qoʻshish</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls & Month Header */}
      <div className="p-4 rounded-2xl bg-baraka-card border border-white/10 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-black text-white">
            {monthNamesUz[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(2026, 10, 22))}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-cyan-400"
          >
            Bugun
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div className="rounded-2xl bg-baraka-card border border-white/10 shadow-lg overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-slate-900/80 border-b border-white/10 text-center py-2.5 text-xs font-bold text-slate-400 uppercase">
          {['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Yak'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-white/5 bg-slate-950/20">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[105px] p-2 bg-slate-900/30 opacity-40" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = getEventsForDay(dayNum);
            const isToday = dayNum === 22 && month === 10;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[105px] p-2 flex flex-col justify-between hover:bg-white/5 transition-colors relative ${
                  isToday ? 'bg-cyan-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>

                {/* Day events pills */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate cursor-pointer transition ${
                        ev.isCompleted
                          ? 'bg-slate-800 text-slate-400 line-through'
                          : ev.type === 'payment'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : ev.type === 'subscription'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-cyan-400 font-bold block">
                      +{dayEvents.length - 2} ta yana
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="p-6 rounded-2xl bg-baraka-card border border-white/10 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white">Yaqin Kungi Reja va Eslatmalar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {calendarEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                ev.isCompleted
                  ? 'bg-white/5 border-white/5 opacity-60'
                  : 'bg-slate-900/60 border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCalendarEventCompleted(ev.id)}
                  className={`p-1.5 rounded-lg transition ${
                    ev.isCompleted ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <div>
                  <p className={`text-xs font-bold text-white ${ev.isCompleted ? 'line-through' : ''}`}>
                    {ev.title}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{formatDate(ev.date)} {ev.time || ''}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {ev.amount && (
                  <span className="font-mono text-xs font-bold text-white">
                    {formatCurrency(ev.amount, currency)}
                  </span>
                )}
                <button
                  onClick={() => deleteCalendarEvent(ev.id)}
                  className="p-1 rounded-md text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-baraka-card rounded-2xl border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Yangi Taqvim Eslatmasi</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Eslatma nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Gaz toʻlovi muddati, Maosh kuni"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sana</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Turi</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  >
                    <option value="payment">Toʻlov eslatmasi</option>
                    <option value="subscription">Obuna yangilanishi</option>
                    <option value="income">Kutilayotgan daromad</option>
                    <option value="milestone">Muhim voqea</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Taxminiy summa (ixtiyoriy)
                </label>
                <input
                  type="number"
                  placeholder="250 000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/10 text-xs font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
