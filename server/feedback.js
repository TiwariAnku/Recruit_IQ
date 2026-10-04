// Interview feedback history – stored permanently in server/data/feedback.json.
// Records are append-only (no edit / delete endpoints) so the hiring decisions stay auditable.
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'data', 'feedback.json');
fs.mkdirSync(path.dirname(FILE), { recursive: true });

const read = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return []; } };
const write = (a) => { const tmp = FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(a, null, 2)); fs.renameSync(tmp, FILE); };

const KEYS = ['technical', 'problem', 'communication', 'culture', 'experience'];
const RECS = ['Strong Hire', 'Hire', 'Hold', 'No Hire'];
const NEXT = ['Schedule next round', 'Select candidate', 'Hold decision', 'Reject candidate'];
const text = (v, max = 3000) => String(v ?? '').trim().slice(0, max);

export const feedbackRouter = express.Router();

feedbackRouter.get('/', (req, res) => {
  let list = read();
  if (req.query.resumeId) list = list.filter((f) => String(f.resumeId) === String(req.query.resumeId));
  res.json({ feedback: list });
});

feedbackRouter.post('/', (req, res) => {
  const b = req.body || {}, errs = [];
  if (!text(b.candidate)) errs.push('candidate is required');
  const ratings = {};
  for (const k of KEYS) { const n = Number(b.ratings?.[k]); if (!Number.isInteger(n) || n < 1 || n > 5) errs.push(`rating "${k}" must be 1-5`); else ratings[k] = n; }
  if (!RECS.includes(b.recommendation)) errs.push('invalid recommendation');
  if (!NEXT.includes(b.nextStep)) errs.push('invalid next step');
  if (text(b.strengths).length < 15) errs.push('strengths must be at least 15 characters');
  if (text(b.concerns).length < 4) errs.push('concerns are required');
  if (!text(b.submittedBy)) errs.push('submittedBy is required');
  if (errs.length) return res.status(400).json({ error: errs.join('; ') });

  const all = read(), id = text(b.id, 60) || 'fb' + Date.now(), existing = all.find((f) => f.id === id);
  if (existing) return res.json({ feedback: existing }); // idempotent – safe to retry
  const overall = +(KEYS.reduce((a, k) => a + ratings[k], 0) / KEYS.length).toFixed(1);
  const rec = {
    id, interviewId: b.interviewId ?? null, resumeId: b.resumeId ?? null, candidate: text(b.candidate, 120), position: text(b.position, 80),
    round: text(b.round, 60), interviewer: text(b.interviewer, 80), mode: text(b.mode, 20), hr: text(b.hr, 40), submittedBy: text(b.submittedBy, 60),
    submittedAt: b.submittedAt || new Date().toISOString(), receivedAt: new Date().toISOString(),
    ratings, overall, recommendation: b.recommendation, nextStep: b.nextStep,
    strengths: text(b.strengths), concerns: text(b.concerns), notes: text(b.notes),
  };
  write([rec, ...all]);
  res.status(201).json({ feedback: rec });
});
