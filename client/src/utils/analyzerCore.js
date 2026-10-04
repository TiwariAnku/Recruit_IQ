// Rule-based resume text analysis – shared by the server (after PDF/DOCX text extraction) and the client (demo resumes).
// Keep server/analyzerCore.js and client/src/utils/analyzerCore.js identical.
const SKILLS = {
  'C#': /\bc#|\bc sharp\b/i, '.NET': /\.net\b|\bdotnet\b|asp\.net/i, SQL: /\bsql\b|mysql|postgres(ql)?|t-sql|pl\/sql/i,
  Azure: /\bazure\b/i, Java: /\bjava\b(?!\s?script)/i, JavaScript: /javascript|typescript|\bes6\b/i, React: /\breact(\.?js)?\b/i,
  'Node.js': /\bnode\.?js\b/i, Python: /\bpython\b/i, Excel: /\bexcel\b/i, 'Power BI': /power\s?bi/i, Tableau: /\btableau\b/i,
  Selenium: /\bselenium\b/i, Testing: /(manual|automation|regression|unit|functional|integration)\s+testing|test (cases?|plans?|scripts?)|\bqa\b|quality assurance/i,
  Jira: /\bjira\b/i, API: /\b(rest(ful)?\s+)?apis?\b|postman|swagger/i, Git: /\bgit(hub|lab)?\b/i, Docker: /\bdocker\b/i, AWS: /\baws\b|amazon web services/i,
  MongoDB: /\bmongo(db)?\b/i, HTML: /\bhtml5?\b/i, CSS: /\bcss3?\b|tailwind|bootstrap/i, Angular: /\bangular\b/i, Spring: /\bspring( boot)?\b/i,
  'Machine Learning': /machine learning|\bml\b|deep learning/i, Agile: /\bagile\b|\bscrum\b/i,
};
const HEADING = /^\s*(work\s+experience|professional\s+experience|employment(?:\s+history)?|experience|education(?:al)?(?:\s+qualifications?)?|academic\s+\w+|skills?|technical\s+skills|key\s+skills|core\s+competencies|projects?|summary|professional\s+summary|career\s+objective|objective|profile|certifications?|achievements?)\s*:?\s*$/gim;
const HEADING_ONE = new RegExp(HEADING.source, 'i');
const BUZZ = /\b(leverag\w+|spearhead\w*|synerg\w+|results-driven|proven track record|passionate|dynamic|cutting-edge|innovative|seamless\w*|robust|holistic|transformative|adept|fast-paced|self-motivated|detail-oriented|team player)\b/gi;

export const SKILL_NAMES = Object.keys(SKILLS);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Known skills use a tuned pattern; any custom skill added to a position is matched as a whole word/phrase.
export const skillRegex = (name) => SKILLS[name] || new RegExp('(^|[^A-Za-z0-9])' + esc(name) + '($|[^A-Za-z0-9])', 'i');
export function evidence(text, name) {
  const m = text.match(skillRegex(name));
  if (!m) return null;
  const i = m.index + (m[0].toLowerCase().indexOf(name.toLowerCase()) > -1 ? m[0].toLowerCase().indexOf(name.toLowerCase()) : 0);
  return '…' + text.slice(Math.max(0, i - 50), i + name.length + 50).replace(/\s+/g, ' ').trim() + '…';
}

