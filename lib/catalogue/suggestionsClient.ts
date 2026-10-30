/** Keep the Android names data and matching work off the browser's main thread. */
let worker: Worker | null = null;
let sequence = 0;
const pending = new Map<number, { resolve: (names: string[]) => void; reject: (error: Error) => void; cleanup: () => void }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/assets/catalogue/search.worker.js", { type: "module" });
  worker.onmessage = ({ data }: MessageEvent<{ id: number; suggestions?: string[]; error?: string }>) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    request.cleanup();
    if (data.error) request.reject(new Error(data.error));
    else request.resolve(data.suggestions ?? []);
  };
  worker.onerror = () => {
    worker?.terminate();
    worker = null;
    for (const request of pending.values()) {
      request.cleanup();
      request.reject(new Error("Local coin search is unavailable"));
    }
    pending.clear();
  };
  return worker;
}

export function requestCoinSuggestions(query: string, signal: AbortSignal): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const current = getWorker();
    const id = ++sequence;
    const abort = () => {
      pending.delete(id);
      signal.removeEventListener("abort", abort);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const cleanup = () => signal.removeEventListener("abort", abort);
    pending.set(id, { resolve, reject, cleanup });
    signal.addEventListener("abort", abort, { once: true });
    current.postMessage({ id, query });
  });
}
