import { useState } from 'react';
import { Sparkles, FileText, ShieldAlert, ExternalLink, Download, FileWarning, Mail, Phone, GraduationCap, Briefcase, User, ScanText, CheckCircle2, XCircle, MessageSquareText, ClipboardCheck, ArrowRightLeft } from 'lucide-react';
import { abs } from '../utils/api';
import { nm, ago, dl } from '../utils/helpers';
import { evaluate, bestFit } from '../utils/evaluate';
import { useS } from '../context/StoreContext';
import StatusBadge from './StatusBadge';
import { RecPill } from './FeedbackDetail';
import { Btn, Tag, Seg, Card } from './ui';

function FilePreview({ r }) {
  const f = r.file;
  if (!f) return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-2"><span className="flex items-center gap-2 font-semibold text-ink"><FileText size={16} /> {r.n}</span><Tag>Demo resume</Tag></div>
      <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink-body">{r.text}</pre>
    </Card>
  );
  const url = abs(f.url), pdf = f.mime === 'application/pdf' || /\.pdf$/i.test(f.name), img = f.mime?.startsWith('image/') || /\.(png|jpe?g)$/i.test(f.name);
  const lk = 'inline-flex items-center gap-1 rounded-[10px] border border-cream-200 bg-white px-2.5 py-[3px] text-xs font-medium text-ink-body hover:border-nude hover:text-nude-dark';
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-cream-200 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 font-semibold text-ink"><FileText size={16} className="flex-none" /><span className="truncate">{f.name}</span></span>
        <span className="flex flex-none gap-2"><a className={lk} href={url} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Open</a><a className={lk} href={url} download={f.name}><Download size={13} /> Download</a></span>
      </div>
      {pdf ? <iframe title={f.name} src={url} className="h-[540px] w-full" /> : img ? <img src={url} alt={f.name} className="max-h-[540px] w-full object-contain" /> : <p className="px-5 py-10 text-center text-ink-muted">Word files can't be previewed in the browser – use Open or Download.</p>}
      {f.local && <p className="border-t border-cream-200 bg-cream-50 px-4 py-2 text-xs text-ink-muted">Session-only copy (server not running).</p>}
    </Card>
  );
}

const TITLE = { blank: 'Blank or unreadable file', unreadable: 'This file could not be read', not_resume: 'This does not look like a resume' };
const LEVEL = { 'Strong match': '#3F8F66', 'Partial match': '#C27A1E', 'Weak match': '#C4513F' };

function Ring({ m, c }) {
  const C = 2 * Math.PI * 42;
  return (
    <div className="relative h-28 w-28 flex-none">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90"><circle cx="50" cy="50" r="42" fill="none" stroke="#F3EADC" strokeWidth="8" /><circle cx="50" cy="50" r="42" fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - m / 100)} /></svg>
      <div className="absolute inset-0 grid place-items-center font-display text-3xl font-semibold text-ink">{m}%</div>
    </div>
  );
}
const Bar = ({ label, text, pct }) => (
  <div><div className="mb-1 flex justify-between text-[13px]"><span className="text-ink-muted">{label}</span><b className="text-ink">{text}</b></div>
    <div className="h-2 overflow-hidden rounded-full bg-[#F3EADC]"><div className="h-full rounded-full bg-gradient-to-r from-nude-300 to-nude-dark" style={{ width: Math.round(pct * 100) + '%' }} /></div></div>
);
const Req = ({ x }) => (
  <div className="flex items-start gap-2.5 border-t border-cream-200 py-2.5 first:border-0">
    {x.found ? <CheckCircle2 size={17} className="mt-0.5 flex-none text-[#3F8F66]" /> : <XCircle size={17} className="mt-0.5 flex-none text-[#C4513F]" />}
    <div className="min-w-0"><b className="text-ink">{x.skill}</b>
      <div className={`text-xs ${x.found ? 'text-ink-muted' : 'text-[#C4513F]'}`}>{x.found ? (x.evidence || 'Found in the resume') : 'Not mentioned anywhere in the resume'}</div></div>
  </div>
);
const Disclaimer = () => <div className="mt-3 flex gap-2 rounded-lg border-l-[3px] border-[#C27A1E] bg-[#C27A1E]/10 p-3 text-xs text-[#6b4a1c]"><ShieldAlert size={16} className="mt-px flex-none" /> Assistive signal only. It cannot confirm whether a resume was AI-generated; always use human judgement.</div>;

