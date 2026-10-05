import { 
  UserProfile, 
  WeightEntry, 
  NutritionEntry, 
  WeeklyPhoto, 
  ReminderSetting, 
  SmartwatchData, 
  Transaction, 
  FinancialStats,
  LanguageCode,
  WaterLogEntry
} from '../types';
import { deviceLanguage, countryOptionsForLanguage } from './locales';
import { localDate } from './dates';

export const STORAGE_KEYS = {
  USER_PROFILE: 'auraslim_v6_user_profile',
  WEIGHT_ENTRIES: 'auraslim_v6_weight_entries',
  NUTRITION_ENTRIES: 'auraslim_v6_nutrition_entries',
  WEEKLY_PHOTOS: 'auraslim_v6_weekly_photos',
  REMINDERS: 'auraslim_v6_reminders',
  SMARTWATCH: 'auraslim_v6_smartwatch',
  TRANSACTIONS: 'auraslim_v6_transactions',
  ADMIN_STATS: 'auraslim_v6_admin_stats',
  SESSION_LOCKED: 'auraslim_v6_session_locked',
  COLOR_MODE: 'auraslim_v6_color_mode',
  ADMIN_AUTH: 'auraslim_v6_admin_auth',
  WATER_LOGS: 'auraslim_v6_water_logs'
};

export const defaultProfile: UserProfile = {
  id: 'usr_client_001',
  name: '',
  firstName: '',
  lastName: '',
  country: 'France',
  countryCode: 'FR',
  weightGoal: 'lose',
  phone: '',
  email: '',
  gender: 'female',
  age: 28,
  heightCm: 168,
  startingWeight: 75.0,
  currentWeight: 75.0,
  targetWeight: 65.0,
  dailyCalorieTarget: 1750,
  patternPassword: [],
  patternEnabled: false,
  isLocked: false,
  biometricEnabled: false,
  plan: 'free',
  subscriptionPlanName: 'Gratuit Découverte',
  subscriptionProductId: undefined,
  nextBillingDate: undefined,
  autoBillingEnabled: false,
  initialPhotoUrl: '',
  initialPhotoDate: localDate(),
  isAdmin: false,
  isOnboardingCompleted: false, // Starts from ZERO!
  adminNotes: '',
  shareWithAdmin: false,
  preferredLanguage: deviceLanguage(),
  createdAt: new Date().toISOString(),
  currency: 'EUR',
  imagesCalorieScannedCount: 0,
  weeklyPhotosCount: 0,
  pdfReportGeneratedCount: 0,
  inbodyScansCount: 0,
  waterGoalLiters: 2.5
};

export const initialWeightEntries: WeightEntry[] = [];
export const initialNutritionEntries: NutritionEntry[] = [];
export const initialWeeklyPhotos: WeeklyPhoto[] = [];

export const initialReminders: ReminderSetting[] = [
  { id: 'rem-1', type: 'morning_weigh', titleKey: 'reminderMorningWeigh', time: '07:30', enabled: true, frequency: 'daily' },
  { id: 'rem-2', type: 'hydration', titleKey: 'reminderHydration', time: '08:00', endTime: '21:00', intervalMinutes: 120, enabled: true, frequency: 'hourly' },
  { id: 'rem-6', type: 'breakfast_log', titleKey: 'Petit déjeuner', time: '08:30', enabled: false, frequency: 'daily' },
  { id: 'rem-3', type: 'lunch_log', titleKey: 'reminderLunchLog', time: '12:45', enabled: true, frequency: 'daily' },
  { id: 'rem-7', type: 'snack_log', titleKey: 'Collation', time: '16:00', enabled: false, frequency: 'daily' },
  { id: 'rem-4', type: 'dinner_log', titleKey: 'reminderDinnerLog', time: '19:30', enabled: true, frequency: 'daily' },
  { id: 'rem-5', type: 'weekly_photo', titleKey: 'reminderWeeklyPhoto', time: '09:00', enabled: true, frequency: 'weekly' }
];

export const initialSmartwatch: SmartwatchData = {
  connected: false,
  brand: 'apple',
  lastSyncTime: 'Non synchronisé',
  todaySteps: 0,
  stepGoal: 10000,
  activeCaloriesBurned: 0,
  heartRateBpm: 0,
  distanceKm: 0,
  workouts: []
};

export const initialTransactions: Transaction[] = [];

export const initialAdminStats: FinancialStats = {
  totalRevenue: 0,
  mrr: 0,
  activeSubscribers: 0,
  operationalExpenses: 0,
  stripeBalance: 0,
  fraudAlertsCount: 0
};

