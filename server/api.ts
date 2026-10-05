import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import { randomBytes } from 'node:crypto';
import { STRIPE_PRODUCTS } from '../src/types/index.ts';
import { getTranslation } from '../src/services/i18n.ts';
import { languageOptions, launchLanguageCodes } from '../src/services/locales.ts';
import { onboardingLanguageCodes } from '../src/services/onboardingTranslations.ts';
import { installAdminRoutes } from './admin.ts';
import { installPaymentRoutes } from './payments.ts';

export const apiApp = express();
const app = apiApp;
app.disable('x-powered-by');
app.set('trust proxy', 1);
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const cookieName = 'auraslim_checkout_client';
function clientId(req: express.Request, res: express.Response) {
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map(item => {
    const index = item.indexOf('='); return index < 0 ? ['', ''] : [item.slice(0, index).trim(), item.slice(index + 1).trim()];
  }));
  let id = cookies[cookieName];
  if (!id || !/^[a-f0-9]{48}$/.test(id)) {
    id = randomBytes(24).toString('hex');
    res.cookie(cookieName, id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 365 * 86400_000, path: '/' });
  }
  return id;
}
const limits = new Map<string, { until: number; count: number }>();
function rateLimit(req: express.Request, res: express.Response, max = 8) {
  const key = `${req.ip || 'unknown'}:${req.path}`, now = Date.now(), item = limits.get(key) || { until: now + 60_000, count: 0 };
  if (now > item.until) { item.until = now + 60_000; item.count = 0; }
  limits.set(key, item); if (++item.count > max) { res.status(429).json({ error: 'Trop de demandes. Réessayez dans une minute.' }); return false; }
  return true;
}
// Keep /api for older installs. AI Studio may reserve that prefix in its preview;
// new clients use an application-specific prefix to reach this Express server.
const apiPaths = (suffix: string) => [`/api/${suffix}`, `/auraslim-api/${suffix}`];
app.use(['/api', '/auraslim-api'], express.json({ limit: '6mb' }));
app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/auraslim-api/')) { next(error); return; }
  const err = error as { type?: string; status?: number };
  if (err?.type === 'entity.too.large' || err?.status === 413) {
    res.status(413).json({ error: 'La photo est trop volumineuse. Choisissez une image plus légère ou réduisez sa taille.' });
    return;
  }
  if (err?.type === 'entity.parse.failed' || err?.status === 400) {
    res.status(400).json({ error: 'La demande reçue est incomplète. Rechargez la page puis réessayez.' });
    return;
  }
  next(error);
});
app.use(['/api','/auraslim-api'],(req,res,next)=>{
 res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');
 if(['POST','PUT','DELETE','PATCH'].includes(req.method)&&req.get('origin')){
  try{const origin=new URL(req.get('origin')!);const expected=process.env.APP_URL?new URL(process.env.APP_URL).origin:`${req.protocol}://${req.get('host')}`;if(origin.origin!==expected){res.status(403).json({error:'Origine refusée.'});return;}}catch{res.status(403).json({error:'Origine invalide.'});return;}
 }next();
});
app.get(apiPaths('status'), (_req, res) => res.json({ ai: !!process.env.GEMINI_API_KEY, translation: !!process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY, stripeVerification: !!stripe }));
installAdminRoutes(app, clientId, rateLimit);

// Payment Links bind the Stripe session to this browser before granting access.
app.get(apiPaths('payment-links'), (req, res) => {
  if (!rateLimit(req, res, 16)) return;
  const id = clientId(req, res);
  res.set('Cache-Control', 'no-store').json(Object.fromEntries(STRIPE_PRODUCTS.map(product => {
    const link = new URL(product.stripeCheckoutUrl);
    link.searchParams.set('client_reference_id', id);
    return [product.planKey, link.href];
  })));
});

function getCandidateGeminiModels(): string[] {
  return [...new Set([process.env.GEMINI_MODEL?.trim(), 'gemini-3.1-flash-lite', 'gemini-flash-latest'].filter(Boolean))] as string[];
}

