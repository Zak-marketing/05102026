import type express from 'express';
import type Stripe from 'stripe';
import { STRIPE_PRODUCTS } from '../src/types/index.ts';
import { isCheckoutTab } from '../src/services/paymentReturn.ts';
import { recordStripeSubscription } from './admin.ts';

const allowedCurrencies = new Set(['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'AUD', 'JPY', 'MAD', 'DZD', 'BRL', 'INR', 'AED']);
const priceEnv = {
  scan_meals: 'STRIPE_PRICE_SCAN_MEALS',
  progress_video: 'STRIPE_PRICE_PROGRESS_VIDEO',
  complete_pack: 'STRIPE_PRICE_COMPLETE_PACK'
} as const;
const apiPaths = (suffix: string) => ['/api/' + suffix, '/auraslim-api/' + suffix];

function checkoutReturnAddress(req: express.Request): URL | null {
  const address = process.env.APP_URL || req.protocol + '://' + (req.get('host') || '') + '/';
  try {
    const base = new URL(address);
    if ((base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname))) ||
      base.username || base.password) return null;
    const requested = typeof req.body?.returnUrl === 'string' ? new URL(req.body.returnUrl) : base;
    // A client may return to its current path, never to an unrelated origin.
    if (requested.origin !== base.origin || requested.username || requested.password) return null;
    for (const key of ['session_id', 'checkout', 'return_tab', 'payment_success', 'plan']) requested.searchParams.delete(key);
    requested.hash = '';
    return requested;
  } catch { return null; }
}

export function installPaymentRoutes(
  app: express.Express,
  stripe: Stripe | null,
  clientId: (req: express.Request, res: express.Response) => string,
  rateLimit: (req: express.Request, res: express.Response, max?: number) => boolean
) {
  app.post(apiPaths('checkout'), async (req, res) => {
    if (!rateLimit(req, res)) return;
    const product = STRIPE_PRODUCTS.find(item => item.planKey === String(req.body?.plan || ''));
    if (!product) { res.status(400).json({ error: 'Forfait inconnu.' }); return; }
    const currency = String(req.body?.currency || 'EUR').toUpperCase();
    if (!allowedCurrencies.has(currency)) { res.status(400).json({ error: 'Devise non disponible.' }); return; }
    const returnTab = req.body?.returnTab || 'progress';
    if (!isCheckoutTab(returnTab)) { res.status(400).json({ error: 'Écran de retour inconnu.' }); return; }
    const env = priceEnv[product.planKey as keyof typeof priceEnv];
    const priceId = env && process.env[env];
    if (!stripe || !priceId) {
      res.status(503).json({ error: 'Paiement indisponible : configurez STRIPE_SECRET_KEY et le STRIPE_PRICE_* de cette offre sur le serveur.' }); return;
    }
    const returnAddress = checkoutReturnAddress(req);
    if (!returnAddress) {
      res.status(503).json({ error: 'Configurez APP_URL avec l’adresse HTTPS de cette application pour permettre le retour après paiement.' }); return;
    }
    try {
      const price = await stripe.prices.retrieve(priceId, { expand: ['currency_options'] });
      if (price.recurring?.interval !== 'month') throw new Error('Tarif mensuel absent');
      if (!price.active || price.currency !== 'eur' || price.unit_amount !== Math.round(product.priceEur * 100)) {
        res.status(422).json({ error: 'Le tarif Stripe configuré pour ' + product.name + ' doit être actif à ' + product.priceEur.toFixed(2) + ' EUR/mois.' }); return;
      }
      if (currency !== price.currency.toUpperCase() && !price.currency_options?.[currency.toLowerCase()]) {
        res.status(422).json({ error: 'Cette devise n’est pas configurée pour cet abonnement Stripe.' }); return;
      }
      const id = clientId(req, res);
      returnAddress.searchParams.set('return_tab', returnTab);
      const success = new URL(returnAddress);
      success.searchParams.set('checkout', 'success');
      const separator = success.search ? '&' : '?';
      const cancel = new URL(returnAddress);
      cancel.searchParams.set('checkout', 'cancel');
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: price.id, quantity: 1 }],
        currency: currency.toLowerCase(),
        client_reference_id: id,
        metadata: { return_tab: returnTab, plan: product.planKey },
        success_url: success.href + separator + 'session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancel.href
      });
      if (!session.url) throw new Error('Lien Stripe absent');
      res.json({ url: session.url, sessionId: session.id });
    } catch {
      res.status(502).json({ error: 'Création du paiement Stripe impossible. Vérifiez la clé et le tarif.' });
    }
  });

  app.get(apiPaths('entitlement'), async (req, res) => {
    if (!rateLimit(req, res, 32)) return;
    const sessionId = String(req.query.session_id || '');
    if (!stripe) { res.status(503).json({ error: 'Clé Stripe manquante. Aucun forfait Premium ne peut être validé.' }); return; }
    if (!/^cs_(test_|live_)[A-Za-z0-9]+$/.test(sessionId)) {
      res.status(400).json({ error: 'Référence de paiement invalide.' }); return;
    }
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const id = clientId(req, res);
      if (session.client_reference_id !== id) { res.status(403).json({ error: 'Paiement lié à un autre appareil. Contactez le support.' }); return; }
      const returnTab = isCheckoutTab(session.metadata?.return_tab) ? session.metadata.return_tab : undefined;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
      if (!subscriptionId) { res.json({ active: false, plan: 'free', returnTab }); return; }
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const price = subscription.items.data[0]?.price;
      let product = STRIPE_PRODUCTS.find(item => {
        const env = priceEnv[item.planKey as keyof typeof priceEnv];
        return env && process.env[env] === price?.id;
      });
      // Existing Payment Link subscriptions can still be verified.
      if (!product && session.payment_link) {
        const linkId = typeof session.payment_link === 'string' ? session.payment_link : session.payment_link.id;
        const link = await stripe.paymentLinks.retrieve(linkId);
        product = STRIPE_PRODUCTS.find(item => item.stripeCheckoutUrl === link.url);
      }
      const active = !!product && price?.recurring?.interval === 'month' &&
        session.status === 'complete' && session.mode === 'subscription' && session.payment_status === 'paid' &&
        ['active', 'trialing'].includes(subscription.status);
      recordStripeSubscription(id, sessionId, subscriptionId, product?.planKey || 'free', subscription.status);
      res.set('Cache-Control', 'no-store').json({
        active, plan: active ? product!.planKey : 'free',
        productName: active ? product!.name : undefined, returnTab
      });
    } catch {
      res.status(502).json({ error: 'Vérification de l’abonnement indisponible.' });
    }
  });
}
