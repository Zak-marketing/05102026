import { official50Languages, type OfficialLanguage } from '../services/locales';

export function useAvailableLanguages(_current?: string): OfficialLanguage[] {
  return official50Languages;
}
