import {requestNotifications,showNotification} from '../services/notifications';
import React, { useRef, useState } from 'react';
import { Download, Upload, Lock, Trash2, Watch, Globe, KeyRound, Crown, FileText, Sparkles, ShieldCheck, Bell } from 'lucide-react';
import type { UserProfile } from '../types';
import type { ThemeColors } from '../services/theme';
import type { TranslationDictionary } from '../services/i18n';
import { useAvailableLanguages } from '../hooks/useAvailableLanguages';
import { STORAGE_KEYS } from '../services/storage';
import { readLocalRecords, writeLocalRecords } from '../services/localDatabase';
import { PatternLock } from './PatternLock';
import { WatchConnection } from './WatchConnection';

interface Props {
  profile: UserProfile;
  theme: ThemeColors;
  t: TranslationDictionary;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenUpgradeModal: () => void;
  onLockSession: () => void;
  onOpenHealthReport?: () => void;
  onResetToZero?: () => void;
  onLanguageChange?: (language: string) => Promise<void>;
  onTrialActivated?: () => void;
  onNavigateToAdmin?: () => void;
  adminSyncMessage?: string;
  notificationContent?: React.ReactNode;
}
const CURRENCIES = ['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'AUD', 'JPY', 'MAD', 'DZD', 'BRL', 'INR', 'AED'];
export const AccountSettings: React.FC<Props> = ({ profile, theme, t, onUpdateProfile, onOpenUpgradeModal, onLockSession, onOpenHealthReport, onResetToZero, onLanguageChange, onTrialActivated, onNavigateToAdmin, adminSyncMessage, notificationContent }) => {
  const availableLanguages = useAvailableLanguages(profile.preferredLanguage);
  const [showPattern, setShowPattern] = useState(false);
  const [busyLanguage, setBusyLanguage] = useState(false);
  const [message, setMessage] = useState('');
  const [trialCode, setTrialCode] = useState('');
  const [trialBusy, setTrialBusy] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const chooseLanguage = async (code: string) => {
    setBusyLanguage(true); setMessage('');
    try { if (onLanguageChange) await onLanguageChange(code); else onUpdateProfile({ preferredLanguage: code }); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Traduction indisponible.'); }
    finally { setBusyLanguage(false); }
  };
  const exportData = async () => {
    const data = Object.fromEntries(Object.entries(STORAGE_KEYS)
      .filter(([key]) => !key.startsWith('ADMIN') && key !== 'TRANSACTIONS')
      .map(([name, key]) => { try { return [name, JSON.parse(localStorage.getItem(key) || 'null')]; } catch { return [name, localStorage.getItem(key)]; } }));
    try {
      data.INBODY_SCANS=JSON.parse(localStorage.getItem(`auraslim_inbody_scans_${profile.id}`)||'[]');
      const records = await readLocalRecords();
      if (records.weights) data.WEIGHT_ENTRIES = records.weights;
      if (records.photos) data.WEEKLY_PHOTOS = records.photos;
    } catch { setMessage('Stockage local inaccessible. L’export peut manquer les photos : réessayez dans un navigateur récent.'); return; }
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = `auraslim-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    setMessage(t.gdprExportSuccess || 'Vos données locales ont été téléchargées en JSON. Conservez ce fichier dans un endroit privé.');
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed.data || parsed;
      if (!data) throw new Error('Structure JSON invalide');

      if (data.USER_PROFILE) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.USER_PROFILE));
        onUpdateProfile(data.USER_PROFILE);
      }
      if (data.WEIGHT_ENTRIES) {
        localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(data.WEIGHT_ENTRIES));
        await writeLocalRecords('weights', data.WEIGHT_ENTRIES).catch(() => {});
      }
      if (data.WEEKLY_PHOTOS) {
        localStorage.setItem(STORAGE_KEYS.WEEKLY_PHOTOS, JSON.stringify(data.WEEKLY_PHOTOS));
        await writeLocalRecords('photos', data.WEEKLY_PHOTOS).catch(() => {});
      }
      if(data.INBODY_SCANS && Array.isArray(data.INBODY_SCANS))localStorage.setItem(`auraslim_inbody_scans_${data.USER_PROFILE?.id||profile.id}`,JSON.stringify(data.INBODY_SCANS));
      if (data.NUTRITION_ENTRIES) {
        localStorage.setItem(STORAGE_KEYS.NUTRITION_ENTRIES, JSON.stringify(data.NUTRITION_ENTRIES));
      }
      if (data.WATER_LOGS) {
        localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(data.WATER_LOGS));
      }
      if (data.REMINDERS) {
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(data.REMINDERS));
      }
      setMessage("✓ Toutes vos données (profil, pesées, photos, historique) ont été importées avec succès ! Rechargement...");
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setMessage("Erreur lors de l'import : vérifiez que le fichier sélectionné est bien un fichier JSON valide exporté depuis AuraSlim.");
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleTestNotification=async(type:'water'|'weight')=>{try{if(!await requestNotifications()){setMessage('Autorisez les notifications dans les réglages de votre appareil.');return;}await showNotification(type==='water'?'AuraSlim · Hydratation':'AuraSlim · Pesée',type==='water'?'Pensez à boire un verre d’eau.':'Enregistrez votre pesée.');setMessage('Notification de test envoyée à cet appareil.');}catch{setMessage('Notification indisponible. Vérifiez les autorisations.');}};
  return <div className="mx-auto max-w-4xl space-y-5 text-white">
    <h2 className="text-2xl font-bold">{t.accountSettingsTitle || 'Paramètres et confidentialité'}</h2>
    {message && <p role="status" className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">{message}</p>}
    <details className={`rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
      <summary className="flex items-center gap-2 font-bold cursor-pointer font-bold"><Crown size={18}/> {t.accountMyPlan || 'Mon offre'} : {profile.plan === 'free' ? (t.accountPlanFree || 'Gratuite') : profile.subscriptionPlanName || 'Premium'}</summary>
      <p className="mt-2 text-sm text-slate-300">{t.accountPlanDesc || 'Deux photos de suivi après la photo Jour 1 sont incluses gratuitement. Les options Premium nécessitent une confirmation de Stripe.'}</p>
      <button onClick={onOpenUpgradeModal} className="action-primary mt-3 rounded-xl px-4 py-2 text-sm font-bold">{t.accountViewOffersBtn || 'Voir les offres à 3,99 € et 6,99 €/mois'}</button>
      <form className="mt-5 space-y-2" onSubmit={async event => {
        event.preventDefault(); setTrialBusy(true); setMessage('');
        try {
          const response = await fetch('/auraslim-api/access/redeem', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-AuraSlim-Request': '1' }, body: JSON.stringify({ code: trialCode.trim() }) });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Code non accepté.');
          setTrialCode(''); setMessage(t.accountTrialSuccess || 'Votre accès gratuit temporaire est activé sur cet appareil.'); onTrialActivated?.();
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Activation impossible.'); }
        finally { setTrialBusy(false); }
      }}><label className="block text-sm">{t.accountTrialTitle || 'Code d’essai fourni par AuraSlim'}<input value={trialCode} onChange={event => setTrialCode(event.target.value)} autoComplete="off" maxLength={100} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-2 text-white" placeholder={t.accountTrialPlaceholder || 'Saisir le code d’essai'} /></label>
        <button type="submit" disabled={!trialCode.trim() || trialBusy} className="action-primary rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-50">{t.accountTrialBtn || 'Activer l’essai'}</button>
      </form>
    </details>

    <details className={`rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
      <summary className="flex items-center gap-2 font-bold cursor-pointer font-bold"><Sparkles size={18} className="text-rose-400" /> {t.goalChoiceLabel || "Objectif Corporel Actif"}</summary>
      <p className="mt-1 text-sm text-slate-400">
        Personnalisez votre rythme (perte, prise ou stabilisation). Toute l'application et les 15 aliments recommandés par repas s'adaptent automatiquement à cet objectif.
      </p>
      <div className="mt-4 max-w-md">
        <label className="text-sm">
          {t.goalChoiceLabel || "Objectif de poids actif"}
          <select 
            value={profile.weightGoal || 'lose'} 
            onChange={e => onUpdateProfile({ weightGoal: e.target.value as any })}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-2.5 text-white font-semibold"
          >
            <option value="lose">📉 {t.goalLose || "Perdre du poids"} (Déficit calorique maîtrisé)</option>
            <option value="gain">📈 {t.goalGain || "Prendre du poids"} (Surplus musculaire sain)</option>
            <option value="maintain">⚖️ {t.goalMaintain || "Stabilisation du poids"} (Maintien actif & équilibre)</option>
          </select>
        </label>
      </div>
    </details>
    <details className={`rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
      <summary className="flex items-center gap-2 font-bold cursor-pointer font-bold"><Globe size={18}/> {t.accountLanguageTitle || 'Langue'}</summary>
      <p className="mt-1 text-sm text-slate-400">{t.accountLanguageDesc || 'Choisissez la langue de votre application.'}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">{t.accountAppLanguage || 'Langue de l\'application'}
          <select value={profile.preferredLanguage} disabled={busyLanguage} onChange={event => void chooseLanguage(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-2 text-white">
            {availableLanguages.map(language => <option key={language.code} value={language.code}>{language.nativeName}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs text-slate-400">{t.accountStripeNotice || 'Le prix réel et la devise de facturation sont confirmés sur la page Stripe.'}</p>
    </details>
    <details className={`rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
      <summary className="flex items-center gap-2 font-bold cursor-pointer font-bold"><KeyRound size={18}/> {t.accountPatternTitle || 'Verrouillage local'}</summary>
      <p className="mt-2 text-sm text-slate-300">{t.accountPatternDesc || 'Schéma facultatif pour masquer l\'écran sur cet appareil. Les données du navigateur restent sur cet appareil.'}</p>
      <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => setShowPattern(true)} className="rounded-lg bg-slate-700 px-4 py-2 text-sm">{t.accountPatternCreateBtn || 'Créer ou changer mon schéma'}</button>
      {profile.patternEnabled && <><button onClick={onLockSession} className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm"><Lock size={14}/> {t.accountPatternLockBtn || 'Verrouiller'}</button><button onClick={() => onUpdateProfile({ patternEnabled: false, patternPassword: [] })} className="rounded-lg bg-slate-700 px-4 py-2 text-sm">{t.accountPatternDisableBtn || 'Désactiver'}</button></>}</div>
    </details>
    <details className={`rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
      <summary className="flex items-center gap-2 font-bold cursor-pointer font-bold"><Watch size={18}/> {t.accountWatchTitle || 'Montre et activité'}</summary>
      <WatchConnection t={t} />
    </details>
    <details className={`rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
      <summary className="flex items-center gap-2 font-bold cursor-pointer font-bold"><FileText size={18}/> {t.accountDataTitle || 'Mes données'}</summary>
    <details className={`rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
      <summary className="font-bold cursor-pointer font-bold">{t.accountShareAdminTitle || 'Partage facultatif avec l’administrateur'}</summary>
      <p className="mt-2 text-sm text-slate-300">{t.accountShareAdminDesc || 'Si vous l’activez, votre nom, email, téléphone, pays, objectif, pesées, menus, calories, hydratation et nombre de photos seront envoyés au serveur AuraSlim pour votre suivi.'}</p>
      <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={!!profile.shareWithAdmin} onChange={event => onUpdateProfile({ shareWithAdmin: event.target.checked })} /> {t.accountShareAdminConsent || 'Autoriser le partage de mon suivi'}</label>
      {adminSyncMessage && <p role="status" className="mt-2 text-xs text-amber-300">{adminSyncMessage}</p>}
    </details>      <p className="mt-2 text-sm text-slate-300">{t.accountDataDesc || 'Photos, pesées et menus restent dans le stockage de ce navigateur. Pensez à exporter vos données régulièrement.'}</p>
      <input 
        ref={importFileRef}
        type="file" 
        accept=".json,application/json" 
        onChange={handleImportData} 
        className="hidden" 
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={exportData} className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm"><Download size={16}/> {t.accountExportBtn || 'Exporter mes données'}</button>
        <button 
          onClick={() => importFileRef.current?.click()} 
          className="flex items-center gap-2 rounded-lg bg-sky-700/60 hover:bg-sky-700 px-4 py-2 text-sm text-white font-semibold border border-sky-500/40 transition"
        >
          <Upload size={16}/> <span>Importer mes données (Fichier JSON)</span>
        </button>
        {onResetToZero && <button onClick={() => { if (window.confirm(t.accountDeleteDataConfirm || 'Effacer définitivement toutes vos données locales AuraSlim sur cet appareil ?')) onResetToZero(); }} className="flex items-center gap-2 rounded-lg bg-rose-600/30 px-4 py-2 text-sm text-rose-200"><Trash2 size={16}/> {t.accountDeleteDataBtn || 'Effacer mes données'}</button>}
      </div>
    </details>

    {/* General Notification Test Section */}
    <details className={`rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
      <summary className="flex items-center gap-2 font-bold cursor-pointer font-bold"><Bell size={18}/> Notifications & rappels</summary>
      <div className="mt-4">{notificationContent}</div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => void handleTestNotification('water')}
          className="flex items-center gap-2 rounded-xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/40 px-4 py-2 text-xs font-semibold text-sky-200 transition"
        >
          <span>💧 Tester le rappel « Prise d’un verre d’eau »</span>
        </button>
        <button
          type="button"
          onClick={() => void handleTestNotification('weight')}
          className="flex items-center gap-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 px-4 py-2 text-xs font-semibold text-rose-200 transition"
        >
          <span>⚖️ Tester le rappel « Mesure du poids »</span>
        </button>
      </div>
    </details>

    {showPattern && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/90 p-3"><PatternLock mode="create" theme={theme} t={t} allowBiometric={false} onCancel={() => setShowPattern(false)} onSuccess={pattern => { onUpdateProfile({ patternPassword: pattern, patternEnabled: true }); setShowPattern(false); setMessage(t.patternConfirmedNotice || 'Schéma confirmé. Pensez à exporter vos données régulièrement.'); }} /></div>}
  </div>;
};
