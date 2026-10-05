import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, RotateCcw } from 'lucide-react';
import { ThemeColors } from '../services/theme';
import { TranslationDictionary } from '../services/i18n';

interface PatternLockProps {
  mode: 'unlock' | 'create';
  targetPattern?: number[];
  theme: ThemeColors;
  t: TranslationDictionary;
  onSuccess: (pattern: number[]) => void;
  onCancel?: () => void;
  allowBiometric?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const PatternLock: React.FC<PatternLockProps> = ({
  mode,
  targetPattern = [],
  theme,
  t,
  onSuccess,
  onCancel,
  allowBiometric = false
}) => {
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPointer, setCurrentPointer] = useState<Point | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    mode === 'unlock' ? t.patternUnlockPrompt : t.patternSetInstructions
  );
  const [isError, setIsError] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  
  // For 'create' mode: first pattern step vs confirmation step
  const [firstDrawnPattern, setFirstDrawnPattern] = useState<number[] | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [nodeCenters, setNodeCenters] = useState<Point[]>([]);

  // Calculate coordinates of 9 dots relative to container
  const updateNodePositions = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const size = rect.width;
    const padding = size * 0.15;
    const spacing = (size - 2 * padding) / 2;

    const centers: Point[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        centers.push({
          x: padding + col * spacing,
          y: padding + row * spacing,
        });
      }
    }
    setNodeCenters(centers);
  }, []);

  useEffect(() => {
    updateNodePositions();
    window.addEventListener('resize', updateNodePositions);
    return () => window.removeEventListener('resize', updateNodePositions);
  }, [updateNodePositions]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTimer === 0 && isLockedOut) {
      setIsLockedOut(false);
      setAttemptsRemaining(3);
      setStatusMessage(t.patternUnlockPrompt);
    }
  }, [lockoutTimer, isLockedOut, t.patternUnlockPrompt]);

  const getNodeAtPosition = (x: number, y: number): number | null => {
    const hitRadius = 38; // generous touch hit area
    for (let i = 0; i < nodeCenters.length; i++) {
      const node = nodeCenters[i];
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist <= hitRadius) {
        return i;
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLockedOut) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsError(false);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const node = getNodeAtPosition(x, y);
    setIsDrawing(true);
    setCurrentPointer({ x, y });

    if (node !== null) {
      setSelectedNodes([node]);
    } else {
      setSelectedNodes([]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || isLockedOut) return;
    e.preventDefault();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPointer({ x, y });

    const node = getNodeAtPosition(x, y);
    if (node !== null && !selectedNodes.includes(node)) {
      setSelectedNodes(prev => [...prev, node]);
    }
  };

  const arraysEqual = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const handlePointerUp = () => {
    if (!isDrawing || isLockedOut) return;
    setIsDrawing(false);
    setCurrentPointer(null);

    if (selectedNodes.length === 0) return;

    if (selectedNodes.length < 4) {
      setIsError(true);
      setStatusMessage(t.patternSetInstructions);
      setTimeout(() => {
        setSelectedNodes([]);
        setIsError(false);
      }, 1000);
      return;
    }

    if (mode === 'unlock') {
      const matches = arraysEqual(selectedNodes, targetPattern);
      if (matches) {
        setStatusMessage(t.patternAccepted || 'Schéma accepté.');
        setTimeout(() => {
          onSuccess(selectedNodes);
        }, 300);
      } else {
        const nextAttempts = attemptsRemaining - 1;
        setAttemptsRemaining(nextAttempts);
        setIsError(true);
        if (nextAttempts <= 0) {
          setIsLockedOut(true);
          setLockoutTimer(30);
          setStatusMessage(t.patternLockoutMessage || "Trop de tentatives incorrectes. Réessayez dans 30 secondes.");
        } else {
          setStatusMessage(`${t.patternErrorAttempts} ${nextAttempts}`);
        }
        setTimeout(() => {
          setSelectedNodes([]);
          setIsError(false);
        }, 1100);
      }
    } else {
      // Create mode
      if (!firstDrawnPattern) {
        setFirstDrawnPattern(selectedNodes);
        setSelectedNodes([]);
        setStatusMessage(t.patternConfirmInstructions);
      } else {
        const matches = arraysEqual(firstDrawnPattern, selectedNodes);
        if (matches) {
          setStatusMessage(t.patternRegisteredSuccess || 'Schéma confirmé et enregistré sur cet appareil.');
          setTimeout(() => {
            onSuccess(selectedNodes);
          }, 400);
        } else {
          setIsError(true);
          setStatusMessage(t.patternMismatch);
          setFirstDrawnPattern(null);
          setTimeout(() => {
            setSelectedNodes([]);
            setIsError(false);
            setStatusMessage(t.patternSetInstructions);
          }, 1200);
        }
      }
    }
  };

  const handleResetPattern = () => {
    setSelectedNodes([]);
    setFirstDrawnPattern(null);
    setIsError(false);
    setStatusMessage(mode === 'unlock' ? t.patternUnlockPrompt : t.patternSetInstructions);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto select-none">
      {/* Security Shield Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-3 rounded-2xl ${theme.primaryBg} ${theme.primaryGlow} animate-pulse`}>
          <Shield className={`w-8 h-8 ${theme.accentIcon}`} />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-white font-heading text-center">
        {mode === 'unlock' ? t.patternLockTitle : t.patternSetTitle}
      </h2>
      <p className="text-sm text-slate-400 text-center mt-1 mb-6 max-w-xs">
        {statusMessage}
      </p>

      {/* 3x3 Canvas / SVG Dot Grid */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-[min(72vw,18rem)] aspect-square sm:w-80 sm:h-80 touch-none rounded-3xl bg-slate-900/90 border ${
          isError ? 'border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.3)]' : theme.cardBorder
        } backdrop-blur-xl p-4 transition-all duration-300 shadow-2xl flex items-center justify-center`}
      >
        {/* SVG Drawing Layer for Real-Time Connected Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Completed lines between connected nodes */}
          {selectedNodes.map((nodeIndex, i) => {
            if (i === 0) return null;
            const prevNode = nodeCenters[selectedNodes[i - 1]];
            const currNode = nodeCenters[nodeIndex];
            if (!prevNode || !currNode) return null;
            return (
              <line
                key={`line-${i}`}
                x1={prevNode.x}
                y1={prevNode.y}
                x2={currNode.x}
                y2={currNode.y}
                stroke={isError ? '#ef4444' : theme.patternLineColor}
                strokeWidth="5"
                strokeLinecap="round"
                className="transition-colors duration-200"
              />
            );
          })}

          {/* Active pointer line from last selected node to finger/mouse */}
          {isDrawing && currentPointer && selectedNodes.length > 0 && (
            <line
              x1={nodeCenters[selectedNodes[selectedNodes.length - 1]]?.x || 0}
              y1={nodeCenters[selectedNodes[selectedNodes.length - 1]]?.y || 0}
              x2={currentPointer.x}
              y2={currentPointer.y}
              stroke={isError ? '#ef4444' : theme.patternLineColor}
              strokeWidth="4"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity="0.8"
            />
          )}
        </svg>

        {/* 9 Interactive Dots */}
        <div className="grid grid-cols-3 gap-12 sm:gap-14 w-full h-full place-items-center relative z-10 pointer-events-none">
          {Array.from({ length: 9 }).map((_, index) => {
            const isSelected = selectedNodes.includes(index);
            const isFirst = selectedNodes[0] === index;
            const isLast = selectedNodes[selectedNodes.length - 1] === index;

            return (
              <div
                key={index}
                className="relative flex items-center justify-center w-12 h-12"
              >
                {/* Outer Ring */}
                <div
                  className={`w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? isError
                        ? 'border-red-500 bg-red-500/20 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : `${theme.primaryBorder} bg-white/10 scale-110`
                      : 'border-slate-700/60 bg-slate-800/40'
                  }`}
                >
                  {/* Inner Core Dot */}
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      isSelected
                        ? isError
                          ? 'bg-red-500 scale-125'
                          : `${theme.patternDotActive} scale-125`
                        : 'bg-slate-500'
                    }`}
                  />
                </div>

                {/* Index badge when tracing */}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-slate-900/90 border border-slate-700 rounded-full w-4 h-4 flex items-center justify-center">
                    {selectedNodes.indexOf(index) + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Lockout Overlay */}
        {isLockedOut && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white">{t.patternSecurityLockoutTitle || "Verrouillage de sécurité"}</h3>
            <p className="text-xs text-slate-300 mt-1">
              {t.patternLockoutCountdownNotice || "Nombre maximal de tentatives dépassé. Déverrouillage dans :"}
            </p>
            <div className="text-3xl font-extrabold text-red-400 mt-3 font-mono">
              00:{lockoutTimer < 10 ? `0${lockoutTimer}` : lockoutTimer}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons & Biometric Option */}
      <div className="flex flex-col gap-3 w-full mt-6">
        <div className="flex items-center justify-between gap-3 w-full">
          <button
            type="button"
            onClick={handleResetPattern}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.patternClear}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition"
            >
              {t.cancelBtn || 'Annuler'}
            </button>
          )}
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-500">{t.patternScreenLockDesc || "Verrouillage local de l'écran. Sauvegardez vos données dans les paramètres."}</p>
    </div>
  );
};
