import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  X, 
  Check, 
  RotateCcw, 
  Image as ImageIcon, 
  AlertCircle,
  Timer,
  Video,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ThemeColors } from '../services/theme';
import { TranslationDictionary } from '../services/i18n';
import { compressImage } from '../utils/imageCompressor';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title: string;
  subtitle?: string;
  theme: ThemeColors;
  t: TranslationDictionary;
  idealFacingMode?: 'user' | 'environment';
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
  subtitle,
  theme,
  t,
  idealFacingMode = 'environment',
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(idealFacingMode);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAttemptingCamera, setIsAttemptingCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);

  // Stop camera stream safely
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  // Start camera with multi-level graceful fallbacks
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    const request = ++requestRef.current;
    setCameraError(null);
    setIsAttemptingCamera(true);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(t.cameraHttpsRequired || "La caméra en direct exige HTTPS et l'autorisation du navigateur. Essayez l'appareil photo du téléphone ou sélectionnez une photo.");
      setIsAttemptingCamera(false);
      return;
    }

    // Try multiple constraint variations progressively:
    const constraintAttempts: MediaStreamConstraints[] = [
      // 1. Preferred facing mode with resolution
      {
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      // 2. Just facingMode without strict resolution
      {
        audio: false,
        video: { facingMode: mode },
      },
      // 3. Fallback to basic video stream (any available webcam/sensor)
      {
        audio: false,
        video: true,
      },
    ];

    let successfulStream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintAttempts) {
      try {
        successfulStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (successfulStream) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (request !== requestRef.current) { successfulStream?.getTracks().forEach(track => track.stop()); return; }
    setIsAttemptingCamera(false);

    if (successfulStream) {
      streamRef.current = successfulStream;
      setStream(successfulStream);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = successfulStream;
        videoRef.current.play().catch(() => {});
      }
    } else {
      console.warn("Camera getUserMedia failed with last error:", lastError);
      const isNotAllowed = 
        lastError?.name === 'NotAllowedError' || 
        lastError?.name === 'PermissionDeniedError' || 
        lastError?.name === 'SecurityError';

      if (isNotAllowed) {
        setCameraError(t.cameraPermissionDenied || "Accès à la caméra refusé. Autorisez la caméra dans le navigateur ou essayez la capture proposée par votre appareil.");
      } else {
        setCameraError(
          t.cameraUnavailableError || "Impossible d'activer le flux vidéo direct. Vous pouvez prendre votre photo instantanément avec l'appareil photo ou sélectionner un fichier."
        );
      }
    }
  }, [stopCameraStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    }
    return () => {
      requestRef.current++;
      stopCameraStream();
    };
  }, [isOpen, facingMode, startCamera, stopCameraStream]);

  useEffect(() => {
    if (!isOpen) { setCapturedImage(null); setCameraError(null); setCountdown(null); }
  }, [isOpen]);

  // Keep the video node mounted while permissions are requested so the stream
  // is attached on the first attempt, including on desktop webcams.
  useEffect(() => {
    const video = videoRef.current;
    if (!isOpen || !video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => setCameraError('Impossible de lire la caméra. Vérifiez son autorisation dans le navigateur.'));
    return () => { if (video.srcObject === stream) video.srcObject = null; };
  }, [isOpen, stream, capturedImage]);

  // Handle countdown shutter
  const triggerShutter = () => {
    // If stream is not available or errored, immediately open native camera
    if (!stream || cameraError) {
      nativeCameraInputRef.current?.click();
      return;
    }

    if (timerEnabled) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            takeSnapshot();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Simulate flash
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // If user front camera, mirror horizontally for natural selfie look
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
      setCapturedImage(dataUrl);
      stopCameraStream();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  // The file capture hint may open a mobile device camera; browsers control this behavior.
  const handleNativeCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1000, 1000, 0.75);
        onCapture(compressed);
        stopCameraStream();
        onClose();
      } catch (err) {
        console.error('Failed to compress camera capture', err);
      }
    }
    // Reset input value so user can take another photo if retrying
    e.target.value = '';
  };

  // Gallery file upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1000, 1000, 0.75);
        setCapturedImage(compressed);
        stopCameraStream();
      } catch (err) {
        console.error('Failed to compress gallery upload', err);
      }
    }
    e.target.value = '';
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Camera capture hint for mobile browsers */}
      <input
        type="file"
        accept="image/*"
        capture={facingMode === 'user' ? 'user' : 'environment'}
        ref={nativeCameraInputRef}
        onChange={handleNativeCameraCapture}
        className="hidden"
      />

      {/* Gallery Input */}
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={handleGalleryUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className={`w-full max-w-lg rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xl overflow-hidden flex flex-col max-h-[95vh]`}>
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${theme.primaryBg}`}>
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                {title || (t.cameraLive || "Prise de photo")}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-slate-400 truncate max-w-[260px] sm:max-w-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition flex items-center justify-center shadow-sm"
            aria-label={t.closeBtn || "Fermer"}
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Viewfinder / Capture Preview Box */}
        <div className="relative aspect-[3/4] sm:aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${capturedImage || isAttemptingCamera || cameraError ? 'invisible' : ''}`}
          />
          {/* Flash Effect Layer */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-200" />
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <span className="text-7xl font-extrabold text-white animate-ping font-heading">
                {countdown}
              </span>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Photo prise"
              className="w-full h-full object-cover"
            />
          ) : isAttemptingCamera ? (
            /* Loading Camera State */
            <div className="p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-rose-500/30 border-t-rose-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">{t.cameraActivating || 'Activation de la caméra...'}</p>
            </div>
          ) : cameraError ? (
            /* Error & Fallback View: High priority Native Camera trigger */
            <div className="p-6 text-center space-y-4 max-w-sm w-full">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {t.cameraDirectAccessTitle || 'Accès caméra direct disponible'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.cameraDirectAccessDesc || "Autorisez la caméra dans le navigateur, ou essayez la capture proposée par votre appareil. Sur ordinateur, ce bouton peut ouvrir un sélecteur de fichiers."}
                </p>
              </div>

              {/* Action Buttons: Native Camera Priority */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="action-primary w-full px-4 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.cameraOpenDirectDevice || '📸 Ouvrir mon appareil photo direct'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t.cameraRetryStream || 'Réessayer flux'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{t.cameraGallery || 'Galerie'}</span>
                  </button>
                </div>

                {/* Browser Permission Tip Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPermissionGuide(!showPermissionGuide)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 pt-1 underline transition"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{t.cameraHowToAuthorize || 'Comment autoriser la caméra dans le navigateur ?'}</span>
                </button>

                {showPermissionGuide && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-left text-[11px] text-slate-300 space-y-1">
                    <p className="font-semibold text-rose-300">{t.cameraHowToAuthorizeStepTitle || 'Pour autoriser le flux en direct :'}</p>
                    <p>{t.cameraHowToAuthorizeStep1 || "1. Cliquez sur le cadenas 🔒 à gauche de l'adresse URL."}</p>
                    <p>{t.cameraHowToAuthorizeStep2 || "2. Activez l'option Caméra / Appareil photo sur Autoriser."}</p>
                    <p>{t.cameraHowToAuthorizeStep3 || "3. Cliquez sur Réessayer ou rechargez la page."}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Live Camera Stream with Frame Overlay */
            <>
              {/* Viewfinder Target Guidelines */}
              <div className="absolute inset-8 pointer-events-none border border-white/20 rounded-2xl">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  </div>
                </div>
              </div>

              {/* Top Quick Floating Controls */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setTimerEnabled(!timerEnabled)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition ${
                    timerEnabled
                      ? 'bg-amber-500 text-slate-950 shadow-lg'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-700/50'
                  }`}
                  title={t.cameraTimer3s || "Retardateur 3s"}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{timerEnabled ? (t.cameraTimerActive || '3s Actif') : (t.cameraTimer || 'Minuteur')}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/70 text-slate-300 hover:text-white border border-slate-700/50 backdrop-blur-md flex items-center gap-1.5 transition"
                  title={t.cameraSwitchFacing || "Inverser la caméra"}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{facingMode === 'user' ? (t.cameraFacingBack || 'Arrière') : (t.cameraFacingFront || 'Face')}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Controls / Actions Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          {capturedImage ? (
            /* Confirm or Retake State */
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.cameraRetake || "Reprendre la photo"}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className={`flex-1 py-3 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition ${theme.primary}`}
              >
                <Check className="w-4 h-4" />
                <span>{t.cameraConfirm || "Valider cette photo"}</span>
              </button>
            </div>
          ) : (
            /* Live Camera Trigger Controls */
            <div className="flex items-center justify-between gap-4">
              {/* Gallery Fallback Option */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition flex flex-col items-center gap-1 min-w-[65px]"
                title={t.cameraUploadGallery || "Galerie"}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t.cameraGallery || "Galerie"}</span>
              </button>

              {/* Big Shutter Button - Always functional, launches native camera if stream unavailable */}
              <div className="flex-1 flex flex-col items-center">
                <button
                  type="button"
                  onClick={triggerShutter}
                  className="w-16 h-16 rounded-full border-4 border-white/80 p-1 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
                  title={t.cameraShutter || "Prendre la photo"}
                >
                  <div className={`w-full h-full rounded-full ${theme.primary} flex items-center justify-center shadow-inner`}>
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </button>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">
                  {stream ? (t.cameraTriggerShutter || "Déclencher") : (t.cameraShutter || "Appareil photo")}
                </span>
              </div>

              {/* Native Camera Direct Trigger */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/80 text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition flex flex-col items-center gap-1 min-w-[65px]"
                title={t.cameraDirectNativeTitle || "Appareil photo direct"}
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t.cameraDirectBadge || "Direct"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
