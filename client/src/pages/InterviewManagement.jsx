import { useState } from 'react';
import { CalendarPlus, CalendarX2 } from 'lucide-react';
import { dl, nm } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import StatusBadge from '../components/StatusBadge';
import { Btn, Sel, Inp, Seg, Section, Card, Empty } from '../components/ui';

export default function InterviewManagement() {
  const S = useS();
  const [view, setView] = useState('List'), [f, setF] = useState({ rid: '', rd: 'Technical R1', d: 1, t: '11:00', mode: 'Video' });
  const elig = S.R.filter((r) => ['Screening', 'Shortlisted'].includes(r.st));
  const days = [...new Set(S.I.map((i) => i.d))].sort((a, b) => a - b);
  const row = (i) => {
    const r = S.R.find((x) => x.id == i.rid);
    return (
      <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 py-3.5 first:border-0">
        <div className="flex items-center gap-3.5">
          <div className="min-w-[78px] rounded-xl bg-cream-100 px-2 py-2 text-center"><div className="text-[10px] uppercase tracking-wider text-ink-muted">{dl(i.d)}</div><div className="font-display text-xl font-semibold text-ink">{i.t}</div></div>
          <div><b className="text-ink">{S.rn(i.rid)}</b> <span className="text-ink-muted">· {r?.pos}</span><div className="text-[13px] text-ink-muted">{i.rd} · {i.iv} · {r?.hr} · {i.mode}</div></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge v={i.st} /><StatusBadge v={i.fb} />
          {i.st == 'Completed' && (i.fb == 'Pending' ? <Btn sm v="pr" onClick={() => S.openFeedback(i.id)}>Give feedback</Btn> : S.FB.some((f) => f.interviewId === i.id) && <Btn sm onClick={() => S.viewFeedback(S.FB.find((f) => f.interviewId === i.id).id)}>View feedback</Btn>)}
          {i.st == 'Scheduled' && <><Btn sm onClick={() => S.resched(i.id)}>Reschedule</Btn><Btn sm onClick={() => S.cancel(i.id)}>Cancel</Btn><Btn sm v="pr" onClick={() => S.complete(i.id)}>Mark Completed</Btn></>}
        </div>
      </div>
    );
  };
  const list = [...S.I].sort((a, b) => a.d - b.d);
  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <Section title="Schedule interview" sub="Pick a screened or shortlisted resume">
        <div className="flex flex-wrap items-center gap-2.5">
          <Sel value={f.rid} onChange={(e) => setF({ ...f, rid: e.target.value })}><option value="">Select resume…</option>{elig.map((r) => <option key={r.id} value={r.id}>{nm(r)}</option>)}</Sel>
          <Sel value={f.rd} onChange={(e) => setF({ ...f, rd: e.target.value })}>{['Technical R1', 'Technical R2', 'HR Round'].map((x) => <option key={x}>{x}</option>)}</Sel>
          <Sel value={f.d} onChange={(e) => setF({ ...f, d: +e.target.value })}>{[0, 1, 2, 3].map((d) => <option key={d} value={d}>{dl(d)}</option>)}</Sel>
          <Inp type="time" value={f.t} onChange={(e) => setF({ ...f, t: e.target.value })} />
          <Sel value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}><option>Video</option><option>Onsite</option></Sel>
          <Btn v="pr" disabled={!f.rid} onClick={() => { S.sched(+f.rid, f.rd, f.d, f.t, f.mode); setF({ ...f, rid: '' }); }}><CalendarPlus size={16} /> Schedule</Btn>
        </div>
      </Section>
      <Seg opts={['List', 'Calendar']} val={view} set={setView} />
      {!S.I.length && <Card><Empty Icon={CalendarX2} title="No interviews yet" sub="Schedule one above." /></Card>}
      {view == 'List' ? (S.I.length > 0 && <Card className="px-6 py-2">{list.map(row)}</Card>) : (
        <div className="grid gap-5 md:grid-cols-2">{days.map((d) => <Section key={d} title={dl(d)}>{S.I.filter((i) => i.d == d).map(row)}</Section>)}</div>
      )}
    </div>
  );
}
