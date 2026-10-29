/** Local Android names search. Runs outside the UI thread; no search API requests. */
export function createNameSearch(names) {
  const lower = names.map((name) => name.toLowerCase());
  const postings = new Map();
  for (let id = 0; id < lower.length; id++) {
    for (const token of new Set(lower[id].match(/[\p{L}\p{N}]+/gu) ?? [])) {
      if (!postings.has(token)) postings.set(token, []);
      postings.get(token).push(id);
    }
  }
  const vocabulary = [...postings.keys()].sort();
  const cache = new Map();

  function prefixIds(prefix) {
    let left = 0, right = vocabulary.length;
    while (left < right) {
      const mid = (left + right) >>> 1;
      if (vocabulary[mid] < prefix) left = mid + 1;
      else right = mid;
    }
    const ids = new Set();
    for (let i = left; i < vocabulary.length && vocabulary[i].startsWith(prefix); i++) {
      for (const id of postings.get(vocabulary[i])) ids.add(id);
    }
    return ids;
  }

  return function search(input, limit = 12) {
    const query = input.trim().toLowerCase();
    if (!query || limit <= 0) return [];
    const key = `${limit}:${query}`;
    if (cache.has(key)) return cache.get(key);
    const tokens = [...new Set(query.match(/[\p{L}\p{N}]+/gu) ?? [])];
    // Exact phrase matches are a subset of all-token prefix matches, as in Android FTS.
    const sets = tokens.map(prefixIds).sort((a, b) => a.size - b.size);
    const ids = sets.length ? [...sets[0]].filter((id) => sets.every((set) => set.has(id))).sort((a, b) => a - b) : [];
    const ranked = [], other = [];
    for (const id of ids) {
      if (lower[id].includes(query)) ranked.push(names[id]);
      else if (other.length < limit) other.push(names[id]);
      if (ranked.length >= limit) break;
    }
    let results = [...ranked, ...other].slice(0, limit);
    if (!ids.length) {
      results = [];
      for (let id = 0; id < lower.length && results.length < limit; id++) {
        if (lower[id].includes(query)) results.push(names[id]);
      }
    }
    if (cache.size >= 100) cache.delete(cache.keys().next().value);
    cache.set(key, results);
    return results;
  };
}

if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  // One static local-file download and index per worker, reused across search boxes/navigation.
  const ready = fetch(new URL("./android-coin-names.json", self.location.href))
    .then((response) => {
      if (!response.ok) throw new Error("Could not load local coin names");
      return response.json();
    })
    .then(createNameSearch);
  // Attach a rejection handler immediately; requests still receive the original error below.
  ready.catch(() => {});
  self.onmessage = async ({ data: { id, query } }) => {
    try {
      const search = await ready;
      self.postMessage({ id, suggestions: search(query) });
    } catch {
      self.postMessage({ id, error: "Local coin search is unavailable" });
    }
  };
}
