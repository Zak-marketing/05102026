import type { LanguageCode } from '../types/index.ts';
import { onboardingStrings, type OnboardingDictionary } from './onboardingTranslations.ts';
import { goalCopy } from './goalCopy.ts';
import { esTranslations } from './translations/es';
import { deTranslations } from './translations/de';
import { itTranslations } from './translations/it';
import { ptTranslations } from './translations/pt';
import { arTranslations } from './translations/ar';
import { ruTranslations } from './translations/ru';
import { zhTranslations } from './translations/zh';
import { jaTranslations } from './translations/ja';
import { trTranslations } from './translations/tr';

export interface TranslationDictionary {
  navReports?: string;
  reportOverview?: string;
  accountLanguageTitle?: string;
  accountLanguageDesc?: string;
  ambitionTitle?: string;
  chooseGoal?: string;
  personalGoalLabel?: string;
  heightLabel?: string;
  weightLabel?: string;
  profileTitle?: string;
  calorieGuide?: string;
  waterGuide?: string;
  appName: string;
  tagline: string;
  navProgress: string;
  navNutrition: string;
  navPhotos: string;
  navHydration?: string;
  navInBody?: string;
  navComposeMeals?: string;
  composeMealsSubtitle?: string;
  mealPortionNotice?: string;
  customDishBtn?: string;
  addCustomFoodTitle?: string;
  mealHistoryTitle?: string;
  mealsLoggedCount?: string;
  noMealsLoggedYet?: string;
  accountGoalRegionTitle?: string;
  accountGoalRegionDesc?: string;
  culinaryRegionLabel?: string;
  accessDashboard?: string;
  optionalSecurityCode?: string;
  navWatch: string;
  navReminders: string;
  navAccount: string;
  navAdminFinances: string;
  helloPrefix?: string;
  dailyMotivationLabel?: string;
  goalChoiceLabel?: string;
  goalLose?: string;
  goalGain?: string;
  goalMaintain?: string;
  bmiExplTitle?: string;
  projectionExplTitle?: string;
  targetExplTitle?: string;
  currentExplTitle?: string;
  progressExplTitle?: string;
  projectionDynamic28dDesc?: string;
  weeksCount?: string;
  targetRecommendationTitle?: string;
  targetRecommendationPace?: string;
  currentStartWeightLabel?: string;
  currentNetLoss?: string;
  currentNetGain?: string;
  currentAnalysisTitle?: string;
  currentInitialWeighIn?: string;
  currentLatestUpdate?: string;
  currentSummaryNotice?: string;
  progressTotalDistance?: string;
  progressDistanceRemaining?: string;
  progressActiveGoalTitle?: string;
  progressSummaryTitle?: string;
  progressSummaryNotice?: string;
  projectionDynamic4w?: string;
  
  // Security & Pattern Lock
  patternLockTitle: string;
  patternLockSubtitle: string;
  patternSetTitle: string;
  patternSetInstructions: string;
  patternConfirmInstructions: string;
  patternMismatch: string;
  patternSaved: string;
  patternUnlockPrompt: string;
  patternErrorAttempts: string;
  patternBiometricBtn: string;
  patternClear: string;
  patternReset: string;
  lockNow: string;
  encryptedVault: string;
  encryptedNotice: string;

  // Weight tracking
  weightCurrent: string;
  weightStart: string;
  weightTarget: string;
  weightLost: string;
  weightRemaining: string;
  bmiLabel: string;
  bmiCategory: string;
  logWeightBtn: string;
  weightHistory: string;
  weightTrendAnalysis: string;
  projectedWeight4w?: string;
  projectedWeightSubtitle?: string;
  weeklyTrendRate?: string;
  projectedGoalDate?: string;
  projectedBadge?: string;
  bodyFatLabel: string;
  waistLabel: string;
  waterIntakeLabel: string;
  moodLabel: string;
  saveEntry: string;
  congratsMilestone: string;

  // Free vs Pro limits
  freePlanBadge: string;
  proPlanBadge: string;
  upgradeToPro: string;
  proFeaturesTitle: string;
  freeLimitReachedPhotos: string;
  freeLimitReachedCalories: string;
  proUnlimitedCloud: string;

  // Photo weekly
  photoWeeklyTitle: string;
  photoWeeklySubtitle: string;
  photoTakeBtn: string;
  photoAngleFront: string;
  photoAngleSide: string;
  photoAngleBack: string;
  photoCompareMode: string;
  photoBeforeAfterSlider: string;
  photoSideBySide?: string;
  photoGhostOverlay: string;
  photoInitialLabel: string;
  photoWeekLabel: string;
  photoDragSliderHint: string;
  photoSelectInitial?: string;
  photoSelectRecent?: string;
  photoWeightDiff?: string;
  photoDaysApart?: string;

  // Calorie & food
  calorieTitle: string;
  calorieSubtitle: string;
  calorieScanPlate: string;
  calorieSearchFood: string;
  calorieTodayConsumed: string;
  calorieTarget: string;
  calorieBurned: string;
  calorieRemaining: string;
  macronutrients: string;
  proteins: string;
  carbs: string;
  fats: string;
  fiber: string;
  addCustomMeal: string;
  scanningFoodText: string;
  scanPlateResult: string;

  // Nutrition Advice
  nutritionAdviceTitle: string;
  nutritionAdviceSubtitle: string;
  personalizedForYou: string;
  tipHydration: string;
  tipProteins: string;
  tipDeficit: string;
  tipRecovery: string;

  // Smartwatch
  watchTitle: string;
  watchSubtitle: string;
  watchConnect: string;
  watchConnected: string;
  watchSyncNow: string;
  watchSteps: string;
  watchActiveBurn: string;
  watchHeartRate: string;
  watchWorkouts: string;
  watchSyncSuccess: string;

  // Reminders
  remindersTitle: string;
  remindersSubtitle: string;
  reminderMorningWeigh: string;
  reminderLunchLog: string;
  reminderDinnerLog: string;
  reminderHydration: string;
  reminderWeeklyPhoto: string;
  enableNotifications: string;
  testNotification: string;
  notificationSent: string;

  // Gender & Appearance
  genderTitle: string;
  genderFemale: string;
  genderMale: string;
  genderNeutral: string;
  themePreview: string;

  // Stripe & Payments
  paymentModalTitle: string;
  paymentPlanPro: string;
  paymentPrice: string;
  paymentPerMonth: string;
  payCardVisa: string;
  payApplePay: string;
  paySepa: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  paySubmit: string;
  pciComplianceBadge: string;
  gdprBadge: "Données personnelles · confidentialité",
  paymentSuccess: string;

  // Admin Financial Dashboard
  adminTitle: string;
  adminSubtitle: string;
  adminTotalRevenue: string;
  adminMrr: string;
  adminStripeBalance: string;
  adminExpenses: string;
  adminRecentTransactions: string;
  adminFraudDetection: string;
  adminRiskScore: string;
  adminAnomalyAlert: string;
  adminTakeAction: string;
  adminPayoutNotice: string;

  // Health Report & Dietitian PDF
  reportTitle?: string;
  reportSubtitle?: string;
  reportDownloadBtn?: string;
  reportPrintBtn?: string;
  reportPatientBio?: string;
  reportWeightTrend?: string;
  reportNutritionSummary?: string;
  reportActivitySummary?: string;
  reportDietitianNotes?: string;
  reportPractitionerSign?: string;
  reportConfidential?: string;
  reportGeneratedOn?: string;
  reportExportSuccess?: string;
  openHealthReport?: string;

  // Visual Theme Modes (Sombre / Clair)
  themeModeDark?: string;
  themeModeLight?: string;

  // Voice Measurement Dictation
  voiceInputTitle?: string;
  voiceInputListening?: string;
  voiceInputHint?: string;
  voiceInputStop?: string;
  voiceMicTooltip?: string;
  voiceNotSupported?: string;

  // Platform & UI Details
  themeFemale?: string;
  themeMale?: string;
  themeNeutral?: string;
  accountSettingsDesc?: string;
  gdprExportSuccess?: string;
  planActive?: string;
  planProLifetime?: string;
  planProDesc?: string;
  planFreeDesc?: string;
  platformLanguage?: string;
  platformLanguageDesc?: string;
  patternPasswordTitle?: string;
  patternPasswordDesc?: string;
  modifyPatternBtn?: string;
  zeroKnowledgeDesc?: string;
  gdprTitle?: string;
  gdprDesc?: string;
  gdprExportBtn?: string;
  deleteBtn?: string;
  closeBtn?: string;
  recentEntries?: string;
  newEntry?: string;
  measuredWeight?: string;
  weeklyPaceLabel?: string;
  daysLabel?: string;
  goalReachedActive?: string;
  paceMaintenance?: string;
  statisticalReliability?: string;
  photoSideBySideUnavailable?: string;
  photoSideBySideUnavailableDesc?: string;

  // Nutrition Advice detailed keys
  tipProteinsOptimalTitle?: string;
  tipProteinsIncreaseTitle?: string;
  tipProteinsOptimalDesc?: string;
  tipProteinsIncreaseDesc?: string;
  tipHydrationOptimalTitle?: string;
  tipHydrationRemainingTitle?: string;
  tipHydrationDesc?: string;
  tipDeficitHighTitle?: string;
  tipDeficitOptimalTitle?: string;
  tipDeficitHighDesc?: string;
  tipDeficitOptimalDesc?: string;
  tipRecoveryTitle?: string;
  tipRecoveryDesc?: string;

  // Smartwatch detailed keys
  syncing?: string;
  goal?: string;
  watchBurnDeficitDesc?: string;
  watchHeartRateOptimal?: string;
  watchDistanceCovered?: string;
  watchLastSync?: string;
  watchAutoSyncDesc?: string;
  duration?: string;
  recordedAt?: string;
  watchLipolysisZone?: string;

  // Reminder detailed keys
  notificationAllowed?: string;
  notificationDenied?: string;
  notificationUnsupported?: string;
  justNow?: string;
  frequency?: string;
  frequencyDaily?: string;
  frequencyHourly?: string;
  frequencyWeekly?: string;
  reminderNotificationBody?: string;

  // Admin & Financial detailed keys
  stripeConnectOnline?: string;
  thisMonth?: string;
  activeVipSubscribers?: string;
  adminOperatingCostsDesc?: string;
  adminWeeklyPayout?: string;
  mlAnomalyModel?: string;
  adminFraudSubtitle?: string;
  adminRiskIdentified?: string;
  activeAnomaly?: string;
  riskScore?: string;
  allow?: string;
  blockAndRefund?: string;
  all?: string;
  validated?: string;
  suspect?: string;
  mlRisk?: string;
  validatedStripe?: string;
  anomaly?: string;

  // Weekly Goals ("Objectifs Hebdomadaires")
  weeklyGoalTitle?: string;
  weeklyGoalSubtitle?: string;
  weeklyGoalSetTarget?: string;
  weeklyGoalCurrentTarget?: string;
  weeklyGoalProgress?: string;
  weeklyGoalRemaining?: string;
  weeklyGoalAchieved?: string;
  weeklyGoalDaysLeft?: string;
  weeklyGoalPaceNeeded?: string;
  weeklyGoalPaceMaintenance?: string;
  weeklyGoalEditBtn?: string;
  weeklyGoalSaveBtn?: string;
  weeklyGoalPresetGentle?: string;
  weeklyGoalPresetStandard?: string;
  weeklyGoalPresetIntense?: string;
  weeklyGoalStartWeight?: string;
  weeklyGoalCurrentWeight?: string;
  weeklyGoalLostThisWeek?: string;
  weeklyGoalWeekTargetLabel?: string;
  weeklyGoalTargetReachedNotice?: string;
  weeklyGoalKeepGoingNotice?: string;

  // Live Camera Activation
  cameraModalTitle?: string;
  cameraShutter?: string;
  cameraSwitchFacing?: string;
  cameraRetake?: string;
  cameraConfirm?: string;
  cameraPermissionDenied?: string;
  cameraPermissionHint?: string;
  cameraUploadGallery?: string;
  cameraTimer3s?: string;
  cameraLive?: string;
  cameraGallery?: string;
  cameraScalePhoto?: string;
  cameraScalePhotoOptional?: string;
  cameraFoodTitle?: string;
  cameraProgressPhotoTitle?: string;
  cameraTakeFoodPhoto?: string;
  cameraChooseFromGallery?: string;

  // Water Intake Tracker
  waterTrackerTitle?: string;
  waterTrackerSubtitle?: string;
  waterGlassesLogged?: string;
  waterGlass250ml?: string;
  waterBottle500ml?: string;
  waterLiters1L?: string;
  waterRemoveGlass?: string;
  waterGoalReached?: string;
  waterRemainingLiters?: string;
  waterResetBtn?: string;
  testInitialScreenBtn?: string;

  // Enhanced UI translation keys
  nutritionPdfBannerTitle?: string;
  nutritionPdfBannerBadge?: string;
  nutritionPdfBannerDesc?: string;
  nutritionPdfBannerBtn?: string;
  periodsOfDayTitle?: string;
  clickToChooseFoodHint?: string;
  periodBreakfast?: string;
  periodLunch?: string;
  periodDinner?: string;
  periodSnack?: string;
  chooseBtn?: string;
  keyOptionScanBadge?: string;
  scanPlateDescription?: string;
  targetedMealLabel?: string;
  takePlatePhotoBtn?: string;
  directBadge?: string;
  deviceCameraDesc?: string;
  galleryPhotosBtn?: string;
  importExistingPhotoDesc?: string;
  foodIdeasFor?: string;
  searchFoodPlaceholder?: string;
  todayLoggedMealsTitle?: string;
  totalAlimentsSuffix?: string;
  noMealsLoggedToday?: string;
  mealsHistoryTitle?: string;
  noMealsHistory?: string;
  photoEvolutionTitle?: string;
  photoEvolutionSubtitle?: string;
  addPhotoBtn?: string;
  generateVideoBtn?: string;
  galleryCountLabel?: string;
  compareBeforeAfterTitle?: string;
  dragCenterToCompareHint?: string;
  photoBeforeLabel?: string;
  photoAfterLabel?: string;
  badgeAvant?: string;
  badgeApres?: string;
  dayOneLabel?: string;
  weekAbbrev?: string;
  freeBadge?: string;
  premiumBadge?: string;
  disclaimerFooter?: string;
  offersBtn?: string;
  newPhotoModalTitle?: string;
  newPhotoModalSubtitle?: string;
  photoAngleFace?: string;
  photoAngleProfile?: string;
  photoAngleBackLabel?: string;
  notesOptionalPlaceholder?: string;
  cancelBtn?: string;
  saveBtn?: string;
  plateRecognizedSuccess?: string;
  estimatedPortion?: string;
  saveMealToLog?: string;
  recognizedFoodsAi?: string;
  listenFoods?: string;

  // Additional Photo & Slider Keys
  photoFitCover?: string;
  photoFitContain?: string;
  photoWaitingSecond?: string;
  photoWaitingSecondDesc?: string;
  photoTakeSecondBtn?: string;
  photoFromGallery?: string;
  photoFromCamera?: string;
  photoFreeLimitNotice?: string;
  photoDragHintBottom?: string;
  photoDayOne?: string;
  photoError?: string;

  // Additional Account Settings Keys
  accountSettingsTitle?: string;
  accountMyPlan?: string;
  accountPlanFree?: string;
  accountPlanDesc?: string;
  accountViewOffersBtn?: string;
  accountTrialTitle?: string;
  accountTrialPlaceholder?: string;
  accountTrialBtn?: string;
  accountTrialSuccess?: string;
  accountShareAdminTitle?: string;
  accountShareAdminDesc?: string;
  accountShareAdminConsent?: string;
  accountLangTitle?: string;
  accountLangDesc?: string;
  accountAppLanguage?: string;
  accountCurrency?: string;
  accountStripeNotice?: string;
  accountPatternTitle?: string;
  accountPatternDesc?: string;
  accountPatternCreateBtn?: string;
  accountPatternLockBtn?: string;
  accountPatternDisableBtn?: string;
  accountWatchTitle?: string;
  bleDisconnected?: string; bleLiveData?: string; bleNoHeartRate?: string; bleLiveWeight?: string; bleNoWeight?: string;
  bleUnnamed?: string; bleConnected?: string; bleCancelled?: string; bleConnectError?: string; bleSyncDone?: string;
  bleNoBattery?: string; blePermission?: string; bleReminderBody?: string; bleNotificationSent?: string; bleNotificationError?: string;
  bleDescription?: string; bleConnectedBadge?: string; bleHeartRateLabel?: string; bleWeightLabel?: string; bleBatteryLabel?: string;
  bleSync?: string; blePairHeartRate?: string; bleHeartRateProfile?: string; blePairScale?: string; bleWeightProfile?: string;
  bleMirrorHint?: string; bleBrowserHint?: string;
  accountDataTitle?: string;
  accountDataDesc?: string;
  accountExportBtn?: string;
  accountPdfReportBtn?: string;
  accountDeleteDataBtn?: string;
  accountDeleteDataConfirm?: string;

  // Additional PDF & Health Report Keys
  pdfReportTitle?: string;
  pdfReportSubtitle?: string;
  pdfStart?: string;
  pdfLatest?: string;
  pdfChange?: string;
  pdfGoal?: string;
  pdfWeightTrend?: string;
  pdfMeasurements?: string;
  pdfWeightLog?: string;
  pdfMealLog?: string;
  pdfDownloadBtn?: string;
  pdfPreparing?: string;

  // Water Tracker
  waterTargetLabel?: string;
  waterResetDay?: string;
  waterNoGlassesToday?: string;
  waterDeleteEntry?: string;
  dailyHydrationGoalTitle?: string;
  dailyHydrationGoalDesc?: string;
  litersPerDayUnit?: string;
  waterLogsTodayTitle?: string;
  waterEditGoalTitle?: string;

  // Weight Tracker Metrics & Projections
  sinceStart?: string;
  weekAbbrevShort?: string;
  remainingLabel?: string;
  globalProgress?: string;
  weeklyStartWeightLabel?: string;
  weeklyTargetLabel?: string;
  weeklyProgressAchievedTitle?: string;
  weeklyRemainingLabel?: string;
  milestoneStart?: string;
  milestoneCurrent?: string;
  milestoneSundayTarget?: string;
  daysUntilSundayLabel?: string;
  projected4wTitle?: string;
  projected4wSubtitle?: string;
  paceLabel?: string;
  currentPaceLabel?: string;
  mathExtrapolationDisclaimer?: string;
  weekUnit?: string;
  projectedWeight28d?: string;
  estimatedGoalDateLabel?: string;
  daysUnit?: string;
  goalAchievedMaintenance?: string;
  maintainingPace?: string;
  fitR2Label?: string;
  simulatorAdvantage4wTitle?: string;
  vision28Days?: string;
  simulatorVisionPrompt?: string;
  in4WeeksYouWouldBeAt?: string;
  diffIn28DaysLabel?: string;
  remainingAfterwardsLabel?: string;
  whatToDoToSucceed4w?: string;
  actionPlanRule1Title?: string;
  actionPlanRule1Text?: string;
  actionPlanRule2Title?: string;
  actionPlanRule2Text?: string;
  actionPlanRule3Title?: string;
  actionPlanRule3Text?: string;
  actionPlanRule4Title?: string;
  actionPlanRule4Text?: string;
  actionPlanRule5Title?: string;
  actionPlanRule5Text?: string;
  simPaceGentle?: string;
  simPaceIdeal?: string;
  simPaceDynamic?: string;
  simPaceIntense?: string;
  targetAnalysisTitle?: string;
  targetRemainingGap?: string;
  targetEstimatedDurationTitle?: string;
  targetDurationIntro?: string;
  weeksUnit?: string;
  perWeekShort?: string;
  targetGoalSub?: string;
  simulationDynamic28d?: string;
  startWeightShort?: string;
  currentWeightShort?: string;
  goalLoseWord?: string;
  goalGainWord?: string;
  goalMaintainWord?: string;
  currentOverviewTitle?: string;
  sinceStartLabel?: string;
  currentContinuousAnalysisNotice?: string;
  progressJourneyAccomplished?: string;
  progressDistanceCovered?: string;
  whoNormNotice?: string;
  yourPositionBadge?: string;
  healthyWeightRangeTitle?: string;
  betweenRange?: string;
  andWord?: string;
  goalInHealthyRange?: string;
  goalOutsideHealthyRange?: string;
  detailsBtn?: string;
  simulateBtn?: string;
  activateNowBtn?: string;
  activeBadge?: string;
  payOnStripeBtn?: string;
  paymentSuccessNotice?: string;
  projectionGoalExplanationTitle?: string;
  projectionGoalLoseExplanation?: string;
  projectionGoalGainExplanation?: string;
  projectionGoalMaintainExplanation?: string;
  projectedPaceModelLabel?: string;
  understandBmiBtn?: string;
  unlimitedScanMealOption?: string;
  activateScanOption?: string;
  unlimitedProgressOption?: string;
  unlockProgressPricing?: string;
  activateProgressOption?: string;
  completePackOption?: string;
  unlockCompletePricing?: string;
  activateCompleteOption?: string;
  inbodyFreeTrialNotice?: string;
  pdfReportFreeTrialNotice?: string;
  inbodyScanMandatoryNotice?: string;
  inbodyClearPhotoRequired?: string;
  inbodyMedicalAdviceMandatory?: string;
  inbodyWorkoutPlanTitle?: string;
  inbodyNutritionPlanTitle?: string;
  weightHistoryTrendTitle?: string;
  weightChartSubtitle?: string;
  chartReadingDirection?: string;
  goalLabel?: string;
  measuredWeightLegend?: string;
  projection4wLegend?: string;
  goalLegend?: string;
  latestWeighInLabel?: string;
  todayLabel?: string;
  weighInsLoggedCount?: string;
  bodyFatAbbrev?: string;
  logWeightSubtitle?: string;
  voiceListeningBadge?: string;
  dictateBtn?: string;
  voiceStopDictation?: string;
  voiceStartDictation?: string;
  bodyWeightInputLabel?: string;
  scalePhotoOrSilhouette?: string;
  optionalBadge?: string;
  photoSavedBadge?: string;
  takeScalePhotoBtn?: string;
  waistInputLabel?: string;
  dictateWaist?: string;
  moodGreat?: string;
  moodGood?: string;
  moodNeutral?: string;
  moodStruggling?: string;
  notesLabel?: string;
  dictateNotes?: string;
  notesPlaceholder?: string;
  twoPhotosFreeUsedNotice?: string;

  // Progression Video Modal
  videoStepDayOne?: string;
  videoOverlayTitle?: string;
  videoOverlaySubtitle?: string;
  videoInitialWeightLabel?: string;
  videoVariationLabel?: string;
  videoEvolutionLabel?: string;
  videoModalTitle?: string;
  videoModalSubtitle?: string;
  videoGeneratingText?: string;
  downloadVideoBtn?: string;
  shareVideoBtn?: string;
  socialMediaHeading?: string;
  copyLinkBtn?: string;
  linkCopiedBadge?: string;
  shareMoreBtn?: string;
  videoShareTip?: string;
  videoTimelineTitle?: string;
  videoPrivacyNotice?: string;
  videoLoadingPhoto?: string;
  videoCannotLoadPhotoError?: string;
  videoRecorderNotSupportedError?: string;
  videoEmptyError?: string;
  videoRecordingError?: string;

  // Calorie Calculator
  calorieScanDisclaimer?: string;
  retryWithThisPhoto?: string;
  unlockScanPricing?: string;
  aiIdentifyingIngredients?: string;
  mealIdeasDisclaimer?: string;
  indicativePortionLabel?: string;
  forQuantityLabel?: string;
  addToMealTitle?: string;
  photoOfLoggedMeal?: string;
  photoDishForMeal?: string;
  centerPlateSubtitle?: string;
  foodPhotoIllustrativeDesc?: string;
  photoSourceCommons?: string;
  removeFoodItem?: string;

  // Additional Missing UI keys
  mealTypeLabel?: string;
  macroProteins?: string;
  macroCarbs?: string;
  macroFats?: string;
  dateLabel?: string;
  localVideoBadge?: string;
  pauseBtn?: string;
  playBtn?: string;
  restartBtn?: string;
  speedLabel?: string;
  formulaTitle?: string;
  whoClassificationTitle?: string;
  confirmBtn?: string;
  glassesCount?: string;
  toGain?: string;
  toLose?: string;

  // Payment Modal
  paymentTariffsDesc?: string;
  paymentStripeTestNotice?: string;
  paymentPayOnStripe?: string;
  paymentPreparingLink?: string;
  paymentCheckoutDisclaimer?: string;
  paymentSecureReturn?: string;
  paymentPopupBlocked?: string;
  paymentCancelledNotice?: string;
  paymentVerificationPending?: string;
  paymentVerifiedStatus?: string;
  paymentRetryVerification?: string;
  trackingDayLabel?: string;

  // Pattern Lock & Security
  patternScreenLockDesc?: string;

  // App & General
  loadingLocalData?: string;
  startingWeightLabel?: string;
  dayOnePhotoLabel?: string;
  checkingSubscription?: string;
  remainingPhotosCount?: string;
  frontPhotoRequiredError?: string;

  // Nutrition & Scanner Keys
  macroCalories?: string;
  nutritionReportTitle?: string;
  pdfAvailableBadge?: string;
  nutritionReportSubtitle?: string;
  generateNutritionReportPdf?: string;
  addAnalyzedPlateToLog?: string;
  portionLabel?: string;
  scanAiBadge?: string;
  analyzedDishAlt?: string;
  ingredientsUncertainNotice?: string;
  plateScanDisclaimer?: string;
  macroTargetLabel?: string;
  foodsPlural?: string;
  foodSingular?: string;

  // Live Camera Keys
  cameraHttpsRequired?: string;
  cameraUnavailableError?: string;
  cameraActivating?: string;
  cameraDirectAccessTitle?: string;
  cameraDirectAccessDesc?: string;
  cameraOpenDirectDevice?: string;
  cameraRetryStream?: string;
  cameraHowToAuthorize?: string;
  cameraHowToAuthorizeStepTitle?: string;
  cameraHowToAuthorizeStep1?: string;
  cameraHowToAuthorizeStep2?: string;
  cameraHowToAuthorizeStep3?: string;
  cameraTimerActive?: string;
  cameraTimer?: string;
  cameraFacingBack?: string;
  cameraFacingFront?: string;
  cameraTriggerShutter?: string;
  cameraDirectNativeTitle?: string;
  cameraDirectBadge?: string;

  // Photo Slider & Comparison
  dragSliderLabel?: string;

  // Nutrition Advice Summaries
  nutritionMealsLoggedSummary?: string;
  nutritionHydrationSummary?: string;
  nutritionLatestWeightSummary?: string;

  // Weight Tracker Extra
  voiceMeasurementSaved?: string;
  bmiUnderweight?: string;
  bmiNormal?: string;
  bmiOverweight?: string;
  bmiObese?: string;

  // Video Sharing & Social
  shareLostWeight?: string;
  shareGainedWeight?: string;
  shareRegularTracking?: string;
  shareProgressPrefix?: string;
  shareProgressSuffix?: string;
  clipboardInaccessible?: string;
  shareVideoTitle?: string;
  shareDirectUnavailable?: string;
  shareFileUnavailable?: string;

  // Pattern Lock Extra
  patternConfirmedNotice?: string;
  patternAccepted?: string;
  patternLockoutMessage?: string;
  patternRegisteredSuccess?: string;
  patternSecurityLockoutTitle?: string;
  patternLockoutCountdownNotice?: string;

  // Payment Extra
  paymentPrepError?: string;
  nativeAppPaymentNotice?: string;

  // Watch & Bluetooth
  accountWatchConnectDesc?: string;
  connectingStatus?: string;
  accountWatchPairBtn?: string;
  disconnectBtn?: string;
  accountWatchTestBtn?: string;
  batteryLabel?: string;
  heartRateLabel?: string;
}

export const languages: { code: LanguageCode; name: string; nativeName: string; flag: string }[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
];

