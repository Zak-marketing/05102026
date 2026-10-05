import assert from 'node:assert/strict';

process.env.GEMINI_API_KEY = 'test-only-key';
delete process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;
const original = globalThis.fetch;
let calls = 0;
globalThis.fetch = async (url, init) => {
  if (!String(url).startsWith('https://generativelanguage.googleapis.com/')) return original(url, init);
  calls++;
  const body = JSON.parse(init.body);
  const prompt = body.contents[0].parts[0].text;
  const source = JSON.parse(prompt.slice(prompt.indexOf('Input: ') + 7));
  return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(source.map(value => `[hi] ${value}`)) }] } }] });
};
const { apiApp } = await import('../server/api.ts');
const server = apiApp.listen(0, '127.0.0.1');
try {
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/`;
  const supported = await (await original(`${base}supported-languages`)).json();
  assert(supported.codes.length === 20);
  const response = await original(`${base}translations?lang=hi`);
  assert.equal(response.status, 200);
  const dictionary = await response.json();
  assert(dictionary.appName.startsWith('[hi]'));
  assert(calls > 1);
  console.log('OK : traduction du dictionnaire complet via Gemini sans clé Cloud Translation.');
} finally { globalThis.fetch = original; server.close(); }
