import React, { useState, useRef } from 'react';
import { 
  Utensils, 
  Camera, 
  Search, 
  Plus, 
  Flame, 
  PieChart, 
  Lock, 
  Crown, 
  Sparkles, 
  Check, 
  PlusCircle,
  Apple,
  Beef,
  Wheat,
  Droplet,
  Image as ImageIcon,
  FileText,
  Sun,
  Coffee,
  Moon,
  Cookie,
  Trash2,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { UserProfile, NutritionEntry, MealType, FoodItem } from '../types';
import { ThemeColors } from '../services/theme';
import { TranslationDictionary } from '../services/i18n';
import { compressImage } from '../utils/imageCompressor';
import { CameraCaptureModal } from './CameraCaptureModal';
import { localDate } from '../services/dates';
import { foodPortion } from '../services/foodPortions';
import { auraSlimApi } from '../services/apiClient';
import { foodPhoto } from '../services/foodPhotos';
import { mealChoiceCopy } from '../services/mealChoiceCopy';

interface CalorieCalculatorProps {
  profile: UserProfile;
  nutritionEntries: NutritionEntry[];
  activeBurnCalories: number;
  theme: ThemeColors;
  t: TranslationDictionary;
  onAddNutrition: (entry: NutritionEntry) => void;
  onDeleteNutrition: (id: string) => void;
  onIncrementScanCount: () => void;
  onOpenUpgradeModal: (plan?: import('../types').UserPlan) => void;
  onOpenHealthReport?: () => void;
}

// Distinct catalogs tailored specifically to each meal time
const MEAL_CATALOGS: Record<MealType, FoodItem[]> = {
  breakfast: [
    { id: 'b-1', name: 'Flocons d\'avoine bio complets', portion: '60g', calories: 220, proteins: 8, carbs: 40, fats: 4, fiber: 6, category: 'breakfast' },
    { id: 'b-2', name: '2 Œufs bio pochés & pousses d\'épinards', portion: '140g', calories: 165, proteins: 15, carbs: 2, fats: 11, fiber: 1, category: 'breakfast' },
    { id: 'b-3', name: 'Toast complet levain & purée d\'avocat', portion: '120g', calories: 215, proteins: 6, carbs: 24, fats: 11, fiber: 5, category: 'breakfast' },
    { id: 'b-4', name: 'Skyr nature 0% & myrtilles fraîches', portion: '200g', calories: 130, proteins: 22, carbs: 10, fats: 0.4, fiber: 2, category: 'breakfast' },
    { id: 'b-5', name: 'Smoothie protéiné banane & graines de chia', portion: '250ml', calories: 210, proteins: 18, carbs: 28, fats: 3.5, fiber: 4, category: 'breakfast' },
    { id: 'b-6', name: 'Omelette blanche aux herbes de Provence', portion: '150g', calories: 95, proteins: 18, carbs: 1, fats: 1.5, fiber: 0, category: 'breakfast' },
    { id: 'b-7', name: 'Pain de seigle toasté & miel d\'acacia', portion: '70g', calories: 185, proteins: 4.5, carbs: 38, fats: 1, fiber: 4, category: 'breakfast' },
    { id: 'b-8', name: 'Café expresso noir pur (sans sucre)', portion: '40ml', calories: 3, proteins: 0.3, carbs: 0.2, fats: 0, fiber: 0, category: 'breakfast' },
    { id: 'b-9', name: 'Thé vert bio sencha du Japon', portion: '250ml', calories: 2, proteins: 0, carbs: 0, fats: 0, fiber: 0, category: 'breakfast' },
  ],
  lunch: [
    { id: 'l-1', name: 'Blanc de poulet rôti au thym & citron', portion: '160g', calories: 260, proteins: 48, carbs: 0, fats: 6, fiber: 0, category: 'lunch' },
    { id: 'l-2', name: 'Filet de saumon atlantique vapeur', portion: '150g', calories: 310, proteins: 34, carbs: 0, fats: 18, fiber: 0, category: 'lunch' },
    { id: 'l-3', name: 'Riz basmati complet cuit aux grains longs', portion: '160g', calories: 195, proteins: 4.5, carbs: 41, fats: 1.2, fiber: 2.5, category: 'lunch' },
    { id: 'l-4', name: 'Quinoa royal aux petits légumes croquants', portion: '200g', calories: 230, proteins: 8, carbs: 42, fats: 4, fiber: 5, category: 'lunch' },
    { id: 'l-5', name: 'Pavé de bœuf haché 5% grillé', portion: '130g', calories: 175, proteins: 27, carbs: 0, fats: 6.5, fiber: 0, category: 'lunch' },
    { id: 'l-6', name: 'Bowl thon germon, riz noir & edamame', portion: '300g', calories: 380, proteins: 36, carbs: 39, fats: 9, fiber: 6, category: 'lunch' },
    { id: 'l-7', name: 'Pâtes complètes au coulis de tomate & basilic', portion: '180g', calories: 265, proteins: 10, carbs: 49, fats: 2.5, fiber: 6.5, category: 'lunch' },
    { id: 'l-8', name: 'Poêlée de brocolis & champignons sautés', portion: '200g', calories: 85, proteins: 5.5, carbs: 9, fats: 2.5, fiber: 6, category: 'lunch' },
    { id: 'l-9', name: 'Salade niçoise allégée (thon, œuf, haricots verts)', portion: '260g', calories: 290, proteins: 24, carbs: 12, fats: 14, fiber: 5, category: 'lunch' },
  ],
  dinner: [
    { id: 'd-1', name: 'Velouté onctueux de potimarron maison', portion: '250g', calories: 140, proteins: 3.5, carbs: 22, fats: 4, fiber: 5, category: 'dinner' },
    { id: 'd-2', name: 'Dos de cabillaud rôti aux herbes & tomates', portion: '160g', calories: 145, proteins: 32, carbs: 2, fats: 1.5, fiber: 1, category: 'dinner' },
    { id: 'd-3', name: 'Salade grecque légère (Feta 9%, concombres)', portion: '220g', calories: 210, proteins: 12, carbs: 10, fats: 13, fiber: 4, category: 'dinner' },
    { id: 'd-4', name: 'Escalope de dinde poêlée & haricots verts vapeur', portion: '200g', calories: 195, proteins: 36, carbs: 4, fats: 3.5, fiber: 4, category: 'dinner' },
    { id: 'd-5', name: 'Wok de tofu mariné soja-gingembre & courgettes', portion: '220g', calories: 225, proteins: 19, carbs: 11, fats: 12, fiber: 4, category: 'dinner' },
    { id: 'd-6', name: 'Omelette légère aux champignons de Paris', portion: '160g', calories: 180, proteins: 14, carbs: 3, fats: 12, fiber: 2, category: 'dinner' },
    { id: 'd-7', name: 'Soupe détox poireaux, céleri & curcuma', portion: '300ml', calories: 90, proteins: 2.5, carbs: 16, fats: 1, fiber: 4.5, category: 'dinner' },
    { id: 'd-8', name: 'Carpaccio de courgettes & copeaux de parmesan', portion: '150g', calories: 135, proteins: 8, carbs: 5, fats: 9, fiber: 2, category: 'dinner' },
  ],
  snack: [
    { id: 's-1', name: 'Poignée d\'amandes brutes non salées', portion: '30g', calories: 175, proteins: 6, carbs: 6, fats: 15, fiber: 3.5, category: 'snack' },
    { id: 's-2', name: 'Pomme bio gala fraîche et croquante', portion: '150g', calories: 78, proteins: 0.5, carbs: 19, fats: 0.3, fiber: 3.5, category: 'snack' },
    { id: 's-3', name: 'Barre protéinée croustillante cacao pur', portion: '45g', calories: 165, proteins: 15, carbs: 14, fats: 5, fiber: 7, category: 'snack' },
    { id: 's-4', name: 'Shaker Whey Isolate vanille pure', portion: '30g', calories: 110, proteins: 26, carbs: 1, fats: 0.5, fiber: 0, category: 'snack' },
    { id: 's-5', name: 'Compote de pomme sans sucres ajoutés', portion: '100g', calories: 52, proteins: 0.4, carbs: 12, fats: 0.2, fiber: 1.5, category: 'snack' },
    { id: 's-6', name: '2 Carrés de chocolat noir d\'Équateur 85%', portion: '20g', calories: 120, proteins: 2, carbs: 6, fats: 10, fiber: 2.5, category: 'snack' },
    { id: 's-7', name: 'Fromage blanc 0% et pincée de cannelle', portion: '150g', calories: 72, proteins: 12, carbs: 5, fats: 0.2, fiber: 0, category: 'snack' },
    { id: 's-8', name: 'Noix de Grenoble nobles décortiquées', portion: '25g', calories: 163, proteins: 3.8, carbs: 3.5, fats: 16, fiber: 1.7, category: 'snack' },
  ]
};

const EXTRA_FOODS: Record<MealType, FoodItem[]> = {
  breakfast: [
    { id: 'b-10', name: 'Banane et yaourt nature', portion: '180g', calories: 155, proteins: 6, carbs: 30, fats: 2, category: 'breakfast' },
    { id: 'b-11', name: 'Tartine complète au fromage frais', portion: '90g', calories: 170, proteins: 9, carbs: 23, fats: 4, category: 'breakfast' },
    { id: 'b-12', name: 'Porridge au lait et fruits de saison', portion: '220g', calories: 205, proteins: 9, carbs: 34, fats: 4, category: 'breakfast' }
  ],
  lunch: [
    { id: 'l-10', name: 'Lentilles cuites, carottes et citron', portion: '200g', calories: 195, proteins: 12, carbs: 31, fats: 2, category: 'lunch' },
    { id: 'l-11', name: 'Salade de pois chiches et légumes', portion: '220g', calories: 260, proteins: 11, carbs: 35, fats: 8, category: 'lunch' },
    { id: 'l-12', name: 'Sardines grillées et tomates', portion: '160g', calories: 250, proteins: 28, carbs: 5, fats: 13, category: 'lunch' }
  ],
  dinner: [
    { id: 'd-9', name: 'Soupe de lentilles et légumes', portion: '260g', calories: 200, proteins: 11, carbs: 32, fats: 4, category: 'dinner' },
    { id: 'd-10', name: 'Pois chiches et légumes rôtis', portion: '210g', calories: 235, proteins: 10, carbs: 31, fats: 8, category: 'dinner' },
    { id: 'd-11', name: 'Omelette aux légumes de saison', portion: '180g', calories: 205, proteins: 15, carbs: 9, fats: 13, category: 'dinner' }
  ],
  snack: [
    { id: 's-9', name: 'Poire fraîche', portion: '150g', calories: 85, proteins: 0.5, carbs: 23, fats: 0, category: 'snack' },
    { id: 's-10', name: 'Noix et abricots secs', portion: '35g', calories: 160, proteins: 3, carbs: 18, fats: 9, category: 'snack' },
    { id: 's-11', name: 'Carottes et houmous', portion: '120g', calories: 145, proteins: 5, carbs: 16, fats: 7, category: 'snack' }
  ]
};

// Suggestions suited to ingredients commonly used in these countries. Always
// show actual portion estimates; do not imply local stock is guaranteed.
const LOCAL_FOODS: Record<string, Record<MealType, [string, number, number][]>> = {
  northAfrica: { breakfast: [['Pain complet et huile d’olive', 90, 205]], lunch: [['Couscous de légumes et pois chiches', 240, 300]], dinner: [['Chorba aux légumes et lentilles', 250, 195]], snack: [['Dattes et amandes', 35, 145]] },
  southAsia: { breakfast: [['Idli et sambar de légumes', 200, 240]], lunch: [['Dal de lentilles et riz complet', 220, 320]], dinner: [['Chana masala aux légumes', 220, 290]], snack: [['Yaourt nature et mangue', 150, 135]] },
  eastAsia: { breakfast: [['Riz et œuf avec légumes', 180, 240]], lunch: [['Tofu, riz et légumes vapeur', 220, 280]], dinner: [['Soupe miso au tofu et légumes', 240, 165]], snack: [['Mandarine et noix', 110, 110]] },
  latinAmerica: { breakfast: [['Haricots et œuf avec tortilla', 190, 280]], lunch: [['Haricots noirs, riz et légumes', 230, 310]], dinner: [['Soupe de maïs et légumes', 250, 210]], snack: [['Papaye et yaourt nature', 160, 125]] }
};
const REGIONS: Record<string, string[]> = {
  northAfrica: ['DZ','MA','TN','EG','LY'], southAsia: ['IN','PK','BD','LK','NP'],
  eastAsia: ['JP','CN','KR','TW','VN','TH'], latinAmerica: ['MX','BR','AR','CL','PE','CO']
};
function catalogFor(meal: MealType, countryCode?: string): FoodItem[] {
  const region = Object.keys(REGIONS).find(key => REGIONS[key].includes(countryCode || ''));
  const local = region ? LOCAL_FOODS[region][meal].map(([name, portion, calories], index) => ({
    id: `${region}-${meal}-${index}`, name, portion: `${portion}g`, calories,
    proteins: Math.round(calories * 0.15 / 4), carbs: Math.round(calories * 0.55 / 4),
    fats: Math.round(calories * 0.30 / 9), category: meal
  })) : [];
  return [...local, ...MEAL_CATALOGS[meal], ...EXTRA_FOODS[meal]];
}
export const CalorieCalculator: React.FC<CalorieCalculatorProps> = ({
  profile,
  nutritionEntries,
  activeBurnCalories,
  theme,
  t,
  onAddNutrition,
  onDeleteNutrition,
  onIncrementScanCount,
  onOpenUpgradeModal,
  onOpenHealthReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [mealChoiceVisible, setMealChoiceVisible] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState<NutritionEntry | null>(null);
  const [foodImagePreview, setFoodImagePreview] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanError, setScanError] = useState('');
  const [portions, setPortions] = useState<Record<string, string>>({});
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [expandedFood, setExpandedFood] = useState<FoodItem | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const nativePlateCameraRef = useRef<HTMLInputElement>(null);
  const catalogSectionRef = useRef<HTMLDivElement>(null);

  // Today's entries
  const todayStr = localDate();
  const todaysEntries = nutritionEntries.filter(e => e.date === todayStr);

  const totalCaloriesConsumed = todaysEntries.reduce((sum, item) => sum + item.calories, 0);
  const totalProteins = todaysEntries.reduce((sum, item) => sum + item.proteins, 0);
  const totalCarbs = todaysEntries.reduce((sum, item) => sum + item.carbs, 0);
  const totalFats = todaysEntries.reduce((sum, item) => sum + item.fats, 0);

  const targetBudget = profile.dailyCalorieTarget;
  const netCaloriesRemaining = targetBudget - totalCaloriesConsumed + activeBurnCalories;

  // Group today's entries by meal type
  const breakfastEntries = todaysEntries.filter(e => e.mealType === 'breakfast');
  const lunchEntries = todaysEntries.filter(e => e.mealType === 'lunch');
  const dinnerEntries = todaysEntries.filter(e => e.mealType === 'dinner');
  const snackEntries = todaysEntries.filter(e => e.mealType === 'snack');

  const processImageForCalorieAnalysis = async (imgData: string) => {
    const premium = ['scan_meals', 'complete_pack', 'pro'].includes(profile.plan);
    if (!premium && profile.imagesCalorieScannedCount >= 3) { onOpenUpgradeModal('scan_meals'); return; }
    setFoodImagePreview(imgData);
    setAnalyzedFood(null);
    setScanError('');
    setIsAnalyzingImage(true);
    try {
      const statusResponse = await auraSlimApi('status');
      const status = await statusResponse.json();
      if (!status.ai) throw new Error('La clé GEMINI_API_KEY manque dans les secrets du serveur AuraSlim. La photo n’a pas été envoyée.');
      const response = await auraSlimApi('meal-estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: imgData, language: profile.preferredLanguage }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Analyse photo indisponible');
      setAnalyzedFood({ id: `ai_${Date.now()}`, date: todayStr, mealType: selectedMealType,
        name: result.name, portion: result.portion, calories: result.calories,
        proteins: result.proteins, carbs: result.carbs, fats: result.fats,
        imageUrl: imgData, scannedWithAI: true, identifiedFoods: result.foods });
      onIncrementScanCount();
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Analyse indisponible. Réessayez.');
    } finally { setIsAnalyzingImage(false); }
  };

  const speakIdentifiedFoods = (foods: NonNullable<NutritionEntry['identifiedFoods']>) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const summary = foods.map(food => `${food.name}, environ ${food.calories} kilocalories`).join('. ');
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.lang = profile.preferredLanguage || 'fr';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlatePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.75);
        processImageForCalorieAnalysis(compressed);
      } catch (err) {
        console.error('Failed to compress plate photo', err);
        setScanError('La photo ne peut pas être préparée pour le scan. Essayez une autre image.');
      }
    }
    e.target.value = '';
  };

  const handleStartNativeCameraScan = () => {
    const hasScanMealsPlan = profile.plan === 'scan_meals' || profile.plan === 'complete_pack' || profile.plan === 'pro';
    if (!hasScanMealsPlan && profile.imagesCalorieScannedCount >= 3) {
      onOpenUpgradeModal('scan_meals');
      return;
    }
    if (window.matchMedia('(pointer: coarse)').matches) nativePlateCameraRef.current?.click();
    else setIsCameraOpen(true);
  };

  const handleAddAnalyzedFood = () => {
    if (analyzedFood) {
      onAddNutrition({...analyzedFood,date:localDate()});
      setAnalyzedFood(null);
      setFoodImagePreview('');
    }
  };

  const handleAddCatalogItem = (item: FoodItem) => {
    const calculated = foodPortion(item, portions[item.id]);
    if (!calculated) return;
    const newEntry: NutritionEntry = {
      ...item, id: `nut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: todayStr, mealType: selectedMealType,
      portion: `${calculated.quantity} ${item.portion.toLowerCase().includes('ml') ? 'ml' : 'g'}`,
      calories: calculated.calories,
      proteins: calculated.proteins,
      carbs: calculated.carbs,
      fats: calculated.fats,
      scannedWithAI: false
    };
    onAddNutrition(newEntry);
  };

  // Click on '+' of a specific meal: immediately activates that meal type and scrolls down to catalog
  const handleActivateMealType = (type: MealType) => {
    setSelectedMealType(type);
    setMealChoiceVisible(true);
    setTimeout(() => {
      catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Get current meal catalog based strictly on selectedMealType
  const currentCatalog = catalogFor(selectedMealType, profile.countryCode);
  const filteredCatalog = currentCatalog.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mealMeta = {
    breakfast: { title: t.periodBreakfast || 'Matin (Petit-déjeuner)', icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    lunch: { title: t.periodLunch || 'Midi (Déjeuner)', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    dinner: { title: t.periodDinner || 'Soir (Dîner)', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    snack: { title: t.periodSnack || 'Collation (En-cas)', icon: Cookie, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* AI Camera Plate Scanner Section - Option Clé placée en haut de l'écran */}
      <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} relative shadow-xl overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm">
                {t.keyOptionScanBadge || '⭐ Option Clé · Scan Instantané'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <Camera className={`w-5 h-5 text-rose-400`} />
              {t.calorieScanPlate}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.scanPlateDescription || "Prenez votre assiette en photo : l'IA reconnaît automatiquement les aliments, portions et calories."}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 p-1.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 pl-1.5">{t.targetedMealLabel || 'Repas ciblé :'}</span>
            <div className="flex items-center gap-1">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedMealType(type)}
                  className={`px-2 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                    selectedMealType === type
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {type === 'breakfast' ? (t.periodBreakfast || 'Matin') : type === 'lunch' ? (t.periodLunch || 'Midi') : type === 'dinner' ? (t.periodDinner || 'Soir') : (t.periodSnack || 'Collation')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {scanError && <p role="alert" className="mb-3 rounded-xl border border-rose-500/50 p-3 text-sm text-rose-300">{scanError}</p>}
        {scanError && foodImagePreview && !isAnalyzingImage && <button type="button" onClick={() => void processImageForCalorieAnalysis(foodImagePreview)} className="mb-3 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white">{t.retryWithThisPhoto || "Réessayer avec cette photo"}</button>}
        <p className="mb-3 text-xs text-slate-400">{t.calorieScanDisclaimer || "En lançant le scan, vous acceptez que la photo du repas soit transmise au service IA pour estimation. Une photo du corps n’est jamais envoyée par ce scan."}</p>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handlePlatePhotoUpload}
          className="hidden"
        />
        {/* Direct native camera input for plates (bypasses browser iframe restrictions) */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={nativePlateCameraRef}
          onChange={handlePlatePhotoUpload}
          className="hidden"
        />

        {/* Trigger Camera / File Upload Box */}
        {(!isAnalyzingImage && (!foodImagePreview || !!scanError)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Native Camera Direct (No permission block) */}
            <button
              type="button"
              onClick={handleStartNativeCameraScan}
              className="border-2 border-dashed border-amber-500/60 hover:border-amber-400 bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center group shadow-lg active:scale-98"
            >
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 mb-2.5 group-hover:scale-110 transition shadow-lg shadow-rose-500/25">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{t.takePlatePhotoBtn || '📸 Prendre en photo'}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/30 text-rose-300 font-semibold">{t.directBadge || 'Direct'}</span>
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {t.deviceCameraDesc || 'Appareil photo de votre smartphone ou PC'}
              </span>
            </button>

            {/* Option 2: Gallery Pick */}
            <button
              type="button"
              onClick={() => {
                const hasScanMealsPlan = profile.plan === 'scan_meals' || profile.plan === 'complete_pack' || profile.plan === 'pro';
                if (!hasScanMealsPlan && profile.imagesCalorieScannedCount >= 3) {
                  onOpenUpgradeModal('scan_meals');
                } else {
                  imageInputRef.current?.click();
                }
              }}
              className="border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center group hover:bg-slate-900/50"
            >
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 mb-2.5 group-hover:scale-110 transition">
                <ImageIcon className="w-6 h-6 text-slate-300" />
              </div>
              <span className="text-sm font-bold text-white">
                {t.galleryPhotosBtn || t.cameraChooseFromGallery || "🖼️ Galerie photos"}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {t.importExistingPhotoDesc || "Importer une photo déjà enregistrée"}
              </span>
            </button>
          </div>
        )}

        {/* Freemium Banner situated directly below gallery photo and camera buttons */}
        {profile.plan === 'free' && (
          <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-amber-300">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <strong className="block text-white text-sm font-semibold">
                  {t.unlimitedScanMealOption || "Option Scan Repas IA illimité"}
                </strong>
                <span>
                  {profile.imagesCalorieScannedCount < 3 
                    ? `3 scans repas gratuits inclus en essai. Restants : ${3 - profile.imagesCalorieScannedCount} scan(s).`
                    : (t.unlockScanPricing || "3 scans gratuits utilisés. Débloquez les scans repas par IA en illimité à 3,99 €/mois.")}
                </span>
              </div>
            </div>
            <button
              onClick={() => onOpenUpgradeModal('scan_meals')}
              className="action-primary px-4 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-lg"
            >
              <Crown className="w-4 h-4" />
              <span>{t.activateScanOption || "Activer l'Option Scan (3,99 €)"}</span>
            </button>
          </div>
        )}

        {/* Loading Spinner during analysis */}
        {isAnalyzingImage && (
          <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin mb-4" />
            <h4 className="text-sm font-bold text-white">{t.scanningFoodText}</h4>
            <p className="text-xs text-slate-400 mt-1">{t.aiIdentifyingIngredients || "Identification par IA des ingrédients et des macronutriments..."}</p>
          </div>
        )}

        {/* AI Result Card */}
        {analyzedFood && (
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/40 mt-4 space-y-4 shadow-xl">
            <div className="flex items-start gap-4">
              {foodImagePreview && (
                <img
                  src={foodImagePreview}
                  alt={t.analyzedDishAlt || "Plat analysé"}
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-700 shadow-md"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold mb-1">
                  <Check className="w-4 h-4" />
                  <span>{t.plateRecognizedSuccess || 'Plat reconnu avec succès'}</span>
                </div>
                <h4 className="text-base font-bold text-white font-heading">
                  {analyzedFood.name}
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  {t.estimatedPortion || 'Portion estimée'} : {analyzedFood.portion} • {t.mealTypeLabel || 'Repas'} : <span className="text-rose-300 font-semibold capitalize">{analyzedFood.mealType}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong>{t.recognizedFoodsAi || 'Aliments reconnus (estimation IA)'} :</strong>
                {'speechSynthesis' in window && !!analyzedFood.identifiedFoods?.length && <button type="button" className="action-primary flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold" onClick={() => speakIdentifiedFoods(analyzedFood.identifiedFoods!)}><Volume2 size={15} /> {t.listenFoods || 'Écouter les aliments'}</button>}</div>
              {analyzedFood.identifiedFoods?.length ? <ul className="mt-1 list-inside list-disc">{analyzedFood.identifiedFoods.map((food, index) => <li key={index}>{food.name} · {food.portion} · environ {food.calories} kcal</li>)}</ul> : <p>{t.ingredientsUncertainNotice || 'Le détail de chaque ingrédient est incertain sur cette photo ; seul le repas global a pu être estimé.'}</p>}
              <p className="mt-1">{t.plateScanDisclaimer || 'Les quantités et calories déduites d’une image restent approximatives.'}</p>
            </div>

            {/* Analyzed Macro Pills */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">{t.macroCalories || 'Calories'}</div>
                <div className="font-bold text-white text-sm">{analyzedFood.calories} kcal</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-blue-400 font-medium">{t.macroProteins || t.proteins || 'Protéines'}</div>
                <div className="font-bold text-white text-sm">{analyzedFood.proteins}g</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-amber-400 font-medium">{t.macroCarbs || t.carbs || 'Glucides'}</div>
                <div className="font-bold text-white text-sm">{analyzedFood.carbs}g</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-rose-400 font-medium">{t.macroFats || t.fats || 'Lipides'}</div>
                <div className="font-bold text-white text-sm">{analyzedFood.fats}g</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAnalyzedFood(null);
                  setFoodImagePreview('');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition"
              >
                {t.cancelBtn || 'Annuler'}
              </button>
              <button
                type="button"
                onClick={handleAddAnalyzedFood}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${theme.primary}`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.addAnalyzedPlateToLog || 'Enregistrer ce plat dans mon journal'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setIsCameraOpen(false);
          processImageForCalorieAnalysis(img);
        }}
        theme={theme}
        t={t}
        title={t.photoDishForMeal || "Photographier le plat"}
        subtitle={t.centerPlateSubtitle || "Placez votre assiette au centre de l'écran pour l'évaluation instantanée des macronutriments"}
      />
    </div>
  );
};
