import { authenticityStyle } from "./authenticity";
import { expertDisplayTitle, expertRequestId, type ExpertReport, type ExpertRequest } from "./types";

type FieldGroup = Record<string, string | number | boolean | null>;

/** Draw the Android expert report at A4 proportions and package the same pages as a PDF. */
export async function makeReportPdf(request: ExpertRequest, report: ExpertReport): Promise<{ pages: string[]; pdf: Blob }> {
  const width = 1190, height = 1684, margin = 36, contentWidth = 523, columnWidth = 253.5, gap = 16;
  const pages: HTMLCanvasElement[] = [];
  const raw = report.contentFields;
  const groups: Record<string, FieldGroup> = Array.isArray(raw) ? { generalInfo: Object.fromEntries(raw.map((f, i) => [f.key || f.label || `Field ${i + 1}`, f.value ?? null])) } : raw || {};
  const general = groups.generalInfo || {}, physical = groups.physicalSpecs || {}, market = groups.valueAndRarity || {}, design = groups.designDetails || {}, assessment = groups.expertAssessment || {};
  const val = (value: unknown) => value == null || String(value).trim() === "" ? "—" : String(value).trim();
  const title = report.coinTitle || String(general.coinName || "") || expertDisplayTitle(request);
  const id = (request.displayId || expertRequestId(request)).replace(/^#/, "");
  const date = report.submittedAt && !Number.isNaN(Date.parse(report.submittedAt)) ? new Date(report.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const estimatedValue = [market.currency, market.estimatedPriceRange].filter((v) => v != null && String(v).trim()).join(" ");
  const authenticity = assessment.authenticity || report.authenticity;
  const style = authenticityStyle(authenticity);
  const ink = "#1e1e1f", muted = "#606062", wine = "#7c3c3f";
  const requestPhotos = [...(request.payload?.media?.obverse || []), ...(request.payload?.media?.reverse || []), ...(request.payload?.media?.edge || [])];
  const attachmentPhotos = report.attachments?.filter((a) => a.url && !String(a.type || a.kind || "").toLowerCase().includes("video")).map((a) => a.url!) || [];
  // The request media is the complete submitted set shown on the report screen.
  const photoUrls = requestPhotos.length ? requestPhotos : attachmentPhotos;
  const loadImage = (src: string) => new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(() => resolve(null), 8000);
    const remote = /^https?:\/\//i.test(src);
    let triedOriginal = !remote;
    img.crossOrigin = "anonymous";
    img.onload = () => { window.clearTimeout(timer); resolve(img); };
    img.onerror = () => {
      if (!triedOriginal) { triedOriginal = true; img.src = src; return; }
      window.clearTimeout(timer); resolve(null);
    };
    // Same-origin optimized images can be drawn into the PDF canvas even when the
    // original storage server does not send browser CORS headers.
    img.src = remote ? `/_next/image?url=${encodeURIComponent(src)}&w=256&q=75` : src;
  });
  const videoUrl = request.payload?.media?.video || report.attachments?.find((a) => a.url && (/video/i.test(a.kind || a.type || "") || /(?:\/video\/|\.(?:mp4|mov)(?:\?|$))/i.test(a.url)))?.url;
  const loadVideo = (src: string) => new Promise<HTMLVideoElement | null>((resolve) => {
    const video = document.createElement("video"); let finished = false;
    const finish = (result: HTMLVideoElement | null) => { if (finished) return; finished = true; window.clearTimeout(timer); resolve(result); };
    const timer = window.setTimeout(() => finish(video.readyState >= 2 ? video : null), 8000);
    video.crossOrigin = "anonymous"; video.preload = "auto"; video.muted = true;
    video.onloadeddata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0.2) {
        try { video.currentTime = Math.min(0.25, video.duration / 2); return; } catch { /* Use the first decoded frame. */ }
      }
      finish(video);
    };
    video.onseeked = () => finish(video); video.onerror = () => finish(null);
    // Read the authorized request's video through our origin so canvas export is not blocked by storage CORS.
    video.src = /^https?:\/\//i.test(src) ? `/api/experts/report-video/${encodeURIComponent(expertRequestId(request))}` : src;
  });
  await document.fonts.ready;
  const [[logo, ...photos], video] = await Promise.all([Promise.all([loadImage("/icon.png"), ...photoUrls.slice(0, 6).map(loadImage)]), videoUrl ? loadVideo(videoUrl) : Promise.resolve(null)]);
  let ctx!: CanvasRenderingContext2D;
  let y = 0;
  const font = (size: number, bold = false) => `${bold ? 700 : 400} ${size}px ${getComputedStyle(document.documentElement).getPropertyValue("--font-plus-jakarta") || "sans-serif"}`;
  const text = (str: string, x: number, top: number, size = 12, color = ink, bold = false, align: CanvasTextAlign = "left") => { ctx.fillStyle = color; ctx.font = font(size, bold); ctx.textAlign = align; ctx.textBaseline = "top"; ctx.fillText(str, x, top); ctx.textAlign = "left"; };
  const box = (x: number, top: number, w: number, h: number, fill: string | null, stroke: string | null = null, radius = 8) => { ctx.beginPath(); ctx.roundRect(x, top, w, h, radius); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } };
  const wrap = (input: string, maxWidth: number, size = 12, bold = false) => { ctx.font = font(size, bold); const lines: string[] = []; for (const paragraph of input.split("\n")) { let line = ""; for (const word of paragraph.split(/\s+/)) { const next = line ? `${line} ${word}` : word; if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = word; } else line = next; } lines.push(line); } return lines; };
  const createPage = () => { const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const context = canvas.getContext("2d"); if (!context) throw new Error("Could not create report page."); ctx = context; ctx.scale(2, 2); pages.push(canvas); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 595, 842); ctx.strokeStyle = "#e7e5e4"; ctx.strokeRect(12.5, 12.5, 570, 817); ctx.strokeStyle = "#f4efea"; ctx.strokeRect(16.5, 16.5, 562, 809); if (logo) ctx.drawImage(logo, 36, 60, 40, 40); text("COINZY AI", 84, 61, 18, ink, true); text("EXPERT COIN EVALUATION", 84, 82, 10, muted); text("EVALUATION REPORT", 559, 62, 14, wine, true, "right"); text(`Request ID: #${id}   |   Date: ${date}`, 559, 83, 10, muted, false, "right"); ctx.fillStyle = "#e7e5e4"; ctx.fillRect(36, 123, 523, 1); y = 124; };
  const ensure = (h: number) => { if (y + h > 806 && y > 156) { createPage(); y += 32; } };
  const heading = (x: number, top: number, titleText: string, symbol: string) => { box(x, top, 24, 24, wine, null, 12); text(symbol, x + 12, top + 4, 13, "#fff", true, "center"); text(titleText, x + 36, top + 4, 14, ink, true); };
  const dataCard = (x: number, top: number, headingText: string, symbol: string, rows: [string, string][]) => { heading(x, top, headingText, symbol); let rowY = top + 48; const cardTop = top + 36, cell = (columnWidth - 24) / 2; const layouts = rows.map(([key, value]) => ({ key: wrap(key, cell), value: wrap(value, cell, 12, true) })); const cardHeight = 24 + layouts.reduce((sum, row, i) => sum + Math.max(row.key.length, row.value.length) * 18 + (i < rows.length - 1 ? 12 : 0), 0); box(x, cardTop, columnWidth, cardHeight, null, "#dfdfe0", 12); layouts.forEach((row) => { row.key.forEach((line, i) => text(line, x + 12, rowY + i * 18, 12, muted)); row.value.forEach((line, i) => text(line, x + columnWidth - 12, rowY + i * 18, 12, ink, true, "right")); rowY += Math.max(row.key.length, row.value.length) * 18 + 12; }); return cardTop + cardHeight; };
  createPage(); y += 28;
  const titleLines = wrap(title, 241.5, 14, true).slice(0, 2); const heroHeight = 136 + Math.max(0, titleLines.length * 17 - 34); box(margin, y, contentWidth, heroHeight, "#faf8f5", "#e7e5e4"); titleLines.forEach((line, i) => text(line, 48, y + 12 + i * 17, 14, ink, true));
  const loadedPhotos = photos.filter((p): p is HTMLImageElement => !!p);
  const thumbTop = y + 65;
  const mediaCount = loadedPhotos.length + (videoUrl ? 1 : 0);
  const thumbSize = Math.min(70, (241.5 - Math.max(0, mediaCount - 1) * 4) / Math.max(mediaCount, 1));
  loadedPhotos.forEach((img, i) => { const x = 48 + i * (thumbSize + 4); ctx.save(); ctx.beginPath(); ctx.arc(x + thumbSize / 2, thumbTop + thumbSize / 2, thumbSize / 2, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(img, x, thumbTop, thumbSize, thumbSize); ctx.restore(); });
  if (videoUrl) { const videoX = 48 + loadedPhotos.length * (thumbSize + 4); box(videoX, thumbTop, thumbSize, thumbSize, "#dedbd8", null, 6); if (video) { ctx.save(); ctx.beginPath(); ctx.roundRect(videoX, thumbTop, thumbSize, thumbSize, 6); ctx.clip(); ctx.drawImage(video, videoX, thumbTop, thumbSize, thumbSize); ctx.restore(); } box(videoX + thumbSize / 2 - 12, thumbTop + thumbSize / 2 - 12, 24, 24, "rgba(0,0,0,0.55)", null, 12); text("▶", videoX + thumbSize / 2, thumbTop + thumbSize / 2 - 7, 12, "#fff", false, "center"); }
  const summaryX = 305.5; box(summaryX, y + 12, 241.5, 100, style?.background || "#f4f5f6"); const summary: [string, unknown][] = [["Authenticity", authenticity], ["Condition", assessment.conditionOrGrade], ["Est. Value", estimatedValue]]; summary.forEach(([name, value], i) => { const rowY = y + 20 + i * 32; box(summaryX + 16, rowY, 20, 20, "#ffffff", null, 10); text(["◇", "☆", "▤"][i], summaryX + 26, rowY + 3, 12, style?.color || muted, true, "center"); text(name, summaryX + 44, rowY + 4, 12); text(val(value), summaryX + 225, rowY + 4, 12, style?.color || muted, true, "right"); });
  y += heroHeight + 28;
  const measureCard = (rows: [string, string][]) => 60 + rows.reduce((sum, [key, value], i) => sum + Math.max(wrap(key, (columnWidth - 24) / 2).length, wrap(value, (columnWidth - 24) / 2, 12, true).length) * 18 + (i < rows.length - 1 ? 12 : 0), 0);
  const generalRows: [string, string][] = [["Coin Name", val(title)], ["Currency & Denomination", val(general.currencyAndDenomination)], ["Issuer", val(general.issuer)], ["Period", val(general.period)], ["Ruler /Govt", val(general.rulerOrGovt)], ["Year of minting", val(general.yearOfMinting)], ["Mint location", val(general.mintLocation)]];
  const physicalRows: [string, string][] = [["Material", val(physical.material)], ["Weight", val(physical.weight)], ["Dominant Color", val(physical.dominantColor)], ["Minting method", val(physical.mintingMethod)]];
  const marketRows: [string, string][] = [["Rarity", val(market.rarity)], ["Est. Market Value", val(estimatedValue)]];
  ensure(Math.max(measureCard(generalRows), measureCard(physicalRows) + 24 + measureCard(marketRows)));
  const leftEnd = dataCard(36, y, "General Information", "▤", generalRows);
  let rightEnd = dataCard(305.5, y, "Physical Specifications", "◉", physicalRows);
  rightEnd = dataCard(305.5, rightEnd + 24, "Market Value and Rarity", "▥", marketRows); y = Math.max(leftEnd, rightEnd) + 28;
  const narrative = (section: string, rows: [string, string][]) => {
    let rowIndex = 0, lineIndex = 0, continued = false;
    while (rowIndex < rows.length) {
      ensure(96);
      heading(36, y, section + (continued ? " (continued)" : ""), "◇");
      const cardTop = y + 36;
      let innerY = cardTop + 12;
      const drawn: { name: string; lines: string[]; y: number }[] = [];
      while (rowIndex < rows.length) {
        const [name, value] = rows[rowIndex];
        const lines = wrap(value, contentWidth - 24, 12, true);
        const room = Math.floor((806 - innerY - 16 - 12) / 18);
        if (room < 1) break;
        const selected = lines.slice(lineIndex, lineIndex + room);
        drawn.push({ name: name + (lineIndex ? " (continued)" : ""), lines: selected, y: innerY });
        innerY += 16 + selected.length * 18 + 12;
        lineIndex += selected.length;
        if (lineIndex < lines.length) break;
        rowIndex++; lineIndex = 0;
      }
      box(36, cardTop, contentWidth, innerY - cardTop, null, "#dfdfe0", 12);
      for (const row of drawn) { text(row.name, 48, row.y, 12, muted); row.lines.forEach((line, i) => text(line, 48, row.y + 16 + i * 18, 12, ink, true)); }
      y = innerY; continued = true;
      if (rowIndex < rows.length) { createPage(); y += 32; }
    }
  };
  narrative("Design Details", [["Front (Obverse)", val(design.obverseDescription)], ["Back (Reverse)", val(design.reverseDescription)], ["History", val(design.history)]]);
  createPage(); y += 32;
  const assessmentRows: [string, string][] = [["Authenticity", val(assessment.errorsOrSpecialFeatures)], ["Condition Grade", val(assessment.conditionOrGrade)], ["Expert Recommendation", val(assessment.recommendation)]];
  let rowIndex = 0, lineIndex = 0, continued = false;
  while (rowIndex < assessmentRows.length) {
    ensure(115);
    heading(36, y, "Expert Assessment" + (continued ? " (continued)" : ""), "▤");
    const top = y + 36;
    let inner = top + 12;
    const rendered: { name: string; lines: string[]; y: number; height: number; part: boolean }[] = [];
    while (rowIndex < assessmentRows.length) {
      const [name, value] = assessmentRows[rowIndex];
      const lines = wrap(value, contentWidth - 64, 12, true);
      const room = Math.floor((806 - inner - 38 - 20) / 18);
      if (room < 1) break;
      const selected = lines.slice(lineIndex, lineIndex + room);
      const innerHeight = Math.max(name === "Condition Grade" ? 60 : 82, 38 + selected.length * 18 + 8);
      rendered.push({ name, lines: selected, y: inner, height: innerHeight, part: lineIndex > 0 });
      inner += innerHeight + 12; lineIndex += selected.length;
      if (lineIndex < lines.length) break;
      rowIndex++; lineIndex = 0;
    }
    box(36, top, contentWidth, inner - top, null, "#dfdfe0", 12);
    for (const row of rendered) {
      if (row.name !== "Expert Recommendation") box(48, row.y, contentWidth - 24, row.height, row.name === "Authenticity" ? (style?.background || "#f4f5f6") : "#f7f1eb");
      text(row.name + (row.part ? " (continued)" : ""), 56, row.y + 8, 12, muted);
      if (row.name === "Authenticity") { const auth = val(authenticity); ctx.font = font(12, true); const pillWidth = ctx.measureText(auth).width + 24; box(539 - pillWidth, row.y + 8, pillWidth, 22, style?.color || muted, null, 11); text(auth, 539 - pillWidth / 2, row.y + 12, 12, "#fff", true, "center"); }
      row.lines.forEach((line, i) => text(line, 56, row.y + 38 + i * 18, 12, ink, true));
    }
    y = inner; continued = true;
    if (rowIndex < assessmentRows.length) { createPage(); y += 32; }
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
