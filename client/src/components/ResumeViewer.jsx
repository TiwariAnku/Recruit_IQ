import { useState } from 'react';
import { Sparkles, FileText, ShieldAlert, ExternalLink, Download } from 'lucide-react';
import { abs } from '../utils/api';
import { REQ } from '../data/mockData';
import { nm, match } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import StatusBadge from './StatusBadge';
import { Btn, Tag, Seg, Card } from './ui';

function FilePreview({ r }) {
  const f = r.file;
  if (!f) return (
    <Card className="border-dashed p-5">
      <div className="mb-3 flex items-center gap-2 font-semibold text-ink"><FileText size={16} /> {r.n}</div>
      {[90, 70, 95, 60, 85, 75, 50].map((w, i) => <div key={i} className="my-2 h-2 rounded bg-cream-100" style={{ width: w + '%' }} />)}
      <span className="text-xs text-ink-muted">Demo record – no file attached. Upload a real CV to preview it here.</span>
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

export default function ResumeViewer({ r }) {
  const S = useS();
  const [tab, setTab] = useState('Resume');
  const m = match(r), C = 2 * Math.PI * 42, miss = REQ[r.pos].filter((s) => !r.sk.includes(s));
  return (
    <>
      <h3 className="font-display text-[26px] font-semibold text-ink">{nm(r)}</h3>
      <div className="mt-1 flex flex-wrap items-center gap-2"><StatusBadge v={r.st} /><span className="text-ink-muted">{r.pos} · {r.exp} yrs · {r.hr}</span></div>
      <div className="my-4"><Seg opts={['Resume', 'AI Analysis']} val={tab} set={setTab} /></div>
      {tab === 'Resume' ? (
        <FilePreview r={r} />
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="flex items-center gap-5 p-5">
            <div className="relative h-28 w-28 flex-none">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90"><circle cx="50" cy="50" r="42" fill="none" stroke="#F3EADC" strokeWidth="8" /><circle cx="50" cy="50" r="42" fill="none" stroke={m > 70 ? '#3F8F66' : '#C27A1E'} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - m / 100)} /></svg>
              <div className="absolute inset-0 grid place-items-center font-display text-3xl font-semibold text-ink">{m}%</div>
            </div>
            <div><div className="flex items-center gap-1.5 font-semibold text-ink"><Sparkles size={16} className="text-nude" /> Job Match</div><p className="mt-1 text-ink-muted"><b>Experience:</b> {r.exp} years<br /><b>Education:</b> B.Tech (suggested)</p></div>
          </Card>
          <Card className="p-5"><b className="text-ink">Matching skills</b><div className="mt-1">{REQ[r.pos].filter((s) => r.sk.includes(s)).map((s) => <Tag key={s}>{s}</Tag>)}</div>
            <b className="mt-3 block text-ink">Missing skills</b><div className="mt-1">{miss.length ? miss.map((s) => <Tag x key={s}>{s}</Tag>) : <span className="text-ink-muted">None</span>}</div></Card>
          <Card className="p-5"><b className="text-ink">AI Content Indicator:</b> <StatusBadge v={r.ai} />
            <div className="mt-3 flex gap-2 rounded-lg border-l-[3px] border-[#C27A1E] bg-[#C27A1E]/10 p-3 text-xs text-[#6b4a1c]"><ShieldAlert size={16} className="mt-px flex-none" /> Assistive signal only. It cannot confirm whether a resume was AI-generated; always use human judgement.</div></Card>
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <Btn v="pr" onClick={() => S.status(r.id, 'Shortlisted')}>Shortlist</Btn>
        <Btn onClick={() => S.status(r.id, 'Screening')}>Move to Screening</Btn>
        <Btn onClick={() => { const n = prompt('Add note'); n && S.log('Note: ' + n, nm(r)); }}>Add Note</Btn>
      </div>
    </>
  );
}
