const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('lib/identify/collectionClient.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObj = {};
let body;
const context = { exports: exportsObj, fetch: async (_url, options) => { body = JSON.parse(options.body); return { ok: true, json: async () => ({ error: false, data: { _id: 'owned-123' } }) }; } };
vm.runInNewContext(code, context);
(async () => {
  const result = await exportsObj.addCoinViaApi({ isOwned: true, isIdentified: true });
  assert.equal(result.coinId, 'owned-123');
  assert.equal(body.isOwned, true);
  const rail = fs.readFileSync('components/identify/IdentifyCoinClient.tsx', 'utf8');
  assert.match(rail, /buildAddCoinPayload\(coin, archetypeId, imagePair, \{ isOwned: true \}\)/);
  assert.match(rail, /collection\/coin\/\$\{encodeURIComponent\(result\.coinId\)\}\?from=marketplace&list=1/);
  assert.match(rail, /saving \|\| saleCoinAdded/);
  console.log('PASS: identified coin is saved as owned and handed to the sell flow');
})().catch((error) => { console.error(error); process.exitCode = 1; });
