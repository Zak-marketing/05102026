import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  X, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  Film,
  Share2,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';
import { WeeklyPhoto, UserProfile } from '../types';
import { ThemeColors } from '../services/theme';
import type { TranslationDictionary } from '../services/i18n';

interface ProgressionVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: WeeklyPhoto[];
  initialPhotoUrl?: string;
  initialWeight?: number;
  profile: UserProfile;
  theme: ThemeColors;
  t?: TranslationDictionary;
}

export const ProgressionVideoModal: React.FC<ProgressionVideoModalProps> = ({
  isOpen,
  onClose,
  photos,
  initialPhotoUrl,
  initialWeight,
  profile,
  theme,
  t = {} as TranslationDictionary,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fpsSpeed, setFpsSpeed] = useState<'normal' | 'fast'>('normal');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [videoError, setVideoError] = useState('');
  const [mediaRecorderSupported, setMediaRecorderSupported] = useState(true);

  // Compile timeline photos: Initial photo + all weekly photos sorted by date/weekNumber
  const timelineItems = React.useMemo(() => {
    const list: Array<{
      title: string;
      date: string;
      weight: number;
      imageUrl: string;
    }> = [];

    if (initialPhotoUrl) {
      list.push({
        title: t?.videoStepDayOne || 'Inscription (Jour 1)',
        date: profile.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        weight: initialWeight || profile.startingWeight,
        imageUrl: initialPhotoUrl,
      });
    }

    const sorted = [...photos].filter(p => p.weekNumber > 0).sort((a, b) => a.date.localeCompare(b.date) || a.weekNumber - b.weekNumber);
    sorted.forEach((p) => {
      list.push({
        title: `${t?.weekAbbrev || 'Semaine'} ${p.weekNumber}`,
        date: p.date,
        weight: p.weightAtTime,
        imageUrl: p.imageUrl,
      });
    });

    return list;
  }, [photos, initialPhotoUrl, initialWeight, profile, t]);

  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Preload all timeline images
  useEffect(() => {
    if (!isOpen || timelineItems.length === 0) return;

    imagesRef.current = timelineItems.map((item) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.imageUrl;
      return img;
    });
  }, [isOpen, timelineItems]);

  // Render a specific frame on canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const item = timelineItems[index];
    const img = imagesRef.current[index];

    // Background fill
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (img && img.complete && img.naturalWidth > 0) {
      // Show the entire photograph, preserving its original proportions.
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let renderW = canvas.width;
      let renderH = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > canvasAspect) {
        renderH = canvas.width / imgAspect;
        offsetY = (canvas.height - renderH) / 2;
      } else {
        renderW = canvas.height * imgAspect;
        offsetX = (canvas.width - renderW) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    } else {
      // Fallback placeholder
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${t.videoLoadingPhoto || 'Chargement de la photo...'} (${item?.title || ''})`, canvas.width / 2, canvas.height / 2);
    }

    // Top Dark Vignette Gradient
    const topGrad = ctx.createLinearGradient(0, 0, 0, 160);
    topGrad.addColorStop(0, 'rgba(2, 6, 23, 0.85)');
    topGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvas.width, 160);

    // Bottom Dark Vignette Gradient
    const botGrad = ctx.createLinearGradient(0, canvas.height - 200, 0, canvas.height);
    botGrad.addColorStop(0, 'rgba(2, 6, 23, 0)');
    botGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

    // Top Header: App Brand
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(t.videoOverlayTitle || 'AuraSlim • Vidéo de Progression', 32, 48);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText(t.videoOverlaySubtitle || 'Photos de votre suivi personnel', 32, 74);

    // Bottom Stats Overlay
    if (item) {
      const startW = timelineItems[0]?.weight || item.weight;
      const diffKg = +(item.weight - startW).toFixed(1);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(item.title, 32, canvas.height - 80);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${t.dateLabel || 'Date'} : ${item.date}`, 32, canvas.height - 48);

      // Weight badge on right
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(`${item.weight.toFixed(1)} kg`, canvas.width - 32, canvas.height - 80);

      ctx.font = 'bold 18px sans-serif';
      if (diffKg < 0) {
        ctx.fillStyle = '#34d399';
        ctx.fillText(`${t.videoVariationLabel || 'Variation'} : ${diffKg} kg`, canvas.width - 32, canvas.height - 48);
      } else if (diffKg > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${t.videoEvolutionLabel || 'Évolution'} : +${diffKg} kg`, canvas.width - 32, canvas.height - 48);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(t.videoInitialWeightLabel || 'Poids initial de départ', canvas.width - 32, canvas.height - 48);
      }
    }
  };

  // Draw current frame on change
  useEffect(() => {
    if (isOpen && timelineItems.length > 0) {
      drawFrame(currentIndex);
    }
  }, [isOpen, currentIndex, timelineItems]);

  // Animation player loop
  useEffect(() => {
    if (!isPlaying || timelineItems.length <= 1) return;

    const delay = fpsSpeed === 'normal' ? 2500 : 2000;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % timelineItems.length;
        drawFrame(next);
        return next;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [isPlaying, fpsSpeed, timelineItems]);

  // Video recording via MediaRecorder
  const handleGenerateAndExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || typeof MediaRecorder === 'undefined' || typeof canvas.captureStream !== 'function') {
      setVideoError(t.videoRecorderNotSupportedError || "Ce navigateur ne permet pas d'exporter la vidéo WebM. Vous pouvez visualiser vos photos ci-dessous.");
      setMediaRecorderSupported(false);
      return;
    }

    // Export only real photographs; otherwise the video would contain a loading placeholder.
    const loaded = await Promise.all(imagesRef.current.map(image => new Promise<boolean>(resolve => {
      if (image.complete) { resolve(image.naturalWidth > 0); return; }
      const timer = window.setTimeout(() => resolve(false), 10000);
      image.addEventListener('load', () => { clearTimeout(timer); resolve(true); }, { once: true });
      image.addEventListener('error', () => { clearTimeout(timer); resolve(false); }, { once: true });
    })));
    if (loaded.length !== timelineItems.length || loaded.some(ok => !ok)) {
      setVideoError(t.videoCannotLoadPhotoError || 'Une photo ne peut pas être chargée. Vérifiez les photos de la galerie avant de générer la vidéo.');
      return;
    }

    setIsRecording(true);
    setIsPlaying(false);
    setCurrentIndex(0);

    setVideoError('');
    const stream = canvas.captureStream(30);
    let options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      options = { mimeType: 'video/webm' };
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options = {};
      }
    }

    let mediaRecorder: MediaRecorder;
    try { mediaRecorder = new MediaRecorder(stream, options); }
    catch { stream.getTracks().forEach(track => track.stop()); setVideoError(t.videoRecordingError || "Enregistrement WebM indisponible sur ce navigateur."); setIsRecording(false); return; }
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'video/webm' });
      if (!blob.size) { setVideoError(t.videoEmptyError || 'La vidéo générée est vide. Réessayez avec un autre navigateur.'); setIsRecording(false); return; }
      const url = URL.createObjectURL(blob);
      setRecordedVideoBlob(blob);
      setRecordedVideoUrl(previous => { if (previous) URL.revokeObjectURL(previous); return url; });
      setIsRecording(false);
    };
    mediaRecorder.onerror = () => { setVideoError(t.videoRecordingError || "Impossible d'enregistrer la vidéo sur ce navigateur."); setIsRecording(false); };

    mediaRecorder.start();

    // MediaRecorder needs continuous canvas updates; a single still per scene
    // can produce a shorter encoded clip despite waiting on setTimeout.
    const sceneDurationMs = 2300;
    for (let i = 0; i < timelineItems.length; i++) {
      setCurrentIndex(i);
      drawFrame(i);
      await new Promise<void>(resolve => {
        const keepFrame = window.setInterval(() => drawFrame(i), 100);
        window.setTimeout(() => { window.clearInterval(keepFrame); resolve(); }, sceneDurationMs);
      });
    }
    if (mediaRecorder.state === 'recording') mediaRecorder.stop();
  };

  const handleDownloadRecordedVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `auraslim-progression-${new Date().toISOString().slice(0, 10)}.${recordedVideoBlob?.type.includes('mp4') ? 'mp4' : 'webm'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const [copiedLink, setCopiedLink] = useState(false);

  const getShareText = () => {
    const diff = profile.startingWeight - profile.currentWeight;
    const diffFormatted = Math.abs(Math.round(diff * 10) / 10);
    const progressText = diff > 0 
      ? (t.shareLostWeight ? t.shareLostWeight.replace('{weight}', String(diffFormatted)) : `J'ai déjà perdu ${diffFormatted} kg`)
      : diff < 0 
      ? (t.shareGainedWeight ? t.shareGainedWeight.replace('{weight}', String(diffFormatted)) : `J'ai pris ${diffFormatted} kg de masse`)
      : (t.shareRegularTracking || `Suivi régulier de ma transformation`);
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `🔥 ${t.shareProgressPrefix || 'Ma progression physique sur AuraSlim'} : ${progressText} ! ${t.shareProgressSuffix || 'Visualisez votre transformation'} : ${appUrl}`;
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToViber = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`viber://forward?text=${text}`, '_blank');
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setVideoError(t.clipboardInaccessible || 'Presse-papier inaccessible sur cet appareil.');
    }
  };

  const shareVideo = async () => {
    if (!recordedVideoBlob) return;
    const file = new File([recordedVideoBlob], `auraslim-progression.${recordedVideoBlob.type.includes('mp4') ? 'mp4' : 'webm'}`, { type: recordedVideoBlob.type || 'video/webm' });
    if (navigator.canShare?.({ files: [file] })) {
      try { 
        await navigator.share({ 
          files: [file], 
          title: t.shareVideoTitle || 'Ma progression physique AuraSlim',
          text: getShareText()
        }); 
      }
      catch (error) { 
        if ((error as DOMException).name !== 'AbortError') {
          if (navigator.share) {
            try {
              await navigator.share({
                title: t.shareVideoTitle || 'Ma progression physique AuraSlim',
                text: getShareText(),
                url: window.location.origin
              });
            } catch {
              setVideoError(t.shareDirectUnavailable || 'Partage direct indisponible. Vous pouvez utiliser WhatsApp, Viber ou copier le lien ci-dessous.');
            }
          } else {
            setVideoError(t.shareFileUnavailable || 'Partage de fichiers indisponible. Téléchargez la vidéo ou partagez via WhatsApp/Viber.');
          }
        } 
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareVideoTitle || 'Ma progression physique AuraSlim',
          text: getShareText(),
          url: window.location.origin
        });
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          setVideoError(t.shareDirectUnavailable || 'Partage direct indisponible. Vous pouvez utiliser WhatsApp, Viber ou copier le lien ci-dessous.');
        }
      }
    } else {
      setVideoError(t.shareFileUnavailable || 'Partage de fichiers indisponible sur cet appareil. Utilisez WhatsApp, Viber ou copiez le lien ci-dessous.');
    }
  };

  useEffect(() => () => { if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl); }, [recordedVideoUrl]);
  const closeModal = () => { if (isRecording) return; setIsPlaying(false); setRecordedVideoUrl(null); setRecordedVideoBlob(null); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-3xl rounded-3xl ${theme.cardBg} border ${theme.cardBorder} p-6 shadow-2xl relative my-6 max-h-[92vh] overflow-y-auto`}>
        {/* Close Button */}
        <button
          onClick={closeModal}
          disabled={isRecording}
          className="absolute top-5 right-5 p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition flex items-center justify-center shadow-sm"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-heading">
                {t.videoModalTitle || 'Vidéo de Progression Morphologique'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                {t.localVideoBadge || 'Vidéo locale'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.videoModalSubtitle || "Compile toutes vos photos chronologiques du début jusqu'à aujourd'hui pour visualiser votre transformation."}
            </p>
          </div>
        </div>

        {/* Video Canvas Display */}
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center mb-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full object-contain"
          />

          {isRecording && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
              <div className="text-sm font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                {t.videoGeneratingText || 'Génération et encodage vidéo HD en cours...'}
              </div>
              <p className="text-xs text-slate-400">
                Photo {currentIndex + 1} / {timelineItems.length}
              </p>
            </div>
          )}
        </div>
        {recordedVideoUrl && <video controls playsInline src={recordedVideoUrl} className="mb-4 max-h-[65vh] w-full rounded-xl bg-black" aria-label="Voir la vidéo créée" />}
        {videoError && <p role="alert" className="mb-3 text-sm text-amber-300">{videoError}</p>}

        {/* Timeline Slider and Controls */}
        <div className="space-y-4">
          {/* Timeline scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono w-14">
              {currentIndex + 1} / {timelineItems.length}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, timelineItems.length - 1)}
              value={currentIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setCurrentIndex(idx);
                setIsPlaying(false);
                drawFrame(idx);
              }}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {timelineItems[currentIndex]?.title || ''}
            </span>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                <span>{isPlaying ? (t.pauseBtn || 'Pause') : (t.playBtn || 'Lecture')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  drawFrame(0);
                  setIsPlaying(true);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition"
                title={t.restartBtn || "Recommencer depuis le début"}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setFpsSpeed(fpsSpeed === 'normal' ? 'fast' : 'normal')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white transition"
              >
                {t.speedLabel || 'Vitesse'} : {fpsSpeed === 'normal' ? '1x' : '2x'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {recordedVideoUrl ? (
                <button
                  type="button"
                  onClick={handleDownloadRecordedVideo}
                  className="action-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadVideoBtn || 'Télécharger ma vidéo'} {recordedVideoBlob?.type.includes('mp4') ? 'MP4' : 'WebM'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateAndExportVideo}
                  disabled={isRecording || timelineItems.length < 1 || !mediaRecorderSupported}
                  className="action-primary px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition shadow-lg disabled:opacity-50"
                >
                  <Film className="w-4 h-4" />
                  <span>{t.generateVideoBtn || 'Générer la vidéo'}</span>
                </button>
              )}
              {recordedVideoUrl && (
                <button
                  type="button"
                  onClick={shareVideo}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 px-4 py-2.5 text-xs font-bold text-cyan-200 transition"
                >
                  <Share2 className="h-4 w-4 text-cyan-300" />
                  <span>{t.shareVideoBtn || 'Partager'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Social Sharing Panel when video is generated */}
          {recordedVideoUrl && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>{t.shareVideoBtn || 'Partager ma progression physique'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  {t.socialMediaHeading || 'Réseaux sociaux & Messageries'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={shareToWhatsApp}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition shadow-sm active:scale-95"
                  title="WhatsApp"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>WhatsApp</span>
                </button>

                {/* Viber */}
                <button
                  type="button"
                  onClick={shareToViber}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs transition shadow-sm active:scale-95"
                  title="Viber"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>Viber</span>
                </button>

                {/* Copier le lien */}
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs transition shadow-sm active:scale-95"
                  title="Copier le message et le lien"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? (t.linkCopiedBadge || 'Lien copié !') : (t.copyLinkBtn || 'Copier lien')}</span>
                </button>

                {/* Partager avec appareil / Autres réseaux */}
                <button
                  type="button"
                  onClick={shareVideo}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition shadow-sm active:scale-95"
                  title="Partager"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t.shareMoreBtn || 'Réseaux...'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t.videoShareTip || "💡 Conseil : téléchargez votre vidéo ci-dessus pour la publier dans vos stories Instagram, TikTok ou l'envoyer comme fichier dans vos conversations !"}
              </p>
            </div>
          )}
        </div>

        {/* Gallery thumbnails below */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-300 mb-2">
            {t.videoTimelineTitle || 'Étapes incluses dans la vidéo'} ({timelineItems.length} photos) :
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {timelineItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(false);
                  drawFrame(idx);
                }}
                className={`relative rounded-xl overflow-hidden border shrink-0 w-20 h-24 transition ${
                  currentIndex === idx
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                    : 'border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain bg-slate-950" />
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] text-white text-center font-bold truncate">
                  {item.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          {t.videoPrivacyNotice || 'Vos photos et la vidéo sont traitées dans ce navigateur. Exportez-les uniquement si vous souhaitez les partager.'}
        </p>
      </div>
    </div>
  );
};
