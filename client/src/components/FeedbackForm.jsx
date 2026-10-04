import { useEffect, useState } from 'react';
import { AlertTriangle, Lock, Save, Send } from 'lucide-react';
import { HRS } from '../data/mockData';
import { nm, dl } from '../utils/helpers';
import { CRITERIA, REC_COLOR, NEXT_STEPS, DEFAULT_NEXT, overallOf } from '../utils/feedbackStore';
import StatusBadge from './StatusBadge';
import Stars from './Stars';
import { Btn, Sel, Card, FIELD } from './ui';

const blank = (r) => ({ ratings: {}, strengths: '', concerns: '', notes: '', recommendation: '', nextStep: '', submittedBy: r.hr });

export default function FeedbackForm({ iv, r, onSubmit }) {
  const KEY = 'recruitiq.fbdraft.' + iv.id;
  const [f, setF] = useState(() => { try { return { ...blank(r), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return blank(r); } });
  const [tried, setTried] = useState(false);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(f)); } catch { /* ignore */ } }, [f]);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const rated = CRITERIA.filter(([k]) => f.ratings[k]).length, overall = rated === CRITERIA.length ? overallOf(f.ratings) : 0;
  const errs = [];
  if (rated < CRITERIA.length) errs.push('Rate all 5 criteria');
  if (!f.recommendation) errs.push('Choose a recommendation');
  if (f.strengths.trim().length < 15) errs.push('Describe strengths (at least 15 characters)');
  if (f.concerns.trim().length < 4) errs.push('Add concerns – write "None" if there are none');
  const mismatch = overall && ((f.recommendation === 'Strong Hire' && overall < 3.5) || (f.recommendation === 'Hire' && overall < 3) || (f.recommendation === 'No Hire' && overall >= 4));
  const submit = () => { setTried(true); if (errs.length) return; try { localStorage.removeItem(KEY); } catch { /* ignore */ } onSubmit({ ...f, nextStep: f.nextStep || DEFAULT_NEXT[f.recommendation] }); };
  const area = `${FIELD} w-full resize-y`;

  return (
    <div className="flex flex-col gap-4 pt-1">
      <div>
        <h3 className="font-display text-[26px] font-semibold text-ink">Interview feedback</h3>
        <p className="mt-1 text-ink-muted"><b className="text-ink">{nm(r)}</b> · {r.pos}</p>
        <p className="text-[13px] text-ink-muted">{iv.rd} · {iv.iv} · {dl(iv.d)} {iv.t} · {iv.mode}</p>
      </div>
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between"><b className="text-ink">Scorecard</b><span className="font-display text-2xl font-semibold text-ink">{overall ? overall.toFixed(1) : '–'}<span className="font-sans text-xs font-normal text-ink-muted"> / 5 overall</span></span></div>
        {CRITERIA.map(([k, l]) => (
          <div key={k} className="flex flex-wrap items-center justify-between gap-2 border-t border-cream-200 py-2.5 first:border-0">
            <span className="text-ink-body">{l}</span><Stars value={f.ratings[k] || 0} onChange={(n) => setF((x) => ({ ...x, ratings: { ...x.ratings, [k]: n } }))} />
          </div>
        ))}
      </Card>
      <Card className="flex flex-col gap-3 p-5">
        <label className="font-semibold text-ink">Strengths <span className="font-normal text-[#C4513F]">*</span>
          <textarea className={`${area} mt-1.5 font-normal`} rows={3} maxLength={2000} placeholder="What did the candidate do well? Give concrete examples." value={f.strengths} onChange={(e) => set({ strengths: e.target.value })} /></label>
        <label className="font-semibold text-ink">Concerns / gaps <span className="font-normal text-[#C4513F]">*</span>
          <textarea className={`${area} mt-1.5 font-normal`} rows={3} maxLength={2000} placeholder='Risks or skill gaps. Write "None" if there are none.' value={f.concerns} onChange={(e) => set({ concerns: e.target.value })} /></label>
        <label className="font-semibold text-ink"><span className="inline-flex items-center gap-1.5"><Lock size={14} className="text-nude-dark" /> Confidential HR notes</span> <span className="text-xs font-normal text-ink-muted">(optional – salary, notice period, internal remarks)</span>
          <textarea className={`${area} mt-1.5 font-normal`} rows={2} maxLength={2000} value={f.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
      </Card>
      <Card className="p-5">
        <b className="text-ink">Recommendation <span className="font-normal text-[#C4513F]">*</span></b>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(REC_COLOR).map(([rec, c]) => (
            <button type="button" key={rec} onClick={() => set({ recommendation: rec, nextStep: DEFAULT_NEXT[rec] })} className="cursor-pointer rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition" style={f.recommendation === rec ? { borderColor: c, background: c + '1a', color: c } : { borderColor: '#EBE2D5', color: '#8A7C6F' }}>{rec}</button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-ink-muted">Next step (updates candidate status)
            <Sel className="mt-1 w-full" value={f.nextStep || DEFAULT_NEXT[f.recommendation] || ''} onChange={(e) => set({ nextStep: e.target.value })}>{!f.recommendation && <option value="">Choose a recommendation first</option>}{Object.keys(NEXT_STEPS).map((n) => <option key={n}>{n}</option>)}</Sel></label>
          <label className="text-[13px] font-medium text-ink-muted">Submitted by
            <Sel className="mt-1 w-full" value={f.submittedBy} onChange={(e) => set({ submittedBy: e.target.value })}>{HRS.map((h) => <option key={h}>{h}</option>)}</Sel></label>
        </div>
        {f.nextStep && <p className="mt-3 text-xs text-ink-muted">Candidate status will become <StatusBadge v={NEXT_STEPS[f.nextStep]} /></p>}
      </Card>
      {mismatch && <div className="flex gap-2 rounded-lg border-l-[3px] border-[#C27A1E] bg-[#C27A1E]/10 p-3 text-xs text-[#6b4a1c]"><AlertTriangle size={16} className="mt-px flex-none" /> Your ratings and recommendation look inconsistent – please double-check before submitting.</div>}
      {tried && errs.length > 0 && <ul className="list-disc space-y-0.5 rounded-lg bg-[#C4513F]/10 py-3 pl-8 pr-3 text-xs text-[#C4513F]">{errs.map((e) => <li key={e}>{e}</li>)}</ul>}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted"><Save size={13} /> Draft saved automatically</span>
        <Btn v="pr" onClick={submit}><Send size={15} /> Submit feedback</Btn>
      </div>
      <p className="text-xs text-ink-muted">Submitted feedback is stored permanently in the feedback history and cannot be edited, so decisions stay auditable.</p>
    </div>
  );
}
