// Copies the OCR engine + English language data from node_modules into public/ocr (runs automatically after `npm install`)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'ocr'), nm = (p) => path.join(root, 'node_modules', p);
try {
  fs.mkdirSync(path.join(out, 'lang'), { recursive: true });
  fs.copyFileSync(nm('tesseract.js/dist/worker.min.js'), path.join(out, 'worker.min.js'));
  for (const f of ['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js']) fs.copyFileSync(nm('tesseract.js-core/' + f), path.join(out, f));
  fs.copyFileSync(nm('@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz'), path.join(out, 'lang', 'eng.traineddata.gz'));
  console.log('OCR assets ready in public/ocr');
} catch (e) {
  console.warn('OCR asset copy skipped (images will use the online OCR fallback):', e.message);
}
