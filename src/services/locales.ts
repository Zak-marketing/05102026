import ISO6391 from 'iso-639-1';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

export interface OfficialLanguage {
  code: string;
  name: string;
  nativeName: string;
}

// Exactly the 20 languages requested by the user in specified order
export const official20Languages: OfficialLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文 (Mandarin)' },
  { code: 'es', name: 'Español', nativeName: 'Español' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabe', nativeName: 'العربية' },
  { code: 'pt', name: 'Português', nativeName: 'Português' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ru', name: 'Russe', nativeName: 'Русский' },
  { code: 'ja', name: 'Japonais', nativeName: '日本語' },
  { code: 'pa', name: 'Panjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'de', name: 'Allemand', nativeName: 'Deutsch' },
  { code: 'jv', name: 'Javanais', nativeName: 'Javanese' },
  { code: 'ko', name: 'Coréen', nativeName: '한국어' },
  { code: 'fr', name: 'Français', nativeName: 'Français' },
  { code: 'te', name: 'Télougou', nativeName: 'తెలుగు' },
  { code: 'vi', name: 'Vietnamien', nativeName: 'Tiếng Việt' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'tr', name: 'Turc', nativeName: 'Türkçe' },
  { code: 'ta', name: 'Tamoul', nativeName: 'தமிழ்' },
  { code: 'it', name: 'Italien', nativeName: 'Italiano' }
];

export const official50Languages: OfficialLanguage[] = official20Languages;

export const launchLanguageCodes = official50Languages.map(item => item.code);
export const essentialLanguageCodes = launchLanguageCodes;

export const languageOptions = official50Languages;
export const essentialLanguageOptions = official50Languages;

export const countryOptions = getCountries()
  .filter(code => code !== 'IL')
  .map(code => {
    const name = new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) || code;
    return {
      code,
      name,
      dialCode: `+${getCountryCallingCode(code)}`,
      flag: String.fromCodePoint(...[...code].map(char => char.charCodeAt(0) + 127397))
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

export function countryOptionsForLanguage(language: string) {
  if (language === 'fr') return countryOptions;
  try {
    const names = new Intl.DisplayNames([language], { type: 'region' });
    return countryOptions.map(item => ({ ...item, name: names.of(item.code) || item.name }))
      .sort((a, b) => a.name.localeCompare(b.name, language));
  } catch {
    return countryOptions;
  }
}

export function deviceLanguage() {
  const available = new Set<string>(languageOptions.map(language => language.code));
  for (const locale of typeof navigator === 'undefined' ? [] : (navigator.languages || [navigator.language])) {
    const code = locale.toLowerCase().split('-')[0];
    if (available.has(code)) return code;
  }
  return 'fr';
}

export function deviceCountry(): CountryCode {
  for (const locale of typeof navigator === 'undefined' ? [] : (navigator.languages || [navigator.language])) {
    try {
      const region = new Intl.Locale(locale).region?.toUpperCase() as CountryCode | undefined;
      if (region && region !== 'IL' && countryOptions.some(country => country.code === region)) return region;
    } catch { /* Malformed device locale */ }
  }
  return 'FR';
}
