// AI Studio previews may proxy one API prefix and serve index.html at the
// other. Discover the actual JSON server before sending a private photo.
const prefixes = ['/auraslim-api', '/api'] as const;
let cachedPrefix: string | null = null;

async function isAuraSlimApi(prefix: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(`${prefix}/status`, {
      headers: { Accept: 'application/json' }, cache: 'no-store', signal
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
    const payload = await response.json();
    return typeof payload.ai === 'boolean' && typeof payload.translation === 'boolean';
  } catch { return false; }
}

export async function findApiPrefix(signal?: AbortSignal): Promise<string> {
  if (cachedPrefix && await isAuraSlimApi(cachedPrefix, signal)) return cachedPrefix;
  cachedPrefix = null;
  for (const prefix of prefixes) {
    if (await isAuraSlimApi(prefix, signal)) { cachedPrefix = prefix; return prefix; }
  }
  throw new Error('Le serveur AuraSlim n’est pas relié à cet aperçu : aucune route JSON ne répond. Lancez le projet avec npm run dev (server.ts) ou déployez le serveur Node et rechargez l’aperçu. La photo n’a pas été envoyée.');
}

export async function auraSlimApi(path: string, init: RequestInit = {}): Promise<Response> {
  const prefix = await findApiPrefix(init.signal || undefined);
  const cleanPath = path.replace(/^\/+/, '');
  const url = `${prefix}/${cleanPath}`;
  let response = await fetch(url, { ...init, headers: { Accept: 'application/json', ...init.headers } });

  // If the server was temporarily starting up and returned HTML, retry once after a short wait for GET/status requests
  if (!response.headers.get('content-type')?.includes('application/json') && (!init.method || init.method === 'GET')) {
    await new Promise(r => setTimeout(r, 600));
    response = await fetch(url, { ...init, headers: { Accept: 'application/json', ...init.headers } });
  }

  if (!response.headers.get('content-type')?.includes('application/json')) {
    cachedPrefix = null;
    if (response.status === 413) {
      throw new Error('La photo est trop volumineuse pour le serveur. Choisissez une photo plus légère et réessayez.');
    }
    if (response.status === 404) {
      throw new Error('La route AuraSlim est introuvable. Redémarrez le serveur du projet puis rechargez l’application.');
    }
    if ([502, 503, 504].includes(response.status)) {
      throw new Error('Le serveur AuraSlim est en cours d’initialisation ou temporairement indisponible. Veuillez réessayer dans quelques secondes.');
    }
    if (response.status === 403) {
      throw new Error('Accès non autorisé par le serveur.');
    }
    throw new Error(`Le serveur AuraSlim a répondu sans JSON (HTTP ${response.status}). Vérifiez que le serveur Node AuraSlim est démarré, puis réessayez.`);
  }
  return response;
}