function yearsOfExperience(full) {
  const text = full.split('\n').filter((l) => !/(b\.?\s?tech|b\.e\b|b\.?\s?sc|bca|bachelor|master|m\.?\s?tech|mba|mca|university|college|school|degree|diploma|ph\.?d|hsc|ssc|cgpa)/i.test(l)).join('\n');
  const thisYear = new Date().getFullYear();
  const explicit = [...text.matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:[\w-]+\s+){0,3}experience/gi)].map((m) => +m[1]);
  const spans = [...text.matchAll(/(?:[A-Za-z]{3,9}\.?\s+)?((?:19|20)\d{2})\s*(?:-|–|—|to)\s*(?:[A-Za-z]{3,9}\.?\s+)?((?:19|20)\d{2}|present|current|till date|now)\b/gi)]
    .map((m) => [+m[1], /^\d/.test(m[2]) ? +m[2] : thisYear]).filter(([a, b]) => b >= a && b - a < 40).sort((x, y) => x[0] - y[0]);
  let total = 0, end = -1;
  for (const [a, b] of spans) { const s = Math.max(a, end); if (b > s) total += b - s; end = Math.max(end, b); }
  return Math.min(Math.max(total, ...explicit, 0), 40);
}
function education(text) {
  if (/\bPh\.?\s?D\b|\bDoctorate\b/.test(text)) return 'Doctorate (PhD)';
  if (/\b(M\.?\s?Tech|M\.?\s?Sc|MBA|MCA|M\.E\.|M\.Com|Master(?:'s|s)?)\b/.test(text)) return "Master's degree";
  if (/\b(B\.?\s?Tech|B\.E\.|B\.E\b|B\.?\s?Sc|BCA|B\.?\s?Com|B\.A\.|Bachelor(?:'s|s)?)\b/.test(text)) return "Bachelor's degree";
  if (/\bDiploma\b/i.test(text)) return 'Diploma';
  return null;
}
function aiSignals(text, words) {
  if (words < 120) return { level: 'Unknown', signals: ['Not enough text for a meaningful signal'] };
  const signals = []; let score = 0;
  const buzz = (text.match(BUZZ) || []).length, density = (buzz / words) * 100;
  if (density > 1.2) { score += 35; signals.push('Heavy use of generic buzzwords'); } else if (density > 0.6) { score += 18; signals.push('Some generic buzzwords'); }
  const lens = text.split(/[.!?]\s+/).map((s) => s.trim().split(/\s+/).length).filter((n) => n > 3);
  if (lens.length >= 8) { const m = lens.reduce((a, b) => a + b, 0) / lens.length, sd = Math.sqrt(lens.reduce((a, b) => a + (b - m) ** 2, 0) / lens.length); if (sd / m < 0.35) { score += 25; signals.push('Very uniform sentence length'); } }
  if (!/\d+\s?%|\$\s?\d|\b\d+\+?\s?(users|clients|projects|customers|members)/i.test(text) && words > 150) { score += 15; signals.push('No measurable achievements or numbers'); }
  return { level: score >= 55 ? 'High' : score >= 30 ? 'Medium' : 'Low', signals: signals.length ? signals : ['No notable patterns found'] };
}


const empty = (verdict, reasons, extra = {}) => ({
  verdict, valid: false, reasons, skills: [], experienceYears: 0, education: null, name: null, email: null, phone: null,
  ai: { level: 'Unknown', signals: [] }, words: 0, pages: null, text: '', analyzedAt: new Date().toISOString(), ...extra,
});
export { empty as invalidAnalysis };

export function analyzeText(raw, pages = null) {
  const text = String(raw || '').replace(/\u0000/g, '').replace(/[ \t]+/g, ' ');
  const words = (text.match(/[A-Za-z0-9#+.]{2,}/g) || []).length;
  if (words < 15) return empty('blank', ['No readable text – the file is blank or a scanned image'], { words, pages });

  const skills = SKILL_NAMES.filter((k) => SKILLS[k].test(text));
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || null;
  const phone = (text.match(/\+?\d[\d\s().-]{8,15}\d/g) || []).find((p) => { const d = p.replace(/\D/g, '').length; return d >= 10 && d <= 13 && !/(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}/.test(p); }) || null;
  const group = (h) => (/experience|employment/.test(h) ? 'exp' : /educat|academic/.test(h) ? 'edu' : /skill|competenc/.test(h) ? 'skills' : /project/.test(h) ? 'proj' : /summary|objective|profile/.test(h) ? 'sum' : 'cert');
  const headings = new Set([...text.matchAll(HEADING)].map((m) => group(m[1].toLowerCase())));
  const years = yearsOfExperience(text), edu = education(text);
  const name = text.split('\n').map((l) => l.trim()).find((l) => /^[A-Za-z][A-Za-z .'-]{2,40}$/.test(l) && l.split(/\s+/).length <= 4 && !HEADING_ONE.test(l)) || null;

  let pts = 0; const notes = [];
  email ? (pts += 2) : notes.push('No email address found');
  phone ? (pts += 1) : notes.push('No phone number found');
  pts += Math.min(headings.size, 4); if (headings.size < 2) notes.push('Missing resume sections (Experience / Education / Skills)');
  skills.length >= 3 ? (pts += 1) : notes.push('Very few recognisable skills');
  years > 0 ? (pts += 1) : notes.push('No work-experience dates found');
  edu ? (pts += 1) : notes.push('No education details found');
  if (words > 3500) { pts -= 2; notes.push('Document is very long for a resume'); }
  if (words < 60) { pts -= 2; notes.push('Too little content for a resume'); }

  const verdict = pts >= 7 ? 'valid' : pts >= 5 ? 'weak' : 'not_resume';
  return {
    verdict, valid: verdict !== 'not_resume',
    reasons: verdict === 'not_resume' ? ['This file does not look like a resume', ...notes] : notes,
    skills, experienceYears: years, education: edu, name, email, phone,
    ai: aiSignals(text, words), words, pages, text: text.slice(0, 30000), analyzedAt: new Date().toISOString(),
  };
}
