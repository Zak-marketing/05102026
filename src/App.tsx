import {greeting} from './services/greeting';
import {nutritionTarget} from './services/nutritionTarget';
import {nativeNotifications,scheduleNativeReminders,showNotification} from './services/notifications';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, TrendingDown, Utensils, Settings, Sun, Moon, Lock, Crown, Droplet, Activity, Sparkles, ChefHat, RotateCcw, ShieldCheck } from 'lucide-react';
import type { UserProfile, WeightEntry, NutritionEntry, WeeklyPhoto, ReminderSetting, UserPlan, WeightGoalType, AppTab } from './types';
import { getStoredProfile, saveStoredProfile, getStoredWeights, saveStoredWeights, getStoredNutrition, saveStoredNutrition,
  getStoredWeeklyPhotos, saveStoredWeeklyPhotos, getStoredReminders, saveStoredReminders, getStoredColorMode, saveStoredColorMode,
  resetAllDataToZero, defaultProfile, initialSmartwatch, getStoredWaterLogs } from './services/storage';
import { chronologicalWeights } from './services/weightHistory';
import { localDate } from './services/dates';
import { parsePaymentReturn, readPendingCheckout, clearPendingCheckout, cleanPaymentReturnUrl, isCheckoutSession, isCheckoutTab, type PendingCheckout } from './services/paymentReturn';
import { readLocalRecords, writeLocalRecords, clearLocalRecords } from './services/localDatabase';
import { getTheme, type ColorMode } from './services/theme';
import { getTranslation, hasTranslatedDictionary, setTranslatedDictionary } from './services/i18n';
import { auraSlimApi } from './services/apiClient';
import { getDailyMotivationalQuote } from './services/motivationalQuotes';
import { WeightTracker } from './components/WeightTracker';
import { PhotoTracker } from './components/PhotoTracker';
import { CalorieCalculator } from './components/CalorieCalculator';
import { MealComposerTab } from './components/MealComposerTab';
import { NutritionAdvice } from './components/NutritionAdvice';
import { AccountSettings } from './components/AccountSettings';
import { PaymentModal } from './components/PaymentModal';
import { HealthReportModal } from './components/HealthReportModal';
import { ClientRegistrationModal } from './components/ClientRegistrationModal';
import { WaterIntakeTracker } from './components/WaterIntakeTracker';
import { InBodyTracker } from './components/InBodyTracker';
import { PatternLock } from './components/PatternLock';
import { ReminderManager } from './components/ReminderManager';
import { AdminConsole } from './components/AdminConsole';
import { AuraLogo } from './components/AuraLogo';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [weights, setWeights] = useState<WeightEntry[]>(getStoredWeights);
  const [nutrition, setNutrition] = useState<NutritionEntry[]>(getStoredNutrition);
  const [photos, setPhotos] = useState<WeeklyPhoto[]>(getStoredWeeklyPhotos);
  const [recordsReady, setRecordsReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');
  const [waterVersion, forceWaterUpdate] = useState(0);
  const [reminders, setReminders] = useState<ReminderSetting[]>(getStoredReminders);
  const [colorMode, setColorMode] = useState<ColorMode>(getStoredColorMode);
  const [paymentReturn] = useState(() => parsePaymentReturn(window.location.search));
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(() => readPendingCheckout(localStorage));
  const pendingCheckoutRef = useRef(pendingCheckout);
  pendingCheckoutRef.current = pendingCheckout;
  const completedReturnSession = useRef<string | null>(null);
  const [restoreScroll, setRestoreScroll] = useState<number | null>(() => paymentReturn && pendingCheckout ? pendingCheckout.scrollY : null);
  const [tab, setTab] = useState<AppTab>(() => window.location.hash === '#admin' ? 'admin' : paymentReturn?.tab || pendingCheckout?.tab || 'progress');
  const [locked, setLocked] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [paidPlans, setPaidPlans] = useState<UserPlan[]>([]);
  const [subscriptionRefresh, setSubscriptionRefresh] = useState(0);
  const [paymentRetryNeeded, setPaymentRetryNeeded] = useState(false);
  const [trialPlans, setTrialPlans] = useState<UserPlan[]>([]);
  const [trialVersion, setTrialVersion] = useState(0);
  const [adminSyncMessage, setAdminSyncMessage] = useState('');
  const previousConsent = useRef(!!profile.shareWithAdmin);
  const [stripeSessions, setStripeSessions] = useState<string[]>(() => {
    let saved: string[] = [];
    try { const value = JSON.parse(localStorage.getItem('auraslim_verified_sessions') || '[]'); saved = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; } catch { /* invalid old storage */ }
    const previous = localStorage.getItem('auraslim_verified_session');
    const returned = paymentReturn?.sessionId;
    const pending = !paymentReturn?.cancelled ? pendingCheckout?.sessionId : null;
    return [...new Set([returned, pending, ...saved, previous].filter(isCheckoutSession))].slice(0, 10);
  });
  const [translationVersion, setTranslationVersion] = useState(0);
  const [onboardingLanguageError, setOnboardingLanguageError] = useState(false);
  const theme = getTheme(profile.gender, colorMode);
  const t = getTranslation(profile.preferredLanguage);
  const orderedWeights = chronologicalWeights(weights);
  const latest = orderedWeights.at(-1);
  const hasPhotoPlan = ['progress_video', 'complete_pack', 'pro'].includes(profile.plan);
  const weighPhotos = photos.filter(photo => photo.weekNumber > 0);
  const photoQuotaAvailable = hasPhotoPlan || weighPhotos.length < 2;

  useEffect(() => { document.documentElement.dataset.theme = colorMode; saveStoredColorMode(colorMode); }, [colorMode]);
  useEffect(() => { document.documentElement.lang = profile.preferredLanguage || 'fr'; document.documentElement.dir = ['ar','he','fa','ur','ps'].includes(profile.preferredLanguage) ? 'rtl' : 'ltr'; saveStoredProfile(profile); }, [profile]);
  useEffect(() => {
    if (['fr', 'en'].includes(profile.preferredLanguage) || hasTranslatedDictionary(profile.preferredLanguage)) return;
    let active = true;
    const requestedLanguage = profile.preferredLanguage;
    auraSlimApi(`translations?lang=${encodeURIComponent(profile.preferredLanguage)}`).then(result => result.ok ? result.json() : Promise.reject()).then(dictionary => {
      if (active) { setTranslatedDictionary(requestedLanguage, dictionary); setTranslationVersion(value => value + 1); setOnboardingLanguageError(false); }
    }).catch(() => { if (!active) return;
      if (profile.isOnboardingCompleted) setPaymentMessage('Traduction automatique non disponible pour la langue de cet appareil. Vérifiez les paramètres.');
      else { setOnboardingLanguageError(true); setProfile(previous => previous.preferredLanguage === requestedLanguage ? { ...previous, preferredLanguage: 'fr' } : previous); }
    });
    return () => { active = false; };
  }, [profile.preferredLanguage, profile.isOnboardingCompleted]);
  const changeLanguage = async (language: string) => {
    if (!['fr', 'en'].includes(language) && !hasTranslatedDictionary(language)) {
      const response = await auraSlimApi(`translations?lang=${encodeURIComponent(language)}`);
      if (!response.ok) throw new Error('Cette langue nécessite le service de traduction côté serveur. Le choix précédent est conservé.');
      setTranslatedDictionary(language, await response.json());
    }
    setOnboardingLanguageError(false);
    setTranslationVersion(value => value + 1);
    updateProfile({ preferredLanguage: language });
  };
  useEffect(() => {
    let active = true;
    readLocalRecords().then(records => {
      if (!active) return;
      let loadedWeights = records.weights || weights;
      const loadedPhotos = records.photos || photos;
      // If the earliest weight entry has no photoUrl but we have an initial photo, link it
      if (loadedWeights.length > 0) {
        const sorted = chronologicalWeights(loadedWeights);
        const earliest = sorted[0];
        const initialPhoto = loadedPhotos.find(p => p.weekNumber === 0)?.imageUrl || profile.initialPhotoUrl;
        if (earliest && !earliest.photoUrl && initialPhoto) {
          loadedWeights = loadedWeights.map(w => w.id === earliest.id ? { ...w, photoUrl: initialPhoto } : w);
        }
      }
      setWeights(loadedWeights);
      if (records.photos) setPhotos(records.photos);
      setRecordsReady(true);
    }).catch(() => { if (active) { setStorageMessage('Stockage de photos haute capacité indisponible sur ce navigateur; exportez vos données régulièrement.'); setRecordsReady(true); } });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (recordsReady) { if (!('indexedDB' in window)) { saveStoredWeights(weights); return; } writeLocalRecords('weights', weights).then(() => saveStoredWeights(weights.map(item => ({...item, photoUrl: undefined})))).catch(() => setStorageMessage('La dernière pesée n’a pas pu être enregistrée dans le stockage local. Exportez vos données.')); } }, [weights, recordsReady]);
  useEffect(() => { saveStoredNutrition(nutrition); }, [nutrition]);
  useEffect(() => { if (recordsReady) { if (!('indexedDB' in window)) { saveStoredWeeklyPhotos(photos); return; } writeLocalRecords('photos', photos).then(() => saveStoredWeeklyPhotos(photos.map(item => ({...item, imageUrl: '', sideImageUrl: undefined, backImageUrl: undefined})))).catch(() => setStorageMessage('Les nouvelles photos n’ont pas pu être enregistrées dans le stockage local. Libérez de l’espace ou exportez vos données.')); } }, [photos, recordsReady]);
  useEffect(() => { saveStoredReminders(reminders); }, [reminders]);

  useEffect(() => {
    if (!stripeSessions.length || !profile.isOnboardingCompleted) return;
    const controller = new AbortController();
    let mounted = true;
    setCheckingSubscription(true);
    setPaymentRetryNeeded(false);
    type Entitlement = { session: string; active: boolean; plan: UserPlan; returnTab?: AppTab };
    Promise.allSettled(stripeSessions.map(async session => {
      const response = await auraSlimApi(`entitlement?session_id=${encodeURIComponent(session)}`, { credentials: 'same-origin', signal: controller.signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Vérification Stripe indisponible');
      return { ...payload, session } as Entitlement;
    })).then(results => {
      if (!mounted) return;
      const verified = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
      const active = verified.filter(result => result.active && ['scan_meals', 'progress_video', 'complete_pack'].includes(result.plan));
      setPaidPlans([...new Set(active.map(item => item.plan))]);
      try {
        const previous = JSON.parse(localStorage.getItem('auraslim_verified_sessions') || '[]');
        const failedSaved = Array.isArray(previous) ? stripeSessions.filter((session, index) => results[index].status === 'rejected' && previous.includes(session)) : [];
        localStorage.setItem('auraslim_verified_sessions', JSON.stringify([...new Set([...active.map(item => item.session), ...failedSaved])]));
        localStorage.removeItem('auraslim_verified_session');
        localStorage.removeItem('auraslim_active_plans');
      } catch { /* Access is based on the server response, never on editable storage. */ }
      const pending = pendingCheckoutRef.current;
      const returnSession = paymentReturn?.sessionId !== completedReturnSession.current ? paymentReturn?.sessionId : null;
      const candidate = returnSession || pending?.sessionId;
      const returned = active.find(item => item.session === candidate);
      if (returned) {
        const originTab = isCheckoutTab(returned.returnTab) ? returned.returnTab : pending?.tab || paymentReturn?.tab || 'progress';
        setTab(originTab);
        setPaymentOpen(false);
        setPaymentMessage(t.paymentSuccessNotice || 'Paiement confirmé. Votre option est activée.');
        if (pending?.sessionId === returned.session) setRestoreScroll(pending.scrollY);
        completedReturnSession.current = returned.session;
        if (!pending || pending.sessionId === returned.session) {
          setPendingCheckout(null);
          try { clearPendingCheckout(localStorage); } catch { /* Storage may be unavailable. */ }
        }
        window.history.replaceState({}, '', cleanPaymentReturnUrl(window.location.href));
      } else if (candidate && !paymentReturn?.cancelled) {
        const failed = results.find(result => result.status === 'rejected');
        setPaymentMessage(failed?.status === 'rejected' ? failed.reason.message : (t.paymentVerificationPending || 'Paiement en cours de vérification.'));
        setPaymentRetryNeeded(true);
      } else if (!paymentReturn?.cancelled) {
        const failed = results.find(result => result.status === 'rejected');
        setPaymentMessage(failed?.status === 'rejected' ? failed.reason.message : active.length ? (t.paymentVerifiedStatus || 'Abonnement vérifié auprès de Stripe.') : '');
        setPaymentRetryNeeded(!!failed);
      }
    }).finally(() => { if (mounted) setCheckingSubscription(false); });
    return () => { mounted = false; controller.abort(); };
  }, [stripeSessions, profile.isOnboardingCompleted, profile.preferredLanguage, subscriptionRefresh]);

  useEffect(() => {
    if (!paymentReturn?.cancelled) return;
    setPaymentMessage(t.paymentCancelledNotice || 'Paiement annulé.');
    setTab(paymentReturn.tab);
    setPaymentOpen(false);
    setPendingCheckout(null);
    try { clearPendingCheckout(localStorage); } catch { /* Storage may be unavailable. */ }
    window.history.replaceState({}, '', cleanPaymentReturnUrl(window.location.href));
  }, [paymentReturn]);

  useEffect(() => {
    const refresh = () => {
      if (document.hidden) return;
      const pending = readPendingCheckout(localStorage);
      if (pending) {
        setPendingCheckout(pending);
        setStripeSessions(previous => [...new Set([pending.sessionId, ...previous])].slice(0, 10));
      } else {
        setSubscriptionRefresh(value => value + 1);
      }
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  useEffect(() => {
    if (!recordsReady || !profile.isOnboardingCompleted || restoreScroll === null || tab === 'admin') return;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: restoreScroll, behavior: 'auto' });
      setRestoreScroll(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [recordsReady, profile.isOnboardingCompleted, tab, restoreScroll]);
  useEffect(() => {
    if (!profile.isOnboardingCompleted) return;
    let active = true;
    const refresh = () => {
      fetch('/auraslim-api/access', { credentials: 'same-origin' }).then(response => response.ok ? response.json() : Promise.reject()).then(data => {
        if (active) setTrialPlans(Array.isArray(data.grants) ? data.grants.map((grant: { plan: UserPlan }) => grant.plan).filter((plan: UserPlan) => ['scan_meals', 'progress_video', 'complete_pack'].includes(plan)) : []);
      }).catch(() => { if (active) setTrialPlans([]); });
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    const focus = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', focus);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener('visibilitychange', focus); };
  }, [profile.isOnboardingCompleted, trialVersion]);
  useEffect(() => {
    const plans = new Set([...paidPlans, ...trialPlans]);
    const plan: UserPlan = plans.has('complete_pack') || (plans.has('scan_meals') && plans.has('progress_video')) ? 'complete_pack' : plans.has('scan_meals') ? 'scan_meals' : plans.has('progress_video') ? 'progress_video' : 'free';
    const name = paidPlans.length ? 'Abonnement Stripe vérifié' : trialPlans.length ? 'Essai gratuit AuraSlim' : undefined;
    setProfile(previous => previous.plan === plan && previous.subscriptionPlanName === name ? previous : { ...previous, plan, subscriptionPlanName: name });
  }, [paidPlans, trialPlans]);
  useEffect(() => {
    if (!recordsReady) return;
    const enabled = !!profile.shareWithAdmin && !!profile.isOnboardingCompleted;
    const wasEnabled = previousConsent.current;
    previousConsent.current = enabled;
    if (!enabled && !wasEnabled) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/auraslim-api/admin-sync', {
          method: enabled ? 'POST' : 'DELETE', credentials: 'same-origin', signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'X-AuraSlim-Request': '1' },
          body: enabled ? JSON.stringify({ consent: true, profile: {
            name: profile.name, email: profile.email, phone: profile.phone, country: profile.country, countryCode: profile.countryCode,
            preferredLanguage: profile.preferredLanguage, weightGoal: profile.weightGoal, age: profile.age, heightCm: profile.heightCm,
            startingWeight: profile.startingWeight, currentWeight: profile.currentWeight, targetWeight: profile.targetWeight,
            dailyCalorieTarget: profile.dailyCalorieTarget, waterGoalLiters: profile.waterGoalLiters, imagesCalorieScannedCount: profile.imagesCalorieScannedCount
          }, weights: weights.map(({ date, weight, waistCm, mood }) => ({ date, weight, waistCm, mood })),
          meals: nutrition.map(({ date, name, mealType, calories }) => ({ date, name, mealType, calories })),
          water: getStoredWaterLogs().map(({ date, amountMl }) => ({ date, amountMl })), photoCount: photos.length }) : undefined
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Synchronisation indisponible.');
        setAdminSyncMessage(enabled ? 'Suivi partagé avec l’administrateur.' : 'Suivi supprimé du serveur.');
      } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setAdminSyncMessage(error instanceof Error ? error.message : 'Synchronisation indisponible.'); }
    }, enabled ? 1500 : 0);
    return () => { if (enabled) { window.clearTimeout(timer); controller.abort(); } };
  }, [profile, weights, nutrition, photos, waterVersion, recordsReady]);
  useEffect(()=>{void scheduleNativeReminders(reminders,t as unknown as Record<string,string>,profile.preferredLanguage).catch(()=>setStorageMessage('Les rappels n’ont pas pu être programmés. Vérifiez les autorisations de notification.'));},[reminders,profile.preferredLanguage,translationVersion]);
  useEffect(()=>{if('serviceWorker' in navigator)void navigator.serviceWorker.register('/notification-worker.js').catch(()=>{});},[]);
  useEffect(()=>{if(!profile.isOnboardingCompleted)return;const calories=nutritionTarget(profile).calories;if(profile.dailyCalorieTarget!==calories)setProfile(previous=>({...previous,dailyCalorieTarget:calories}));},[profile.currentWeight,profile.heightCm,profile.age,profile.weightGoal,profile.gender,profile.isOnboardingCompleted]);
  // Foreground reminders are accurate while this tab remains open; background reminders require push infrastructure.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (nativeNotifications() || !profile.isOnboardingCompleted || !('Notification' in window) || Notification.permission !== 'granted') return;
      const now = new Date(), clock = now.toTimeString().slice(0, 5);
      const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
      reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        const diff = minutes(clock) - minutes(reminder.time);
        const due = reminder.frequency === 'hourly' ? diff >= 0 && minutes(clock) <= minutes(reminder.endTime || '21:00') && diff % (reminder.intervalMinutes || 120) === 0 : clock === reminder.time;
        if (!due || (reminder.frequency === 'weekly' && now.getDay() !== 0)) return;
        const key = `auraslim_notified_${reminder.id}_${localDate()}_${clock}`;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
        void showNotification((t as unknown as Record<string,string>)[reminder.titleKey]||'AuraSlim',profile.preferredLanguage==='ar'?'حان وقت متابعتك.':profile.preferredLanguage==='en'?'Time for your personal reminder.':'Votre rappel personnalisé.');
      });
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [reminders, profile.isOnboardingCompleted, profile.preferredLanguage, translationVersion]);

  const addWeight = (entry: Omit<WeightEntry, 'id'>) => {
    const stamp = Date.now();
    const saved = { ...entry, id: `w_${stamp}`, createdAt: entry.createdAt || new Date().toISOString(), photoUrl: photoQuotaAvailable ? entry.photoUrl : undefined };
    setWeights(previous => [saved, ...previous]);
    setProfile(previous => {const next={...previous,currentWeight:saved.weight};return {...next,dailyCalorieTarget:nutritionTarget(next).calories};});
    if (saved.photoUrl) setPhotos(previous => [...previous, { id: `ph_${stamp}`, date: localDate(), weekNumber: Math.max(0, ...previous.map(item => item.weekNumber)) + 1,
      angle: 'front', imageUrl: saved.photoUrl!, weightAtTime: saved.weight, notes: saved.notes }]);
  };
  const addPhoto = (photo: Omit<WeeklyPhoto, 'id'>) => {
    if (!photoQuotaAvailable) { setPaymentOpen(true); return; }
    setPhotos(previous => [...previous, { ...photo, id: `ph_${Date.now()}` }]);
  };
  const resetAll = () => {
    setRecordsReady(false);
    void clearLocalRecords().then(() => { resetAllDataToZero(); setRecordsReady(true); }).catch(() => setStorageMessage('Effacement du stockage des photos impossible; réessayez.'));
    localStorage.removeItem('auraslim_verified_session'); 
    localStorage.removeItem('auraslim_verified_sessions'); 
    localStorage.removeItem('auraslim_active_plans');
    clearPendingCheckout(localStorage);
    setPendingCheckout(null);
    setPaymentMessage('');
    setPaymentRetryNeeded(false);
    setStripeSessions([]);
    setPaidPlans([]);
    setProfile({ ...defaultProfile, isOnboardingCompleted: false }); 
    setWeights([]); 
    setNutrition([]); 
    setPhotos([]); 
    setLocked(false);
  };
  const updateProfile = useCallback((updated: Partial<UserProfile>) => {
    setProfile(previous => {
      const next = { ...previous, ...updated };
      if(updated.weightGoal)next.dailyCalorieTarget=nutritionTarget(next).calories;
      saveStoredProfile(next);
      return next;
    });
  }, []);
  const lockSession = () => { if (profile.patternEnabled && profile.patternPassword.length >= 4) setLocked(true); else setTab('account'); };
  if (!recordsReady) return <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 text-white">Chargement des données locales…</div>;
  if(tab==='admin')return <AdminConsole/>;
  if (!profile.isOnboardingCompleted) return <ClientRegistrationModal preferredLanguage={profile.preferredLanguage} onLanguageChange={changeLanguage} languageError={onboardingLanguageError} colorMode={colorMode} onToggleMode={() => setColorMode(previous => previous === 'dark' ? 'light' : 'dark')} onComplete={data => {
    const updated = { ...profile, ...data.profile, plan: 'free' as UserPlan, isOnboardingCompleted: true, initialPhotoUrl: data.initialPhoto };
    setProfile(updated);
    saveStoredProfile(updated);
    const first: WeightEntry = { id: `w_${Date.now()}`, createdAt: new Date().toISOString(), date: localDate(), weight: data.initialWeight, mood: 'good', photoUrl: data.initialPhoto };
    setWeights([first]);
    saveStoredWeights([first]);
    const initial: WeeklyPhoto = { id: `ph_${Date.now()}`, weekNumber: 0, date: localDate(), angle: 'front', imageUrl: data.initialPhoto, weightAtTime: data.initialWeight, notes: 'Photo Jour 1' };
    setPhotos([initial]);
    saveStoredWeeklyPhotos([initial]);
  }} />;
  if (locked && profile.patternEnabled) return <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 p-3"><PatternLock mode="unlock" targetPattern={profile.patternPassword} theme={theme} t={t} allowBiometric={false} onSuccess={() => setLocked(false)} /></div>;

  return <div className={`min-h-[100dvh] min-w-0 transition-colors duration-200 ${colorMode === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
    <header className={`sticky top-0 z-30 flex items-center justify-between gap-2 border-b p-3 sm:px-6 transition-colors duration-200 ${colorMode === 'dark' ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-xs'}`}>
      <div className="min-w-0">
        <h1 className="flex items-center gap-2">
          <AuraLogo compact />
          <span className="rounded-lg bg-rose-500/20 px-2 py-1 text-xs font-semibold">{profile.plan === 'free' ? (t.freeBadge || 'Gratuit') : (t.premiumBadge || 'Premium')}</span>
        </h1>
        <p className={`truncate text-xs font-bold flex items-center gap-1.5 mt-0.5 ${colorMode === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          <span className="text-rose-500 font-semibold">{greeting(profile.preferredLanguage)}</span>
          <span className="truncate">{profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || ''}</span>
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5 items-center">
        <button onClick={() => setColorMode(previous => previous === 'dark' ? 'light' : 'dark')} aria-label={t.themeModeLight || "Changer le thème"} className="rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-200">{colorMode === 'dark' ? <Sun size={19}/> : <Moon size={19}/>}</button>
        {profile.patternEnabled && <button onClick={lockSession} aria-label={t.lockNow || "Verrouiller"} className="rounded-lg border border-slate-300 dark:border-slate-700 p-2"><Lock size={19}/></button>}
        <button onClick={() => setTab('account')} aria-label={t.navAccount || "Paramètres"} className="rounded-lg border border-slate-300 dark:border-slate-700 p-2"><Settings size={19}/></button>
      </div>
    </header>

    {/* Daily Motivational Quote in User's Selected Language - Perfectly Readable on Mobile */}
    <div className={`border-b px-3 sm:px-6 py-2.5 text-xs shadow-inner ${colorMode === 'dark' ? 'bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-sky-500/15 border-slate-800/80 text-slate-200' : 'bg-gradient-to-r from-rose-100/70 via-amber-100/60 to-sky-100/70 border-slate-200 text-slate-800'}`}>
      <div className="mx-auto max-w-5xl flex items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
          <div className="leading-snug">
            <span className="font-bold text-amber-600 dark:text-amber-300 mr-1.5 inline-flex items-center">
              {t.dailyMotivationLabel || "Motivation du jour :"}
            </span>
            <span className={`italic font-medium ${colorMode === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
              « {getDailyMotivationalQuote(profile.preferredLanguage).quote} »
            </span>
            {getDailyMotivationalQuote(profile.preferredLanguage).author && (
              <span className="ml-1.5 text-[11px] text-amber-700 dark:text-amber-300/80 font-normal not-italic">
                — {getDailyMotivationalQuote(profile.preferredLanguage).author}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Navigation Tabs (Progress, Nutrition, Composer vos plats, Hydration, Photos, InBody, Settings) */}
    <nav className={`flex w-full overflow-x-auto border-b px-2 py-2 sm:justify-center scrollbar-thin ${colorMode === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-xs'}`} aria-label="Navigation principale">
      {([
        { id: 'progress', icon: TrendingDown, label: t.navProgress || 'Progression' },
        { id: 'nutrition', icon: Utensils, label: profile.preferredLanguage==='ar'?'مسح الوجبات':profile.preferredLanguage==='en'?'Meal Scanner':'Calculateur de calories' },
        { id: 'compose', icon: ChefHat, label: t.navComposeMeals || 'Composer vos plats' },
        { id: 'hydration', icon: Droplet, label: t.navHydration || 'Hydratation' },
        { id: 'photos', icon: Camera, label: t.navPhotos || 'Évolution Photos' },
        { id: 'inbody', icon: Activity, label: t.navInBody || 'InBody & Analyse' },
        { id: 'reports', icon: Activity, label: t.navReports || 'Bilan & Rapports' },
        { id: 'account', icon: Settings, label: t.navAccount || 'Paramètres' }
      ] as const).map(item => (
        <button
          key={item.id}
          onClick={() => setTab(item.id)}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs transition ${
            tab === item.id 
              ? 'bg-rose-500/20 font-bold text-rose-600 dark:text-rose-300 border border-rose-500/30' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <item.icon size={16}/>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
    {(paymentMessage || checkingSubscription) && <div role="status" className="mx-auto max-w-5xl px-4 py-3 text-sm text-amber-500 flex flex-wrap items-center gap-3">
      <span>{checkingSubscription ? (t.checkingSubscription || 'Vérification du paiement…') : paymentMessage}</span>
      {paymentRetryNeeded && !checkingSubscription && <button type="button" onClick={() => setSubscriptionRefresh(value => value + 1)} className="rounded-xl border border-amber-500/30 px-3 py-2 font-semibold">{t.paymentRetryVerification || 'Vérifier le paiement'}</button>}
    </div>}
    {storageMessage && <div role="alert" className="mx-auto max-w-5xl px-4 py-3 text-sm text-rose-300">{storageMessage}</div>}
    <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 overflow-x-hidden p-3 sm:p-6">
      {tab === 'progress' && (
        <WeightTracker
          profile={profile}
          weightEntries={weights}
          theme={theme}
          t={t}
          canTakePhoto={photoQuotaAvailable}
          onAddEntry={addWeight}
          onOpenUpgradeModal={() => setPaymentOpen(true)}
          onUpdateGoal={goal => updateProfile({ weightGoal: goal })}
          onUpdateProfile={updateProfile}
        />
      )}
      {tab === 'nutrition' && (
        <>
          <CalorieCalculator
            profile={profile}
            nutritionEntries={nutrition}
            activeBurnCalories={0}
            theme={theme}
            t={t}
            onAddNutrition={entry => setNutrition(previous => [entry, ...previous])}
            onDeleteNutrition={id => setNutrition(previous => previous.filter(entry => entry.id !== id))}
            onIncrementScanCount={() => setProfile(previous => ({ ...previous, imagesCalorieScannedCount: previous.imagesCalorieScannedCount + 1 }))}
            onOpenUpgradeModal={() => setPaymentOpen(true)}
            onOpenHealthReport={() => setReportOpen(true)}
          />
        </>
      )}
      {tab === 'compose' && (
        <>
          <MealComposerTab
            profile={profile}
            nutritionEntries={nutrition}
            theme={theme}
            t={t}
            onAddNutrition={entry => setNutrition(previous => [entry, ...previous])}
            onDeleteNutrition={id => setNutrition(previous => previous.filter(entry => entry.id !== id))}
          />

        </>
      )}
      {tab === 'hydration' && (
        <WaterIntakeTracker
          profile={profile}
          theme={theme}
          t={t}
          onWaterUpdate={() => forceWaterUpdate(previous => previous + 1)}
          onUpdateProfile={updateProfile}
        />
      )}
      {tab === 'photos' && (
        <PhotoTracker
          profile={profile}
          photos={photos}
          theme={theme}
          t={t}
          onAddPhoto={addPhoto}
          onUpdateProfile={updateProfile}
          onReplacePhoto={(id,image)=>setPhotos(previous=>previous.map(p=>p.id===id?{...p,imageUrl:image}:p))}
          onOpenUpgradeModal={() => setPaymentOpen(true)}
        />
      )}
      {tab === 'inbody' && (
        <InBodyTracker
          profile={profile}
          theme={theme}
          t={t}
          onUpdateProfile={updateProfile}
          onOpenUpgradeModal={() => setPaymentOpen(true)}
        />
      )}
      {tab === 'reports' && <section className={`rounded-3xl border p-6 space-y-4 ${theme.cardBg}`}>
        <h2 className="text-2xl font-bold">{t.nutritionReportTitle || 'Bilan nutritionnel personnel'}</h2>
        <p>{t.reportOverview || 'Retrouvez vos mesures, votre IMC et vos repas enregistrés dans un bilan personnel.'}</p>
        <button className="action-primary rounded-xl px-5 py-3 font-bold" onClick={() => setReportOpen(true)}>{t.generateNutritionReportPdf || 'Générer mon bilan PDF'}</button>
      </section>}
      {tab === 'account' && (
        <>
          <AccountSettings
            profile={profile}
            theme={theme}
            t={t}
            onUpdateProfile={updateProfile}
            onLanguageChange={changeLanguage}
            onOpenUpgradeModal={() => setPaymentOpen(true)}
            onLockSession={lockSession}
            onOpenHealthReport={() => setReportOpen(true)}
            onResetToZero={resetAll}
            onTrialActivated={() => setTrialVersion(value => value + 1)}
            adminSyncMessage={adminSyncMessage}
            notificationContent={<ReminderManager preferredLanguage={profile.preferredLanguage} reminders={reminders} theme={theme} t={t} onUpdateReminders={setReminders}/>}
          />

        </>
      )}
    </main>
    <footer className={`border-t p-4 text-center text-xs transition-colors duration-200 ${colorMode === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-200 bg-white text-slate-600 shadow-xs'}`}>
      {t.disclaimerFooter || 'AuraSlim · Suivi personnel : les résultats et les analyses IA restent des estimations.'} <button onClick={() => setPaymentOpen(true)} className="ml-2 text-amber-500 font-semibold"><Crown size={13} className="inline"/> {t.offersBtn || 'Offres'}</button>
    </footer>
    <PaymentModal 
      isOpen={paymentOpen} 
      profile={profile} 
      theme={theme} 
      t={t} 
      onClose={() => setPaymentOpen(false)} 
      returnTab={isCheckoutTab(tab) ? tab : 'progress'}
      onCheckoutPrepared={setPendingCheckout}
    />
    <HealthReportModal 
      isOpen={reportOpen} 
      onClose={() => setReportOpen(false)} 
      profile={profile} 
      weightEntries={weights} 
      weeklyPhotos={photos}
      nutritionEntries={nutrition} 
      smartwatch={initialSmartwatch} 
      theme={theme} 
      t={t} 
      onOpenUpgradeModal={() => setPaymentOpen(true)}
      onIncrementReportCount={() => {
        updateProfile({
          pdfReportGeneratedCount: (profile.pdfReportGeneratedCount || 0) + 1
        });
      }}
    />
  </div>;
}
