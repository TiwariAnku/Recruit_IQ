import { Lock, CheckCircle2, CloudOff, Star } from 'lucide-react';
import { CRITERIA, REC_COLOR } from '../utils/feedbackStore';
import { Card, Tag } from './ui';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const RecPill = ({ v }) => <span className="inline-block whitespace-nowrap rounded-full px-[11px] py-[3px] text-xs font-semibold" style={{ background: REC_COLOR[v] + '1f', color: REC_COLOR[v] }}>{v}</span>;

export default function FeedbackDetail({ f, all, onSelect }) {
  const others = all.filter((x) => x.id !== f.id && (x.resumeId === f.resumeId || x.candidate === f.candidate));
  return (
    <div className="flex flex-col gap-4 pt-1">
      <div>
        <h3 className="font-display text-[26px] font-semibold text-ink">{f.candidate} {f.seed && <Tag>Sample</Tag>}</h3>
        <p className="mt-1 text-ink-muted">{f.position} · {f.round}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2"><RecPill v={f.recommendation} /><span className="inline-flex items-center gap-1 font-display text-xl font-semibold text-ink"><Star size={16} className="fill-[#C27A1E] text-[#C27A1E]" />{f.overall.toFixed(1)}<span className="font-sans text-xs font-normal text-ink-muted">/ 5</span></span></div>
      </div>
      <Card className="p-5">{CRITERIA.map(([k, l]) => (
        <div key={k} className="mb-3 last:mb-0"><div className="mb-1 flex justify-between"><span className="text-ink-body">{l}</span><b className="text-ink">{f.ratings[k]}/5</b></div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F3EADC]"><div className="h-full rounded-full bg-gradient-to-r from-nude-300 to-nude-dark" style={{ width: (f.ratings[k] / 5) * 100 + '%' }} /></div></div>))}
      </Card>
      <Card className="p-5"><b className="text-ink">Strengths</b><p className="mt-1 whitespace-pre-wrap text-ink-body">{f.strengths}</p>
        <b className="mt-4 block text-ink">Concerns / gaps</b><p className="mt-1 whitespace-pre-wrap text-ink-body">{f.concerns}</p>
        {f.notes && <><b className="mt-4 flex items-center gap-1.5 text-ink"><Lock size={14} className="text-nude-dark" /> Confidential HR notes</b><p className="mt-1 whitespace-pre-wrap rounded-lg bg-cream-50 p-3 text-ink-body">{f.notes}</p></>}</Card>
      <Card className="grid gap-2 p-5 text-[13px] text-ink-muted sm:grid-cols-2">
        <span>Interviewer: <b className="text-ink">{f.interviewer}</b></span><span>Mode: <b className="text-ink">{f.mode}</b></span>
        <span>Submitted by: <b className="text-ink">{f.submittedBy}</b></span><span>HR owner: <b className="text-ink">{f.hr}</b></span>
        <span>Next step: <b className="text-ink">{f.nextStep}</b></span><span>Submitted: <b className="text-ink">{fmt(f.submittedAt)}</b></span>
        <span className="inline-flex items-center gap-1.5 sm:col-span-2">{f.synced ? <><CheckCircle2 size={14} className="text-[#3F8F66]" /> Stored on the server</> : f.seed ? 'Sample record (browser only)' : <><CloudOff size={14} className="text-[#C27A1E]" /> Saved in this browser – will sync when the server is reachable</>}</span>
      </Card>
      {others.length > 0 && <Card className="p-5"><b className="text-ink">Other feedback for {f.candidate}</b>
        {others.map((o) => <button type="button" key={o.id} onClick={() => onSelect(o)} className="mt-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-cream-200 px-3 py-2 text-left hover:border-nude"><span><b className="text-ink">{o.round}</b> <span className="text-xs text-ink-muted">· {fmt(o.submittedAt)}</span></span><RecPill v={o.recommendation} /></button>)}</Card>}
    </div>
  );
}
