import {generateGoalPhoto} from '../services/goalPhoto';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Globe2, Image as ImageIcon, Moon, Sun, Sparkles } from 'lucide-react';
import { getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import type { UserProfile, LanguageCode, WeightGoalType } from '../types';
import type { ColorMode } from '../services/theme';
import { getTheme } from '../services/theme';
import { countryOptionsForLanguage, deviceCountry } from '../services/locales';
import { useAvailableLanguages } from '../hooks/useAvailableLanguages';
import { localDate } from '../services/dates';
import { compressImage } from '../utils/imageCompressor';
import { CameraCaptureModal } from './CameraCaptureModal';
import { PatternLock } from './PatternLock';
import { getTranslation } from '../services/i18n';
import { AuraLogo } from './AuraLogo';
import { parseLocalizedNumber, validNumber } from '../services/numberInput';

interface Props {
  preferredLanguage?: LanguageCode;
  onLanguageChange: (language: string) => Promise<void>;
  languageError?: boolean;
  colorMode: ColorMode;
  onToggleMode: () => void;
  onComplete: (data: { profile: Partial<UserProfile>; initialWeight: number; initialPhoto: string; goalPhoto?: string; pattern: number[] }) => void;
}
const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white focus:outline-none focus:border-rose-500';
const actionClass = 'action-primary rounded-xl px-4 py-3 font-bold disabled:opacity-40 cursor-pointer transition';

export const ClientRegistrationModal: React.FC<Props> = ({ preferredLanguage = 'fr', onLanguageChange, languageError, colorMode, onToggleMode, onComplete }) => {
  const [step, setStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // When step changes, automatically scroll to the very top so step 2 & 3 start at the top
  useEffect(() => { 
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' }); 
  }, [step]);

  const [changingLanguage, setChangingLanguage] = useState(false);
  const [languageMessage, setLanguageMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState<CountryCode>(deviceCountry());
  const [dialCountry, setDialCountry] = useState<CountryCode>(deviceCountry());
  const [weightGoal, setWeightGoal] = useState<WeightGoalType>('lose');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('29');
  const [height, setHeight] = useState('170');
  const [startingWeight, setStartingWeight] = useState('76.5');
  const [targetWeight, setTargetWeight] = useState('66');
  const [photo, setPhoto] = useState('');
  const [goalPhoto, setGoalPhoto] = useState('');
  const [goalConsent,setGoalConsent]=useState(false);
  const [goalError,setGoalError]=useState('');
  const [isGeneratingGoalPhoto, setIsGeneratingGoalPhoto] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const deviceCameraRef = useRef<HTMLInputElement>(null);
  const theme = getTheme('neutral', colorMode);
  const t = getTranslation(preferredLanguage);
  const goalText = t;
  const availableLanguages = useAvailableLanguages(preferredLanguage);
  const countries = useMemo(() => countryOptionsForLanguage(preferredLanguage), [preferredLanguage]);
  const phoneNumber = parsePhoneNumberFromString(phone, dialCountry);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const cleanPhone = phone.replace(/[\s.-]/g, '');
  const phoneValid = cleanPhone.length >= 6 && (!!phoneNumber?.isValid() || /^\+?[0-9]{6,16}$/.test(cleanPhone));
  const validIdentity = !!firstName.trim() && !!lastName.trim() && phoneValid && emailValid;
  const startValue = parseLocalizedNumber(startingWeight);
  const targetValue = parseLocalizedNumber(targetWeight);
  const ageValue = parseLocalizedNumber(age);

  // Logical checks
  const isAgeValid = ageValue !== null && ageValue >= 18 && ageValue <= 120;
  const isHeightValid = validNumber(height, 100, 250);
  const isStartValid = validNumber(startingWeight, 30, 350);
  const isTargetValid = validNumber(targetWeight, 30, 350);

  const isGoalLogical = startValue !== null && targetValue !== null && (
    weightGoal === 'gain' ? targetValue > startValue :
    weightGoal === 'maintain' ? Math.abs(targetValue - startValue) <= 1.0 :
    targetValue < startValue
  );

  const validMeasures = isAgeValid && isHeightValid && isStartValid && isTargetValid && isGoalLogical;
  const selected = countries.find(item => item.code === country);
  const dial = countries.find(item => item.code === dialCountry);

  const selectLanguage = async (language: string) => {
    if (language === preferredLanguage) return;
    setChangingLanguage(true);
    setLanguageMessage('');
    try { await onLanguageChange(language); }
    catch { setLanguageMessage(t.languageUnavailable); }
    finally { setChangingLanguage(false); }
  };

  const handleGenerateAiGoal = async () => {
    if (!photo || !goalConsent || startValue === null || targetValue === null) return;
    setGoalError('');
    setIsGeneratingGoalPhoto(true);
    try {
      const generated = await generateGoalPhoto(photo, weightGoal, targetValue, startValue, parseLocalizedNumber(height)!);
      if (generated.image) setGoalPhoto(generated.image);
      if (generated.warning) setGoalError(generated.warning);
    } catch(error) {
      setGoalError(error instanceof Error ? error.message : 'Génération indisponible.');
    } finally {
      setIsGeneratingGoalPhoto(false);
    }
  };

  const finish = (pattern: number[]) => {
    if (!validIdentity || !validMeasures || !photo) return;
    const initial = startValue!;
    const goal = targetValue!;
    // An orientation only: without activity or biological parameters, this is not a prescription.
    const bmr = 10 * initial + 6.25 * parseLocalizedNumber(height)! - 5 * parseLocalizedNumber(age)! - 78;
    const calorieTarget = Math.max(1500, Math.round(bmr * 1.35 + (weightGoal === 'gain' ? 300 : weightGoal === 'maintain' ? 0 : -350)));
    const formattedPhone = phoneNumber?.number || (phone.trim().startsWith('+') ? phone.trim() : `${dial?.dialCode || ''} ${phone.trim()}`);
    onComplete({
      profile: { 
        name: `${firstName.trim()} ${lastName.trim()}`, 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        country: selected?.name || country, 
        countryCode: country, 
        weightGoal,
        phone: formattedPhone, 
        email: email.trim(), 
        gender: 'neutral', 
        age: parseLocalizedNumber(age)!, 
        heightCm: parseLocalizedNumber(height)!, 
        startingWeight: initial,
        currentWeight: initial, 
        targetWeight: goal, 
        dailyCalorieTarget: calorieTarget, 
        patternPassword: pattern,
        patternEnabled: pattern.length >= 4, 
        initialPhotoUrl: photo, 
        initialPhotoDate: localDate(), 
        goalPhotoUrl: goalPhoto || undefined,
        goalPhotoDate: goalPhoto ? localDate() : undefined,
        createdAt: new Date().toISOString() 
      },
      initialWeight: initial, 
      initialPhoto: photo, 
      goalPhoto: goalPhoto || undefined,
      pattern
    });
  };

  const galleryChanged = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { 
      const compressed = await compressImage(file, 1000, 1400, 0.82);
      setPhoto(compressed); setGoalPhoto(''); setGoalError(''); setGoalConsent(false);
      setPhotoError(''); 
    } catch { 
      setPhotoError(t.photoError); 
    }
    event.target.value = '';
  };

  return <div ref={containerRef} className="min-h-[100dvh] overflow-y-auto bg-slate-950 px-3 py-5 text-white sm:py-8">
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1"><AuraLogo /><h1 className="mt-2 text-2xl font-extrabold">{t.welcome}</h1><p className="mt-1 text-sm text-slate-400">{t.intro}</p></div>
        <div className="flex w-full flex-wrap items-end justify-end gap-2 sm:w-auto">
          {/* Language selector MUST be only on the first screen (step 1) */}
          {step === 1 && <label className="min-w-0 flex-1 text-xs text-slate-300 sm:w-44 sm:flex-none"><span className="mb-1 flex items-center gap-1"><Globe2 size={15} aria-hidden="true" /> {t.language}</span>
            <select aria-label={t.language} value={preferredLanguage} disabled={changingLanguage} onChange={event => void selectLanguage(event.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-2 py-2 text-sm text-white disabled:opacity-50">
              {availableLanguages.map(item => <option key={item.code} value={item.code}>{item.nativeName}</option>)}
            </select>
          </label>}
          <button type="button" onClick={onToggleMode} aria-label={colorMode === 'dark' ? t.lightMode : t.darkMode} className="rounded-xl border border-slate-600 p-2">{colorMode === 'dark' ? <Sun /> : <Moon />}</button>
        </div>
      </div>
      {(languageMessage || languageError) && <p role="alert" className="mb-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">{languageMessage || t.languageUnavailable}</p>}
      <div className="mb-5 flex flex-wrap justify-between gap-2 text-xs text-slate-400">{[t.identity, t.measures, t.dayOne].map((label, index) => <span className={step === index + 1 ? 'font-bold text-rose-400' : ''} key={index}>{index + 1}. {label}</span>)}</div>
      
      {step === 1 && <div className="space-y-4">
        <h2 className="font-bold text-lg">1. {t.contactTitle}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-300">{t.firstName} *<input className={inputClass + ' mt-1'} autoComplete="given-name" value={firstName} onChange={event => setFirstName(event.target.value)} /></label>
          <label className="block text-xs font-medium text-slate-300">{t.lastName} *<input className={inputClass + ' mt-1'} autoComplete="family-name" value={lastName} onChange={event => setLastName(event.target.value)} /></label>
        </div>
        <label className="block text-xs font-medium text-slate-300">{t.residenceCountry} *<select aria-label={t.residenceCountry} value={country} onChange={event => { setCountry(event.target.value as CountryCode); setDialCountry(event.target.value as CountryCode); }} className={inputClass + ' mt-1'}>{countries.map(item => <option key={item.code} value={item.code}>{item.flag} {item.name}</option>)}</select></label>
        <div className="grid grid-cols-[minmax(85px,30%)_1fr] gap-2">
          <label className="block text-xs font-medium text-slate-300">{t.phoneCode} *<select aria-label={t.phoneCode} value={dialCountry} onChange={event => setDialCountry(event.target.value as CountryCode)} className={inputClass + ' mt-1'}>{countries.map(item => <option key={item.code} value={item.code}>{item.dialCode}</option>)}</select></label>
          <label className="block text-xs font-medium text-slate-300">{t.phone} *<input type="tel" inputMode="tel" className={inputClass + ' mt-1'} placeholder={dial?.dialCode + ' ' + t.localPhone} value={phone} onChange={event => setPhone(event.target.value)} onBlur={() => setPhoneTouched(true)} aria-invalid={phoneTouched && !phoneValid} />{phoneTouched && !phoneValid && <span role="alert" className="text-xs text-rose-300 mt-1 block">{goalText.invalidPhone}</span>}</label>
        </div>
        <label className="block text-xs font-medium text-slate-300">{t.email} *<input type="email" autoComplete="email" className={inputClass + ' mt-1'} placeholder={t.emailExample} value={email} onChange={event => setEmail(event.target.value)} onBlur={() => setEmailTouched(true)} aria-invalid={emailTouched && !emailValid} />{emailTouched && !emailValid && <span role="alert" className="text-xs text-rose-300 mt-1 block">{goalText.invalidEmail}</span>}</label>
        
        <fieldset className="rounded-xl border border-slate-700 p-3"><legend className="px-1 text-sm font-semibold">{goalText.title} *</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className={`flex items-center gap-2 text-xs p-2.5 rounded-xl border cursor-pointer transition ${weightGoal === 'lose' ? 'bg-rose-500/20 border-rose-500 text-white font-bold' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
              <input type="radio" name="weightGoal" checked={weightGoal === 'lose'} onChange={() => { setWeightGoal('lose'); if (validNumber(startingWeight, 30, 350)) setTargetWeight(String(Math.max(30, startValue! - 5))); }} />
              {goalText.lose || "Perdre du poids"}
            </label>
            <label className={`flex items-center gap-2 text-xs p-2.5 rounded-xl border cursor-pointer transition ${weightGoal === 'gain' ? 'bg-sky-500/20 border-sky-500 text-white font-bold' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
              <input type="radio" name="weightGoal" checked={weightGoal === 'gain'} onChange={() => { setWeightGoal('gain'); if (validNumber(startingWeight, 30, 350)) setTargetWeight(String(Math.min(350, startValue! + 5))); }} />
              {goalText.gain || "Prendre du poids"}
            </label>
            <label className={`flex items-center gap-2 text-xs p-2.5 rounded-xl border cursor-pointer transition ${weightGoal === 'maintain' ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
              <input type="radio" name="weightGoal" checked={weightGoal === 'maintain'} onChange={() => { setWeightGoal('maintain'); if (validNumber(startingWeight, 30, 350)) setTargetWeight(String(startValue!)); }} />
              {t.goalMaintain || "Stabilisation"}
            </label>
          </div>
        </fieldset>
        
        <button type="button" disabled={!validIdentity} onClick={() => setStep(2)} className={actionClass + ' w-full'}>{t.continueMeasures}</button>
        {!validIdentity && <p className="text-xs text-slate-400 text-center">{t.requiredIdentity}</p>}
      </div>}

      {step === 2 && <div className="space-y-4">
        <h2 className="font-bold text-lg">2. {t.morphologyTitle}</h2>
        <p className="text-xs text-slate-400">{t.estimateNotice}</p>
        
        {/* Age Field with strict 18+ validation message */}
        <label className="block text-xs font-medium text-slate-300">
          {t.age} (ans) *
          <input 
            type="text" 
            inputMode="numeric" 
            autoComplete="off" 
            value={age} 
            onChange={e => { if (/^\d*$/.test(e.target.value)) setAge(e.target.value); }} 
            className={inputClass + ' mt-1'} 
          />
          {age !== '' && ageValue !== null && ageValue < 18 && (
            <span role="alert" className="mt-1.5 block text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
              ⚠️ L'âge doit commencer à partir de 18 ans : cette application s'adresse aux personnes ayant terminé leur croissance.
            </span>
          )}
          {age !== '' && ageValue !== null && ageValue > 120 && (
            <span role="alert" className="mt-1 block text-xs text-rose-300">
              Veuillez saisir un âge valide (18 à 120 ans).
            </span>
          )}
        </label>

        {/* Height Field */}
        <label className="block text-xs font-medium text-slate-300">
          {t.height} (cm) *
          <input 
            type="text" 
            inputMode="decimal" 
            autoComplete="off" 
            value={height} 
            onChange={e => { if (/^\d*[.,]?\d*$/.test(e.target.value)) setHeight(e.target.value); }} 
            className={inputClass + ' mt-1'} 
          />
          {height !== '' && !isHeightValid && (
            <span role="alert" className="mt-1 block text-xs text-rose-300">
              Veuillez saisir une taille valide (entre 100 et 250 cm).
            </span>
          )}
        </label>

        {/* Starting Weight Field */}
        <label className="block text-xs font-medium text-slate-300">
          {t.startingWeight} (kg) *
          <input 
            type="text" 
            inputMode="decimal" 
            autoComplete="off" 
            value={startingWeight} 
            onChange={e => { 
              if (/^\d*[.,]?\d*$/.test(e.target.value)) {
                setStartingWeight(e.target.value); 
                if (weightGoal === 'maintain') setTargetWeight(e.target.value);
              }
            }} 
            className={inputClass + ' mt-1'} 
          />
          {startingWeight !== '' && !isStartValid && (
            <span role="alert" className="mt-1 block text-xs text-rose-300">
              Veuillez saisir un poids de départ réaliste (entre 30 kg et 350 kg).
            </span>
          )}
        </label>

        {/* Target Weight Field */}
        <label className="block text-xs font-medium text-slate-300">
          {t.targetWeight} (kg) *
          <input 
            type="text" 
            inputMode="decimal" 
            autoComplete="off" 
            value={targetWeight} 
            onChange={e => { if (/^\d*[.,]?\d*$/.test(e.target.value)) setTargetWeight(e.target.value); }} 
            className={inputClass + ' mt-1'} 
          />
          {targetWeight !== '' && !isTargetValid && (
            <span role="alert" className="mt-1 block text-xs text-rose-300">
              Veuillez saisir un poids cible réaliste (entre 30 kg et 350 kg).
            </span>
          )}
        </label>

        {/* Simple, clear message for goal coherence without mathematical formulas */}
        {isStartValid && isTargetValid && !isGoalLogical && (
          <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/15 p-3.5 text-xs text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-300">
              <span>⚠️ Ajustement de votre objectif :</span>
            </p>
            <p>
              {weightGoal === 'lose' && "Pour une perte de poids, votre poids cible doit être inférieur à votre poids de départ."}
              {weightGoal === 'gain' && "Pour une prise de poids, votre poids cible doit être supérieur à votre poids de départ."}
              {weightGoal === 'maintain' && "Pour une stabilisation, votre poids cible doit être identique ou très proche de votre poids de départ."}
            </p>
          </div>
        )}

        {/* Motivation summary when coherent */}
        {validMeasures && startValue !== null && targetValue !== null && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <strong>
              {weightGoal === 'maintain' ? '0.0 kg · Stabilisation et maintien actif de votre forme.' : `${Math.abs(startValue - targetValue).toFixed(1)} kg ${weightGoal === 'gain' ? 'à gagner progressivement' : 'à perdre sereinement'}.`}
            </strong>
            <span className="block text-slate-300 mt-0.5">Votre plan nutritionnel et vos conseils seront calibrés sur mesure.</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 p-3 text-xs font-semibold border border-slate-700 transition">{t.back}</button>
          <button type="button" onClick={() => setStep(3)} disabled={!validMeasures} className={actionClass + ' flex-1 text-xs'}>{t.continue}</button>
        </div>
      </div>}

      {step === 3 && <div className="space-y-4">
        <h2 className="font-bold text-lg">3. {t.photoTitle}</h2>
        <p className="text-xs text-slate-400">{t.photoInfo}</p>
        <p className="rounded-xl bg-orange-500/10 p-3 text-sm">Photo debout, de la nuque jusqu’aux pieds, avec le corps entier visible. Le visage peut rester hors cadre ou masqué. Portez des vêtements ajustés et gardez la même pose pour vos comparaisons.</p>
        {photo && <label className="flex gap-2 text-xs"><input type="checkbox" checked={goalConsent} onChange={e=>setGoalConsent(e.target.checked)}/>Je souhaite une illustration objectif et j’accepte l’envoi de cette photo au service IA Google. Elle représente une possibilité visuelle, pas une prédiction de mon corps.</label>}
        {goalError && <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100"><p>{goalError}</p><p className="mt-1 text-xs text-amber-200">Tu peux choisir une autre photo pour demander une projection, ou continuer sans illustration.</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={()=>galleryRef.current?.click()} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold">Choisir une autre photo</button><button type="button" onClick={()=>finish([])} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950">Continuer sans illustration</button></div></div>}
        
        {/* Photo Display */}
        {photo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                📸 Photo Initiale (Jour 1)
              </span>
              <div className="relative mx-auto max-h-64 max-w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 flex items-center justify-center p-1">
                <img src={photo} alt="Photo initiale" className="max-h-60 max-w-full rounded-xl object-contain" />
              </div>
            </div>

            {/* AI Goal Photo Simulation Card */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                ✨ Photo Objectif (Projection IA)
              </span>
              {goalPhoto ? (
                <div className="relative mx-auto max-h-64 max-w-full overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-950 flex items-center justify-center p-1 shadow-lg shadow-emerald-500/10">
                  <img src={goalPhoto} alt="Projection Objectif IA" className="max-h-60 max-w-full rounded-xl object-contain" />
                  <span className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Générée
                  </span>
                </div>
              ) : (
                <div className="h-60 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-4 flex flex-col items-center justify-center text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                  <p className="text-xs text-slate-300 font-semibold">
                    Voir comment vous serez à l'objectif ?
                  </p>
                  <p className="text-[11px] text-slate-400">
                    L'IA va utiliser votre photo initiale pour projeter votre silhouette le jour où vous atteindrez votre cible de {targetValue} kg.
                  </p>
                  <button
                    type="button"
                    disabled={isGeneratingGoalPhoto || !goalConsent}
                    onClick={handleGenerateAiGoal}
                    className="action-primary text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md mt-1 cursor-pointer"
                  >
                    {isGeneratingGoalPhoto ? 'Génération par l’IA...' : '✨ Générer ma silhouette objectif'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {photo && (
          <p className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            💡 <strong>Repère pour votre parcours :</strong> cette photo générée servira de référence dans votre galerie pour toujours visualiser la différence entre vos <strong>3 photos</strong> : Photo Initiale, Photo Actuelle et Photo Objectif !
          </p>
        )}

        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={galleryChanged} />
        <input ref={deviceCameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={galleryChanged} />
        
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => galleryRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 p-3 border border-slate-700 font-medium transition text-xs">
            <ImageIcon size={16} /> {photo ? "Changer de photo" : t.gallery}
          </button>
          <button type="button" onClick={() => { if (window.matchMedia('(pointer: coarse)').matches) deviceCameraRef.current?.click(); else setCameraOpen(true); }} className={actionClass + ' flex items-center justify-center gap-2 text-xs'}>
            <Camera size={16} /> {photo ? "Reprendre en photo" : t.camera}
          </button>
        </div>

        {photoError && <p role="alert" className="text-xs text-rose-400">{photoError}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" onClick={() => setStep(2)} className="rounded-xl bg-slate-800 hover:bg-slate-700 p-3 border border-slate-700 text-xs font-semibold transition sm:w-1/3">{t.back}</button>
          <button type="button" disabled={!photo} onClick={() => finish([])} className={actionClass + ' flex-1 flex items-center justify-center gap-2 text-xs shadow-lg shadow-rose-600/30'}>
            <span>{t.accessDashboard || "Accéder à mon tableau de bord"}</span>
            <span>➔</span>
          </button>
        </div>

        <div className="pt-1 text-center">
          <button type="button" onClick={() => setStep(4)} className="text-xs text-slate-500 hover:text-slate-300 underline transition">
            {t.optionalSecurityCode || "Configurer un schéma de verrouillage (facultatif)"}
          </button>
        </div>
      </div>}

      {step === 4 && <div className="space-y-3">
        <h2 className="font-bold text-lg">4. {t.lockTitle}</h2>
        <p className="text-xs text-slate-400">{t.lockInfo}</p>
        <PatternLock mode="create" theme={theme} t={t} onSuccess={finish} allowBiometric={false} />
        <div className="flex gap-2">
          <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-xl bg-slate-700 p-3 text-xs font-semibold">{t.back}</button>
          <button type="button" onClick={() => finish([])} className="flex-1 rounded-xl bg-slate-700 p-3 text-xs font-semibold">{t.later}</button>
        </div>
      </div>}
    </section>
    <CameraCaptureModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={(img) => { setPhoto(img); setGoalPhoto(''); setGoalError(''); setGoalConsent(false); }} title={t.photoTitle} theme={theme} t={t} idealFacingMode="user" />
  </div>;
};
