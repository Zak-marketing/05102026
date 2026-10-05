import { UserGender } from '../types';

export type ColorMode = 'dark' | 'light';

export interface ThemeColors {
  mode: ColorMode;
  primary: string;
  primaryHover: string;
  primaryBg: string;
  primaryBorder: string;
  primaryGlow: string;
  gradientText: string;
  gradientBg: string;
  ambientGlow: string;
  cardBg: string;
  cardBorder: string;
  accentBadge: string;
  accentIcon: string;
  activeNav: string;
  patternDotIdle: string;
  patternDotActive: string;
  patternLineColor: string;
  chartLine: string;
  chartArea: string;
}

export function getTheme(gender: UserGender = 'female', mode: ColorMode = 'dark'): ThemeColors {
  if (mode === 'light') {
    if (gender === 'male') {
      return {
        mode: 'light',
        primary: "action-primary font-semibold shadow-md",
        primaryHover: "hover:bg-cyan-700",
        primaryBg: "bg-cyan-50 text-cyan-800 border border-cyan-200",
        primaryBorder: "border-cyan-300 focus:border-cyan-500",
        primaryGlow: "shadow-[0_0_25px_-5px_rgba(8,145,178,0.25)]",
        gradientText: "bg-gradient-to-r from-cyan-700 via-teal-700 to-emerald-700 bg-clip-text text-transparent",
        gradientBg: "bg-gradient-to-br from-cyan-50/70 via-slate-50 to-emerald-50/50",
        ambientGlow: "from-cyan-300/30 via-emerald-200/20 to-transparent",
        cardBg: "bg-white/95 backdrop-blur-xl border border-cyan-100/90 shadow-xl shadow-slate-200/60 hover:border-cyan-300 transition-all",
        cardBorder: "border-cyan-200/80",
        accentBadge: "text-cyan-800 bg-cyan-100/80 border border-cyan-200",
        accentIcon: "text-cyan-600",
        activeNav: "text-cyan-900 bg-cyan-100/80 border-b-2 border-cyan-600",
        patternDotIdle: "bg-slate-300 border-slate-400",
        patternDotActive: "bg-cyan-500 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]",
        patternLineColor: "#0891b2",
        chartLine: "#0891b2",
        chartArea: "rgba(8, 145, 178, 0.12)",
      };
    }
    if (gender === 'neutral') {
      return {
        mode: 'light',
        primary: "action-primary font-semibold shadow-md",
        primaryHover: "hover:bg-violet-700",
        primaryBg: "bg-violet-50 text-violet-800 border border-violet-200",
        primaryBorder: "border-violet-300 focus:border-violet-500",
        primaryGlow: "shadow-[0_0_25px_-5px_rgba(124,58,237,0.25)]",
        gradientText: "bg-gradient-to-r from-violet-700 via-indigo-700 to-pink-700 bg-clip-text text-transparent",
        gradientBg: "bg-gradient-to-br from-violet-50/70 via-slate-50 to-pink-50/40",
        ambientGlow: "from-violet-300/30 via-indigo-200/20 to-transparent",
        cardBg: "bg-white/95 backdrop-blur-xl border border-violet-100/90 shadow-xl shadow-slate-200/60 hover:border-violet-300 transition-all",
        cardBorder: "border-violet-200/80",
        accentBadge: "text-violet-800 bg-violet-100/80 border border-violet-200",
        accentIcon: "text-violet-600",
        activeNav: "text-violet-900 bg-violet-100/80 border-b-2 border-violet-600",
        patternDotIdle: "bg-slate-300 border-slate-400",
        patternDotActive: "bg-violet-600 border-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.8)]",
        patternLineColor: "#7c3aed",
        chartLine: "#7c3aed",
        chartArea: "rgba(124, 58, 237, 0.12)",
      };
    }
    // female (default)
    return {
      mode: 'light',
      primary: "action-primary font-semibold shadow-md",
      primaryHover: "hover:bg-rose-700",
      primaryBg: "bg-rose-50 text-rose-800 border border-rose-200",
      primaryBorder: "border-rose-300 focus:border-rose-500",
      primaryGlow: "shadow-[0_0_25px_-5px_rgba(225,29,72,0.25)]",
      gradientText: "bg-gradient-to-r from-rose-700 via-pink-700 to-amber-700 bg-clip-text text-transparent",
      gradientBg: "bg-gradient-to-br from-rose-50/70 via-slate-50 to-pink-50/50",
      ambientGlow: "from-rose-300/30 via-pink-200/20 to-transparent",
      cardBg: "bg-white/95 backdrop-blur-xl border border-rose-100/90 shadow-xl shadow-slate-200/60 hover:border-rose-300 transition-all",
      cardBorder: "border-rose-200/80",
      accentBadge: "text-rose-800 bg-rose-100/80 border border-rose-200",
      accentIcon: "text-rose-600",
      activeNav: "text-rose-900 bg-rose-100/80 border-b-2 border-rose-600",
      patternDotIdle: "bg-slate-300 border-slate-400",
      patternDotActive: "bg-rose-600 border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.8)]",
      patternLineColor: "#e11d48",
      chartLine: "#e11d48",
      chartArea: "rgba(225, 29, 72, 0.12)",
    };
  }

  // Dark mode
  if (gender === 'male') {
    return {
      mode: 'dark',
      primary: "action-primary font-semibold shadow-lg",
      primaryHover: "hover:bg-cyan-600",
      primaryBg: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30",
      primaryBorder: "border-cyan-500/30 focus:border-cyan-400",
      primaryGlow: "shadow-[0_0_30px_-5px_rgba(6,182,212,0.35)]",
      gradientText: "bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent",
      gradientBg: "bg-gradient-to-br from-cyan-950/40 via-slate-950 to-emerald-950/30",
      ambientGlow: "from-cyan-500/10 via-emerald-500/5 to-transparent",
      cardBg: "bg-slate-900/70 backdrop-blur-xl border border-cyan-500/15 hover:border-cyan-500/30 transition-all",
      cardBorder: "border-cyan-500/20",
      accentBadge: "text-cyan-300 bg-cyan-500/15 border border-cyan-500/25",
      accentIcon: "text-cyan-400",
      activeNav: "text-cyan-300 bg-cyan-500/15 border-b-2 border-cyan-400",
      patternDotIdle: "bg-slate-700 border-slate-600",
      patternDotActive: "bg-cyan-400 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.8)]",
      patternLineColor: "#06b6d4",
      chartLine: "#06b6d4",
      chartArea: "rgba(6, 182, 212, 0.15)",
    };
  }
  if (gender === 'neutral') {
    return {
      mode: 'dark',
      primary: "action-primary font-semibold shadow-lg",
      primaryHover: "hover:bg-violet-700",
      primaryBg: "bg-violet-500/10 text-violet-300 border border-violet-500/30",
      primaryBorder: "border-violet-500/30 focus:border-violet-400",
      primaryGlow: "shadow-[0_0_30px_-5px_rgba(139,92,246,0.35)]",
      gradientText: "bg-gradient-to-r from-violet-300 via-indigo-300 to-amber-200 bg-clip-text text-transparent",
      gradientBg: "bg-gradient-to-br from-violet-950/40 via-slate-950 to-amber-950/20",
      ambientGlow: "from-violet-500/10 via-indigo-500/5 to-transparent",
      cardBg: "bg-slate-900/70 backdrop-blur-xl border border-violet-500/15 hover:border-violet-500/30 transition-all",
      cardBorder: "border-violet-500/20",
      accentBadge: "text-violet-300 bg-violet-500/15 border border-violet-500/25",
      accentIcon: "text-violet-400",
      activeNav: "text-violet-300 bg-violet-500/15 border-b-2 border-violet-400",
      patternDotIdle: "bg-slate-700 border-slate-600",
      patternDotActive: "bg-violet-500 border-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.8)]",
      patternLineColor: "#8b5cf6",
      chartLine: "#8b5cf6",
      chartArea: "rgba(139, 92, 246, 0.15)",
    };
  }

  // female default
  return {
    mode: 'dark',
    primary: "action-primary font-semibold shadow-lg",
    primaryHover: "hover:bg-rose-600",
    primaryBg: "bg-rose-500/10 text-rose-300 border border-rose-500/30",
    primaryBorder: "border-rose-500/30 focus:border-rose-400",
    primaryGlow: "shadow-[0_0_30px_-5px_rgba(244,63,94,0.35)]",
    gradientText: "bg-gradient-to-r from-rose-300 via-pink-300 to-amber-200 bg-clip-text text-transparent",
    gradientBg: "bg-gradient-to-br from-rose-950/40 via-slate-950 to-pink-950/30",
    ambientGlow: "from-rose-500/10 via-pink-500/5 to-transparent",
    cardBg: "bg-slate-900/70 backdrop-blur-xl border border-rose-500/15 hover:border-rose-500/30 transition-all",
    cardBorder: "border-rose-500/20",
    accentBadge: "text-rose-300 bg-rose-500/15 border border-rose-500/25",
    accentIcon: "text-rose-400",
    activeNav: "text-rose-300 bg-rose-500/15 border-b-2 border-rose-400",
    patternDotIdle: "bg-slate-700 border-slate-600",
    patternDotActive: "bg-rose-500 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.8)]",
    patternLineColor: "#f43f5e",
    chartLine: "#f43f5e",
    chartArea: "rgba(244, 63, 94, 0.15)",
  };
}

export const themes: Record<UserGender, ThemeColors> = {
  female: getTheme('female', 'dark'),
  male: getTheme('male', 'dark'),
  neutral: getTheme('neutral', 'dark'),
};
