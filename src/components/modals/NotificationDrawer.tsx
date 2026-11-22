import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { X, CheckCheck, Bell, AlertCircle, Info, CheckCircle2, ChevronRight } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
  } = useFinanceStore();

  if (!isNotificationOpen) return null;

  const handleNotificationClick = (notif: any) => {
    markNotificationAsRead(notif.id);
    if (notif.pageLink) {
      setActiveTab(notif.pageLink);
    }
    setIsNotificationOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm h-full bg-baraka-card border-l border-white/10 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Bildirishnomalar</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => markAllNotificationsAsRead()}
              title="Barchasini oʻqilgan deb belgilash"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <p>Yangi bildirishnomalar yoʻq</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  notif.isRead
                    ? 'bg-white/5 border-transparent opacity-70 hover:opacity-100'
                    : 'bg-cyan-950/30 border-cyan-500/30 hover:border-cyan-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                    {notif.type === 'alert' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                    {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {notif.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-slate-400">
                      <span>{notif.date}</span>
                      {notif.pageLink && (
                        <span className="flex items-center gap-0.5 text-cyan-400 font-medium">
                          Batafsil <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
