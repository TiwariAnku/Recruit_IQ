// Compares a real resume analysis against a position's requirements (required / preferred skills, experience range).
import { skillRegex, evidence } from './analyzerCore';

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function evaluate(a, pos) {
  if (!a || !a.valid || !pos) return null;
  const text = a.text || '';
  const check = (s) => { const found = text ? skillRegex(s).test(text) : a.skills.includes(s); return { skill: s, found, evidence: found && text ? evidence(text, s) : null }; };
  const must = (pos.must || []).map(check), nice = (pos.nice || []).map(check);
  const mf = must.filter((x) => x.found).length, nf = nice.filter((x) => x.found).length;
  const mustPct = must.length ? mf / must.length : 1, nicePct = nice.length ? nf / nice.length : null;
  const yrs = a.experienceYears || 0, min = Number(pos.minExp) || 0, max = Number(pos.maxExp) || 0;
  let expFit = 1, expNote = 'Within the required range';
  if (yrs < min) { expFit = Math.max(0, 1 - (min - yrs) / Math.max(min, 1)); expNote = `${plural(min - yrs, 'year')} below the ${min}-year minimum`; }
  else if (max && yrs > max) { expFit = 0.85; expNote = `${plural(yrs - max, 'year')} above the ${max}-year upper range (may be overqualified)`; }
  const wn = nicePct == null ? 0 : 0.15, wm = 0.7, we = 1 - wm - wn;
  const score = Math.round(100 * (wm * mustPct + wn * (nicePct || 0) + we * expFit));
  const level = score >= 75 ? 'Strong match' : score >= 50 ? 'Partial match' : 'Weak match';
  const missM = must.filter((x) => !x.found).map((x) => x.skill);
  const parts = [`Meets ${mf} of ${must.length} required skills${missM.length ? ` – missing ${missM.join(', ')}` : ''}.`];
  if (nice.length) parts.push(`${nf} of ${nice.length} preferred skills found.`);
  parts.push(`Experience: ${plural(yrs, 'year')} (${expNote.toLowerCase()}).`);
  return { score, level, must, nice, mf, nf, mustPct, nicePct, expFit, expNote, yrs, min, max, summary: parts.join(' ') };
}

// Which of the given positions fits this resume best?
export function bestFit(a, positions) {
  let best = null;
  for (const p of positions) { const e = evaluate(a, p); if (e && (!best || e.score > best.score)) best = { pos: p, score: e.score }; }
  return best && best.score > 0 ? best : null;
}