export const translations: Partial<Record<LanguageCode, TranslationDictionary>> & { fr: TranslationDictionary; en: TranslationDictionary } = {
  fr: {
    navReports:'Bilan & Rapports',reportOverview:'Retrouvez vos mesures, votre IMC et vos repas enregistrés dans un bilan personnel.',accountLanguageTitle:'Langue',accountLanguageDesc:'Choisissez la langue de votre application.',ambitionTitle:'Mon ambition à 4 semaines',chooseGoal:'À définir',personalGoalLabel:'Le poids que vous souhaitez atteindre',
    appName: "AuraSlim Pro",
    tagline: "Perte de poids ultra-personnalisée & Morphologie",
    navProgress: "Progression",
    navNutrition: "Nutrition & Calories",
    navHydration: "Hydratation",
    navPhotos: "Évolution Photos",
    navInBody: "InBody & Analyse",
    navWatch: "Montre Connectée",
    navReminders: "Rappels",
    navAccount: "Mon Compte",
    navAdminFinances: "Finances & Sécurité",
    helloPrefix: "Bonjour / Hello :",
    dailyMotivationLabel: "Motivation du jour :",
    goalChoiceLabel: "Votre Objectif :",
    goalLose: "Perdre du poids",
    goalGain: "Prendre du poids",
    goalMaintain: "Stabilisation",

    patternLockTitle: "Sécurité Biométrique & Schéma",
    patternLockSubtitle: "Reliez les points pour déverrouiller votre session chiffrée",
    patternSetTitle: "Créer votre schéma graphique",
    patternSetInstructions: "Tracez un schéma en reliant au moins 4 points pour sécuriser vos données",
    patternConfirmInstructions: "Ressaisissez le même schéma pour confirmer",
    patternMismatch: "Le schéma ne correspond pas. Réessayez.",
    patternSaved: "Mot de passe graphique enregistré et chiffré !",
    patternUnlockPrompt: "Tracez votre schéma secret pour accéder à votre profil",
    patternErrorAttempts: "Schéma incorrect. Tentatives restantes : ",
    patternBiometricBtn: "Déverrouillage Rapide Biométrique",
    patternClear: "Effacer",
    patternReset: "Réinitialiser",
    lockNow: "Verrouiller la session",
    encryptedVault: "Coffre chiffré de bout en bout (AES-256)",
    encryptedNotice: "Vos données corporelles et photos sont chiffrées localement et inaccessibles aux tiers.",

    weightCurrent: "Poids Actuel",
    weightStart: "Poids Initial",
    weightTarget: "Objectif Cible",
    weightLost: "Poids Perdu",
    weightRemaining: "Reste à Perdre",
    bmiLabel: "Indice de Masse Corporelle (IMC)",
    bmiCategory: "Catégorie",
    logWeightBtn: "Enregistrer une pesée",
    weightHistory: "Historique des pesées",
    weightTrendAnalysis: "Analyse prédictive de perte",
    projectedWeight4w: "Poids Projeté (4 sem.)",
    projectedWeightSubtitle: "Projection par régression linéaire",
    weeklyTrendRate: "Rythme hebdomadaire",
    projectedGoalDate: "Objectif atteint vers le",
    projectedBadge: "Projection +4 sem.",
    bodyFatLabel: "Masse Grasse (%)",
    waistLabel: "Tour de Taille (cm)",
    waterIntakeLabel: "Eau consommée (L)",
    moodLabel: "Humeur du jour",
    saveEntry: "Sauvegarder",
    congratsMilestone: "Bravo ! Nouveau jalon de perte atteint 🎉",

    freePlanBadge: "Mode Gratuit (Essentiel)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "Passer à la formule Pro",
    proFeaturesTitle: "Passez à la vitesse supérieure",
    freeLimitReachedPhotos: "En mode gratuit, seule 1 photo de suivi après la photo initiale est autorisée. Débloquez l'historique complet avec le mode Pro !",
    freeLimitReachedCalories: "Vous avez utilisé votre calcul calorique photo gratuit. Débloquez le scanner IA illimité avec le mode Pro !",
    proUnlimitedCloud: "Stockage cloud chiffré, photos illimitées, scanner IA et rapports avancés.",

    photoWeeklyTitle: "Suivi Morphologique Hebdomadaire",
    photoWeeklySubtitle: "Comparez votre transformation visuelle semaine après semaine",
    photoTakeBtn: "Ajouter la photo de la semaine",
    photoAngleFront: "Face",
    photoAngleSide: "Profil",
    photoAngleBack: "Dos",
    photoCompareMode: "Mode Comparateur",
    photoBeforeAfterSlider: "Curseur Avant / Après",
    photoSideBySide: "Côte à Côte",
    photoGhostOverlay: "Superposition Fantôme (Posturale)",
    photoInitialLabel: "Initiale (S0)",
    photoWeekLabel: "Semaine",
    photoDragSliderHint: "Glissez le curseur horizontal pour révéler la métamorphose",
    photoSelectInitial: "Photo Initiale / Référence",
    photoSelectRecent: "Photo Récente / Comparée",
    photoWeightDiff: "Écart de Poids",
    photoDaysApart: "Jours d'intervalle",

    calorieTitle: "Calculateur de Calories & Scanner d'Assiette",
    calorieSubtitle: "Analyse instantanée des macronutriments par photo ou recherche",
    calorieScanPlate: "Scanner un plat par Photo",
    calorieSearchFood: "Rechercher un aliment",
    calorieTodayConsumed: "Calories Consommées",
    calorieTarget: "Objectif Journalier",
    calorieBurned: "Dépensées (Activité)",
    calorieRemaining: "Solde Restant",
    macronutrients: "Répartition des Macronutriments",
    proteins: "Protéines",
    carbs: "Glucides",
    fats: "Lipides",
    fiber: "Fibres",
    addCustomMeal: "Ajouter au journal",
    scanningFoodText: "Analyse IA de l'assiette en cours...",
    scanPlateResult: "Plat identifié avec succès",

    nutritionAdviceTitle: "Conseils Nutritionnels Personnalisés",
    nutritionAdviceSubtitle: "Recommandations générées sur mesure d'après vos saisies du jour",
    personalizedForYou: "Pour vous aujourd'hui",
    tipHydration: "Hydratation Optimale",
    tipProteins: "Apport en Protéines",
    tipDeficit: "Gestion du Déficit",
    tipRecovery: "Énergie & Sommeil",

    watchTitle: "Synchronisation Montres Connectées",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung Health, Pixel Watch",
    watchConnect: "Connecter ma montre",
    watchConnected: "Synchronisé en temps réel",
    watchSyncNow: "Synchroniser maintenant",
    watchSteps: "Pas enregistrés",
    watchActiveBurn: "Calories actives brûlées",
    watchHeartRate: "Fréquence Cardiaque",
    watchWorkouts: "Séances d'entraînement du jour",
    watchSyncSuccess: "Données de la montre synchronisées avec succès !",

    remindersTitle: "Rappels Automatiques Intelligents",
    remindersSubtitle: "Ne ratez aucune pesée, repas ou gorgée d'eau quotidienne",
    reminderMorningWeigh: "Pesée matinale à jeun",
    reminderLunchLog: "Journal du déjeuner",
    reminderDinnerLog: "Journal du dîner",
    reminderHydration: "Rappel d'hydratation (toutes les 2h)",
    reminderWeeklyPhoto: "Photo hebdomadaire (Dimanche)",
    enableNotifications: "Activer les notifications du navigateur",
    testNotification: "Envoyer une alerte test",
    notificationSent: "Alerte de rappel envoyée !",

    genderTitle: "Style & Identité Visuelle",
    genderFemale: "Féminin (Rose Gold & Velours Néon)",
    genderMale: "Masculin (Cyber Titane & Émeraude)",
    genderNeutral: "Neutre (Améthyste Sombre & Or)",
    themePreview: "Thème d'interface adapté en temps réel à vos interactions",

    paymentModalTitle: "Abonnement AuraSlim VIP Pro",
    paymentPlanPro: "Accès Illimité & Sécurisé",
    paymentPrice: "9,99 €",
    paymentPerMonth: "/ mois (sans engagement)",
    payCardVisa: "Carte Bancaire (Visa, Mastercard, Amex)",
    payApplePay: "Apple Pay (1 Clic)",
    paySepa: "Virement Bancaire SEPA",
    cardNumber: "Numéro de carte Visa / CB",
    cardExpiry: "MM / AA",
    cardCvc: "CVC",
    cardName: "Nom sur la carte",
    paySubmit: "Payer en toute sécurité (Stripe)",
    pciComplianceBadge: "Conforme PCI-DSS Niveau 1 & Cryptage 256-bit",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "Paiement réussi ! Vous bénéficiez désormais de l'accès VIP Pro.",

    adminTitle: "Tableau de Bord Financier & Sécurité ML",
    adminSubtitle: "Revenus Stripe en direct, dépenses opérationnelles & alertes anti-fraude",
    adminTotalRevenue: "Revenus Totaux Cumulés",
    adminMrr: "Revenu Récurrent Mensuel (MRR)",
    adminStripeBalance: "Solde Stripe à Transférer",
    adminExpenses: "Dépenses Opérationnelles",
    adminRecentTransactions: "Transactions Récentes Stripe",
    adminFraudDetection: "Détection des Fraudes par Apprentissage Automatique",
    adminRiskScore: "Score de Risque ML",
    adminAnomalyAlert: "Alerte d'Anomalie Financière Détectée",
    adminTakeAction: "Action de Protection",
    adminPayoutNotice: "Les fonds sont virés automatiquement sur votre compte Stripe connecté."
  },
  en: {
    navReports:'Report & Summary',reportOverview:'Review your measurements, BMI and logged meals in your personal report.',accountLanguageTitle:'Language',accountLanguageDesc:'Choose your app language.',ambitionTitle:'My ambition for 4 weeks',chooseGoal:'Choose a goal',personalGoalLabel:'The weight you would like to reach',
    appName: "AuraSlim Pro",
    tagline: "Ultra-Personalized Weight Loss & Body Morphing",
    navProgress: "Progress",
    navNutrition: "Nutrition & Calories",
    navHydration: "Hydration",
    navPhotos: "Weekly Photos",
    navInBody: "InBody & Analysis",
    navWatch: "Smartwatch",
    navReminders: "Reminders",
    navAccount: "My Account",
    navAdminFinances: "Finances & Security",
    helloPrefix: "Hello :",
    dailyMotivationLabel: "Daily Motivation :",
    goalChoiceLabel: "Your Goal :",
    goalLose: "Lose weight",
    goalGain: "Gain weight",
    goalMaintain: "Weight stabilization",

    patternLockTitle: "Biometric & Pattern Security",
    patternLockSubtitle: "Connect dots to unlock your encrypted session",
    patternSetTitle: "Create your graphical password",
    patternSetInstructions: "Draw a pattern connecting at least 4 dots to secure your records",
    patternConfirmInstructions: "Draw the pattern again to confirm",
    patternMismatch: "Pattern did not match. Please try again.",
    patternSaved: "Graphical password saved and encrypted!",
    patternUnlockPrompt: "Draw your pattern to unlock your fitness profile",
    patternErrorAttempts: "Incorrect pattern. Remaining attempts: ",
    patternBiometricBtn: "Fast Biometric Unlock",
    patternClear: "Clear",
    patternReset: "Reset",
    lockNow: "Lock Session",
    encryptedVault: "End-to-End Encrypted Vault (AES-256)",
    encryptedNotice: "Your body metrics and progress photos are encrypted locally and never shared.",

    weightCurrent: "Current Weight",
    weightStart: "Starting Weight",
    weightTarget: "Target Weight",
    weightLost: "Weight Lost",
    weightRemaining: "Remaining",
    bmiLabel: "Body Mass Index (BMI)",
    bmiCategory: "Category",
    logWeightBtn: "Log Weight",
    weightHistory: "Weigh-in History",
    weightTrendAnalysis: "Predictive Weight Trend",
    projectedWeight4w: "Projected Weight (4 wks)",
    projectedWeightSubtitle: "Linear regression projection",
    weeklyTrendRate: "Weekly Pace",
    projectedGoalDate: "Estimated goal reached on",
    projectedBadge: "+4 wks Projection",
    bodyFatLabel: "Body Fat (%)",
    waistLabel: "Waist (cm)",
    waterIntakeLabel: "Water Logged (L)",
    moodLabel: "Daily Mood",
    saveEntry: "Save Entry",
    congratsMilestone: "Congratulations! Milestone reached 🎉",

    freePlanBadge: "Free Tier (Essential)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "Upgrade to Pro",
    proFeaturesTitle: "Elevate your fitness journey",
    freeLimitReachedPhotos: "In free mode, only 1 progress photo after the initial photo is allowed. Unlock full timeline with Pro!",
    freeLimitReachedCalories: "You've used your 1 free photo calorie scan. Unlock unlimited AI food scanning with Pro!",
    proUnlimitedCloud: "Encrypted cloud sync, unlimited photo gallery, AI plate scanner and advanced reports.",

    photoWeeklyTitle: "Weekly Morphological Tracking",
    photoWeeklySubtitle: "Compare your visual transformation week after week",
    photoTakeBtn: "Add Weekly Check-in Photo",
    photoAngleFront: "Front",
    photoAngleSide: "Side",
    photoAngleBack: "Back",
    photoCompareMode: "Comparison Mode",
    photoBeforeAfterSlider: "Before / After Slider",
    photoSideBySide: "Side by Side",
    photoGhostOverlay: "Ghost Silhouette Overlay",
    photoInitialLabel: "Initial (W0)",
    photoWeekLabel: "Week",
    photoDragSliderHint: "Drag horizontal slider to unveil your physical transformation",
    photoSelectInitial: "Initial / Reference Photo",
    photoSelectRecent: "Recent / Comparison Photo",
    photoWeightDiff: "Weight Change",
    photoDaysApart: "Days Apart",

    calorieTitle: "Calorie Calculator & Meal Scanner",
    calorieSubtitle: "Instant macronutrient estimation via photo or manual search",
    calorieScanPlate: "Scan Dish with Camera",
    calorieSearchFood: "Search food database",
    calorieTodayConsumed: "Consumed Today",
    calorieTarget: "Daily Calorie Budget",
    calorieBurned: "Burned (Activity)",
    calorieRemaining: "Net Remaining",
    macronutrients: "Macronutrient Breakdown",
    proteins: "Proteins",
    carbs: "Carbs",
    fats: "Fats",
    fiber: "Fiber",
    addCustomMeal: "Log to Diary",
    scanningFoodText: "AI identifying ingredients & calories...",
    scanPlateResult: "Dish identified successfully",

    nutritionAdviceTitle: "Personalized Daily Nutrition Advice",
    nutritionAdviceSubtitle: "Tailored insights computed from your daily meal logs and activity",
    personalizedForYou: "Recommended for you today",
    tipHydration: "Optimal Hydration",
    tipProteins: "Protein Synthesis",
    tipDeficit: "Caloric Deficit Control",
    tipRecovery: "Sleep & Muscle Repair",

    watchTitle: "Smartwatch Synchronization",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung Health, Pixel Watch",
    watchConnect: "Pair Watch",
    watchConnected: "Connected & Live Synced",
    watchSyncNow: "Sync Now",
    watchSteps: "Steps Count",
    watchActiveBurn: "Active Burn Calories",
    watchHeartRate: "Heart Rate",
    watchWorkouts: "Today's Workouts",
    watchSyncSuccess: "Smartwatch data synced successfully!",

    remindersTitle: "Smart Automated Reminders",
    remindersSubtitle: "Never miss a weigh-in, meal log, or hydration check",
    reminderMorningWeigh: "Fasting morning weigh-in",
    reminderLunchLog: "Lunch logging reminder",
    reminderDinnerLog: "Dinner logging reminder",
    reminderHydration: "Hydration ping (every 2h)",
    reminderWeeklyPhoto: "Weekly check-in photo (Sunday)",
    enableNotifications: "Enable Browser Notifications",
    testNotification: "Send Test Alert",
    notificationSent: "Reminder alert dispatched!",

    genderTitle: "Adaptive Visual Styling",
    genderFemale: "Feminine (Rose Gold & Neon Velvet)",
    genderMale: "Masculine (Cyber Titanium & Emerald)",
    genderNeutral: "Neutral (Deep Amethyst & Gold)",
    themePreview: "Dynamic palettes evolving in real-time according to your interactions",

    paymentModalTitle: "AuraSlim VIP Pro Membership",
    paymentPlanPro: "Full Unlimited Access",
    paymentPrice: "$9.99",
    paymentPerMonth: "/ month (cancel anytime)",
    payCardVisa: "Credit Card (Visa, Mastercard, Amex)",
    payApplePay: "Apple Pay (1-Tap)",
    paySepa: "Bank Wire Transfer (SEPA)",
    cardNumber: "Card Number",
    cardExpiry: "MM / YY",
    cardCvc: "CVC",
    cardName: "Name on Card",
    paySubmit: "Pay Securely with Stripe",
    pciComplianceBadge: "PCI-DSS Level 1 Certified & 256-bit Encryption",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "Payment successful! You are now an active VIP Pro member.",

    adminTitle: "Financial Analytics & ML Security",
    adminSubtitle: "Live Stripe revenue, operating overhead & automated fraud shields",
    adminTotalRevenue: "Total Revenue Generated",
    adminMrr: "Monthly Recurring Revenue (MRR)",
    adminStripeBalance: "Stripe Balance (Payouts Ready)",
    adminExpenses: "Operating Expenses",
    adminRecentTransactions: "Recent Stripe Transactions",
    adminFraudDetection: "Machine Learning Anomaly & Fraud Engine",
    adminRiskScore: "ML Risk Score",
    adminAnomalyAlert: "Suspicious Activity Anomaly Detected",
    adminTakeAction: "Defensive Action",
    adminPayoutNotice: "Funds are deposited automatically into your configured Stripe payout account."
  },
  es: {
    appName: "AuraSlim Pro",
    tagline: "Pérdida de peso ultra personalizada y morfología",
    navProgress: "Progreso",
    navNutrition: "Nutrición y Calorías",
    navPhotos: "Fotos Semanales",
    navWatch: "Smartwatch",
    navReminders: "Recordatorios",
    navAccount: "Mi Cuenta",
    navAdminFinances: "Finanzas y Seguridad",

    patternLockTitle: "Seguridad y Patrón Gráfico",
    patternLockSubtitle: "Une los puntos para desbloquear tu sesión cifrada",
    patternSetTitle: "Crea tu patrón gráfico",
    patternSetInstructions: "Dibuja un patrón de al menos 4 puntos para proteger tus datos",
    patternConfirmInstructions: "Vuelve a dibujar el patrón para confirmar",
    patternMismatch: "El patrón no coincide. Inténtalo de nuevo.",
    patternSaved: "¡Patrón gráfico guardado y cifrado con éxito!",
    patternUnlockPrompt: "Dibuja tu patrón para desbloquear tu perfil",
    patternErrorAttempts: "Patrón incorrecto. Intentos restantes: ",
    patternBiometricBtn: "Desbloqueo Biométrico Rápido",
    patternClear: "Borrar",
    patternReset: "Reiniciar",
    lockNow: "Bloquear sesión",
    encryptedVault: "Bóveda cifrada de extremo a extremo (AES-256)",
    encryptedNotice: "Tus datos corporales y fotos están cifrados localmente de forma privada.",

    weightCurrent: "Peso Actual",
    weightStart: "Peso Inicial",
    weightTarget: "Peso Objetivo",
    weightLost: "Peso Perdido",
    weightRemaining: "Restante",
    bmiLabel: "Índice de Masa Corporal (IMC)",
    bmiCategory: "Categoría",
    logWeightBtn: "Registrar Peso",
    weightHistory: "Historial de Pesajes",
    weightTrendAnalysis: "Análisis Predictivo de Pérdida",
    bodyFatLabel: "Grasa Corporal (%)",
    waistLabel: "Cintura (cm)",
    waterIntakeLabel: "Agua (L)",
    moodLabel: "Estado de ánimo",
    saveEntry: "Guardar Entrada",
    congratsMilestone: "¡Felicidades! Nuevo objetivo alcanzado 🎉",

    freePlanBadge: "Modo Gratuito (Básico)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "Actualizar a Pro",
    proFeaturesTitle: "Lleva tu progreso al máximo",
    freeLimitReachedPhotos: "En modo gratuito, solo se permite 1 foto después de la inicial. ¡Desbloquea el historial con Pro!",
    freeLimitReachedCalories: "Has utilizado tu cálculo gratuito por imagen. ¡Desbloquea escaneos ilimitados con Pro!",
    proUnlimitedCloud: "Sincronización en la nube, fotos ilimitadas, escáner IA y reportes avanzados.",

    photoWeeklyTitle: "Seguimiento Morfológico Semanal",
    photoWeeklySubtitle: "Compara tu transformación física semana a semana",
    photoTakeBtn: "Añadir foto semanal",
    photoAngleFront: "Frente",
    photoAngleSide: "Perfil",
    photoAngleBack: "Espalda",
    photoCompareMode: "Modo Comparativa",
    photoBeforeAfterSlider: "Deslizador Antes / Después",
    photoGhostOverlay: "Superposición Fantasma",
    photoInitialLabel: "Inicial (S0)",
    photoWeekLabel: "Semana",
    photoDragSliderHint: "Desliza para ver la transformación física",

    calorieTitle: "Calculadora de Calorías y Escáner de Platos",
    calorieSubtitle: "Análisis instantáneo de macronutrientes por foto",
    calorieScanPlate: "Escanear plato con foto",
    calorieSearchFood: "Buscar alimento",
    calorieTodayConsumed: "Consumidas Hoy",
    calorieTarget: "Objetivo Diario",
    calorieBurned: "Quemadas (Actividad)",
    calorieRemaining: "Restantes",
    macronutrients: "Macronutrientes",
    proteins: "Proteínas",
    carbs: "Carbohidratos",
    fats: "Grasas",
    fiber: "Fibra",
    addCustomMeal: "Añadir al diario",
    scanningFoodText: "IA analizando plato e ingredientes...",
    scanPlateResult: "Plato analizado con éxito",

    nutritionAdviceTitle: "Consejos Nutricionales Personalizados",
    nutritionAdviceSubtitle: "Recomendaciones basadas en tus registros de hoy",
    personalizedForYou: "Para ti hoy",
    tipHydration: "Hidratación",
    tipProteins: "Proteína",
    tipDeficit: "Control de Déficit",
    tipRecovery: "Recuperación",

    watchTitle: "Sincronización con Smartwatch",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung, Pixel",
    watchConnect: "Vincular Reloj",
    watchConnected: "Sincronizado en tiempo real",
    watchSyncNow: "Sincronizar ahora",
    watchSteps: "Pasos registrados",
    watchActiveBurn: "Calorías activas",
    watchHeartRate: "Frecuencia Cardíaca",
    watchWorkouts: "Entrenamientos del día",
    watchSyncSuccess: "¡Datos del smartwatch sincronizados!",

    remindersTitle: "Recordatorios Automáticos",
    remindersSubtitle: "No olvides ningún pesaje, comida o vaso de agua",
    reminderMorningWeigh: "Pesaje matutino en ayunas",
    reminderLunchLog: "Registro del almuerzo",
    reminderDinnerLog: "Registro de la cena",
    reminderHydration: "Recordatorio de agua (cada 2h)",
    reminderWeeklyPhoto: "Foto semanal (Domingo)",
    enableNotifications: "Activar notificaciones del navegador",
    testNotification: "Enviar alerta de prueba",
    notificationSent: "¡Alerta enviada con éxito!",

    genderTitle: "Diseño y Estilo Visual Adaptativo",
    genderFemale: "Femenino (Oro Rosa y Terciopelo Neón)",
    genderMale: "Masculino (Cíber Titanio y Esmeralda)",
    genderNeutral: "Neutro (Amatista Profundo y Oro)",
    themePreview: "Paleta dinámica ajustada a tu comportamiento",

    paymentModalTitle: "Suscripción AuraSlim VIP Pro",
    paymentPlanPro: "Acceso Total e Ilimitado",
    paymentPrice: "9,99 €",
    paymentPerMonth: "/ mes (cancela cuando quieras)",
    payCardVisa: "Tarjeta de Crédito (Visa, Mastercard)",
    payApplePay: "Apple Pay (1 Clic)",
    paySepa: "Transferencia Bancaria SEPA",
    cardNumber: "Número de Tarjeta",
    cardExpiry: "MM / AA",
    cardCvc: "CVC",
    cardName: "Nombre en la tarjeta",
    paySubmit: "Pagar de forma segura (Stripe)",
    pciComplianceBadge: "Certificado PCI-DSS Nivel 1 y Cifrado 256-bit",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "¡Pago completado! Ya disfrutas de todas las ventajas VIP Pro.",

    adminTitle: "Panel Financiero y Seguridad ML",
    adminSubtitle: "Ingresos Stripe en directo, costes y escudo anti-fraude",
    adminTotalRevenue: "Ingresos Totales",
    adminMrr: "Ingresos Recurrentes (MRR)",
    adminStripeBalance: "Saldo Stripe Disponible",
    adminExpenses: "Gastos Operativos",
    adminRecentTransactions: "Transacciones Recientes",
    adminFraudDetection: "Detección de Fraude por Inteligencia Artificial",
    adminRiskScore: "Puntuación de Riesgo ML",
    adminAnomalyAlert: "Alerta de Anomalía Detectada",
    adminTakeAction: "Acción Defensiva",
    adminPayoutNotice: "Los fondos se envían a tu cuenta Stripe conectada."
  },
  de: {
    appName: "AuraSlim Pro",
    tagline: "Ultra-personalisierter Gewichtsverlust & Körperformung",
    navProgress: "Fortschritt",
    navNutrition: "Ernährung & Kalorien",
    navPhotos: "Wöchentliche Fotos",
    navWatch: "Smartwatch",
    navReminders: "Erinnerungen",
    navAccount: "Mein Konto",
    navAdminFinances: "Finanzen & Sicherheit",

    patternLockTitle: "Biometrische & Muster-Sicherheit",
    patternLockSubtitle: "Punkte verbinden, um Ihre verschlüsselte Sitzung zu öffnen",
    patternSetTitle: "Grafisches Passwort erstellen",
    patternSetInstructions: "Mindestens 4 Punkte verbinden, um Ihre Daten zu sichern",
    patternConfirmInstructions: "Muster zur Bestätigung wiederholen",
    patternMismatch: "Muster stimmt nicht überein. Bitte erneut versuchen.",
    patternSaved: "Grafisches Passwort verschlüsselt gespeichert!",
    patternUnlockPrompt: "Zeichnen Sie Ihr Muster, um auf Ihr Profil zuzugreifen",
    patternErrorAttempts: "Falsches Muster. Verbleibende Versuche: ",
    patternBiometricBtn: "Schnelle biometrische Entsperrung",
    patternClear: "Löschen",
    patternReset: "Zurücksetzen",
    lockNow: "Sitzung sperren",
    encryptedVault: "Ende-zu-Ende verschlüsselter Safe (AES-256)",
    encryptedNotice: "Ihre Körperdaten und Fotos sind lokal verschlüsselt und sicher.",

    weightCurrent: "Aktuelles Gewicht",
    weightStart: "Startgewicht",
    weightTarget: "Zielgewicht",
    weightLost: "Verloren",
    weightRemaining: "Verbleibend",
    bmiLabel: "Body-Mass-Index (BMI)",
    bmiCategory: "Kategorie",
    logWeightBtn: "Gewicht eintragen",
    weightHistory: "Wiege-Historie",
    weightTrendAnalysis: "Prädiktive Trendanalyse",
    bodyFatLabel: "Körperfett (%)",
    waistLabel: "Taille (cm)",
    waterIntakeLabel: "Wasser (L)",
    moodLabel: "Tagesstimmung",
    saveEntry: "Speichern",
    congratsMilestone: "Glückwunsch! Meilenstein erreicht 🎉",

    freePlanBadge: "Kostenlos (Basis)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "Auf Pro upgraden",
    proFeaturesTitle: "Volles Potenzial freischalten",
    freeLimitReachedPhotos: "Im Gratis-Modus ist nur 1 Foto nach dem Startfoto erlaubt. Holen Sie sich Pro für die Galerie!",
    freeLimitReachedCalories: "Sie haben Ihren kostenlosen Foto-Kalorienscan verbraucht. Pro für unbegrenzte Scans!",
    proUnlimitedCloud: "Verschlüsselter Cloud-Speicher, unbegrenzte Fotos, KI-Scanner & Berichte.",

    photoWeeklyTitle: "Wöchentlicher Morphologie-Vergleich",
    photoWeeklySubtitle: "Sehen Sie Ihre sichtbare Transformation von Woche zu Woche",
    photoTakeBtn: "Wöchentliches Foto hinzufügen",
    photoAngleFront: "Vorne",
    photoAngleSide: "Seite",
    photoAngleBack: "Rücken",
    photoCompareMode: "Vergleichsmodus",
    photoBeforeAfterSlider: "Vorher / Nachher Regler",
    photoGhostOverlay: "Geister-Überlagerung",
    photoInitialLabel: "Start (W0)",
    photoWeekLabel: "Woche",
    photoDragSliderHint: "Schieben Sie den Regler, um die Veränderung zu sehen",

    calorieTitle: "Kalorienrechner & Teller-Scanner",
    calorieSubtitle: "Sofortige Makronährstoff-Analyse per Foto oder Suche",
    calorieScanPlate: "Teller per Foto scannen",
    calorieSearchFood: "Lebensmittel suchen",
    calorieTodayConsumed: "Heute verzehrt",
    calorieTarget: "Tagesziel",
    calorieBurned: "Verbrannt (Aktivität)",
    calorieRemaining: "Verbleibend",
    macronutrients: "Makronährstoffe",
    proteins: "Proteine",
    carbs: "Kohlenhydrate",
    fats: "Fette",
    fiber: "Ballaststoffe",
    addCustomMeal: "Ins Tagebuch eintragen",
    scanningFoodText: "KI analysiert Mahlzeit & Kalorien...",
    scanPlateResult: "Gericht erfolgreich erkannt",

    nutritionAdviceTitle: "Personalisierte Ernährungstipps",
    nutritionAdviceSubtitle: "Täglich maßgeschneidert auf Ihre Einträge",
    personalizedForYou: "Heute für Sie empfohlen",
    tipHydration: "Optimale Hydratation",
    tipProteins: "Proteinaufnahme",
    tipDeficit: "Kaloriendefizit",
    tipRecovery: "Erholung & Schlaf",

    watchTitle: "Smartwatch-Synchronisation",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung Health, Pixel",
    watchConnect: "Smartwatch koppeln",
    watchConnected: "In Echtzeit synchronisiert",
    watchSyncNow: "Jetzt synchronisieren",
    watchSteps: "Gemessene Schritte",
    watchActiveBurn: "Aktivkalorien",
    watchHeartRate: "Herzfrequenz",
    watchWorkouts: "Heutige Workouts",
    watchSyncSuccess: "Smartwatch-Daten erfolgreich synchronisiert!",

    remindersTitle: "Automatische Erinnerungen",
    remindersSubtitle: "Verpassen Sie kein Wiegen, Essen oder Trinken",
    reminderMorningWeigh: "Morgendliches Wiegen",
    reminderLunchLog: "Mittagessen eintragen",
    reminderDinnerLog: "Abendessen eintragen",
    reminderHydration: "Wasser trinken (alle 2 Std)",
    reminderWeeklyPhoto: "Wöchentliches Foto (Sonntag)",
    enableNotifications: "Browser-Benachrichtigungen aktivieren",
    testNotification: "Testalarm senden",
    notificationSent: "Erinnerung erfolgreich gesendet!",

    genderTitle: "Adaptiver Designstil",
    genderFemale: "Feminin (Roségold & Neon-Samt)",
    genderMale: "Maskulin (Cyber-Titan & Smaragd)",
    genderNeutral: "Neutral (Tiefes Amethyst & Gold)",
    themePreview: "Dynamische Farbpalette passt sich an Ihre Interaktionen an",

    paymentModalTitle: "AuraSlim VIP Pro Mitgliedschaft",
    paymentPlanPro: "Unbegrenzter Vollzugriff",
    paymentPrice: "9,99 €",
    paymentPerMonth: "/ Monat (jederzeit kündbar)",
    payCardVisa: "Kreditkarte (Visa, Mastercard)",
    payApplePay: "Apple Pay (1 Klick)",
    paySepa: "SEPA-Banküberweisung",
    cardNumber: "Kartennummer",
    cardExpiry: "MM / JJ",
    cardCvc: "CVC",
    cardName: "Karteninhaber",
    paySubmit: "Sicher mit Stripe bezahlen",
    pciComplianceBadge: "PCI-DSS Level 1 zertifiziert & 256-Bit Verschlüsselung",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "Zahlung erfolgreich! Sie haben jetzt vollen VIP Pro Zugriff.",

    adminTitle: "Finanz-Dashboard & ML-Sicherheit",
    adminSubtitle: "Echtzeit-Stripe-Umsätze & KI-Betrugsschutz",
    adminTotalRevenue: "Gesamterlös",
    adminMrr: "Monatlicher Umsatz (MRR)",
    adminStripeBalance: "Stripe-Auszahlungsguthaben",
    adminExpenses: "Betriebskosten",
    adminRecentTransactions: "Letzte Stripe-Transaktionen",
    adminFraudDetection: "KI-gestützte Betrugs- und Anomalieerkennung",
    adminRiskScore: "ML-Risikoscore",
    adminAnomalyAlert: "Finanzielle Anomalie entdeckt",
    adminTakeAction: "Sicherheitsaktion",
    adminPayoutNotice: "Einnahmen werden direkt auf Ihr Stripe-Konto überwiesen."
  },
  it: {
    appName: "AuraSlim Pro",
    tagline: "Perdita di peso ultra-personalizzata e morfologia",
    navProgress: "Progresso",
    navNutrition: "Nutrizione & Calorie",
    navPhotos: "Foto Settimanali",
    navWatch: "Smartwatch",
    navReminders: "Promemoria",
    navAccount: "Il Mio Account",
    navAdminFinances: "Finanze & Sicurezza",

    patternLockTitle: "Sicurezza con Segno Grafico",
    patternLockSubtitle: "Collega i punti per sbloccare la tua sessione crittografata",
    patternSetTitle: "Crea la tua password grafica",
    patternSetInstructions: "Unisci almeno 4 punti per proteggere i tuoi dati",
    patternConfirmInstructions: "Ripeti il segno per confermare",
    patternMismatch: "Il segno non corrisponde. Riprova.",
    patternSaved: "Password grafica salvata e crittografata!",
    patternUnlockPrompt: "Traccia il tuo segno segreto per accedere",
    patternErrorAttempts: "Segno errato. Tentativi rimasti: ",
    patternBiometricBtn: "Sblocco Biometrico Rapido",
    patternClear: "Cancella",
    patternReset: "Reimposta",
    lockNow: "Blocca sessione",
    encryptedVault: "Caveau crittografato end-to-end (AES-256)",
    encryptedNotice: "I tuoi dati corporei e le foto sono protetti e crittografati.",

    weightCurrent: "Peso Attuale",
    weightStart: "Peso Iniziale",
    weightTarget: "Obiettivo",
    weightLost: "Perso",
    weightRemaining: "Rimanente",
    bmiLabel: "Indice di Massa Corporea (IMC)",
    bmiCategory: "Categoria",
    logWeightBtn: "Registra Peso",
    weightHistory: "Cronologia Pesate",
    weightTrendAnalysis: "Analisi Predittiva",
    bodyFatLabel: "Massa Grassa (%)",
    waistLabel: "Girovita (cm)",
    waterIntakeLabel: "Acqua (L)",
    moodLabel: "Umore",
    saveEntry: "Salva",
    congratsMilestone: "Complimenti! Nuovo traguardo raggiunto 🎉",

    freePlanBadge: "Modalità Gratuita (Base)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "Passa a Pro",
    proFeaturesTitle: "Massimizza i tuoi risultati",
    freeLimitReachedPhotos: "In modalità gratuita è consentita solo 1 foto dopo quella iniziale. Passa a Pro per la galleria completa!",
    freeLimitReachedCalories: "Hai usato la tua scansione calorica gratuita. Passa a Pro per scansioni illimitate!",
    proUnlimitedCloud: "Cloud crittografato, foto illimitate, scanner IA e report avanzati.",

    photoWeeklyTitle: "Monitoraggio Morfologico Settimanale",
    photoWeeklySubtitle: "Confronta la tua trasformazione visiva settimana dopo settimana",
    photoTakeBtn: "Aggiungi foto settimanale",
    photoAngleFront: "Fronte",
    photoAngleSide: "Profilo",
    photoAngleBack: "Dietro",
    photoCompareMode: "Modalità Confronto",
    photoBeforeAfterSlider: "Cursore Prima / Dopo",
    photoGhostOverlay: "Sovrapposizione Fantasma",
    photoInitialLabel: "Iniziale (S0)",
    photoWeekLabel: "Settimana",
    photoDragSliderHint: "Trascina il cursore per visualizzare la trasformazione",

    calorieTitle: "Calcolatore Calorie & Scanner Piatto",
    calorieSubtitle: "Stima istantanea dei macronutrienti tramite foto",
    calorieScanPlate: "Scansiona piatto con fotocamera",
    calorieSearchFood: "Cerca alimento",
    calorieTodayConsumed: "Consumate Oggi",
    calorieTarget: "Obiettivo Giornaliero",
    calorieBurned: "Bruciate (Attività)",
    calorieRemaining: "Rimanenti",
    macronutrients: "Macronutrienti",
    proteins: "Proteine",
    carbs: "Carboidrati",
    fats: "Grassi",
    fiber: "Fibre",
    addCustomMeal: "Aggiungi al diario",
    scanningFoodText: "L'IA sta analizzando piatto e calorie...",
    scanPlateResult: "Piatto riconosciuto con successo",

    nutritionAdviceTitle: "Consigli Nutrizionali Personalizzati",
    nutritionAdviceSubtitle: "Generati su misura in base alle tue registrazioni odierne",
    personalizedForYou: "Per te oggi",
    tipHydration: "Idratazione",
    tipProteins: "Proteine",
    tipDeficit: "Controllo Calorie",
    tipRecovery: "Recupero",

    watchTitle: "Sincronizzazione Smartwatch",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung Health, Pixel",
    watchConnect: "Collega Orologio",
    watchConnected: "Sincronizzato in tempo reale",
    watchSyncNow: "Sincronizza ora",
    watchSteps: "Passi",
    watchActiveBurn: "Calorie attive",
    watchHeartRate: "Frequenza cardiaca",
    watchWorkouts: "Allenamenti del giorno",
    watchSyncSuccess: "Dati smartwatch sincronizzati con successo!",

    remindersTitle: "Promemoria Automatici",
    remindersSubtitle: "Non dimenticare pesate, pasti o idratazione",
    reminderMorningWeigh: "Pesata mattutina a digiuno",
    reminderLunchLog: "Registra pranzo",
    reminderDinnerLog: "Registra cena",
    reminderHydration: "Bevi acqua (ogni 2h)",
    reminderWeeklyPhoto: "Foto settimanale (Domenica)",
    enableNotifications: "Attiva notifiche del browser",
    testNotification: "Invia notifica di prova",
    notificationSent: "Promemoria inviato!",

    genderTitle: "Stile Visivo Adattivo",
    genderFemale: "Femminile (Oro Rosa & Velluto Neon)",
    genderMale: "Maschile (Cyber Titanio & Smeraldo)",
    genderNeutral: "Neutro (Ametista Profondo & Oro)",
    themePreview: "Palette dinamica in evoluzione continua",

    paymentModalTitle: "Abbonamento AuraSlim VIP Pro",
    paymentPlanPro: "Accesso Illimitato e Sicuro",
    paymentPrice: "9,99 €",
    paymentPerMonth: "/ mese (senza vincoli)",
    payCardVisa: "Carta di Credito (Visa, Mastercard)",
    payApplePay: "Apple Pay (1 Clic)",
    paySepa: "Bonifico Bancario SEPA",
    cardNumber: "Numero Carta",
    cardExpiry: "MM / AA",
    cardCvc: "CVC",
    cardName: "Intestatario",
    paySubmit: "Paga in sicurezza (Stripe)",
    pciComplianceBadge: "Certificato PCI-DSS Livello 1 e Crittografia 256-bit",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "Pagamento completato con successo! Benvenuto in VIP Pro.",

    adminTitle: "Dashboard Finanziaria & Sicurezza ML",
    adminSubtitle: "Ricavi Stripe in tempo reale e monitoraggio frodi",
    adminTotalRevenue: "Ricavi Totali",
    adminMrr: "Ricavo Ricorrente Mensile (MRR)",
    adminStripeBalance: "Saldo Stripe Disponibile",
    adminExpenses: "Spese Operative",
    adminRecentTransactions: "Transazioni Recenti",
    adminFraudDetection: "Rilevamento Frodi con Intelligenza Artificiale",
    adminRiskScore: "Punteggio di Rischio ML",
    adminAnomalyAlert: "Anomalia Finanziaria Rilevata",
    adminTakeAction: "Azione Protettiva",
    adminPayoutNotice: "I fondi vengono trasferiti automaticamente sul conto Stripe."
  },
  pt: {
    appName: "AuraSlim Pro",
    tagline: "Perda de peso ultra personalizada e morfologia",
    navProgress: "Progresso",
    navNutrition: "Nutrição e Calorias",
    navPhotos: "Fotos Semanais",
    navWatch: "Smartwatch",
    navReminders: "Lembretes",
    navAccount: "Minha Conta",
    navAdminFinances: "Finanças e Segurança",

    patternLockTitle: "Segurança por Padrão Gráfico",
    patternLockSubtitle: "Ligue os pontos para desbloquear sua sessão encriptada",
    patternSetTitle: "Criar senha gráfica",
    patternSetInstructions: "Conecte pelo menos 4 pontos para proteger seus dados",
    patternConfirmInstructions: "Repita o padrão para confirmar",
    patternMismatch: "O padrão não coincide. Tente novamente.",
    patternSaved: "Senha gráfica guardada e encriptada!",
    patternUnlockPrompt: "Desenhe seu padrão para entrar",
    patternErrorAttempts: "Padrão incorreto. Tentativas restantes: ",
    patternBiometricBtn: "Desbloqueio Biométrico Rápido",
    patternClear: "Limpar",
    patternReset: "Redefinir",
    lockNow: "Bloquear sessão",
    encryptedVault: "Cofre encriptado ponta a ponta (AES-256)",
    encryptedNotice: "Seus dados corporais e fotos estão protegidos localmente.",

    weightCurrent: "Peso Atual",
    weightStart: "Peso Inicial",
    weightTarget: "Meta de Peso",
    weightLost: "Peso Perdido",
    weightRemaining: "Restante",
    bmiLabel: "Índice de Massa Corporal (IMC)",
    bmiCategory: "Categoria",
    logWeightBtn: "Registar Peso",
    weightHistory: "Histórico de Pesagens",
    weightTrendAnalysis: "Análise Preditiva",
    bodyFatLabel: "Gordura Corporal (%)",
    waistLabel: "Cintura (cm)",
    waterIntakeLabel: "Água (L)",
    moodLabel: "Humor do dia",
    saveEntry: "Guardar",
    congratsMilestone: "Parabéns! Novo marco alcançado 🎉",

    freePlanBadge: "Modo Grátis (Básico)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "Fazer Upgrade para Pro",
    proFeaturesTitle: "Evolua ao máximo",
    freeLimitReachedPhotos: "No modo gratuito, apenas 1 foto após a inicial é permitida. Desbloqueie com Pro!",
    freeLimitReachedCalories: "Você utilizou o cálculo de calorias grátis por foto. Desbloqueie ilimitado com Pro!",
    proUnlimitedCloud: "Nuvem encriptada, fotos ilimitadas, scanner IA e relatórios avançados.",

    photoWeeklyTitle: "Acompanhamento Morfológico Semanal",
    photoWeeklySubtitle: "Veja a transformação do seu corpo semana a semana",
    photoTakeBtn: "Adicionar foto da semana",
    photoAngleFront: "Frente",
    photoAngleSide: "Perfil",
    photoAngleBack: "Costas",
    photoCompareMode: "Modo de Comparação",
    photoBeforeAfterSlider: "Controle Antes / Depois",
    photoGhostOverlay: "Sobreposição Fantasma",
    photoInitialLabel: "Inicial (S0)",
    photoWeekLabel: "Semana",
    photoDragSliderHint: "Arraste o cursor para comparar o progresso",

    calorieTitle: "Calculadora de Calorias & Scanner de Pratos",
    calorieSubtitle: "Análise imediata de macronutrientes por imagem",
    calorieScanPlate: "Escanear prato com foto",
    calorieSearchFood: "Pesquisar alimento",
    calorieTodayConsumed: "Consumidas Hoje",
    calorieTarget: "Meta Diária",
    calorieBurned: "Queimadas (Atividade)",
    calorieRemaining: "Restantes",
    macronutrients: "Macronutrientes",
    proteins: "Proteínas",
    carbs: "Carboidratos",
    fats: "Gorduras",
    fiber: "Fibras",
    addCustomMeal: "Adicionar ao diário",
    scanningFoodText: "IA analisando refeição e calorias...",
    scanPlateResult: "Prato reconhecido com sucesso",

    nutritionAdviceTitle: "Conselhos Nutricionais Personalizados",
    nutritionAdviceSubtitle: "Dicas geradas de acordo com as entradas de hoje",
    personalizedForYou: "Para você hoje",
    tipHydration: "Hidratação Ideal",
    tipProteins: "Ingestão de Proteínas",
    tipDeficit: "Controle de Déficit",
    tipRecovery: "Sono e Recuperação",

    watchTitle: "Sincronização com Smartwatch",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung Health, Pixel",
    watchConnect: "Ligar Relógio",
    watchConnected: "Sincronizado em tempo real",
    watchSyncNow: "Sincronizar agora",
    watchSteps: "Passos registados",
    watchActiveBurn: "Calorias ativas",
    watchHeartRate: "Frequência Cardíaca",
    watchWorkouts: "Treinos de hoje",
    watchSyncSuccess: "Dados do smartwatch sincronizados!",

    remindersTitle: "Lembretes Automáticos",
    remindersSubtitle: "Nunca perca uma pesagem, refeição ou copo de água",
    reminderMorningWeigh: "Pesagem matinal em jejum",
    reminderLunchLog: "Registar almoço",
    reminderDinnerLog: "Registar jantar",
    reminderHydration: "Beber água (a cada 2h)",
    reminderWeeklyPhoto: "Foto semanal (Domingo)",
    enableNotifications: "Ativar notificações do navegador",
    testNotification: "Enviar notificação de teste",
    notificationSent: "Lembrete enviado com sucesso!",

    genderTitle: "Design Visual Adaptativo",
    genderFemale: "Feminino (Ouro Rosa e Veludo Neon)",
    genderMale: "Masculino (Cyber Titânio e Esmeralda)",
    genderNeutral: "Neutro (Ametista Cósmico e Ouro)",
    themePreview: "Paleta dinâmica adaptada ao seu perfil",

    paymentModalTitle: "Assinatura AuraSlim VIP Pro",
    paymentPlanPro: "Acesso Total e Ilimitado",
    paymentPrice: "9,99 €",
    paymentPerMonth: "/ mês (cancele quando quiser)",
    payCardVisa: "Cartão de Crédito (Visa, Mastercard)",
    payApplePay: "Apple Pay (1 Toque)",
    paySepa: "Transferência Bancária SEPA",
    cardNumber: "Número do Cartão",
    cardExpiry: "MM / AA",
    cardCvc: "CVC",
    cardName: "Nome no Cartão",
    paySubmit: "Pagar com Segurança via Stripe",
    pciComplianceBadge: "Certificação PCI-DSS Nível 1 e Criptografia 256-bit",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "Pagamento efetuado! Você agora tem acesso VIP Pro.",

    adminTitle: "Painel Financeiro & Segurança ML",
    adminSubtitle: "Receitas Stripe ao vivo e proteção contra fraude",
    adminTotalRevenue: "Receita Total Acumulada",
    adminMrr: "Receita Recorrente Mensal (MRR)",
    adminStripeBalance: "Saldo Stripe Disponível",
    adminExpenses: "Despesas Operacionais",
    adminRecentTransactions: "Transações Recentes",
    adminFraudDetection: "Detecção de Fraude por Inteligência Artificial",
    adminRiskScore: "Pontuação de Risco ML",
    adminAnomalyAlert: "Alerta de Anomalia Detectada",
    adminTakeAction: "Ação de Proteção",
    adminPayoutNotice: "Os pagamentos são enviados para sua conta bancária Stripe."
  },
  ar: {
    appName: "AuraSlim Pro",
    tagline: "متابعة خسارة الوزن الذكية والتشكيل الجسدي",
    navProgress: "التقدم والوزن",
    navNutrition: "التغذية والسعرات",
    navPhotos: "الصور الأسبوعية",
    navWatch: "الساعة الذكية",
    navReminders: "التذكيرات",
    navAccount: "حسابي",
    navAdminFinances: "المالية والأمان",

    patternLockTitle: "الأمان بالنمط الرسومي والبيومتري",
    patternLockSubtitle: "ارسم النمط لفتح جلستك المشفرة بالكامل",
    patternSetTitle: "تعيين كلمة المرور الرسومية",
    patternSetInstructions: "صل بين 4 نقاط على الأقل لحماية بياناتك الشخصية",
    patternConfirmInstructions: "أعد رسم النمط للتأكيد",
    patternMismatch: "النمط غير متطابق. يرجى المحاولة ثانية.",
    patternSaved: "تم حفظ النمط وتشفيره بأمان!",
    patternUnlockPrompt: "ارسم نمطك السري للدخول إلى ملفك",
    patternErrorAttempts: "نمط خاطئ. المحاولات المتبقية: ",
    patternBiometricBtn: "فتح سريع بالبصمة البيومترية",
    patternClear: "مسح",
    patternReset: "إعادة تعيين",
    lockNow: "قفل الجلسة فوراً",
    encryptedVault: "خزنة مشفرة من طرف إلى طرف (AES-256)",
    encryptedNotice: "بيانات جسمك وصورك مشفرة محلياً ولا يمكن لأحد الاطلاع عليها.",

    weightCurrent: "الوزن الحالي",
    weightStart: "وزن البداية",
    weightTarget: "الوزن المستهدف",
    weightLost: "الوزن المفقود",
    weightRemaining: "المتبقي للهدف",
    bmiLabel: "مؤشر كتلة الجسم (BMI)",
    bmiCategory: "التصنيف",
    logWeightBtn: "تسجيل وزن اليوم",
    weightHistory: "سجل الأوزان",
    weightTrendAnalysis: "التحليل التنبؤي للمسار",
    bodyFatLabel: "نسبة الدهون (%)",
    waistLabel: "محيط الخصر (سم)",
    waterIntakeLabel: "الماء المستهلك (لتر)",
    moodLabel: "المزاج",
    saveEntry: "حفظ البيانات",
    congratsMilestone: "تهانينا! لقد حققت إنجازاً جديداً 🎉",

    freePlanBadge: "الوضع المجاني (الأساسي)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "الترقية إلى برو",
    proFeaturesTitle: "انطلق بأقصى سرعة نحو هدفك",
    freeLimitReachedPhotos: "في الوضع المجاني، يُسمح بصورة واحدة فقط بعد الصورة الأولى. احصل على برو للوصول الكامل!",
    freeLimitReachedCalories: "لقد استهلكت مسح السعرات المجاني بالصورة. رقّ حسابك للمسح الذكي غير المحدود!",
    proUnlimitedCloud: "تخزين سحابي مشفر، صور غير محدودة، ماسح طعام بالذكاء الاصطناعي وتقارير متقدمة.",

    photoWeeklyTitle: "المتابعة المورفولوجية الأسبوعية",
    photoWeeklySubtitle: "شاهد التحول الجسدي الحقيقي أسبوعاً بعد أسبوع",
    photoTakeBtn: "إضافة صورة هذا الأسبوع",
    photoAngleFront: "أمامي",
    photoAngleSide: "جانبي",
    photoAngleBack: "خلفي",
    photoCompareMode: "وضع المقارنة",
    photoBeforeAfterSlider: "شريط قبل / بعد",
    photoGhostOverlay: "تراكب الشبح الوضعي",
    photoInitialLabel: "البداية (أ0)",
    photoWeekLabel: "الأسبوع",
    photoDragSliderHint: "حرك المؤشر لمشاهدة الفرق الحقيقي بين الفترتين",

    calorieTitle: "حاسبة السعرات وماسح أطباق الطعام",
    calorieSubtitle: "تحليل فوري للعناصر الغذائية بواسطة الكاميرا والذكاء الاصطناعي",
    calorieScanPlate: "مسح وجبة بالصورة",
    calorieSearchFood: "بحث في قاعدة الأطعمة",
    calorieTodayConsumed: "المستهلك اليوم",
    calorieTarget: "الهدف اليومي",
    calorieBurned: "المحروق (النشاط)",
    calorieRemaining: "المتبقي المسموح",
    macronutrients: "توزيع المغذيات الكبرى",
    proteins: "البروتينات",
    carbs: "الكربوهيدرات",
    fats: "الدهون",
    fiber: "الألياف",
    addCustomMeal: "إضافة إلى السجل",
    scanningFoodText: "الذكاء الاصطناعي يحلل مكونات الطبق والسعرات...",
    scanPlateResult: "تم التعرف على الطبق بنجاح",

    nutritionAdviceTitle: "نصائح غذائية مخصصة يومياً",
    nutritionAdviceSubtitle: "إرشادات مبنية بدقة على مدخلاتك اليومية ونشاطك",
    personalizedForYou: "مخصص لك اليوم",
    tipHydration: "الترطيب المثالي",
    tipProteins: "بناء البروتين",
    tipDeficit: "عجز السعرات الصحي",
    tipRecovery: "الاستشفاء والنوم",

    watchTitle: "مزامنة الساعات الذكية",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung Health, Pixel",
    watchConnect: "ربط الساعة",
    watchConnected: "متصل ومزامن مباشرة",
    watchSyncNow: "مزامنة الآن",
    watchSteps: "الخطوات المسجلة",
    watchActiveBurn: "السعرات المحروقة النشطة",
    watchHeartRate: "نبضات القلب",
    watchWorkouts: "تمارين اليوم",
    watchSyncSuccess: "تمت مزامنة بيانات الساعة بنجاح!",

    remindersTitle: "التذكيرات الآلية الذكية",
    remindersSubtitle: "لا تفوت قياس وزنك، وجباتك أو شرب الماء اليومي",
    reminderMorningWeigh: "وزن الصباح على الريق",
    reminderLunchLog: "تسجيل وجبة الغداء",
    reminderDinnerLog: "تسجيل وجبة العشاء",
    reminderHydration: "شرب الماء (كل ساعتين)",
    reminderWeeklyPhoto: "الصورة الأسبوعية (الأحد)",
    enableNotifications: "تفعيل إشعارات المتصفح",
    testNotification: "إرسال تنبيه تجريبي",
    notificationSent: "تم إرسال التنبيه بنجاح!",

    genderTitle: "التصميم البصري التفاعلي",
    genderFemale: "أنثوي (ذهب وردي ومخمل نيون)",
    genderMale: "رجالي (تيتانيوم سيبراني وزمرد)",
    genderNeutral: "محايد (جمشت كوني وذهب)",
    themePreview: "واجهة ديناميكية تتكيف مع تفاعلك وسلوكك اليومي",

    paymentModalTitle: "اشتراك AuraSlim VIP Pro",
    paymentPlanPro: "وصول كامل وغير محدود",
    paymentPrice: "9.99 €",
    paymentPerMonth: "/ شهرياً (يمكنك الإلغاء في أي وقت)",
    payCardVisa: "بطاقة مصرفية (Visa, Mastercard)",
    payApplePay: "Apple Pay (بلمسة واحدة)",
    paySepa: "تحويل بنكي مباشر (SEPA)",
    cardNumber: "رقم البطاقة",
    cardExpiry: "شهر / سنة",
    cardCvc: "CVC",
    cardName: "الاسم على البطاقة",
    paySubmit: "دفع آمن ومحمي عبر Stripe",
    pciComplianceBadge: "متوافق مع أعلى معايير PCI-DSS وتشفير 256 بت",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "تمت عملية الدفع بنجاح! أنت الآن عضو VIP Pro.",

    adminTitle: "لوحة التحكم المالية وأمان الذكاء الاصطناعي",
    adminSubtitle: "إيرادات Stripe المباشرة، التكاليف التشغيلية ومكافحة الاحتيال",
    adminTotalRevenue: "إجمالي الإيرادات",
    adminMrr: "الدخل الشهري المتكرر (MRR)",
    adminStripeBalance: "رصيد Stripe الجاهز للتحويل",
    adminExpenses: "التكاليف التشغيلية",
    adminRecentTransactions: "أحدث العمليات في Stripe",
    adminFraudDetection: "كشف المعاملات المشبوهة بالتعلم الآلي",
    adminRiskScore: "مقياس الخطورة (ML)",
    adminAnomalyAlert: "تنبيه شذوذ مالي مرصود",
    adminTakeAction: "إجراء حماية فوري",
    adminPayoutNotice: "تُودع الأموال مباشرة وبشكل آلي في حساب Stripe الخاص بك."
  },
  zh: {
    appName: "AuraSlim Pro",
    tagline: "超个性化减重管理与体态追踪",
    navProgress: "减重进展",
    navNutrition: "营养与热量",
    navPhotos: "每周体态照",
    navWatch: "智能手表",
    navReminders: "定时提醒",
    navAccount: "账户设置",
    navAdminFinances: "财务与安全",

    patternLockTitle: "图形手势密码与生物安全",
    patternLockSubtitle: "连接点位以解锁端到端加密会话",
    patternSetTitle: "设置图形密码",
    patternSetInstructions: "连接至少4个点以确保健康档案绝对安全",
    patternConfirmInstructions: "请再次绘制以确认",
    patternMismatch: "图形不一致，请重试。",
    patternSaved: "图形密码已成功加密保存！",
    patternUnlockPrompt: "绘制手势密码进入您的专属档案",
    patternErrorAttempts: "手势错误，剩余尝试次数：",
    patternBiometricBtn: "生物识别极速解锁",
    patternClear: "清除",
    patternReset: "重置",
    lockNow: "立即锁定会话",
    encryptedVault: "端到端加密金库 (AES-256)",
    encryptedNotice: "您的体重与形体照片全部在本地强加密，隐私零泄露。",

    weightCurrent: "当前体重",
    weightStart: "初始体重",
    weightTarget: "目标体重",
    weightLost: "已减重",
    weightRemaining: "距目标",
    bmiLabel: "体质指数 (BMI)",
    bmiCategory: "区间类别",
    logWeightBtn: "记录体重",
    weightHistory: "称重历史",
    weightTrendAnalysis: "AI体重趋势预测",
    bodyFatLabel: "体脂率 (%)",
    waistLabel: "腰围 (cm)",
    waterIntakeLabel: "今日饮水 (L)",
    moodLabel: "今日心情",
    saveEntry: "保存记录",
    congratsMilestone: "恭喜！达成全新里程碑 🎉",

    freePlanBadge: "免费基础版",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "升级至Pro会员",
    proFeaturesTitle: "全面解锁高级专属权益",
    freeLimitReachedPhotos: "免费版仅支持初始照片及1张后续记录。开通Pro享受无限体态周相册！",
    freeLimitReachedCalories: "您已使用1次免费AI食物拍照识别。开通Pro尊享无限次识别！",
    proUnlimitedCloud: "加密云同步、全周体态滑块对比、AI热量扫描及专业报告。",

    photoWeeklyTitle: "每周形体形态对比",
    photoWeeklySubtitle: "直观见证每周令人震撼的身形蜕变",
    photoTakeBtn: "添加本周体态照",
    photoAngleFront: "正面",
    photoAngleSide: "侧面",
    photoAngleBack: "背面",
    photoCompareMode: "对比模式",
    photoBeforeAfterSlider: "前后拖动对比滑块",
    photoGhostOverlay: "形体轮廓半透明对齐",
    photoInitialLabel: "初始 (第0周)",
    photoWeekLabel: "第周",
    photoDragSliderHint: "左右滑动滑块，见证真实的体态塑形变化",

    calorieTitle: "卡路里计算器与餐盘AI识别",
    calorieSubtitle: "拍照即可实时分析宏量营养素与热量",
    calorieScanPlate: "拍照扫描菜品",
    calorieSearchFood: "搜索食物库",
    calorieTodayConsumed: "今日已摄入",
    calorieTarget: "每日热量预算",
    calorieBurned: "运动消耗",
    calorieRemaining: "剩余可用",
    macronutrients: "三大营养素分布",
    proteins: "蛋白质",
    carbs: "碳水化合物",
    fats: "脂肪",
    fiber: "膳食纤维",
    addCustomMeal: "添加到今日日记",
    scanningFoodText: "AI正在识别食材成分与卡路里...",
    scanPlateResult: "菜品识别成功",

    nutritionAdviceTitle: "个性化营养膳食建议",
    nutritionAdviceSubtitle: "根据您今日的热量摄入与消耗实时量身定制",
    personalizedForYou: "今日专属建议",
    tipHydration: "水分补充",
    tipProteins: "优质蛋白质",
    tipDeficit: "健康热量差",
    tipRecovery: "肌体修复与睡眠",

    watchTitle: "智能手表与穿戴设备同步",
    watchSubtitle: "支持 Apple Watch, Garmin, Fitbit, 三星健康, Pixel Watch",
    watchConnect: "连接智能手表",
    watchConnected: "实时同步中",
    watchSyncNow: "立即同步",
    watchSteps: "今日步数",
    watchActiveBurn: "活动消耗卡路里",
    watchHeartRate: "心率",
    watchWorkouts: "今日运动记录",
    watchSyncSuccess: "智能穿戴设备数据同步成功！",

    remindersTitle: "智能自动提醒",
    remindersSubtitle: "绝不错过任何一次清晨称重、用餐记录与饮水",
    reminderMorningWeigh: "清晨空腹称重",
    reminderLunchLog: "午餐热量打卡",
    reminderDinnerLog: "晚餐热量打卡",
    reminderHydration: "定时补水提醒 (每2小时)",
    reminderWeeklyPhoto: "每周体态拍照打卡 (周日)",
    enableNotifications: "开启浏览器推送通知",
    testNotification: "发送测试提醒",
    notificationSent: "提醒通知已成功触发！",

    genderTitle: "性别自适应视觉界面",
    genderFemale: "女性专属 (玫瑰金与霓虹天鹅绒)",
    genderMale: "男性专属 (赛博钛合金与电光翡翠)",
    genderNeutral: "中性奢华 (深邃紫晶与曜黑金)",
    themePreview: "界面色彩与微交互随您的使用习惯动态演化",

    paymentModalTitle: "AuraSlim VIP Pro 会员开通",
    paymentPlanPro: "全平台尊享特权",
    paymentPrice: "9.99 €",
    paymentPerMonth: "/ 月 (随时可取消)",
    payCardVisa: "Visa / 万事达信用卡",
    payApplePay: "Apple Pay 快捷支付",
    paySepa: "SEPA 银行转账",
    cardNumber: "银行卡号",
    cardExpiry: "月 / 年",
    cardCvc: "CVC 安全码",
    cardName: "持卡人姓名",
    paySubmit: "通过 Stripe 安全支付",
    pciComplianceBadge: "PCI-DSS 一级认证与256位高级加密",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "支付成功！您已成功开通 VIP Pro 会员。",

    adminTitle: "财务实时看板与AI风控",
    adminSubtitle: "Stripe 实收营收流水、运维支出与异常风控拦截",
    adminTotalRevenue: "累计总营收",
    adminMrr: "月度经常性收入 (MRR)",
    adminStripeBalance: "Stripe 可结算提现余额",
    adminExpenses: "云基础设施及运营成本",
    adminRecentTransactions: "近期 Stripe 支付交易",
    adminFraudDetection: "机器学习交易欺诈检测系统",
    adminRiskScore: "ML 风险评分",
    adminAnomalyAlert: "检测到可疑交易异常",
    adminTakeAction: "立即执行风控操作",
    adminPayoutNotice: "资金已自动结算至绑定的 Stripe 账户中。"
  },
  ja: {
    appName: "AuraSlim Pro",
    tagline: "超パーソナライズ体重管理＆体型トラッキング",
    navProgress: "体重進捗",
    navNutrition: "栄養＆カロリー",
    navPhotos: "週間体型写真",
    navWatch: "スマートウォッチ",
    navReminders: "リマインダー",
    navAccount: "マイアカウント",
    navAdminFinances: "財務＆セキュリティ",

    patternLockTitle: "パターンロック＆生体認証",
    patternLockSubtitle: "点を結んで暗号化セッションを解除",
    patternSetTitle: "グラフィカルパスワードの設定",
    patternSetInstructions: "安全のため4つ以上の点を結んで設定してください",
    patternConfirmInstructions: "確認のためもう一度同じパターンを描いてください",
    patternMismatch: "パターンが一致しません。もう一度お試しください。",
    patternSaved: "グラフィカルパスワードを暗号化して保存しました！",
    patternUnlockPrompt: "秘密のパターンを描いてロックを解除してください",
    patternErrorAttempts: "パターンが間違っています。残り試行回数: ",
    patternBiometricBtn: "生体認証ですぐに解除",
    patternClear: "クリア",
    patternReset: "リセット",
    lockNow: "セッションをロック",
    encryptedVault: "エンドツーエンド暗号化保管庫 (AES-256)",
    encryptedNotice: "体重データと写真は端末内で強固に暗号化され保護されています。",

    weightCurrent: "現在の体重",
    weightStart: "開始時体重",
    weightTarget: "目標体重",
    weightLost: "減量値",
    weightRemaining: "目標まで残り",
    bmiLabel: "体格指数 (BMI)",
    bmiCategory: "判定",
    logWeightBtn: "体重を記録",
    weightHistory: "測定履歴",
    weightTrendAnalysis: "AI予測トレンド分析",
    bodyFatLabel: "体脂肪率 (%)",
    waistLabel: "ウエスト (cm)",
    waterIntakeLabel: "水分補給 (L)",
    moodLabel: "今日の気分",
    saveEntry: "保存する",
    congratsMilestone: "おめでとうございます！新たな目標を達成 🎉",

    freePlanBadge: "無料プラン (基本)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "Proにアップグレード",
    proFeaturesTitle: "すべての機能で最速の結果を",
    freeLimitReachedPhotos: "無料版では初期写真＋1枚のみ記録可能です。Pro版で無制限の体型ギャラリーを解放！",
    freeLimitReachedCalories: "無料の画像カロリー計算をご利用いただきました。Pro版で無制限AIスキャンを解放！",
    proUnlimitedCloud: "暗号化クラウド保存、無制限写真比較、AIカロリースキャン、詳細レポート。",

    photoWeeklyTitle: "週間モーフォロジー体型比較",
    photoWeeklySubtitle: "週ごとの見た目の劇的な変化をスライダーで確認",
    photoTakeBtn: "今週の写真を記録",
    photoAngleFront: "正面",
    photoAngleSide: "側面",
    photoAngleBack: "背面",
    photoCompareMode: "比較モード",
    photoBeforeAfterSlider: "ビフォー・アフタースライダー",
    photoGhostOverlay: "ゴーストシルエット重ね合わせ",
    photoInitialLabel: "初期 (W0)",
    photoWeekLabel: "第週",
    photoDragSliderHint: "スライダーを左右に動かして体型の進化を確認",

    calorieTitle: "カロリー計算機＆食事AIスキャナー",
    calorieSubtitle: "写真から主要栄養素とカロリーを瞬時に推定",
    calorieScanPlate: "写真を撮って食事を解析",
    calorieSearchFood: "食品データベース検索",
    calorieTodayConsumed: "今日の摂取カロリー",
    calorieTarget: "目標カロリー",
    calorieBurned: "消費カロリー（活動）",
    calorieRemaining: "残り許容カロリー",
    macronutrients: "PFCバランス",
    proteins: "タンパク質",
    carbs: "炭水化物",
    fats: "脂質",
    fiber: "食物繊維",
    addCustomMeal: "日誌に追加",
    scanningFoodText: "AIが食事内容とカロリーを解析中...",
    scanPlateResult: "料理の解析が完了しました",

    nutritionAdviceTitle: "パーソナライズ栄養アドバイス",
    nutritionAdviceSubtitle: "本日の摂取カロリーと活動量に基づき自動生成",
    personalizedForYou: "今日のあなたへ",
    tipHydration: "水分補給",
    tipProteins: "タンパク質の摂取",
    tipDeficit: "カロリー収支管理",
    tipRecovery: "休息と睡眠",

    watchTitle: "スマートウォッチ連携",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung Health, Pixel Watch",
    watchConnect: "スマートウォッチを接続",
    watchConnected: "リアルタイム同期中",
    watchSyncNow: "今すぐ同期",
    watchSteps: "歩数",
    watchActiveBurn: "アクティブ消費カロリー",
    watchHeartRate: "心拍数",
    watchWorkouts: "本日のワークアウト",
    watchSyncSuccess: "スマートウォッチのデータを正常に同期しました！",

    remindersTitle: "スマート自動リマインダー",
    remindersSubtitle: "朝の測定や食事記録、水分補給の忘れを防止",
    reminderMorningWeigh: "朝の空腹時計測",
    reminderLunchLog: "昼食の記録",
    reminderDinnerLog: "夕食の記録",
    reminderHydration: "水分補給（2時間毎）",
    reminderWeeklyPhoto: "週間体型写真（日曜日）",
    enableNotifications: "ブラウザ通知を許可",
    testNotification: "テスト通知を送信",
    notificationSent: "リマインダー通知を送信しました！",

    genderTitle: "ジェンダー適応デザイン",
    genderFemale: "女性向け (ローズゴールド＆ネオンベルベット)",
    genderMale: "男性向け (サイバーチタン＆エメラルド)",
    genderNeutral: "ニュートラル (アメジスト＆ゴールド)",
    themePreview: "操作行動に合わせてリアルタイムに進化するダイナミックUI",

    paymentModalTitle: "AuraSlim VIP Pro メンバーシップ",
    paymentPlanPro: "全機能無制限アクセス",
    paymentPrice: "9.99 €",
    paymentPerMonth: "/ 月 (いつでもキャンセル可能)",
    payCardVisa: "クレジットカード (Visa, Mastercard)",
    payApplePay: "Apple Pay (ワンタップ)",
    paySepa: "SEPA 銀行振込",
    cardNumber: "カード番号",
    cardExpiry: "月 / 年",
    cardCvc: "CVC",
    cardName: "カード名義人",
    paySubmit: "Stripeで安全に支払う",
    pciComplianceBadge: "PCI-DSS Level 1 認定＆256ビット暗号化",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "決済が完了しました！VIP Proメンバーへようこそ。",

    adminTitle: "財務ダッシュボード＆AI不正検知",
    adminSubtitle: "Stripe収益リアルタイム監視と機械学習セキュリティ",
    adminTotalRevenue: "累計売上",
    adminMrr: "月間経常収益 (MRR)",
    adminStripeBalance: "Stripe振込可能残高",
    adminExpenses: "運用インフラコスト",
    adminRecentTransactions: "直近のStripe取引",
    adminFraudDetection: "機械学習による不正取引検知",
    adminRiskScore: "MLリスクスコア",
    adminAnomalyAlert: "異常トランザクション検知アラート",
    adminTakeAction: "セキュリティ防御アクション",
    adminPayoutNotice: "売上金は連携されたStripe口座に直接入金されます。"
  },
  ru: {
    appName: "AuraSlim Pro",
    tagline: "Ультраперсонализированное похудение и моделирование тела",
    navProgress: "Прогресс",
    navNutrition: "Питание и калории",
    navPhotos: "Еженедельные фото",
    navWatch: "Смарт-часы",
    navReminders: "Напоминания",
    navAccount: "Мой профиль",
    navAdminFinances: "Финансы и безопасность",

    patternLockTitle: "Графический ключ и биометрия",
    patternLockSubtitle: "Соедините точки для разблокировки зашифрованной сессии",
    patternSetTitle: "Создайте графический ключ",
    patternSetInstructions: "Соедините не менее 4 точек для защиты ваших данных",
    patternConfirmInstructions: "Повторите рисунок для подтверждения",
    patternMismatch: "Ключи не совпадают. Попробуйте еще раз.",
    patternSaved: "Графический ключ сохранен и надежно зашифрован!",
    patternUnlockPrompt: "Нарисуйте ваш ключ для доступа к профилю",
    patternErrorAttempts: "Неверный ключ. Осталось попыток: ",
    patternBiometricBtn: "Быстрая биометрическая разблокировка",
    patternClear: "Очистить",
    patternReset: "Сбросить",
    lockNow: "Заблокировать сессию",
    encryptedVault: "Сквозное шифрование сейфа (AES-256)",
    encryptedNotice: "Ваши биометрические данные и фото зашифрованы локально.",

    weightCurrent: "Текущий вес",
    weightStart: "Начальный вес",
    weightTarget: "Целевой вес",
    weightLost: "Сброшено",
    weightRemaining: "Осталось",
    bmiLabel: "Индекс массы тела (ИМТ)",
    bmiCategory: "Категория",
    logWeightBtn: "Записать вес",
    weightHistory: "История взвешиваний",
    weightTrendAnalysis: "Прогноз снижения веса",
    bodyFatLabel: "Жировая масса (%)",
    waistLabel: "Талия (см)",
    waterIntakeLabel: "Вода (л)",
    moodLabel: "Настроение",
    saveEntry: "Сохранить",
    congratsMilestone: "Поздравляем! Достигнута новая цель 🎉",

    freePlanBadge: "Бесплатный режим (Базовый)",
    proPlanBadge: "AuraSlim VIP Pro",
    upgradeToPro: "Перейти на Pro",
    proFeaturesTitle: "Максимальный результат",
    freeLimitReachedPhotos: "В бесплатном режиме доступно только 1 фото после начального. Откройте полный альбом с Pro!",
    freeLimitReachedCalories: "Вы использовали 1 бесплатное фото для сканирования калорий. Откройте безлимит с Pro!",
    proUnlimitedCloud: "Зашифрованное облако, безлимитные фото, ИИ-сканер блюд и подробные отчеты.",

    photoWeeklyTitle: "Еженедельное отслеживание формы",
    photoWeeklySubtitle: "Наблюдайте за визуальной трансформацией неделю за неделей",
    photoTakeBtn: "Добавить фото недели",
    photoAngleFront: "Спереди",
    photoAngleSide: "Сбоку",
    photoAngleBack: "Сзади",
    photoCompareMode: "Режим сравнения",
    photoBeforeAfterSlider: "Ползунок До / После",
    photoGhostOverlay: "Прозрачный силуэт для позы",
    photoInitialLabel: "Старт (Н0)",
    photoWeekLabel: "Неделя",
    photoDragSliderHint: "Перемещайте ползунок, чтобы увидеть трансформацию",

    calorieTitle: "Калькулятор калорий и сканер блюд",
    calorieSubtitle: "Мгновенная оценка калорий и БЖУ по фото",
    calorieScanPlate: "Сканировать блюдо по фото",
    calorieSearchFood: "Поиск в базе продуктов",
    calorieTodayConsumed: "Съедено сегодня",
    calorieTarget: "Дневная норма",
    calorieBurned: "Сожжено (активность)",
    calorieRemaining: "Остаток",
    macronutrients: "Баланс БЖУ",
    proteins: "Белки",
    carbs: "Углеводы",
    fats: "Жиры",
    fiber: "Клетчатка",
    addCustomMeal: "Добавить в дневник",
    scanningFoodText: "ИИ анализирует ингредиенты блюда...",
    scanPlateResult: "Блюдо успешно распознано",

    nutritionAdviceTitle: "Персональные советы по питанию",
    nutritionAdviceSubtitle: "Индивидуальные рекомендации на основе данных за день",
    personalizedForYou: "Для вас сегодня",
    tipHydration: "Питьевой режим",
    tipProteins: "Потребление белка",
    tipDeficit: "Дефицит калорий",
    tipRecovery: "Восстановление и сон",

    watchTitle: "Синхронизация со смарт-часами",
    watchSubtitle: "Apple Watch, Garmin, Fitbit, Samsung Health, Pixel Watch",
    watchConnect: "Подключить часы",
    watchConnected: "Синхронизировано в реальном времени",
    watchSyncNow: "Синхронизировать сейчас",
    watchSteps: "Шаги",
    watchActiveBurn: "Активные калории",
    watchHeartRate: "Пульс",
    watchWorkouts: "Тренировки за сегодня",
    watchSyncSuccess: "Данные часов успешно обновлены!",

    remindersTitle: "Автоматические напоминания",
    remindersSubtitle: "Не пропускайте взвешивания, приемы пищи и воду",
    reminderMorningWeigh: "Утреннее взвешивание натощак",
    reminderLunchLog: "Запись обеда",
    reminderDinnerLog: "Запись ужина",
    reminderHydration: "Выпить воды (каждые 2ч)",
    reminderWeeklyPhoto: "Еженедельное фото (Воскресенье)",
    enableNotifications: "Включить уведомления браузера",
    testNotification: "Отправить тестовое напоминание",
    notificationSent: "Напоминание отправлено!",

    genderTitle: "Адаптивный визуальный стиль",
    genderFemale: "Женский (Розовое золото и неоновый бархат)",
    genderMale: "Мужской (Кибер-титан и изумруд)",
    genderNeutral: "Нейтральный (Аметист и золото)",
    themePreview: "Динамическая палитра адаптируется под ваше поведение",

    paymentModalTitle: "Подписка AuraSlim VIP Pro",
    paymentPlanPro: "Полный безлимитный доступ",
    paymentPrice: "9,99 €",
    paymentPerMonth: "/ месяц (отмена в любой момент)",
    payCardVisa: "Банковская карта (Visa, Mastercard)",
    payApplePay: "Apple Pay (В 1 клик)",
    paySepa: "Банковский перевод SEPA",
    cardNumber: "Номер карты Visa",
    cardExpiry: "ММ / ГГ",
    cardCvc: "CVC",
    cardName: "Имя держателя карты",
    paySubmit: "Безопасная оплата через Stripe",
    pciComplianceBadge: "Сертифицировано по стандарту PCI-DSS Level 1 (256-бит)",
    gdprBadge: "Données personnelles · confidentialité",
    paymentSuccess: "Оплата прошла успешно! Вы стали участником VIP Pro.",

    adminTitle: "Финансовая панель и безопасность ML",
    adminSubtitle: "Онлайн доходы Stripe, расходы и защита от мошенничества",
    adminTotalRevenue: "Общая выручка",
    adminMrr: "Ежемесячный доход (MRR)",
    adminStripeBalance: "Баланс Stripe для вывода",
    adminExpenses: "Операционные расходы",
    adminRecentTransactions: "Последние транзакции Stripe",
    adminFraudDetection: "Обнаружение подозрительных операций машинным обучением",
    adminRiskScore: "ML-оценка риска",
    adminAnomalyAlert: "Обнаружена финансовая аномалия",
    adminTakeAction: "Защитное действие",
    adminPayoutNotice: "Средства автоматически поступают на ваш счет Stripe."
  }
};

