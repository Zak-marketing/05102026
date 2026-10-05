import type express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

type Plan = 'scan_meals' | 'progress_video' | 'complete_pack';
const plans = new Set<Plan>(['scan_meals', 'progress_video', 'complete_pack']);
const password = process.env.AURASLIM_ADMIN_PASSWORD || '';
const enabled = password.length >= 20;
const directory = path.resolve(process.env.AURASLIM_DATA_DIR || '.auraslim-data');
// Keep data on a persistent private volume. Never include this directory in a ZIP or a Git commit.
if (enabled) mkdirSync(directory, { recursive: true, mode: 0o700 });
const db = enabled ? new DatabaseSync(path.join(directory, 'admin.sqlite')) : null;
db?.exec(`PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS customers (client_id TEXT PRIMARY KEY, updated_at INTEGER NOT NULL, snapshot TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS grants (id TEXT PRIMARY KEY, code_hash TEXT UNIQUE NOT NULL, client_id TEXT, plan TEXT NOT NULL, duration_days INTEGER NOT NULL, created_at INTEGER NOT NULL, claimed_at INTEGER, expires_at INTEGER, revoked_at INTEGER);
  CREATE INDEX IF NOT EXISTS grants_client ON grants(client_id);
  CREATE TABLE IF NOT EXISTS subscriptions (session_id TEXT PRIMARY KEY, client_id TEXT NOT NULL, subscription_id TEXT, plan TEXT NOT NULL, status TEXT NOT NULL, checked_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS subscriptions_client ON subscriptions(client_id);`);
