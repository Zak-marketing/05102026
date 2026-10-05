import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, 
  Droplet, 
  Plus, 
  Minus, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Info, 
  Clock, 
  Trash2,
  GlassWater,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, WaterLogEntry } from '../types';
import { ThemeColors } from '../services/theme';
import { TranslationDictionary } from '../services/i18n';
import { getStoredWaterLogs, saveStoredWaterLogs } from '../services/storage';
import { localDate } from '../services/dates';

interface WaterIntakeTrackerProps {
  profile: UserProfile;
  theme: ThemeColors;
  t: TranslationDictionary;
  onWaterUpdate?: (totalLiters: number) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const WaterIntakeTracker: React.FC<WaterIntakeTrackerProps> = ({
  profile,
  theme,
  t,
  onWaterUpdate,
  onUpdateProfile,
}) => {
  const todayStr = localDate();

  const [waterLogs, setWaterLogs] = useState<WaterLogEntry[]>(() => {
    return getStoredWaterLogs();
  });

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(profile.waterGoalLiters?.toString() || '2.5');

  // Filter today's water entries
  const todaysLogs = waterLogs.filter(log => log.date === todayStr);
  const currentMl = todaysLogs.reduce((sum, item) => sum + item.amountMl, 0);
  const currentLiters = +(currentMl / 1000).toFixed(2);
  const goalLiters = profile.waterGoalLiters || 2.5;
  const goalMl = goalLiters * 1000;
  const percentage = Math.min(100, Math.round((currentMl / (goalMl || 1)) * 100));

  const GLASS_SIZE_ML = 250;
  const currentGlasses = Math.floor(currentMl / GLASS_SIZE_ML);
  const targetGlasses = Math.ceil(goalMl / GLASS_SIZE_ML);

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const prevLitersRef = useRef<number | null>(null);

  // Sync state to storage whenever waterLogs changes
  useEffect(() => {
    saveStoredWaterLogs(waterLogs);
  }, [waterLogs]);

  // Notify parent only when currentLiters actually changes value
  useEffect(() => {
    if (prevLitersRef.current !== currentLiters) {
      prevLitersRef.current = currentLiters;
      if (onWaterUpdate) {
        onWaterUpdate(currentLiters);
      }
    }
  }, [currentLiters, onWaterUpdate]);

  // Log water helper
  const handleAddWater = (amountMl: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: WaterLogEntry = {
      id: `water_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: todayStr,
      time: timeStr,
      amountMl,
    };

    const newLogs = [newLog, ...waterLogs];
    setWaterLogs(newLogs);

    // If goal reached just now, trigger confetti celebration
    const newTotalMl = currentMl + amountMl;
    if (currentMl < goalMl && newTotalMl >= goalMl) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  };

  // Remove last glass
  const handleRemoveLastGlass = () => {
    if (todaysLogs.length === 0) return;
    const firstTodayId = todaysLogs[0].id;
    setWaterLogs(prev => prev.filter(item => item.id !== firstTodayId));
  };

  // Delete specific log
  const handleDeleteLog = (id: string) => {
    setWaterLogs(prev => prev.filter(item => item.id !== id));
  };

  // Reset today's water without blocking window.confirm in iframe
  const handleResetToday = () => {
    setWaterLogs(prev => prev.filter(item => item.date !== todayStr));
    setShowConfirmReset(false);
  };

  // Direct toggle on glass index (1-based index)
  const handleGlassClick = (index: number) => {
    const targetMl = index * GLASS_SIZE_ML;
    if (targetMl > currentMl) {
      // Add difference
      handleAddWater(targetMl - currentMl);
    } else if (targetMl === currentMl) {
      // If clicking current exact glass, remove one glass
      handleRemoveLastGlass();
    } else {
      // User tapped an earlier glass, adjust downwards by removing entries
      const diffToRemove = currentMl - targetMl;
      let removedSoFar = 0;
      const idsToRemove: string[] = [];

      for (const log of todaysLogs) {
        if (removedSoFar < diffToRemove) {
          idsToRemove.push(log.id);
          removedSoFar += log.amountMl;
        }
      }
      setWaterLogs(prev => prev.filter(item => !idsToRemove.includes(item.id)));
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customGoalInput);
    if (!isNaN(val) && val >= 1.0 && val <= 6.0) {
      if (onUpdateProfile) {
        onUpdateProfile({ waterGoalLiters: val });
      }
      setShowGoalModal(false);
    }
  };

  const isGoalReached = currentLiters >= goalLiters;

  return (
    <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl relative overflow-hidden transition-all`}>
      {/* Decorative Cyan Radial Glow Background */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-500/10">
            <GlassWater className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-heading">
                {t.waterTrackerTitle || "Suivi d'Hydratation & Verres d'Eau"}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {percentage}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.waterGuide || "Chaque verre d'eau enregistré vous rapproche de votre objectif personnel."}
            </p>
          </div>
        </div>

        {/* Goal Indicator & Adjust Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            title={t.waterEditGoalTitle || "Modifier l'objectif d'eau"}
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.waterTargetLabel || 'Cible'} : {goalLiters} L</span>
          </button>

          {todaysLogs.length > 0 && (
            showConfirmReset ? (
              <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 rounded-xl p-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={handleResetToday}
                  className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold transition"
                >
                  {t.confirmBtn || "Confirmer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white text-[10px] font-semibold transition"
                >
                  {t.cancelBtn || "Annuler"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 transition"
                title={t.waterResetDay || "Réinitialiser la journée"}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Hydration Progress Bar & Status */}
      <div className="space-y-3 mb-6 relative z-10">
        <div className="flex items-baseline justify-between text-xs">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-heading tracking-tight">
              {currentLiters.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm font-semibold">/ {goalLiters.toFixed(1)} L</span>
            <span className="text-xs text-cyan-400 font-bold ml-1">
              ({currentGlasses} {t.glassesCount || 'verres'} · {GLASS_SIZE_ML}ml)
            </span>
          </div>

          <div className="text-right">
            {isGoalReached ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.waterGoalReached || "Objectif atteint !"}</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                {(goalLiters - currentLiters).toFixed(2)} L {t.remainingLabel ? t.remainingLabel.toLowerCase() : 'restants'}
              </span>
            )}
          </div>
        </div>

        {/* Liquid Water Progress Meter */}
        <div className="w-full bg-slate-950/80 rounded-full h-4 p-0.5 border border-slate-800 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isGoalReached
                ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 shadow-lg shadow-cyan-500/30'
                : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 shadow-md shadow-cyan-500/20'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Interactive Glasses Row */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verres de 250 ml (Cliquez pour marquer) :</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {currentGlasses} / {targetGlasses} bus
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
          {Array.from({ length: targetGlasses }).map((_, idx) => {
            const glassNumber = idx + 1;
            const isFilled = glassNumber <= currentGlasses;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleGlassClick(glassNumber)}
                className={`py-3 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 group ${
                  isFilled
                    ? 'bg-gradient-to-b from-cyan-500/25 to-blue-600/30 border-cyan-400/60 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
                title={`Verre ${glassNumber} (${glassNumber * GLASS_SIZE_ML} ml)`}
              >
                <div className="relative">
                  <GlassWater 
                    className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                      isFilled ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-slate-600'
                    }`} 
                  />
                  {isFilled && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping pointer-events-none" />
                  )}
                </div>
                <span className={`text-[10px] font-bold ${isFilled ? 'text-cyan-200' : 'text-slate-500'}`}>
                  #{glassNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 relative z-10">
        <button
          type="button"
          onClick={() => handleAddWater(250)}
          className="py-3 px-3 rounded-2xl bg-cyan-700 hover:bg-cyan-800 border border-cyan-800 text-white-keep font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 transition transform active:scale-98"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>+1 Verre (250 ml)</span>
        </button>

        <button
          type="button"
          onClick={() => handleAddWater(500)}
          className="py-3 px-3 rounded-2xl bg-blue-700 hover:bg-blue-800 border border-blue-800 text-white-keep font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition transform active:scale-98"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>+1 Gourde (500 ml)</span>
        </button>

        <button
          type="button"
          onClick={() => handleAddWater(1000)}
          className="py-3 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 text-white-keep font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 transition transform active:scale-98"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>+1 Bouteille (1 L)</span>
        </button>

        <button
          type="button"
          onClick={handleRemoveLastGlass}
          disabled={todaysLogs.length === 0}
          className="py-3 px-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs flex items-center justify-center gap-2 transition"
        >
          <Minus className="w-4 h-4" />
          <span>-1 Verre (Annuler)</span>
        </button>
      </div>

      {/* Hydration encouragement & Recent Today's Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
        {/* Simple reminder without a clinical or calorie-burning claim. */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">
              Votre routine d'hydratation
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {t.waterGuide || "Pensez à boire régulièrement selon votre soif et vos besoins."}
            </p>
          </div>
        </div>

        {/* Today's History */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.waterLogsTodayTitle || "Prises d'eau du jour :"}</span>
            </span>
            <span className="text-[10px] text-slate-500">{todaysLogs.length}</span>
          </div>

          {todaysLogs.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-1">
              {t.waterNoGlassesToday || "Aucun verre enregistré aujourd'hui. Cliquez sur +1 verre pour commencer."}
            </p>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {todaysLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 shrink-0 group"
                >
                  <span className="text-cyan-400 font-bold">{log.amountMl >= 1000 ? `${log.amountMl / 1000} L` : `${log.amountMl} ml`}</span>
                  <span className="text-slate-500 text-[10px]">{log.time}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-slate-600 hover:text-rose-400 ml-1 transition"
                    title={t.waterDeleteEntry || "Supprimer cette prise"}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl">
            <h4 className="text-sm font-bold text-white mb-1">
              {t.dailyHydrationGoalTitle || "Objectif d'Hydratation Quotidienne"}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              {t.dailyHydrationGoalDesc || "Recommandé : 2.0 à 3.0 Litres par jour selon votre poids et activité."}
            </p>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="6.0"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">{t.litersPerDayUnit || "Litres / jour"}</span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2">
                {[2.0, 2.5, 3.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomGoalInput(preset.toString())}
                    className="py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    {preset} L
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/20 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