// Comprehensive universal translations for all UI details across all supported languages
const universalLanguageAdditions: Partial<Record<LanguageCode, Partial<TranslationDictionary>>> = {
  fr: {
    bmiExplTitle: "Comprendre votre Indice de Masse Corporelle (IMC)",
    projectionExplTitle: "Avantage & Projection à 4 semaines",
    targetExplTitle: "Votre Objectif Cible",
    currentExplTitle: "Votre Poids Actuel & Évolution",
    progressExplTitle: "Votre Progression Globale",
    whoClassificationTitle: "Grille de référence OMS",
    formulaTitle: "Formule de calcul exacte (Norme OMS)",
    projectionDynamic28dDesc: "Prévision calculée selon un déficit/surplus physiologique durable.",
    reportTitle: "Bilan de Santé & Rapport Nutritionniste",
    reportSubtitle: "Document médical complet prêt à télécharger et à imprimer pour votre consultation diététique.",
    reportDownloadBtn: "Télécharger le Rapport PDF",
    reportPrintBtn: "Imprimer le Bilan",
    reportPatientBio: "Identité Patient & Paramètres Biométriques",
    reportWeightTrend: "Dynamique Pondérale & Régression Linéaire",
    reportNutritionSummary: "Bilan Nutritionnel & Macro-nutriments",
    reportActivitySummary: "Activité Physique & Télémétrie Montre",
    reportDietitianNotes: "Observations & Prescriptions du Nutritionniste",
    reportPractitionerSign: "Signature & Cachet du Praticien",
    reportConfidential: "Rapport médical de suivi nutritionnel & métabolique - Confidentiel",
    reportGeneratedOn: "Édité le",
    reportExportSuccess: "Rapport PDF téléchargé avec succès ! Prêt pour votre praticien.",
    openHealthReport: "Bilan Nutritionniste PDF",
    themeModeDark: "Sombre",
    themeModeLight: "Clair",
    voiceInputTitle: "Saisie Vocale des Mesures",
    voiceInputListening: "Écoute en cours... Parlez maintenant",
    voiceInputHint: "Dites par exemple : « 72.5 kilos, tour de taille 80, 2.5 litres d'eau »",
    voiceInputStop: "Terminer",
    voiceMicTooltip: "Saisir au micro",
    voiceNotSupported: "Microphone non supporté sur ce navigateur (utilisez Chrome, Safari ou Edge).",
    themeFemale: "Féminin",
    themeMale: "Masculin",
    themeNeutral: "Neutre / Universel",
    accountSettingsDesc: "Personnalisation, langue universelle, mot de passe graphique et sécurité",
    gdprExportSuccess: "Export complet chiffré RGPD téléchargé avec succès !",
    planActive: "Actif",
    planProLifetime: "Abonnement Premium actif (Paiement mensuel)",
    planProDesc: "Accès VIP complet : photos illimitées, scanner IA sans limite et cloud sécurisé.",
    planFreeDesc: "Mode gratuit : 1 photo après la photo initiale et 1 analyse de repas par image.",
    platformLanguage: "Langue de la Plate-forme (Monde Entier)",
    platformLanguageDesc: "Sélectionnez votre langue de préférence : toute l'application s'adapte instantanément.",
    patternPasswordTitle: "Mot de Passe Graphique & Sécurité",
    patternPasswordDesc: "Votre session et vos photos sont verrouillées par votre schéma personnalisé.",
    modifyPatternBtn: "Modifier mon schéma secret",
    zeroKnowledgeDesc: "Architecture Chiffrée Zero-Knowledge : Vos photos et métriques sont chiffrées avec PBKDF2/AES-256.",
    gdprTitle: "Export de Données & Respect RGPD",
    gdprDesc: "Téléchargez l'intégralité de vos pesées, historiques et métriques sous format standard JSON.",
    gdprExportBtn: "Exporter mes données (RGPD)",
    deleteBtn: "Supprimer",
    closeBtn: "Fermer",
    recentEntries: "Entrées récentes",
    newEntry: "Nouvelle pesée",
    measuredWeight: "Poids mesuré",
    weeklyPaceLabel: "Rythme :",
    daysLabel: "jours",
    goalReachedActive: "Objectif atteint ! Maintien actif",
    paceMaintenance: "Maintien du rythme en cours",
    statisticalReliability: "Fiabilité statistique du modèle",
    photoSideBySide: "Côte à Côte",
    photoSideBySideUnavailable: "Comparaison Côte à Côte indisponible",
    photoSideBySideUnavailableDesc: "Enregistrez au moins 2 photos pour visualiser votre avant / après côte à côte.",
    photoSelectInitial: "Photo Initiale (Référence)",
    photoSelectRecent: "Photo Récente (Comparée)",
    photoWeightDiff: "Écart de Poids",
    photoDaysApart: "Intervalle Temporel",

    // Objectifs Hebdomadaires
    weeklyGoalTitle: "Objectifs Hebdomadaires",
    weeklyGoalSubtitle: "Définissez votre cible pour la semaine et visualisez votre progression en direct.",
    weeklyGoalSetTarget: "Définir la cible de la semaine",
    weeklyGoalCurrentTarget: "Cible de la semaine :",
    weeklyGoalProgress: "Progression hebdomadaire",
    weeklyGoalRemaining: "Reste à perdre cette semaine :",
    weeklyGoalAchieved: "Objectif hebdomadaire atteint ! 🎉",
    weeklyGoalDaysLeft: "jours restants d'ici dimanche",
    weeklyGoalPaceNeeded: "Rythme conseillé :",
    weeklyGoalPaceMaintenance: "En phase de stabilisation",
    weeklyGoalEditBtn: "Ajuster la cible",
    weeklyGoalSaveBtn: "Enregistrer la cible",
    weeklyGoalPresetGentle: "Perte douce (-0.4 kg)",
    weeklyGoalPresetStandard: "Standard (-0.7 kg)",
    weeklyGoalPresetIntense: "Intensif (-1.0 kg)",
    weeklyGoalStartWeight: "Départ semaine",
    weeklyGoalCurrentWeight: "Poids actuel",
    weeklyGoalLostThisWeek: "Perdu cette semaine",
    weeklyGoalWeekTargetLabel: "Poids cible",
    weeklyGoalTargetReachedNotice: "Bravo ! Vous avez atteint votre objectif fixé pour cette semaine.",
    weeklyGoalKeepGoingNotice: "Continuez vos efforts, vous êtes sur la bonne voie !",

    // Caméra en direct
    cameraModalTitle: "Appareil Photo en direct",
    cameraShutter: "Prendre la photo",
    cameraSwitchFacing: "Inverser la caméra",
    cameraRetake: "Reprendre la photo",
    cameraConfirm: "Valider cette photo",
    cameraPermissionDenied: "Accès à la caméra refusé. Veuillez autoriser l'appareil photo dans les paramètres.",
    cameraPermissionHint: "Impossible d'activer l'appareil photo en direct. Utilisez la galerie ci-dessous.",
    cameraUploadGallery: "Choisir depuis la galerie",
    cameraTimer3s: "Retardateur 3s",
    cameraLive: "Caméra en direct",
    cameraGallery: "Galerie",
    cameraScalePhoto: "Photo de la pesée / balance",
    cameraScalePhotoOptional: "Prendre en photo l'écran de votre balance (optionnel)",
    cameraFoodTitle: "Scanner votre plat en direct",
    cameraProgressPhotoTitle: "Photo d'évolution physique",
    cameraTakeFoodPhoto: "Activer la caméra",
    cameraChooseFromGallery: "Galerie photo",
    nutritionPdfBannerTitle: "Bilan nutritionnel personnel",
    nutritionPdfBannerBadge: "PDF DISPONIBLE",
    nutritionPdfBannerDesc: "Consultez les mesures et repas enregistrés. Les estimations ne constituent pas un avis médical.",
    nutritionPdfBannerBtn: "Générer mon Bilan Nutritionniste (PDF)",
    periodsOfDayTitle: "Périodes de la journée",
    clickToChooseFoodHint: "Cliquez sur + pour descendre choisir vos aliments",
    periodBreakfast: "Matin",
    periodLunch: "Midi",
    periodDinner: "Soir",
    periodSnack: "Collation",
    chooseBtn: "Choisir",
    keyOptionScanBadge: "⭐ Option Clé · Scan Instantané",
    scanPlateDescription: "Prenez votre assiette en photo : l'IA reconnaît automatiquement les aliments, portions et calories.",
    targetedMealLabel: "Repas ciblé :",
    takePlatePhotoBtn: "📸 Prendre en photo",
    directBadge: "Direct",
    deviceCameraDesc: "Appareil photo de votre smartphone ou PC",
    galleryPhotosBtn: "Galerie photos",
    importExistingPhotoDesc: "Importer une photo déjà enregistrée",
    foodIdeasFor: "Idées d'aliments pour le",
    searchFoodPlaceholder: "Rechercher un aliment...",
    todayLoggedMealsTitle: "Repas enregistrés aujourd'hui",
    totalAlimentsSuffix: "au total",
    noMealsLoggedToday: "Aucun repas enregistré aujourd'hui. Cliquez sur le bouton \"+\" d'un repas pour commencer.",
    mealsHistoryTitle: "Historique des repas",
    noMealsHistory: "Aucun repas enregistré.",
    photoEvolutionTitle: "Évolution en photos",
    photoEvolutionSubtitle: "Jour 1 et photos de pesées enregistrées sur cet appareil.",
    addPhotoBtn: "Ajouter une photo",
    generateVideoBtn: "Générer ma vidéo",
    galleryCountLabel: "Galerie",
    compareBeforeAfterTitle: "Comparer avant / après",
    dragCenterToCompareHint: "Glissez le curseur au centre vers la gauche ou la droite ◀ ▶",
    photoBeforeLabel: "Photo avant",
    photoAfterLabel: "Photo après",
    badgeAvant: "AVANT",
    badgeApres: "APRÈS",
    dayOneLabel: "Jour 1",
    weekAbbrev: "Semaine",
    freeBadge: "Gratuit",
    premiumBadge: "Premium",
    disclaimerFooter: "AuraSlim · Suivi personnel : les résultats et les analyses IA restent des estimations.",
    offersBtn: "Offres",
    newPhotoModalTitle: "Nouvelle photo",
    newPhotoModalSubtitle: "Face obligatoire. Profil et dos facultatifs.",
    photoAngleFace: "Face",
    photoAngleProfile: "Profil",
    photoAngleBackLabel: "Dos",
    notesOptionalPlaceholder: "Notes facultatives",
    cancelBtn: "Annuler",
    saveBtn: "Enregistrer",
    unlimitedScanMealOption: "Option Scan Repas IA illimité",
    activateScanOption: "Activer l'Option Scan (3,99 €)",
    plateRecognizedSuccess: "Plat reconnu avec succès",
    estimatedPortion: "Portion estimée",
    saveMealToLog: "Enregistrer ce plat dans mon journal",
    recognizedFoodsAi: "Aliments reconnus (estimation IA)",
    listenFoods: "Écouter les aliments",

    photoFitCover: "Remplir 100%",
    photoFitContain: "Photo entière",
    photoWaitingSecond: "Photo après à venir",
    photoWaitingSecondDesc: "Ajoutez votre prochaine pesée en photo pour comparer votre évolution physique avant/après.",
    photoTakeSecondBtn: "Ajouter la photo suivante",
    photoFromGallery: "Galerie",
    photoFromCamera: "Caméra",
    photoFreeLimitNotice: "Deux photos supplémentaires de pesées ou de progression offertes après Jour 1.",
    photoDragHintBottom: "Glissez le curseur au milieu vers la gauche ou la droite ◀ ▶",
    photoDayOne: "Jour 1",

    accountSettingsTitle: "Paramètres et confidentialité",
    accountMyPlan: "Mon offre",
    accountPlanFree: "Gratuite",
    accountPlanDesc: "Deux photos de suivi après la photo Jour 1 sont incluses gratuitement. Les options Premium nécessitent une confirmation de Stripe.",
    accountViewOffersBtn: "Voir les offres à 3,99 € et 6,99 €/mois",
    accountTrialTitle: "Code d’essai fourni par AuraSlim",
    accountTrialPlaceholder: "Saisir le code d’essai",
    accountTrialBtn: "Activer l’essai",
    accountTrialSuccess: "Votre accès gratuit temporaire est activé sur cet appareil.",
    accountShareAdminTitle: "Partage facultatif avec l’administrateur",
    accountShareAdminDesc: "Si vous l’activez, votre nom, email, téléphone, pays, objectif, pesées, menus, calories, hydratation et nombre de photos seront envoyés au serveur AuraSlim pour votre suivi.",
    accountShareAdminConsent: "Autoriser le partage de mon suivi",
    accountLangTitle: "Langue et devise",
    accountLangDesc: "Langue et devise de l'application, modifiables à tout moment.",
    accountAppLanguage: "Langue de l'application",
    accountCurrency: "Devise souhaitée",
    accountStripeNotice: "Le prix réel et la devise de facturation sont confirmés sur la page Stripe.",
    accountPatternTitle: "Verrouillage local",
    accountPatternDesc: "Schéma facultatif pour masquer l'écran sur cet appareil. Les données du navigateur restent sur cet appareil.",
    accountPatternCreateBtn: "Créer ou changer mon schéma",
    accountPatternLockBtn: "Verrouiller",
    accountPatternDisableBtn: "Désactiver",
    accountWatchTitle: "Montre et activité",
    bleDisconnected: "Appareil déconnecté.", bleLiveData: "Données cardiaques reçues en direct.", bleNoHeartRate: "Connecté, mais ce capteur ne fournit pas le profil cardio standard.", bleLiveWeight: "Pesée Bluetooth reçue.", bleNoWeight: "Connecté, mais cette balance ne transmet pas ses pesées avec le profil standard.",
    bleUnnamed: "Appareil Bluetooth", bleConnected: "Connexion Bluetooth établie. Les données affichées viennent de l’appareil.", bleCancelled: "Aucun appareil sélectionné.", bleConnectError: "Connexion impossible. Activez le Bluetooth, rapprochez l’appareil et réessayez. Seuls les appareils BLE compatibles sont pris en charge.", bleSyncDone: "Données disponibles actualisées. Les capteurs en direct restent à l’écoute.",
    bleNoBattery: "Connexion active. Cet appareil ne fournit pas de niveau de batterie standard.", blePermission: "Autorisez les notifications dans les réglages du téléphone.", bleReminderBody: "Votre rappel AuraSlim est prêt.", bleNotificationSent: "Rappel envoyé au téléphone. Son affichage sur la montre dépend des réglages de notification du système.", bleNotificationError: "Envoi du rappel impossible sur cet appareil.",
    bleDescription: "Connectez un capteur cardio BLE ou une balance BLE utilisant un profil Bluetooth standard. Les montres Apple, Garmin et Fitbit demandent leurs intégrations officielles et ne sont pas toutes accessibles directement.", bleConnectedBadge: "Connecté", bleHeartRateLabel: "Fréquence cardiaque", bleWeightLabel: "Dernière pesée reçue", bleBatteryLabel: "Batterie", bleSync: "Actualiser", blePairHeartRate: "Connecter un capteur cardio", bleHeartRateProfile: "Profil BLE standard : fréquence cardiaque", blePairScale: "Connecter une balance", bleWeightProfile: "Profil BLE standard : poids", bleMirrorHint: "La montre peut recopier les notifications du téléphone si son application compagnon l’autorise.", bleBrowserHint: "La connexion exige le Bluetooth activé, une application HTTPS ou native, et un appareil BLE compatible à proximité.",
    accountDataTitle: "Mes données",
    accountDataDesc: "Photos, pesées et menus restent dans le stockage de ce navigateur. Pensez à exporter vos données régulièrement.",
    accountExportBtn: "Exporter mes données",
    accountPdfReportBtn: "Voir mon bilan PDF",
    accountDeleteDataBtn: "Effacer mes données",
    accountDeleteDataConfirm: "Effacer définitivement toutes vos données locales AuraSlim sur cet appareil ?",
    navComposeMeals: "Composer vos plats",
    composeMealsSubtitle: "Sélectionnez vos aliments, ajustez vos quantités pour calculer automatiquement les calories et nutriments selon votre objectif, et suivez l'historique de vos repas.",
    mealPortionNotice: "Ajustez la quantité en grammes ou ml : les calories et macros sont recalculées en temps réel.",
    customDishBtn: "Plat personnalisé",
    addCustomFoodTitle: "Ajouter un plat spécifique de votre région",
    mealHistoryTitle: "Historique des repas enregistrés",
    mealsLoggedCount: "plats enregistrés",
    noMealsLoggedYet: "Aucun plat enregistré pour le moment. Composez votre premier repas ci-dessus !",
    accountGoalRegionTitle: "Objectif Corporel & Terroir Culinaire Régional",
    accountGoalRegionDesc: "Personnalisez votre rythme (perte, prise ou stabilisation) et votre région géographique pour adapter les repas et menus selon les aliments disponibles dans votre pays.",
    culinaryRegionLabel: "Région culinaire & Aliments locaux disponibles",
    goalChoiceLabel: "Objectif de poids actif",
    goalMaintain: "Stabilisation du poids",
    accessDashboard: "Accéder à mon tableau de bord",
    optionalSecurityCode: "Configurer un schéma de verrouillage (facultatif)",

    pdfReportTitle: "Bilan personnel de progression",
    pdfReportSubtitle: "Votre bilan personnel de progression",
    pdfStart: "Au départ",
    pdfLatest: "Dernière pesée",
    pdfChange: "Évolution",
    pdfGoal: "Votre objectif",
    pdfWeightTrend: "Évolution des pesées",
    pdfMeasurements: "Mesures et objectifs",
    pdfWeightLog: "Journal des pesées",
    pdfMealLog: "Repas enregistrés",
    pdfDownloadBtn: "Télécharger le bilan PDF",
    pdfPreparing: "Préparation du PDF…",

    notificationAllowed: "Notifications activées avec succès",
    notificationDenied: "Notifications bloquées. Autorisez-les dans les réglages du navigateur.",
    notificationUnsupported: "Ce navigateur ne gère pas les notifications locales.",
    justNow: "À l'instant",
    reminderNotificationBody: "Il est l'heure d'enregistrer vos données sur AuraSlim Pro !",
    testNotification: "Envoyer un rappel test",
    frequencyDaily: "Chaque jour",
    frequencyHourly: "Toutes les {min} min",
    frequencyWeekly: "Chaque dimanche",

    waterTrackerTitle: "Suivi d'Hydratation & Verres d'Eau",
    waterTargetLabel: "Cible",
    waterGoalReached: "Objectif atteint !",
    waterResetDay: "Réinitialiser la journée",
    waterNoGlassesToday: "Aucun verre enregistré aujourd'hui. Cliquez sur +1 verre pour commencer.",
    waterDeleteEntry: "Supprimer cette prise",
    dailyHydrationGoalTitle: "Objectif d'Hydratation Quotidienne",
    dailyHydrationGoalDesc: "Recommandé : 2.0 à 3.0 Litres par jour selon votre poids et activité.",
    litersPerDayUnit: "Litres / jour",
    waterLogsTodayTitle: "Prises d'eau du jour :",
    waterEditGoalTitle: "Modifier l'objectif d'eau",

    sinceStart: "depuis le départ",
    weekAbbrevShort: "sem",
    remainingLabel: "Reste",
    globalProgress: "Progression globale",
    weeklyStartWeightLabel: "Départ semaine",
    weeklyTargetLabel: "Cible semaine",
    weeklyProgressAchievedTitle: "Progression cette semaine",
    weeklyRemainingLabel: "Reste vers la cible",
    milestoneStart: "Départ",
    milestoneCurrent: "Actuel",
    milestoneSundayTarget: "Cible dimanche",
    daysUntilSundayLabel: "jours restants d'ici dimanche",
    projected4wTitle: "Projection indicative à 4 semaines",
    projected4wSubtitle: "Extrapolation mathématique basée sur vos relevés, sans valeur médicale ni garantie de résultat.",
    paceLabel: "Rythme :",
    weekUnit: "semaine",
    projectedWeight28d: "Poids projeté dans 28 jours",
    estimatedGoalDateLabel: "Date estimée de l'objectif",
    daysUnit: "jours",
    goalAchievedMaintenance: "Objectif atteint ! Maintien actif",
    maintainingPace: "Maintien du rythme en cours",
    fitR2Label: "Ajustement aux relevés (R²)",
    currentPaceLabel: "Rythme actuel",
    mathExtrapolationDisclaimer: "Extrapolation mathématique basée sur vos relevés, sans valeur médicale ni garantie de résultat.",
    simulatorAdvantage4wTitle: "Simulateur Avantage 4 Semaines (Encouragement)",
    vision28Days: "Vision dans 28 jours",
    simulatorVisionPrompt: "Visualisez dès aujourd'hui le résultat de votre engagement sur 4 semaines selon votre rythme hebdomadaire :",
    in4WeeksYouWouldBeAt: "Dans 4 semaines, vous seriez à :",
    diffIn28DaysLabel: "en 28 jours",
    remainingAfterwardsLabel: "Reste ensuite :",
    whatToDoToSucceed4w: "Qu'est-ce qu'il faut faire pour réussir dans les 4 semaines ?",
    actionPlanRule1Title: "Déficit calorique modéré et durable :",
    actionPlanRule1Text: "viser un déficit de 300 à 500 kcal/jour (ou cible journalière personnalisée). Évitez les régimes drastiques qui ralentissent le métabolisme.",
    actionPlanRule2Title: "Hydratation constante :",
    actionPlanRule2Text: "boire au moins 2.5L d'eau par jour. Boire avant chaque repas diminue la faim et facilite l'élimination métabolique.",
    actionPlanRule3Title: "Protéines à chaque repas (1.6g à 2g/kg) :",
    actionPlanRule3Text: "préserve votre masse musculaire pour que chaque kilo perdu vienne de la masse grasse et non du muscle.",
    actionPlanRule4Title: "Activité & 8 000 à 10 000 pas quotidiens :",
    actionPlanRule4Text: "la marche active quotidienne permet de brûler 300 à 400 kcal sans augmenter le stress corporel.",
    actionPlanRule5Title: "Pesée régulière le matin à jeun :",
    actionPlanRule5Text: "notez le résultat sans culpabilité ; observez la tendance sur 7 jours plutôt que les micro-variations d'eau.",
    simPaceGentle: "Doux",
    simPaceIdeal: "Idéal",
    simPaceDynamic: "Dynamique",
    simPaceIntense: "Intense",
    projectionGoalExplanationTitle: "Explication du calcul prévisionnel à 28 jours",
    projectionGoalLoseExplanation: "Objectif Perte : un déficit calorique modéré et sain d'environ 500 kcal/jour permet de viser -0,5 kg par semaine, soit -2,0 kg en 28 jours sans fatigue ni reprise de poids.",
    projectionGoalGainExplanation: "Objectif Prise : un surplus calorique contrôlé de ~300 kcal/jour permet de viser +0,3 kg par semaine, soit +1,2 kg en 28 jours de masse saine.",
    projectionGoalMaintainExplanation: "Objectif Maintien : équilibre énergétique neutre pour stabiliser et consolider durablement votre poids de forme sans variation sur les 28 prochains jours.",
    projectedPaceModelLabel: "Cadence & Mode de calcul",
    understandBmiBtn: "Comprendre",
    unlockScanPricing: "3 repas gratuits inclus. Débloquez les scans photo illimités par IA à 3,99 €/mois.",
    unlimitedProgressOption: "Option Galerie Progrès & Vidéo WebM",
    unlockProgressPricing: "3 photos gratuites incluses. Débloquez la galerie complète et l'export vidéo WebM à 3,99 €/mois.",
    activateProgressOption: "Activer l'Option Vidéo (3,99 €/mois)",
    completePackOption: "Auraslim Premium - Pack Complet Illimité",
    unlockCompletePricing: "Tout en illimité : Scan repas IA, galerie photo, vidéo de progression, bilan personnel PDF et programme nutritionnel complet à 6,99 €/mois.",
    activateCompleteOption: "Activer le Pack Complet (6,99 €/mois)",
    inbodyFreeTrialNotice: "1 Bilan InBody officiel inclus gratuitement en version d'essai. Débloquez les bilans illimités avec le Pack Complet.",
    pdfReportFreeTrialNotice: "1 Bilan personnel PDF gratuit inclus en version d'essai. Débloquez les bilans illimités avec le Pack Complet.",
    targetAnalysisTitle: "Analyse de votre objectif cible",
    targetRemainingGap: "Écart restant",
    targetEstimatedDurationTitle: "Durée estimée selon votre rythme",
    targetDurationIntro: "Pour combler sainement l'écart restant :",
    weeksUnit: "semaines",
    perWeekShort: "kg / sem",
    targetGoalSub: "Objectif fixé :",
    simulationDynamic28d: "Simulation dynamique & plan d'action sur 28 jours",
    startWeightShort: "Départ",
    currentWeightShort: "Actuel",
    goalLoseWord: "Perte de poids",
    goalGainWord: "Prise de masse",
    goalMaintainWord: "Stabilisation",
    currentOverviewTitle: "Bilan actuel",
    sinceStartLabel: "depuis le début",
    currentContinuousAnalysisNotice: "Toutes vos pesées enregistrées sont analysées en continu afin de calculer votre métabolisme de croisière et votre projection à 28 jours.",
    progressJourneyAccomplished: "de votre parcours accompli",
    progressDistanceCovered: "Vous avez déjà franchi {percent}% de la distance séparant votre poids initial ({initial} kg) de votre cible ({target} kg).",
    whoNormNotice: "L'IMC est la norme médicale internationale établie par l'Organisation Mondiale de la Santé (OMS) pour évaluer la corpulence corporelle chez l'adulte.",
    yourPositionBadge: "Votre position",
    healthyWeightRangeTitle: "Fourchette de poids santé pour votre taille",
    betweenRange: "Entre",
    andWord: "et",
    goalInHealthyRange: "✓ Votre objectif actuel ({targetWeight} kg) se situe parfaitement dans votre zone de poids santé idéal !",
    goalOutsideHealthyRange: "Votre objectif actuel est de {targetWeight} kg. Adaptez votre alimentation progressivement pour pérenniser votre santé.",
    detailsBtn: "Détails",
    simulateBtn: "Simuler",
    activateNowBtn: "J'ai payé — Activer cette option",
    activeBadge: "✓ Option active",
    payOnStripeBtn: "Payer sur Stripe",
    paymentSuccessNotice: "Option activée avec succès ! Les fonctionnalités correspondantes sont débloquées.",
    inbodyScanMandatoryNotice: "Scan InBody Obligatoire : Veuillez importer ou photographier votre bilan officiel pour générer votre analyse complète.",
    inbodyClearPhotoRequired: "Photo plus claire requise : Veuillez fournir une photo nette et lisible du relevé InBody pour une analyse exacte.",
    inbodyMedicalAdviceMandatory: "Avis d'un médecin ou nutritionniste toujours obligatoire : Ce bilan et ces programmes d'entraînement et d'alimentation sont indicatifs. L'avis d'un professionnel de santé diplômé reste obligatoire.",
    inbodyWorkoutPlanTitle: "Programme Sportif & Entraînement Adapté",
    inbodyNutritionPlanTitle: "Régime & Stratégie Nutritionnelle Sur-Mesure",
    weightHistoryTrendTitle: "Historique et tendance des pesées",
    weightChartSubtitle: "Courbe de vos pesées, de la plus ancienne à la plus récente.",
    chartReadingDirection: "Vos relevés se lisent de gauche à droite, du plus ancien au plus récent.",
    goalLabel: "Objectif",
    measuredWeightLegend: "Poids mesuré",
    projection4wLegend: "Projection +4 sem.",
    goalLegend: "Objectif",
    latestWeighInLabel: "Dernière pesée :",
    todayLabel: "Aujourd'hui",
    weighInsLoggedCount: "pesées enregistrées",
    waistLabel: "Taille",
    bodyFatAbbrev: "MG",
    logWeightSubtitle: "Enregistrez vos métriques du jour manuellement ou directement à la voix avec le microphone.",
    voiceListeningBadge: "EN ÉCOUTE",
    dictateBtn: "Dicter",
    voiceStopDictation: "Arrêter la dictée",
    voiceStartDictation: "Activer la dictée vocale",
    bodyWeightInputLabel: "Poids corporel (kg) *",
    scalePhotoOrSilhouette: "Photo de la pesée / silhouette",
    optionalBadge: "Optionnel",
    photoSavedBadge: "Photo enregistrée",
    takeScalePhotoBtn: "Prendre une photo de pesée",
    waistInputLabel: "Tour de taille (cm)",
    dictateWaist: "Dicter le tour de taille",
    moodGreat: "Top",
    moodGood: "Bien",
    moodNeutral: "Moyen",
    moodStruggling: "Difficile",
    notesLabel: "Notes ou ressentis",
    dictateNotes: "Dicter des notes",
    notesPlaceholder: "Énergie, faim, entraînement...",
    twoPhotosFreeUsedNotice: "Deux photos de pesée offertes ont été utilisées. Débloquez la galerie pour photographier la prochaine pesée.",

    videoStepDayOne: "Inscription (Jour 1)",
    videoOverlayTitle: "AuraSlim • Vidéo de Progression",
    videoOverlaySubtitle: "Photos de votre suivi personnel",
    videoInitialWeightLabel: "Poids initial de départ",
    videoVariationLabel: "Variation",
    videoEvolutionLabel: "Évolution",
    videoModalTitle: "Vidéo de Progression Morphologique",
    videoModalSubtitle: "Compile toutes vos photos chronologiques du début jusqu'à aujourd'hui pour visualiser votre transformation.",
    videoGeneratingText: "Génération et encodage vidéo HD en cours...",
    downloadVideoBtn: "Télécharger ma vidéo",
    shareVideoBtn: "Partager",
    socialMediaHeading: "Réseaux sociaux & Messageries",
    copyLinkBtn: "Copier lien",
    linkCopiedBadge: "Lien copié !",
    shareMoreBtn: "Réseaux...",
    videoShareTip: "💡 Conseil : téléchargez votre vidéo ci-dessus pour la publier dans vos stories Instagram, TikTok ou l'envoyer comme fichier dans vos conversations !",
    videoTimelineTitle: "Étapes incluses dans la vidéo",
    videoPrivacyNotice: "Vos photos et la vidéo sont traitées dans ce navigateur. Exportez-les uniquement si vous souhaitez les partager.",
    videoLoadingPhoto: "Chargement de la photo...",
    videoCannotLoadPhotoError: "Une photo ne peut pas être chargée. Vérifiez les photos de la galerie avant de générer la vidéo.",
    videoRecorderNotSupportedError: "Ce navigateur ne permet pas d'exporter la vidéo WebM. Vous pouvez visualiser vos photos ci-dessous.",
    videoEmptyError: "La vidéo générée est vide. Réessayez avec un autre navigateur.",
    videoRecordingError: "Impossible d'enregistrer la vidéo sur ce navigateur.",

    calorieScanDisclaimer: "En lançant le scan, vous acceptez que la photo du repas soit transmise au service IA pour estimation nutritionnelle. Une photo du corps n’est jamais envoyée par ce scan.",
    retryWithThisPhoto: "Réessayer avec cette photo",
    aiIdentifyingIngredients: "Identification par IA des ingrédients et des macronutriments...",
    mealIdeasDisclaimer: "Plus de dix idées par repas ; portions et calories sont indicatives, les plats régionaux peuvent varier. Vérifiez les valeurs réelles et adaptez-les avec un professionnel de santé si nécessaire.",
    indicativePortionLabel: "Portion indicative",
    forQuantityLabel: "pour la quantité saisie",
    addToMealTitle: "Ajouter au repas",
    photoOfLoggedMeal: "Photo du repas enregistré",
    photoDishForMeal: "Photographier le plat",
    centerPlateSubtitle: "Placez votre assiette au centre de l'écran pour l'évaluation instantanée des macronutriments",
    foodPhotoIllustrativeDesc: "Photo réelle illustrative de la catégorie · portion indicative. Le plat, la recette et les valeurs réelles peuvent varier.",
    photoSourceCommons: "Source de la photo (Wikimedia Commons, CC0)",
    removeFoodItem: "Retirer cet aliment",

    paymentTariffsDesc: "Tarifs prévus en euros par mois. Vérifiez le montant affiché par Stripe : il dépend du tarif que vous avez configuré dans son tableau de bord.",
    paymentStripeTestNotice: "Mode test Stripe : utilisez une carte de test. Aucun paiement réel ne sera encaissé par ces liens.",
    paymentPayOnStripe: "Payer sur Stripe :",
    paymentPreparingLink: "Préparation du lien sécurisé…",
    paymentCheckoutDisclaimer: "Après paiement, Stripe vous ramène automatiquement à l’écran d’origine. Votre option s’active après vérification du règlement. AuraSlim ne conserve pas vos données de carte.",
    paymentSecureReturn: "Paiement sécurisé · retour automatique",
    paymentPopupBlocked: "Autorisez l’ouverture de l’onglet de paiement dans votre navigateur, puis réessayez.",
    paymentCancelledNotice: "Paiement annulé. Vous êtes revenu à votre écran précédent.",
    paymentVerificationPending: "Votre paiement n’est pas encore confirmé. Réessayez la vérification dans un instant.",
    paymentVerifiedStatus: "Abonnement vérifié auprès de Stripe.",
    paymentRetryVerification: "Vérifier le paiement",
    trackingDayLabel: "Jour {day}",

    patternScreenLockDesc: "Verrouillage local de l'écran. Sauvegardez vos données dans les paramètres.",

    loadingLocalData: "Chargement des données locales…",
    startingWeightLabel: "Poids de départ",
    dayOnePhotoLabel: "Photo Jour 1",
    checkingSubscription: "Vérification…",
    remainingPhotosCount: "restantes",
    frontPhotoRequiredError: "Une photo de face est nécessaire pour la comparaison.",

    macroCalories: "Calories",
    nutritionReportTitle: "Bilan nutritionnel personnel",
    pdfAvailableBadge: "PDF DISPONIBLE",
    nutritionReportSubtitle: "Consultez les mesures et repas enregistrés. Les estimations ne constituent pas un avis médical.",
    generateNutritionReportPdf: "Générer mon Bilan Nutritionniste (PDF)",
    addAnalyzedPlateToLog: "Enregistrer ce plat dans mon journal",
    portionLabel: "Portion",
    scanAiBadge: "Scan IA",
    analyzedDishAlt: "Plat analysé",
    ingredientsUncertainNotice: "Le détail de chaque ingrédient est incertain sur cette photo ; seul le repas global a pu être estimé.",
    plateScanDisclaimer: "Les quantités et calories déduites d’une image restent approximatives.",
    macroTargetLabel: "Cible",
    foodsPlural: "aliments",
    foodSingular: "aliment",

    cameraHttpsRequired: "La caméra en direct exige HTTPS et l'autorisation du navigateur. Essayez l'appareil photo du téléphone ou sélectionnez une photo.",
    cameraUnavailableError: "Impossible d'activer le flux vidéo direct. Vous pouvez prendre votre photo instantanément avec l'appareil photo ou sélectionner un fichier.",
    cameraActivating: "Activation de la caméra...",
    cameraDirectAccessTitle: "Accès caméra direct disponible",
    cameraDirectAccessDesc: "Autorisez la caméra dans le navigateur, ou essayez la capture proposée par votre appareil. Sur ordinateur, ce bouton peut ouvrir un sélecteur de fichiers.",
    cameraOpenDirectDevice: "📸 Ouvrir mon appareil photo direct",
    cameraRetryStream: "Réessayer flux",
    cameraHowToAuthorize: "Comment autoriser la caméra dans le navigateur ?",
    cameraHowToAuthorizeStepTitle: "Pour autoriser le flux en direct :",
    cameraHowToAuthorizeStep1: "1. Cliquez sur le cadenas 🔒 à gauche de l'adresse URL.",
    cameraHowToAuthorizeStep2: "2. Activez l'option Caméra / Appareil photo sur Autoriser.",
    cameraHowToAuthorizeStep3: "3. Cliquez sur Réessayer ou rechargez la page.",
    cameraTimerActive: "3s Actif",
    cameraTimer: "Minuteur",
    cameraFacingBack: "Arrière",
    cameraFacingFront: "Face",
    cameraTriggerShutter: "Déclencher",
    cameraDirectNativeTitle: "Appareil photo direct",
    cameraDirectBadge: "Direct",

    dragSliderLabel: "Glisser",

    nutritionMealsLoggedSummary: "Sur {count} aliment(s) enregistré(s) aujourd'hui. Objectif indicatif : {target} kcal.",
    nutritionHydrationSummary: "Hydratation notée sur {goal} L souhaités.",
    nutritionLatestWeightSummary: "Dernière pesée enregistrée : {date}.",

    voiceMeasurementSaved: "Mesure enregistrée :",
    bmiUnderweight: "Insuffisance",
    bmiNormal: "Normal / Idéal",
    bmiOverweight: "Surpoids léger",
    bmiObese: "Obésité",

    shareLostWeight: "J'ai déjà perdu {weight} kg",
    shareGainedWeight: "J'ai pris {weight} kg de masse",
    shareRegularTracking: "Suivi régulier de ma transformation",
    shareProgressPrefix: "Ma progression physique sur AuraSlim",
    shareProgressSuffix: "Visualisez votre transformation",
    clipboardInaccessible: "Presse-papier inaccessible sur cet appareil.",
    shareVideoTitle: "Ma progression physique AuraSlim",
    shareDirectUnavailable: "Partage direct indisponible. Vous pouvez utiliser WhatsApp, Viber ou copier le lien ci-dessous.",
    shareFileUnavailable: "Partage de fichiers indisponible sur cet appareil. Utilisez WhatsApp, Viber ou copiez le lien ci-dessous.",

    patternConfirmedNotice: "Schéma confirmé. Pensez à exporter vos données régulièrement.",
    patternAccepted: "Schéma accepté.",
    patternLockoutMessage: "Trop de tentatives incorrectes. Réessayez dans 30 secondes.",
    patternRegisteredSuccess: "Schéma confirmé et enregistré sur cet appareil.",
    patternSecurityLockoutTitle: "Verrouillage de sécurité",
    patternLockoutCountdownNotice: "Nombre maximal de tentatives dépassé. Déverrouillage dans :",

    paymentPrepError: "Impossible de préparer le lien Stripe associé à cet appareil. Ouvrez AuraSlim depuis son serveur.",
    nativeAppPaymentNotice: "Les achats natifs nécessitent la solution d'achat de la boutique applicable avant publication mobile.",

    accountWatchConnectDesc: "Associez un appareil Bluetooth compatible pour lire sa batterie ou sa fréquence cardiaque, s'il expose ces données. Les notifications sont envoyées au navigateur ; leur arrivée sur la montre dépend du système du téléphone.",
    connectingStatus: "Connexion…",
    accountWatchPairBtn: "Associer un appareil Bluetooth",
    disconnectBtn: "Déconnecter",
    accountWatchTestBtn: "Tester un rappel sur cet appareil",
    batteryLabel: "Batterie",
    heartRateLabel: "Fréquence cardiaque"
  },
  en: {
    bmiExplTitle: "Understanding Your Body Mass Index (BMI)",
    projectionExplTitle: "4-Week Advantage & Projection",
    targetExplTitle: "Your Target Goal",
    currentExplTitle: "Your Current Weight & Progress",
    progressExplTitle: "Your Overall Progress",
    whoClassificationTitle: "WHO Reference Classification",
    formulaTitle: "Exact Calculation Formula (WHO Standard)",
    projectionDynamic28dDesc: "Forecast calculated based on a sustainable physiological deficit/surplus.",
    reportTitle: "Clinical Health & Nutritionist Report",
    reportSubtitle: "Complete medical summary ready to download and print for your dietitian consultation.",
    reportDownloadBtn: "Download PDF Report",
    reportPrintBtn: "Print Report",
    reportPatientBio: "Patient Identity & Biometric Baseline",
    reportWeightTrend: "Weight Dynamics & Linear Regression",
    reportNutritionSummary: "Nutritional Assessment & Macronutrients",
    reportActivitySummary: "Physical Activity & Smartwatch Telemetry",
    reportDietitianNotes: "Dietitian Observations & Prescriptions",
    reportPractitionerSign: "Practitioner Signature & Official Stamp",
    reportConfidential: "Clinical Nutrition & Metabolic Progress Report - Confidential",
    reportGeneratedOn: "Generated on",
    reportExportSuccess: "Health PDF Report downloaded successfully! Ready for your dietitian.",
    openHealthReport: "Dietitian PDF Report",
    themeModeDark: "Dark",
    themeModeLight: "Light",
    voiceInputTitle: "Voice Measurement Input",
    voiceInputListening: "Listening... Speak now",
    voiceInputHint: "Say e.g.: '72.5 kg, waist 80, 2.5 liters of water'",
    voiceInputStop: "Stop",
    voiceMicTooltip: "Enter with microphone",
    voiceNotSupported: "Speech recognition not supported in this browser.",
    themeFemale: "Feminine",
    themeMale: "Masculine",
    themeNeutral: "Neutral / Universal",
    accountSettingsDesc: "Personalization, universal language, pattern password, and privacy",
    gdprExportSuccess: "Full encrypted GDPR data export downloaded successfully!",
    planActive: "Active",
    planProLifetime: "Lifetime Pro License Activated",
    planProDesc: "Full VIP access: unlimited photos, limitless AI food scanner, and secure cloud.",
    planFreeDesc: "Free mode: 1 photo after initial baseline and 1 photo plate scan.",
    platformLanguage: "Platform Language (Worldwide)",
    platformLanguageDesc: "Choose your preferred language: the entire application instantly adapts.",
    patternPasswordTitle: "Pattern Lock & Encryption",
    patternPasswordDesc: "Your health records and photos are sealed with your secret graphical pattern.",
    modifyPatternBtn: "Change Secret Pattern",
    zeroKnowledgeDesc: "Zero-Knowledge Architecture: Your data is encrypted client-side using PBKDF2 and AES-256.",
    gdprTitle: "Data Portability & GDPR Compliance",
    gdprDesc: "Download all your historical weigh-ins and metrics in open JSON format.",
    gdprExportBtn: "Export My Data (GDPR)",
    deleteBtn: "Delete",
    closeBtn: "Close",
    recentEntries: "Recent entries",
    newEntry: "New weigh-in",
    measuredWeight: "Measured weight",
    weeklyPaceLabel: "Weekly rate:",
    daysLabel: "days",
    goalReachedActive: "Goal reached! Active weight maintenance",
    paceMaintenance: "Pace maintenance in progress",
    statisticalReliability: "Statistical reliability",
    photoSideBySide: "Side-by-Side",
    photoSideBySideUnavailable: "Side-by-side comparison unavailable",
    photoSideBySideUnavailableDesc: "Save at least 2 photos to compare your before / after side by side.",
    photoSelectInitial: "Baseline Photo (Initial)",
    photoSelectRecent: "Recent Photo (Comparison)",
    photoWeightDiff: "Weight Delta",
    photoDaysApart: "Days Apart",

    // Weekly Goals
    weeklyGoalTitle: "Weekly Goals",
    weeklyGoalSubtitle: "Set your weekly target weight and track visual progress in real-time.",
    weeklyGoalSetTarget: "Set Weekly Weight Target",
    weeklyGoalCurrentTarget: "Weekly Target:",
    weeklyGoalProgress: "Weekly Progress",
    weeklyGoalRemaining: "Remaining this week:",
    weeklyGoalAchieved: "Weekly Goal Achieved! 🎉",
    weeklyGoalDaysLeft: "days left until Sunday",
    weeklyGoalPaceNeeded: "Target pace:",
    weeklyGoalPaceMaintenance: "Maintenance phase",
    weeklyGoalEditBtn: "Adjust Target",
    weeklyGoalSaveBtn: "Save Target",
    weeklyGoalPresetGentle: "Gentle (-0.4 kg)",
    weeklyGoalPresetStandard: "Standard (-0.7 kg)",
    weeklyGoalPresetIntense: "Intense (-1.0 kg)",
    weeklyGoalStartWeight: "Week Start",
    weeklyGoalCurrentWeight: "Current Weight",
    weeklyGoalLostThisWeek: "Lost this week",
    weeklyGoalWeekTargetLabel: "Target Weight",
    weeklyGoalTargetReachedNotice: "Congratulations! You crushed your weekly target.",
    weeklyGoalKeepGoingNotice: "Keep up the momentum, you're on track!",

    // Live Camera
    cameraModalTitle: "Live Camera",
    cameraShutter: "Capture Photo",
    cameraSwitchFacing: "Flip Camera",
    cameraRetake: "Retake Photo",
    cameraConfirm: "Confirm Photo",
    cameraPermissionDenied: "Camera access denied. Please allow camera permissions in your browser.",
    cameraPermissionHint: "Unable to start live camera. Please use gallery upload below.",
    cameraUploadGallery: "Choose from Gallery",
    cameraTimer3s: "3s Countdown",
    cameraLive: "Live Camera",
    cameraGallery: "Gallery",
    cameraScalePhoto: "Scale / Weigh-in Photo",
    cameraScalePhotoOptional: "Take photo of your scale display (optional)",
    cameraFoodTitle: "Scan your plate with Live Camera",
    cameraProgressPhotoTitle: "Weekly Body Progress Photo",
    cameraTakeFoodPhoto: "Activate Camera",
    cameraChooseFromGallery: "Photo Gallery",
    nutritionPdfBannerTitle: "Personal Nutrition Report",
    nutritionPdfBannerBadge: "PDF AVAILABLE",
    nutritionPdfBannerDesc: "Review recorded measurements and meals. Estimates do not replace medical advice.",
    nutritionPdfBannerBtn: "Generate Dietitian Report (PDF)",
    periodsOfDayTitle: "Meal Times",
    clickToChooseFoodHint: "Click + to scroll down and pick foods",
    periodBreakfast: "Breakfast",
    periodLunch: "Lunch",
    periodDinner: "Dinner",
    periodSnack: "Snack",
    chooseBtn: "Choose",
    keyOptionScanBadge: "⭐ Key Feature · Instant Scan",
    scanPlateDescription: "Snap a photo of your plate: AI automatically recognizes foods, portions and calories.",
    targetedMealLabel: "Target meal:",
    takePlatePhotoBtn: "📸 Take a photo",
    directBadge: "Direct",
    deviceCameraDesc: "Camera on your smartphone or PC",
    galleryPhotosBtn: "Photo gallery",
    importExistingPhotoDesc: "Import a saved photo",
    foodIdeasFor: "Food suggestions for",
    searchFoodPlaceholder: "Search food...",
    todayLoggedMealsTitle: "Meals logged today",
    totalAlimentsSuffix: "in total",
    noMealsLoggedToday: "No meals logged today. Click the \"+\" button on a meal to begin.",
    mealsHistoryTitle: "Meal History",
    noMealsHistory: "No meals logged yet.",
    photoEvolutionTitle: "Photo Progress",
    photoEvolutionSubtitle: "Day 1 and weigh-in photos saved on this device.",
    addPhotoBtn: "Add a photo",
    generateVideoBtn: "Generate my video",
    galleryCountLabel: "Gallery",
    compareBeforeAfterTitle: "Compare Before & After",
    dragCenterToCompareHint: "Drag the central slider left or right ◀ ▶",
    photoBeforeLabel: "Before photo",
    photoAfterLabel: "After photo",
    badgeAvant: "BEFORE",
    badgeApres: "AFTER",
    dayOneLabel: "Day 1",
    weekAbbrev: "Week",
    freeBadge: "Free",
    premiumBadge: "Premium",
    disclaimerFooter: "AuraSlim · Personal tracker: results and AI analyses are estimates.",
    offersBtn: "Offers",
    newPhotoModalTitle: "New photo",
    newPhotoModalSubtitle: "Front required. Side and back optional.",
    photoAngleFace: "Front",
    photoAngleProfile: "Side",
    photoAngleBackLabel: "Back",
    notesOptionalPlaceholder: "Optional notes",
    cancelBtn: "Cancel",
    saveBtn: "Save",
    unlimitedScanMealOption: "Unlimited AI Meal Scanner Option",
    activateScanOption: "Activate Meal Scan Option (€3.99)",
    plateRecognizedSuccess: "Meal successfully recognized",
    estimatedPortion: "Estimated portion",
    saveMealToLog: "Save this meal to my journal",
    recognizedFoodsAi: "Recognized foods (AI estimate)",
    listenFoods: "Listen to foods",

    photoFitCover: "Fill 100%",
    photoFitContain: "Fit full photo",
    photoWaitingSecond: "After photo coming soon",
    photoWaitingSecondDesc: "Add your next check-in weigh photo to see your before/after transformation side by side.",
    photoTakeSecondBtn: "Add next check-in photo",
    photoFromGallery: "Gallery",
    photoFromCamera: "Camera",
    photoFreeLimitNotice: "Two additional check-in photos included for free after Day 1.",
    photoDragHintBottom: "Slide the center handle left or right ◀ ▶",
    photoDayOne: "Day 1",

    accountSettingsTitle: "Settings & Privacy",
    accountMyPlan: "My Plan",
    accountPlanFree: "Free Discovery",
    accountPlanDesc: "Two check-in photos after Day 1 are included for free. Premium options require Stripe confirmation.",
    accountViewOffersBtn: "View plans from €3.99 and €6.99/mo",
    accountTrialTitle: "AuraSlim Trial Code",
    accountTrialPlaceholder: "Enter trial code",
    accountTrialBtn: "Activate Trial",
    accountTrialSuccess: "Your temporary free trial is now active on this device.",
    accountShareAdminTitle: "Optional Sync with Coach/Admin",
    accountShareAdminDesc: "If enabled, your name, email, phone, country, goal, weigh-ins, meals, calories, hydration and photo count are synced to AuraSlim.",
    accountShareAdminConsent: "Allow coaching sync with server",
    accountLangTitle: "Language & Currency",
    accountLangDesc: "Application language and billing currency, customizable anytime.",
    accountAppLanguage: "Application Language",
    accountCurrency: "Preferred Currency",
    accountStripeNotice: "Actual prices and billing currency are confirmed on Stripe.",
    accountPatternTitle: "App Lock",
    accountPatternDesc: "Optional pattern lock to secure access on this device.",
    accountPatternCreateBtn: "Set or Change Pattern",
    accountPatternLockBtn: "Lock Now",
    accountPatternDisableBtn: "Disable Lock",
    accountWatchTitle: "Smartwatch & Activity",
    bleDisconnected: "Device disconnected.", bleLiveData: "Live heart-rate data received.", bleNoHeartRate: "Connected, but this sensor does not expose the standard heart-rate profile.", bleLiveWeight: "Bluetooth weigh-in received.", bleNoWeight: "Connected, but this scale does not send readings with the standard profile.",
    bleUnnamed: "Bluetooth device", bleConnected: "Bluetooth connected. Displayed data comes from the device.", bleCancelled: "No device selected.", bleConnectError: "Could not connect. Turn on Bluetooth, bring the device closer and try again. Only compatible BLE devices are supported.", bleSyncDone: "Available data refreshed. Live sensors remain active.",
    bleNoBattery: "Connected. This device does not expose a standard battery level.", blePermission: "Allow notifications in your phone settings.", bleReminderBody: "Your AuraSlim reminder is ready.", bleNotificationSent: "Reminder sent to the phone. Watch display depends on system notification settings.", bleNotificationError: "Could not send a reminder on this device.",
    bleDescription: "Connect a BLE heart-rate sensor or scale using a standard Bluetooth profile. Apple, Garmin and Fitbit watches require their official integrations and may not be directly accessible.", bleConnectedBadge: "Connected", bleHeartRateLabel: "Heart rate", bleWeightLabel: "Last weigh-in received", bleBatteryLabel: "Battery", bleSync: "Refresh", blePairHeartRate: "Connect heart-rate sensor", bleHeartRateProfile: "Standard BLE profile: heart rate", blePairScale: "Connect a scale", bleWeightProfile: "Standard BLE profile: weight", bleMirrorHint: "A watch may mirror phone notifications if its companion app allows it.", bleBrowserHint: "Connection requires Bluetooth enabled, an HTTPS or native app, and a compatible BLE device nearby.",
    accountDataTitle: "My Data",
    accountDataDesc: "Photos, weigh-ins and meals remain stored in this browser. Remember to export your data regularly.",
    accountExportBtn: "Export My Data (JSON)",
    accountPdfReportBtn: "View PDF Health Report",
    accountDeleteDataBtn: "Erase All Data",
    accountDeleteDataConfirm: "Permanently delete all your local AuraSlim data on this device?",
    navComposeMeals: "Compose Meals",
    composeMealsSubtitle: "Select your foods, adjust quantities to calculate calories and nutrients according to your goal, and track meal history.",
    mealPortionNotice: "Adjust quantity in grams or ml: calories and macros are recalculated in real time.",
    customDishBtn: "Custom Dish",
    addCustomFoodTitle: "Add a regional specialty dish",
    mealHistoryTitle: "Recorded Meal History",
    mealsLoggedCount: "meals recorded",
    noMealsLoggedYet: "No meals recorded yet. Compose your first meal above!",
    accountGoalRegionTitle: "Body Goal & Regional Culinary Diet",
    accountGoalRegionDesc: "Customize your goal (loss, gain, or maintenance) and geographic region to adapt meals according to foods available in your country.",
    culinaryRegionLabel: "Culinary Region & Local Foods",
    goalChoiceLabel: "Active Weight Goal",
    goalMaintain: "Weight Maintenance",
    accessDashboard: "Access My Dashboard",
    optionalSecurityCode: "Set a security pattern (optional)",

    pdfReportTitle: "Personal Progress Report",
    pdfReportSubtitle: "Your Personal Progress Report",
    pdfStart: "Starting",
    pdfLatest: "Latest Weigh-in",
    pdfChange: "Total Change",
    pdfGoal: "Your Target",
    pdfWeightTrend: "Weight Trend & Check-ins",
    pdfMeasurements: "Measurements & Goals",
    pdfWeightLog: "Weigh-in Log",
    pdfMealLog: "Logged Meals",
    pdfDownloadBtn: "Download PDF Report",
    pdfPreparing: "Preparing PDF Report…",

    notificationAllowed: "Notifications enabled successfully",
    notificationDenied: "Notifications blocked. Please allow them in browser settings.",
    notificationUnsupported: "This browser does not support local notifications.",
    justNow: "Just now",
    reminderNotificationBody: "Time to log your data on AuraSlim Pro!",
    testNotification: "Send test reminder",
    frequencyDaily: "Daily",
    frequencyHourly: "Every {min} min",
    frequencyWeekly: "Every Sunday",

    waterTrackerTitle: "Hydration & Water Intake Tracker",
    waterTargetLabel: "Target",
    waterGoalReached: "Goal Achieved!",
    waterResetDay: "Reset Day",
    waterNoGlassesToday: "No glasses logged today. Click +1 glass to start.",
    waterDeleteEntry: "Delete entry",
    dailyHydrationGoalTitle: "Daily Hydration Goal",
    dailyHydrationGoalDesc: "Recommended: 2.0 to 3.0 Liters per day depending on your weight and activity.",
    litersPerDayUnit: "Liters / day",
    waterLogsTodayTitle: "Today's Water Logs:",
    waterEditGoalTitle: "Edit Water Goal",

    sinceStart: "since start",
    weekAbbrevShort: "wk",
    remainingLabel: "Remaining",
    globalProgress: "Overall progress",
    weeklyStartWeightLabel: "Week start",
    weeklyTargetLabel: "Week target",
    weeklyProgressAchievedTitle: "Progress this week",
    weeklyRemainingLabel: "Remaining to target",
    milestoneStart: "Start",
    milestoneCurrent: "Current",
    milestoneSundayTarget: "Sunday target",
    daysUntilSundayLabel: "days left until Sunday",
    projected4wTitle: "Indicative 4-week projection",
    projected4wSubtitle: "Mathematical extrapolation based on your records, without medical value or guarantee.",
    paceLabel: "Pace:",
    weekUnit: "week",
    projectedWeight28d: "Projected weight in 28 days",
    estimatedGoalDateLabel: "Estimated goal date",
    daysUnit: "days",
    goalAchievedMaintenance: "Goal achieved! Active maintenance",
    maintainingPace: "Maintaining momentum",
    fitR2Label: "Model fit (R²)",
    currentPaceLabel: "Current pace",
    mathExtrapolationDisclaimer: "Mathematical extrapolation based on your records, without medical value or guarantee of result.",
    simulatorAdvantage4wTitle: "4-Week Advantage Simulator (Encouragement)",
    vision28Days: "Vision in 28 days",
    simulatorVisionPrompt: "Visualize today the outcome of your 4-week commitment based on your weekly pace:",
    in4WeeksYouWouldBeAt: "In 4 weeks, you would be at:",
    diffIn28DaysLabel: "in 28 days",
    remainingAfterwardsLabel: "Remaining afterwards:",
    whatToDoToSucceed4w: "What to do to succeed in 4 weeks?",
    actionPlanRule1Title: "Moderate & sustainable caloric deficit:",
    actionPlanRule1Text: "aim for a 300 to 500 kcal/day deficit (or customized daily target). Avoid crash diets that slow down your metabolism.",
    actionPlanRule2Title: "Consistent hydration:",
    actionPlanRule2Text: "drink at least 2.5L of water daily. Drinking before each meal reduces hunger and promotes metabolic elimination.",
    actionPlanRule3Title: "Protein with every meal (1.6g to 2g/kg):",
    actionPlanRule3Text: "preserves muscle mass so every lost pound comes from body fat, not lean muscle.",
    actionPlanRule4Title: "Activity & 8,000 to 10,000 daily steps:",
    actionPlanRule4Text: "brisk daily walking burns 300 to 400 kcal without increasing bodily stress.",
    actionPlanRule5Title: "Regular weigh-in in the morning on an empty stomach:",
    actionPlanRule5Text: "record results without guilt; track the 7-day trend rather than daily water fluctuations.",
    simPaceGentle: "Gentle",
    simPaceIdeal: "Ideal",
    simPaceDynamic: "Dynamic",
    simPaceIntense: "Intense",
    projectionGoalExplanationTitle: "28-Day Projection Calculation Explanation",
    projectionGoalLoseExplanation: "Weight Loss Goal: a healthy, moderate caloric deficit of ~500 kcal/day aims for -0.5 kg per week, or -2.0 kg in 28 days safely without rebound.",
    projectionGoalGainExplanation: "Weight Gain Goal: a controlled caloric surplus of ~300 kcal/day aims for +0.3 kg per week, or +1.2 kg in 28 days of healthy mass.",
    projectionGoalMaintainExplanation: "Maintenance Goal: neutral energy balance to consolidate and stabilize your target weight without fluctuation over the next 28 days.",
    projectedPaceModelLabel: "Pace & Calculation Model",
    understandBmiBtn: "Understand",
    unlockScanPricing: "3 free meals included. Unlock unlimited AI plate scans for 3.99 €/month.",
    unlimitedProgressOption: "Progress Gallery & WebM Video Option",
    unlockProgressPricing: "3 free photos included. Unlock full gallery & WebM video export for 3.99 €/month.",
    activateProgressOption: "Activate Video Option (3.99 €/month)",
    completePackOption: "Auraslim Premium - Unlimited Complete Pack",
    unlockCompletePricing: "Everything unlimited: AI meal scan, photo gallery, progress video, personal PDF report & nutrition plan for 6.99 €/month.",
    activateCompleteOption: "Activate Complete Pack (6.99 €/month)",
    inbodyFreeTrialNotice: "1 official InBody scan included free in trial. Unlock unlimited scans with the Complete Pack.",
    pdfReportFreeTrialNotice: "1 personal PDF report included free in trial. Unlock unlimited reports with the Complete Pack.",
    targetAnalysisTitle: "Target Goal Analysis",
    targetRemainingGap: "Remaining gap",
    targetEstimatedDurationTitle: "Estimated duration based on your pace",
    targetDurationIntro: "To reach the remaining gap healthily:",
    weeksUnit: "weeks",
    perWeekShort: "kg / wk",
    targetGoalSub: "Set target:",
    simulationDynamic28d: "Dynamic 28-day simulation & action plan",
    startWeightShort: "Start",
    currentWeightShort: "Current",
    goalLoseWord: "Weight loss",
    goalGainWord: "Weight gain",
    goalMaintainWord: "Maintenance",
    currentOverviewTitle: "Current Overview",
    sinceStartLabel: "since start",
    currentContinuousAnalysisNotice: "All your recorded weigh-ins are continuously analyzed to calculate your baseline metabolic pace and 28-day projection.",
    progressJourneyAccomplished: "of your journey completed",
    progressDistanceCovered: "You have already covered {percent}% of the distance between your starting weight ({initial} kg) and your target ({target} kg).",
    whoNormNotice: "BMI is the international medical standard established by the World Health Organization (WHO) to assess body mass in adults.",
    yourPositionBadge: "Your status",
    healthyWeightRangeTitle: "Healthy weight range for your height",
    betweenRange: "Between",
    andWord: "and",
    goalInHealthyRange: "✓ Your current goal ({targetWeight} kg) is perfectly within your ideal healthy weight zone!",
    goalOutsideHealthyRange: "Your current goal is {targetWeight} kg. Adjust your nutrition gradually for sustainable health.",
    detailsBtn: "Details",
    simulateBtn: "Simulate",
    activateNowBtn: "I paid — Activate this option",
    activeBadge: "✓ Option active",
    payOnStripeBtn: "Pay on Stripe",
    paymentSuccessNotice: "Option successfully activated! Corresponding features are unlocked.",
    inbodyScanMandatoryNotice: "Mandatory InBody Scan: Please upload or capture your official sheet to generate your complete clinical analysis.",
    inbodyClearPhotoRequired: "Clearer photo required: Please provide a sharp, legible photo of the InBody result sheet for accurate analysis.",
    inbodyMedicalAdviceMandatory: "Advice from a doctor or nutritionist is always mandatory: This assessment and these diet and workout plans are indicative. The advice of a licensed health professional remains mandatory.",
    inbodyWorkoutPlanTitle: "Customized Workout & Training Plan",
    inbodyNutritionPlanTitle: "Tailored Nutrition & Diet Strategy",
    weightHistoryTrendTitle: "Weight history and trend",
    weightChartSubtitle: "Curve of your weigh-ins, from earliest to latest.",
    chartReadingDirection: "Your records read from left to right, earliest to latest.",
    goalLabel: "Target",
    measuredWeightLegend: "Measured weight",
    projection4wLegend: "Projection +4 wks",
    goalLegend: "Target",
    latestWeighInLabel: "Latest weigh-in:",
    todayLabel: "Today",
    weighInsLoggedCount: "logged weigh-ins",
    waistLabel: "Waist",
    bodyFatAbbrev: "BF",
    logWeightSubtitle: "Log your daily metrics manually or directly by voice with the microphone.",
    voiceListeningBadge: "LISTENING",
    dictateBtn: "Dictate",
    voiceStopDictation: "Stop dictation",
    voiceStartDictation: "Enable voice dictation",
    bodyWeightInputLabel: "Body weight (kg) *",
    scalePhotoOrSilhouette: "Scale photo / silhouette",
    optionalBadge: "Optional",
    photoSavedBadge: "Photo saved",
    takeScalePhotoBtn: "Take a weigh-in photo",
    waistInputLabel: "Waist circumference (cm)",
    dictateWaist: "Dictate waist circumference",
    moodGreat: "Great",
    moodGood: "Good",
    moodNeutral: "Fair",
    moodStruggling: "Tough",
    notesLabel: "Notes or feelings",
    dictateNotes: "Dictate notes",
    notesPlaceholder: "Energy, appetite, workout...",
    twoPhotosFreeUsedNotice: "Two complimentary weigh-in photos have been used. Unlock the gallery to snap your next weigh-in.",

    videoStepDayOne: "Registration (Day 1)",
    videoOverlayTitle: "AuraSlim • Progression Video",
    videoOverlaySubtitle: "Photos from your personal journey",
    videoInitialWeightLabel: "Initial starting weight",
    videoVariationLabel: "Delta",
    videoEvolutionLabel: "Progress",
    videoModalTitle: "Morphological Progression Video",
    videoModalSubtitle: "Compiles all your chronological photos from start to present to visualize your body transformation.",
    videoGeneratingText: "Generating and encoding HD video...",
    downloadVideoBtn: "Download my video",
    shareVideoBtn: "Share",
    socialMediaHeading: "Social Media & Messaging",
    copyLinkBtn: "Copy link",
    linkCopiedBadge: "Link copied!",
    shareMoreBtn: "Share...",
    videoShareTip: "💡 Tip: download your video above to post in your Instagram stories, TikTok, or send as a file in WhatsApp / Viber conversations!",
    videoTimelineTitle: "Milestones in video",
    videoPrivacyNotice: "Your photos and video are processed locally in this browser. Export them only when you choose to share.",
    videoLoadingPhoto: "Loading photo...",
    videoCannotLoadPhotoError: "A photo could not be loaded. Please check the gallery before generating the video.",
    videoRecorderNotSupportedError: "This browser does not support WebM video export. You can view your photos below.",
    videoEmptyError: "Generated video is empty. Please try with another browser.",
    videoRecordingError: "Could not record video on this browser.",

    calorieScanDisclaimer: "By launching the scan, you agree that the meal photo is sent to the AI service for nutritional analysis. Body photos are never sent.",
    retryWithThisPhoto: "Retry with this photo",
    aiIdentifyingIngredients: "AI identifying ingredients and macronutrients...",
    mealIdeasDisclaimer: "Over ten ideas per meal; portions and calories are indicative, regional dishes may vary. Verify actual values with a healthcare professional if needed.",
    indicativePortionLabel: "Indicative portion",
    forQuantityLabel: "for entered quantity",
    addToMealTitle: "Add to meal",
    photoOfLoggedMeal: "Photo of logged meal",
    photoDishForMeal: "Photograph plate",
    centerPlateSubtitle: "Center your plate on screen for instant macronutrient estimation",
    foodPhotoIllustrativeDesc: "Real illustrative category photo · indicative portion. Actual dish, recipe and values may vary.",
    photoSourceCommons: "Photo source (Wikimedia Commons, CC0)",
    removeFoodItem: "Remove food item",

    paymentTariffsDesc: "Monthly rates in euros. Please check the exact amount displayed on Stripe based on your account settings.",
    paymentStripeTestNotice: "Stripe test mode: use a test card. No real charge will occur with these links.",
    paymentPayOnStripe: "Pay on Stripe:",
    paymentPreparingLink: "Preparing secure link…",
    paymentCheckoutDisclaimer: "After payment, Stripe automatically returns you to the screen you came from. Your option is activated once payment is verified. AuraSlim does not store your card details.",
    paymentSecureReturn: "Secure payment · automatic return",
    paymentPopupBlocked: "Allow the payment tab to open in your browser, then try again.",
    paymentCancelledNotice: "Payment cancelled. You are back on your previous screen.",
    paymentVerificationPending: "Your payment has not been confirmed yet. Try checking again in a moment.",
    paymentVerifiedStatus: "Subscription verified with Stripe.",
    paymentRetryVerification: "Check payment",
    trackingDayLabel: "Day {day}",

    patternScreenLockDesc: "Local screen lock. Save and backup your data in settings.",

    loadingLocalData: "Loading local data…",
    startingWeightLabel: "Starting weight",
    dayOnePhotoLabel: "Day 1 Photo",
    checkingSubscription: "Checking subscription…",
    remainingPhotosCount: "remaining",
    frontPhotoRequiredError: "A front-facing photo is required for before/after comparison.",

    macroCalories: "Calories",
    nutritionReportTitle: "Personal Nutrition Summary",
    pdfAvailableBadge: "PDF AVAILABLE",
    nutritionReportSubtitle: "Review your recorded metrics and meals. Estimates do not replace medical advice.",
    generateNutritionReportPdf: "Generate Nutritionist PDF Report",
    addAnalyzedPlateToLog: "Save this meal to my journal",
    portionLabel: "Portion",
    scanAiBadge: "AI Scan",
    analyzedDishAlt: "Analyzed plate",
    ingredientsUncertainNotice: "Individual ingredient details are uncertain on this photo; only the overall meal was estimated.",
    plateScanDisclaimer: "Quantities and calories inferred from an image remain approximate.",
    macroTargetLabel: "Target",
    foodsPlural: "foods",
    foodSingular: "food",

    cameraHttpsRequired: "Live camera requires HTTPS and browser permission. Try the phone's native camera or select a photo.",
    cameraUnavailableError: "Unable to activate live video stream. You can take your photo with the camera button or choose a file.",
    cameraActivating: "Activating camera...",
    cameraDirectAccessTitle: "Direct Camera Access Available",
    cameraDirectAccessDesc: "Allow camera in your browser, or use your device's native camera capture.",
    cameraOpenDirectDevice: "📸 Open Direct Camera",
    cameraRetryStream: "Retry stream",
    cameraHowToAuthorize: "How to allow the camera in your browser?",
    cameraHowToAuthorizeStepTitle: "To allow live video stream:",
    cameraHowToAuthorizeStep1: "1. Click the lock 🔒 on the left of the URL address.",
    cameraHowToAuthorizeStep2: "2. Set the Camera permission to Allow.",
    cameraHowToAuthorizeStep3: "3. Click Retry or reload the page.",
    cameraTimerActive: "3s Active",
    cameraTimer: "Timer",
    cameraFacingBack: "Rear",
    cameraFacingFront: "Front",
    cameraTriggerShutter: "Capture",
    cameraDirectNativeTitle: "Direct Camera",
    cameraDirectBadge: "Direct",

    dragSliderLabel: "Drag",

    nutritionMealsLoggedSummary: "{count} food item(s) logged today. Indicative target: {target} kcal.",
    nutritionHydrationSummary: "Hydration logged towards {goal} L target.",
    nutritionLatestWeightSummary: "Latest check-in recorded: {date}.",

    voiceMeasurementSaved: "Measurement recorded:",
    bmiUnderweight: "Underweight",
    bmiNormal: "Normal / Ideal",
    bmiOverweight: "Slight overweight",
    bmiObese: "Obesity",

    shareLostWeight: "I already lost {weight} kg",
    shareGainedWeight: "I gained {weight} kg of lean mass",
    shareRegularTracking: "Consistent progress with my body transformation",
    shareProgressPrefix: "My physical transformation on AuraSlim",
    shareProgressSuffix: "Track your body transformation",
    clipboardInaccessible: "Clipboard inaccessible on this device.",
    shareVideoTitle: "My AuraSlim Physical Progression",
    shareDirectUnavailable: "Direct share unavailable. You can use WhatsApp, Viber or copy the link below.",
    shareFileUnavailable: "File sharing unavailable on this device. Use WhatsApp, Viber or copy the link below.",

    patternConfirmedNotice: "Pattern confirmed. Remember to export your data regularly.",
    patternAccepted: "Pattern accepted.",
    patternLockoutMessage: "Too many incorrect attempts. Retry in 30 seconds.",
    patternRegisteredSuccess: "Pattern confirmed and saved on this device.",
    patternSecurityLockoutTitle: "Security Lock",
    patternLockoutCountdownNotice: "Maximum attempts exceeded. Unlocking in:",

    paymentPrepError: "Unable to prepare Stripe checkout link for this device. Open AuraSlim from its server.",
    nativeAppPaymentNotice: "Native purchases require the in-app purchase system before mobile release.",

    accountWatchConnectDesc: "Pair a compatible Bluetooth device to read its battery or heart rate if exposed. Notifications are delivered to the browser; watch delivery depends on phone settings.",
    connectingStatus: "Connecting…",
    accountWatchPairBtn: "Pair a Bluetooth Device",
    disconnectBtn: "Disconnect",
    accountWatchTestBtn: "Test a reminder on this device",
    batteryLabel: "Battery",
    heartRateLabel: "Heart Rate"
  },
  es: {
    reportTitle: "Informe Clínico y Reporte Nutricional",
    reportSubtitle: "Documento médico completo listo para descargar e imprimir para su consulta dietética.",
    reportDownloadBtn: "Descargar Reporte PDF",
    reportPrintBtn: "Imprimir Informe",
    reportPatientBio: "Identidad del Paciente y Parámetros Biométricos",
    reportWeightTrend: "Dinámica Ponderal y Regresión Lineal",
    reportNutritionSummary: "Evaluación Nutricional y Macronutrientes",
    reportActivitySummary: "Actividad Física y Telemetría del Reloj",
    reportDietitianNotes: "Observaciones y Prescripciones del Nutricionista",
    reportPractitionerSign: "Firma y Sello del Especialista",
    reportConfidential: "Informe Médico de Seguimiento Nutricional y Metabólico - Confidencial",
    reportGeneratedOn: "Generado el",
    reportExportSuccess: "¡Reporte PDF descargado con éxito! Listo para su nutricionista.",
    openHealthReport: "Reporte Nutricionista PDF",
    themeModeDark: "Oscuro",
    themeModeLight: "Claro",
    themeFemale: "Femenino",
    themeMale: "Masculino",
    themeNeutral: "Neutro / Universal",
    accountSettingsDesc: "Personalización, idioma universal, patrón gráfico y privacidad",
    gdprExportSuccess: "¡Exportación RGPD cifrada descargada con éxito!",
    planActive: "Activo",
    planProLifetime: "Licencia Pro de por vida activada",
    planProDesc: "Acceso VIP total: fotos ilimitadas, escáner de comidas con IA y nube segura.",
    planFreeDesc: "Modo gratuito: 1 foto de seguimiento y 1 escaneo de plato por foto.",
    platformLanguage: "Idioma de la Plataforma (Mundial)",
    platformLanguageDesc: "Seleccione su idioma: toda la plataforma se adaptará al instante.",
    patternPasswordTitle: "Patrón Gráfico y Seguridad",
    patternPasswordDesc: "Su sesión y fotos están bloqueadas por su patrón exclusivo.",
    modifyPatternBtn: "Modificar mi patrón secreto",
    zeroKnowledgeDesc: "Cifrado de Conocimiento Cero: Sus datos se cifran con AES-256 y PBKDF2.",
    gdprTitle: "Exportación de Datos y RGPD",
    gdprDesc: "Descargue todo su historial de pesajes y métricas en formato estándar JSON.",
    gdprExportBtn: "Exportar mis datos (RGPD)",
    deleteBtn: "Eliminar",
    closeBtn: "Cerrar",
    recentEntries: "Registros recientes",
    newEntry: "Nuevo pesaje",
    measuredWeight: "Peso medido",
    weeklyPaceLabel: "Ritmo:",
    daysLabel: "días",
    goalReachedActive: "¡Meta alcanzada! Mantenimiento activo",
    paceMaintenance: "Mantenimiento del ritmo en curso",
    statisticalReliability: "Fiabilidad estadística del modelo",
    photoSideBySide: "Lado a Lado",
    photoSideBySideUnavailable: "Comparación lado a lado no disponible",
    photoSideBySideUnavailableDesc: "Guarde al menos 2 fotos para ver su antes y después lado a lado.",
    photoSelectInitial: "Foto Inicial (Referencia)",
    photoSelectRecent: "Foto Reciente (Comparación)",
    photoWeightDiff: "Diferencia de Peso",
    photoDaysApart: "Días de intervalo",

    // Objetivos Semanales
    weeklyGoalTitle: "Objetivos Semanales",
    weeklyGoalSubtitle: "Defina su meta de peso semanal y visualice su progreso en tiempo real.",
    weeklyGoalSetTarget: "Definir meta semanal de peso",
    weeklyGoalCurrentTarget: "Meta de la semana:",
    weeklyGoalProgress: "Progreso semanal",
    weeklyGoalRemaining: "Resta perder esta semana:",
    weeklyGoalAchieved: "¡Objetivo semanal cumplido! 🎉",
    weeklyGoalDaysLeft: "días restantes hasta el domingo",
    weeklyGoalPaceNeeded: "Ritmo aconsejado:",
    weeklyGoalPaceMaintenance: "Fase de mantenimiento",
    weeklyGoalEditBtn: "Ajustar meta",
    weeklyGoalSaveBtn: "Guardar meta",
    weeklyGoalPresetGentle: "Pérdida suave (-0.4 kg)",
    weeklyGoalPresetStandard: "Estándar (-0.7 kg)",
    weeklyGoalPresetIntense: "Intensivo (-1.0 kg)",
    weeklyGoalStartWeight: "Inicio de semana",
    weeklyGoalCurrentWeight: "Peso actual",
    weeklyGoalLostThisWeek: "Perdido esta semana",
    weeklyGoalWeekTargetLabel: "Peso objetivo",
    weeklyGoalTargetReachedNotice: "¡Felicitaciones! Ha alcanzado su objetivo fijado para esta semana.",
    weeklyGoalKeepGoingNotice: "¡Siga adelante con constancia, va por excelente camino!",

    // Cámara en directo
    cameraModalTitle: "Cámara en directo",
    cameraShutter: "Tomar foto",
    cameraSwitchFacing: "Cambiar cámara",
    cameraRetake: "Repetir foto",
    cameraConfirm: "Confirmar foto",
    cameraPermissionDenied: "Permiso de cámara denegado. Active el acceso a la cámara en los ajustes.",
    cameraPermissionHint: "No se pudo iniciar la cámara en directo. Use la galería abajo.",
    cameraUploadGallery: "Elegir de la galería",
    cameraTimer3s: "Temporizador 3s",
    cameraLive: "Cámara en directo",
    cameraGallery: "Galería",
    cameraScalePhoto: "Foto de la báscula",
    cameraScalePhotoOptional: "Foto de la pantalla de su báscula (opcional)",
    cameraFoodTitle: "Escanear plato con cámara en directo",
    cameraProgressPhotoTitle: "Foto de progreso corporal",
    cameraTakeFoodPhoto: "Activar cámara",
    cameraChooseFromGallery: "Galería de fotos"
  },
  de: {
    reportTitle: "Klinischer Gesundheits- & Ernährungsbericht",
    reportSubtitle: "Vollständige medizinische Zusammenfassung zum Herunterladen und Ausdrucken für Ihren Ernährungsberater.",
    reportDownloadBtn: "PDF-Bericht herunterladen",
    reportPrintBtn: "Bericht drucken",
    reportPatientBio: "Patientenprofil & Biometrische Basisdaten",
    reportWeightTrend: "Gewichtsdynamik & Lineare Regression",
    reportNutritionSummary: "Ernährungsbewertung & Makronährstoffe",
    reportActivitySummary: "Körperliche Aktivität & Smartwatch-Telemetrie",
    reportDietitianNotes: "Beobachtungen & Empfehlungen des Ernährungsberaters",
    reportPractitionerSign: "Unterschrift & Stempel des Therapeuten",
    reportConfidential: "Medizinischer Fortschrittsbericht für Ernährung & Stoffwechsel - Vertraulich",
    reportGeneratedOn: "Erstellt am",
    reportExportSuccess: "PDF-Bericht erfolgreich heruntergeladen! Bereit für Ihren Berater.",
    openHealthReport: "Ernährungs-PDF-Bericht",
    themeModeDark: "Dunkel",
    themeModeLight: "Hell",
    themeFemale: "Weiblich",
    themeMale: "Männlich",
    themeNeutral: "Neutral / Universell",
    accountSettingsDesc: "Personalisierung, Sprache, Musterpasswort und Privatsphäre",
    gdprExportSuccess: "Vollständiger DSGVO-Export erfolgreich heruntergeladen!",
    planActive: "Aktiv",
    planProLifetime: "Lebenslange Pro-Lizenz aktiviert",
    planProDesc: "Voller VIP-Zugang: unbegrenzte Fotos, unbegrenzter KI-Scan und Cloud.",
    planFreeDesc: "Kostenloser Modus: 1 Fortschrittsfoto und 1 Mahlzeitenscan.",
    platformLanguage: "Plattform-Sprache (Weltweit)",
    platformLanguageDesc: "Wählen Sie Ihre Sprache: Die gesamte Plattform passt sich sofort an.",
    patternPasswordTitle: "Muster-Passwort & Sicherheit",
    patternPasswordDesc: "Ihre Daten und Fotos sind durch Ihr geheimes grafisches Muster geschützt.",
    modifyPatternBtn: "Geheimes Muster ändern",
    zeroKnowledgeDesc: "Zero-Knowledge-Architektur: Daten werden mit PBKDF2/AES-256 lokal verschlüsselt.",
    gdprTitle: "Datenexport & DSGVO",
    gdprDesc: "Laden Sie Ihren gesamten Verlauf im JSON-Format herunter.",
    gdprExportBtn: "Meine Daten exportieren (DSGVO)",
    deleteBtn: "Löschen",
    closeBtn: "Schließen",
    recentEntries: "Letzte Einträge",
    newEntry: "Neues Wiegen",
    measuredWeight: "Gemessenes Gewicht",
    weeklyPaceLabel: "Tempo:",
    daysLabel: "Tage",
    goalReachedActive: "Ziel erreicht! Aktives Gewichtshalten",
    paceMaintenance: "Gleichmäßiges Tempo aktiv",
    statisticalReliability: "Statistische Zuverlässigkeit",
    photoSideBySide: "Nebeneinander",
    photoSideBySideUnavailable: "Nebeneinander-Vergleich nicht verfügbar",
    photoSideBySideUnavailableDesc: "Speichern Sie mindestens 2 Fotos, um Vorher/Nachher nebeneinander zu vergleichen.",
    photoSelectInitial: "Ausgangsfoto (Referenz)",
    photoSelectRecent: "Aktuelles Foto (Vergleich)",
    photoWeightDiff: "Gewichtsdifferenz",
    photoDaysApart: "Tage Abstand",

    // Wöchentliche Ziele
    weeklyGoalTitle: "Wöchentliche Ziele",
    weeklyGoalSubtitle: "Legen Sie Ihr Wochenziel fest und verfolgen Sie den visuellen Fortschritt in Echtzeit.",
    weeklyGoalSetTarget: "Wöchentliches Gewichtsziel festlegen",
    weeklyGoalCurrentTarget: "Wochenziel:",
    weeklyGoalProgress: "Wöchentlicher Fortschritt",
    weeklyGoalRemaining: "Verbleibend diese Woche:",
    weeklyGoalAchieved: "Wochenziel erreicht! 🎉",
    weeklyGoalDaysLeft: "Tage verbleibend bis Sonntag",
    weeklyGoalPaceNeeded: "Empfohlenes Tempo:",
    weeklyGoalPaceMaintenance: "Gewichtserhaltungsphase",
    weeklyGoalEditBtn: "Ziel anpassen",
    weeklyGoalSaveBtn: "Ziel speichern",
    weeklyGoalPresetGentle: "Sanft (-0.4 kg)",
    weeklyGoalPresetStandard: "Standard (-0.7 kg)",
    weeklyGoalPresetIntense: "Intensiv (-1.0 kg)",
    weeklyGoalStartWeight: "Wochenbeginn",
    weeklyGoalCurrentWeight: "Aktuelles Gewicht",
    weeklyGoalLostThisWeek: "Diese Woche verloren",
    weeklyGoalWeekTargetLabel: "Zielgewicht",
    weeklyGoalTargetReachedNotice: "Herzlichen Glückwunsch! Sie haben Ihr Ziel für diese Woche übertroffen.",
    weeklyGoalKeepGoingNotice: "Bleiben Sie dran, Sie sind auf dem besten Weg!",

    // Live-Kamera
    cameraModalTitle: "Live-Kamera",
    cameraShutter: "Foto aufnehmen",
    cameraSwitchFacing: "Kamera wechseln",
    cameraRetake: "Erneut aufnehmen",
    cameraConfirm: "Foto bestätigen",
    cameraPermissionDenied: "Kamerazugriff verweigert. Bitte erlauben Sie den Kamerazugriff im Browser.",
    cameraPermissionHint: "Live-Kamera konnte nicht gestartet werden. Bitte Galerie nutzen.",
    cameraUploadGallery: "Aus Galerie wählen",
    cameraTimer3s: "3s Selbstauslöser",
    cameraLive: "Live-Kamera",
    cameraGallery: "Galerie",
    cameraScalePhoto: "Foto der Waage",
    cameraScalePhotoOptional: "Foto des Waagen-Displays (optional)",
    cameraFoodTitle: "Teller mit Live-Kamera scannen",
    cameraProgressPhotoTitle: "Wöchentliches Fortschrittsfoto",
    cameraTakeFoodPhoto: "Kamera aktivieren",
    cameraChooseFromGallery: "Fotogalerie"
  },
  it: {
    reportTitle: "Cartella Clinica & Report Nutrizionale",
    reportSubtitle: "Dossier medico completo pronto da scaricare e stampare per la visita nutrizionale.",
    reportDownloadBtn: "Scarica Report PDF",
    reportPrintBtn: "Stampa Report",
    reportPatientBio: "Profilo Paziente & Parametri Biometrici",
    reportWeightTrend: "Dinamica Ponderale & Regressione Lineare",
    reportNutritionSummary: "Bilancio Nutrizionale & Macronutrienti",
    reportActivitySummary: "Attività Fisica & Telemetria Smartwatch",
    reportDietitianNotes: "Osservazioni & Prescrizioni del Nutrizionista",
    reportPractitionerSign: "Firma e Timbro del Medico/Nutrizionista",
    reportConfidential: "Report Clinico di Monitoraggio Nutrizionale - Riservato",
    reportGeneratedOn: "Generato il",
    reportExportSuccess: "Report PDF scaricato con successo! Pronto per il tuo nutrizionista.",
    openHealthReport: "Report Nutrizionista PDF",
    themeModeDark: "Scuro",
    themeModeLight: "Chiaro",
    themeFemale: "Femminile",
    themeMale: "Maschile",
    themeNeutral: "Neutro / Universale",
    accountSettingsDesc: "Personalizzazione, lingua, sequenza grafica e privacy",
    gdprExportSuccess: "Esportazione completa GDPR crittografata scaricata con successo!",
    planActive: "Attivo",
    planProLifetime: "Licenza Pro a Vita Attiva",
    planProDesc: "Accesso VIP completo: foto illimitate, scanner piatti IA illimitato e cloud protetto.",
    planFreeDesc: "Modalità gratuita: 1 foto dopo la foto iniziale e 1 scansione piatto IA.",
    platformLanguage: "Lingua della Piattaforma (Globale)",
    platformLanguageDesc: "Seleziona la tua lingua: l'intera interfaccia si adatta istantaneamente.",
    patternPasswordTitle: "Sequenza Grafica & Sicurezza",
    patternPasswordDesc: "Le tue foto e i tuoi dati sono protetti dalla tua sequenza segreta.",
    modifyPatternBtn: "Modifica sequenza segreta",
    zeroKnowledgeDesc: "Architettura Zero-Knowledge: cifratura client-side AES-256 e PBKDF2.",
    gdprTitle: "Esportazione Dati & Conformità GDPR",
    gdprDesc: "Scarica l'intera cronologia dei tuoi dati e pesate in formato JSON.",
    gdprExportBtn: "Esporta i miei dati (GDPR)",
    deleteBtn: "Elimina",
    closeBtn: "Chiudi",
    recentEntries: "Registrazioni recenti",
    newEntry: "Nuova pesata",
    measuredWeight: "Peso misurato",
    weeklyPaceLabel: "Ritmo:",
    daysLabel: "giorni",
    goalReachedActive: "Obiettivo raggiunto! Mantenimento attivo",
    paceMaintenance: "Mantenimento del ritmo in corso",
    statisticalReliability: "Affidabilità statistica",
    photoSideBySide: "Fianco a Fianco",
    photoSideBySideUnavailable: "Confronto fianco a fianco non disponibile",
    photoSideBySideUnavailableDesc: "Salva almeno 2 foto per confrontare il prima/dopo fianco a fianco.",
    photoSelectInitial: "Foto Iniziale (Riferimento)",
    photoSelectRecent: "Foto Recente (Confronto)",
    photoWeightDiff: "Differenza di Peso",
    photoDaysApart: "Giorni di intervallo",

    // Obiettivi Settimanali
    weeklyGoalTitle: "Obiettivi Settimanali",
    weeklyGoalSubtitle: "Imposta il tuo obiettivo di peso settimanale e osserva i progressi visivi in tempo reale.",
    weeklyGoalSetTarget: "Imposta obiettivo peso della settimana",
    weeklyGoalCurrentTarget: "Obiettivo della settimana:",
    weeklyGoalProgress: "Progresso settimanale",
    weeklyGoalRemaining: "Rimasti da perdere questa settimana:",
    weeklyGoalAchieved: "Obiettivo settimanale raggiunto! 🎉",
    weeklyGoalDaysLeft: "giorni rimasti fino a domenica",
    weeklyGoalPaceNeeded: "Ritmo consigliato:",
    weeklyGoalPaceMaintenance: "Fase di mantenimento",
    weeklyGoalEditBtn: "Regola obiettivo",
    weeklyGoalSaveBtn: "Salva obiettivo",
    weeklyGoalPresetGentle: "Perdita dolce (-0.4 kg)",
    weeklyGoalPresetStandard: "Standard (-0.7 kg)",
    weeklyGoalPresetIntense: "Intensivo (-1.0 kg)",
    weeklyGoalStartWeight: "Inizio settimana",
    weeklyGoalCurrentWeight: "Peso attuale",
    weeklyGoalLostThisWeek: "Persi questa settimana",
    weeklyGoalWeekTargetLabel: "Peso target",
    weeklyGoalTargetReachedNotice: "Congratulazioni! Hai raggiunto il tuo traguardo per questa settimana.",
    weeklyGoalKeepGoingNotice: "Continua con costanza, stai facendo un ottimo lavoro!",

    // Fotocamera live
    cameraModalTitle: "Fotocamera in diretta",
    cameraShutter: "Scatta foto",
    cameraSwitchFacing: "Cambia fotocamera",
    cameraRetake: "Scatta di nuovo",
    cameraConfirm: "Conferma foto",
    cameraPermissionDenied: "Accesso alla fotocamera negato. Consenti la fotocamera nelle impostazioni.",
    cameraPermissionHint: "Impossibile avviare la fotocamera in diretta. Usa la galleria qui sotto.",
    cameraUploadGallery: "Scegli dalla galleria",
    cameraTimer3s: "Autoscatto 3s",
    cameraLive: "Fotocamera in diretta",
    cameraGallery: "Galleria",
    cameraScalePhoto: "Foto della bilancia",
    cameraScalePhotoOptional: "Foto del display della bilancia (opzionale)",
    cameraFoodTitle: "Scansiona il piatto con la fotocamera",
    cameraProgressPhotoTitle: "Foto di evoluzione settimanale",
    cameraTakeFoodPhoto: "Attiva fotocamera",
    cameraChooseFromGallery: "Galleria fotografica"
  },
  pt: {
    reportTitle: "Relatório Clínico e Avaliação Nutricional",
    reportSubtitle: "Documento médico completo pronto para download e impressão para consulta nutricional.",
    reportDownloadBtn: "Baixar Relatório PDF",
    reportPrintBtn: "Imprimir Relatório",
    reportPatientBio: "Identidade do Paciente & Parâmetros Biométricos",
    reportWeightTrend: "Dinâmica Ponderal & Regressão Linear",
    reportNutritionSummary: "Balanço Nutricional & Macronutrientes",
    reportActivitySummary: "Atividade Física & Telemetria do Smartwatch",
    reportDietitianNotes: "Observações & Prescrições do Nutricionista",
    reportPractitionerSign: "Assinatura & Carimbo do Profissional",
    reportConfidential: "Relatório Médico de Acompanhamento Nutricional - Confidencial",
    reportGeneratedOn: "Gerado em",
    reportExportSuccess: "Relatório PDF baixado com sucesso! Pronto para o nutricionista.",
    openHealthReport: "Relatório Nutricional PDF",
    themeModeDark: "Escuro",
    themeModeLight: "Claro",
    themeFemale: "Feminino",
    themeMale: "Masculino",
    themeNeutral: "Neutro / Universal",
    accountSettingsDesc: "Personalização, idioma universal, padrão gráfico e privacidade",
    gdprExportSuccess: "Exportação completa RGPD baixada com sucesso!",
    planActive: "Ativo",
    planProLifetime: "Licença Pro Vitalícia Ativada",
    planProDesc: "Acesso VIP total: fotos ilimitadas, leitor de pratos com IA e nuvem segura.",
    planFreeDesc: "Modo gratuito: 1 foto de acompanhamento e 1 leitura de prato com IA.",
    platformLanguage: "Idioma da Plataforma (Global)",
    platformLanguageDesc: "Selecione seu idioma: toda a plataforma se ajusta instantaneamente.",
    patternPasswordTitle: "Padrão Gráfico e Segurança",
    patternPasswordDesc: "Suas fotos e métricas estão protegidas pelo seu padrão exclusivo.",
    modifyPatternBtn: "Alterar padrão secreto",
    zeroKnowledgeDesc: "Arquitetura Zero-Knowledge: Criptografia de ponta a ponta com AES-256.",
    gdprTitle: "Exportação de Dados & RGPD",
    gdprDesc: "Baixe todo o histórico de pesagens em formato padrão JSON.",
    gdprExportBtn: "Exportar meus dados (RGPD)",
    deleteBtn: "Excluir",
    closeBtn: "Fechar",
    recentEntries: "Registros recentes",
    newEntry: "Nova pesagem",
    measuredWeight: "Peso medido",
    weeklyPaceLabel: "Ritmo:",
    daysLabel: "dias",
    goalReachedActive: "Objetivo atingido! Manutenção ativa",
    paceMaintenance: "Manutenção do ritmo em andamento",
    statisticalReliability: "Confiabilidade estatística",
    photoSideBySide: "Lado a Lado",
    photoSideBySideUnavailable: "Comparação lado a lado indisponível",
    photoSideBySideUnavailableDesc: "Salve pelo menos 2 fotos para comparar seu antes e depois lado a lado.",
    photoSelectInitial: "Foto Inicial (Referência)",
    photoSelectRecent: "Foto Recente (Comparação)",
    photoWeightDiff: "Diferença de Peso",
    photoDaysApart: "Dias de intervalo",

    // Metas Semanais
    weeklyGoalTitle: "Metas Semanais",
    weeklyGoalSubtitle: "Defina sua meta de peso para a semana e acompanhe seu progresso visual em tempo real.",
    weeklyGoalSetTarget: "Definir meta semanal de peso",
    weeklyGoalCurrentTarget: "Meta da semana:",
    weeklyGoalProgress: "Progresso semanal",
    weeklyGoalRemaining: "Falta perder esta semana:",
    weeklyGoalAchieved: "Meta semanal alcançada! 🎉",
    weeklyGoalDaysLeft: "dias restantes até domingo",
    weeklyGoalPaceNeeded: "Ritmo recomendado:",
    weeklyGoalPaceMaintenance: "Fase de manutenção",
    weeklyGoalEditBtn: "Ajustar meta",
    weeklyGoalSaveBtn: "Salvar meta",
    weeklyGoalPresetGentle: "Perda suave (-0.4 kg)",
    weeklyGoalPresetStandard: "Padrão (-0.7 kg)",
    weeklyGoalPresetIntense: "Intensivo (-1.0 kg)",
    weeklyGoalStartWeight: "Início da semana",
    weeklyGoalCurrentWeight: "Peso atual",
    weeklyGoalLostThisWeek: "Perdido esta semana",
    weeklyGoalWeekTargetLabel: "Peso alvo",
    weeklyGoalTargetReachedNotice: "Parabéns! Você atingiu sua meta fixada para esta semana.",
    weeklyGoalKeepGoingNotice: "Continue firme, você está no caminho certo!",

    // Câmera ao vivo
    cameraModalTitle: "Câmera ao vivo",
    cameraShutter: "Tirar foto",
    cameraSwitchFacing: "Inverter câmera",
    cameraRetake: "Tirar outra",
    cameraConfirm: "Confirmar foto",
    cameraPermissionDenied: "Acesso à câmera negado. Ative a câmera nas configurações.",
    cameraPermissionHint: "Não foi possível abrir a câmera ao vivo. Use a galeria abaixo.",
    cameraUploadGallery: "Escolher da galeria",
    cameraTimer3s: "Temporizador 3s",
    cameraLive: "Câmera ao vivo",
    cameraGallery: "Galeria",
    cameraScalePhoto: "Foto da balança",
    cameraScalePhotoOptional: "Foto do visor da balança (opcional)",
    cameraFoodTitle: "Escanear prato com a câmera",
    cameraProgressPhotoTitle: "Foto de evolução semanal",
    cameraTakeFoodPhoto: "Ativar câmera",
    cameraChooseFromGallery: "Galeria de fotos"
  },
  ar: {
    reportTitle: "التقرير الصحي وخطة أخصائي التغذية",
    reportSubtitle: "تقرير طبي شامل جاهز للتحميل والطباعة لتقديمه لأخصائي التغذية الخاص بك.",
    reportDownloadBtn: "تحميل تقرير PDF",
    reportPrintBtn: "طباعة التقرير",
    reportPatientBio: "بيانات المريض والقياسات الحيوية",
    reportWeightTrend: "تطور الوزن والانحدار الخطي",
    reportNutritionSummary: "التقييم الغذائي والمغذيات الكبرى",
    reportActivitySummary: "النشاط البدني وبيانات الساعة الذكية",
    reportDietitianNotes: "ملاحظات وإرشادات أخصائي التغذية",
    reportPractitionerSign: "توقيع وختم الطبيب أو الأخصائي",
    reportConfidential: "تقرير متابعة غذائية واستقلابية سري للغاية",
    reportGeneratedOn: "تاريخ الإصدار",
    reportExportSuccess: "تم تنزيل تقرير PDF بنجاح! جاهز لأخصائي التغذية.",
    openHealthReport: "تقرير أخصائي التغذية PDF",
    themeModeDark: "داكن",
    themeModeLight: "فاتح",
    themeFemale: "أنثوي",
    themeMale: "ذكوري",
    themeNeutral: "محايد / شامل",
    accountSettingsDesc: "التخصيص، اللغة العالمية، كلمة المرور الرسومية والأمان",
    gdprExportSuccess: "تم تنزيل النسخة المشفرة لحماية البيانات بنجاح!",
    planActive: "نشط",
    planProLifetime: "اشتراك Pro مدى الحياة مفعل",
    planProDesc: "وصول غير محدود: صور غير محدودة، ماسح ذكاء اصطناعي وسحابة مشفرة.",
    planFreeDesc: "الوضع المجاني: صورة واحدة بعد البداية وفحص وجبة واحد.",
    platformLanguage: "لغة المنصة (العالم بأكمله)",
    platformLanguageDesc: "اختر لغتك المفضلة: يتغير التطبيق بالكامل فورياً دون استثناء.",
    patternPasswordTitle: "النمط الرسومي والأمان",
    patternPasswordDesc: "جلساتك وصورك مؤمنة بالكامل بنمطك السري الخاص.",
    modifyPatternBtn: "تعديل النمط السري",
    zeroKnowledgeDesc: "أمان كامل بدون معرفة: البيانات مشفرة محلياً بواسطة AES-256.",
    gdprTitle: "تصدير البيانات والخصوصية",
    gdprDesc: "قم بتنزيل كافة بيانات الوزن والسجلات بصيغة JSON.",
    gdprExportBtn: "تصدير بياناتي",
    deleteBtn: "حذف",
    closeBtn: "إغلاق",
    recentEntries: "السجلات الحديثة",
    newEntry: "تسجيل وزن جديد",
    measuredWeight: "الوزن المسجل",
    weeklyPaceLabel: "المعدل الأسبوعي:",
    daysLabel: "أيام",
    goalReachedActive: "تم الوصول إلى الهدف! مرحلة التثبيت",
    paceMaintenance: "الحفاظ على المعدل مستمر",
    statisticalReliability: "الدقة الإحصائية للنموذج",
    photoSideBySide: "جنباً إلى جنب",
    photoSideBySideUnavailable: "المقارنة جنباً إلى جنب غير متاحة",
    photoSideBySideUnavailableDesc: "سجل صورتين على الأقل لمقارنة قبل وبعد جنباً إلى جنب.",
    photoSelectInitial: "الصورة الأولية (المرجع)",
    photoSelectRecent: "الصورة الحديثة (المقارنة)",
    photoWeightDiff: "فرق الوزن",
    photoDaysApart: "الفارق بالأيام",

    // الأهداف الأسبوعية
    weeklyGoalTitle: "الأهداف الأسبوعية",
    weeklyGoalSubtitle: "حدد هدف وزنك لهذا الأسبوع وتابع تقدمك بصرياً في الوقت الفعلي.",
    weeklyGoalSetTarget: "تحديد وزن الهدف للأسبوع",
    weeklyGoalCurrentTarget: "هدف هذا الأسبوع:",
    weeklyGoalProgress: "التقدم الأسبوعي",
    weeklyGoalRemaining: "المتبقي خسارته هذا الأسبوع:",
    weeklyGoalAchieved: "تم تحقيق الهدف الأسبوعي بنجاح! 🎉",
    weeklyGoalDaysLeft: "أيام متبقية حتى يوم الأحد",
    weeklyGoalPaceNeeded: "المعدل المطلوب:",
    weeklyGoalPaceMaintenance: "مرحلة التثبيت",
    weeklyGoalEditBtn: "تعديل الهدف",
    weeklyGoalSaveBtn: "حفظ الهدف",
    weeklyGoalPresetGentle: "خسارة هادئة (-0.4 كغ)",
    weeklyGoalPresetStandard: "قياسي (-0.7 كغ)",
    weeklyGoalPresetIntense: "مكثف (-1.0 كغ)",
    weeklyGoalStartWeight: "بداية الأسبوع",
    weeklyGoalCurrentWeight: "الوزن الحالي",
    weeklyGoalLostThisWeek: "المفقود هذا الأسبوع",
    weeklyGoalWeekTargetLabel: "الوزن المستهدف",
    weeklyGoalTargetReachedNotice: "تهانينا! لقد حققت هدفك المحدد لهذا الأسبوع.",
    weeklyGoalKeepGoingNotice: "واصل مجهودك، أنت تسير على الطريق الصحيح تماماً!",

    // الكاميرا المباشرة
    cameraModalTitle: "الكاميرا المباشرة",
    cameraShutter: "التقاط الصورة",
    cameraSwitchFacing: "تبديل الكاميرا",
    cameraRetake: "إعادة الالتقاط",
    cameraConfirm: "تأكيد الصورة",
    cameraPermissionDenied: "تم رفض الوصول إلى الكاميرا. يرجى تفعيل إذن الكاميرا في المتصفح.",
    cameraPermissionHint: "تعذر تشغيل الكاميرا المباشرة. يرجى اختيار صورة من المعرض.",
    cameraUploadGallery: "اختيار من المعرض",
    cameraTimer3s: "مؤقت 3 ثوانٍ",
    cameraLive: "الكاميرا المباشرة",
    cameraGallery: "المعرض",
    cameraScalePhoto: "صورة شاشة الميزان",
    cameraScalePhotoOptional: "تصوير شاشة الميزان (اختياري)",
    cameraFoodTitle: "مسح الوجبة بالكاميرا المباشرة",
    cameraProgressPhotoTitle: "صورة تطور الجسم الأسبوعية",
    cameraTakeFoodPhoto: "تشغيل الكاميرا",
    cameraChooseFromGallery: "معرض الصور"
  },
  zh: {
    reportTitle: "临床健康与营养师报告",
    reportSubtitle: "完整的临床医学与营养总结，随时可下载和打印以供营养师咨询。",
    reportDownloadBtn: "下载PDF健康报告",
    reportPrintBtn: "打印健康报告",
    reportPatientBio: "患者个人资料与生物学指标",
    reportWeightTrend: "体重演变趋势与线性回归分析",
    reportNutritionSummary: "营养摄入与宏量营养素平衡",
    reportActivitySummary: "日常运动量与智能手表数据",
    reportDietitianNotes: "营养师观察分析与膳食处方",
    reportPractitionerSign: "专业医师/营养师签名盖章",
    reportConfidential: "临床营养与新陈代谢跟踪医疗报告 - 严格保密",
    reportGeneratedOn: "生成日期",
    reportExportSuccess: "PDF健康报告下载成功！可随时提供给营养师。",
    openHealthReport: "营养师PDF报告",
    themeModeDark: "暗色",
    themeModeLight: "亮色",
    themeFemale: "女士优雅",
    themeMale: "男士动感",
    themeNeutral: "中性极简",
    accountSettingsDesc: "个性化设置、全球语言支持、图形手势密码与隐私安全",
    gdprExportSuccess: "全量加密个人隐私数据导出成功！",
    planActive: "已激活",
    planProLifetime: "终身专业版VIP已激活",
    planProDesc: "享受完整VIP权益：无限进度照片对比、无限AI食物扫描以及加密云端备份。",
    planFreeDesc: "免费模式：仅支持1张初始对比照片与1次AI餐盘扫描。",
    platformLanguage: "平台系统语言 (全球通用)",
    platformLanguageDesc: "选择您的首选语言：整个平台各处细节立即全部切换。",
    patternPasswordTitle: "手势图形锁与数据加密",
    patternPasswordDesc: "您的敏感照片与身体测量数据均由私密图形手势锁保护。",
    modifyPatternBtn: "修改私密图形密码",
    zeroKnowledgeDesc: "零知识架构：所有照片与健康数据均采用PBKDF2与AES-256进行本地端到端加密。",
    gdprTitle: "数据迁移与隐私合规 (GDPR)",
    gdprDesc: "以标准JSON格式下载您所有的称重历史与健康监测指标。",
    gdprExportBtn: "导出我的数据 (GDPR)",
    deleteBtn: "删除",
    closeBtn: "关闭",
    recentEntries: "近期称重记录",
    newEntry: "记录新体重",
    measuredWeight: "测量体重",
    weeklyPaceLabel: "每周速率：",
    daysLabel: "天",
    goalReachedActive: "目标达成！正在保持体重",
    paceMaintenance: "稳定减重进行中",
    statisticalReliability: "模型统计可靠度",
    photoSideBySide: "并排对比",
    photoSideBySideUnavailable: "无法使用并排对比",
    photoSideBySideUnavailableDesc: "请至少保存2张照片以进行前后并排视觉对比。",
    photoSelectInitial: "初始基准照片",
    photoSelectRecent: "近期进展照片",
    photoWeightDiff: "体重变化差值",
    photoDaysApart: "间隔天数",

    // 每周目标
    weeklyGoalTitle: "每周减重目标",
    weeklyGoalSubtitle: "设定本周目标体重，并在主题进度条中实时查看完成情况。",
    weeklyGoalSetTarget: "设定本周目标体重",
    weeklyGoalCurrentTarget: "本周目标：",
    weeklyGoalProgress: "本周进度",
    weeklyGoalRemaining: "本周尚需减重：",
    weeklyGoalAchieved: "本周目标圆满达成！🎉",
    weeklyGoalDaysLeft: "距离周日还剩天数",
    weeklyGoalPaceNeeded: "建议速率：",
    weeklyGoalPaceMaintenance: "稳固维持期",
    weeklyGoalEditBtn: "调整目标",
    weeklyGoalSaveBtn: "保存目标",
    weeklyGoalPresetGentle: "温和减脂 (-0.4 kg)",
    weeklyGoalPresetStandard: "标准计划 (-0.7 kg)",
    weeklyGoalPresetIntense: "高效冲刺 (-1.0 kg)",
    weeklyGoalStartWeight: "周初基准",
    weeklyGoalCurrentWeight: "当前体重",
    weeklyGoalLostThisWeek: "本周已减",
    weeklyGoalWeekTargetLabel: "目标体重",
    weeklyGoalTargetReachedNotice: "太棒了！您已成功达成这周的预定目标。",
    weeklyGoalKeepGoingNotice: "坚持就是胜利，您的进展非常顺利！",

    // 实时相机
    cameraModalTitle: "实时相机拍摄",
    cameraShutter: "拍照",
    cameraSwitchFacing: "切换镜头",
    cameraRetake: "重新拍摄",
    cameraConfirm: "确认使用照片",
    cameraPermissionDenied: "相机权限被拒绝，请在浏览器设置中开启相机权限。",
    cameraPermissionHint: "无法启动实时相机，请使用下方图库选择照片。",
    cameraUploadGallery: "从相册中选择",
    cameraTimer3s: "3秒倒计时",
    cameraLive: "实时相机",
    cameraGallery: "相册",
    cameraScalePhoto: "体重秤屏幕照片",
    cameraScalePhotoOptional: "拍摄体重秤显示屏（选填）",
    cameraFoodTitle: "实时相机扫描餐盘",
    cameraProgressPhotoTitle: "每周身材蜕变对比照片",
    cameraTakeFoodPhoto: "开启相机",
    cameraChooseFromGallery: "照片图库"
  },
  ja: {
    reportTitle: "臨床健康・栄養管理レポート",
    reportSubtitle: "栄養士や医師への提示に適した、ダウンロード・印刷可能な公式健康レポートです。",
    reportDownloadBtn: "PDFレポートをダウンロード",
    reportPrintBtn: "レポートを印刷",
    reportPatientBio: "患者プロフィール・生体指標",
    reportWeightTrend: "体重変化の動態と線形回帰予測",
    reportNutritionSummary: "栄養バランス・三大栄養素",
    reportActivitySummary: "身体活動・スマートウォッチ計測値",
    reportDietitianNotes: "管理栄養士の所見・指導記録",
    reportPractitionerSign: "担当医師／栄養士 署名・捺印欄",
    reportConfidential: "栄養代謝モニタリング臨床報告書（機密扱い）",
    reportGeneratedOn: "発行日",
    reportExportSuccess: "PDF健康レポートをダウンロードしました！栄養士への提出用にご活用ください。",
    openHealthReport: "栄養士向けPDFレポート",
    themeModeDark: "ダーク",
    themeModeLight: "ライト",
    themeFemale: "フェミニン",
    themeMale: "マスキュリン",
    themeNeutral: "ニュートラル / ユニバーサル",
    accountSettingsDesc: "カスタマイズ、多言語切り替え、パターンロック、セキュリティ",
    gdprExportSuccess: "暗号化された全履歴データを正常にエクスポートしました！",
    planActive: "有効",
    planProLifetime: "永久Proライセンス適用中",
    planProDesc: "無制限の写真保存、AI食事解析スキャナー、安全なクラウド同期が利用可能です。",
    planFreeDesc: "無料プラン：初期写真以降1枚の比較写真と1回のAI食事スキャン。",
    platformLanguage: "プラットフォーム言語（全世界対応）",
    platformLanguageDesc: "ご希望の言語を選択してください。画面全体の細部まですべて切り替わります。",
    patternPasswordTitle: "グラフィカルパターンロック＆暗号化",
    patternPasswordDesc: "大切な体型写真や体重データはあなただけの秘密パターンで保護されます。",
    modifyPatternBtn: "秘密パターンを変更",
    zeroKnowledgeDesc: "ゼロナレッジ暗号化：PBKDF2とAES-256により端末内で完全に暗号化されます。",
    gdprTitle: "データエクスポート＆GDPR準拠",
    gdprDesc: "すべての体重記録と指標を標準JSONフォーマットで書き出します。",
    gdprExportBtn: "データをエクスポート (GDPR)",
    deleteBtn: "削除",
    closeBtn: "閉じる",
    recentEntries: "最近の測定記録",
    newEntry: "体重を記録",
    measuredWeight: "測定体重",
    weeklyPaceLabel: "ペース：",
    daysLabel: "日",
    goalReachedActive: "目標達成！アクティブ維持中",
    paceMaintenance: "順調な減量ペースを維持中",
    statisticalReliability: "予測モデルの信頼度",
    photoSideBySide: "並べて比較",
    photoSideBySideUnavailable: "並べて比較は利用できません",
    photoSideBySideUnavailableDesc: "変化を並べて確認するには、少なくとも2枚の写真を登録してください。",
    photoSelectInitial: "開始時写真（基準）",
    photoSelectRecent: "最近の写真（比較）",
    photoWeightDiff: "体重差",
    photoDaysApart: "撮影間隔日数",

    // 週間目標
    weeklyGoalTitle: "週間目標",
    weeklyGoalSubtitle: "今週の目標体重を設定し、テーマに合わせたプログレスバーで達成度を確認できます。",
    weeklyGoalSetTarget: "今週の目標体重を設定",
    weeklyGoalCurrentTarget: "今週の目標：",
    weeklyGoalProgress: "週間進捗率",
    weeklyGoalRemaining: "今週の残り減量目標：",
    weeklyGoalAchieved: "今週の目標を達成しました！🎉",
    weeklyGoalDaysLeft: "日曜日までの残り日数",
    weeklyGoalPaceNeeded: "推奨ペース：",
    weeklyGoalPaceMaintenance: "維持期",
    weeklyGoalEditBtn: "目標を調整",
    weeklyGoalSaveBtn: "目標を保存",
    weeklyGoalPresetGentle: "ゆるやか減量 (-0.4 kg)",
    weeklyGoalPresetStandard: "標準プラン (-0.7 kg)",
    weeklyGoalPresetIntense: "集中シェイプ (-1.0 kg)",
    weeklyGoalStartWeight: "週初め体重",
    weeklyGoalCurrentWeight: "現在の体重",
    weeklyGoalLostThisWeek: "今週の減少分",
    weeklyGoalWeekTargetLabel: "目標体重",
    weeklyGoalTargetReachedNotice: "おめでとうございます！今週の目標を見事クリアしました。",
    weeklyGoalKeepGoingNotice: "この調子で続けていきましょう！順調に進んでいます。",

    // ライブカメラ
    cameraModalTitle: "ライブカメラ撮影",
    cameraShutter: "撮影する",
    cameraSwitchFacing: "カメラ切替",
    cameraRetake: "撮り直す",
    cameraConfirm: "この写真を使う",
    cameraPermissionDenied: "カメラへのアクセスが拒否されました。設定でカメラを許可してください。",
    cameraPermissionHint: "ライブカメラを起動できませんでした。下のギャラリーをご利用ください。",
    cameraUploadGallery: "写真フォルダから選択",
    cameraTimer3s: "3秒タイマー",
    cameraLive: "ライブカメラ",
    cameraGallery: "写真フォルダ",
    cameraScalePhoto: "体重計ディスプレイ写真",
    cameraScalePhotoOptional: "体重計の数値を撮影（任意）",
    cameraFoodTitle: "食事をライブカメラでスキャン",
    cameraProgressPhotoTitle: "週間体型記録写真",
    cameraTakeFoodPhoto: "カメラ起動",
    cameraChooseFromGallery: "写真ライブラリ"
  },
  ru: {
    reportTitle: "Медицинский отчет и заключение нутрициолога",
    reportSubtitle: "Полный медицинский отчет, готовый к скачиванию и печати для консультации с нутрициологом.",
    reportDownloadBtn: "Скачать отчет в PDF",
    reportPrintBtn: "Распечатать отчет",
    reportPatientBio: "Данные пациента и биометрические параметры",
    reportWeightTrend: "Динамика веса и линейная регрессия",
    reportNutritionSummary: "Оценка питания и баланс БЖУ",
    reportActivitySummary: "Физическая активность и данные смарт-часов",
    reportDietitianNotes: "Заключение и рекомендации нутрициолога",
    reportPractitionerSign: "Подпись и печать специалиста",
    reportConfidential: "Медицинский отчет мониторинга питания и метаболизма - Конфиденциально",
    reportGeneratedOn: "Дата составления",
    reportExportSuccess: "Отчет в формате PDF успешно скачан! Готов к показу нутрициологу.",
    openHealthReport: "Отчет для нутрициолога PDF",
    themeModeDark: "Темная",
    themeModeLight: "Светлая",
    themeFemale: "Женский",
    themeMale: "Мужской",
    themeNeutral: "Нейтральный / Универсальный",
    accountSettingsDesc: "Персонализация, выбор языка, графический ключ и безопасность",
    gdprExportSuccess: "Полный зашифрованный архив данных успешно скачан!",
    planActive: "Активен",
    planProLifetime: "Пожизненная лицензия Pro активирована",
    planProDesc: "Полный VIP-доступ: безлимитные фото, сканирование блюд через ИИ и облако.",
    planFreeDesc: "Бесплатный режим: 1 фото после начального и 1 сканирование блюда.",
    platformLanguage: "Язык интерфейса платформы (Весь мир)",
    platformLanguageDesc: "Выберите нужный язык: абсолютно все разделы и детали моментально переключатся.",
    patternPasswordTitle: "Графический ключ и защита данных",
    patternPasswordDesc: "Ваш сеанс и фото надежно заблокированы секретным графическим ключом.",
    modifyPatternBtn: "Изменить графический ключ",
    zeroKnowledgeDesc: "Архитектура Zero-Knowledge: фото и параметры шифруются по стандарту AES-256.",
    gdprTitle: "Экспорт данных и защита конфиденциальности",
    gdprDesc: "Скачайте всю историю взвешиваний и измерений в стандартном формате JSON.",
    gdprExportBtn: "Экспорт моих данных (GDPR)",
    deleteBtn: "Удалить",
    closeBtn: "Закрыть",
    recentEntries: "Последние записи",
    newEntry: "Новое взвешивание",
    measuredWeight: "Измеренный вес",
    weeklyPaceLabel: "Темп:",
    daysLabel: "дн.",
    goalReachedActive: "Цель достигнута! Поддержание формы",
    paceMaintenance: "Стабильный темп снижения веса",
    statisticalReliability: "Надежность модели прогноза",
    photoSideBySide: "Рядом друг с другом",
    photoSideBySideUnavailable: "Сравнение бок о бок недоступно",
    photoSideBySideUnavailableDesc: "Сохраните минимум 2 фото для наглядного сравнения до и после.",
    photoSelectInitial: "Исходное фото (База)",
    photoSelectRecent: "Свежее фото (Сравнение)",
    photoWeightDiff: "Разница в весе",
    photoDaysApart: "Интервал в днях",

    // Еженедельные цели
    weeklyGoalTitle: "Еженедельные цели",
    weeklyGoalSubtitle: "Установите целевой вес на неделю и отслеживайте прогресс на тематической шкале.",
    weeklyGoalSetTarget: "Задать целевой вес на неделю",
    weeklyGoalCurrentTarget: "Цель на эту неделю:",
    weeklyGoalProgress: "Прогресс за неделю",
    weeklyGoalRemaining: "Осталось сбросить на этой неделе:",
    weeklyGoalAchieved: "Цель недели успешно достигнута! 🎉",
    weeklyGoalDaysLeft: "дней осталось до воскресенья",
    weeklyGoalPaceNeeded: "Рекомендуемый темп:",
    weeklyGoalPaceMaintenance: "Фаза удержания веса",
    weeklyGoalEditBtn: "Изменить цель",
    weeklyGoalSaveBtn: "Сохранить цель",
    weeklyGoalPresetGentle: "Мягкое снижение (-0.4 кг)",
    weeklyGoalPresetStandard: "Стандарт (-0.7 кг)",
    weeklyGoalPresetIntense: "Интенсив (-1.0 кг)",
    weeklyGoalStartWeight: "Старт недели",
    weeklyGoalCurrentWeight: "Текущий вес",
    weeklyGoalLostThisWeek: "Сброшено за неделю",
    weeklyGoalWeekTargetLabel: "Целевой вес",
    weeklyGoalTargetReachedNotice: "Поздравляем! Вы успешно достигли цели, поставленной на эту неделю.",
    weeklyGoalKeepGoingNotice: "Продолжайте в том же духе, вы движетесь в отличном темпе!",

    // Прямая камера
    cameraModalTitle: "Прямая съемка с камеры",
    cameraShutter: "Сделать снимок",
    cameraSwitchFacing: "Переключить камеру",
    cameraRetake: "Переснять",
    cameraConfirm: "Использовать фото",
    cameraPermissionDenied: "Доступ к камере заблокирован. Разрешите доступ в настройках браузера.",
    cameraPermissionHint: "Не удалось запустить камеру. Используйте галерею ниже.",
    cameraUploadGallery: "Выбрать из галереи",
    cameraTimer3s: "Таймер 3 сек",
    cameraLive: "Прямая камера",
    cameraGallery: "Галерея",
    cameraScalePhoto: "Фото экрана весов",
    cameraScalePhotoOptional: "Сфотографировать дисплей весов (необязательно)",
    cameraFoodTitle: "Сканировать блюдо живой камерой",
    cameraProgressPhotoTitle: "Еженедельное фото прогресса",
    cameraTakeFoodPhoto: "Включить камеру",
    cameraChooseFromGallery: "Галерея фото"
  }
};