function Analysis({ r }) {
  const S = useS(), a = r.analysis, pos = S.P.find((p) => p.title === r.pos);
  if (!a) return (
    <Card className="flex gap-3 p-5 text-ink-muted"><ScanText size={20} className="flex-none text-nude" />
      <span><b className="block text-ink">{S.busy ? 'Reading this resume…' : 'Not analysed yet'}</b>{S.busy || 'Reads the text inside the file – PDF, DOCX, and images (PNG/JPG via OCR) are supported.'}
        {!S.busy && <Btn sm v="pr" className="mt-3" onClick={() => S.analyzeResume(r.id)}><Sparkles size={13} /> Analyse now</Btn>}</span></Card>
  );
  if (!a.valid) return (
    <Card className="border-[#C4513F]/40 p-5">
      <div className="flex items-center gap-2 font-semibold text-[#C4513F]"><FileWarning size={18} /> {TITLE[a.verdict] || 'Invalid file'}</div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-body">{a.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
      <p className="mt-3 text-xs text-ink-muted">{a.words} readable words{a.pages ? ` · ${a.pages} page${a.pages > 1 ? 's' : ''}` : ''}. Shortlisting is disabled for this file.</p>
    </Card>);
  if (!pos) return <Card className="p-5 text-ink-muted"><b className="block text-ink">Position not found</b>“{r.pos}” is no longer in Open Positions. Assign this resume to another position to see the match.</Card>;
  const e = evaluate(a, pos), c = LEVEL[e.level], best = bestFit(a, S.P.filter((p) => p.status === 'Open'));
  const known = new Set([...pos.must, ...pos.nice]), extra = a.skills.filter((k) => !known.has(k));
  const info = [[User, 'Name', a.name], [Mail, 'Email', a.email], [Phone, 'Phone', a.phone], [Briefcase, 'Experience', a.experienceYears ? a.experienceYears + ' years' : null], [GraduationCap, 'Education', a.education]];
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex items-center gap-5"><Ring m={e.score} c={c} />
          <div><div className="flex items-center gap-1.5 font-semibold text-ink"><Sparkles size={16} className="text-nude" /> Job Match · {pos.title}</div>
            <span className="mt-1 inline-block rounded-full px-[11px] py-[3px] text-xs font-semibold" style={{ background: c + '1f', color: c }}>{e.level}</span></div></div>
        <p className="mt-3 text-ink-body">{e.summary}</p>
        <div className="mt-4 grid gap-3">
          <Bar label="Required skills" text={`${e.mf} / ${e.must.length}`} pct={e.mustPct} />
          {e.nicePct != null && <Bar label="Preferred skills" text={`${e.nf} / ${e.nice.length}`} pct={e.nicePct} />}
          <Bar label={`Experience (needs ${e.min}–${e.max || '+'} yrs)`} text={`${e.yrs} yrs`} pct={e.expFit} />
        </div>
        {best && best.pos.id !== pos.id && best.score >= e.score + 15 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream-50 p-3 text-[13px]"><span>Better fit by content: <b className="text-ink">{best.pos.title}</b> ({best.score}%)</span>
            <Btn sm onClick={() => S.setPos(r.id, best.pos.title)}><ArrowRightLeft size={13} /> Switch position</Btn></div>)}
      </Card>
      <Card className="p-5"><b className="text-ink">Required skills</b><div className="mt-1">{e.must.map((x) => <Req key={x.skill} x={x} />)}</div>
        {e.nice.length > 0 && <><b className="mt-4 block text-ink">Preferred skills</b><div className="mt-1">{e.nice.map((x) => <Req key={x.skill} x={x} />)}</div></>}</Card>
      <Card className="grid gap-3 p-5 sm:grid-cols-2">{info.map(([I, l, v]) => <div key={l} className="flex items-start gap-2.5"><I size={16} className="mt-0.5 flex-none text-nude-dark" /><div className="min-w-0"><div className="text-[11px] uppercase tracking-wider text-ink-muted">{l}</div><div className={`truncate ${v ? 'text-ink' : 'text-ink-muted'}`}>{v || 'Not found'}</div></div></div>)}
        <p className="text-xs text-ink-muted sm:col-span-2">Experience fit: {e.expNote}.</p>
        {a.source === 'ocr' && <p className="rounded-lg bg-[#C27A1E]/10 p-2.5 text-xs text-[#6b4a1c] sm:col-span-2">This resume is an image / scanned file, so its text was read with OCR{a.confidence ? ` (confidence ${a.confidence}%)` : ''}. Double-check names and numbers against the original.</p>}</Card>
      {extra.length > 0 && <Card className="p-5"><b className="text-ink">Other skills found</b><div className="mt-1">{extra.map((k) => <span key={k} className="m-0.5 inline-block rounded-lg bg-cream-100 px-2.5 py-0.5 text-xs text-ink-body">{k}</span>)}</div></Card>}
      {a.reasons.length > 0 && <Card className="p-5"><b className="text-ink">Document notes</b><ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">{a.reasons.map((x) => <li key={x}>{x}</li>)}</ul></Card>}
      <Card className="p-5"><b className="text-ink">AI Content Indicator:</b> <StatusBadge v={a.ai.level} /><ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">{a.ai.signals.map((x) => <li key={x}>{x}</li>)}</ul><Disclaimer /></Card>
    </div>
  );
}

