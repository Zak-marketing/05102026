import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  Target, 
  Scale, 
  Award, 
  Sparkles, 
  Calculator, 
  CheckCircle2 
} from 'lucide-react';
import type { UserProfile, WeightGoalType } from '../types';
import type { ThemeColors } from '../services/theme';
import type { TranslationDictionary } from '../services/i18n';

export type StatModalType = 'current' | 'target' | 'bmi' | 'projection' | 'progress';

interface Props {
  isOpen: boolean;
  type: StatModalType | null;
  onClose: () => void;
  profile: UserProfile;
  currentWeight: number;
  initialWeight: number;
  targetWeight: number;
  bmi: number;
  progressPercent: number;
  regressionAnalysis: {
    hasProjection: boolean;
    projectedWeight4w: number;
    diff4w: number;
    weeklyPace: number;
    rSquared: number;
    daysToGoal: number | null;
    estimatedGoalDate: string | null;
  };
  theme: ThemeColors;
  t: TranslationDictionary;
}

export const StatDetailModal: React.FC<Props> = ({
  type,
  isOpen,
  onClose,
  profile,
  currentWeight,
  initialWeight,
  targetWeight,
  bmi,
  progressPercent,
  regressionAnalysis,
  theme,
  t
}) => {
  const goal: WeightGoalType = profile.weightGoal || 'lose';

  // State for simulated weekly pace in 4-week advantage simulator
  const [simulatedWeeklyPace, setSimulatedWeeklyPace] = useState<number>(-0.5);

  // Height and WHO Healthy Weight Range calculations
  const heightM = (profile.heightCm || 170) / 100;
  const minNormalWeight = +(18.5 * heightM * heightM).toFixed(1);
  const maxNormalWeight = +(24.9 * heightM * heightM).toFixed(1);

  if (!isOpen || !type) return null;

  const simulated28dWeight = +(currentWeight + (simulatedWeeklyPace * 4)).toFixed(1);
  const simulatedDiff = +(simulated28dWeight - currentWeight).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      <div className={`w-full max-w-xl rounded-3xl ${theme.cardBg} border ${theme.cardBorder} p-5 sm:p-7 shadow-2xl relative max-h-[92dvh] overflow-y-auto`}>
        {/* Header with Palette-styled Close Button (Orange/Emerald/White, Never a black cross) */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {type === 'bmi' && <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30"><Activity className="w-5 h-5" /></div>}
            {type === 'projection' && <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/30"><Sparkles className="w-5 h-5" /></div>}
            {type === 'target' && <div className="p-2.5 rounded-2xl bg-violet-500/20 text-violet-500 dark:text-violet-400 border border-violet-500/30"><Target className="w-5 h-5" /></div>}
            {type === 'current' && <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30"><Scale className="w-5 h-5" /></div>}
            {type === 'progress' && <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30"><Award className="w-5 h-5" /></div>}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                {type === 'bmi' && (t.bmiExplTitle || "Comprendre votre Indice de Masse Corporelle (IMC)")}
                {type === 'projection' && (t.projectionExplTitle || "Avantage & Projection à 4 semaines")}
                {type === 'target' && (t.targetExplTitle || "Votre Objectif Cible")}
                {type === 'current' && (t.currentExplTitle || "Votre Poids Actuel & Évolution")}
                {type === 'progress' && (t.progressExplTitle || "Votre Progression Globale")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {type === 'bmi' && `${profile.name || t.profileTitle || 'Profil'} · ${profile.heightCm} cm · ${currentWeight} kg`}
                {type === 'projection' && (t.simulationDynamic28d || "Simulation dynamique & plan d'action sur 28 jours")}
                {type === 'target' && `${t.targetGoalSub || "Objectif fixé :"} ${targetWeight} kg`}
                {type === 'current' && `${t.startWeightShort || "Départ"} : ${initialWeight} kg → ${t.currentWeightShort || "Actuel"} : ${currentWeight} kg`}
                {type === 'progress' && `${progressPercent}% ${t.progressJourneyAccomplished || "de votre parcours accompli"}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition flex items-center justify-center shadow-sm"
            aria-label={t.closeBtn || "Fermer"}
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* MODAL CONTENT: IMC / BMI (Formula placed at the VERY BOTTOM as requested) */}
        {type === 'bmi' && (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            {/* 1. Range classification OMS at TOP */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                {t.whoClassificationTitle || "Grille de référence OMS"}
              </h4>
              <div className="space-y-2 text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${bmi < 18.5 ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold' : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <span>&lt; 18.5 : {t.bmiUnderweight || "Insuffisance pondérale / Maigreur"}</span>
                  {bmi < 18.5 && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-bold">{t.yourPositionBadge || "Votre position"}</span>}
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${bmi >= 18.5 && bmi < 25 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold' : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <span>18.5 à 24.9 : {t.bmiNormal || "Corpulence normale / Poids santé"}</span>
                  {bmi >= 18.5 && bmi < 25 && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">{t.yourPositionBadge || "Votre position"}</span>}
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${bmi >= 25 && bmi < 30 ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold' : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <span>25.0 à 29.9 : {t.bmiOverweight || "Surpoids"}</span>
                  {bmi >= 25 && bmi < 30 && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-bold">{t.yourPositionBadge || "Votre position"}</span>}
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${bmi >= 30 ? 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold' : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <span>&ge; 30.0 : {t.bmiObese || "Obésité"}</span>
                  {bmi >= 30 && <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-[10px] text-rose-700 dark:text-rose-300 font-bold">{t.yourPositionBadge || "Votre position"}</span>}
                </div>
              </div>
            </div>

            {/* 2. Personalized ideal weight zone for height in MIDDLE */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.healthyWeightRangeTitle || "Fourchette de poids santé pour votre taille"} ({profile.heightCm} cm)</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-200">
                {t.betweenRange || "Entre"} <strong>{minNormalWeight} kg</strong> {t.andWord || "et"} <strong>{maxNormalWeight} kg</strong>.
                {targetWeight >= minNormalWeight && targetWeight <= maxNormalWeight ? (
                  <span className="block mt-1 text-emerald-700 dark:text-emerald-300 font-medium">
                    {t.goalInHealthyRange 
                      ? t.goalInHealthyRange.replace('{targetWeight}', String(targetWeight))
                      : `✓ Votre objectif actuel (${targetWeight} kg) se situe parfaitement dans votre zone de poids santé idéal !`}
                  </span>
                ) : (
                  <span className="block mt-1 text-emerald-700 dark:text-emerald-300 font-medium">
                    {t.goalOutsideHealthyRange
                      ? t.goalOutsideHealthyRange.replace('{targetWeight}', String(targetWeight))
                      : `Votre objectif actuel est de ${targetWeight} kg. Adaptez votre alimentation progressivement pour pérenniser votre santé.`}
                  </span>
                )}
              </p>
            </div>

            {/* 3. EXACT CALCULATION FORMULA AT THE VERY BOTTOM OF THE WINDOW AS REQUESTED */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-900/80 border border-amber-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {t.formulaTitle || "Formule de calcul exacte (Norme OMS)"}
              </span>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950 font-mono text-center text-sm text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-slate-700 shadow-inner">
                {t.bmiLabel || "IMC"} = {t.weightLabel || "Poids"} (kg) / [{t.heightLabel || "Taille"} (m)]² = {currentWeight} / ({heightM})² = <strong className="text-lg font-bold text-amber-700 dark:text-amber-400">{bmi} kg/m²</strong>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.whoNormNotice || "L'IMC est la norme médicale internationale établie par l'Organisation Mondiale de la Santé (OMS) pour évaluer la corpulence corporelle chez l'adulte."}
              </p>
            </div>
          </div>
        )}

        {/* MODAL CONTENT: PROJECTION À 4 SEMAINES */}
        {type === 'projection' && (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {t.projected4wTitle || "Projection indicative à 4 semaines"}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30">
                  R² = {regressionAnalysis.rSquared}%
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                {t.mathExtrapolationDisclaimer || t.projected4wSubtitle || "Extrapolation mathématique basée sur vos relevés, sans valeur médicale ni garantie de résultat."}
              </p>

              <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.currentPaceLabel || "Rythme actuel"}</span>
                  <strong className="text-slate-900 dark:text-white text-sm">{regressionAnalysis.weeklyPace} kg/{t.weekUnit || 'semaine'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.projectedWeight28d || "Poids projeté dans 28 jours"}</span>
                  <strong className="text-sky-700 dark:text-sky-300 text-sm">
                    {regressionAnalysis.projectedWeight4w} kg ({regressionAnalysis.diff4w <= 0 ? '' : '+'}{regressionAnalysis.diff4w} kg)
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.estimatedGoalDateLabel || "Date estimée de l'objectif"} ({targetWeight} kg)</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-xs">
                    {regressionAnalysis.estimatedGoalDate || t.maintainingPace || 'Maintien du rythme en cours'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.fitR2Label || "Ajustement aux relevés (R²)"}</span>
                  <strong className="text-sky-700 dark:text-sky-400 text-sm">{regressionAnalysis.rSquared}%</strong>
                </div>
              </div>
            </div>

            {/* AVANTAGE PROJECTION : SIMULATEUR DYNAMIQUE 4 SEMAINES */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-emerald-500/10 border-2 border-orange-400/40 dark:border-orange-500/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-orange-500 dark:text-rose-400" />
                  {t.simulatorAdvantage4wTitle || "Simulateur Avantage 4 Semaines (Encouragement)"}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-300 font-bold border border-orange-500/30">
                  {t.vision28Days || "Vision dans 28 jours"}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {t.simulatorVisionPrompt || "Visualisez dès aujourd'hui le résultat de votre engagement sur 4 semaines selon votre rythme hebdomadaire :"}
              </p>

              {/* Selector buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { pace: -0.3, label: `-0.3 kg/${t.weekAbbrevShort || 'sem'}`, desc: t.simPaceGentle || 'Doux' },
                  { pace: -0.5, label: `-0.5 kg/${t.weekAbbrevShort || 'sem'}`, desc: t.simPaceIdeal || 'Idéal' },
                  { pace: -0.8, label: `-0.8 kg/${t.weekAbbrevShort || 'sem'}`, desc: t.simPaceDynamic || 'Dynamique' },
                  { pace: -1.0, label: `-1.0 kg/${t.weekAbbrevShort || 'sem'}`, desc: t.simPaceIntense || 'Intense' }
                ].map(item => (
                  <button
                    key={item.pace}
                    type="button"
                    onClick={() => setSimulatedWeeklyPace(item.pace)}
                    className={`p-2 rounded-xl border text-center transition ${
                      simulatedWeeklyPace === item.pace
                        ? 'bg-orange-500 text-white font-bold border-orange-600 shadow-md shadow-orange-500/20'
                        : 'bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] opacity-80">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Simulation Result Callout */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-orange-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t.in4WeeksYouWouldBeAt || "Dans 4 semaines, vous seriez à :"}</span>
                  <div className="text-2xl font-black text-orange-600 dark:text-orange-400 font-heading">
                    {simulated28dWeight} kg
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    {simulatedDiff} kg {t.diffIn28DaysLabel || "en 28 jours"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {t.remainingAfterwardsLabel || "Reste ensuite :"} {Math.max(0, +(simulated28dWeight - targetWeight).toFixed(1))} kg
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION PLAN : PLAN D'ACTION POUR RÉUSSIR DANS LES 4 SEMAINES */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t.whatToDoToSucceed4w || "Qu'est-ce qu'il faut faire pour réussir dans les 4 semaines ?"}
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">{t.actionPlanRule1Title || "Déficit calorique modéré et durable :"}</strong> {t.actionPlanRule1Text || `viser un déficit de 300 à 500 kcal/jour (ou cible journalière de ${profile.dailyCalorieTarget} kcal). Évitez les régimes drastiques qui ralentissent le métabolisme.`}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">{t.actionPlanRule2Title || "Hydratation constante :"}</strong> {t.actionPlanRule2Text || `boire au moins ${profile.waterGoalLiters || 2.5}L d'eau par jour. Boire avant chaque repas diminue la faim et facilite l'élimination métabolique.`}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 text-[11px]">3</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">{t.actionPlanRule3Title || "Protéines à chaque repas (1.6g à 2g/kg) :"}</strong> {t.actionPlanRule3Text || "préserve votre masse musculaire pour que chaque kilo perdu vienne de la masse grasse et non du muscle."}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">4</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">{t.actionPlanRule4Title || "Activité & 8 000 à 10 000 pas quotidiens :"}</strong> {t.actionPlanRule4Text || "la marche active quotidienne permet de brûler 300 à 400 kcal sans augmenter le stress corporel."}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0 text-[11px]">5</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">{t.actionPlanRule5Title || "Pesée régulière le matin à jeun :"}</strong> {t.actionPlanRule5Text || "notez le résultat sans culpabilité ; observez la tendance sur 7 jours plutôt que les micro-variations d'eau."}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* MODAL CONTENT: OBJECTIF CIBLE (Fully translated) */}
        {type === 'target' && (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-500/30 space-y-2">
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider block">
                {t.targetAnalysisTitle || "Analyse de votre objectif cible"}
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">{targetWeight} kg</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    ({goal === 'lose' ? (t.goalLoseWord || t.goalLose || 'Perte de poids') : goal === 'gain' ? (t.goalGainWord || t.goalGain || 'Prise de masse') : (t.goalMaintainWord || t.goalMaintain || 'Stabilisation')})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t.targetRemainingGap || "Écart restant"}</span>
                  <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                    {Math.abs(currentWeight - targetWeight).toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t.targetEstimatedDurationTitle || "Durée estimée selon votre rythme"}
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                {t.targetDurationIntro || "Pour combler sainement l'écart restant :"}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">0.5 {t.perWeekShort || "kg / sem"}</span>
                  <strong className="text-slate-900 dark:text-white text-xs">{Math.ceil(Math.abs(currentWeight - targetWeight) / 0.5)} {t.weeksUnit || "semaines"}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">0.7 {t.perWeekShort || "kg / sem"}</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-xs">{Math.ceil(Math.abs(currentWeight - targetWeight) / 0.7)} {t.weeksUnit || "semaines"}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">1.0 {t.perWeekShort || "kg / sem"}</span>
                  <strong className="text-sky-700 dark:text-sky-400 text-xs">{Math.ceil(Math.abs(currentWeight - targetWeight) / 1.0)} {t.weeksUnit || "semaines"}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONTENT: POIDS ACTUEL (Fully translated) */}
        {type === 'current' && (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.currentOverviewTitle || "Bilan actuel"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.startWeightShort || "Départ"} : {initialWeight} kg
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">{currentWeight} kg</span>
                <span className={`text-sm font-bold ${currentWeight <= initialWeight ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {currentWeight <= initialWeight ? '-' : '+'}{Math.abs(currentWeight - initialWeight).toFixed(1)} kg {t.sinceStartLabel || "depuis le début"}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.currentContinuousAnalysisNotice || "Toutes vos pesées enregistrées sont analysées en continu afin de calculer votre métabolisme de croisière et votre projection à 28 jours."}
            </p>
          </div>
        )}

        {/* MODAL CONTENT: PROGRESSION GLOBALE (Fully translated) */}
        {type === 'progress' && (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-center space-y-2">
              <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">{progressPercent}%</div>
              <p className="text-xs text-emerald-800 dark:text-emerald-200">
                {t.progressDistanceCovered 
                  ? t.progressDistanceCovered.replace('{percent}', String(progressPercent)).replace('{initial}', String(initialWeight)).replace('{target}', String(targetWeight))
                  : `Vous avez déjà franchi ${progressPercent}% de la distance séparant votre poids initial (${initialWeight} kg) de votre cible (${targetWeight} kg).`}
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-bold text-xs transition shadow-sm active:scale-95"
          >
            {t.closeBtn || "Fermer"}
          </button>
        </div>
      </div>
    </div>
  );
};
