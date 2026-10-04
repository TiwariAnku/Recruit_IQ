// Interview-feedback storage: saved on the server (server/data/feedback.json) AND mirrored in the browser,
// so the history is never lost – even if the server is offline when feedback is submitted.
import { API } from './api';

export const CRITERIA = [['technical', 'Technical skills'], ['problem', 'Problem solving'], ['communication', 'Communication'], ['culture', 'Culture fit'], ['experience', 'Relevant experience']];
export const LABELS = ['Poor', 'Below expectations', 'Meets expectations', 'Good', 'Excellent'];
export const REC_COLOR = { 'Strong Hire': '#3F8F66', Hire: '#4A7BB0', Hold: '#C27A1E', 'No Hire': '#C4513F' };
export const NEXT_STEPS = { 'Schedule next round': 'Shortlisted', 'Select candidate': 'Selected', 'Hold decision': 'Feedback Pending', 'Reject candidate': 'Rejected' };
export const DEFAULT_NEXT = { 'Strong Hire': 'Select candidate', Hire: 'Schedule next round', Hold: 'Hold decision', 'No Hire': 'Reject candidate' };
export const overallOf = (ratings) => { const v = CRITERIA.map(([k]) => ratings[k] || 0); return +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1); };

const KEY = 'recruitiq.feedback.v1';
const ago = (d) => new Date(Date.now() - d * 864e5).toISOString();
const seed = (id, resumeId, candidate, position, round, interviewer, hr, days, ratings, recommendation, nextStep, strengths, concerns) => ({
  id, interviewId: 'h-' + id, resumeId, candidate, position, round, interviewer, mode: 'Video', hr, submittedBy: hr, submittedAt: ago(days),
  ratings, overall: overallOf(ratings), recommendation, nextStep, strengths, concerns, notes: '', synced: false, seed: true,
});
const SEED = [
  seed('s1', 8, 'Anita Das', 'Data Analyst', 'Technical R1', 'Neha S.', 'HR 02', 9, { technical: 4, problem: 5, communication: 4, culture: 4, experience: 4 }, 'Strong Hire', 'Select candidate', 'Excellent SQL and Power BI case walk-through; structured and clear communicator.', 'Limited hands-on exposure to Python automation.'),
  seed('s2', 8, 'Anita Das', 'Data Analyst', 'HR Round', 'Dev P.', 'HR 02', 7, { technical: 4, problem: 4, communication: 5, culture: 5, experience: 4 }, 'Hire', 'Schedule next round', 'Strong culture fit, motivated, realistic salary expectations.', 'None.'),
  seed('s3', 9, 'Rohit Verma', 'QA Engineer', 'Technical R1', 'Amit K.', 'HR 02', 5, { technical: 2, problem: 2, communication: 3, culture: 3, experience: 1 }, 'No Hire', 'Reject candidate', 'Polite and punctual.', 'Could not explain test design basics; no automation experience for a role that requires it.'),
  seed('s4', 2, 'Sneha Iyer', 'QA Engineer', 'Technical R1', 'Neha S.', 'HR 02', 3, { technical: 3, problem: 4, communication: 3, culture: 4, experience: 3 }, 'Hold', 'Hold decision', 'Good API testing knowledge and eager to learn.', 'Selenium experience is thin – compare with other QA candidates first.'),
];

export const loadFeedback = () => { try { const l = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(l)) return l; } catch { /* ignore */ } return SEED; };
export const saveFeedback = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };

const post = (rec) => fetch(API + '/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) });
export async function pushFeedback(rec) { try { return (await post(rec)).ok; } catch { return false; } }

// On start: send anything not yet on the server, then merge the server copy with the local copy.
export async function syncFeedback(local) {
  try {
    const r = await fetch(API + '/api/feedback');
    if (!r.ok) return null;
    const server = (await r.json()).feedback, have = new Set(server.map((s) => s.id)), byId = new Map(local.map((l) => [l.id, l]));
    for (const rec of local) if (!rec.seed && !have.has(rec.id) && (await pushFeedback(rec))) byId.set(rec.id, { ...rec, synced: true });
    for (const s of server) byId.set(s.id, { ...s, synced: true });
    return [...byId.values()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  } catch { return null; }
}

export function exportCsv(list) {
  const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const head = ['Date', 'Candidate', 'Position', 'Round', 'Interviewer', 'Submitted by', 'Overall', ...CRITERIA.map((c) => c[1]), 'Recommendation', 'Next step', 'Strengths', 'Concerns', 'Confidential notes'];
  const rows = list.map((f) => [new Date(f.submittedAt).toLocaleString('en-IN'), f.candidate, f.position, f.round, f.interviewer, f.submittedBy, f.overall, ...CRITERIA.map(([k]) => f.ratings[k]), f.recommendation, f.nextStep, f.strengths, f.concerns, f.notes]);
  const blob = new Blob(['\ufeff' + [head, ...rows].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'recruitiq-feedback-history.csv'; a.click(); URL.revokeObjectURL(a.href);
}
