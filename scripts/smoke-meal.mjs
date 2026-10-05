import assert from 'node:assert/strict';

process.env.GEMINI_API_KEY = 'test-only-key';
const { apiApp } = await import('../server/api.ts');
const actualFetch = globalThis.fetch;
let languageRequested = false;
globalThis.fetch = async (input, options) => {
  if (String(input).startsWith('https://generativelanguage.googleapis.com/')) {
    const payload = JSON.parse(options.body);
    languageRequested = payload.contents[0].parts[0].text.includes('English');
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ name:'Chicken and rice', portion:'250 g', calories:400, proteins:32, carbs:45, fats:10,
      foods:[{name:'Chicken',portion:'130 g',calories:210},{name:'Rice',portion:'120 g',calories:190}] }) }] } }] }), { status:200, headers:{'Content-Type':'application/json'} });
  }
  return actualFetch(input, options);
};
const server = apiApp.listen(0, '127.0.0.1');
try {
  await new Promise(resolve => server.once('listening', resolve));
  const response = await actualFetch(`http://127.0.0.1:${server.address().port}/auraslim-api/meal-estimate`, { method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ image:'data:image/png;base64,aGVsbG8=', language:'en' }) });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.foods.map(food => food.name), ['Chicken', 'Rice']);
  assert.equal(result.calories, 400);
  assert(languageRequested, 'La langue demandée doit guider le nom des aliments');
  console.log('OK scan IA simulé : aliments nommés séparément, calories et langue demandée.');
} finally {
  globalThis.fetch = actualFetch;
  server.close();
}