async function callGeminiGenerateContent(body: Record<string, unknown>): Promise<Response> {
  const models = getCandidateGeminiModels();
  let lastResponse: Response | null = null;
  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
        body: JSON.stringify(body),signal:AbortSignal.timeout(45000)
      });
      if (response.ok) return response;
      lastResponse = response;
      if (response.status === 404 || response.status === 503) {
        continue;
      }
      return response;
    } catch {
      // try next candidate
    }
  }
  if (lastResponse) return lastResponse;
  throw new Error('Service Gemini indisponible');
}

app.post(apiPaths('meal-estimate'), async (req, res) => {
  if (!rateLimit(req, res, 4)) return;
  if (!process.env.GEMINI_API_KEY) { res.status(503).json({ error: 'Analyse photo indisponible : clé Gemini non configurée sur le serveur.' }); return; }
  const image = String(req.body?.image || '');
  const requestedLanguage = String(req.body?.language || 'fr');
  const language = languageOptions.find(item => item.code === requestedLanguage)?.name || 'français';
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(image);
  if (!match || match[2].length > 4_000_000) { res.status(400).json({ error: 'Photo JPEG/PNG/WebP requise, taille maximale 3 Mo.' }); return; }
  try {
    const response = await callGeminiGenerateContent({
      contents: [{ parts: [
        { text: `Observe cette photo de repas. Réponds en JSON avec name (nom du plat), portion (grammes estimés), calories, proteins, carbs, fats (nombres pour tout le repas) et foods (tableau de chaque aliment visible : name, portion en grammes, calories estimées). Rédige name, portion et chaque foods.name en ${language}. Donne un aliment distinct par entrée, même s'il n'y en a qu'un. N'invente pas les ingrédients invisibles, la sauce ou l'huile cachée; si aucun aliment n'est reconnaissable, retourne name vide et foods vide. Les chiffres sont des estimations visuelles, jamais des mesures certaines.` },
        { inlineData: { mimeType: match[1], data: match[2] } }
      ] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    if (!response.ok) {
      const reason = response.status === 429 ? 'Quota Gemini atteint : réessayez plus tard ou vérifiez la facturation du projet.'
        : [401, 403].includes(response.status) ? 'La clé Gemini du serveur n’autorise pas cet appel. Vérifiez-la dans les secrets AI Studio.'
        : response.status === 404 ? 'Modèle Gemini introuvable : vérifiez GEMINI_MODEL sur le serveur.'
        : 'Service Gemini temporairement indisponible. Réessayez plus tard.';
      res.status(502).json({ error: reason }); return;
    }
    const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}') as Record<string, unknown>;
    const number = (field: string, max: number) => Math.min(max, Math.max(0, Number(parsed[field]) || 0));
    const name = String(parsed.name || '').slice(0, 120).trim();
    if (!name || !parsed.portion || !number('calories', 5000)) { res.status(422).json({ error: 'Repas insuffisamment reconnaissable. Prenez une photo plus nette.' }); return; }
    const foods = Array.isArray(parsed.foods) ? parsed.foods.slice(0, 15).map((food: Record<string, unknown>) => ({
      name: String(food.name || '').trim().slice(0, 80), portion: String(food.portion || '').slice(0, 30),
      calories: Math.min(5000, Math.max(0, Number(food.calories) || 0))
    })).filter(food => food.name) : [];
    if (!foods.length) { res.status(422).json({ error: 'Aliments non reconnaissables sur cette photo. Prenez une photo plus nette du plat.' }); return; }
    res.set('Cache-Control', 'no-store').json({ name, foods, portion: String(parsed.portion).slice(0, 40), calories: number('calories', 5000), proteins: number('proteins', 500), carbs: number('carbs', 500), fats: number('fats', 500) });
  } catch { res.status(502).json({ error: 'L’analyse a échoué. Réessayez.' }); }
});

app.post(apiPaths('goal-photo'), async (req,res) => {
  res.set('Cache-Control','no-store');
  if(!rateLimit(req,res,3)) return;
  if(req.body?.consent !== true){res.status(400).json({error:'Votre accord est requis pour envoyer cette photo au service IA.'});return;}
  if(!process.env.GEMINI_API_KEY){res.status(503).json({error:'Photo objectif indisponible : configurez GEMINI_API_KEY sur le serveur.'});return;}
  const match=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.image||''));
  const {goal,targetWeight,startingWeight,heightCm}=req.body||{};
  if(!match||match[2].length>4_000_000||!['lose','gain','maintain'].includes(goal)||![targetWeight,startingWeight,heightCm].every(n=>typeof n==='number'&&Number.isFinite(n))||targetWeight<30||targetWeight>300||startingWeight<30||startingWeight>300||heightCm<100||heightCm>250){res.status(400).json({error:'Photo et mesures valides requises.'});return;}
  if((goal==='lose'&&targetWeight>=startingWeight)||(goal==='gain'&&targetWeight<=startingWeight)||(goal==='maintain'&&Math.abs(targetWeight-startingWeight)>2)){res.status(400).json({error:'Le poids cible ne correspond pas à votre objectif.'});return;}
  try{
    const frameCheck=await callGeminiGenerateContent({contents:[{parts:[
      {text:'Check only the photo framing. Is one adult person visible from the neck/shoulder line down to both feet, with the complete body mostly inside the image? The face may be outside the frame or masked. Return JSON only: {"fullBody":true} or {"fullBody":false}. If unsure, return {"fullBody":false}. Do not identify or describe the person.'},
      {inlineData:{mimeType:match[1],data:match[2]}}
    ]}],generationConfig:{responseMimeType:'application/json'}});
    if(!frameCheck.ok){res.status(200).json({fullBody:null,warning:'Impossible de vérifier automatiquement le cadrage. Choisissez une photo complète pour la projection, ou continuez sans illustration.'});return;}
    const frameData=await frameCheck.json() as {candidates?:{content?:{parts?:{text?:string}[]} }[]};
    let frameResult:{fullBody?:boolean};
    try{frameResult=JSON.parse(frameData.candidates?.[0]?.content?.parts?.[0]?.text||'{}') as {fullBody?:boolean};}catch{frameResult={};}
    if(frameResult.fullBody!==true){res.status(200).json({fullBody:false,warning:'Cette photo ne semble pas montrer le corps complet de la nuque aux pieds. Une photo entière est nécessaire pour créer la projection IA. Vous pouvez changer de photo ou continuer sans illustration.'});return;}
    const model=process.env.GEMINI_IMAGE_MODEL?.trim()||'gemini-3.1-flash-image';
    const prompt=`Edit the supplied photo of a consenting adult as a motivational, hypothetical weight-goal illustration. Current weight ${startingWeight} kg; target ${targetWeight} kg; height ${heightCm} cm; goal ${goal}. Preserve the person's identity, apparent gender presentation, skin tone, clothing, privacy mask, pose, complete neck-to-feet framing, background, camera perspective and realistic body proportions. If the face is cropped or masked, do not invent or reveal it. For maintenance, keep the body shape essentially unchanged. For weight loss or gain, make only a subtle, plausible change; weight alone cannot determine an exact future appearance. Keep the person fully clothed. No nudity, text, labels or diagrams. Return one edited image.`;
    // Gemini 3.1 Flash Image uses the Interactions endpoint for image editing.
    const response=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY!},signal:AbortSignal.timeout(150000),body:JSON.stringify({model,input:[{type:'text',text:prompt},{type:'image',mime_type:match[1],data:match[2]}],response_format:{type:'image',aspect_ratio:'2:3',image_size:'1K'}})});
    if(!response.ok){const providerMessage=await response.text().catch(()=>''),status=response.status;console.error('Gemini goal image request failed:',status,providerMessage.slice(0,500));res.status(502).json({error:status===429?'Quota du modèle image atteint. Réessayez plus tard ou vérifiez la facturation Gemini.':[401,403].includes(status)?'La clé Gemini ne permet pas d’utiliser le modèle image. Vérifiez GEMINI_API_KEY et l’accès à GEMINI_IMAGE_MODEL.':status===404?'Modèle image introuvable. Vérifiez GEMINI_IMAGE_MODEL sur le serveur.':'Le service Gemini Image a refusé la demande. Vérifiez GEMINI_IMAGE_MODEL, les autorisations de la clé et les journaux du serveur.'});return;}
    const data=await response.json() as any;
    const generated=data.output_image || data.output?.find((item:any)=>item.type==='image') || data.steps?.flatMap((step:any)=>step.content||[]).find((item:any)=>item.type==='image') || data.candidates?.flatMap((c:any)=>c.content?.parts||[]).find((p:any)=>p.inlineData?.mimeType?.startsWith('image/'))?.inlineData;
    const mime=generated?.mime_type||generated?.mimeType||'image/png';
    const imageData=generated?.data||generated?.image?.data;
    if(!imageData||!['image/png','image/jpeg','image/webp'].includes(mime)){res.status(502).json({error:'Gemini a répondu sans image. Vérifiez que la clé autorise le modèle image et réessayez.'});return;}
    res.json({fullBody:true,image:`data:${mime};base64,${imageData}`,illustration:true});
  }catch(error){
    console.error('AuraSlim goal-photo generation failed:',error instanceof Error?error.message:'unknown error');
    res.status(502).json({error:'La génération IA a échoué. Vérifiez la clé Gemini, le modèle image et la connexion, puis réessayez. Votre photo initiale est conservée.'});
  }
});

