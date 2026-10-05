import assert from 'node:assert/strict';
import express from 'express';
import type Stripe from 'stripe';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chronologicalWeights, weightTrackingDay } from '../src/services/weightHistory.ts';
import { parsePaymentReturn, readPendingCheckout, cleanPaymentReturnUrl, clearPendingCheckout, PENDING_CHECKOUT_KEY } from '../src/services/paymentReturn.ts';
import { WeightTracker } from '../src/components/WeightTracker.tsx';
import { getTheme } from '../src/services/theme.ts';
import { getTranslation } from '../src/services/i18n.ts';
import { defaultProfile } from '../src/services/storage.ts';
import type { WeightEntry } from '../src/types/index.ts';

delete process.env.AURASLIM_ADMIN_PASSWORD;
const { installPaymentRoutes } = await import('../server/payments.ts');
const envBefore = { ...process.env };
process.env.APP_URL = 'https://auraslim.example/';
process.env.STRIPE_PRICE_SCAN_MEALS = 'price_meals';
process.env.STRIPE_PRICE_PROGRESS_VIDEO = 'price_photos';
process.env.STRIPE_PRICE_COMPLETE_PACK = 'price_pack';

const weights: WeightEntry[] = [
  { id: 'w_1791198000000', date: '2026-10-05', weight: 93.5, mood: 'good' },
  { id: 'w_1791118800000', date: '2026-10-04', weight: 94, mood: 'good' },
  { id: 'w_1791115200000', date: '2026-10-04', weight: 95, mood: 'good', notes: 'Poids de départ (Inscription)' }
];
const ordered = chronologicalWeights(weights);
const browserValues = new Map<string, string>();
globalThis.localStorage = {
  getItem: (key: string) => browserValues.get(key) || null,
  setItem: (key: string, value: string) => { browserValues.set(key, value); },
  removeItem: (key: string) => { browserValues.delete(key); },
  clear: () => browserValues.clear(),
  key: (index: number) => [...browserValues.keys()][index] || null,
  get length() { return browserValues.size; }
};
assert.deepEqual(ordered.map(entry => entry.weight), [95, 94, 93.5]);
assert.deepEqual(ordered.map(entry => weightTrackingDay(entry.date, ordered[0].date)), [1, 1, 2]);
assert.equal(weightTrackingDay('2026-10-08', '2026-10-04'), 5, 'Unlogged days must count');
assert.equal(weightTrackingDay('2026-03-30', '2026-03-28'), 3, 'DST must not change calendar counts');
assert.equal(weightTrackingDay('2027-01-01', '2026-12-31'), 2);
assert.equal(weightTrackingDay('2024-03-01', '2024-02-28'), 3, 'Leap day must count');
const markup = renderToStaticMarkup(React.createElement(WeightTracker, {
  profile: { ...defaultProfile, gender: 'male', startingWeight: 95, currentWeight: 93.5, targetWeight: 75 },
  weightEntries: weights, theme: getTheme('male', 'light'), t: getTranslation('fr'),
  onAddEntry() {}, onOpenUpgradeModal() {}
}));
assert.equal((markup.match(/Jour 1/g) || []).length, 2);
assert.equal((markup.match(/Jour 2/g) || []).length, 1);
assert.ok(!markup.includes('Départ / Inscription'));
assert.ok(!markup.includes('Poids de départ (Inscription)'));
assert.match(getTranslation('en').trackingDayLabel!, /Day \{day\}/);

