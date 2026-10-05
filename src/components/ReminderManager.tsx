import {requestNotifications,showNotification,scheduleNativeReminders,nativeNotifications} from '../services/notifications';
import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  Check, 
  Sparkles, 
  Send, 
  Droplet, 
  Scale, 
  Utensils, 
  Camera,
  CheckCircle2
} from 'lucide-react';
import { ReminderSetting } from '../types';
import { ThemeColors } from '../services/theme';
import { TranslationDictionary } from '../services/i18n';

interface ReminderManagerProps {
  preferredLanguage?:string;
  reminders: ReminderSetting[];
  theme: ThemeColors;
  t: TranslationDictionary;
  onUpdateReminders: (reminders: ReminderSetting[]) => void;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  preferredLanguage='fr',
  reminders,
  theme,
  t,
  onUpdateReminders,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [lastDispatchedAlert, setLastDispatchedAlert] = useState<string | null>(null);

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onUpdateReminders(updated);
  };

  const handleChangeTime = (id: string, newTime: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, time: newTime } : r
    );
    onUpdateReminders(updated);
  };
  const changeHydration = (updated: Partial<ReminderSetting>) => {
    onUpdateReminders(reminders.map(reminder => reminder.type === 'hydration' ? { ...reminder, ...updated } : reminder));
  };

  const handleRequestPermission = async () => {
    try {const granted=await requestNotifications();if(granted)await scheduleNativeReminders(reminders,t as unknown as Record<string,string>,preferredLanguage);setNotificationStatus(granted?(t.notificationAllowed||'Notifications autorisées.'):(t.notificationDenied||'Notifications refusées.'));}catch{setNotificationStatus('Impossible d’activer les notifications. Vérifiez les réglages de votre téléphone.');}
  };
  const handleSendTestNotification = async (title:string,message:string) => {
    if(!await requestNotifications()){setNotificationStatus(t.notificationDenied||'Notifications refusées.');return;}
    try{await showNotification(`AuraSlim : ${title}`,message);setLastDispatchedAlert(title);setTimeout(()=>setLastDispatchedAlert(null),4000);}catch{setNotificationStatus('Notification indisponible sur cet appareil.');}
  };

  const getReminderIcon = (type: ReminderSetting['type']) => {
    switch (type) {
      case 'morning_weigh': return Scale;
      case 'hydration': return Droplet;
      case 'breakfast_log':
      case 'snack_log':
      case 'lunch_log': 
      case 'dinner_log': return Utensils;
      case 'weekly_photo': return Camera;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Bell className={`w-6 h-6 ${theme.accentIcon}`} />
            {t.remindersTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {nativeNotifications()?'Rappels programmés sur votre téléphone, même quand l’application est fermée. Les horaires dépendent des réglages du système.':'Dans le navigateur, les rappels fonctionnent quand la page reste ouverte. La version mobile utilise les notifications du téléphone.'}
          </p>
        </div>

        <button
          onClick={handleRequestPermission}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${theme.cardBorder} bg-slate-900 text-white hover:bg-slate-800`}
        >
          {t.enableNotifications}
        </button>
      </div>

      {notificationStatus && (
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
          {notificationStatus}
        </div>
      )}
      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">Les notifications ne sont reçues que pendant que l'application est ouverte. Une notification lorsque l'app est fermée exige un service de notifications et son déploiement.</p>
      <div className="grid gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:grid-cols-2">
        <label className="text-xs">Hydratation : intervalle
          <select value={reminders.find(rem => rem.type === 'hydration')?.intervalMinutes || 120} onChange={event => changeHydration({ intervalMinutes: Number(event.target.value) })} className="mt-1 w-full rounded-lg bg-slate-950 p-2 text-white">
            {[30, 60, 90, 120, 180, 240].map(minutes => <option key={minutes} value={minutes}>Toutes les {minutes} minutes</option>)}
          </select>
        </label>
        <label className="text-xs">Fin des rappels d'eau
          <input type="time" value={reminders.find(rem => rem.type === 'hydration')?.endTime || '21:00'} onChange={event => changeHydration({ endTime: event.target.value })} className="mt-1 w-full rounded-lg bg-slate-950 p-2 text-white" />
        </label>
      </div>

      {/* Dispatched Alert Toast Preview */}
      {lastDispatchedAlert && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-white text-xs flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-rose-400 animate-bounce" />
            <div>
              <strong className="block text-sm font-semibold">{t.notificationSent}</strong>
              <span>{lastDispatchedAlert}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{t.justNow || "À l'instant"}</span>
        </div>
      )}

      {/* Reminders List */}
      <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl space-y-4`}>
        <div className="divide-y divide-slate-800/80">
          {reminders.map((rem) => {
            const Icon = getReminderIcon(rem.type);
            const title = (t as unknown as Record<string, string>)[rem.titleKey] || (rem.titleKey === 'breakfast' ? (t.periodBreakfast || 'Petit déjeuner') : rem.titleKey === 'snack' ? (t.periodSnack || 'Collation') : rem.type);

            return (
              <div key={rem.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${rem.enabled ? theme.primaryBg : 'bg-slate-800 text-slate-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${rem.enabled ? 'text-white' : 'text-slate-500'}`}>
                      {title}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {rem.frequency === 'daily' ? (t.frequencyDaily || 'Chaque jour') : rem.frequency === 'hourly' ? (t.frequencyHourly?.replace('{min}', String(rem.intervalMinutes || 120)) || `Toutes les ${rem.intervalMinutes || 120} min`) : (t.frequencyWeekly || 'Chaque dimanche')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Time Input */}
                  <input
                    type="time"
                    value={rem.time}
                    disabled={!rem.enabled}
                    onChange={(e) => handleChangeTime(rem.id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40 focus:outline-none focus:border-rose-400"
                  />

                  {/* Test Dispatch Button */}
                  <button
                    type="button"
                    onClick={() => handleSendTestNotification(title, t.reminderNotificationBody || "Il est l'heure d'enregistrer vos données sur AuraSlim Pro !")}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
                    title={t.testNotification}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  {/* Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleReminder(rem.id)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                      rem.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