app.post(apiPaths('inbody-scan'), async (req, res) => {
  if (!rateLimit(req, res, 6)) return;
  if(req.body?.consent!==true){res.status(400).json({error:'Votre consentement est requis pour analyser le relevé.'});return;}
  const image = String(req.body?.image || '');
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(image);
  if (!match || match[2].length > 8_000_000) {
    res.status(400).json({ error: 'Photo JPEG/PNG/WebP requise (max 6 Mo).' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) { res.status(503).json({error:'Configurez GEMINI_API_KEY pour lire le relevé InBody.'}); return; }

  try {
    const response = await callGeminiGenerateContent({
      contents: [{
        parts: [
          {
            text: `Tu es un expert biométrique de haute précision médicale. Analyse cette photo d'un relevé d'impédancemétrie InBody ou Tanita.
Extrais TRÈS EXACTEMENT les chiffres imprimés sur la feuille :
- weightKg (Poids en kg, nombre)
- skeletalMuscleMassKg (Masse musculaire squelettique / SMM en kg, nombre)
- bodyFatMassKg (Masse grasse en kg, nombre)
- bodyFatPercent (Pourcentage de graisse corporelle / %BF / PGC, nombre)
- totalBodyWaterLiters (Eau corporelle totale / TBW en Litres, nombre)
- bmrKcal (Métabolisme de base / BMR en kcal, nombre entier)
- visceralFatLevel (Niveau de graisse viscérale, entier de 1 à 20)
- inBodyScore (Score InBody / Fitness score sur 100, nombre entier)
- isBlurryOrLowLight (boolean : true si l'image est floue, trop sombre, illisible ou si les chiffres sont incertains)
- clarityFeedback (string : conseils d'éclairage ou explication si l'image est floue)

RÈGLES STRICTES :
1. Les chiffres doivent être TRÈS EXACTS et correspondre fidèlement à ce qui est imprimé sur le rapport InBody. Si un chiffre n'est pas présent, mets null.
2. Si la photo est floue, trop sombre ou illisible, indique isBlurryOrLowLight: true et demande dans clarityFeedback de reprendre une photo plus nette avec une lumière bien claire.
Réponds UNIQUEMENT en JSON.`
          },
          { inlineData: { mimeType: match[1], data: match[2] } }
        ]
      }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Service d’analyse biométrique InBody temporairement indisponible.' });
      return;
    }

    const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(text);
    const fields:Record<string,[number,number]>={weightKg:[30,300],skeletalMuscleMassKg:[1,150],bodyFatPercent:[1,75],bodyFatMassKg:[1,200],totalBodyWaterLiters:[1,100],bmrKcal:[500,4000],visceralFatLevel:[1,30],inBodyScore:[0,100]};
    const clean:Record<string,unknown>={isBlurryOrLowLight:parsed.isBlurryOrLowLight===true,clarityFeedback:String(parsed.clarityFeedback||'').slice(0,500)};
    for(const [field,[min,max]] of Object.entries(fields)){const n=parsed[field];clean[field]=typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max?n:null;}
    res.set('Cache-Control','no-store').json(clean);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l’analyse InBody. Veuillez vérifier la netteté de l’image.' });
  }
});

const dictionaries = new Map<string, Record<string, string>>();
let supportedLanguageCache: { until: number; codes: string[] } | null = null;
app.get(apiPaths('supported-languages'), async (req, res) => {
  if (!rateLimit(req, res, 12)) return;
  res.json({ codes: launchLanguageCodes });
});

async function translateWithGemini(input: string[], language: string): Promise<string[]> {
  const response = await callGeminiGenerateContent({
    contents: [{ parts: [{ text: `Translate each French app interface string into language ${language}. Preserve numbers, placeholders, brand name AuraSlim and punctuation. Return only a JSON array of exactly ${input.length} strings in the same order. Input: ${JSON.stringify(input)}` }] }],
    generationConfig: { responseMimeType: 'application/json' }
  });
  if (!response.ok) throw new Error(`Gemini translation status ${response.status}`);
  const payload = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const translated: unknown = JSON.parse(payload.candidates?.[0]?.content?.parts?.[0]?.text || 'null');
  if (!Array.isArray(translated) || translated.length !== input.length || translated.some(item => typeof item !== 'string' || !item.trim())) throw new Error('Incomplete translation');
  const placeholders = (value: string) => [...value.matchAll(/\{[^{}]+\}|%[sd]/g)].map(match => match[0]).sort().join('|');
  if (translated.some((item, index) => placeholders(String(item)) !== placeholders(input[index]))) throw new Error('Translation changed an interface placeholder');
  return translated;
}
app.get(apiPaths('translations'), async (req, res) => {
  if (!rateLimit(req, res, 5)) return;
  const lang = String(req.query.lang || '');
  if (!languageOptions.some(item => item.code === lang)) { res.status(400).json({ error: 'Langue inconnue.' }); return; }
  if (lang === 'fr') { res.json(getTranslation('fr')); return; }
  if (dictionaries.has(lang)) { res.json(dictionaries.get(lang)); return; }
  const key = process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;
  if (!key && !process.env.GEMINI_API_KEY) { res.json(getTranslation(lang)); return; }
  try {
    const items = Object.entries(getTranslation('fr')).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
    const output: Record<string, string> = {};
    for (let start = 0; start < items.length; start += 25) {
      const batch = items.slice(start, start + 25);
      let values: string[];
      if (key) {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'fr', target: lang, format: 'text', q: batch.map(([, value]) => value) })
        });
        if (!response.ok) throw new Error('Cloud Translation unavailable');
        const data = await response.json() as { data?: { translations?: { translatedText: string }[] } };
        values = data.data?.translations?.map(item => item.translatedText) || [];
      } else values = await translateWithGemini(batch.map(([, value]) => value), lang);
      if (values.length !== batch.length) throw new Error('Traduction incomplète');
      batch.forEach(([name], index) => { output[name] = values[index]; });
    }
    dictionaries.set(lang, output); res.json(output);
  } catch { res.status(502).json({ error: 'Traduction indisponible.' }); }
});

installPaymentRoutes(app, stripe, clientId, rateLimit);

// Never let the SPA return index.html to an API fetch: clients expect JSON.
app.use(['/api', '/auraslim-api'], (_req, res) => res.status(404).json({ error: 'Route AuraSlim introuvable sur ce serveur.' }));
app.use((error: { status?: number }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!/^\/(?:api|auraslim-api)(?:\/|$)/.test(req.path)) { next(error); return; }
  const status = error.status === 413 ? 413 : error.status === 400 ? 400 : 500;
  res.status(status).json({ error: status === 413 ? 'Photo trop volumineuse : prenez une autre photo.' : status === 400 ? 'Données envoyées invalides.' : 'Erreur interne du serveur AuraSlim.' });
});
