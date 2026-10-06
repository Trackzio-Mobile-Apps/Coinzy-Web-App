export async function submitAuth(action: "login" | "signup" | "guest" | "forgot" | "reset", data: Record<string, unknown> = {}) {
  const response = await fetch(`/api/auth/${action}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: navigator.language }),
  });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.reason || "Authentication failed. Please try again.");
}
