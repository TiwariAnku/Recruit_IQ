import { Layers, Trophy, Zap, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { HRS, POS } from '../data/mockData';
import { stat, ago, go } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import { Section, TH, TD } from '../components/ui';

export default function ManagerOverview() {
  const S = useS(), { R } = S;
  const live = ['Shortlisted', 'Interview', 'Feedback Pending', 'Selected'];
  const attention = POS.filter((p) => !R.some((r) => r.pos == p && live.includes(r.st)));
  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <KpiCard l="Active Resumes" v={R.filter((r) => !['Selected', 'Rejected'].includes(r.st)).length} to="resumes" Icon={Layers} tint="#A8764F" />
        <KpiCard l="Selected" v={R.filter((r) => r.st == 'Selected').length} to="resumes" Icon={Trophy} tint="#3F8F66" />
        <KpiCard l="Pending Actions" v={S.acts.length} to="actions" Icon={Zap} tint="#C27A1E" />
        <KpiCard l="Interviews" v={S.I.filter((i) => i.st == 'Scheduled').length} to="interviews" Icon={CalendarDays} tint="#4A7BB0" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Progress by position" sub="Share of resumes at interview stage or beyond">
          {POS.map((p) => {
            const a = R.filter((r) => r.pos == p), d = a.filter((r) => ['Interview', 'Feedback Pending', 'Selected'].includes(r.st)).length, pct = a.length ? Math.round((d / a.length) * 100) : 0;
            return (<div key={p} className="mb-4 last:mb-0"><div className="mb-1.5 flex justify-between"><b className="text-ink">{p}</b><span className="text-ink-muted">{a.length} resumes · {pct}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#F3EADC]"><div className="h-full rounded-full bg-gradient-to-r from-nude-300 to-nude-dark transition-[width] duration-700" style={{ width: pct + '%' }} /></div></div>);
          })}
        </Section>
        <Section title="Needs attention" sub="Open positions with no candidate in progress">
          {attention.map((p) => <div key={p} className="flex items-center justify-between border-t border-cream-200 py-3 first:border-0"><span className="flex items-center gap-2 font-medium text-ink"><AlertTriangle size={16} className="text-[#C4513F]" />{p}</span><StatusBadge v="High" /></div>)}
          {!attention.length && <div className="flex items-center gap-2 py-4 text-ink-muted"><CheckCircle2 size={18} className="text-[#3F8F66]" /> All positions have candidates in progress.</div>}
        </Section>
        <Section title="HR workload" sub="Comparison only – no performance ranking">
          <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr>{['HR', 'Resumes', 'Interviews', 'Feedback'].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>{HRS.map((h) => { const s = stat(S, h); return <tr key={h} className="hover:bg-cream-50"><td className={`${TD} font-semibold text-ink`}>{h}</td><td className={TD}>{s.res}</td><td className={TD}>{s.iv}</td><td className={TD}>{s.fb}</td></tr>; })}</tbody></table></div>
        </Section>
        <Section title="Recent activity" to="log">
          {S.L.slice(0, 5).map((l, i) => <div key={i} className="flex items-center justify-between gap-3 border-t border-cream-200 py-2.5 first:border-0"><span className="text-ink">{l.what} <span className="text-ink-muted">· {l.ref}</span></span><span className="whitespace-nowrap text-xs text-ink-muted">{ago(l.t)}</span></div>)}
        </Section>
      </div>
    </div>
  );
}
