// Reads the real text out of an uploaded PDF / DOCX and runs the shared text analysis.
import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import { analyzeText, invalidAnalysis } from './analyzerCore.js';

async function pdfText(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true, isEvalSupported: false, verbosity: 0 }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const c = await (await doc.getPage(i)).getTextContent();
    let y = null;
    for (const it of c.items) { if (y !== null) text += Math.abs(it.transform[5] - y) > 2 ? '\n' : ' '; text += it.str; y = it.transform[5]; }
    text += '\n';
  }
  return { text, pages: doc.numPages };
}

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return pdfText(fs.readFileSync(filePath));
  if (ext === '.docx') { const d = await mammoth.extractRawText({ path: filePath }); return { text: d.value || '', pages: null }; }
  if (ext === '.doc') return { unsupported: 'Legacy .doc cannot be read – please save it as .docx or PDF' };
  return { unsupported: 'Images need OCR, which is not enabled – upload a PDF or DOCX to get an analysis' };
}

export async function analyze(filePath) {
  let x;
  try { x = await extractText(filePath); } catch { return invalidAnalysis('unreadable', ['The file is corrupted or password-protected']); }
  if (x.unsupported) return invalidAnalysis('unreadable', [x.unsupported]);
  return analyzeText(x.text, x.pages);
}
