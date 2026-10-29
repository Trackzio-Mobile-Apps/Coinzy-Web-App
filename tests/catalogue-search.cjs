const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

function load(file, mocks, extra = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  vm.runInNewContext(outputText, { exports, require: (name) => {
    assert.ok(name in mocks, `Unmocked import: ${name}`);
    return mocks[name];
  }, URLSearchParams, AbortController, ...extra });
  return exports;
}

async function main() {
  const names = require("../public/assets/catalogue/android-coin-names.json");
  const { createNameSearch } = load("public/assets/catalogue/search.worker.js", {});
  const suggestCoinNames = createNameSearch(names);
  assert.equal(names.length, 40190);
  assert.deepEqual(Array.from(suggestCoinNames("  ")), []);
  assert.deepEqual(Array.from(suggestCoinNames("morgan")), names.filter((name) => name.toLowerCase().includes("morgan")));
  assert.deepEqual(Array.from(suggestCoinNames("MoRgAn")), Array.from(suggestCoinNames("morgan")));
  assert.ok(suggestCoinNames("dolla").some((name) => /dollar/i.test(name)));
  assert.ok(suggestCoinNames("king george").every((name) => /\bking\b/i.test(name) && /\bgeorge/i.test(name)));
  assert.deepEqual(Array.from(suggestCoinNames("carrarese")), ["'Carrarese' of 4 soldi - Francis I"]);
  assert.deepEqual(Array.from(suggestCoinNames("arrarese")), ["'Carrarese' of 4 soldi - Francis I"], "substring fallback when no token prefix matches");
  assert.deepEqual(Array.from(suggestCoinNames("zzzzzzzzzz")), []);
  assert.equal(suggestCoinNames("dollar", 3).length, 3);
  for (const input of ['"', "*", "OR", "1/2", "Hōei", "100%", "_"]) assert.ok(suggestCoinNames(input).length <= 12);

  const nav = load("lib/backNav.ts", {});
  const { searchVariants } = load("lib/catalogue/search.ts", {});
  assert.ok(searchVariants("1 Dollar 'Morgan Dollar'").includes("Morgan Dollar"), "Android labels must also try the catalogue's quoted name");
  assert.equal(searchVariants("Morgan Dollar")[0], "Morgan Dollar");
  const longest = names.reduce((a, b) => a.length > b.length ? a : b);
  assert.equal(nav.parseQueryParam(longest), longest, "full selected names must survive URL parsing");

  const pageCalls = [];
  let pageItems = [];
  const response = (totalCount) => ({ items: pageItems, totalCount, pageNo: 0, pageSize: 16 });
  let matchingTerm = "Morgan Dollar";
  const { loadCoins } = load("components/catalogue/CoinGrid.tsx", {
    "react/jsx-runtime": {}, "next/image": {}, "next/link": {},
    "@/components/ui/CoinPlaceholder": {}, "@/components/ui/FallbackImage": {},
    "@/components/catalogue/CoinCardImage": {},
    "@/components/catalogue/WishlistHeart": {},
    "@/lib/auth/session": { getSessionToken: async () => "test-session" },
    "@/lib/api/coinzy": { fetchArchetypesCached: () => { throw new Error("Use session search"); } },
    "@/lib/api/coinzy-session": { fetchArchetypesForSession: async (args) => {
      pageCalls.push(args);
      return response(args.search === matchingTerm ? 1 : 0);
    } },
    "@/lib/backNav": nav, "@/lib/catalogue/search": { searchVariants },
    "@/lib/constants": { CATALOGUE_COINS: [] },
  });
  assert.equal((await loadCoins({ page: 1, pageSize: 16, search: matchingTerm })).live, true);
  assert.deepEqual(pageCalls.map((args) => args.search), ["Morgan Dollar"], "a successful selected name must not launch or wait for spelling fallbacks");
  pageCalls.length = 0;
  const filters = { issuer: ["USA"] };
  await loadCoins({ page: 2, pageSize: 16, search: "1 Dollar 'Morgan Dollar'", filters });
  assert.equal(pageCalls.at(-1).search, matchingTerm, "try quoted catalogue name after full-label misses");
  assert.ok(pageCalls.every((args) => args.pageNo === 1 && args.filters === filters && args.token === "test-session"));
  assert.ok(!pageCalls.some((args) => args.search === "morgan dollar"), "stop immediately when a fallback matches");
  pageCalls.length = 0;
  matchingTerm = "no matches";
  assert.equal((await loadCoins({ page: 1, pageSize: 16, search: "Missing Coin" })).totalCount, 0);
  assert.deepEqual(pageCalls.map((args) => args.search), Array.from(searchVariants("Missing Coin")), "exhaust variants only for an actual miss");
  pageItems = [
    { archetypeId: "missing", name: "No photo", imageUrls: null },
    { archetypeId: "reverse", name: "Two sides", imageUrls: ["", " front.jpg ", "front.jpg", "reverse.jpg"] },
  ];
  const imageCoins = (await loadCoins({ page: 1, pageSize: 16 })).coins;
  assert.equal(imageCoins[0].image, "", "a missing coin photo must never use an unrelated sample coin");
  assert.equal(imageCoins[1].image, "front.jpg");
  assert.deepEqual(Array.from(imageCoins[1].alternativeImages), ["reverse.jpg"], "keep distinct alternate photos for failed-image recovery");

  class WorkerScope {}
  const scope = new WorkerScope();
  const localLoads = [], replies = [];
  scope.location = { href: "https://example.com/assets/catalogue/search.worker.js" };
  scope.postMessage = (reply) => replies.push(reply);
  load("public/assets/catalogue/search.worker.js", {}, {
    WorkerGlobalScope: WorkerScope, self: scope, URL,
    fetch: async (url) => {
      localLoads.push(String(url));
      return { ok: true, json: async () => names };
    },
  });
  await Promise.all([
    scope.onmessage({ data: { id: 1, query: "morgan" } }),
    scope.onmessage({ data: { id: 2, query: "dolla" } }),
  ]);
  assert.deepEqual(localLoads, ["https://example.com/assets/catalogue/android-coin-names.json"], "load the static local JSON once");
  assert.equal(replies.length, 2);
  assert.deepEqual(Array.from(replies[0].suggestions), Array.from(suggestCoinNames("morgan")));

  let cursor = 0;
  const states = [], pushes = [], searches = [], timers = new Map();
  const workers = [];
  class FakeWorker {
    constructor() { workers.push(this); }
    postMessage({ id, query }) {
      searches.push(query);
      Promise.resolve().then(() => this.onmessage({ data: { id, suggestions: suggestCoinNames(query) } }));
    }
    terminate() {}
  }
  const client = load("lib/catalogue/suggestionsClient.ts", {}, { Worker: FakeWorker, DOMException });
  const react = {
    useId: () => "search-id",
    useEffect: () => {},
    useRef: (initial) => { const i = cursor++; if (!(i in states)) states[i] = { current: initial }; return states[i]; },
    useTransition: () => [false, (fn) => fn()],
    useState: (initial) => { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], (v) => { states[i] = typeof v === "function" ? v(states[i]) : v; }]; },
  };
  const { CatalogueSearch } = load("components/catalogue/CatalogueSearch.tsx", {
    react,
    "@/lib/catalogue/suggestionsClient": client,
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    "next/image": {}, "next/navigation": { useRouter: () => ({ push: (href) => pushes.push(href) }) }, "@/lib/backNav": nav,
  }, {
    Worker: () => { throw new Error("Manual search must not start a worker"); },
    DOMException,
    window: { setTimeout: (fn, ms) => { assert.equal(ms, 300); timers.set(fn, fn); return fn; }, clearTimeout: (id) => timers.delete(id) },
    fetch: () => { throw new Error("Typing must not make requests"); },
  });
  const props = { action: "/catalogue", query: "", hash: "#browse-all", keepParams: { issuer: ["USA", "India"] } };
  function render() { cursor = 0; return CatalogueSearch(props); }
  function nodes(tree) { return !tree || typeof tree !== "object" ? [] : [tree, ...[tree.props?.children].flat().flatMap(nodes)]; }
  function input(tree) { return nodes(tree).find((node) => node.type === "input" && node.props.name === "q"); }
  function runTimers() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach((fn) => fn()); }
  async function submit(tree) { const done = tree.props.onSubmit({ preventDefault() {} }); runTimers(); await done; }
  let tree = render();
  input(tree).props.onChange({ target: { value: "mor" } }); tree = render();
  input(tree).props.onChange({ target: { value: "morgan" } }); tree = render();
  assert.equal(pushes.length, 0, "typing must not search or navigate");
  assert.equal(workers.length, 0);
  assert.equal(timers.size, 1, "typing replaces the 300ms local lookup timer");
  runTimers();
  await new Promise(setImmediate); tree = render();
  assert.deepEqual(searches, ["morgan"], "search automatically for the latest typed text without Enter");
  assert.ok(nodes(tree).some((node) => node.props?.role === "option"), "typing alone shows local matches");
  assert.equal(input(tree).props.onFocus, undefined, "focus must not trigger matching");
  assert.ok(nodes(tree).some((node) => node.type === "button" && node.props.type === "submit"));
  const firstSubmit = tree.props.onSubmit({ preventDefault() {} });
  assert.equal(searches.length, 1, "do not start another lookup before the 300ms debounce");
  assert.equal(timers.size, 1);
  const replacement = tree.props.onSubmit({ preventDefault() {} });
  assert.equal(timers.size, 1, "rapid submits replace the pending debounce");
  runTimers();
  await Promise.all([firstSubmit, replacement]); tree = render();
  assert.equal(pushes.length, 0, "local lookup must not automatically search the catalogue");
  assert.equal(workers.length, 1, "reuse the local worker for typed and submitted searches");
  const option = nodes(tree).find((node) => node.props?.role === "option");
  assert.ok(option, "show local matches after manual lookup");
  option.props.onClick(); tree = render();
  const href = new URL(pushes[0], "https://example.com");
  assert.equal(href.searchParams.get("q"), suggestCoinNames("morgan")[0]);
  assert.deepEqual(href.searchParams.getAll("issuer"), ["USA", "India"]);
  assert.equal(href.hash, "#browse-all");
  input(tree).props.onChange({ target: { value: "zzzzzzzzzz" } }); tree = render();
  const before = searches.length;
  assert.equal(pushes.length, 1);
  assert.equal(searches.length, before, "typing alone must not start matching");
  await submit(tree); tree = render();
  assert.ok(nodes(tree).some((node) => node.props?.role === "status" && node.props.children === "Not found in local names"));
  assert.equal(pushes.length, 1, "zero local results must wait for direct-search action");
  const direct = nodes(tree).find((node) => node.type === "button" && Array.isArray(node.props.children) && node.props.children[0] === "Search catalogue for “");
  assert.ok(direct);
  direct.props.onClick(); tree = render();
  assert.equal(new URL(pushes[1], "https://example.com").searchParams.get("q"), "zzzzzzzzzz");
  assert.deepEqual(new URL(pushes[1], "https://example.com").searchParams.getAll("issuer"), ["USA", "India"]);
  input(tree).props.onChange({ target: { value: "dollar" } }); tree = render();
  const inFlight = tree.props.onSubmit({ preventDefault() {} });
  input(tree).props.onChange({ target: { value: "changed" } });
  await inFlight; tree = render();
  assert.equal(timers.size, 1, "editing replaces the old debounce with a lookup for the new text");
  assert.equal(nodes(tree).some((node) => node.props?.role === "option"), false, "editing must suppress stale lookup results");
  nodes(tree).find((node) => node.props?.["aria-label"] === "Clear search").props.onClick(); tree = render();
  assert.equal(input(tree).props.value, "");
  assert.equal(timers.size, 0, "clearing cancels automatic lookup");
  assert.equal(pushes.length, 2, "clearing text must not automatically search");
  await tree.props.onSubmit({ preventDefault() {} });
  assert.equal(new URL(pushes[2], "https://example.com").searchParams.has("q"), false);
  props.action = "/marketplace";
  input(tree).props.onChange({ target: { value: "dollar" } }); tree = render();
  const searchesBefore = searches.length;
  await tree.props.onSubmit({ preventDefault() {} });
  assert.equal(searches.length, searchesBefore, "marketplace submits directly without local coin matching");
  const abort = new AbortController();
  const stale = client.requestCoinSuggestions("dollar", abort.signal);
  abort.abort();
  await assert.rejects(stale, { name: "AbortError" });
  const again = await client.requestCoinSuggestions("morgan", new AbortController().signal);
  assert.deepEqual(Array.from(again), Array.from(suggestCoinNames("morgan")));
  assert.equal(workers.length, 1, "do not reload data for subsequent queries");
  assert.ok(!fs.readFileSync(path.join(root, "components/catalogue/CatalogueSearch.tsx"), "utf8").includes("android-coin-names.json"));
  console.log("PASS: automatic 300ms typing lookup without Enter, rapid-edit/submit replacement, clear cancellation, local matches, explicit selection/direct API search, stale-result cancellation, filter preservation, marketplace isolation.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
