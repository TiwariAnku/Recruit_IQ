import { useState } from 'react';
import { UserX, ClipboardCheck, ListChecks } from 'lucide-react';
import { HRS } from '../data/mockData';
import { nm, stat } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import StatusBadge from '../components/StatusBadge';
import WorkQueue from '../components/WorkQueue';
import { Btn, Sel, Card, Section } from '../components/ui';

export default function HRHandover() {
  const S = useS();
  const [h, setH] = useState('HR 01'), [abs, setAbs] = useState(false);
  const s = stat(S, h), its = S.R.filter((r) => r.hr == h), pri = S.acts.filter((a) => a.r?.hr == h);
  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Sel value={h} onChange={(e) => { setH(e.target.value); setAbs(false); }}>{HRS.map((x) => <option key={x}>{x}</option>)}</Sel>
        <Btn onClick={() => { setAbs(true); S.log('Marked unavailable', h); }}><UserX size={16} /> Simulate absence</Btn>
        {abs && <span className="flex items-center gap-2"><StatusBadge v="High" /><span className="text-ink-muted">{h} is unavailable – work below needs cover</span></span>}
      </Card>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {[['Screening', its.filter((r) => r.st == 'Screening').length], ['Shortlisted', its.filter((r) => r.st == 'Shortlisted').length], ['Interviews scheduled', s.iv], ['Feedback pending', s.fb]].map(([l, v]) => (
          <Card key={l} className="p-[18px]"><span className="text-[11px] font-medium uppercase tracking-[.09em] text-ink-muted">{l}</span><div className="font-display text-[40px] font-semibold leading-tight text-ink">{v}</div></Card>
        ))}
      </div>
      <Section title="Priority tasks to pick up" sub="Highest-impact items for whoever covers">
        {pri.map((a) => <div key={a.k} className="flex items-center justify-between border-t border-cream-200 py-3 first:border-0"><span className="flex items-center gap-2 text-ink"><ClipboardCheck size={16} className="text-nude-dark" />{a.t} — <b>{nm(a.r)}</b></span><StatusBadge v={a.g == 'Urgent' ? 'High' : 'Medium'} /></div>)}
        {!pri.length && <p className="flex items-center gap-2 py-3 text-ink-muted"><ListChecks size={16} /> No priority tasks.</p>}
      </Section>
      <WorkQueue hr={h} key={h} />
    </div>
  );
}
