export type UserGender = 'female' | 'male' | 'neutral';

export type UserPlan = 'free' | 'scan_meals' | 'progress_video' | 'complete_pack' | 'pro';

export const CHECKOUT_TABS = ['progress', 'nutrition', 'compose', 'hydration', 'photos', 'inbody', 'account', 'reports'] as const;
export type CheckoutTab = typeof CHECKOUT_TABS[number];
export type AppTab = CheckoutTab | 'admin';

export interface StripeProductDefinition {
  id: string; // Identifiant de l'offre dans l'application ; le tarif Stripe est configuré à part.
  planKey: UserPlan;
  name: string;
  priceEur: number;
  period: string; // '/mois'
  billingType: string; // 'Paiement mensuel'
  stripeCheckoutUrl: string; // Direct Stripe payment link
  description: string;
  features: string[];
}

export const STRIPE_PRODUCTS: StripeProductDefinition[] = [
  {
    id: 'auraslim_scan_meals',
    planKey: 'scan_meals',
    name: 'Aura Slim Premium - Option Scan Repas',
    priceEur: 3.99,
    period: '/mois',
    billingType: 'Paiement mensuel',
    stripeCheckoutUrl: 'https://buy.stripe.com/test_28EdR936Ga3x3233cFdjO02',
    description: 'Analyse photo IA des repas, avec estimations de portions et de calories si le service IA est configuré.',
    features: [
      'Scans photo de plats illimités par IA',
      'Calcul immédiat Protéines, Glucides, Lipides',
      'Miniatures visuelles de rappel des repas',
      'Historique nutritionnel complet'
    ]
  },
  {
    id: 'auraslim_progress_video',
    planKey: 'progress_video',
    name: 'Aura Slim Premium - Option Galerie Progrès & vidéo de progression',
    priceEur: 3.99,
    period: '/mois',
    billingType: 'Paiement mensuel',
    stripeCheckoutUrl: 'https://buy.stripe.com/test_6oUfZhbDcdfJbyzfZrdjO01',
    description: 'Galerie de photos de progression et création d’une vidéo WebM compatible avec votre navigateur.',
    features: [
      '3 photos corporelles par prise (Face, Profil, Dos)',
      'Comparaison manuelle avant / après',
      'Générateur de vidéo de progression interactif',
      'Téléchargement de la vidéo en WebM lorsque le navigateur le permet'
    ]
  },
  {
    id: 'auraslim_complete_pack',
    planKey: 'complete_pack',
    name: 'Auraslim Premium - Pack Complet Illimité',
    priceEur: 6.99,
    period: '/mois',
    billingType: 'Paiement mensuel',
    stripeCheckoutUrl: 'https://buy.stripe.com/test_7sY9AT7mW8ZtdGHaF7djO00',
    description: 'Scan repas IA, galerie photo, vidéo de progression et bilan personnel PDF.',
    features: [
      'Tout le Scan Repas IA en illimité',
      'Galerie de progression et export vidéo WebM',
      'Bilan personnel PDF'
    ]
  }
];

export type LanguageCode = string;

export interface WaterLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amountMl: number; // in ml: e.g. 250, 500, 1000
}

export type WeightGoalType = 'lose' | 'gain' | 'maintain';

