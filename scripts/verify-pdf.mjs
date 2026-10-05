import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
process.env.DISABLE_HMR = 'true';
const vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { generateNutritionistPDF } = await vite.ssrLoadModule('/src/services/pdfReportGenerator.ts');
  const { defaultProfile, initialSmartwatch } = await vite.ssrLoadModule('/src/services/storage.ts');
  const { getTranslation } = await vite.ssrLoadModule('/src/services/i18n.ts');
  const tinyPng = `data:image/png;base64,${(await readFile(new URL('../src/assets/auraslim-mark.png', import.meta.url))).toString('base64')}`;
  const result = await generateNutritionistPDF({
    profile: { ...defaultProfile, name: 'Client Exemple', startingWeight: 90, currentWeight: 87, targetWeight: 78, weightGoal: 'lose', initialPhotoUrl: tinyPng, initialPhotoDate: '2026-09-24' },
    weightEntries: [{ id: 'a', date: '2026-09-24', weight: 90, mood: 'good', photoUrl: tinyPng }, { id: 'b', date: '2026-09-26', weight: 89, mood: 'good' }, { id: 'c', date: '2026-09-28', weight: 87, mood: 'good', waistCm: 83 }],
    weeklyPhotos: [],
    nutritionEntries: [{ id: 'n', date: '2026-09-28', mealType: 'lunch', name: 'Lentilles et legumes', portion: '200g', calories: 196, proteins: 10, carbs: 28, fats: 4 }],
    smartwatch: initialSmartwatch,
    t: getTranslation('fr')
  });
  assert(result.success && result.blob, result.error || 'PDF non créé');
  const bytes = Buffer.from(await result.blob.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString(), '%PDF');
  assert((bytes.toString('latin1').match(/\/Subtype \/Image/g) || []).length >= 2, 'La photo de progression ne semble pas incluse dans le PDF.');
  await writeFile('/tmp/auraslim-pdf-preview.pdf', bytes);
  console.log(`PDF vérifié : ${bytes.length} octets`);
} finally { await vite.close(); }