const values = new Map<string, string>();
const storage = { getItem(key: string) { return values.get(key) || null; }, removeItem(key: string) { values.delete(key); } };
const pending = { sessionId: 'cs_test_followup', tab: 'photos', scrollY: 640, startedAt: 1_000_000 };
values.set(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
assert.deepEqual(readPendingCheckout(storage, 1_000_100), pending);
assert.equal(readPendingCheckout(storage, 1_000_000 + 25 * 3600_000), null);
assert.deepEqual(parsePaymentReturn('?session_id=cs_test_followup&return_tab=photos&checkout=success'), { sessionId: 'cs_test_followup', cancelled: false, tab: 'photos' });
assert.deepEqual(parsePaymentReturn('?checkout=cancel&return_tab=compose'), { sessionId: null, cancelled: true, tab: 'compose' });
assert.equal(parsePaymentReturn('?payment_success=true&plan=complete_pack'), null, 'URL flags must not grant access');
assert.equal(parsePaymentReturn('?session_id=invalid'), null);
assert.equal(parsePaymentReturn('?session_id=cs_test_followup&return_tab=https://untrusted.example')?.tab, 'progress');
assert.equal(cleanPaymentReturnUrl('https://auraslim.example/?theme=light&checkout=success&session_id=cs_test_followup&return_tab=photos#section'), 'https://auraslim.example/?theme=light#section');
values.set('auraslim_pending_payment_plan', 'complete_pack');
clearPendingCheckout(storage);
assert.equal(values.size, 0);

let created: any;
const client = 'a'.repeat(48);
let price: any = { id: 'price_meals', active: true, currency: 'eur', unit_amount: 399, recurring: { interval: 'month' } };
let session: any = { id: 'cs_test_followup', client_reference_id: client, mode: 'subscription', status: 'complete', payment_status: 'paid', subscription: 'sub_fixture', metadata: { return_tab: 'photos' } };
let subscription: any = { id: 'sub_fixture', status: 'active', items: { data: [{ price }] } };
const stripe = {
  prices: { retrieve: async () => price },
  checkout: { sessions: {
    create: async (options: any) => { created = options; return { id: 'cs_test_followup', url: 'https://checkout.stripe.com/c/pay/cs_test_followup' }; },
    retrieve: async () => session
  } },
  subscriptions: { retrieve: async () => subscription },
  paymentLinks: { retrieve: async () => ({ url: 'https://unused.example' }) }
} as unknown as Stripe;
const app = express();
installPaymentRoutes(app, stripe, () => client, () => true);
const request = async (method: 'get' | 'post', path: string, body: any = {}, query: any = {}) => {
  const layer = (app as any)._router.stack.find((item: any) => item.route && item.route.methods[method] && item.route.path.includes('/auraslim-api/' + path));
  assert.ok(layer, 'Missing route ' + path);
  let status = 200, data: any;
  const res = { set() { return this; }, status(value: number) { status = value; return this; }, json(value: any) { data = value; return this; } };
  await layer.route.stack.at(-1).handle({ body, query, protocol: 'https', get: () => 'auraslim.example' }, res);
  return { status, data };
};
try {
  const checkout = { plan: 'scan_meals', returnTab: 'photos', returnUrl: 'https://auraslim.example/?theme=light&session_id=cs_test_old' };
  let result = await request('post', 'checkout', checkout);
  assert.equal(result.status, 200);
  assert.equal(result.data.sessionId, 'cs_test_followup');
  assert.equal(created.client_reference_id, client);
  assert.equal(created.metadata.return_tab, 'photos');
  assert.ok(created.success_url.endsWith('session_id={CHECKOUT_SESSION_ID}'), 'The literal Stripe placeholder must remain unencoded');
  const success = new URL(created.success_url);
  assert.equal(success.searchParams.get('return_tab'), 'photos');
  assert.equal(success.searchParams.get('checkout'), 'success');
  assert.equal(success.searchParams.get('theme'), 'light');
  assert.equal(success.searchParams.getAll('session_id').length, 1);
  const cancel = new URL(created.cancel_url);
  assert.equal(cancel.searchParams.get('return_tab'), 'photos');
  assert.equal(cancel.searchParams.get('checkout'), 'cancel');
  assert.equal(cancel.searchParams.get('session_id'), null);
  assert.equal((await request('post', 'checkout', { ...checkout, returnUrl: 'https://untrusted.example/' })).status, 503);
  assert.equal((await request('post', 'checkout', { ...checkout, returnTab: 'admin' })).status, 400);
  assert.equal((await request('post', 'checkout', { ...checkout, plan: 'free' })).status, 400);
  price = { ...price, unit_amount: 999 };
  assert.equal((await request('post', 'checkout', checkout)).status, 422);
  price = { ...price, unit_amount: 399 };
  delete process.env.STRIPE_PRICE_SCAN_MEALS;
  assert.equal((await request('post', 'checkout', checkout)).status, 503);
  process.env.STRIPE_PRICE_SCAN_MEALS = 'price_meals';
  delete process.env.APP_URL;
  assert.equal((await request('post', 'checkout', checkout)).status, 200, 'Same-origin HTTPS return must work without an explicit APP_URL');
  const entitlement = () => request('get', 'entitlement', {}, { session_id: 'cs_test_followup' });
  result = await entitlement();
  assert.equal(result.data.active, true);
  assert.equal(result.data.plan, 'scan_meals');
  assert.equal(result.data.returnTab, 'photos');
  session = { ...session, payment_status: 'unpaid' };
  assert.equal((await entitlement()).data.active, false);
  session = { ...session, payment_status: 'paid', status: 'open' };
  assert.equal((await entitlement()).data.active, false);
  session = { ...session, status: 'complete' };
  subscription = { ...subscription, status: 'canceled' };
  assert.equal((await entitlement()).data.active, false);
  subscription = { ...subscription, status: 'active' };
  session = { ...session, client_reference_id: 'b'.repeat(48) };
  assert.equal((await entitlement()).status, 403);
  assert.equal((await request('get', 'entitlement', {}, { session_id: 'invalid' })).status, 400);
  console.log('PASS: Jour 1/2 history rendering, calendar dates, Stripe success/cancel return URLs, saved screen/scroll, verified payment, unpaid and cross-device rejection (Stripe mocked).');
} finally {
  for (const key of ['APP_URL', 'STRIPE_PRICE_SCAN_MEALS', 'STRIPE_PRICE_PROGRESS_VIDEO', 'STRIPE_PRICE_COMPLETE_PACK']) {
    if (envBefore[key] === undefined) delete process.env[key]; else process.env[key] = envBefore[key];
  }
}
