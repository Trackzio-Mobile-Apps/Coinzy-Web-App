export function authenticityStyle(value: unknown) {
  const kind = String(value ?? "").trim().toLowerCase();
  if (kind === "authentic") return { label: "Authentic", color: "#16a34a", background: "#f0fdf4", summary: "rgba(22, 163, 74, 0.1)", description: "All design elements, material, and composition match authentic specimens from this period." };
  if (kind === "doubtful") return { label: "Doubtful", color: "#d97706", background: "#fff9e6", summary: "rgba(227, 146, 25, 0.1)", description: "The authenticity of this coin cannot be confirmed with confidence. Some features match authentic specimens, while others require further verification." };
  if (kind === "fake") return { label: "Fake", color: "#dc2626", background: "#fff3f0", summary: "rgba(224, 52, 52, 0.1)", description: "This coin seems to be a fake coin and does not match with any authentic specimens from this period." };
  return null;
}
