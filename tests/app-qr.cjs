const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

let hostname = 'coinzy-web-qa.netlify.app';
let server = true;
const exportsObject = {};
const code = ts.transpileModule(fs.readFileSync('components/ui/AppQrCode.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2017 },
}).outputText;
vm.runInNewContext(code, {
  exports: exportsObject,
  window: { location: { get hostname() { return hostname; } } },
  require: (name) => {
    if (name === 'next/image') return { default: 'image' };
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
    if (name === 'react') return { useSyncExternalStore: (_, snapshot, serverSnapshot) => server ? serverSnapshot() : snapshot() };
    throw new Error(`Unexpected import: ${name}`);
  },
});
const { appQrSourceForHostname, AppQrCode, APP_QR_SRC, APP_QA_QR_SRC } = exportsObject;
assert.equal(appQrSourceForHostname('coinzy-web-qa.netlify.app'), APP_QA_QR_SRC);
assert.equal(appQrSourceForHostname('COINZY-WEB-QA.NETLIFY.APP.'), APP_QA_QR_SRC);
assert.equal(appQrSourceForHostname('deploy-preview-12--coinzy-web-qa.netlify.app'), APP_QA_QR_SRC);
assert.equal(appQrSourceForHostname('coinzy-web-prod.netlify.app'), APP_QR_SRC);
assert.equal(appQrSourceForHostname('coinzy-web-qa.netlify.app.example.com'), APP_QR_SRC);
assert.equal(AppQrCode({}).props.src, undefined, 'server render must not flash a production QR on QA');
server = false;
assert.equal(AppQrCode({}).props.src, APP_QA_QR_SRC);
hostname = 'coinzy-web-prod.netlify.app';
assert.equal(AppQrCode({ size: 184 }).props.src, APP_QR_SRC);
assert.equal(AppQrCode({ size: 184 }).props.width, 184);
for (const asset of [APP_QR_SRC, APP_QA_QR_SRC]) assert.ok(fs.statSync(`public${asset}`).size > 0);
console.log('PASS: QA/prod QR selection, QA preview routing, safe hydration and preserved dimensions.');
