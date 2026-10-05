import React, { useEffect, useState } from 'react';
import { X, Lock, Crown } from 'lucide-react';
import type { UserProfile, WeightEntry, NutritionEntry, SmartwatchData, UserPlan, WeeklyPhoto } from '../types';
import type { ThemeColors } from '../services/theme';
import type { TranslationDictionary } from '../services/i18n';
import { chronologicalWeights, currentWeight } from '../services/weightHistory';
import { AuraLogo } from './AuraLogo';

interface Props { 
  isOpen: boolean; 
  onClose: () => void; 
  profile: UserProfile; 
  weightEntries: WeightEntry[]; 
  weeklyPhotos: WeeklyPhoto[];
  nutritionEntries: NutritionEntry[]; 
  smartwatch: SmartwatchData; 
  theme: ThemeColors; 
  t: TranslationDictionary; 
  onOpenUpgradeModal?: (plan?: UserPlan) => void;
  onIncrementReportCount?: () => void;
}

export const HealthReportModal: React.FC<Props> = ({
  isOpen, 
  onClose, 
  profile, 
  weightEntries, 
  weeklyPhotos,
  nutritionEntries, 
  smartwatch, 
  theme, 
  t,
  onOpenUpgradeModal,
  onIncrementReportCount
}) => {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (isOpen) setError(''); }, [isOpen]);
  if (!isOpen) return null;

  const sorted = chronologicalWeights(weightEntries);
  const current = currentWeight(weightEntries, profile);
  const hasUnlimitedPDF = profile.plan === 'complete_pack' || profile.plan === 'pro';
  const hasUsedFreeReport = (profile.pdfReportGeneratedCount || 0) >= 1;
  const isLocked = !hasUnlimitedPDF && hasUsedFreeReport;

  const download = async () => {
    if (isLocked) {
      onClose();
      onOpenUpgradeModal?.('complete_pack');
      return;
    }

    setBusy(true); 
    setError('');
    try {
      const { generateNutritionistPDF } = await import('../services/pdfReportGenerator');
      const result = await generateNutritionistPDF({ profile, weightEntries, weeklyPhotos, nutritionEntries, smartwatch, t });
      if (!result.success || !result.blobUrl) { 
        setError(result.error || 'Impossible de créer le PDF.'); 
        return; 
      }
      const link = document.createElement('a'); 
      link.href = result.blobUrl; 
      link.download = result.filename;
      document.body.append(link); 
      link.click(); 
      link.remove();
      setTimeout(() => URL.revokeObjectURL(result.blobUrl!), 60_000);
      onIncrementReportCount?.();
    } catch { 
      setError('Impossible de charger le modèle PDF. Réessayez.'); 
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={t.pdfReportTitle || "Bilan personnel"} className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-2 sm:p-5">
      <section className={`mx-auto my-4 max-w-3xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl ${theme.cardBg}`}>
        <div className="flex items-start justify-between gap-2 border-b-4 border-emerald-500 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-emerald-500/15 p-4 sm:p-6">
          <div>
            <AuraLogo compact />
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{t.pdfReportTitle || "Bilan personnel de suivi"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.pdfReportSubtitle || "Résumé des valeurs réellement enregistrées. Document informatif, non médical."}</p>
          </div>
          <button 
            onClick={onClose} 
            aria-label={t.closeBtn || "Fermer le bilan"} 
            className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition flex items-center justify-center shadow-sm"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Free limit locked banner */}
          {isLocked ? (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm font-bold text-white">1 Bilan personnel PDF gratuit déjà utilisé</strong>
                  <span>Pour télécharger des bilans PDF illimités et accéder au programme complet de nutrition, activez Auraslim Premium - Pack Complet Illimité (6,99 €/mois).</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpgradeModal?.('complete_pack');
                }}
                className="action-primary px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shrink-0 shadow-lg"
              >
                <Crown className="w-4 h-4" />
                <span>Pack Complet (6,99 €/mois)</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              ✓ 1 Bilan personnel PDF officiel inclus gratuitement en version d'essai.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [t.pdfStart || 'Poids initial', profile.startingWeight + ' kg'], 
              [t.pdfLatest || 'Poids actuel', current + ' kg'],
              [t.pdfChange || 'Évolution', (+(current - profile.startingWeight).toFixed(1) > 0 ? '+' : '') + (current - profile.startingWeight).toFixed(1) + ' kg'],
              [t.pdfGoal || 'Poids cible', profile.targetWeight + ' kg']
            ].map(([name, value], index) => (
              <div className={`rounded-xl border p-3 ${index % 2 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-orange-500/30 bg-orange-500/10'}`} key={name}>
                <p className="text-xs text-slate-500 dark:text-slate-400">{name}</p>
                <strong className="text-lg text-slate-900 dark:text-white">{value}</strong>
              </div>
            ))}
          </div>

          <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{t.pdfWeightLog || "Historique des pesées"}</h3>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
            {sorted.map(entry => (
              <p key={entry.id} className="py-2 text-sm text-slate-700 dark:text-slate-300">
                {entry.date} · {entry.weight} kg {entry.waistCm != null ? `· ${t.waistLabel || 'taille'} ${entry.waistCm} cm` : ''}
              </p>
            ))}
          </div>

          <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{t.pdfMealLog || "Repas enregistrés"} ({nutritionEntries.length})</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.nutritionPdfBannerDesc || "Les calories issues des photos restent des estimations."}</p>

          {error && <p role="alert" className="mt-2 text-rose-500 text-xs">{error}</p>}

          {isLocked ? (
            <button 
              type="button"
              onClick={() => {
                onClose();
                onOpenUpgradeModal?.('complete_pack');
              }} 
              className="action-primary mt-4 w-full rounded-xl p-3.5 font-bold flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Débloquer les Bilans PDF Illimités (Pack Complet - 6,99 €/mois)</span>
            </button>
          ) : (
            <button 
              onClick={download} 
              disabled={busy} 
              className="action-primary mt-4 w-full rounded-xl p-3.5 font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy ? (t.pdfPreparing || 'Préparation du PDF…') : (t.pdfDownloadBtn || 'Télécharger le bilan PDF')}
            </button>
          )}

          <p className="mt-3 text-center text-xs text-slate-400">AuraSlim · sales@auraslim.com</p>
        </div>
      </section>
    </div>
  );
};
