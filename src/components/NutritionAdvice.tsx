import React from 'react';
import { Droplet, Utensils, Scale } from 'lucide-react';
import type { UserProfile, NutritionEntry, WeightEntry, SmartwatchData } from '../types';
import type { ThemeColors } from '../services/theme';
import type { TranslationDictionary } from '../services/i18n';
import { getStoredWaterLogs } from '../services/storage';
import { localDate } from '../services/dates';

interface Props { profile: UserProfile; nutritionEntries: NutritionEntry[]; latestWeightEntry?: WeightEntry; smartwatch: SmartwatchData; theme: ThemeColors; t: TranslationDictionary; }
export const NutritionAdvice: React.FC<Props> = ({ profile, nutritionEntries, latestWeightEntry, theme, t }) => {
  const today = localDate();
  const meals = nutritionEntries.filter(entry => entry.date === today);
  const totalCalories = meals.reduce((sum, entry) => sum + entry.calories, 0);
  const waterLiters = getStoredWaterLogs().filter(entry => entry.date === today).reduce((sum, entry) => sum + entry.amountMl, 0) / 1000;
  const isEn = profile.preferredLanguage !== 'fr';
  return <section className={`space-y-3 rounded-2xl border p-4 sm:p-6 ${theme.cardBg}`}>
    <h3 className="text-lg font-bold">{t?.nutritionAdviceTitle || (isEn ? "Your Daily Summary" : "Votre journée selon vos saisies")}</h3>
    <p className="text-xs text-slate-400">{t?.nutritionAdviceSubtitle || (isEn ? "Values entered or estimated from meals; this summary does not replace medical advice." : "Valeurs renseignées ou estimées à partir des photos de repas; ce résumé ne remplace pas les conseils d'un professionnel de santé.")}</p>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-slate-950/50 p-3">
        <Utensils className="mb-2 h-5 w-5 text-rose-400"/>
        <strong className="text-white font-bold">{totalCalories} kcal</strong>
        <p className="text-xs text-slate-400 mt-1">
          {t?.nutritionMealsLoggedSummary
            ? t.nutritionMealsLoggedSummary.replace('{count}', String(meals.length)).replace('{target}', String(profile.dailyCalorieTarget))
            : (isEn ? `${meals.length} meal(s) logged today. Target: ${profile.dailyCalorieTarget} kcal.` : `Sur ${meals.length} aliment(s) enregistré(s) aujourd'hui. Objectif indicatif : ${profile.dailyCalorieTarget} kcal.`)}
        </p>
      </div>
      <div className="rounded-xl bg-slate-950/50 p-3">
        <Droplet className="mb-2 h-5 w-5 text-cyan-400"/>
        <strong className="text-white font-bold">{waterLiters.toFixed(2)} L</strong>
        <p className="text-xs text-slate-400 mt-1">
          {t?.nutritionHydrationSummary
            ? t.nutritionHydrationSummary.replace('{goal}', String(profile.waterGoalLiters))
            : (isEn ? `Hydration logged of ${profile.waterGoalLiters} L target.` : `Hydratation notée sur ${profile.waterGoalLiters} L souhaités.`)}
        </p>
      </div>
      <div className="rounded-xl bg-slate-950/50 p-3">
        <Scale className="mb-2 h-5 w-5 text-emerald-400"/>
        <strong className="text-white font-bold">{latestWeightEntry?.weight ?? profile.startingWeight} kg</strong>
        <p className="text-xs text-slate-400 mt-1">
          {t?.nutritionLatestWeightSummary
            ? t.nutritionLatestWeightSummary.replace('{date}', latestWeightEntry?.date || (t?.dayOneLabel || 'initial'))
            : (isEn ? `Latest check-in: ${latestWeightEntry?.date || 'initial'}.` : `Dernière pesée enregistrée : ${latestWeightEntry?.date || 'non datée'}.`)}
        </p>
      </div>
    </div>
  </section>;
};
