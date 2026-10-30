const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => { assert.ok(name in mocks, name); return mocks[name]; }, URLSearchParams, URL });
  return exports;
}
const helpers = load('lib/marketplace/listingFilters.ts', {});
const stores = new Map();
let store, cursor;
const jsx = (type, props) => ({ type, props });
const react = {
  useMemo: (fn) => fn(), useEffect: () => {}, useTransition: () => [false, () => {}],
  useState: (initial) => { const i = cursor++; if (!(i in store)) store[i] = initial; const target = store; return [store[i], (value) => { target[i] = typeof value === 'function' ? value(target[i]) : value; }]; },
};
const { MarketplaceFilterPanel } = load('components/marketplace/MarketplaceFilterPanel.tsx', {
  react, 'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
  'next/link': { default: ({ children, ...props }) => jsx('a', { ...props, children }) },
  'next/navigation': { useRouter: () => ({ push() {} }), useSearchParams: () => new URLSearchParams(), usePathname: () => '/catalogue' },
  '@/lib/marketplace/listingFilters': helpers,
});
const options = Object.fromEntries(helpers.LISTING_FILTER_FIELDS.map((field) => [field, Array.from({ length: 10000 }, (_, i) => `${field}-${String(i).padStart(5, '0')}`)]));
options.yearOfMinting = [2024, '2024', '2024', ...options.yearOfMinting];
function render(tree, path = 'root') {
  if (!tree || typeof tree !== 'object') return tree;
  if (Array.isArray(tree)) return tree.map((child, i) => render(child, `${path}/${i}`));
  if (typeof tree.type === 'function') {
    const id = `${path}/${tree.type.name}`;
    if (!stores.has(id)) stores.set(id, []);
    store = stores.get(id); cursor = 0;
    return render(tree.type(tree.props), id);
  }
  return { ...tree, props: { ...tree.props, children: render(tree.props?.children, `${path}/children`) } };
}
function nodes(tree) { return !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)]; }
const page = () => render(jsx(MarketplaceFilterPanel, { options }));
let tree = page();
assert.ok(nodes(tree).filter((node) => node.type === 'a').length <= 241, 'never mount the full 60k-option dataset');
assert.ok(nodes(tree).filter((node) => node.type === 'a').every((node) => node.props.prefetch === false), 'filter links must not preload background result pages after search');
for (const group of nodes(tree).filter((node) => node.type === 'div' && nodes(node.props.children).some((child) => child.type === 'h3'))) {
  const links = nodes(group.props.children).filter((node) => node.type === 'a');
  if (links.length <= 40) assert.equal(new Set(links.map((node) => node.props.href)).size, links.length, 'no duplicate option keys/URLs');
}
const rulerInput = nodes(tree).find((node) => node.props?.['aria-label'] === 'Search ruler filter options');
rulerInput.props.onChange({ target: { value: '09999' } });
tree = page();
assert.ok(nodes(tree).some((node) => node.type === 'a' && node.props.children?.some?.((child) => child?.props?.children === 'ruler-09999')), 'search must reach options outside the first page');
const next = nodes(tree).find((node) => node.props?.['aria-label'] === 'Next issuer options');
next.props.onClick(); tree = page();
assert.ok(nodes(tree).some((node) => node.type === 'a' && node.props.href?.includes('issuer-00040')), 'paging must reach all options');
console.log('PASS: bounded DOM for 60k+ options, duplicate normalization, full-dataset filter search and pagination.');