export const TEST_BUILD_KEY = 'auraslim_test_fresh_build_v10';

// Storage helper functions
export const getStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return { ...defaultProfile, preferredLanguage: deviceLanguage(), isOnboardingCompleted: false };
    const parsed = JSON.parse(raw);
    if (parsed.isOnboardingCompleted) {
      if (!parsed.weightGoal) parsed.weightGoal = Number(parsed.targetWeight) > Number(parsed.startingWeight) ? 'gain' : 'lose';
      if (!parsed.countryCode && parsed.country) {
        const options = [...countryOptionsForLanguage(parsed.preferredLanguage || 'fr'), ...countryOptionsForLanguage('fr'), ...countryOptionsForLanguage('en')];
        parsed.countryCode = options.find(item => item.name.toLocaleLowerCase() === String(parsed.country).toLocaleLowerCase())?.code || defaultProfile.countryCode;
      }
    }
    if (!parsed.name || parsed.isOnboardingCompleted !== true) {
      return { ...defaultProfile, ...parsed, plan: 'free', isOnboardingCompleted: false };
    }
    // Client storage is editable; only the server may grant paid access.
    return { ...defaultProfile, ...parsed, plan: 'free', autoBillingEnabled: false };
  } catch {
    return { ...defaultProfile, isOnboardingCompleted: false };
  }
};

export const saveStoredProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
};

export const getStoredWeights = (): WeightEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
    if (!raw) return initialWeightEntries;
    return JSON.parse(raw);
  } catch {
    return initialWeightEntries;
  }
};

export const saveStoredWeights = (entries: WeightEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save weights', err);
  }
};

export const getStoredNutrition = (): NutritionEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NUTRITION_ENTRIES);
    if (!raw) return initialNutritionEntries;
    return JSON.parse(raw);
  } catch {
    return initialNutritionEntries;
  }
};

export const saveStoredNutrition = (entries: NutritionEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NUTRITION_ENTRIES, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save nutrition', err);
  }
};

export const getStoredWeeklyPhotos = (): WeeklyPhoto[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_PHOTOS);
    if (!raw) return initialWeeklyPhotos;
    return JSON.parse(raw);
  } catch {
    return initialWeeklyPhotos;
  }
};

export const saveStoredWeeklyPhotos = (photos: WeeklyPhoto[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_PHOTOS, JSON.stringify(photos));
  } catch (err) {
    console.error('Failed to save weekly photos', err);
  }
};

export const getStoredReminders = (): ReminderSetting[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) return initialReminders;
    const saved = JSON.parse(raw) as ReminderSetting[];
    if (!Array.isArray(saved)) return initialReminders;
    return initialReminders.map(rem => saved.find(old => old.id === rem.id) || rem);
  } catch {
    return initialReminders;
  }
};

export const saveStoredReminders = (reminders: ReminderSetting[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save reminders', err);
  }
};

export const getStoredSmartwatch = (): SmartwatchData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SMARTWATCH);
    if (!raw) return initialSmartwatch;
    return JSON.parse(raw);
  } catch {
    return initialSmartwatch;
  }
};

export const saveStoredSmartwatch = (data: SmartwatchData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SMARTWATCH, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save smartwatch', err);
  }
};

export const getStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return initialTransactions;
    return JSON.parse(raw);
  } catch {
    return initialTransactions;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions', err);
  }
};

export const getStoredAdminStats = (): FinancialStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_STATS);
    if (!raw) return initialAdminStats;
    return JSON.parse(raw);
  } catch {
    return initialAdminStats;
  }
};

export const saveStoredAdminStats = (stats: FinancialStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save admin stats', err);
  }
};

export const getStoredColorMode = (): 'dark' | 'light' => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLOR_MODE);
    return raw === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const saveStoredColorMode = (mode: 'dark' | 'light'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COLOR_MODE, mode);
  } catch (err) {
    console.error('Failed to save color mode', err);
  }
};

export const getStoredWaterLogs = (): WaterLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredWaterLogs = (logs: WaterLogEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save water logs', err);
  }
};

export const resetAllDataToZero = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    Object.keys(localStorage).filter(key => key.startsWith('auraslim_')).forEach(key => localStorage.removeItem(key));
    Object.keys(sessionStorage).filter(key => key.startsWith('auraslim_notified_')).forEach(key => sessionStorage.removeItem(key));
  } catch (e) {
    console.error('Failed to reset all data', e);
  }
};