const externalTranslationsRegistry: Record<string, Partial<TranslationDictionary>> = {
  es: esTranslations,
  de: deTranslations,
  it: itTranslations,
  pt: ptTranslations,
  ar: arTranslations,
  ru: ruTranslations,
  zh: zhTranslations,
  ja: jaTranslations,
  tr: trTranslations,
};

/**
 * Returns a complete, fully populated TranslationDictionary for the given language.
 * Merges base French or English with the requested language and universal additions,
 * ensuring no key is EVER undefined.
 */
export function getTranslation(code: LanguageCode): TranslationDictionary & OnboardingDictionary & ReturnType<typeof goalCopy> {
  const isFrench = code === 'fr';
  const baseDefault = isFrench ? translations.fr : translations.en;
  const baseAdditions = isFrench ? universalLanguageAdditions.fr : universalLanguageAdditions.en;
  const langSpecific = translations[code] || translations.en || {};
  const additions = universalLanguageAdditions[code] || universalLanguageAdditions.en || {};
  const ext = externalTranslationsRegistry[code] || {};
  const baseOnboarding = isFrench ? onboardingStrings.fr : (onboardingStrings.en || onboardingStrings.fr);
  const localizedOnboarding = (onboardingStrings as Record<string, OnboardingDictionary>)[code] || {};
  return {
    ...baseDefault,
    ...baseAdditions,
    ...langSpecific,
    ...additions,
    ...ext,
    ...baseOnboarding,
    ...localizedOnboarding,
    ...goalCopy(code),
    ...(translatedDictionaries[code] || {})
  };
}

const translatedDictionaries: Record<string, Partial<TranslationDictionary & OnboardingDictionary>> = {};
export const hasTranslatedDictionary = (code: string) => !!translatedDictionaries[code];
export function setTranslatedDictionary(code: string, dictionary: Partial<TranslationDictionary & OnboardingDictionary>) {
  translatedDictionaries[code] = dictionary;
}
