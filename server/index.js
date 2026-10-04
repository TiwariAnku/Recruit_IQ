import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { feedbackRouter } from './feedback.js';
import { analyze } from './analyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Uploaded CVs are stored here:  server/uploads/resumes
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'resumes');
const INDEX = path.join(__dirname, 'data', 'uploads.json');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(path.dirname(INDEX), { recursive: true });

const readIndex = () => { try { return JSON.parse(fs.readFileSync(INDEX, 'utf8')); } catch { return []; } };
const writeIndex = (a) => fs.writeFileSync(INDEX, JSON.stringify(a, null, 2));

const ALLOWED = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'image/png': '.png',
  'image/jpeg': '.jpg',
};
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const base = path.parse(file.originalname).name.replace(/[^\w.-]+/g, '_').slice(0, 80);
    cb(null, `${Date.now()}-${base}${ALLOWED[file.mimetype]}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => (ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error('Only PDF, DOC, DOCX, PNG or JPG files are allowed'))),
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // view a CV: GET /uploads/resumes/<file>

app.use('/api/feedback', feedbackRouter); // interview feedback history
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'recruitiq-api' }));

app.post('/api/resumes/upload', upload.array('resumes', 20), async (req, res) => {
  const files = await Promise.all((req.files || []).map(async (f) => ({
    name: f.originalname, url: `/uploads/resumes/${f.filename}`, mime: f.mimetype, size: f.size, uploadedAt: new Date().toISOString(),
    analysis: await analyze(f.path).catch(() => null), // real content check: blank / not a resume / skills / experience / education
  })));
  writeIndex([...files, ...readIndex()]);
  res.status(201).json({ files });
});

app.get('/api/resumes', (_req, res) => {
  res.json({ files: readIndex().filter((i) => fs.existsSync(path.join(__dirname, i.url))) });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 10 MB' : err.message }));

app.listen(process.env.PORT || 5000, () => console.log('API running on port', process.env.PORT || 5000));
