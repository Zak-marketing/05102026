import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { parseLocalizedNumber, validNumber } from '../src/services/numberInput.ts';

assert.equal(parseLocalizedNumber(''), null);
assert.equal(parseLocalizedNumber('90,5'), 90.5);
assert.equal(parseLocalizedNumber('90.5'), 90.5);
assert.equal(parseLocalizedNumber('90,'), null);
assert.equal(validNumber('90,5', 30, 350), true);
assert(parseLocalizedNumber('95,5') > parseLocalizedNumber('90,5'), 'La prise de poids doit accepter une cible supérieure');

const port = 39783;
const app = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: process.cwd(), env: { ...process.env, GEMINI_API_KEY: '', AURASLIM_ADMIN_PASSWORD: '' }, stdio: ['ignore', 'pipe', 'pipe']
});
let logs = '';
app.stdout.on('data', data => { logs += data; });
app.stderr.on('data', data => { logs += data; });
const request = (route, options) => fetch(`http://127.0.0.1:${port}${route}`, options);
try {
  let healthy = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (app.exitCode !== null) throw new Error(`Vite arrêté : ${logs}`);
    try { const response = await request('/auraslim-api/status'); healthy = response.ok; if (healthy) break; } catch {}
    await delay(150);
  }
  assert(healthy, `API absente de l’aperçu Vite : ${logs}`);
  const meal = await request('/auraslim-api/meal-estimate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({image:'x'}) });
  assert.equal(meal.status, 503);
  assert.match(meal.headers.get('content-type'), /application\/json/);
  assert.match((await meal.json()).error, /Gemini/);
  const admin = await request('/auraslim-api/admin/session');
  assert.equal(admin.status, 200);
  assert.equal((await admin.json()).configured, false);
  const page = await request('/admin');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /AuraSlim/);
  console.log('OK aperçu Vite : API JSON et page admin disponibles ; champs de prise de poids acceptent la virgule.');
} finally { app.kill('SIGTERM'); }
