import { useEffect, useState } from 'react';
import { ClipboardCheck, Download, Search, Star, History, Inbox, Eye, Trash2 } from 'lucide-react';
import { HRS } from '../data/mockData';
import { nm, dl } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import { REC_COLOR, exportCsv } from '../utils/feedbackStore';
import Drawer from '../components/Drawer';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackDetail, { RecPill } from '../components/FeedbackDetail';
import { Card, Btn, Sel, Inp, Seg, Tag, Empty, TH, TD } from '../components/ui';

const date = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function FeedbackCenter() {
  const S = useS();
  const [tab, setTab] = useState('Pending'), [form, setForm] = useState(null), [view, setView] = useState(null);
  const [q, setQ] = useState(''), [pos, setPos] = useState(''), [rec, setRec] = useState(''), [by, setBy] = useState('');

  useEffect(() => { if (S.fbView) { const f = S.FB.find((x) => x.id === S.fbView); if (f) { setTab('History'); setView(f); } S.setFbView(null); } }, [S.fbView]);
  useEffect(() => { if (S.fbTarget) { setForm(S.fbTarget); S.setFbTarget(null); } }, [S.fbTarget]);

  const pending = S.I.filter((i) => i.st == 'Completed' && i.fb == 'Pending');
  const fbs = S.FB, avg = fbs.length ? fbs.reduce((a, f) => a + f.overall, 0) / fbs.length : 0;
  const hireRate = fbs.length ? Math.round((fbs.filter((f) => /Hire/.test(f.recommendation) && f.recommendation != 'No Hire').length / fbs.length) * 100) : 0;
  const rows = fbs.filter((f) => (f.candidate + f.interviewer + f.strengths + f.concerns + f.round).toLowerCase().includes(q.toLowerCase()) && (!pos || f.position == pos) && (!rec || f.recommendation == rec) && (!by || f.submittedBy == by));
  const fIv = form && S.I.find((i) => i.id == form), fR = fIv && S.R.find((r) => r.id == fIv.rid);

  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
        {[['Pending feedback', pending.length, '#C4513F'], ['Feedback on record', fbs.length, '#A8764F'], ['Average rating', avg ? avg.toFixed(1) + ' / 5' : '–', '#C27A1E'], ['Positive recommendations', hireRate + '%', '#3F8F66']].map(([l, v, c]) => (
          <Card key={l} className="p-[18px]"><span className="text-[11px] font-medium uppercase tracking-[.09em] text-ink-muted">{l}</span><div className="font-display text-[38px] font-semibold leading-tight" style={{ color: c }}>{v}</div></Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Seg opts={['Pending', 'History']} val={tab} set={setTab} />
        {tab == 'History' && <div className="flex gap-2">
          {fbs.some((f) => f.seed) && <Btn onClick={() => confirm('Remove the sample feedback records?') && S.clearSamples()}><Trash2 size={15} /> Clear sample data</Btn>}
          <Btn onClick={() => exportCsv(rows)} disabled={!rows.length}><Download size={15} /> Export CSV</Btn></div>}
      </div>

      {tab == 'Pending' ? (
        <Card className="px-6 py-2">
          {pending.map((i) => { const r = S.R.find((x) => x.id == i.rid); return (
            <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 py-4 first:border-0">
              <div><b className="text-ink">{S.rn(i.rid)}</b> <span className="text-ink-muted">· {r?.pos}</span>
                <div className="text-[13px] text-ink-muted">{i.rd} · Interviewer {i.iv} · HR owner {r?.hr} · {dl(i.d)} {i.t}</div></div>
              <div className="flex items-center gap-2">{i.d < 0 && <span className="rounded-full bg-[#C4513F]/10 px-2.5 py-0.5 text-xs font-semibold text-[#C4513F]">Overdue</span>}
                <Btn v="pr" onClick={() => setForm(i.id)}><ClipboardCheck size={15} /> Give feedback</Btn></div>
            </div>); })}
          {!pending.length && <Empty Icon={Inbox} title="No pending feedback" sub="Completed interviews that still need feedback appear here." />}
        </Card>
      ) : (
        <>
          <Card className="flex flex-wrap items-center gap-2.5 p-4">
            <div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" /><Inp className="w-full pl-9" placeholder="Search candidate, interviewer, comments…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <Sel value={pos} onChange={(e) => setPos(e.target.value)}><option value="">All positions</option>{[...new Set([...S.P.map((p) => p.title), ...fbs.map((f) => f.position)])].map((p) => <option key={p}>{p}</option>)}</Sel>
            <Sel value={rec} onChange={(e) => setRec(e.target.value)}><option value="">All recommendations</option>{Object.keys(REC_COLOR).map((p) => <option key={p}>{p}</option>)}</Sel>
            <Sel value={by} onChange={(e) => setBy(e.target.value)}><option value="">Any HR</option>{HRS.map((p) => <option key={p}>{p}</option>)}</Sel>
          </Card>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
              <thead className="bg-cream-50"><tr>{['Candidate', 'Position', 'Round', 'Interviewer', 'Rating', 'Recommendation', 'Submitted by', 'Date', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
              <tbody>{rows.map((f) => (
                <tr key={f.id} className="cursor-pointer transition hover:bg-cream-50" onClick={() => setView(f)}>
                  <td className={TD}><b className="text-ink">{f.candidate}</b> {f.seed && <Tag>Sample</Tag>}</td><td className={TD}>{f.position}</td><td className={TD}>{f.round}</td><td className={TD}>{f.interviewer}</td>
                  <td className={TD}><span className="inline-flex items-center gap-1 font-semibold text-ink"><Star size={14} className="fill-[#C27A1E] text-[#C27A1E]" />{f.overall.toFixed(1)}</span></td>
                  <td className={TD}><RecPill v={f.recommendation} /></td><td className={TD}>{f.submittedBy}</td><td className={`${TD} text-ink-muted`}>{date(f.submittedAt)}</td>
                  <td className={TD}><Btn sm onClick={(e) => { e.stopPropagation(); setView(f); }}><Eye size={13} /> View</Btn></td>
                </tr>))}</tbody></table></div>
            {!rows.length && <Empty Icon={History} title="No feedback found" sub={fbs.length ? 'Try clearing a filter.' : 'Submitted feedback is saved here for future reference.'} />}
          </Card>
        </>
      )}

      {fIv && fR && <Drawer onClose={() => setForm(null)}><FeedbackForm iv={fIv} r={fR} onSubmit={(d) => { S.submitFeedback(fIv.id, d); setForm(null); setTab('History'); }} /></Drawer>}
      {view && <Drawer onClose={() => setView(null)}><FeedbackDetail f={view} all={fbs} onSelect={setView} /></Drawer>}
    </div>
  );
}
