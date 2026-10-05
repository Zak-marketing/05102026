import assert from 'node:assert/strict';
import { auraSlimApi } from '../src/services/apiClient.ts';
import { countryOptions, languageOptions, launchLanguageCountries, launchLanguageCodes } from '../src/services/locales.ts';
import { foodPortion } from '../src/services/foodPortions.ts';
import { mealChoiceCopy } from '../src/services/mealChoiceCopy.ts';

assert.equal(launchLanguageCodes.length, 30);
assert.equal(new Set(Object.values(launchLanguageCountries)).size, 30);
for (const code of launchLanguageCodes) assert(languageOptions.some(item => item.code === code && item.nativeName && item.nativeName !== code), `Language name missing: ${code}`);
for (const [country, dial] of Object.entries({ FR: '+33', DZ: '+213', US: '+1', CA: '+1', GB: '+44', IN: '+91', JP: '+81', BR: '+55' })) {
  assert.equal(countryOptions.find(item => item.code === country)?.dialCode, dial);
}
for (const language of launchLanguageCodes) assert(mealChoiceCopy(language).length > 4);
const food = { id: 'sample', name: 'Avoine', portion: '150g', calories: 225, proteins: 8, carbs: 40, fats: 3, category: 'breakfast' };
assert.equal(foodPortion(food)?.quantity, 150);
assert.equal(foodPortion(food)?.calories, 225);
assert.equal(foodPortion(food, '60')?.calories, 90);

const original = globalThis.fetch;
const requests = [];
globalThis.fetch = async (input) => {
  requests.push(String(input));
  if (String(input).startsWith('/auraslim-api')) return new Response('<!doctype html><html>', { headers: { 'Content-Type': 'text/html' } });
  if (String(input) === '/api/status') return Response.json({ ai: true, translation: false });
  if (String(input) === '/api/meal-estimate') return Response.json({ name: 'Salade', calories: 180, foods: [{ name: 'Légumes' }] });
  throw new Error(`Unexpected ${input}`);
};
try {
  const response = await auraSlimApi('meal-estimate', { method: 'POST', body: '{}' });
  assert.equal((await response.json()).calories, 180);
  assert(requests.includes('/auraslim-api/status') && requests.includes('/api/meal-estimate'));
  console.log('OK 30 langues/pays, indicatifs E.164, portion initiale et bascule vers le serveur JSON /api.');
} finally { globalThis.fetch = original; }
