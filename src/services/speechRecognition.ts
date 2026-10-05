/**
 * Web Speech API helper for microphone measurement dictation
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export interface StartListeningOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export interface SpeechRecognitionController {
  stop: () => void;
  abort: () => void;
}

export function startSpeechRecognition(options: StartListeningOptions): SpeechRecognitionController | null {
  if (!isSpeechRecognitionSupported()) {
    options.onError?.("Votre navigateur ne supporte pas la reconnaissance vocale native. Essayez avec Chrome, Safari ou Edge.");
    return null;
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  const langMap: Record<string, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    ar: 'ar-SA',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ru: 'ru-RU'
  };

  recognition.lang = langMap[options.lang || 'fr'] || options.lang || 'fr-FR';
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    options.onStart?.();
  };

  recognition.onresult = (event: any) => {
    let transcript = '';
    let isFinal = false;

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        isFinal = true;
      }
    }

    options.onResult(transcript, isFinal);
  };

  recognition.onerror = (event: any) => {
    let msg = "Erreur de saisie vocale.";
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      msg = "Accès au microphone refusé. Veuillez autoriser le micro dans votre navigateur.";
    } else if (event.error === 'no-speech') {
      msg = "Aucune parole détectée. Veuillez parler plus près du micro.";
    } else if (event.error === 'network') {
      msg = "Erreur réseau lors de la reconnaissance vocale.";
    }
    options.onError?.(msg);
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  try {
    recognition.start();
  } catch (err: any) {
    options.onError?.(err?.message || "Impossible de démarrer le micro.");
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {}
    },
    abort: () => {
      try {
        recognition.abort();
      } catch {}
    }
  };
}
