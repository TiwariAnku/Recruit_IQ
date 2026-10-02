import { useState } from 'react';
import { HRS } from '../data/mockData';
import { stat } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import WorkQueue from '../components/WorkQueue';
import { Card, Btn, Sel, Avatar } from '../components/ui';

export default function HRWorkspace() {
  const S = useS();
  const [h, setH] = useState('');
  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <div><Sel value={h} onChange={(e) => setH(e.target.value)}><option value="">All HRs</option>{HRS.map((x) => <option key={x}>{x}</option>)}</Sel></div>
      <div className="grid gap-5 md:grid-cols-2">
        {HRS.filter((x) => !h || x == h).map((x) => {
          const s = stat(S, x);
          return (
            <Card key={x} className="p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><Avatar>{x.slice(-2)}</Avatar><b className="font-display text-xl text-ink">{x}</b></div><Btn sm onClick={() => setH(x)}>Open Work Queue</Btn></div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[['Positions', s.pos], ['Resumes', s.res], ['Interviews', s.iv], ['Feedback', s.fb]].map(([l, v]) => <div key={l} className="rounded-xl bg-cream-50 py-3"><b className="block font-display text-3xl font-semibold text-ink">{v}</b><span className="text-xs text-ink-muted">{l}</span></div>)}
              </div>
            </Card>
          );
        })}
      </div>
      {h && <WorkQueue hr={h} />}
    </div>
  );
}
