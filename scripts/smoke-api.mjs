import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { languageOptions, countryOptions } from '../src/services/locales.ts';
import { foodPortion } from '../src/services/foodPortions.ts';
import { STRIPE_PRODUCTS } from '../src/types/index.ts';

const port = 39782;
const origin = `http://127.0.0.1:${port}`;
const app = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
  cwd: process.cwd(), env: { ...process.env, PORT: String(port), NODE_ENV: 'production', STRIPE_SECRET_KEY: '', GEMINI_API_KEY: '', GOOGLE_CLOUD_TRANSLATE_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe']
});
let logs = '';
app.stdout.on('data', data => { logs += data; });
app.stderr.on('data', data => { logs += data; });
async function request(url, options = {}) { return fetch(`${origin}${url}`, options); }
try {
  let healthy = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (app.exitCode !== null) throw new Error(`Serveur arrêté : ${logs}`);
    try { const response = await request('/api/status'); healthy = response.ok; if (healthy) break; } catch {}
    await delay(150);
  }
  assert(healthy, `Le serveur n'a pas démarré : ${logs}`);
  assert.equal((await (await request('/auraslim-api/status')).json()).stripeVerification, false);
  assert.equal((await (await request('/api/status')).json()).stripeVerification, false);
  assert(languageOptions.length > 100 && languageOptions.every(item => item.nativeName && item.nativeName !== item.code));
  assert(countryOptions.length >= 240 && countryOptions.every(item => item.flag && /^\+\d+$/.test(item.dialCode)));
  const sampleFood = { id:'test', name:'Aliment test', portion:'150g', calories:300, proteins:30, carbs:45, fats:5 };
  assert.deepEqual(foodPortion(sampleFood, '100')?.calories, 200);
  assert.equal(foodPortion(sampleFood, '60')?.calories, 120);
  assert.equal(foodPortion(sampleFood, '')?.calories, undefined);
  const supported = await (await request('/auraslim-api/supported-languages')).json();
  assert(supported.codes.includes('en') && !supported.codes.includes('aa'), 'Sans clé Cloud, seules les langues de l’application sont proposées');
  const paymentLinksResponse = await request('/auraslim-api/payment-links');
  const cookie = paymentLinksResponse.headers.get('set-cookie');
  const paymentLinks = await paymentLinksResponse.json();
  assert.match(cookie, /auraslim_checkout_client=/);
  for (const plan of ['scan_meals', 'progress_video', 'complete_pack']) {
    const link = new URL(paymentLinks[plan]);
    assert.equal(link.hostname, 'buy.stripe.com');
    assert.match(link.pathname, /^\/test_/);
    assert.equal(link.origin + link.pathname, STRIPE_PRODUCTS.find(product => product.planKey === plan).stripeCheckoutUrl);
    assert.match(link.searchParams.get('client_reference_id'), /^[a-f0-9]{48}$/);
  }
  assert.deepEqual(STRIPE_PRODUCTS.map(product => product.priceEur), [3.99, 3.99, 6.99]);
  for (const [language, welcome] of [['en', 'Welcome to AuraSlim'], ['es', 'Bienvenido a AuraSlim'], ['ar', 'مرحبًا بك في AuraSlim']]) {
    const response = await request(`/auraslim-api/translations?lang=${language}`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).welcome, welcome);
  }
  const missingTranslation = await request('/auraslim-api/translations?lang=nl');
  assert.equal(missingTranslation.status, 503, 'Une langue sans dictionnaire ni clé Cloud ne doit pas être annoncée comme traduite');
  const options = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
  for (const plan of ['scan_meals', 'progress_video', 'complete_pack']) {
    const response = await request('/auraslim-api/checkout', { ...options, body: JSON.stringify({ plan, currency: 'EUR' }) });
    assert.equal(response.status, 503, `Un paiement sans clés devrait être refusé (${plan})`);
    assert.match((await response.json()).error, /STRIPE_SECRET_KEY/);
    console.log(`OK ${plan} : aucun paiement sans configuration vérifiable`);
  }
  const currency = await request('/auraslim-api/checkout', { ...options, body: JSON.stringify({ plan: 'complete_pack', currency: 'XXX' }) });
  assert.equal(currency.status, 400);
  const meal = await request('/auraslim-api/meal-estimate', { ...options, body: '{}' });
  assert.equal(meal.status, 503);
  assert.match(meal.headers.get('content-type'), /application\/json/);
  const oversized = await request('/auraslim-api/meal-estimate', { ...options, body: JSON.stringify({ image: 'x'.repeat(6 * 1024 * 1024) }) });
  assert.equal(oversized.status, 413);
  assert.match(oversized.headers.get('content-type'), /application\/json/);
  const unknown = await request('/auraslim-api/route-inconnue');
  assert.equal(unknown.status, 404);
  assert.match(unknown.headers.get('content-type'), /application\/json/);
  const entitlement = await request('/auraslim-api/entitlement?session_id=cs_test_fake');
  assert.equal(entitlement.status, 503);
  const html = await request('/'); assert(html.ok && (await html.text()).includes('AuraSlim'));
  console.log('OK langues de l’accueil, erreurs explicites sans clés, refus devise incorrecte, page en production');
} finally { app.kill('SIGTERM'); }
