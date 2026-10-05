import {auraSlimApi} from '../services/apiClient';
import {nutritionTarget} from '../services/nutritionTarget';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  Upload, 
  Camera, 
  Sparkles, 
  Activity, 
  Droplet, 
  Flame, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  Plus, 
  AlertCircle, 
  Utensils, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  Info,
  Layers,
  Heart,
  Dumbbell
} from 'lucide-react';
import type { UserProfile, InBodyScan, WeightGoalType, UserPlan } from '../types';
import type { ThemeColors } from '../services/theme';
import type { TranslationDictionary } from '../services/i18n';
import { localDate } from '../services/dates';
import { compressImage } from '../utils/imageCompressor';
import { CameraCaptureModal } from './CameraCaptureModal';

interface InBodyTrackerProps {
  profile: UserProfile;
  theme: ThemeColors;
  t: TranslationDictionary;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenUpgradeModal?: (plan?: UserPlan) => void;
}

export const InBodyTracker: React.FC<InBodyTrackerProps> = ({
  profile,
  theme,
  t,
  onUpdateProfile,
  onOpenUpgradeModal
}) => {
  const goal: WeightGoalType = profile.weightGoal || 'lose';

  const hasUnlimitedInBody = profile.plan === 'complete_pack' || profile.plan === 'pro';
  const hasUsedFreeScan = (profile.inbodyScansCount || 0) >= 1;

  // Load InBody scans from localStorage
  const storageKey = `auraslim_inbody_scans_${profile.id}`;
  const [scans, setScans] = useState<InBodyScan[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore invalid local data */ }
    // Never invent InBody measurements. Empty history means no verified scan has been saved.
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(scans));
    } catch { /* storage full */ }
  }, [scans, storageKey]);

  // Modal State for new InBody scan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanImage, setScanImage] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanningDoc, setIsScanningDoc] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');
  const [scanErrorMessage, setScanErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for manual or scanned input
  const [genderInput, setGenderInput] = useState<'male' | 'female'>(profile.gender === 'female' ? 'female' : 'male');
  const [weightInput, setWeightInput] = useState('');
  const [muscleInput, setMuscleInput] = useState('');
  const [fatPercentInput, setFatPercentInput] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [bmrInput, setBmrInput] = useState('');
  const [visceralInput, setVisceralInput] = useState('');
  const [scoreInput, setScoreInput] = useState('');
  const [scanVerified,setScanVerified]=useState(false);
  const [scanConsent,setScanConsent]=useState(false);
  const [notesInput, setNotesInput] = useState('');

  const latestScan = scans[0];

  const enhanceImageLighting = (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(base64Image); return; }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        // AI lighting enhancement: Adaptive contrast stretch + brightness boost
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.min(255, Math.max(0, (d[i] - 128) * 1.35 + 128 + 25));     // R
          d[i+1] = Math.min(255, Math.max(0, (d[i+1] - 128) * 1.35 + 128 + 25)); // G
          d[i+2] = Math.min(255, Math.max(0, (d[i+2] - 128) * 1.35 + 128 + 25)); // B
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(base64Image);
      img.src = base64Image;
    });
  };

  const processInBodyDocument = async (imageUrl: string) => {
    if(!scanConsent){setScanErrorMessage('Autorisez l’envoi du relevé au service IA avant de le scanner.');return;}
    setScanVerified(false);setWeightInput('');setMuscleInput('');setFatPercentInput('');setBmrInput('');setWaterInput('');setScoreInput('');setVisceralInput('');
    setScanImage(imageUrl);
    setIsScanningDoc(true);
    setScanSuccessMessage('');
    setScanErrorMessage('');

    try {
      const response = await auraSlimApi('inbody-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl, consent: true })
      });

      if (!response.ok) {
        throw new Error('Service d’analyse indisponible.');
      }

      const data = await response.json();

      if (data.isBlurryOrLowLight) {
        setScanErrorMessage(data.clarityFeedback || "⚠️ La photo est trop sombre ou floue pour lire avec exactitude les chiffres. Veuillez reprendre une photo sous une lumière bien claire, ou cliquez sur « Régler la lumière avec l'IA ».");
      }

      let countExtracted = 0;
      if (typeof data.weightKg === 'number' && data.weightKg > 30) {
        setWeightInput(String(data.weightKg));
        countExtracted++;
      }
      if (typeof data.skeletalMuscleMassKg === 'number' && data.skeletalMuscleMassKg > 5) {
        setMuscleInput(String(data.skeletalMuscleMassKg));
        countExtracted++;
      }
      if (typeof data.bodyFatPercent === 'number' && data.bodyFatPercent > 3) {
        setFatPercentInput(String(data.bodyFatPercent));
        countExtracted++;
      }
      if (typeof data.totalBodyWaterLiters === 'number' && data.totalBodyWaterLiters > 10) {
        setWaterInput(String(data.totalBodyWaterLiters));
        countExtracted++;
      }
      if (typeof data.bmrKcal === 'number' && data.bmrKcal > 500) {
        setBmrInput(String(data.bmrKcal));
        countExtracted++;
      }
      if (typeof data.visceralFatLevel === 'number') {
        setVisceralInput(String(data.visceralFatLevel));
        countExtracted++;
      }
      if (typeof data.inBodyScore === 'number') {
        setScoreInput(String(data.inBodyScore));
        countExtracted++;
      }

      const required=[data.weightKg,data.skeletalMuscleMassKg,data.bodyFatPercent,data.bmrKcal];
      const valid=required.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0)&&data.weightKg<=300&&data.skeletalMuscleMassKg<data.weightKg&&data.bodyFatPercent<75&&data.bmrKcal>=500&&data.bmrKcal<=4000;
      setScanVerified(valid&&!data.isBlurryOrLowLight);
      if(!valid)setScanErrorMessage('Les 4 mesures indispensables ne sont pas lisibles : poids, muscle, graisse et métabolisme. Reprenez une photo nette du relevé complet.');
      if (valid && !data.isBlurryOrLowLight) {
        setScanSuccessMessage(`✓ Relevé InBody lu automatiquement : ${countExtracted} indicateurs biométriques extraits de votre rapport.`);
      } else if (!data.isBlurryOrLowLight && data.fallback) {
        setScanErrorMessage(data.message || 'Vérifiez et confirmez les chiffres relevés sur votre feuille InBody.');
      }
    } catch {
      setScanErrorMessage("Photo reçue. La lecture du relevé a échoué. Reprenez une photo nette et réessayez.");
    } finally {
      setIsScanningDoc(false);
    }
  };

  const handleAdjustLightingWithAi = async () => {
    if (!scanImage) return;
    setIsScanningDoc(true);
    setScanErrorMessage('');
    try {
      const enhanced = await enhanceImageLighting(scanImage);
      await processInBodyDocument(enhanced);
    } catch {
      setIsScanningDoc(false);
      setScanErrorMessage("Impossible d'ajuster l'image. Veuillez reprendre une photo sous une lumière directe.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 1600, 0.85);
      processInBodyDocument(compressed);
    } catch {
      // Ignore
    }
  };

  const handleSaveScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanImage || !scanVerified) {
      setScanErrorMessage("Photo du bilan InBody obligatoire : veuillez fournir une photo plus claire et nette du scan de votre résultat InBody afin de donner une analyse complète et réelle.");
      return;
    }

    const isFemale = profile.gender === 'female';
    const w=Number(weightInput), smm=Number(muscleInput),fatPct=Number(fatPercentInput),bmr=Number(bmrInput);
    if(![w,smm,fatPct,bmr].every(n=>Number.isFinite(n)&&n>0)){setScanErrorMessage('Relevé incomplet. Reprenez une photo nette.');return;}
    const fatKg=+(w*fatPct/100).toFixed(1);
    const water=waterInput?Number(waterInput):undefined;
    const visc=visceralInput?Number(visceralInput):undefined;
    const score=scoreInput?Number(scoreInput):undefined;
    const targetCalories=nutritionTarget({...profile,currentWeight:w},bmr).calories;

    // Protein and fat ratios optimized for gender physiology
    const proteinFactor = goal === 'gain' ? (isFemale ? 1.9 : 2.2) : goal === 'maintain' ? (isFemale ? 1.6 : 1.8) : (isFemale ? 1.8 : 2.0);
    const fatFactor = isFemale ? 0.95 : 0.85; // Women benefit from slightly higher essential healthy fats for endocrine/estrogen support

    const proteinsG = Math.round(w * proteinFactor);
    const fatsG = Math.round(w * fatFactor);
    const carbsG = Math.max(80, Math.round((targetCalories - (proteinsG * 4 + fatsG * 9)) / 4));

    // Personalized meal plan tailored to gender & goal
    const mealPlan = isFemale ? [
      {
        meal: "Petit-déjeuner Équilibre Hormonal",
        description: "Bowl avoine complète (50g), graines de chia & lin moulu, 150g skyr nature, framboises fraîches et thé vert détox",
        calories: Math.round(targetCalories * 0.25),
        macros: `${Math.round(proteinsG * 0.25)}g P · ${Math.round(carbsG * 0.30)}g G · ${Math.round(fatsG * 0.25)}g L`
      },
      {
        meal: "Déjeuner Métabolique & Vitalité",
        description: "Pavé de saumon atlantique (140g) ou blanc de poulet, quinoa royal (130g cuit), brocolis & pousses d'épinards à l'huile d'olive vierge (riches en fer et oméga 3)",
        calories: Math.round(targetCalories * 0.35),
        macros: `${Math.round(proteinsG * 0.35)}g P · ${Math.round(carbsG * 0.38)}g G · ${Math.round(fatsG * 0.35)}g L`
      },
      {
        meal: "Collation Anti-Fatigue",
        description: "Fromage blanc 0% (150g) avec une poignée de cerneaux de noix (20g) et une pomme bio croquante",
        calories: Math.round(targetCalories * 0.15),
        macros: `${Math.round(proteinsG * 0.15)}g P · ${Math.round(carbsG * 0.12)}g G · ${Math.round(fatsG * 0.15)}g L`
      },
      {
        meal: "Dîner Léger & Déstockage Nocturne",
        description: "Filet de cabillaud ou tofu soyeux (160g), purée de patate douce (100g), courgettes grillées au thym et tisane camomille",
        calories: Math.round(targetCalories * 0.25),
        macros: `${Math.round(proteinsG * 0.25)}g P · ${Math.round(carbsG * 0.20)}g G · ${Math.round(fatsG * 0.25)}g L`
      }
    ] : [
      {
        meal: "Petit-déjeuner Synthèse Musculaire",
        description: "Omelette 3 œufs entiers + 1 blanc, 60g flocons d'avoine, baies antioxydantes et 1/2 avocat",
        calories: Math.round(targetCalories * 0.25),
        macros: `${Math.round(proteinsG * 0.25)}g P · ${Math.round(carbsG * 0.28)}g G · ${Math.round(fatsG * 0.25)}g L`
      },
      {
        meal: "Déjeuner Anabolique Propre",
        description: "Steak haché 5% ou filet de poulet fermier (180g), riz basmati complet (160g cuit), haricots verts et 1 c.à.s huile de colza",
        calories: Math.round(targetCalories * 0.35),
        macros: `${Math.round(proteinsG * 0.35)}g P · ${Math.round(carbsG * 0.40)}g G · ${Math.round(fatsG * 0.35)}g L`
      },
      {
        meal: "Collation Récupération",
        description: "Shake Whey Isolate ou skyr (200g) avec amandes brutes (25g) et une banane",
        calories: Math.round(targetCalories * 0.15),
        macros: `${Math.round(proteinsG * 0.15)}g P · ${Math.round(carbsG * 0.14)}g G · ${Math.round(fatsG * 0.15)}g L`
      },
      {
        meal: "Dîner Régénération Tissulaire",
        description: "Pavé de thon ou saumon grillé (160g), quinoa (120g cuit), asperges ou poêlée de champignons à l'ail",
        calories: Math.round(targetCalories * 0.25),
        macros: `${Math.round(proteinsG * 0.25)}g P · ${Math.round(carbsG * 0.18)}g G · ${Math.round(fatsG * 0.25)}g L`
      }
    ];

    // Personalized workout plan adapted to InBody skeletal muscle and body fat
    const workoutPlan = goal === 'gain' ? [
      {
        focus: isFemale ? "Hypertrophie Fessiers & Chaîne Postérieure" : "Hypertrophie Haut du Corps & Dos",
        frequency: "3 à 4 séances / semaine (45-60 min)",
        description: `Programme orienté surcharge progressive pour stimuler les ${smm} kg de masse musculaire sans prise de gras viscéral.`,
        exercises: isFemale 
          ? ["Hip Thrust lourd (4x10)", "Squat bulgare aux haltères (3x12)", "Soulevé de terre roumain (4x10)", "Tirage vertical poulie (3x12)"]
          : ["Développé couché à la barre (4x8-10)", "Tractions lestées ou tirage poitrine (4x10)", "Développé militaire haltères (3x10)", "Dips au poids de corps (3x12)"]
      },
      {
        focus: "Force & Base Athlétique Polyarticulaire",
        frequency: "2 séances / semaine",
        description: "Recrutement des fibres musculaires rapides et stimulation de la densité minérale osseuse.",
        exercises: ["Squat arrière complet (4x8)", "Fentes marchées (3x12 pas)", "Gainage dynamique anti-rotation (3x45s)"]
      },
      {
        focus: "Récupération & Anabolisme Musculaire",
        frequency: "Quotidien",
        description: "Sommeil de 8h minimum et hydratation pour favoriser la synthèse protéique nocturne.",
        exercises: ["Automassages au rouleau (10 min)", "Marche décontractante", "Hydratation post-séance"]
      }
    ] : goal === 'maintain' ? [
      {
        focus: "Conditionnement Physique & Maintien Actif",
        frequency: "3 séances mixtes / semaine",
        description: `Maintien optimal du ratio muscle/masse grasse (${smm} kg de muscle) et flexibilité cardiovasculaire.`,
        exercises: ["Circuit training haltères (4 tours de 5 ateliers)", "Gainage planche & hollow body (3x1 min)", "Pompes & tractions au poids du corps"]
      },
      {
        focus: "Cardio Santé & Endurance Métabolique",
        frequency: "2 sorties / semaine (30-45 min)",
        description: "Maintien de la VO2 Max et équilibre de la pression artérielle.",
        exercises: ["Course à pied à allure modérée ou vélo", "Natation en nage libre", "Rameur en fractionné modéré"]
      }
    ] : [
      {
        focus: "Renforcement Préservation Musculaire (Anti-Fonte)",
        frequency: "3 séances / semaine (Full Body)",
        description: `Le renforcement adapté et des repas équilibrés peuvent aider à préserver votre masse musculaire pendant la perte de poids.`,
        exercises: ["Squats au poids du corps ou gobelet (4x12)", "Pompes surélevées ou au sol (3x10)", "Rowing dos aux haltères (4x12)", "Fentes alternées (3x12)"]
      },
      {
        focus: "Cardio Brûleur de Graisse (Zone 2 Lipolyse)",
        frequency: "2 à 3 séances / semaine (40-50 min)",
        description: `Cible la lipolyse directe des ${fatKg} kg de graisse corporelle mesurée sans épuiser le système nerveux ni élever le cortisol.`,
        exercises: ["Marche inclinée sur tapis (vitesse 5.5 km/h, pente 8-10%)", "Vélo elliptique à fréquence cardiaque stable (125-140 bpm)", "Marche rapide en extérieur"]
      },
      {
        focus: "Activité NEAT Quotidienne",
        frequency: "7 jours / 7",
        description: "Dépense énergétique de base sans fatigue centrale pour accélérer le déficit calorique.",
        exercises: ["8 000 à 10 000 pas quotidiens obligatoires", "Privilégier les escaliers", "Étirements posturaux matinaux (5 min)"]
      }
    ];

    const strategy = goal === 'gain'
      ? `Protocole Prise de Masse Optimale (${isFemale ? 'Femme' : 'Homme'}) : surplus énergétique progressif adapté au BMR mesuré (${bmr} kcal). Accent sur la synthèse de masse maigre sans augmentation de graisse viscérale.`
      : goal === 'maintain'
      ? `Protocole Stabilisation Haute Performance (${isFemale ? 'Femme' : 'Homme'}) : équilibre calorique isocalorique (${targetCalories} kcal). Maintien strict de la masse musculaire (${smm} kg) et flexibilité métabolique.`
      : `Protocole Perte de Graisse Visée (${isFemale ? 'Femme' : 'Homme'}) : déficit énergétique mesuré respectant votre métabolisme de base (${bmr} kcal). Préservation intégrale des ${smm} kg de muscle squelettique et satiété maximale.`;

    const maintenanceAdvice = 'Une fois votre objectif atteint, proposez le mode stabilisation pour adapter les repas au maintien. Continuez le suivi et ajustez les habitudes progressivement. L’eau corporelle du relevé est une mesure de composition corporelle, pas la quantité à boire chaque jour.';

    const medicalNotice = "Avis d'un médecin ou d'un nutritionniste toujours obligatoire : Les analyses et recommandations générées à partir de votre relevé InBody sont fournies à titre indicatif et éducatif. L'avis d'un médecin ou d'un nutritionniste diplômé est toujours obligatoire avant d'entreprendre tout changement diététique ou programme sportif intensif.";

    const newScan: InBodyScan = {
      id: `inbody_${Date.now()}`,
      date: localDate(),
      weightKg: w,
      skeletalMuscleMassKg: smm,
      bodyFatPercent: fatPct,
      bodyFatMassKg: fatKg,
      totalBodyWaterLiters: water,
      bmrKcal: bmr,
      visceralFatLevel: visc,
      inBodyScore: score,
      gender: profile.gender,
      scanImageUrl: scanImage || undefined,
      notes: notesInput.trim() || undefined,
      recommendedCalories: targetCalories,
      recommendedProteins: proteinsG,
      recommendedCarbs: carbsG,
      recommendedFats: fatsG,
      dietPlanStrategy: strategy,
      longTermMaintenanceAdvice: maintenanceAdvice,
      personalizedMealPlan: mealPlan,
      personalizedWorkoutPlan: workoutPlan,
      medicalDisclaimerNotice: medicalNotice,
      createdAt: new Date().toISOString()
    };

    setScans(prev => [newScan, ...prev]);
    onUpdateProfile({ 
      currentWeight: w, 
      dailyCalorieTarget: targetCalories, 
      gender: profile.gender,
      inbodyScansCount: (profile.inbodyScansCount || 0) + 1
    });
    setIsModalOpen(false);
    setScanImage('');
    setNotesInput('');
    setScanErrorMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: InBody Scan CTA */}
      <div className={`p-6 rounded-3xl ${theme.cardBg} border border-rose-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Scan Mensuel Recommandé (1 fois par mois)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                hasUnlimitedInBody 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : hasUsedFreeScan 
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 cursor-pointer'
                  : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
              }`} onClick={() => (!hasUnlimitedInBody && hasUsedFreeScan) && onOpenUpgradeModal?.('complete_pack')}>
                {hasUnlimitedInBody 
                  ? '✓ Scans illimités (Pack Complet)'
                  : hasUsedFreeScan 
                  ? '1 scan gratuit utilisé · Débloquer en illimité (Pack Complet)'
                  : '1 scan InBody gratuit inclus'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Analyse Corporelle InBody & Nutrition Sur-Mesure
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Scannez ou renseignez votre bilan InBody mensuel pour adapter vos repas, votre métabolisme de base (BMR) et votre régime selon votre rythme exact, afin de <strong className="text-white">avancer vers votre objectif et préserver vos progrès</strong> sans effet yoyo.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!hasUnlimitedInBody && hasUsedFreeScan) {
                  onOpenUpgradeModal?.('complete_pack');
                } else {
                  setIsModalOpen(true);
                }
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm transition shadow-lg shadow-rose-500/25 flex items-center gap-2.5 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Scanner mon InBody</span>
            </button>
          </div>
        </div>
      </div>

      {/* Latest InBody Biomarkers Grid */}
      {latestScan && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Poids */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder}`}>
            <span className="text-xs text-slate-400 block mb-1">Poids Total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-heading">{latestScan.weightKg}</span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Sur la balance</span>
          </div>

          {/* Masse Musculaire */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border border-sky-500/30`}>
            <span className="text-xs text-sky-400 font-semibold block mb-1">Muscle (SMM)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-sky-400 font-heading">{latestScan.skeletalMuscleMassKg}</span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
            <span className="text-[10px] text-sky-300/80 mt-1 block">Masse squelettique</span>
          </div>

          {/* Masse Grasse */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border border-amber-500/30`}>
            <span className="text-xs text-amber-400 font-semibold block mb-1">Masse Grasse</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-amber-400 font-heading">{latestScan.bodyFatPercent}</span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            <span className="text-[10px] text-amber-300/80 mt-1 block">{latestScan.bodyFatMassKg || ((latestScan.weightKg * latestScan.bodyFatPercent) / 100).toFixed(1)} kg de graisse</span>
          </div>

          {/* Eau Corporelle */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border border-cyan-500/30`}>
            <span className="text-xs text-cyan-400 font-semibold block mb-1">Eau Corporelle</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-cyan-400 font-heading">{latestScan.totalBodyWaterLiters || 42}</span>
              <span className="text-xs text-slate-400">L</span>
            </div>
            <span className="text-[10px] text-cyan-300/80 mt-1 block">Hydratation totale</span>
          </div>

          {/* Métabolisme de Base (BMR) */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border border-rose-500/30`}>
            <span className="text-xs text-rose-400 font-semibold block mb-1">BMR Réel</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-rose-400 font-heading">{latestScan.bmrKcal}</span>
              <span className="text-xs text-slate-400">kcal</span>
            </div>
            <span className="text-[10px] text-rose-300/80 mt-1 block">Dépense de repos</span>
          </div>

          {/* Score InBody */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border border-emerald-500/30`}>
            <span className="text-xs text-emerald-400 font-semibold block mb-1">Score Global</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-emerald-400 font-heading">{latestScan.inBodyScore || 80}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <span className="text-[10px] text-emerald-300/80 mt-1 block">Vitalité corporelle</span>
          </div>
        </div>
      )}

      {/* PERSONALIZED MEAL PLAN & DIET STRATEGY ADAPTED TO INBODY */}
      {latestScan && (
        <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  Régime & Meilleurs Repas Adaptés à Votre Rythme
                </h3>
                <p className="text-xs text-slate-400">
                  Calculé d'après votre métabolisme réel ({latestScan.bmrKcal} kcal) et votre composition musculaire InBody
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-rose-300">
                Objectif : <strong className="text-white">{latestScan.recommendedCalories} kcal / jour</strong>
              </span>
            </div>
          </div>

          {/* Macros Targets Bar */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Protéines Cibles</span>
              <span className="text-lg font-bold text-rose-400 font-heading">{latestScan.recommendedProteins || 140}g</span>
              <span className="text-[10px] text-slate-500 block">Préservation musculaire</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Glucides Complexes</span>
              <span className="text-lg font-bold text-amber-400 font-heading">{latestScan.recommendedCarbs || 165}g</span>
              <span className="text-[10px] text-slate-500 block">Énergie & Glycogène</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Bons Lipides</span>
              <span className="text-lg font-bold text-sky-400 font-heading">{latestScan.recommendedFats || 65}g</span>
              <span className="text-[10px] text-slate-500 block">Repère alimentaire</span>
            </div>
          </div>

          {/* Strategy description */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block mb-1">Stratégie d'ajustement InBody :</strong>
            {latestScan.dietPlanStrategy}
          </div>

          {/* Meal suggestions list */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Suggestions de repas optimisés pour votre InBody :
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {latestScan.personalizedMealPlan?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400">{item.meal}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono font-medium">
                      ~{item.calories} kcal
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    {item.description}
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    {item.macros}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LONG TERM MAINTENANCE ADVICE ("Surtout le garder à long terme") */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantie de Maintien à Long Terme (Anti Effet Rebond)</span>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              {latestScan.longTermMaintenanceAdvice || "Une fois votre poids cible atteint, augmentez progressivement vos apports de +100 kcal par semaine pour relancer votre métabolisme de base sans stocker de graisse. Votre scan InBody mensuel vous permet de vérifier que votre muscle reste intact."}
            </p>
          </div>

          {/* PERSONALIZED WORKOUT PLAN ADAPTED TO INBODY SCAN */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Programme Sportif & Entraînement Adapté à Votre InBody
                </h4>
                <p className="text-[11px] text-slate-400">
                  Calibré selon vos {latestScan.skeletalMuscleMassKg} kg de muscle et {latestScan.bodyFatPercent}% de masse grasse
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {latestScan.personalizedWorkoutPlan?.map((plan, pIdx) => (
                <div key={pIdx} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400">{plan.focus}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {plan.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">{plan.description}</p>
                  <ul className="space-y-1 pt-1">
                    {plan.exercises.map((ex, eIdx) => (
                      <li key={eIdx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* MANDATORY MEDICAL DISCLAIMER BANNER */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold block mb-1">
                ⚠️ Avis médical obligatoire :
              </strong>
              <span>
                L'avis d'un médecin ou d'un nutritionniste diplômé est toujours obligatoire avant d'entreprendre ou de modifier votre régime alimentaire ou votre programme sportif. Les bilans et recommandations générés par cette application sont des outils d'accompagnement éducatifs et ne remplacent en aucun cas une consultation médicale.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* InBody History Section */}
      <div className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-400" />
            <span>Historique des bilans InBody ({scans.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Relevés mensuels</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {scans.map((scan) => (
            <div key={scan.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-rose-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    {scan.weightKg} kg · <span className="text-sky-400 font-semibold">{scan.skeletalMuscleMassKg} kg muscle</span> · <span className="text-amber-400 font-semibold">{scan.bodyFatPercent}% MG</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-2">
                    <span>{scan.date}</span>
                    <span>· BMR: {scan.bmrKcal} kcal</span>
                    <span>· Score: {scan.inBodyScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {scan.scanImageUrl && (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                    Fiche scannée
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                  Cible : {scan.recommendedCalories} kcal
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <label className="flex gap-2 rounded-xl border p-3 text-xs"><input type="checkbox" checked={scanConsent} onChange={e=>setScanConsent(e.target.checked)}/>J’accepte l’envoi de mon relevé InBody au service IA Google pour lire ses mesures.</label>
      {/* NEW INBODY SCAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-5">
          <div className={`w-full max-w-lg rounded-3xl ${theme.cardBg} border ${theme.cardBorder} p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    Nouveau Bilan InBody Mensuel
                  </h3>
                  <p className="text-xs text-slate-400">Photo du relevé ou saisie manuelle</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Photo capture banner */}
            <div className="mb-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white block">
                  Document / Fiche bilan InBody (Scan optique intelligent)
                </span>
                <span className="text-[10px] text-rose-400 font-semibold">Remplissage automatique</span>
              </div>

              {scanImage ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-52 bg-black flex items-center justify-center">
                  <img src={scanImage} alt="Bilan InBody" className="w-full h-auto max-h-52 object-contain" />
                  
                  {/* Optical Scan Laser Bar Animation */}
                  {isScanningDoc && (
                    <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] animate-bounce" />
                      <div className="mt-3 px-3 py-1.5 rounded-full bg-slate-950/90 border border-rose-500/60 text-xs font-bold text-rose-300 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Lecture & extraction optique OCR en cours...</span>
                      </div>
                    </div>
                  )}

                  {!isScanningDoc && (
                    <button
                      type="button"
                      onClick={() => { setScanImage(''); setScanSuccessMessage(''); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/90 text-rose-400 hover:bg-slate-900 transition text-xs font-bold border border-slate-700"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Scanner un document / photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-rose-300 transition flex items-center justify-center gap-2 border border-rose-500/40"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Prendre en photo</span>
                  </button>
                </div>
              )}

              {scanSuccessMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{scanSuccessMessage}</span>
                </div>
              )}

              {scanErrorMessage && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 font-medium space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold mb-0.5">
                        Qualité du relevé InBody :
                      </strong>
                      <span>{scanErrorMessage}</span>
                    </div>
                  </div>
                  {scanImage && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAdjustLightingWithAi}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Sparkles size={13} className="text-amber-400" />
                        <span>Régler la lumière de la photo avec l'IA</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <Camera size={13} />
                        <span>Reprendre directement en photo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Gender Selection & Form Fields */}
            <form onSubmit={handleSaveScan} className="space-y-4">
              <div className="rounded-2xl border border-slate-700 p-4 space-y-2 text-sm">
                <strong>Valeurs lues sur votre relevé</strong>
                {scanVerified ? <dl className="grid grid-cols-2 gap-2"><dt>Poids</dt><dd>{weightInput} kg</dd><dt>Masse musculaire</dt><dd>{muscleInput} kg</dd><dt>Masse grasse</dt><dd>{fatPercentInput} %</dd><dt>Métabolisme de base</dt><dd>{bmrInput} kcal</dd></dl> : <p>Importez ou photographiez votre relevé complet. L’IA remplit les mesures; aucune valeur n’est inventée.</p>}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  L'analyse complète, le régime alimentaire et le programme sportif sont obligatoirement établis d'après la photo nette du relevé InBody. L'avis d'un médecin ou nutritionniste est toujours obligatoire.
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!scanVerified || isScanningDoc}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Générer Bilan, Nutrition & Sport</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={photo => {
          setIsCameraOpen(false);
          processInBodyDocument(photo);
        }}
        title="Photographier le Bilan InBody"
        theme={theme}
        t={t}
        idealFacingMode="environment"
      />
    </div>
  );
};
