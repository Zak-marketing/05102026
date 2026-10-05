import {generateGoalPhoto} from '../services/goalPhoto';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Plus, Video, Image as ImageIcon, SlidersHorizontal, Sparkles, Maximize2 } from 'lucide-react';
import type { UserProfile, WeeklyPhoto } from '../types';
import type { ThemeColors } from '../services/theme';
import type { TranslationDictionary } from '../services/i18n';
import { compressImage } from '../utils/imageCompressor';
import { localDate } from '../services/dates';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ProgressionVideoModal } from './ProgressionVideoModal';

interface Props { profile: UserProfile; photos: WeeklyPhoto[]; theme: ThemeColors; t: TranslationDictionary; onAddPhoto: (photo: Omit<WeeklyPhoto,'id'>) => void; onUpdateProfile:(p:Partial<UserProfile>)=>void; onReplacePhoto:(id:string,image:string)=>void; onOpenUpgradeModal: (plan?: import('../types').UserPlan) => void; }

// Generates a pristine, high-resolution SVG silhouette for flawless rendering without browser defects
function createSilhouettePlaceholder(title: string, subtitle: string, variant: 'before' | 'after' = 'before'): string {
  const isAfter = variant === 'after';
  const color1 = isAfter ? '#059669' : '#e11d48';
  const color2 = isAfter ? '#10b981' : '#f43f5e';
  const glow = isAfter ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 533" width="400" height="533">
    <defs>
      <linearGradient id="bg_${variant}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e1b4b" />
      </linearGradient>
      <linearGradient id="grad_${variant}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${color2}" />
        <stop offset="100%" stop-color="${color1}" stop-opacity="0.6" />
      </linearGradient>
      <filter id="glow_${variant}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg_${variant})" />
    <circle cx="200" cy="130" r="38" fill="url(#grad_${variant})" filter="url(#glow_${variant})" />
    <path d="M135 210 C135 180, 265 180, 265 210 L280 340 C280 375, 245 395, 200 395 C155 395, 120 375, 120 340 Z" fill="url(#grad_${variant})" filter="url(#glow_${variant})" />
    <rect x="50" y="425" width="300" height="65" rx="16" fill="#030712" fill-opacity="0.8" stroke="#334155" stroke-width="1.5" />
    <text x="200" y="452" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="200" y="473" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PhotoTracker: React.FC<Props> = ({ profile, photos, theme, t, onAddPhoto, onOpenUpgradeModal, onUpdateProfile, onReplacePhoto }) => {
  // Ensure we ALWAYS have at least two pristine photo entries for Before/After split slider
  const effectivePhotos = useMemo(() => {
    const list = [...photos];
    const initialPhoto = profile.initialPhotoUrl || createSilhouettePlaceholder(t.dayOneLabel || 'Jour 1 · Départ', `${profile.startingWeight || 75} kg`, 'before');

    if (list.length === 0) {
      list.push({
        id: 'initial_day1',
        weekNumber: 0,
        date: profile.initialPhotoDate || localDate(),
        angle: 'front',
        imageUrl: initialPhoto,
        weightAtTime: profile.startingWeight || 75,
        notes: t.dayOneLabel || 'Jour 1 · Départ'
      });
    }

    // Do not fabricate a goal/progress photo. Only display images actually supplied or generated and saved.

    if(profile.goalPhotoUrl) list.push({id:'goal_ia',weekNumber:999,date:profile.goalPhotoDate||localDate(),angle:'front',imageUrl:profile.goalPhotoUrl,weightAtTime:profile.targetWeight,notes:'Objectif IA · illustration'});
    return list.sort((a, b) => a.weekNumber - b.weekNumber || a.date.localeCompare(b.date));
  }, [photos, profile.initialPhotoUrl, profile.goalPhotoUrl, profile.goalPhotoDate, profile.initialPhotoDate, profile.startingWeight, profile.targetWeight, profile.currentWeight, t.dayOneLabel, t.weightTarget, t.goalLegend]);

  const sorted = effectivePhotos;
  const [beforeId, setBeforeId] = useState(sorted[0]?.id || '');
  const [afterId, setAfterId] = useState(sorted[1]?.id || sorted[0]?.id || '');
  const [slider, setSlider] = useState(50);
  const [goalConsent,setGoalConsent]=useState(false);
  const [goalBusy,setGoalBusy]=useState(false);
  const replaceRef=useRef<HTMLInputElement>(null);
  const [replaceRole,setReplaceRole]=useState<'initial'|'current'>('current');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('contain');
  const [angle, setAngle] = useState<'front' | 'side' | 'back'>('front');
  const [draft, setDraft] = useState<Partial<Record<'front' | 'side' | 'back', string>>>({});
  const [cameraOpen, setCameraOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ url: string; title: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Safe image URL resolver with fallback to profile initialPhotoUrl
  const resolvePhotoUrl = (photo?: WeeklyPhoto, variant: 'before' | 'after' = 'before'): string => {
    if (!photo) return createSilhouettePlaceholder('AuraSlim', 'Photo de suivi', variant);
    if (photo.imageUrl && photo.imageUrl.trim().length > 10) return photo.imageUrl;
    if (photo.weekNumber === 0 && profile.initialPhotoUrl && profile.initialPhotoUrl.length > 10) {
      return profile.initialPhotoUrl;
    }
    return createSilhouettePlaceholder(
      photo.weekNumber === 0 ? (t.dayOneLabel || 'Jour 1 · Départ') : `${t.weekAbbrev || 'Semaine'} ${photo.weekNumber}`,
      photo.date || (photo.weightAtTime ? `${photo.weightAtTime} kg` : ''),
      variant
    );
  };

  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSlider(Math.round(pct));
  };

  const hasPro = ['progress_video', 'complete_pack', 'pro'].includes(profile.plan);
  const usedFree = photos.filter(photo => photo.weekNumber > 0).length;
  const freeAvailable = hasPro || usedFree < 3;

  // Ensure first and second are distinct when multiple photos exist
  const first = sorted.find(photo => photo.id === beforeId) || sorted[0];
  let second = sorted.find(photo => photo.id === afterId) || sorted.at(-1);
  if (sorted.length > 1 && second && first && second.id === first.id) {
    second = sorted.find(p => p.id !== first.id) || second;
  }

  useEffect(() => {
    if (!sorted.length) return;
    if (!sorted.some(photo => photo.id === beforeId)) setBeforeId(sorted[0].id);
    if (sorted.length > 1) {
      if (!sorted.some(photo => photo.id === afterId) || afterId === sorted[0].id) {
        setAfterId(sorted[sorted.length - 1].id);
      }
    } else {
      setAfterId(sorted[0].id);
    }
  }, [sorted.length]);

  const selectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const data = await compressImage(file, 1200, 1600, 0.82);
      setDraft(previous => ({ ...previous, [angle]: data }));
      setError('');
    } catch {
      setError(t.photoError || 'Cette image ne peut pas être utilisée.');
    }
    event.target.value = '';
  };

  const save = () => {
    if (!draft.front) {
      setError(t.frontPhotoRequiredError || 'Ajoutez une photo de face pour continuer.');
      return;
    }
    if (!freeAvailable) {
      onOpenUpgradeModal('progress_video');
      return;
    }
    onAddPhoto({
      weekNumber: Math.max(0, ...sorted.map(photo => photo.weekNumber)) + 1,
      date: localDate(),
      angle: 'front',
      imageUrl: draft.front,
      sideImageUrl: draft.side,
      backImageUrl: draft.back,
      weightAtTime: profile.currentWeight,
      notes: notes.trim() || undefined
    });
    setDraft({});
    setNotes('');
    setAddOpen(false);
  };

  const beforePhotoUrl = resolvePhotoUrl(first, 'before');
  const afterPhotoUrl = resolvePhotoUrl(second, 'after');

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>{t.photoEvolutionTitle || 'Évolution en photos'}</span>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs text-rose-300 font-normal">
              {sorted.length} {t.galleryCountLabel || 'photos'}
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            {t.photoEvolutionSubtitle || 'Jour 1 et photos de pesées enregistrées sur cet appareil.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => (freeAvailable ? setAddOpen(true) : onOpenUpgradeModal('progress_video'))}
            className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition"
          >
            <Plus size={17} /> {t.addPhotoBtn || 'Ajouter une photo'}
          </button>
          <button
            type="button"
            disabled={sorted.length < 2}
            onClick={() => {
              if (!hasPro && usedFree >= 3) {
                onOpenUpgradeModal('progress_video');
              } else {
                setVideoOpen(true);
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-40 transition shadow-lg shadow-cyan-600/20"
          >
            <Video size={17} /> {t.generateVideoBtn || 'Générer ma vidéo'}
          </button>
        </div>
      </div>

      <section className={`rounded-2xl border p-4 space-y-3 ${theme.cardBg}`}>
        <p className="text-sm">Une photo entière de la nuque aux pieds facilite les comparaisons. Le visage peut rester hors cadre ou être masqué. Une photo partielle reste acceptée.</p>
        <div className="flex flex-wrap gap-2"><button className="rounded-xl border px-3 py-2" onClick={()=>{setReplaceRole('initial');replaceRef.current?.click();}}>Changer la photo initiale</button><button className="rounded-xl border px-3 py-2" onClick={()=>{setReplaceRole('current');replaceRef.current?.click();}}>Changer la photo actuelle</button></div>
        <input ref={replaceRef} type="file" accept="image/*" className="hidden" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{const image=await compressImage(file,1200,1600,0.82);if(replaceRole==='initial'){onUpdateProfile({initialPhotoUrl:image,goalPhotoUrl:undefined,goalPhotoDate:undefined});if(sorted[0])onReplacePhoto(sorted[0].id,image);}else{const current=[...photos].filter(p=>!p.notes?.includes('Objectif IA')).sort((a,b)=>b.date.localeCompare(a.date)||b.weekNumber-a.weekNumber)[0];if(current&&current.weekNumber>0)onReplacePhoto(current.id,image);else onAddPhoto({date:localDate(),weekNumber:1,angle:'front',imageUrl:image,weightAtTime:profile.currentWeight});}}catch{setError('Photo inutilisable.');}}}/>
        <label className="flex gap-2 text-xs"><input type="checkbox" checked={goalConsent} onChange={e=>setGoalConsent(e.target.checked)}/>J’accepte d’envoyer ma photo initiale au service IA Google pour générer une illustration de mon objectif. Ce visuel ne garantit pas un résultat réel.</label>
        <button disabled={!goalConsent||goalBusy||!profile.initialPhotoUrl} className="action-primary rounded-xl px-4 py-3 font-bold disabled:opacity-40" onClick={async()=>{setGoalBusy(true);setError('');try{const result=await generateGoalPhoto(profile.initialPhotoUrl!,profile.weightGoal||'lose',profile.targetWeight,profile.startingWeight,profile.heightCm);if(result.image)onUpdateProfile({goalPhotoUrl:result.image,goalPhotoDate:localDate()});else setError(result.warning||'Choisissez une photo complète pour obtenir la projection IA.');}catch(e){setError(e instanceof Error?e.message:'Génération indisponible.');}finally{setGoalBusy(false);}}}>{goalBusy?'Génération IA en cours…':'Générer / actualiser ma photo objectif'}</button>
        {error&&<p role="alert" className="text-rose-500">{error}</p>}
      </section>
      {/* 3 Key Reference Photos: Photo Initiale, Photo Actuelle, Photo Objectif */}
      <section className={`rounded-3xl p-4 sm:p-5 ${theme.cardBg} border border-slate-800 shadow-xl space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Vos 3 Photos Repères : Initiale, Actuelle & Objectif</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualisez instantanément la différence entre votre point de départ, votre forme d'aujourd'hui et votre silhouette cible.
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full self-start sm:self-auto">
            3 Repères Clés
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Photo Initiale */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <span>1️⃣</span> Photo Initiale
                </span>
                <span className="text-[10px] text-slate-400">
                  {profile.initialPhotoDate || (sorted[0]?.date) || 'Départ'}
                </span>
              </div>
              <div className="mt-2 relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                <img
                  src={resolvePhotoUrl(sorted[0], 'before')}
                  alt="Photo Initiale"
                  className="h-full w-full object-contain object-center"
                />
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-slate-200">
                  {profile.startingWeight} kg
                </span>
                <span className="text-[10px] text-slate-400 block">Poids de départ</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setBeforeId(sorted[0]?.id || '');
                sliderContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700 transition"
            >
              Placer en comparaison "Avant"
            </button>
          </div>

          {/* 2. Photo Actuelle */}
          <div className="rounded-2xl border border-sky-500/30 bg-slate-950/70 p-3.5 flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <span>2️⃣</span> Photo Actuelle
                </span>
                <span className="text-[10px] text-slate-400">
                  {sorted.length > 1 ? sorted[sorted.length - 1].date : (profile.initialPhotoDate || 'Aujourd’hui')}
                </span>
              </div>
              <div className="mt-2 relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-sky-500/20 flex items-center justify-center">
                <img
                  src={resolvePhotoUrl(sorted.filter(p=>p.id!=='goal_ia').at(-1), 'after')}
                  alt="Photo Actuelle"
                  className="h-full w-full object-contain object-center"
                />
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-sky-300">
                  {profile.currentWeight} kg
                </span>
                <span className="text-[10px] text-slate-400 block">Poids actuel</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex-1 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-[11px] font-semibold text-sky-200 border border-sky-500/30 transition text-center"
              >
                Mettre à jour
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sorted.length > 1) setAfterId(sorted[sorted.length - 1].id);
                  sliderContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700 transition"
                title="Comparer"
              >
                Glissière
              </button>
            </div>
          </div>

          {/* 3. Photo Objectif (Projection IA) */}
          <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/70 p-3.5 flex flex-col justify-between space-y-3 shadow-md shadow-emerald-500/10">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>3️⃣</span> Photo Objectif (IA)
                </span>
                <span className="text-[10px] text-emerald-300/80 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
                  Cible
                </span>
              </div>
              <div className="mt-2 relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/30 flex items-center justify-center">
                {profile.goalPhotoUrl ? (
                  <img
                    src={profile.goalPhotoUrl}
                    alt="Photo Objectif IA"
                    className="h-full w-full object-contain object-center"
                  />
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-300 font-bold">Projection Cible</p>
                    <p className="text-[10px] text-slate-400">Projection de votre silhouette idéale à {profile.targetWeight} kg</p>
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-emerald-300">
                  {profile.targetWeight} kg
                </span>
                <span className="text-[10px] text-slate-400 block">Objectif visé</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {profile.goalPhotoUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setEnlargedPhoto({
                      url: profile.goalPhotoUrl!,
                      title: `Photo Objectif (Projection IA à ${profile.targetWeight} kg)`
                    });
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-[11px] font-semibold text-emerald-200 border border-emerald-500/30 transition text-center"
                >
                  Agrandir la projection
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-[11px] font-semibold text-emerald-200 border border-emerald-500/30 transition text-center"
                >
                  Définir ma photo cible
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {!hasPro && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <strong className="block text-white font-bold">{t.unlimitedProgressOption || "Option Galerie Progrès & vidéo de progression"}</strong>
            <span>3 photos de progression gratuites incluses en version d'essai. Restantes : <strong>{Math.max(0, 3 - usedFree)} photo(s)</strong>.</span>
          </div>
          {usedFree >= 3 && (
            <button
              type="button"
              onClick={() => onOpenUpgradeModal('progress_video')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow-sm"
            >
              Débloquer à 3,99 €/mois
            </button>
          )}
        </div>
      )}

      {/* Main Before / After Split Slider Section - Always Rendered */}
      <section className={`rounded-2xl p-4 sm:p-6 ${theme.cardBg} border border-slate-800 shadow-xl`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400" />
              <span>{t.compareBeforeAfterTitle || 'Comparer avant / après'}</span>
            </h3>
            <p className="text-xs text-rose-300/90 mt-0.5">
              {t.dragCenterToCompareHint || 'Glissez le curseur au centre vers la gauche ou la droite ◀ ▶'}
            </p>
          </div>

          {/* Fit Toggle (Cover vs Contain) */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 p-1 rounded-xl text-xs">
            <SlidersHorizontal size={13} className="text-slate-400 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setFitMode('cover')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                fitMode === 'cover' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.photoFitCover || 'Remplir 100%'}
            </button>
            <button
              type="button"
              onClick={() => setFitMode('contain')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                fitMode === 'contain' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.photoFitContain || 'Photo entière'}
            </button>
          </div>
        </div>

        {/* Photo Selector Dropdowns */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-300 font-medium">
            <span>{t.photoBeforeLabel || 'Photo avant'}</span>
            <select
              aria-label={t.photoBeforeLabel || 'Photo avant'}
              value={first?.id || ''}
              onChange={e => setBeforeId(e.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 p-2.5 text-xs text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
            >
              {sorted.map(photo => (
                <option key={photo.id} value={photo.id}>
                  {photo.weekNumber === 0 ? (t.dayOneLabel || 'Jour 1 · Départ') : `${t.weekAbbrev || 'Semaine'} ${photo.weekNumber}`} · {photo.date} {photo.weightAtTime ? `(${photo.weightAtTime} kg)` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300 font-medium">
            <span>{t.photoAfterLabel || 'Photo après'}</span>
            <select
              aria-label={t.photoAfterLabel || 'Photo après'}
              value={second?.id || ''}
              onChange={e => setAfterId(e.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 p-2.5 text-xs text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
            >
              {sorted.map(photo => (
                <option key={photo.id} value={photo.id}>
                  {photo.weekNumber === 0 ? (t.dayOneLabel || 'Jour 1 · Départ') : `${t.weekAbbrev || 'Semaine'} ${photo.weekNumber}`} · {photo.date} {photo.weightAtTime ? `(${photo.weightAtTime} kg)` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" disabled={!first} onClick={()=>first&&setEnlargedPhoto({url:resolvePhotoUrl(first,'before'),title:`Photo avant · ${first.date}${first.weightAtTime?` · ${first.weightAtTime} kg`:''}`})} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-40"><Maximize2 size={14}/>Agrandir la photo avant</button>
          <button type="button" disabled={!second} onClick={()=>second&&setEnlargedPhoto({url:resolvePhotoUrl(second,'after'),title:`Photo après · ${second.date}${second.weightAtTime?` · ${second.weightAtTime} kg`:''}`})} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-40"><Maximize2 size={14}/>Agrandir la photo après</button>
        </div>

        {/* Interactive Split Comparison Card - Center Slider */}
        <div>
          <div
            ref={sliderContainerRef}
            role="slider" tabIndex={0} aria-label={t.compareBeforeAfterTitle||'Comparer avant et après'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={slider}
            onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();setSlider(v=>Math.max(0,v-5));}if(e.key==='ArrowRight'){e.preventDefault();setSlider(v=>Math.min(100,v+5));}}}
            onPointerDown={e => {
              setIsDraggingSlider(true);
              handleSliderMove(e.clientX);
              (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={e => {
              if (isDraggingSlider || e.buttons === 1) handleSliderMove(e.clientX);
            }}
            onPointerUp={() => setIsDraggingSlider(false)}
            onPointerCancel={() => setIsDraggingSlider(false)}
            className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-2xl select-none cursor-ew-resize touch-none"
          >
            {/* Photo Après (Background - Right side) */}
            <img
              src={afterPhotoUrl}
              alt={t.badgeApres || "Après"}
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = createSilhouettePlaceholder(
                  t.badgeApres || 'APRÈS',
                  second?.date || (second?.weightAtTime ? `${second.weightAtTime} kg` : ''),
                  'after'
                );
              }}
              className={`absolute inset-0 h-full w-full pointer-events-none select-none ${
                fitMode === 'contain' ? 'object-contain bg-slate-950' : 'object-cover object-center'
              }`}
            />

            {/* Photo Avant (Clipped overlay - Left side) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none select-none"
              style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
            >
              <img
                src={beforePhotoUrl}
                alt={t.badgeAvant || "Avant"}
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = createSilhouettePlaceholder(
                    t.badgeAvant || 'AVANT',
                    first?.date || (first?.weightAtTime ? `${first.weightAtTime} kg` : ''),
                    'before'
                  );
                }}
                className={`h-full w-full pointer-events-none select-none ${
                  fitMode === 'contain' ? 'object-contain bg-slate-950' : 'object-cover object-center'
                }`}
              />
            </div>

              {/* Glowing vertical dividing line */}
              <div
                className="pointer-events-none absolute bottom-0 top-0 w-[2px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)] z-20"
                style={{ left: `${slider}%` }}
              />

              {/* Center circular handle with left/right arrows */}
              <div
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md text-white border-2 border-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.85)] z-30"
                style={{ left: `${slider}%` }}
              >
                <span className="text-rose-400 text-xs font-black">◀</span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-100">
                  {t.dragSliderLabel || 'Glisser'}
                </span>
                <span className="text-rose-400 text-xs font-black">▶</span>
              </div>

              {/* Top Left Badge: AVANT */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <span className="px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-white shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>{t.badgeAvant || 'AVANT'}</span>
                  <span className="text-slate-400 font-normal">
                    · {first?.weekNumber === 0 ? (t.dayOneLabel || 'Jour 1') : `S.${first?.weekNumber}`}
                    {first?.weightAtTime ? ` (${first.weightAtTime} kg)` : ''}
                  </span>
                </span>
              </div>

              {/* Top Right Badge: APRÈS */}
              <div className="absolute top-3 right-3 z-20 pointer-events-none">
                <span className="px-3 py-1.5 rounded-full bg-rose-600/90 backdrop-blur-md border border-rose-400 text-[11px] font-bold text-white shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>{t.badgeApres || 'APRÈS'}</span>
                  <span className="text-rose-100 font-normal">
                    · {second?.weekNumber === 0 ? (t.dayOneLabel || 'Jour 1') : `S.${second?.weekNumber}`}
                    {second?.weightAtTime ? ` (${second.weightAtTime} kg)` : ''}
                  </span>
                </span>
              </div>

            </div>
          </div>
      </section>

      {/* Gallery Section at Bottom */}
      <section className={`rounded-2xl p-4 sm:p-5 ${theme.cardBg} border border-slate-800`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-base text-white">
            {t.galleryCountLabel || 'Galerie'} ({sorted.length} {sorted.length > 1 ? 'photos' : 'photo'})
          </h3>
          <span className="text-xs text-slate-400">
            {t.photoSelectRecent || 'Touchez une photo pour l’afficher comme photo après'}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {sorted.map(photo => {
            const isBefore = photo.id === first?.id;
            const isAfter = photo.id === second?.id;
            const url = resolvePhotoUrl(photo, isAfter ? 'after' : 'before');
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => {
                  if (photo.id !== first?.id) {
                    setAfterId(photo.id);
                  } else if (sorted.length > 1) {
                    const alt = sorted.find(p => p.id !== photo.id);
                    if (alt) setAfterId(alt.id);
                  }
                }}
                className={`relative w-28 shrink-0 rounded-2xl border-2 p-1.5 text-left text-xs transition active:scale-98 ${
                  isAfter
                    ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20'
                    : isBefore
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-950 mb-1.5">
                  <img
                    src={url}
                    alt={photo.weekNumber === 0 ? (t.dayOneLabel || 'Jour 1') : `Semaine ${photo.weekNumber}`}
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = createSilhouettePlaceholder(
                        photo.weekNumber === 0 ? (t.dayOneLabel || 'Jour 1 · Départ') : `S.${photo.weekNumber}`,
                        photo.date || (photo.weightAtTime ? `${photo.weightAtTime} kg` : ''),
                        isAfter ? 'after' : 'before'
                      );
                    }}
                    className="h-full w-full object-contain object-center"
                  />
                  {isBefore && (
                    <span className="absolute top-1 left-1 rounded bg-cyan-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                      {t.badgeAvant || 'AVANT'}
                    </span>
                  )}
                  {isAfter && (
                    <span className="absolute top-1 right-1 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                      {t.badgeApres || 'APRÈS'}
                    </span>
                  )}
                </div>
                <div className="truncate font-semibold text-white">
                  {photo.weekNumber === 0 ? (t.dayOneLabel || 'Jour 1') : `${t.weekAbbrev || 'Semaine'} ${photo.weekNumber}`}
                </div>
                <div className="truncate text-[10px] text-slate-400">{photo.date}</div>
                {photo.weightAtTime && (
                  <div className="text-[10px] text-rose-300 font-medium">{photo.weightAtTime} kg</div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Add Photo Modal */}
      {addOpen && (
        <div role="dialog" aria-modal="true" aria-label={t.newPhotoModalTitle || 'Ajouter une photo'} className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/90 backdrop-blur-sm p-3 flex items-center justify-center">
          <section className="mx-auto my-4 w-full max-w-md space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div>
              <h3 className="font-bold text-lg text-white">{t.newPhotoModalTitle || 'Nouvelle photo'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{t.newPhotoModalSubtitle || 'Face obligatoire. Profil et dos facultatifs.'}</p>
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={selectFile} className="hidden" />

            <div className="flex gap-2">
              {(['front', 'side', 'back'] as const).map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAngle(item)}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    angle === item ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item === 'front' ? (t.photoAngleFace || 'Face') : item === 'side' ? (t.photoAngleProfile || 'Profil') : (t.photoAngleBackLabel || 'Dos')}{' '}
                  {draft[item] ? '✓' : ''}
                </button>
              ))}
            </div>

            {draft[angle] ? (
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <img alt="Nouvelle photo" src={draft[angle]} className="mx-auto max-h-60 max-w-full object-contain" />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-xs text-slate-400">
                {t.photoSelectRecent || 'Sélectionnez une photo via votre galerie ou appareil photo'}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 p-2.5 text-xs font-semibold text-white transition"
              >
                <ImageIcon size={15} /> {t.photoFromGallery || 'Galerie'}
              </button>
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 p-2.5 text-xs font-semibold text-white transition shadow-lg shadow-rose-600/30"
              >
                <Camera size={15} /> {t.photoFromCamera || 'Caméra'}
              </button>
            </div>

            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t.notesOptionalPlaceholder || 'Notes facultatives'}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />

            {error && <p role="alert" className="text-xs text-rose-400 font-medium">{error}</p>}

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 p-2.5 text-sm font-semibold text-white transition"
              >
                {t.cancelBtn || 'Annuler'}
              </button>
                <button
                type="button"
                disabled={!draft.front}
                onClick={save}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 p-2.5 text-sm font-semibold text-white disabled:opacity-40 transition shadow-lg shadow-emerald-600/30"
              >
                {t.saveBtn || 'Enregistrer'}
              </button>
            </div>
          </section>
        </div>
      )}

      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={image => setDraft(previous => ({ ...previous, [angle]: image }))}
        title={t.cameraProgressPhotoTitle || 'Photo de progression'}
        idealFacingMode="user"
        theme={theme}
        t={t}
      />

      <ProgressionVideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        photos={sorted.filter(photo => photo.weekNumber !== 0 && photo.id !== 'goal_ia')}
        initialPhotoUrl={profile.initialPhotoUrl || sorted.find(photo => photo.weekNumber === 0)?.imageUrl}
        initialWeight={profile.startingWeight}
        profile={profile}
        theme={theme}
        t={t}
      />

      {enlargedPhoto && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div 
            className="relative max-w-lg w-full rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white truncate">{enlargedPhoto.title}</h4>
              <button
                type="button"
                onClick={() => setEnlargedPhoto(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 max-h-[70vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2 w-full">
              <img 
                src={enlargedPhoto.url} 
                alt={enlargedPhoto.title} 
                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setEnlargedPhoto(null)}
              className="mt-4 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
