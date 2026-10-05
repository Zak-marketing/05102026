import React, { useEffect, useState } from 'react';
import { AuraLogo } from './AuraLogo';

type Plan = 'scan_meals' | 'progress_video' | 'complete_pack';
type Grant = { id: string; client_id: string | null; plan: Plan; duration_days: number; created_at: number; claimed_at: number | null; expires_at: number | null; revoked_at: number | null };
type Subscription = { client_id: string; plan: Plan; status: string; checked_at: number };
type Customer = { clientId: string; updatedAt: number; name: string; email: string; phone: string; country: string; countryCode: string; language: string; goal: string;
  age: number | null; heightCm: number | null; startingWeight: number | null; currentWeight: number | null; targetWeight: number | null; calorieTarget: number | null; waterGoalLiters: number | null;
  scans: number | null; photoCount: number | null; weights: { date: string; weight: number; waistCm: number | null; mood: string }[];
  meals: { date: string; name: string; mealType: string; calories: number }[]; water: { date: string; amountMl: number }[];
  subscription: { plan: string; status: string; checked_at: number } | null; grants: { id: string; plan: string; expires_at: number | null; revoked_at: number | null }[] };
const label: Record<Plan, string> = { scan_meals: 'Scan repas', progress_video: 'Photos et vidéo', complete_pack: 'Pack complet' };
const when = (date: number | null | undefined) => date ? new Date(date).toLocaleString('fr-FR') : '—';
const request = async (url: string, method = 'GET', body?: object) => {
  const response = await fetch(`/auraslim-api/${url}`, { method, credentials: 'same-origin', headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-AuraSlim-Request': '1' }, body: body ? JSON.stringify(body) : undefined });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Opération impossible.');
  return payload;
};

export const AdminConsole: React.FC = () => {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [grants, setGrants] = useState<Grant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [plan, setPlan] = useState<Plan>('complete_pack');
  const [days, setDays] = useState(14);
  const [newCode, setNewCode] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = async (page = offset) => {
    const [users, codes, payments] = await Promise.all([request(`admin/customers?offset=${page}`), request('admin/grants'), request('admin/subscriptions')]);
    setCustomers(users.customers); setHasMore(users.hasMore); setOffset(page); setGrants(codes.grants); setSubscriptions(payments.subscriptions);
  };
  useEffect(() => { request('admin/session').then(session => { setConfigured(session.configured); setAuthenticated(session.authenticated); }).catch(err => setError(err.message)); }, []);
  useEffect(() => { if (authenticated) void refresh(0).catch(err => setError(err.message)); }, [authenticated]);
  useEffect(() => {
    if (!authenticated) return;
    const update = () => { if (document.visibilityState === 'visible') void refresh(offset).catch(err => setError(err.message)); };
    const timer = window.setInterval(update, 15_000);
    document.addEventListener('visibilitychange', update);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, [authenticated, offset]);
  const perform = async (action: () => Promise<void>) => { setBusy(true); setError(''); try { await action(); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur.'); } finally { setBusy(false); } };
  const chosen = customers.find(customer => customer.clientId === selected) || customers[0];
  const activeGrant = (item: Grant) => !item.revoked_at && (!item.expires_at || item.expires_at > Date.now());
  return <div className="min-h-[100dvh] bg-slate-950 p-3 text-white sm:p-6">
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-4"><AuraLogo compact/><div><span className="rounded-lg bg-amber-500/15 px-3 py-2 text-amber-300">Administration · environnement de test</span> <a href="/" className="ml-3 underline">Retour à l’application</a></div></header>
    <main className="mx-auto max-w-7xl space-y-6 py-6">
      {error && <p role="alert" className="rounded-lg border border-rose-500/40 p-3 text-rose-300">{error}</p>}
      {configured === null && <p>Vérification de la configuration…</p>}
      {configured === false && <p className="rounded-xl border border-amber-500/30 p-4 text-amber-200">Espace admin désactivé. Configurez AURASLIM_ADMIN_PASSWORD (20 caractères minimum) et AURASLIM_DATA_DIR sur le serveur, puis redémarrez-le.</p>}
      {configured && !authenticated && <form onSubmit={event => { event.preventDefault(); void perform(async () => { await request('admin/login', 'POST', { password }); setPassword(''); setAuthenticated(true); }); }} className="mx-auto max-w-md space-y-3 rounded-2xl border border-slate-700 p-5">
        <h1 className="text-2xl font-bold">Connexion administrateur</h1><label className="block">Mot de passe serveur<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 p-3"/></label>
        <button disabled={busy} className="action-primary rounded-lg px-5 py-2 font-bold">Se connecter</button>
      </form>}
      {authenticated && <>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Suivi administrateur</h1><p className="text-sm text-slate-400">Profils ayant autorisé le partage. Actualisation toutes les 15 secondes si cette page est visible. Coordonnées déclarées, non vérifiées ; photos, notes et schémas restent sur les appareils.</p></div><div className="flex gap-2"><button className="rounded-lg bg-slate-700 px-3 py-2" onClick={() => void perform(() => refresh(0))}>Actualiser</button><button className="rounded-lg bg-slate-700 px-3 py-2" onClick={() => void perform(async () => { await request('admin/logout', 'POST'); setAuthenticated(false); setCustomers([]); setGrants([]); setSubscriptions([]); setNewCode(''); })}>Déconnexion</button></div></div>
        <section className="rounded-2xl border border-slate-700 p-4"><h2 className="text-lg font-bold">Créer un accès d’essai gratuit</h2><p className="mt-1 text-xs text-slate-400">Le code est affiché une seule fois. Transmettez-le à la personne concernée ; il sera valable sur un seul navigateur pendant la durée choisie à partir de son activation.</p>
          <div className="mt-3 flex flex-wrap items-end gap-3"><label>Offre<select value={plan} onChange={event => setPlan(event.target.value as Plan)} className="mt-1 block rounded-lg border border-slate-600 bg-slate-900 p-2"><option value="scan_meals">Scan repas</option><option value="progress_video">Photos et vidéo</option><option value="complete_pack">Pack complet</option></select></label>
            <label>Jours<input type="number" min={1} max={90} value={days} onChange={event => setDays(Number(event.target.value))} className="mt-1 block w-24 rounded-lg border border-slate-600 bg-slate-900 p-2"/></label>
            <button disabled={busy} className="action-primary rounded-lg px-4 py-2 font-bold" onClick={() => void perform(async () => { const grant = await request('admin/grants', 'POST', { plan, days }); setNewCode(grant.code); await refresh(); })}>Créer le code</button></div>
          {newCode && <div role="status" className="mt-3 break-all rounded-lg border border-emerald-500 p-3">Code à copier maintenant : <strong className="select-all">{newCode}</strong><button className="ml-3 underline" onClick={() => void navigator.clipboard.writeText(newCode)}>Copier</button></div>}
          <div className="mt-4 max-h-48 overflow-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead><tr><th>Créé</th><th>Offre</th><th>Durée</th><th>Activé</th><th>Expire</th><th>État</th><th></th></tr></thead><tbody>{grants.map(item => <tr key={item.id} className="border-t border-slate-700"><td>{when(item.created_at)}</td><td>{label[item.plan]}</td><td>{item.duration_days} j</td><td>{when(item.claimed_at)}</td><td>{when(item.expires_at)}</td><td>{item.revoked_at ? 'Révoqué' : item.expires_at && item.expires_at < Date.now() ? 'Expiré' : item.claimed_at ? 'Actif' : 'À activer'}</td><td>{activeGrant(item) && <button disabled={busy} className="text-rose-300 underline" onClick={() => void perform(async () => { await request(`admin/grants/${item.id}/revoke`, 'POST'); await refresh(); })}>Révoquer</button>}</td></tr>)}</tbody></table></div>
        </section>
        <section className="rounded-2xl border border-slate-700 p-4"><h2 className="text-lg font-bold">Abonnements Stripe vérifiés ({subscriptions.length} sessions récentes)</h2><p className="mt-1 text-xs text-slate-400">Dernier état contrôlé par le serveur après le retour du checkout ; les renouvellements et changements ultérieurs demandent un webhook Stripe ou une nouvelle vérification. Un appareil sans suivi partagé n’a pas de coordonnées dans cette liste.</p>
          <div className="mt-3 max-h-48 overflow-x-auto"><table className="w-full min-w-[630px] text-left text-xs"><thead><tr><th>Appareil</th><th>Offre</th><th>État</th><th>Vérifié le</th></tr></thead><tbody>{subscriptions.map((item, index) => <tr key={`${item.client_id}-${index}`} className="border-t border-slate-700"><td className="font-mono">{item.client_id.slice(0, 12)}…</td><td>{label[item.plan] || item.plan}</td><td>{item.status}</td><td>{when(item.checked_at)}</td></tr>)}</tbody></table></div>
        </section>
        <section className="rounded-2xl border border-slate-700 p-4"><h2 className="text-lg font-bold">Utilisateurs ayant accepté le suivi ({customers.length} sur cette page)</h2>
          <div className="mt-3 flex flex-wrap gap-2">{customers.map(customer => <button key={customer.clientId} onClick={() => setSelected(customer.clientId)} className={`rounded-lg border px-3 py-2 text-left text-sm ${chosen?.clientId === customer.clientId ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700'}`}>{customer.name || customer.email}<span className="block text-xs text-slate-400">{customer.country} · {customer.email}</span></button>)}{!customers.length && <p className="text-sm text-slate-400">Aucun utilisateur n’a encore autorisé le partage de son suivi.</p>}</div>
          <div className="mt-3 flex gap-2"><button disabled={!offset || busy} className="disabled:opacity-40" onClick={() => void perform(() => refresh(Math.max(0, offset - 50)))}>← Précédent</button><button disabled={!hasMore || busy} className="disabled:opacity-40" onClick={() => void perform(() => refresh(offset + 50))}>Suivant →</button></div>
        </section>
        {chosen && <section className="space-y-4 rounded-2xl border border-slate-700 p-4"><div className="flex flex-wrap justify-between gap-2"><h2 className="text-xl font-bold">{chosen.name} · {chosen.country}</h2><span className="text-sm text-slate-400">Dernière synchronisation : {when(chosen.updatedAt)}</span></div>
          <button className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs text-rose-300" onClick={() => { if (window.confirm('Effacer définitivement les données de suivi serveur de cette personne ?')) void perform(async () => { await request(`admin/customers/${chosen.clientId}`, 'DELETE'); setSelected(''); await refresh(); }); }}>Effacer le suivi de cette personne</button>
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">{Object.entries({ Email: chosen.email, Téléphone: chosen.phone, Pays: `${chosen.country} (${chosen.countryCode})`, Langue: chosen.language, 'Abonnement Stripe': chosen.subscription ? `${chosen.subscription.plan} · ${chosen.subscription.status} (contrôlé ${when(chosen.subscription.checked_at)})` : 'Aucun paiement vérifié sur cet appareil', 'Essai actif': chosen.grants.filter(item => !item.revoked_at && (item.expires_at || 0) > Date.now()).map(item => `${item.plan} jusqu’au ${when(item.expires_at)}`).join(', ') || 'Aucun', Objectif: chosen.goal === 'gain' ? 'Prise de poids' : 'Perte de poids', Âge: chosen.age, Taille: chosen.heightCm && `${chosen.heightCm} cm`, Départ: chosen.startingWeight && `${chosen.startingWeight} kg`, Actuel: chosen.currentWeight && `${chosen.currentWeight} kg`, Cible: chosen.targetWeight && `${chosen.targetWeight} kg`, 'Cible calorique': chosen.calorieTarget && `${chosen.calorieTarget} kcal/j`, 'Cible eau': chosen.waterGoalLiters && `${chosen.waterGoalLiters} L/j`, Scans: chosen.scans, Photos: chosen.photoCount }).map(([name, value]) => <div key={name} className="rounded-lg bg-slate-900 p-3"><dt className="text-slate-400">{name}</dt><dd className="break-words font-semibold">{value || '—'}</dd></div>)}</dl>
          <div className="grid gap-4 lg:grid-cols-3">{[["Pesées", chosen.weights.map(row => `${row.date} · ${row.weight} kg${row.waistCm ? ` · taille ${row.waistCm} cm` : ''} · ${row.mood}`)], ["Repas", chosen.meals.map(row => `${row.date} · ${row.mealType} · ${row.name} · ${row.calories} kcal`)], ["Hydratation", Object.entries(chosen.water.reduce<Record<string, number>>((acc, row) => { acc[row.date] = (acc[row.date] || 0) + row.amountMl; return acc; }, {})).map(([date, ml]) => `${date} · ${ml} ml`)]].map(([title, items]) => <div key={title as string} className="rounded-xl border border-slate-700 p-3"><h3 className="font-bold">{title as string}</h3><ul className="mt-2 max-h-52 space-y-1 overflow-y-auto text-xs text-slate-300">{(items as string[]).slice(0, 100).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>)}</div>
        </section>}
      </>}
    </main>
  </div>;
};
