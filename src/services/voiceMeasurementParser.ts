/**
 * Voice Measurement Parser for AuraSlim
 * Intelligently recognizes spoken weight, body fat, waist circumference,
 * water intake, mood, and notes in French and other languages.
 */

export interface ParsedVoiceMeasurements {
  weight?: string;
  bodyFat?: string;
  waist?: string;
  water?: string;
  mood?: 'great' | 'good' | 'neutral' | 'struggling';
  notes?: string;
  rawTranscript: string;
  summary: string;
}

export function parseFrenchWordsToNumber(str: string): number | null {
  if (!str) return null;

  // Standardize decimals and spaces
  const s = str.toLowerCase()
    .replace(/virgule/g, '.')
    .replace(/point/g, '.')
    .replace(/et demi/g, '.5')
    .replace(/et quart/g, '.25')
    .replace(/,/g, '.');

  // If already contains digits like "72.5" or "80"
  const digitMatch = s.match(/(\d+(?:\.\d+)?)/);
  if (digitMatch) {
    const val = parseFloat(digitMatch[1]);
    return isNaN(val) ? null : val;
  }

  // French word-based mapping
  const units: Record<string, number> = {
    'zéro': 0, 'zero': 0, 'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4,
    'cinq': 5, 'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
    'onze': 11, 'douze': 12, 'treize': 13, 'quatorze': 14, 'quinze': 15, 'seize': 16,
    'dix-sept': 17, 'dix sept': 17, 'dix-huit': 18, 'dix huit': 18, 'dix-neuf': 19, 'dix neuf': 19
  };

  const tens: Record<string, number> = {
    'vingt': 20, 'trente': 30, 'quarante': 40, 'cinquante': 50,
    'soixante': 60, 'quatre-vingt': 80, 'quatre vingt': 80, 'quatre-vingts': 80, 'quatre vingts': 80
  };

  const parts = s.split(/\s*[\.]\s*/);
  const integerPart = parts[0]?.trim() || '';
  const decimalPart = parts[1]?.trim() || null;

  function decodeInt(text: string): number | null {
    const t = text.replace(/et/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    if (units[t] !== undefined) return units[t];
    if (tens[t] !== undefined) return tens[t];

    if (t.startsWith('soixante dix')) return 70 + (units[t.replace('soixante dix', '').trim()] || 0);
    if (t.startsWith('soixante')) return 60 + (units[t.replace('soixante', '').trim()] || 0);
    if (t.startsWith('quatre vingt dix')) return 90 + (units[t.replace('quatre vingt dix', '').trim()] || 0);
    if (t.startsWith('quatre vingt')) return 80 + (units[t.replace('quatre vingt', '').trim()] || 0);
    if (t.startsWith('cinquante')) return 50 + (units[t.replace('cinquante', '').trim()] || 0);
    if (t.startsWith('quarante')) return 40 + (units[t.replace('quarante', '').trim()] || 0);
    if (t.startsWith('trente')) return 30 + (units[t.replace('trente', '').trim()] || 0);
    if (t.startsWith('vingt')) return 20 + (units[t.replace('vingt', '').trim()] || 0);
    if (t.startsWith('cent')) return 100 + (decodeInt(t.replace('cent', '').trim()) || 0);
    return null;
  }

  const intVal = decodeInt(integerPart);
  if (intVal === null) return null;

  if (decimalPart) {
    const decVal = decodeInt(decimalPart) ?? (units[decimalPart] !== undefined ? units[decimalPart] : null);
    if (decVal !== null) {
      return parseFloat(`${intVal}.${decVal}`);
    }
  }
  return intVal;
}

export function parseVoiceMeasurements(
  transcript: string,
  targetField?: 'weight' | 'bodyFat' | 'waist' | 'water' | 'notes'
): ParsedVoiceMeasurements {
  const result: ParsedVoiceMeasurements = {
    rawTranscript: transcript.trim(),
    summary: ''
  };

  const raw = transcript.trim();
  if (!raw) return result;

  const normalized = raw.toLowerCase()
    .replace(/virgule/g, '.')
    .replace(/point/g, '.')
    .replace(/et demi/g, '.5')
    .replace(/et quart/g, '.25')
    .replace(/,/g, '.');

  // Single target field mode (when user clicked microphone directly on an input)
  if (targetField) {
    if (targetField === 'notes') {
      result.notes = raw;
      result.summary = `Note enregistrée : "${raw}"`;
      return result;
    }

    const numVal = parseFrenchWordsToNumber(normalized);
    if (numVal !== null) {
      const valStr = numVal.toString();
      if (targetField === 'weight') {
        result.weight = valStr;
        result.summary = `Poids : ${valStr} kg`;
      } else if (targetField === 'bodyFat') {
        result.bodyFat = valStr;
        result.summary = `Masse grasse : ${valStr} %`;
      } else if (targetField === 'waist') {
        result.waist = valStr;
        result.summary = `Tour de taille : ${valStr} cm`;
      } else if (targetField === 'water') {
        result.water = valStr;
        result.summary = `Eau : ${valStr} L`;
      }
    }
    return result;
  }

  // Global Smart Dictation Mode: extracts all spoken fields
  // 1. Explicit Weight
  const weightRegex = /(?:poids|pèse|pesée|peser)\s*(?:de|est de)?\s*[:]?\s*([a-z0-9.-]+)|([0-9]+(?:\.[0-9]+)?)\s*(?:kg|kilos?|kilogrammes?)/i;
  const weightMatch = normalized.match(weightRegex);
  if (weightMatch) {
    const rawVal = weightMatch[1] || weightMatch[2];
    const num = parseFrenchWordsToNumber(rawVal);
    if (num !== null && num >= 25 && num <= 300) {
      result.weight = num.toString();
    }
  }

  // 2. Body Fat %
  const fatRegex = /(?:masse grasse|graisse|taux de gras|gras)\s*(?:de|est de)?\s*[:]?\s*([a-z0-9.-]+)|([0-9]+(?:\.[0-9]+)?)\s*(?:%|pourcent|pour cent)/i;
  const fatMatch = normalized.match(fatRegex);
  if (fatMatch) {
    const rawVal = fatMatch[1] || fatMatch[2];
    const num = parseFrenchWordsToNumber(rawVal);
    if (num !== null && num >= 3 && num <= 70) {
      result.bodyFat = num.toString();
    }
  }

  // 3. Waist Circumference
  const waistRegex = /(?:tour de taille|taille|ventre)\s*(?:de|est de)?\s*[:]?\s*([a-z0-9.-]+)|([0-9]+(?:\.[0-9]+)?)\s*(?:cm|centimètres?)/i;
  const waistMatch = normalized.match(waistRegex);
  if (waistMatch) {
    const rawVal = waistMatch[1] || waistMatch[2];
    const num = parseFrenchWordsToNumber(rawVal);
    if (num !== null && num >= 40 && num <= 200) {
      result.waist = num.toString();
    }
  }

  // 4. Water Intake
  const waterRegex = /(?:eau|hydratation|liquide|bu)\s*(?:de|est de)?\s*[:]?\s*([a-z0-9.-]+)|([0-9]+(?:\.[0-9]+)?)\s*(?:l|litres?)/i;
  const waterMatch = normalized.match(waterRegex);
  if (waterMatch) {
    const rawVal = waterMatch[1] || waterMatch[2];
    const num = parseFrenchWordsToNumber(rawVal);
    if (num !== null && num >= 0.1 && num <= 10) {
      result.water = num.toString();
    }
  }

  // 5. Fallback: If no weight keyword was recognized, but user said a lone number like "72.4"
  if (!result.weight && !result.bodyFat && !result.waist && !result.water) {
    const loneNum = parseFrenchWordsToNumber(normalized);
    if (loneNum !== null && loneNum >= 30 && loneNum <= 250) {
      result.weight = loneNum.toString();
    }
  }

  // 6. Mood recognition
  if (/top|super|génial|excellente|pleine forme|très bien/i.test(normalized)) {
    result.mood = 'great';
  } else if (/bien|bonne|content|satisfait|ça va/i.test(normalized)) {
    result.mood = 'good';
  } else if (/moyen|neutre|normal|bof/i.test(normalized)) {
    result.mood = 'neutral';
  } else if (/difficile|dur|fatigué|compliqué|craqué|mauvais/i.test(normalized)) {
    result.mood = 'struggling';
  }

  // 7. Notes recognition
  const notesMatch = raw.match(/(?:note|commentaire|remarque|ressenti)\s*[:]?\s*(.*)/i);
  if (notesMatch && notesMatch[1]) {
    result.notes = notesMatch[1].trim();
  }

  // Summary generation
  const summaryParts: string[] = [];
  if (result.weight) summaryParts.push(`Poids : ${result.weight} kg`);
  if (result.bodyFat) summaryParts.push(`Masse grasse : ${result.bodyFat} %`);
  if (result.waist) summaryParts.push(`Tour de taille : ${result.waist} cm`);
  if (result.water) summaryParts.push(`Eau : ${result.water} L`);
  if (result.mood) {
    const moodLabels = { great: 'Top', good: 'Bien', neutral: 'Neutre', struggling: 'Difficile' };
    summaryParts.push(`Humeur : ${moodLabels[result.mood]}`);
  }
  if (result.notes) summaryParts.push(`Note : "${result.notes}"`);

  result.summary = summaryParts.length > 0 ? summaryParts.join(' • ') : 'Aucune mesure numérique détectée.';

  return result;
}
