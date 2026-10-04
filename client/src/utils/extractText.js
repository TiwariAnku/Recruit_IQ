// Browser-side resume reading – works with or without the server.
//   PDF with text  -> pdf.js text layer
//   scanned PDF / PNG / JPG -> OCR (tesseract.js, runs fully in the browser; assets are copied to public/ocr by `npm install`)
//   DOCX -> mammoth
// The extracted text is passed to the same analyser the server uses (analyzerCore).
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { analyzeText, invalidAnalysis } from './analyzerCore';

const CACHE_KEY = 'recruitiq.analysis.v1';
const ext = (n) => (String(n).match(/\.(\w+)$/)?.[1] || '').toLowerCase();
const words = (t) => (t.match(/[A-Za-z0-9#+.]{2,}/g) || []).length;
const timeout = (p, ms, msg) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);

// ---- analysis cache (so images are not OCR'd again after a page refresh) ----
export const cachedAnalysis = (url) => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')[url] || null; } catch { return null; } };
export const cacheAnalysis = (url, a) => { try { const c = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); c[url] = a; localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* storage full – ignore */ } };
// "usable" = the file could really be read (a blank / unreadable result is worth retrying in the browser)
export const usable = (a) => !!a && !['unreadable', 'blank'].includes(a.verdict);

// ---- OCR ----
let workerP = null;
function ocrWorker() {
  if (!workerP) {
    workerP = (async () => {
      const { createWorker } = await import('tesseract.js');
      try { return await timeout(createWorker('eng', 1, { workerPath: '/ocr/worker.min.js', corePath: '/ocr', langPath: '/ocr/lang', gzip: true }), 30000, 'Local OCR files not found'); }
      catch { return timeout(createWorker('eng'), 90000, 'The OCR engine could not be loaded (check your internet connection)'); } // CDN fallback
    })();
    workerP.catch(() => { workerP = null; });
  }
  return workerP;
}
async function ocr(canvas) {
  const w = await ocrWorker();
  const { data } = await w.recognize(canvas);
  return { text: data.text || '', confidence: data.confidence };
}
// Upscale small screenshots – OCR accuracy drops a lot below ~150 dpi
async function imageToCanvas(blob) {
  const bmp = await createImageBitmap(blob);
  const k = Math.min(3, Math.max(1, 2000 / bmp.width)), c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingQuality = 'high'; g.drawImage(bmp, 0, 0, c.width, c.height);
  return c;
}

// ---- PDF ----
async function readPdf(buf, status) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true, isEvalSupported: false, verbosity: 0 }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const items = (await (await doc.getPage(i)).getTextContent()).items;
    let y = null;
    for (const it of items) { if (y !== null) text += Math.abs(it.transform[5] - y) > 2 ? '\n' : ' '; text += it.str; y = it.transform[5]; }
    text += '\n';
  }
  if (words(text) >= 15) return { text, pages: doc.numPages, source: 'pdf' };
  status?.('Scanned PDF detected – reading it with OCR…'); // no text layer: render pages and OCR them
  let out = '', conf = 0, n = Math.min(doc.numPages, 3);
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i), vp = page.getViewport({ scale: 2.2 }), c = document.createElement('canvas');
    c.width = vp.width; c.height = vp.height;
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    const r = await ocr(c); out += r.text + '\n'; conf += r.confidence / n;
  }
  return { text: out, pages: doc.numPages, source: 'ocr', confidence: conf };
}

// ---- public API ----
export async function analyzeFile(file, name = file.name, status) {
  const e = ext(name);
  try {
    let r;
    if (e === 'pdf') r = await readPdf(await file.arrayBuffer(), status);
    else if (e === 'docx') { const mammoth = (await import('mammoth/mammoth.browser.min.js')).default; r = { text: (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value, pages: null, source: 'docx' }; }
    else if (['png', 'jpg', 'jpeg'].includes(e)) { status?.('Reading the image with OCR (can take 10–20 seconds)…'); const o = await ocr(await imageToCanvas(file)); r = { text: o.text, pages: 1, source: 'ocr', confidence: o.confidence }; }
    else if (e === 'doc') return invalidAnalysis('unreadable', ['Legacy .doc cannot be read – please save it as .docx or PDF']);
    else return invalidAnalysis('unreadable', ['Unsupported file type']);
    return { ...analyzeText(r.text, r.pages), source: r.source, confidence: r.confidence != null ? Math.round(r.confidence) : undefined };
  } catch (err) {
    return invalidAnalysis('unreadable', ['Could not read this file: ' + (err.message || 'unknown error')]);
  }
}