export interface InBodyScan {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  skeletalMuscleMassKg: number; // Masse musculaire squelettique (SMM)
  bodyFatMassKg?: number; // Masse grasse en kg
  bodyFatPercent: number; // Pourcentage de masse grasse (%)
  totalBodyWaterLiters?: number; // Eau corporelle totale (TBW)
  bmrKcal: number; // Métabolisme de base
  visceralFatLevel?: number; // Niveau de graisse viscérale (1-20)
  inBodyScore?: number; // Score InBody / 100
  gender?: UserGender;
  scanImageUrl?: string; // Photo du relevé InBody
  notes?: string;
  recommendedCalories?: number;
  recommendedProteins?: number;
  recommendedCarbs?: number;
  recommendedFats?: number;
  personalizedMealPlan?: {
    meal: string;
    description: string;
    calories: number;
    macros: string;
  }[];
  personalizedWorkoutPlan?: {
    focus: string;
    description: string;
    frequency: string;
    exercises: string[];
  }[];
  medicalDisclaimerNotice?: string;
  dietPlanStrategy?: string;
  longTermMaintenanceAdvice?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  countryCode?: string;
  culinaryRegion?: string;
  weightGoal?: WeightGoalType;
  phone?: string;
  email: string;
  gender: UserGender;
  age: number;
  heightCm: number;
  startingWeight: number;
  currentWeight: number;
  targetWeight: number;
  dailyCalorieTarget: number;
  patternPassword: number[]; // Sequence of node indices 0 to 8
  patternEnabled?: boolean;
  isLocked: boolean;
  biometricEnabled: boolean;
  plan: UserPlan;
  subscriptionPlanName?: string;
  subscriptionProductId?: string;
  nextBillingDate?: string;
  autoBillingEnabled?: boolean;
  initialPhotoUrl?: string;
  initialPhotoDate?: string;
  goalPhotoUrl?: string;
  goalPhotoDate?: string;
  customFourWeeksGoalKg?: number;
  ambitionDeadline?: string;
  fourWeeksTargetWeight?: number;
  ambitionStartedAt?: string;
  dashboardKpis?: string[];
  isAdmin?: boolean;
  isOnboardingCompleted?: boolean;
  adminNotes?: string;
  shareWithAdmin?: boolean;
  preferredLanguage: LanguageCode;
  createdAt: string;
  currency: string;
  imagesCalorieScannedCount: number;
  weeklyPhotosCount: number;
  pdfReportGeneratedCount?: number;
  inbodyScansCount?: number;
  waterGoalLiters: number;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt?: string; // ISO timestamp, makes multiple weigh-ins per day unambiguous
  weight: number; // in kg
  bodyFatPercentage?: number;
  waterLiters?: number;
  waistCm?: number;
  mood: 'great' | 'good' | 'neutral' | 'struggling';
  notes?: string;
  photoUrl?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  proteins: number; // in g
  carbs: number; // in g
  fats: number; // in g
  fiber?: number; // in g
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface NutritionEntry extends FoodItem {
  date: string; // YYYY-MM-DD
  mealType: MealType;
  imageUrl?: string;
  scannedWithAI?: boolean;
  identifiedFoods?: { name: string; portion: string; calories: number }[];
}

export interface WeeklyPhoto {
  id: string;
  weekNumber: number;
  date: string;
  angle: 'front' | 'side' | 'back';
  imageUrl: string;
  sideImageUrl?: string;
  backImageUrl?: string;
  weightAtTime: number;
  notes?: string;
  aiAnalysis?: {
    summary: string;
    waistChangeEstimatedCm?: number;
    muscleToneAssessment: string;
    fatReductionScore: number; // 0 to 100
    recommendation: string;
  };
}

export interface ReminderSetting {
  id: string;
  type: 'morning_weigh' | 'breakfast_log' | 'lunch_log' | 'dinner_log' | 'snack_log' | 'hydration' | 'weekly_photo';
  titleKey: string;
  time: string; // HH:MM
  enabled: boolean;
  frequency: 'daily' | 'hourly' | 'weekly';
  intervalMinutes?: number;
  endTime?: string;
}

export type SmartwatchBrand = 'apple' | 'garmin' | 'fitbit' | 'samsung' | 'pixel';

export interface SmartwatchData {
  connected: boolean;
  brand: SmartwatchBrand;
  lastSyncTime: string;
  todaySteps: number;
  stepGoal: number;
  activeCaloriesBurned: number;
  heartRateBpm: number;
  distanceKm: number;
  workouts: {
    id: string;
    type: string;
    durationMinutes: number;
    calories: number;
    time: string;
  }[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'flagged';
  paymentMethod: 'card' | 'apple_pay' | 'sepa';
  customerName: string;
  customerEmail: string;
  planName: string;
  riskScore: number; // 0 - 100
  fraudFlags?: string[];
  cardBrand?: string;
  cardLast4?: string;
  country?: string;
}

export interface FinancialStats {
  totalRevenue: number;
  mrr: number;
  activeSubscribers: number;
  operationalExpenses: number;
  stripeBalance: number;
  fraudAlertsCount: number;
}
