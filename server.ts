import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { apiApp } from './server/api.ts';

const app = express();
app.set('trust proxy', 1);
app.use(apiApp);

// Guard: Any API request must return JSON 404 and NEVER fall through to the SPA index.html fallback
app.use(['/api', '/auraslim-api'], (_req, res) => {
  res.status(404).json({ error: 'Route API introuvable sur le serveur AuraSlim.' });
});

if (process.env.NODE_ENV !== 'production') {
  // Express answers API requests first; Vite also supports standalone previews.
  const vite = await createViteServer({ server: { middlewareMode: true, hmr: process.env.DISABLE_HMR === 'true' ? false : undefined }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve('dist')));
  app.get('*', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
}
app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('AuraSlim ready'));