const sessions = new Map<string, number>();
const cookieName = 'auraslim_admin_session';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const cookie = (req: express.Request, name: string) => (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
const adminSession = (req: express.Request) => {
  const token = cookie(req, cookieName);
  if (!token || !sessions.has(token)) return false;
  if (sessions.get(token)! < Date.now()) { sessions.delete(token); return false; }
  return true;
};
function requireAdmin(req: express.Request, res: express.Response) {
  if (!enabled) { res.status(503).json({ error: 'Définissez AURASLIM_ADMIN_PASSWORD (au moins 20 caractères) et un stockage persistant sur le serveur.' }); return false; }
  if (!adminSession(req)) { res.status(401).json({ error: 'Connexion administrateur requise.' }); return false; }
  return true;
}
function writeRequest(req: express.Request, res: express.Response) {
  const origin = req.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      const host = req.get('host');
      if (originHost !== host) { res.status(403).json({ error: 'Origine refusée.' }); return false; }
    } catch {
      res.status(403).json({ error: 'Origine refusée.' }); return false;
    }
  }
  if (req.get('x-auraslim-request') !== '1') { res.status(403).json({ error: 'En-tête de sécurité manquant.' }); return false; }
  return true;
}
const limitedText = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const numeric = (value: unknown, min: number, max: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const dateOnly = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
const toRows = (value: unknown, cap: number, map: (row: Record<string, unknown>) => object | null) =>
  Array.isArray(value) ? value.slice(0, cap).map(row => row && typeof row === 'object' ? map(row as Record<string, unknown>) : null).filter(Boolean) : [];

export function recordStripeSubscription(clientId: string, sessionId: string, subscriptionId: string, plan: string, status: string) {
  if (!db || !plans.has(plan as Plan) || !/^[a-f0-9]{48}$/.test(clientId)) return;
  db.prepare('INSERT INTO subscriptions VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(session_id) DO UPDATE SET subscription_id=excluded.subscription_id, plan=excluded.plan, status=excluded.status, checked_at=excluded.checked_at')
    .run(sessionId, clientId, subscriptionId, plan, status, Date.now());
}

export function installAdminRoutes(app: express.Express, clientId: (req: express.Request, res: express.Response) => string, rateLimit: (req: express.Request, res: express.Response, max?: number) => boolean) {
  const base = '/auraslim-api';
  app.get(`${base}/admin/session`, (req, res) => res.set('Cache-Control', 'no-store').json({ configured: enabled, authenticated: enabled && adminSession(req) }));
  app.post(`${base}/admin/login`, (req, res) => {
    if (!rateLimit(req, res, 5) || !writeRequest(req, res)) return;
    if (!enabled) { res.status(503).json({ error: 'Mot de passe administrateur non configuré sur le serveur.' }); return; }
    const submitted = typeof req.body?.password === 'string' ? req.body.password : '';
    const a = Buffer.from(hash(password), 'hex'), b = Buffer.from(hash(submitted), 'hex');
    if (!timingSafeEqual(a, b)) { res.status(401).json({ error: 'Identifiants incorrects.' }); return; }
    const token = randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + 8 * 3600_000);
    res.cookie(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 3600_000, path: '/' });
    res.set('Cache-Control', 'no-store').json({ authenticated: true });
  });
  app.post(`${base}/admin/logout`, (req, res) => {
    if (!writeRequest(req, res)) return;
    const token = cookie(req, cookieName); if (token) sessions.delete(token);
    res.clearCookie(cookieName, { path: '/' }).json({ authenticated: false });
  });
  app.get(`${base}/admin/customers`, (req, res) => {
    if (!requireAdmin(req, res) || !rateLimit(req, res, 30)) return;
    const offset = Math.min(10_000, Math.max(0, Number(req.query.offset) || 0));
    const rows = db!.prepare('SELECT client_id, updated_at, snapshot FROM customers ORDER BY updated_at DESC LIMIT 51 OFFSET ?').all(offset) as { client_id: string; updated_at: number; snapshot: string }[];
    const customers = rows.slice(0, 50).map(row => {
      const subscription = db!.prepare('SELECT plan, status, checked_at FROM subscriptions WHERE client_id = ? ORDER BY checked_at DESC LIMIT 1').get(row.client_id);
      const grants = db!.prepare('SELECT id, plan, expires_at, revoked_at FROM grants WHERE client_id = ? ORDER BY created_at DESC').all(row.client_id);
      return { clientId: row.client_id, updatedAt: row.updated_at, ...JSON.parse(row.snapshot), subscription, grants };
    });
    res.set('Cache-Control', 'no-store').json({ customers, hasMore: rows.length > 50, offset });
  });
  app.get(`${base}/admin/grants`, (req, res) => {
    if (!requireAdmin(req, res) || !rateLimit(req, res, 30)) return;
    const grants = db!.prepare('SELECT id, client_id, plan, duration_days, created_at, claimed_at, expires_at, revoked_at FROM grants ORDER BY created_at DESC LIMIT 200').all();
    res.set('Cache-Control', 'no-store').json({ grants });
  });
  app.get(`${base}/admin/subscriptions`, (req, res) => {
    if (!requireAdmin(req, res) || !rateLimit(req, res, 30)) return;
    const subscriptions = db!.prepare('SELECT client_id, plan, status, checked_at FROM subscriptions ORDER BY checked_at DESC LIMIT 200').all();
    res.set('Cache-Control', 'no-store').json({ subscriptions });
  });
  app.delete(`${base}/admin/customers/:id`, (req, res) => {
    if (!requireAdmin(req, res) || !writeRequest(req, res) || !rateLimit(req, res, 15)) return;
    const id = String(req.params.id || '');
    if (!/^[a-f0-9]{48}$/.test(id)) { res.status(400).json({ error: 'Identifiant incorrect.' }); return; }
    db!.prepare('DELETE FROM customers WHERE client_id = ?').run(id);
    res.json({ deleted: true });
  });
  app.post(`${base}/admin/grants`, (req, res) => {
    if (!requireAdmin(req, res) || !writeRequest(req, res) || !rateLimit(req, res, 15)) return;
    const plan = req.body?.plan as Plan, days = Number(req.body?.days);
    if (!plans.has(plan) || !Number.isInteger(days) || days < 1 || days > 90) { res.status(400).json({ error: 'Offre ou durée incorrecte (1 à 90 jours).' }); return; }
    const code = randomBytes(24).toString('base64url');
    const id = randomBytes(12).toString('hex');
    db!.prepare('INSERT INTO grants (id, code_hash, plan, duration_days, created_at) VALUES (?, ?, ?, ?, ?)').run(id, hash(code), plan, days, Date.now());
    res.set('Cache-Control', 'no-store').status(201).json({ id, code, plan, days });
  });
  app.post(`${base}/admin/grants/:id/revoke`, (req, res) => {
    if (!requireAdmin(req, res) || !writeRequest(req, res) || !rateLimit(req, res, 15)) return;
    db!.prepare('UPDATE grants SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').run(Date.now(), String(req.params.id));
    res.json({ revoked: true });
  });
  app.get(`${base}/access`, (req, res) => {
    if (!rateLimit(req, res, 30)) return;
    const rows = db?.prepare('SELECT plan, expires_at FROM grants WHERE client_id = ? AND revoked_at IS NULL AND expires_at > ?').all(clientId(req, res), Date.now()) as { plan: Plan; expires_at: number }[] | undefined;
    res.set('Cache-Control', 'no-store').json({ grants: rows || [] });
  });
  app.post(`${base}/access/redeem`, (req, res) => {
    if (!writeRequest(req, res) || !rateLimit(req, res, 10)) return;
    if (!db) { res.status(503).json({ error: 'Essais administrateur non configurés.' }); return; }
    const code = limitedText(req.body?.code, 100);
    if (!/^[A-Za-z0-9_-]{32}$/.test(code)) { res.status(400).json({ error: 'Code invalide.' }); return; }
    const grant = db.prepare('SELECT id, client_id, duration_days FROM grants WHERE code_hash = ? AND revoked_at IS NULL').get(hash(code)) as { id: string; client_id: string | null; duration_days: number } | undefined;
    const id = clientId(req, res);
    if (!grant || (grant.client_id && grant.client_id !== id)) { res.status(404).json({ error: 'Code expiré, déjà utilisé ou inconnu.' }); return; }
    if (!grant.client_id) db.prepare('UPDATE grants SET client_id = ?, claimed_at = ?, expires_at = ? WHERE id = ? AND client_id IS NULL').run(id, Date.now(), Date.now() + grant.duration_days * 86400_000, grant.id);
    const rows = db.prepare('SELECT plan, expires_at FROM grants WHERE client_id = ? AND revoked_at IS NULL AND expires_at > ?').all(id, Date.now());
    res.set('Cache-Control', 'no-store').json({ grants: rows });
  });
  app.post(`${base}/admin-sync`, (req, res) => {
    if (!writeRequest(req, res) || !rateLimit(req, res, 20)) return;
    if (!db) { res.status(503).json({ error: 'Suivi administrateur non configuré.' }); return; }
    if (req.body?.consent !== true) { res.status(400).json({ error: 'Consentement explicite requis.' }); return; }
    const profile = req.body?.profile || {};
    const email = limitedText(profile.email, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { res.status(400).json({ error: 'Email invalide.' }); return; }
    const snapshot = {
      name: limitedText(profile.name, 120), email, phone: limitedText(profile.phone, 30), country: limitedText(profile.country, 100), countryCode: limitedText(profile.countryCode, 3),
      language: limitedText(profile.preferredLanguage, 15), goal: profile.weightGoal === 'gain' ? 'gain' : 'lose',
      age: numeric(profile.age, 13, 120), heightCm: numeric(profile.heightCm, 50, 250),
      startingWeight: numeric(profile.startingWeight, 20, 500), currentWeight: numeric(profile.currentWeight, 20, 500), targetWeight: numeric(profile.targetWeight, 20, 500),
      calorieTarget: numeric(profile.dailyCalorieTarget, 500, 10_000), waterGoalLiters: numeric(profile.waterGoalLiters, 0, 20), scans: numeric(profile.imagesCalorieScannedCount, 0, 1_000_000),
      photoCount: numeric(req.body?.photoCount, 0, 100_000),
      weights: toRows(req.body?.weights, 500, row => {
        const weight = numeric(row.weight, 20, 500), date = dateOnly(row.date);
        return weight !== null && date ? { date, weight, waistCm: numeric(row.waistCm, 20, 300), mood: limitedText(row.mood, 20) } : null;
      }),
      meals: toRows(req.body?.meals, 1000, row => {
        const calories = numeric(row.calories, 0, 10_000), date = dateOnly(row.date);
        return calories !== null && date ? { date, calories, mealType: limitedText(row.mealType, 20), name: limitedText(row.name, 80) } : null;
      }),
      water: toRows(req.body?.water, 1000, row => {
        const amountMl = numeric(row.amountMl, 0, 5000), date = dateOnly(row.date);
        return amountMl !== null && date ? { date, amountMl } : null;
      })
    };
    db.prepare('INSERT INTO customers VALUES (?, ?, ?) ON CONFLICT(client_id) DO UPDATE SET updated_at=excluded.updated_at, snapshot=excluded.snapshot').run(clientId(req, res), Date.now(), JSON.stringify(snapshot));
    res.json({ saved: true });
  });
  app.delete(`${base}/admin-sync`, (req, res) => {
    if (!writeRequest(req, res) || !rateLimit(req, res, 20)) return;
    db?.prepare('DELETE FROM customers WHERE client_id = ?').run(clientId(req, res));
    res.json({ deleted: true });
  });
}
