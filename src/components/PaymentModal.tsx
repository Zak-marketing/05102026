import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Crown, Loader2 } from 'lucide-react';
import { STRIPE_PRODUCTS, type UserPlan, type UserProfile, type CheckoutTab } from '../types';
import type { ThemeColors } from '../services/theme';
import type { TranslationDictionary } from '../services/i18n';
import { auraSlimApi } from '../services/apiClient';
import { PENDING_CHECKOUT_KEY, cleanPaymentReturnUrl, isCheckoutSession, type PendingCheckout } from '../services/paymentReturn';

interface Props { 
  isOpen: boolean; 
  profile: UserProfile; 
  theme: ThemeColors; 
  t: TranslationDictionary; 
  initialPlan?: UserPlan;
  returnTab: CheckoutTab;
  onClose: () => void; 
  onCheckoutPrepared: (checkout: PendingCheckout) => void;
}

export const PaymentModal: React.FC<Props> = ({ 
  isOpen, 
  profile,
  theme, 
  t, 
  initialPlan,
  returnTab,
  onClose,
  onCheckoutPrepared
}) => {
  const [selected, setSelected] = useState<UserPlan>(initialPlan || STRIPE_PRODUCTS[2].planKey);
  const [preparing, setPreparing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    if (initialPlan) {
      setSelected(initialPlan);
    }
  }, [initialPlan]);
  useEffect(() => { if (isOpen) setCheckoutError(''); }, [isOpen]);

  if (!isOpen) return null;

  const product = STRIPE_PRODUCTS.find(item => item.planKey === selected) || STRIPE_PRODUCTS[2];

  const handleCheckoutClick = async () => {
    if (preparing) return;
    // Stripe cannot render inside an embedded preview. Open its tab during
    // the user's click so the browser can allow it, then navigate after preparation.
    const framed = window.self !== window.top;
    const checkoutWindow = framed ? window.open('', '_blank') : null;
    if (framed && !checkoutWindow) { setCheckoutError(t.paymentPopupBlocked || 'Autorisez l’ouverture de l’onglet de paiement dans votre navigateur.'); return; }
    setPreparing(true);
    setCheckoutError('');
    try {
      const response = await auraSlimApi('checkout', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-AuraSlim-Request': '1' },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          plan: product.planKey, currency: 'EUR', returnTab,
          returnUrl: cleanPaymentReturnUrl(window.location.href)
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t.paymentPrepError);
      const url = new URL(payload.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || !isCheckoutSession(payload.sessionId)) {
        throw new Error(t.paymentPrepError || 'Le lien de paiement reçu est invalide.');
      }
      const pending: PendingCheckout = {
        sessionId: payload.sessionId, tab: returnTab, scrollY: window.scrollY, startedAt: Date.now()
      };
      localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
      onCheckoutPrepared(pending);
      if (checkoutWindow) {
        checkoutWindow.opener = null;
        checkoutWindow.location.href = url.href;
        onClose();
      } else {
        window.location.assign(url.href);
      }
    } catch (error) {
      checkoutWindow?.close();
      setCheckoutError(error instanceof Error ? error.message : (t.paymentPrepError || 'Paiement indisponible.'));
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-label={t.paymentModalTitle || "Choisir un abonnement"} 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-5 flex items-center justify-center"
    >
      <section className={`mx-auto my-4 w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl border ${theme.cardBorder} ${theme.cardBg} relative max-h-[92dvh] overflow-y-auto`}>
        {/* Header with Palette-compliant Close Button (No black cross) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                {t.paymentModalTitle || "Abonnements AuraSlim Premium"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.paymentSecureReturn || 'Paiement sécurisé · retour automatique'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            aria-label={t.closeBtn || "Fermer"} 
            className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition flex items-center justify-center shadow-sm"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          {t.paymentTariffsDesc || "Choisissez votre option. Après règlement, vous revenez à cet écran."}
        </p>

        {/* 3 Stripe Products List */}
        <div className="mt-4 grid gap-3">
          {STRIPE_PRODUCTS.map(item => {
            const isSelected = selected === item.planKey;
            const isPlanActive = profile.plan === item.planKey || profile.plan === 'complete_pack';

            return (
              <div 
                key={item.id}
                onClick={() => { if (!preparing) setSelected(item.planKey); }}
                className={`rounded-2xl border p-4 text-left cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-orange-500 bg-orange-500/10 dark:bg-orange-950/20 ring-2 ring-orange-500/40 shadow-lg shadow-orange-950/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                      {isPlanActive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          {t.activeBadge || "✓ Actif"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 block font-heading">
                      {item.priceEur.toFixed(2).replace('.', ',')} €
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">/mois</span>
                  </span>
                </div>

                {/* Features Pill List */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {item.features.map((feat, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls for Selected Product */}
        <div className="mt-5 space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-2.5">
            {/* Direct Stripe Checkout Button */}
            <button 
              type="button"
              onClick={handleCheckoutClick}
              disabled={preparing}
              className="w-full action-primary flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold shadow-lg shadow-orange-500/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait"
            >
              <span>{preparing ? (t.paymentPreparingLink || 'Préparation du paiement…') : (t.payOnStripeBtn || "Payer sur Stripe")}</span>
              {preparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4 text-white" />}
            </button>
          </div>
          {checkoutError && <p role="alert" className="text-sm text-rose-500 break-words">{checkoutError}</p>}

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {t.paymentCheckoutDisclaimer || "Stripe vous ramène à l’écran d’origine. L’option est activée après vérification du paiement."}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
