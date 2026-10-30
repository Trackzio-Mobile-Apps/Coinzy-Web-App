/** Next.js instrumentation hook: runs once when the server starts (Node runtime only). */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { installApiLogger } = await import("./lib/dev/apiLogger");
    installApiLogger();
  }
}
