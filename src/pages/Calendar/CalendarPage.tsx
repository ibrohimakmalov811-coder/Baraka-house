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

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 20)); // October 2026
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-25');
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
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Moliyaviy Taqvim va Eslatmalar</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Kommunal toʻlovlar, kreditlar, obunalar va oylik daromadlar jadvali
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode buttons */}
          <div className="flex items-center rounded-xl bg-[var(--surface)] border border-[var(--border)] p-0.5 text-xs font-semibold">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-cyan-500" />
          <h3 className="text-lg font-black text-[var(--text-primary)]">
            {monthNamesUz[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(2026, 10, 22))}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-[var(--surface-hover)]"
          >
            Bugun
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-[var(--table-header)] border-b border-[var(--border)] text-center py-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">
          {['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Yak'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border)] bg-[var(--background)]">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[105px] p-2 bg-[var(--background-secondary)]/40 opacity-40" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = getEventsForDay(dayNum);
            const isToday = dayNum === 22 && month === 10;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[105px] p-2 flex flex-col justify-between hover:bg-[var(--surface-hover)] transition-colors relative ${
                  isToday ? 'bg-cyan-500/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday
                        ? 'bg-cyan-500 text-white font-black'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
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
                          ? 'bg-[var(--surface-elevated)] text-[var(--text-muted)] line-through'
                          : ev.type === 'payment'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                          : ev.type === 'subscription'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold block">
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
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)]">Yaqin Kungi Reja va Eslatmalar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {calendarEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                ev.isCompleted
                  ? 'bg-[var(--surface-elevated)] border-[var(--border)] opacity-60'
                  : 'bg-[var(--input-background)] border-[var(--border)] hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCalendarEventCompleted(ev.id)}
                  className={`p-1.5 rounded-lg transition ${
                    ev.isCompleted
                      ? 'text-emerald-500 bg-emerald-500/10'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <div>
                  <p className={`text-xs font-bold text-[var(--text-primary)] ${ev.isCompleted ? 'line-through opacity-70' : ''}`}>
                    {ev.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-cyan-500" />
                    <span>{formatDate(ev.date)} {ev.time || ''}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {ev.amount && (
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    {formatCurrency(ev.amount, currency)}
                  </span>
                )}
                <button
                  onClick={() => deleteCalendarEvent(ev.id)}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500"
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
          <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Yangi Taqvim Eslatmasi</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Eslatma nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Gaz toʻlovi muddati, Maosh kuni"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Sana</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Turi</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                  >
                    <option value="payment">Toʻlov eslatmasi</option>
                    <option value="subscription">Obuna yangilanishi</option>
                    <option value="income">Kutilayotgan daromad</option>
                    <option value="milestone">Muhim voqea</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Taxminiy summa (ixtiyoriy)
                </label>
                <input
                  type="number"
                  placeholder="250 000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-background)] border border-[var(--border)] text-[var(--input-text)] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] text-xs font-medium border border-[var(--border)]"
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