function FeedbackTab({ r }) {
  const S = useS();
  const list = S.FB.filter((f) => String(f.resumeId) === String(r.id)), avg = list.length ? list.reduce((a, f) => a + f.overall, 0) / list.length : 0;
  const ivs = S.I.filter((i) => i.rid == r.id && i.st !== 'Cancelled');
  const open = (fn) => () => { S.setSel(null); fn(); };
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center justify-between gap-3 p-5"><div><b className="text-ink">Interview feedback</b><p className="text-[13px] text-ink-muted">{list.length ? `${list.length} record${list.length > 1 ? 's' : ''} · average ${avg.toFixed(1)} / 5` : 'No feedback recorded yet'}</p></div>
        {list.length > 0 && <span className="font-display text-3xl font-semibold text-ink">{avg.toFixed(1)}</span>}</Card>
      {ivs.length > 0 && <Card className="p-5"><b className="text-ink">Interviews</b>
        {ivs.map((i) => { const fb = S.FB.find((f) => f.interviewId === i.id); return (
          <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-cream-200 py-2.5 first:border-0"><span><b className="text-ink">{i.rd}</b> <span className="text-xs text-ink-muted">· {i.iv} · {dl(i.d)} {i.t}</span></span>
            <span className="flex items-center gap-2"><StatusBadge v={i.st} />
              {i.st === 'Completed' && i.fb === 'Pending' && <Btn sm v="pr" onClick={open(() => S.openFeedback(i.id))}><ClipboardCheck size={13} /> Give feedback</Btn>}
              {fb && <Btn sm onClick={open(() => S.viewFeedback(fb.id))}>View feedback</Btn>}</span></div>); })}</Card>}
      {list.map((f) => (
        <button type="button" key={f.id} onClick={open(() => S.viewFeedback(f.id))} className="cursor-pointer rounded-2xl border border-cream-200 bg-white p-4 text-left shadow-card transition hover:border-nude">
          <div className="flex items-center justify-between gap-2"><b className="text-ink">{f.round}</b><RecPill v={f.recommendation} /></div>
          <p className="mt-1 line-clamp-2 text-[13px] text-ink-muted">{f.strengths}</p>
          <p className="mt-2 text-xs text-ink-muted">★ {f.overall.toFixed(1)} · {f.submittedBy} · {ago(new Date(f.submittedAt).getTime())}</p></button>))}
      {!list.length && !ivs.length && <Card className="flex gap-3 p-5 text-ink-muted"><MessageSquareText size={20} className="flex-none text-nude" /><span>Schedule an interview for this candidate. Feedback from every round will appear here.</span></Card>}
    </div>
  );
}

export default function ResumeViewer({ r }) {
  const S = useS();
  const [tab, setTab] = useState('Resume');
  const bad = r.analysis && !r.analysis.valid;
  return (
    <>
      <h3 className="font-display text-[26px] font-semibold text-ink">{nm(r)}</h3>
      <div className="mt-1 flex flex-wrap items-center gap-2"><StatusBadge v={r.st} /><span className="text-ink-muted">{r.pos} · {r.exp} yrs · {r.hr}</span></div>
      <div className="my-4"><Seg opts={['Resume', 'AI Analysis', 'Feedback']} val={tab} set={setTab} /></div>
      {tab === 'Resume' ? <FilePreview r={r} /> : tab === 'AI Analysis' ? <Analysis r={r} /> : <FeedbackTab r={r} />}
      <div className="mt-5 flex flex-wrap gap-2">
        <Btn v="pr" disabled={bad} title={bad ? 'Not a valid resume' : ''} onClick={() => S.status(r.id, 'Shortlisted')}>Shortlist</Btn>
        <Btn disabled={bad} onClick={() => S.status(r.id, 'Screening')}>Move to Screening</Btn>
        {bad && <Btn onClick={() => S.status(r.id, 'Rejected')}>Reject file</Btn>}
        <Btn onClick={() => { const n = prompt('Add note'); n && S.log('Note: ' + n, nm(r)); }}>Add Note</Btn>
      </div>
    </>
  );
}
