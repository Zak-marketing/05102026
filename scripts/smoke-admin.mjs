import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
const directory = mkdtempSync(path.join(tmpdir(), 'auraslim-admin-test-'));
const port = 39783;
const app = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
  cwd: process.cwd(), env: { ...process.env, PORT: String(port), NODE_ENV: 'production', AURASLIM_ADMIN_PASSWORD: 'test-password-that-is-long-and-random', AURASLIM_DATA_DIR: directory, STRIPE_SECRET_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe']
});
let logs = '';
app.stdout.on('data', data => { logs += data; });
app.stderr.on('data', data => { logs += data; });
const base = `http://127.0.0.1:${port}/auraslim-api/`;
async function send(route, method = 'GET', body, cookies = '') {
  const response = await fetch(`${base}${route}`, { method, headers: { ...(cookies ? { cookie: cookies } : {}), ...(method !== 'GET' ? { 'Content-Type': 'application/json', 'X-AuraSlim-Request': '1' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { response, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
try {
  let ready = false;
  for (let i = 0; i < 40; i++) { if (app.exitCode !== null) throw new Error(logs); try { ready = (await send('status')).response.ok; if (ready) break; } catch {} await delay(150); }
  assert(ready, logs);
  const session = await send('admin/session'); assert.equal(session.data.authenticated, false);
  assert.equal((await send('admin/customers')).response.status, 401);
  assert.equal((await send('admin/login', 'POST', { password: 'incorrect' })).response.status, 401);
  const login = await send('admin/login', 'POST', { password: 'test-password-that-is-long-and-random' });
  assert.equal(login.response.status, 200); const adminCookie = login.cookie;
  assert.match(adminCookie, /^auraslim_admin_session=/);
  const client = await send('access'); const userCookie = client.cookie; assert.match(userCookie, /^auraslim_checkout_client=/);
  const snapshot = { consent: true, profile: { name: 'Test Customer', email: 'test@example.org', phone: '+33123456789', country: 'France', countryCode: 'FR', startingWeight: 90, currentWeight: 87, targetWeight: 75 }, weights: [{ date: '2026-09-28', weight: 87, mood: 'good', photoUrl: 'PRIVATE', notes: 'PRIVATE' }], meals: [{ date: '2026-09-28', name: 'Repas', calories: 400, mealType: 'lunch', imageUrl: 'PRIVATE' }], water: [{ date: '2026-09-28', amountMl: 250 }], photoCount: 2 };
  assert.equal((await send('admin-sync', 'POST', { ...snapshot, consent: false }, userCookie)).response.status, 400);
  assert.equal((await send('admin-sync', 'POST', snapshot, userCookie)).response.status, 200);
  const customers = await send('admin/customers', 'GET', undefined, adminCookie);
  assert.equal(customers.data.customers.length, 1);
  assert.equal(customers.data.customers[0].currentWeight, 87);
  assert(!JSON.stringify(customers.data).includes('PRIVATE'));
  const grant = await send('admin/grants', 'POST', { plan: 'complete_pack', days: 2 }, adminCookie);
  assert.equal(grant.response.status, 201); assert.match(grant.data.code, /^[A-Za-z0-9_-]{32}$/);
  const redeemed = await send('access/redeem', 'POST', { code: grant.data.code }, userCookie);
  assert.equal(redeemed.data.grants[0].plan, 'complete_pack');
  const other = await send('access');
  assert.equal((await send('access/redeem', 'POST', { code: grant.data.code }, other.cookie)).response.status, 404);
  const beforeRevoke = await send('access', 'GET', undefined, userCookie);
  assert.equal(beforeRevoke.data.grants.length, 1);
  await send(`admin/grants/${grant.data.id}/revoke`, 'POST', {}, adminCookie);
  assert.equal((await send('access', 'GET', undefined, userCookie)).data.grants.length, 0);
  await send('admin-sync', 'DELETE', undefined, userCookie);
  assert.equal((await send('admin/customers', 'GET', undefined, adminCookie)).data.customers.length, 0);
  await send('admin/logout', 'POST', undefined, adminCookie);
  assert.equal((await send('admin/customers', 'GET', undefined, adminCookie)).response.status, 401);
  console.log('OK admin: mot de passe, consentement, suivi, essai lié au navigateur, révocation, suppression et déconnexion');
} finally { app.kill('SIGTERM'); rmSync(directory, { recursive: true, force: true }); }
