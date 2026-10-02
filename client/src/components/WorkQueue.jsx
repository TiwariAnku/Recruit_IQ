import { useState } from 'react';
import { ArrowRightLeft, Inbox } from 'lucide-react';
import { HRS } from '../data/mockData';
import { nm, ago } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import StatusBadge from './StatusBadge';
import { Btn, Sel, Section, Empty } from './ui';

export default function WorkQueue({ hr }) {
  const S = useS();
  const [pick, setPick] = useState([]), [to, setTo] = useState(HRS.find((h) => h != hr) || HRS[0]);
  const items = S.R.filter((r) => r.hr == hr && !['Selected', 'Rejected'].includes(r.st));
  const mv = () => { pick.forEach((id) => S.assign(id, to)); setPick([]); };
  return (
    <Section title={`Work queue — ${hr}`} sub={`${items.length} active item${items.length === 1 ? '' : 's'}`}>
      {items.map((r) => (
        <label key={r.id} className="flex cursor-pointer flex-wrap items-center justify-between gap-2 border-t border-cream-200 py-3 first:border-0 hover:bg-cream-50">
          <span className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-[#B98F72]" checked={pick.includes(r.id)} onChange={(e) => setPick(e.target.checked ? [...pick, r.id] : pick.filter((x) => x != r.id))} /><b className="text-ink">{nm(r)}</b><span className="text-ink-muted">{r.pos}</span></span>
          <span className="flex items-center gap-3"><StatusBadge v={r.st} /><span className="text-xs text-ink-muted">Updated {ago(r.up)}</span></span>
        </label>
      ))}
      {!items.length && <Empty Icon={Inbox} title="No active work" sub="Nothing is assigned right now." />}
      <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-xl bg-cream-50 p-3">
        <ArrowRightLeft size={16} className="text-nude-dark" /><span>Reassign selected to</span>
        <Sel value={to} onChange={(e) => setTo(e.target.value)}>{HRS.filter((h) => h != hr).map((h) => <option key={h}>{h}</option>)}</Sel>
        <Btn v="pr" disabled={!pick.length} onClick={mv}>Reassign ({pick.length})</Btn>
      </div>
    </Section>
  );
}
