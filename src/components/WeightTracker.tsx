import { AmbitionPlan } from './AmbitionPlan';
import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  TrendingDown, 
  TrendingUp,
  Target, 
  Calendar, 
  PlusCircle, 
  Award, 
  Sparkles, 
  Activity, 
  Droplet, 
  Scale, 
  Flame, 
  Lock, 
  Crown,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  FileText,
  Camera,
  CheckCircle2,
  Edit3,
  Flag,
  X,
  Maximize2,
  Mic,
  MicOff,
  AlertCircle
} from 'lucide-react';
import { UserProfile, WeightEntry, WeightGoalType } from '../types';
import { ThemeColors } from '../services/theme';
import { TranslationDictionary } from '../services/i18n';
import { CameraCaptureModal } from './CameraCaptureModal';
import { StatDetailModal, StatModalType } from './StatDetailModal';
import { isSpeechRecognitionSupported, startSpeechRecognition, SpeechRecognitionController } from '../services/speechRecognition';
import { parseVoiceMeasurements } from '../services/voiceMeasurementParser';
import { chronologicalWeights, weightTrackingDay } from '../services/weightHistory';
import { localDate } from '../services/dates';
import { getStoredWaterLogs, getStoredNutrition } from '../services/storage';

interface WeightTrackerProps {
  profile: UserProfile;
  weightEntries: WeightEntry[];
  theme: ThemeColors;
  t: TranslationDictionary;
  onAddEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  onOpenUpgradeModal: () => void;
  onOpenHealthReport?: () => void;
  canTakePhoto?: boolean;
  onUpdateGoal?: (goal: WeightGoalType) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  profile,
  weightEntries,
  theme,
  t,
  onAddEntry,
  onOpenUpgradeModal,
  onOpenHealthReport,
  canTakePhoto = true,
  onUpdateGoal,
  onUpdateProfile,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [statModalType, setStatModalType] = useState<StatModalType | null>(null);
  const [newWeight, setNewWeight] = useState<string>(profile.currentWeight.toString());
  const [newWaist, setNewWaist] = useState<string>('');
  const [newMood, setNewMood] = useState<'great' | 'good' | 'neutral' | 'struggling'>('good');
  const [newNotes, setNewNotes] = useState<string>('');

