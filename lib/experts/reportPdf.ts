import { expertDisplayTitle, expertRequestId, type ExpertReport, type ExpertRequest } from "./types";

type FieldGroup = Record<string, string | number | boolean | null>;
const titles: Record<string, string> = { generalInfo: "General Information", physicalSpecs: "Physical Specifications", valueAndRarity: "Market Value and Rarity", designDetails: "Design Details", expertAssessment: "Expert Assessment" };
const names: Record<string, string> = { currencyAndDenomination: "Currency & Denomination", rulerOrGovt: "Ruler / Govt", estimatedPriceRange: "Est. Market Value", obverseDescription: "Front (Obverse)", reverseDescription: "Back (Reverse)", conditionOrGrade: "Condition Grade" };
const label = (key: string) => names[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

/** Render report pages locally, then embed the same pages in a downloadable PDF. */
export async function makeReportPdf(request: ExpertRequest, report: ExpertReport): Promise<{ pages: string[]; pdf: Blob }> {
  const width = 1240, height = 1754, margin = 76;
  const pages: HTMLCanvasElement[] = [];
  const raw = report.contentFields;
  const groups: Record<string, FieldGroup> = Array.isArray(raw) ? { generalInfo: Object.fromEntries(raw.map((f, i) => [f.label || f.key || `Field ${i + 1}`, f.value ?? null])) } : raw || {};
  const title = report.coinTitle || expertDisplayTitle(request);
  const id = request.displayId || expertRequestId(request);
  const createPage = () => {
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Could not create report page.");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height); ctx.strokeStyle = "#e7e2df"; ctx.lineWidth = 2; ctx.strokeRect(24, 24, width - 48, height - 48); ctx.strokeRect(32, 32, width - 64, height - 64);
    pages.push(canvas); return ctx;
  };
  const text = (ctx: CanvasRenderingContext2D, str: string, x: number, y: number, size = 24, color = "#1e1e1f", bold = false) => { ctx.fillStyle = color; ctx.font = `${bold ? 600 : 400} ${size}px Arial, sans-serif`; ctx.fillText(str, x, y); };
  const wrap = (ctx: CanvasRenderingContext2D, input: string, max: number) => { const lines: string[] = []; for (const paragraph of input.split("\n")) { let line = ""; for (const word of paragraph.split(/\s+/)) { const candidate = line ? `${line} ${word}` : word; if (line && ctx.measureText(candidate).width > max) { lines.push(line); line = word; } else line = candidate; } lines.push(line); } return lines; };
  const rounded = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke = "#e3e3e3") => { ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); };
  let ctx = createPage();
  text(ctx, "COINZY AI", margin, 145, 40, "#1e1e1f", true); text(ctx, "EXPERT COIN EVALUATION", margin, 179, 20, "#606062");
  text(ctx, "EVALUATION REPORT", 790, 145, 28, "#7c3c3f", true); text(ctx, `Request ID: #${id.replace(/^#/, "")}`, 790, 179, 19, "#606062");
  if (report.submittedAt && !Number.isNaN(Date.parse(report.submittedAt))) text(ctx, `Date: ${new Date(report.submittedAt).toLocaleDateString()}`, 790, 208, 19, "#606062");
  ctx.fillStyle = "#e5e5e5"; ctx.fillRect(margin, 236, width - margin * 2, 2);
  rounded(ctx, margin, 270, 395, 350, "#faf8f6"); text(ctx, "EVALUATED BY EXPERT", margin + 24, 315, 18, "#7c3c3f", true); text(ctx, report.expertDisplayName || "Expert evaluation", margin + 24, 360, 27, "#1e1e1f", true);
  rounded(ctx, 500, 270, 664, 350, "#faf8f6"); ctx.font = "600 27px Arial, sans-serif"; wrap(ctx, title, 600).slice(0, 3).forEach((line, i) => text(ctx, line, 525, 312 + i * 34, 27, "#1e1e1f", true));
  const photoUrls = [...(request.payload?.media?.obverse || []), ...(request.payload?.media?.reverse || []), ...(request.payload?.media?.edge || [])].slice(0, 6);
  const images = await Promise.all(photoUrls.map((src) => new Promise<HTMLImageElement | null>((resolve) => { const img = new Image(); const timer = window.setTimeout(() => resolve(null), 8000); img.crossOrigin = "anonymous"; img.onload = () => { window.clearTimeout(timer); resolve(img); }; img.onerror = () => { window.clearTimeout(timer); resolve(null); }; img.src = src; })));
  images.forEach((img, i) => { if (!img) return; const x = 525 + i * 76; ctx.save(); ctx.beginPath(); ctx.arc(x + 44, 437, 44, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(img, x, 393, 88, 88); ctx.restore(); ctx.beginPath(); ctx.arc(x + 44, 437, 44, 0, Math.PI * 2); ctx.strokeStyle = "#dfdfe0"; ctx.stroke(); });
  const summary: [string, unknown][] = [["Authenticity", groups.expertAssessment?.authenticity ?? report.authenticity], ["Condition", groups.expertAssessment?.conditionOrGrade], ["Est. Value", groups.valueAndRarity?.estimatedPriceRange]];
  rounded(ctx, 525, 497, 615, 102, "#e8f7ed", "#e8f7ed"); summary.filter(([, v]) => v != null && v !== "").forEach(([key, v], i) => { text(ctx, key, 546, 525 + i * 29, 19, "#606062"); text(ctx, String(v), 725, 525 + i * 29, 20, "#00875a", true); });
  let x = margin, y = 665, rowHeight = 0; const cardWidth = 526, gap = 36;
  const ordered = [...Object.keys(titles).filter((key) => groups[key]), ...Object.keys(groups).filter((key) => !titles[key])];
  for (const key of ordered) {
    const entries = Object.entries(groups[key] || {}).filter(([, v]) => v !== null && v !== "" && v !== undefined);
    if (!entries.length) continue;
    let offset = 0;
    while (offset < entries.length) {
      if (y > 1510) { ctx = createPage(); x = margin; y = 80; rowHeight = 0; }
      ctx.font = "22px Arial, sans-serif";
      const available = height - 80 - y; let cardHeight = 80; const rows: { name: string; lines: string[] }[] = [];
      while (offset < entries.length) {
        const [field, value] = entries[offset]; const lines = wrap(ctx, String(value), cardWidth - 48);
        const row = 34 + lines.length * 28;
        if (rows.length && cardHeight + row + 20 > available) break;
        rows.push({ name: label(field), lines }); cardHeight += row; offset++;
      }
      if (!rows.length) break;
      rounded(ctx, x, y, cardWidth, cardHeight, "#fff"); text(ctx, titles[key] || label(key), x + 24, y + 41, 25, "#7c3c3f", true);
      let rowY = y + 75;
      for (const row of rows) { text(ctx, row.name, x + 24, rowY, 20, "#606062"); rowY += 27; for (const line of row.lines) { text(ctx, line, x + 24, rowY, 22, "#1e1e1f", true); rowY += 28; } rowY += 7; }
      rowHeight = Math.max(rowHeight, cardHeight);
      if (x === margin) x = margin + cardWidth + gap; else { x = margin; y += rowHeight + 30; rowHeight = 0; }
      if (offset < entries.length && x !== margin) { x = margin; y += rowHeight + 30; rowHeight = 0; }
    }
  }
  const pageImages = pages.map((canvas) => canvas.toDataURL("image/jpeg", 0.92));
  const encoder = new TextEncoder(); const chunks: Uint8Array[] = []; let length = 0; const offsets: number[] = [];
  const add = (data: string | Uint8Array) => { const bytes = typeof data === "string" ? encoder.encode(data) : data; chunks.push(bytes); length += bytes.length; };
  const object = (id: number, body: string) => { offsets[id] = length; add(`${id} 0 obj\n${body}\nendobj\n`); };
  add("%PDF-1.4\n%PDFREPORT\n"); object(1, "<< /Type /Catalog /Pages 2 0 R >>"); object(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] >>`);
  pageImages.forEach((url, i) => { const pageId = 3 + i * 3, imageId = pageId + 1, contentId = pageId + 2; const binary = atob(url.split(",")[1]); const jpeg = Uint8Array.from(binary, (c) => c.charCodeAt(0)); object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`); offsets[imageId] = length; add(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); add(jpeg); add("\nendstream\nendobj\n"); const content = "q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n"; object(contentId, `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`); });
  const xref = length; add(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`); for (let i = 1; i < offsets.length; i++) add(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`); add(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return { pages: pageImages, pdf: new Blob(chunks as BlobPart[], { type: "application/pdf" }) };
}
