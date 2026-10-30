const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

let state = [], cursor = 0;
const jsx = (type, props) => ({ type, props });
const react = { useState: (initial) => {
  const i = cursor++;
  if (!(i in state)) state[i] = initial;
  return [state[i], (value) => { state[i] = value; }];
} };
function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => { assert.ok(name in mocks, name); return mocks[name]; } });
  return exports;
}
const { FallbackImage } = load('components/ui/FallbackImage.tsx', {
  react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/image': { default: 'image' },
});
const props = { src: 'front.jpg', alt: '', fallbackSources: ['reverse.jpg'], fallback: 'unavailable', onError: () => errors++ };
let errors = 0;
function render() { cursor = 0; return FallbackImage(props); }
let tree = render();
assert.equal(tree.props.src, 'front.jpg');
tree.props.onError({}); tree = render();
assert.equal(tree.props.src, 'reverse.jpg', 'retry the same coin’s other photo after the first fails');
assert.equal(errors, 0, 'only report failure after exhausting the supplied photos');
tree.props.onError({}); tree = render();
assert.equal(tree.props.children, 'unavailable');
assert.equal(errors, 1);
props.src = 'new-coin.jpg'; render(); tree = render();
assert.equal(tree.props.src, 'new-coin.jpg', 'a new coin resets failed state and the retry index');

const { CoinCardImage } = load('components/catalogue/CoinCardImage.tsx', {
  react, 'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' }, '@/components/ui/FallbackImage': { FallbackImage },
});
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (typeof tree.type === 'function' && tree.type !== FallbackImage) return nodes(tree.type(tree.props));
  return [tree, ...nodes(tree.props?.children)];
}
function renderCard(image) { cursor = 0; return nodes(CoinCardImage({ image })); }
state = [];
assert.ok(renderCard('').some(n => n.props?.['aria-label'] === 'Coin image unavailable'), 'missing URLs show an honest placeholder immediately');
state = [];
let card = renderCard('front.jpg');
assert.ok(card.some(n => n.props?.['aria-label'] === 'Loading coin image'), 'slow images have a visible loading placeholder');
card.find(n => n.type === FallbackImage).props.onLoad();
card = renderCard('front.jpg');
assert.ok(!card.some(n => n.props?.['aria-label'] === 'Loading coin image'), 'successful loads remove the loading placeholder');
console.log('PASS: loading and missing-image placeholders, alternate photo retry, exhausted failures, source-change recovery.');