  // Customizable Dashboard Key Metrics (KPIs)
  const [activeKpis, setActiveKpis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`auraslim_kpis_${profile.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return profile.dashboardKpis || ['water', 'calories'];
  });
  const [showKpiCustomizer, setShowKpiCustomizer] = useState(false);

  const toggleKpi = (kpiKey: string) => {
    const updated = activeKpis.includes(kpiKey)
      ? activeKpis.filter(k => k !== kpiKey)
      : [...activeKpis, kpiKey];
    setActiveKpis(updated);
    try { localStorage.setItem(`auraslim_kpis_${profile.id}`, JSON.stringify(updated)); } catch {}
    onUpdateProfile?.({ dashboardKpis: updated });
  };

  // Camera weigh-in photo states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);
  const [chartPhoto, setChartPhoto] = useState<{url:string;date:string;weight:number}|null>(null);

  // Voice measurement recognition states
  const [isListening, setIsListening] = useState(false);
  const [activeMicField, setActiveMicField] = useState<'global' | 'weight' | 'waist' | 'notes' | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const speechControllerRef = useRef<SpeechRecognitionController | null>(null);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      speechControllerRef.current?.abort();
    };
  }, []);

  const handleToggleVoice = (targetField: 'global' | 'weight' | 'waist' | 'notes' = 'global') => {
    if (isListening && activeMicField === targetField) {
      speechControllerRef.current?.stop();
      setIsListening(false);
      setActiveMicField(null);
      return;
    }

    // Stop current listening session if active
    if (isListening) {
      speechControllerRef.current?.abort();
    }

    setVoiceError(null);
    setVoiceTranscript('');
    setVoiceFeedback(null);
    setActiveMicField(targetField);

    const controller = startSpeechRecognition({
      lang: profile.preferredLanguage || 'fr',
      continuous: false,
      interimResults: true,
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        setVoiceTranscript(transcript);
        if (isFinal) {
          const parsed = parseVoiceMeasurements(
            transcript,
            targetField === 'global' ? undefined : targetField
          );

          if (parsed.weight) setNewWeight(parsed.weight);
          if (parsed.waist) setNewWaist(parsed.waist);
          if (parsed.mood) setNewMood(parsed.mood);
          if (parsed.notes) {
            setNewNotes(prev => prev ? `${prev} • ${parsed.notes}` : parsed.notes || '');
          }

          setVoiceFeedback(parsed.summary || (t.voiceMeasurementSaved ? `${t.voiceMeasurementSaved} "${transcript}"` : `Mesure enregistrée : "${transcript}"`));
          setIsListening(false);
          setActiveMicField(null);
        }
      },
      onError: (err) => {
        setVoiceError(err);
        setIsListening(false);
        setActiveMicField(null);
      },
      onEnd: () => {
        setIsListening(false);
        setActiveMicField(null);
      }
    });

    if (!controller) {
      setIsListening(false);
      setActiveMicField(null);
      setVoiceError(t.voiceNotSupported || "Reconnaissance vocale non disponible sur ce navigateur.");
    } else {
      speechControllerRef.current = controller;
    }
  };

  const sortedEntries = chronologicalWeights(weightEntries);

  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const currentWeight = latestEntry ? latestEntry.weight : profile.currentWeight;
  const initialWeight = profile.startingWeight;
  const targetWeight = profile.targetWeight;
  const currentGoal: WeightGoalType = profile.weightGoal || 'lose';
  // The selected goal is authoritative; reaching the target must not silently
  // turn a loss/maintenance plan into another goal.
  const isGainGoal = profile.weightGoal ? profile.weightGoal === 'gain' : targetWeight > initialWeight;
  const isMaintainGoal = profile.weightGoal ? profile.weightGoal === 'maintain' : currentWeight === targetWeight;
  const isLoseGoal = !isGainGoal && !isMaintainGoal;

  // Compute current week's starting weight
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() - daysFromMonday);
  mondayDate.setHours(0, 0, 0, 0);

  const entriesThisWeek = sortedEntries.filter(e => new Date(e.date).getTime() >= mondayDate.getTime());
  const calculatedStartWeight = entriesThisWeek.length > 0 
    ? entriesThisWeek[0].weight 
    : (sortedEntries.length > 0 ? sortedEntries[Math.max(0, sortedEntries.length - 7)].weight : currentWeight);

  // Weekly Goal Target state with local storage persistence
  const [weeklyTarget, setWeeklyTarget] = useState<number>(() => {
    const saved = localStorage.getItem(`auraslim_weekly_target_${profile.id}`);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val > 20 && val < 300) return val;
    }
    return +(currentWeight + (isGainGoal ? 0.3 : -0.7)).toFixed(1);
  });

  const [weeklyStartWeight, setWeeklyStartWeight] = useState<number>(() => {
    const saved = localStorage.getItem(`auraslim_weekly_start_${profile.id}`);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val > 20 && val < 300) return val;
    }
    return calculatedStartWeight;
  });

  const [isEditingWeeklyTarget, setIsEditingWeeklyTarget] = useState(false);
  const [tempWeeklyTarget, setTempWeeklyTarget] = useState<string>(weeklyTarget.toString());
  const [tempWeeklyStart, setTempWeeklyStart] = useState<string>(weeklyStartWeight.toString());

  // Replace a stale loss target as soon as the user changes goal. Maintenance
  // targets the current weight; gain and loss use modest, direction-correct steps.
  useEffect(() => {
    const goalKey = `auraslim_weekly_goal_${profile.id}`;
    if (localStorage.getItem(goalKey) === currentGoal) return;
    const start = calculatedStartWeight;
    const target = +(currentWeight + (currentGoal === 'gain' ? 0.3 : currentGoal === 'lose' ? -0.4 : 0)).toFixed(1);
    setWeeklyStartWeight(start);
    setWeeklyTarget(target);
    setTempWeeklyStart(String(start));
    setTempWeeklyTarget(String(target));
    localStorage.setItem(`auraslim_weekly_start_${profile.id}`, String(start));
    localStorage.setItem(`auraslim_weekly_target_${profile.id}`, String(target));
    localStorage.setItem(goalKey, currentGoal);
    setIsEditingWeeklyTarget(false);
  }, [currentGoal, profile.id]);

  // Days until Sunday
  const daysUntilSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;

  // Weekly calculations
  const weeklyLossNeeded = Math.max(0.1, Math.abs(weeklyStartWeight - weeklyTarget));
  const weeklyLostSoFar = isGainGoal ? currentWeight - weeklyStartWeight : weeklyStartWeight - currentWeight;
  const weeklyRemaining = isMaintainGoal
    ? +Math.abs(currentWeight - weeklyTarget).toFixed(1)
    : Math.max(0, +(isGainGoal ? weeklyTarget - currentWeight : currentWeight - weeklyTarget).toFixed(1));
  const isWeeklyGoalAchieved = isMaintainGoal
    ? Math.abs(currentWeight - weeklyTarget) <= 0.5
    : isGainGoal ? currentWeight >= weeklyTarget : currentWeight <= weeklyTarget;
  const weeklyProgressPercent = isWeeklyGoalAchieved
    ? 100
    : Math.min(100, Math.max(0, Math.round((Math.max(0, weeklyLostSoFar) / weeklyLossNeeded) * 100)));
  
  const totalLost = Math.max(0, +(isGainGoal ? currentWeight - initialWeight : initialWeight - currentWeight).toFixed(1));
  const remaining = Math.max(0, +(isGainGoal ? targetWeight - currentWeight : currentWeight - targetWeight).toFixed(1));
  const totalToLose = Math.max(0.1, Math.abs(initialWeight - targetWeight));
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalLost / totalToLose) * 100)));

  // Calculate BMI
  const heightInMeters = profile.heightCm / 100;
  const bmi = +(currentWeight / (heightInMeters * heightInMeters)).toFixed(1);

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: t.bmiUnderweight || 'Insuffisance', color: 'text-amber-400' };
    if (bmiValue < 25) return { label: t.bmiNormal || 'Normal / Idéal', color: 'text-emerald-400' };
    if (bmiValue < 30) return { label: t.bmiOverweight || 'Surpoids léger', color: 'text-amber-400' };
    return { label: t.bmiObese || 'Obésité', color: 'text-rose-400' };
  };

  const bmiCat = getBmiCategory(bmi);

  // All recorded weights remain visible on the chart in chronological order.
  const displayedEntries = sortedEntries;

  const handleSubmitNewEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 30 || weightNum >= 300) return;

    const todayStr = localDate();
    onAddEntry({
      date: todayStr,
      createdAt: new Date().toISOString(),
      weight: weightNum,
      waistCm: newWaist ? parseFloat(newWaist) : undefined,
      mood: newMood,
      notes: newNotes.trim() || undefined,
      photoUrl: canTakePhoto ? (newPhotoUrl || undefined) : undefined,
    });

    // Milestone trigger celebratory confetti
    if (isGainGoal ? weightNum > currentWeight : weightNum < currentWeight) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore if canvas-confetti unsupported
      }
    }

    setShowLogModal(false);
    setNewNotes('');
    setNewPhotoUrl('');
  };

  // The curve shows logged weights only. Ambitions are entered in AmbitionPlan.
  const regressionAnalysis = {
    hasProjection:false,projectedWeight4w:currentWeight,diff4w:0,weeklyPace:0,rSquared:0,hasObservedTrend:false,observedWeeklyPace:0,daysToGoal:null,estimatedGoalDate:null,slopePerDay:0,explanation:'',healthAdvice:'',sportAdvice:'',isPaceStrict:false,calculationPaceTitle:''
  };

  // SVG Chart bounds & coordinates
  const chartWidth = 420;
  const chartHeight = 220;
  const paddingX = 38;
  const paddingY = 30;

  const weightsList = displayedEntries.map(e => e.weight);
  const minW = Math.min(...weightsList, targetWeight, regressionAnalysis.projectedWeight4w) - 1.5;
  const maxW = Math.max(...weightsList, initialWeight, regressionAnalysis.projectedWeight4w) + 1.5;

  const totalSlots = regressionAnalysis.hasProjection ? displayedEntries.length + 1 : displayedEntries.length;

  const getX = (index: number, count: number) => {
    if (count <= 1) return chartWidth / 2;
    return paddingX + (index / (count - 1)) * (chartWidth - 2 * paddingX);
  };

  const getY = (w: number) => {
    return chartHeight - paddingY - ((w - minW) / (maxW - minW)) * (chartHeight - 2 * paddingY);
  };

  const points = displayedEntries.map((entry, idx) => ({
    x: getX(idx, totalSlots),
    y: getY(entry.weight),
    entry
  }));

  const latestActualPoint = points[points.length - 1];
  const projectedPoint = regressionAnalysis.hasProjection ? {
    x: getX(displayedEntries.length, totalSlots),
    y: getY(regressionAnalysis.projectedWeight4w),
    weight: regressionAnalysis.projectedWeight4w
  } : null;

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`
    : '';

  const targetLineY = getY(targetWeight);

  return (
    <div className="space-y-6">
      {/* Prominent, highly legible Active Weight Goal Card (No repeated buttons) */}
      <div className={`p-4 sm:p-5 rounded-3xl ${theme.cardBg} border ${
        currentGoal === 'lose' ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-950' :
        currentGoal === 'gain' ? 'border-sky-500/40 bg-gradient-to-r from-sky-950/30 via-slate-900 to-slate-950' :
        'border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950'
      } shadow-xl relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              currentGoal === 'lose' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
              currentGoal === 'gain' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {currentGoal === 'lose' ? <TrendingDown className="w-6 h-6" /> :
               currentGoal === 'gain' ? <TrendingUp className="w-6 h-6" /> :
               <Activity className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t.goalChoiceLabel || "Objectif Corporel Actif"}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  currentGoal === 'lose' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  currentGoal === 'gain' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {currentGoal === 'lose' ? (t.goalLose || "Perdre du poids") :
                   currentGoal === 'gain' ? (t.goalGain || "Prendre du poids") :
                   (t.goalMaintain || "Stabilisation du poids")}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-heading">
                {currentGoal === 'lose' ? `📉 ${t.goalLose || "Perdre du poids"}` : currentGoal === 'gain' ? `📈 ${t.goalGain || "Prendre du poids"}` : `⚖️ ${t.goalMaintain || "Stabilisation du poids"}`}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                Cible : {targetWeight} kg · {currentGoal === 'maintain' ? 'Écart avec la cible' : currentGoal === 'gain' ? 'Reste à gagner' : 'Reste à perdre'} : {Math.abs(+(currentWeight - targetWeight).toFixed(1))} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified, High-Contrast Core Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Poids initial et date d'inscription */}
        <div 
          onClick={() => setStatModalType('current')}
          className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} hover:border-slate-500 transition-all cursor-pointer relative shadow-sm`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Poids initial & Inscription</span>
            <Calendar className={`w-4 h-4 ${theme.accentIcon}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              {initialWeight}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">kg</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Inscrit le {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(profile.preferredLanguage === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : (sortedEntries[0]?.date || 'Départ')}</span>
            <span className="text-[10px] text-rose-400 font-semibold">{t.detailsBtn || "Détails"} →</span>
          </div>
        </div>

        {/* Card 2: Poids ciblé et objectif cible */}
        <div 
          onClick={() => setStatModalType('target')}
          className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} hover:border-violet-500/60 transition-all cursor-pointer relative shadow-sm`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Poids ciblé & Objectif</span>
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              {targetWeight}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">kg</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="font-semibold text-violet-300">
              {currentGoal === 'gain' ? 'Prise de masse' : currentGoal === 'maintain' ? 'Stabilisation' : 'Perte de poids'}
            </span>
            <span className="text-slate-400">Actuel : {currentWeight} kg</span>
          </div>
        </div>

        <button onClick={() => document.getElementById('ambition-plan')?.scrollIntoView({behavior:'smooth',block:'start'})} className={`p-4 text-left rounded-2xl ${theme.cardBg} border border-orange-400 space-y-2`}>
          <span className="text-sm font-bold">{t.ambitionTitle || 'Mon ambition à 4 semaines'}</span>
          <span className="block text-2xl font-bold">{profile.fourWeeksTargetWeight === undefined ? (t.chooseGoal || 'À définir') : `${profile.fourWeeksTargetWeight} kg`}</span>
          <span className="text-xs">{t.personalGoalLabel || 'Le poids que vous souhaitez atteindre'}</span>
        </button>

        {/* Card 4: Progression globale */}
        <div 
          onClick={() => setStatModalType('progress')}
          className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} hover:border-rose-500/60 transition-all cursor-pointer relative shadow-sm`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Progression globale</span>
            <Award className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${theme.primary}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Customizable KPI Indicators Section (Eau, Calories consommées, Activité) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Indicateurs clés personnalisables
          </span>
          <button
            type="button"
            onClick={() => setShowKpiCustomizer(!showKpiCustomizer)}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition"
          >
            <span>{showKpiCustomizer ? "Fermer les options" : "⚙️ Ajouter / Supprimer des indicateurs"}</span>
          </button>
        </div>

        {showKpiCustomizer && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-2 text-xs">
            <p className="text-slate-300 font-medium">Cochez les indicateurs que vous souhaitez afficher sur votre tableau de bord :</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => toggleKpi('water')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeKpis.includes('water') ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'bg-slate-950 border-slate-700 text-slate-400'
                }`}
              >
                <Droplet size={14} className="text-sky-400" />
                <span>Hydratation (Eau bue vs objectif)</span>
                {activeKpis.includes('water') ? '✓' : '+'}
              </button>

              <button
                type="button"
                onClick={() => toggleKpi('calories')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeKpis.includes('calories') ? 'bg-rose-500/20 border-rose-400 text-rose-200' : 'bg-slate-950 border-slate-700 text-slate-400'
                }`}
              >
                <Flame size={14} className="text-rose-400" />
                <span>Calories consommées vs objectif</span>
                {activeKpis.includes('calories') ? '✓' : '+'}
              </button>

              <button
                type="button"
                onClick={() => toggleKpi('activity')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeKpis.includes('activity') ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-slate-950 border-slate-700 text-slate-400'
                }`}
              >
                <Activity size={14} className="text-amber-400" />
                <span>Activité & Dépense</span>
                {activeKpis.includes('activity') ? '✓' : '+'}
              </button>
            </div>
          </div>
        )}

        {/* Dynamic KPI Widgets */}
        {activeKpis.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeKpis.includes('water') && (() => {
              const waterLogs = getStoredWaterLogs().filter(e => e.date === localDate());
              const waterLiters = +(waterLogs.reduce((sum, e) => sum + e.amountMl, 0) / 1000).toFixed(2);
              const waterGoal = profile.waterGoalLiters || 2.0;
              const pct = Math.min(100, Math.round((waterLiters / waterGoal) * 100));
              return (
                <div key="kpi-water" className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
                      <Droplet size={14} /> Eau consommée aujourd'hui
                    </span>
                    <div className="text-lg font-bold text-white mt-1">
                      {waterLiters} <span className="text-xs text-slate-400 font-normal">/ {waterGoal} L ({pct}%)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleKpi('water')}
                    className="text-slate-500 hover:text-rose-400 text-xs p-1"
                    title="Masquer cet indicateur"
                  >
                    ✕
                  </button>
                </div>
              );
            })()}

            {activeKpis.includes('calories') && (() => {
              const nutritionLogs = getStoredNutrition().filter(e => e.date === localDate());
              const caloriesTotal = nutritionLogs.reduce((sum, e) => sum + (e.calories || 0), 0);
              const calTarget = profile.dailyCalorieTarget || 1800;
              const pct = Math.min(100, Math.round((caloriesTotal / calTarget) * 100));
              return (
                <div key="kpi-cal" className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                      <Flame size={14} /> Total calories du jour
                    </span>
                    <div className="text-lg font-bold text-white mt-1">
                      {caloriesTotal} <span className="text-xs text-slate-400 font-normal">/ {calTarget} kcal ({pct}%)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleKpi('calories')}
                    className="text-slate-500 hover:text-rose-400 text-xs p-1"
                    title="Masquer cet indicateur"
                  >
                    ✕
                  </button>
                </div>
              );
            })()}

            {activeKpis.includes('activity') && (
              <div key="kpi-act" className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Activity size={14} /> Dépense active estimée
                  </span>
                  <div className="text-lg font-bold text-white mt-1">
                    ~350 <span className="text-xs text-slate-400 font-normal">kcal brûlées</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleKpi('activity')}
                  className="text-slate-500 hover:text-rose-400 text-xs p-1"
                  title="Masquer cet indicateur"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION: Objectifs Hebdomadaires */}
      <div className={`p-5 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl relative overflow-hidden`}>
        {/* Glow effect matching theme */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${theme.primaryBg} border border-rose-400/30 shadow-lg shadow-rose-500/10`}>
              <Target className={`w-5 h-5 ${theme.accentIcon}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {t.weeklyGoalTitle || "Objectifs Hebdomadaires"}
                </h3>
                {isWeeklyGoalAchieved && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    {t.weeklyGoalAchieved || "Objectif atteint !"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.weeklyGoalSubtitle || "Définissez votre cible pour la semaine et visualisez votre progression en direct."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setTempWeeklyTarget(weeklyTarget.toString());
                setTempWeeklyStart(weeklyStartWeight.toString());
                setIsEditingWeeklyTarget(!isEditingWeeklyTarget);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>{isEditingWeeklyTarget ? (t.closeBtn || "Fermer") : (t.weeklyGoalEditBtn || "Ajuster la cible")}</span>
            </button>
          </div>
        </div>

        {/* Inline Target Editor when opened */}
        {isEditingWeeklyTarget && (
          <div className="mb-5 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 relative z-10 animate-in fade-in duration-200 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                {t.weeklyGoalSetTarget || "Définir la cible de la semaine"}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.weeklyGoalCurrentWeight || 'Poids actuel'} : <strong className="text-slate-900 dark:text-white">{currentWeight} kg</strong>
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-2">
              {(isMaintainGoal
                ? [{ label: 'Stabilité −0,2 kg', delta: -0.2 }, { label: 'Poids stable', delta: 0 }, { label: 'Stabilité +0,2 kg', delta: 0.2 }]
                : isGainGoal
                  ? [{ label: 'Prise douce +0,2 kg', delta: 0.2 }, { label: 'Prise modérée +0,3 kg', delta: 0.3 }, { label: 'Prise +0,4 kg', delta: 0.4 }]
                  : [{ label: t.weeklyGoalPresetGentle || 'Perte douce (-0.4 kg)', delta: -0.4 }, { label: t.weeklyGoalPresetStandard || 'Standard (-0.7 kg)', delta: -0.7 }, { label: t.weeklyGoalPresetIntense || 'Intensif (-1.0 kg)', delta: -1.0 }]
              ).map((preset, idx) => {
                const presetTarget = +(currentWeight + preset.delta).toFixed(1);
                const isSelected = parseFloat(tempWeeklyTarget) === presetTarget;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTempWeeklyTarget(presetTarget.toString())}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition ${
                      isSelected
                        ? `${theme.primaryBg} border-rose-400 font-bold text-white shadow-md`
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] truncate">{preset.label}</div>
                    <div className="text-xs font-extrabold text-white mt-0.5">{presetTarget} kg</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {t.weeklyGoalWeekTargetLabel || "Poids cible de fin de semaine (kg)"}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(tempWeeklyTarget) || currentWeight;
                      setTempWeeklyTarget((cur - 0.1).toFixed(1));
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={tempWeeklyTarget}
                    onChange={(e) => setTempWeeklyTarget(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-base font-bold text-white focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(tempWeeklyTarget) || currentWeight;
                      setTempWeeklyTarget((cur + 0.1).toFixed(1));
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {t.weeklyGoalStartWeight || "Poids de début de semaine (kg)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempWeeklyStart}
                  onChange={(e) => setTempWeeklyStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-base font-bold text-white focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsEditingWeeklyTarget(false)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
              >
                {t.closeBtn || "Annuler"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetVal = parseFloat(tempWeeklyTarget);
                  const startVal = parseFloat(tempWeeklyStart);
                  if (!isNaN(targetVal) && targetVal > 20) {
                    setWeeklyTarget(targetVal);
                    localStorage.setItem(`auraslim_weekly_target_${profile.id}`, targetVal.toString());
                  }
                  if (!isNaN(startVal) && startVal > 20) {
                    setWeeklyStartWeight(startVal);
                    localStorage.setItem(`auraslim_weekly_start_${profile.id}`, startVal.toString());
                  }
                  setIsEditingWeeklyTarget(false);
                  if (!isNaN(targetVal) && (isMaintainGoal ? Math.abs(currentWeight - targetVal) <= 0.5 : isGainGoal ? currentWeight >= targetVal : currentWeight <= targetVal)) {
                    try {
                      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                    } catch {}
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${theme.primary}`}
              >
                {t.weeklyGoalSaveBtn || "Enregistrer la cible"}
              </button>
            </div>
          </div>
        )}

        {/* 3 Themed Metric Stat Tiles (Poids actuel removed as requested) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 relative z-10">
          <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">{t.weeklyStartWeightLabel || t.weeklyGoalStartWeight || "Départ semaine"}</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white font-heading">{weeklyStartWeight} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">kg</span></span>
          </div>

          <div className={`p-3 rounded-2xl border shadow-xs ${isWeeklyGoalAchieved ? 'border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/20' : 'bg-white/90 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/90'}`}>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">{t.weeklyTargetLabel || t.weeklyGoalWeekTargetLabel || "Cible semaine"}</span>
            <span className={`text-lg font-bold font-heading ${isWeeklyGoalAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {weeklyTarget} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">kg</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">
              {isWeeklyGoalAchieved ? (t.weeklyProgressAchievedTitle || 'Progression cette semaine') : (t.weeklyRemainingLabel || 'Reste vers la cible')}
            </span>
            <span className={`text-lg font-bold font-heading ${isWeeklyGoalAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isMaintainGoal ? `${weeklyRemaining} kg d’écart` : isWeeklyGoalAchieved ? `${isGainGoal ? '+' : '-'}${Math.abs(weeklyStartWeight - currentWeight).toFixed(1)} kg` : `${weeklyRemaining} kg`}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar Component Styled Thematically */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 space-y-3 relative z-10 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                {t.weeklyGoalProgress || "Progression hebdomadaire"}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isWeeklyGoalAchieved 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : `${theme.primaryBg} text-rose-300 border border-rose-400/30`
              }`}>
                {weeklyProgressPercent}%
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{daysUntilSunday} {t.daysUntilSundayLabel || t.weeklyGoalDaysLeft || "jours restants d'ici dimanche"}</span>
            </div>
          </div>

          {/* Styled Thematic Progress Bar Track */}
          <div className="relative pt-2 pb-1">
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 relative shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 relative ${
                  isWeeklyGoalAchieved 
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-lg shadow-emerald-500/30'
                    : `${theme.primary} shadow-lg shadow-rose-500/20`
                }`}
                style={{ width: `${Math.max(4, weeklyProgressPercent)}%` }}
              >
                {/* Visual shine bar */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
              </div>
            </div>

            {/* Milestones beneath track */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
              <div className="flex flex-col items-start">
                <span className="font-semibold text-slate-300">{weeklyStartWeight} kg</span>
                <span className="text-[9px] text-slate-500">{t.milestoneStart || "Départ"}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="font-semibold text-sky-400">{currentWeight} kg</span>
                <span className="text-[9px] text-slate-400">{t.milestoneCurrent || "Actuel"} ({weeklyProgressPercent}%)</span>
              </div>

              <div className="flex flex-col items-end">
                <span className={`font-semibold ${isWeeklyGoalAchieved ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {weeklyTarget} kg
                </span>
                <span className="text-[9px] text-slate-500">{t.milestoneSundayTarget || "Cible dimanche"}</span>
              </div>
            </div>
          </div>

          {/* Status Message Card */}
          <div className={`mt-2 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            isWeeklyGoalAchieved 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            {isWeeklyGoalAchieved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">
                  {t.weeklyGoalTargetReachedNotice || "Bravo ! Vous avez atteint votre objectif fixé pour cette semaine."}
                </span>
              </>
            ) : (
              <>
                <Sparkles className={`w-4 h-4 ${theme.accentIcon} shrink-0`} />
                <span className="font-medium text-slate-300">
                  {t.weeklyGoalKeepGoingNotice || "Continuez vos efforts, vous êtes sur la bonne voie !"}
                  {weeklyRemaining > 0 && (
                    <span className="text-white font-bold ml-1">
                      ({t.goalLabel || "Objectif"} : {weeklyRemaining} kg {isMaintainGoal ? 'd’écart à la cible' : isGainGoal ? (t.toGain || 'à gagner') : (t.toLose || 'à perdre')})
                    </span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <AmbitionPlan profile={profile} onUpdateProfile={onUpdateProfile}/>

      {/* Main Interactive Chart Section */}
      <div className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} relative overflow-hidden shadow-xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${theme.accentIcon}`} />
              {t.weightHistoryTrendTitle || "Historique et tendance des pesées"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.weightChartSubtitle || "Courbe de vos pesées, de la plus ancienne à la plus récente."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenHealthReport && (
              <button
                onClick={onOpenHealthReport}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white flex items-center gap-1.5 transition shadow-sm"
                title={t.reportTitle || "Bilan de santé"}
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">{t.openHealthReport || "Bilan Nutritionniste PDF"}</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}

            <button
              onClick={() => setShowLogModal(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${theme.primary}`}
            >
              <PlusCircle className="w-4 h-4" />
              {t.logWeightBtn}
            </button>
          </div>
        </div>

        <p className="mb-3 text-xs text-slate-400">{t.chartReadingDirection || "Vos relevés se lisent de gauche à droite, du plus ancien au plus récent."}</p>

        {/* SVG Curve Canvas */}
        <div className="w-full min-w-0">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="block h-auto w-full max-h-52" role="img" aria-label={t.weightChartSubtitle || "Courbe des poids enregistrés par ordre chronologique"}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.chartLine} stopOpacity="0.35" />
                <stop offset="100%" stopColor={theme.chartLine} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target Weight Horizontal Guide */}
            <line
              x1={paddingX}
              y1={targetLineY}
              x2={chartWidth - paddingX}
              y2={targetLineY}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text
              x={chartWidth - paddingX}
              y={targetLineY - 6}
              textAnchor="end"
              fill="#10b981"
              fontSize="10"
              fontWeight="bold"
            >
              {t.goalLabel || "Objectif"} : {targetWeight} kg
            </text>

            {/* Shaded Area under Curve */}
            {areaD && (
              <path d={areaD} fill="url(#chartGradient)" />
            )}

            {/* Main Weight Path Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={theme.chartLine}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Points */}
            {points.map((pt, i) => {
              const photoUrl = pt.entry.photoUrl || (pt.entry.id === sortedEntries[0]?.id ? profile.initialPhotoUrl : undefined);
              const thumbnailY = pt.y > chartHeight - paddingY - 48 ? Math.max(4, pt.y - 36) : Math.min(chartHeight - paddingY - 34, pt.y + 8);
              return (
              <g key={pt.entry.id} className={`group ${photoUrl ? 'cursor-zoom-in' : ''}`} role={photoUrl ? 'button' : undefined} tabIndex={photoUrl ? 0 : undefined} aria-label={photoUrl ? `Agrandir la photo du ${pt.entry.date}, ${pt.entry.weight} kg` : undefined} onClick={() => photoUrl && setChartPhoto({url:photoUrl,date:pt.entry.date,weight:pt.entry.weight})} onKeyDown={e => { if (photoUrl && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setChartPhoto({url:photoUrl,date:pt.entry.date,weight:pt.entry.weight}); } }}>
                {photoUrl && <>
                  <title>{`Photo du ${pt.entry.date} · ${pt.entry.weight} kg · cliquer pour agrandir`}</title>
                  <rect x={pt.x-12} y={thumbnailY-1} width="24" height="30" rx="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
                  <image href={photoUrl} x={pt.x-11} y={thumbnailY} width="22" height="28" preserveAspectRatio="xMidYMid slice" />
                </>}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  className="fill-slate-950 stroke-2 transition-all duration-200 group-hover:r-7"
                  stroke={theme.chartLine}
                />
                {/* Floating Value on point */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fill="var(--chart-label, #f8fafc)"
                  fontSize="11"
                  fontWeight="bold"
                  className="drop-shadow"
                >
                  {pt.entry.weight}
                </text>
                {/* Date Label on Axis */}
                <text
                  x={pt.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                >
                  {pt.entry.date.slice(5)}
                </text>
              </g>
            );})}
            {/* 4-Week Linear Regression Projection Line & Point */}
            {regressionAnalysis.hasProjection && projectedPoint && latestActualPoint && (
              <g className="projection-point-group">
                {/* Dashed connector line from latest point to projected point */}
                <line
                  x1={latestActualPoint.x}
                  y1={latestActualPoint.y}
                  x2={projectedPoint.x}
                  y2={projectedPoint.y}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                {/* Projected Node Aura & Circle */}
                <circle
                  cx={projectedPoint.x}
                  cy={projectedPoint.y}
                  r="10"
                  className="fill-sky-500/25 animate-pulse"
                />
                <circle
                  cx={projectedPoint.x}
                  cy={projectedPoint.y}
                  r="5"
                  className="fill-slate-950 stroke-2"
                  stroke="#38bdf8"
                />

                {/* Floating Projected Value on point */}
                <g transform={`translate(${projectedPoint.x}, ${projectedPoint.y - 12})`}>
                  <rect
                    x="-32"
                    y="-16"
                    width="64"
                    height="16"
                    rx="8"
                    fill="#0284c7"
                    className="shadow-lg"
                  />
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {projectedPoint.weight} kg
                  </text>
                </g>

                {/* Date / Timeframe Label on Axis */}
                <text
                  x={projectedPoint.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="9"
                  fontWeight="bold"
                >
                  +4 {t.weekAbbrevShort || 'sem.'}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full" style={{ backgroundColor: theme.chartLine }} />
              <span>{t.measuredWeightLegend || "Poids mesuré"}</span>
            </div>
            {regressionAnalysis.hasProjection && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b-2 border-sky-400 border-dashed" />
                <span className="text-sky-400 font-medium">{t.projection4wLegend || "Projection +4 sem."} ({regressionAnalysis.projectedWeight4w} kg)</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-emerald-400 border-dashed" />
              <span className="text-emerald-400">{t.goalLegend || "Objectif"} ({targetWeight} kg)</span>
            </div>
          </div>
          <span className="text-slate-500">
            {t.latestWeighInLabel || "Dernière pesée :"} {latestEntry?.date || (t.todayLabel || 'Aujourdhui')}
          </span>
        </div>
      </div>

      {/* History Log Table */}
      <div className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder}`}>
        <h4 className="text-base font-bold text-white mb-3 flex items-center justify-between">
          <span>{t.weightHistory}</span>
          <span className="text-xs text-slate-400 font-normal">
            {weightEntries.length} {t.weighInsLoggedCount || "pesées enregistrées"}
          </span>
        </h4>

        <div className="divide-y divide-slate-800/60">
          {sortedEntries.map(entry => {
            const isInitialEntry = entry.id === sortedEntries[0]?.id;
            const day = weightTrackingDay(entry.date, sortedEntries[0].date);
            const photoToShow = entry.photoUrl || (isInitialEntry ? profile.initialPhotoUrl : undefined);

            return (
              <div key={entry.id} className="py-3 flex items-center justify-between gap-3 text-sm hover:bg-slate-800/20 px-2 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${theme.primaryBg}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white flex flex-wrap items-center gap-2">
                      <span>{entry.weight} kg</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-bold border border-violet-500/30">
                        {(t.trackingDayLabel || 'Jour {day}').replace('{day}', String(day))}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{entry.date}</span>
                      {entry.bodyFatPercentage && (
                        <span>· {entry.bodyFatPercentage}% {t.bodyFatAbbrev || 'MG'}</span>
                      )}
                      {entry.waistCm && (
                        <span>· {t.waistLabel || 'Taille'}: {entry.waistCm}cm</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {photoToShow && (
                    <button
                      type="button"
                      onClick={() => setViewingPhotoUrl(photoToShow || null)}
                      className="p-1.5 rounded-xl bg-slate-800/80 text-rose-300 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 text-xs font-medium transition group"
                      title={isInitialEntry && !entry.photoUrl ? "Photo initiale prise lors de l'inscription" : (t.cameraScalePhoto || "Photo de la balance")}
                    >
                      <div className="w-5 h-5 rounded-lg overflow-hidden border border-slate-600 bg-slate-900 shrink-0">
                        <img src={photoToShow} alt={t.cameraScalePhoto || "Pesée"} className="w-full h-full object-cover" />
                      </div>
                      <span className="hidden sm:inline text-[11px]">
                        {isInitialEntry && !entry.photoUrl ? "Photo départ" : (t.cameraGallery || "Photo")}
                      </span>
                    </button>
                  )}
                  {entry.notes && entry.notes !== 'Poids de départ (Inscription)' && (
                    <span className="hidden md:inline text-xs text-slate-400 italic max-w-xs truncate">
                      "{entry.notes}"
                    </span>
                  )}
                  {entry.mood === 'great' && <Smile className="w-4 h-4 text-emerald-400" />}
                  {entry.mood === 'good' && <Smile className="w-4 h-4 text-cyan-400" />}
                  {entry.mood === 'neutral' && <Meh className="w-4 h-4 text-amber-400" />}
                  {entry.mood === 'struggling' && <Frown className="w-4 h-4 text-rose-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Weight Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex justify-center items-start p-2 sm:p-4">
          <div className={`w-full max-w-md rounded-3xl ${theme.cardBg} border ${theme.cardBorder} p-6 shadow-2xl my-2 sm:my-auto max-h-[calc(100dvh-1rem)] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-white font-heading">
                {t.logWeightBtn}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowLogModal(false);
                  setNewPhotoUrl('');
                  if (isListening) speechControllerRef.current?.abort();
                }}
                className="p-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition flex items-center justify-center shadow-sm"
                aria-label={t.closeBtn || "Fermer"}
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {t.logWeightSubtitle || "Enregistrez vos métriques du jour manuellement ou directement à la voix avec le microphone."}
            </p>

            {/* Smart Voice Dictation Assistant Banner */}
            <div className={`mb-4 p-3.5 rounded-2xl border transition-all ${
              isListening && activeMicField === 'global'
                ? 'bg-rose-500/15 border-rose-500/50 shadow-lg shadow-rose-500/20'
                : voiceFeedback
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-slate-950/70 border-slate-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('global')}
                    className={`p-2.5 rounded-2xl transition-all flex items-center justify-center ${
                      isListening && activeMicField === 'global'
                        ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50 scale-105'
                        : `${theme.primaryBg} hover:scale-105 text-white`
                    }`}
                    title={isListening ? (t.voiceStopDictation || "Arrêter la dictée") : (t.voiceStartDictation || "Activer la dictée vocale")}
                  >
                    {isListening && activeMicField === 'global' ? (
                      <MicOff className="w-4 h-4 text-white" />
                    ) : (
                      <Mic className="w-4 h-4 text-rose-400" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {t.voiceInputTitle || "Saisie Vocale des Mesures"}
                      </span>
                      {isListening && activeMicField === 'global' && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white animate-pulse">
                          {t.voiceListeningBadge || "EN ÉCOUTE"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isListening && activeMicField === 'global'
                        ? (voiceTranscript || (t.voiceInputListening || "Écoute en cours... Parlez maintenant"))
                        : (t.voiceInputHint || "Dites par ex: « 72,5 kilos, tour de taille 80 »")}
                    </p>
                  </div>
                </div>

                {isListening && activeMicField === 'global' ? (
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('global')}
                    className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold transition shadow"
                  >
                    {t.voiceInputStop || "Arrêter"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('global')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <Mic className="w-3 h-3 text-rose-400" />
                    <span>{t.dictateBtn || "Dicter"}</span>
                  </button>
                )}
              </div>

              {/* Realtime Spoken Wave & Transcript */}
              {isListening && activeMicField === 'global' && (
                <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 flex items-center gap-2">
                  <div className="flex items-center gap-1 h-3">
                    <span className="w-1 h-2 bg-rose-400 animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-3 bg-rose-400 animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-rose-400 animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-medium text-rose-200 italic truncate">
                    {voiceTranscript || (t.voiceInputListening || "Parlez maintenant (ex: 69.5 kilos, tour de taille 80)...")}
                  </span>
                </div>
              )}

              {/* Detected result badge */}
              {voiceFeedback && !isListening && (
                <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{voiceFeedback}</span>
                </div>
              )}

              {/* Voice Error notice */}
              {voiceError && (
                <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-center gap-1.5 text-xs text-rose-300 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{voiceError}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitNewEntry} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t.bodyWeightInputLabel || "Poids corporel (kg) *"}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('weight')}
                    className={`p-1 rounded-lg text-[11px] flex items-center gap-1 transition ${
                      isListening && activeMicField === 'weight'
                        ? 'bg-rose-500 text-white animate-pulse px-2'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={t.dictateBtn || "Dicter"}
                  >
                    <Mic className="w-3 h-3 text-rose-400" />
                    <span className="text-[10px]">
                      {isListening && activeMicField === 'weight' ? (t.voiceListeningBadge || "Écoute...") : "Micro"}
                    </span>
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              {!canTakePhoto && <button type="button" onClick={onOpenUpgradeModal} className="w-full rounded-xl border border-amber-500/40 p-3 text-amber-300">{t.twoPhotosFreeUsedNotice || "Deux photos de pesée offertes ont été utilisées. Débloquer la galerie pour photographier la prochaine pesée."}</button>}
              {/* Direct Camera Scale Photo Capture */}
              {canTakePhoto && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    {t.scalePhotoOrSilhouette || "Photo de la pesée / silhouette"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">{t.optionalBadge || "Optionnel"}</span>
                </label>

                {newPhotoUrl ? (
                  <div className="relative aspect-[16/9] max-h-36 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={newPhotoUrl} alt="Balance" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-between p-2.5">
                      <span className="text-[11px] text-white font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {t.photoSavedBadge || "Photo enregistrée"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-white text-xs border border-slate-600 hover:bg-slate-700 transition"
                        >
                          {t.cameraRetake || "Reprendre"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPhotoUrl('')}
                          className="p-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/50 text-slate-300 flex items-center justify-center gap-2 text-xs font-semibold transition group hover:bg-slate-900/60"
                  >
                    <div className={`p-1.5 rounded-lg ${theme.primaryBg} group-hover:scale-110 transition`}>
                      <Camera className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-white">
                      {t.takeScalePhotoBtn || "Prendre une photo de pesée"}
                    </span>
                  </button>
                )}
              </div>

              )}
              <div>
                <div className="flex items-center justify-between mb-1"><label className="block text-xs font-semibold text-slate-300">{t.waistInputLabel || "Tour de taille (cm)"}</label><button type="button" aria-label={t.dictateWaist || "Dicter le tour de taille"} onClick={() => handleToggleVoice('waist')}><Mic className="w-4 h-4 text-rose-400" /></button></div>
                <input type="number" min="20" max="250" step="0.1" placeholder="Ex. 83" value={newWaist} onChange={event => setNewWaist(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.moodLabel}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'great', label: t.moodGreat || 'Top', icon: Smile },
                    { id: 'good', label: t.moodGood || 'Bien', icon: Smile },
                    { id: 'neutral', label: t.moodNeutral || 'Moyen', icon: Meh },
                    { id: 'struggling', label: t.moodStruggling || 'Difficile', icon: Frown },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewMood(item.id as any)}
                      className={`py-2 px-1 rounded-xl text-xs flex flex-col items-center gap-1 border transition ${
                        newMood === item.id 
                          ? `${theme.primaryBg} border-rose-400 font-bold`
                          : 'border-slate-800 bg-slate-950/40 text-slate-400'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t.notesLabel || "Notes ou ressentis"}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('notes')}
                    className={`p-1 rounded-lg text-[10px] flex items-center gap-0.5 transition ${
                      isListening && activeMicField === 'notes'
                        ? 'bg-rose-500 text-white animate-pulse px-1.5'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={t.dictateNotes || "Dicter des notes"}
                  >
                    <Mic className="w-3 h-3 text-rose-400" />
                    <span>{isListening && activeMicField === 'notes' ? (t.voiceListeningBadge || "Écoute...") : (t.dictateBtn || "Dicter")}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder={t.notesPlaceholder || "Énergie, faim, entraînement..."}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    setNewPhotoUrl('');
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 transition"
                >
                  {t.cancelBtn || "Annuler"}
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${theme.primary}`}
                >
                  {t.saveEntry}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Modal for Weigh-in Scale Photo */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setNewPhotoUrl(img);
          setIsCameraOpen(false);
        }}
        title={t.cameraScalePhoto || "Photographier votre balance"}
        subtitle={t.cameraScalePhotoOptional || "Cadrez l'écran de votre pèse-personne pour immortaliser et vérifier votre mesure"}
        theme={theme}
        t={t}
        idealFacingMode="environment"
      />

      {/* Lightbox for viewing scale photo */}
      {viewingPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`relative max-w-lg w-full rounded-3xl ${theme.cardBg} border ${theme.cardBorder} p-4 shadow-2xl overflow-hidden`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" />
                {t.cameraScalePhoto || "Photo de la balance"}
              </span>
              <button
                type="button"
                onClick={() => setViewingPhotoUrl(null)}
                className="p-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition flex items-center justify-center shadow-sm"
                aria-label={t.closeBtn || "Fermer"}
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[70vh] flex items-center justify-center bg-black">
              <img src={viewingPhotoUrl} alt="Photo de balance" className="w-full h-auto object-contain max-h-[68vh]" />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPhotoUrl(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                {t.closeBtn || "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {chartPhoto && (
        <div role="dialog" aria-modal="true" aria-label={`Photo du ${chartPhoto.date}, ${chartPhoto.weight} kg`} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4" onClick={() => setChartPhoto(null)}>
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-4" onClick={e=>e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between text-sm font-bold text-white"><span>{chartPhoto.date} · {chartPhoto.weight} kg</span><button type="button" aria-label="Fermer" className="rounded-lg bg-slate-800 px-3 py-1" onClick={()=>setChartPhoto(null)}>✕</button></div>
            <img src={chartPhoto.url} alt={`Photo de suivi du ${chartPhoto.date}, ${chartPhoto.weight} kg`} className="mx-auto max-h-[75vh] max-w-full rounded-xl object-contain" />
          </div>
        </div>
      )}

      {/* Interactive Modal for Clickable Stat Cards (IMC, Projection 4w, Target, Current, Progress) */}
      <StatDetailModal
        isOpen={statModalType !== null}
        type={statModalType}
        onClose={() => setStatModalType(null)}
        profile={profile}
        currentWeight={currentWeight}
        initialWeight={initialWeight}
        targetWeight={targetWeight}
        bmi={bmi}
        progressPercent={progressPercent}
        regressionAnalysis={regressionAnalysis}
        theme={theme}
        t={t}
      />
    </div>
  );
};
