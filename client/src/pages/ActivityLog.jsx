import { useState } from 'react';
import { Search, History } from 'lucide-react';
import { useS } from '../context/StoreContext';
import { Card, Sel, Inp, Empty } from '../components/ui';

export default function ActivityLog() {
  const S = useS();
  const [h, setH] = useState(''), [q, setQ] = useState('');
  const rows = S.L.filter((l) => (!h || l.who == h) && (l.what + l.ref).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <Card className="flex flex-wrap items-center gap-2.5 p-4">
        <Sel value={h} onChange={(e) => setH(e.target.value)}><option value="">All users</option>{[...new Set(S.L.map((l) => l.who))].map((x) => <option key={x}>{x}</option>)}</Sel>
        <div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" /><Inp className="w-full pl-9" placeholder="Filter action / resume…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </Card>
      <Card className="p-6">
        <ol className="ml-2 border-l border-[#dccfbd]">
          {rows.map((l, i) => (
            <li key={i} className="relative pb-6 pl-6 last:pb-0">
              <span className="absolute -left-[6px] top-1.5 h-[11px] w-[11px] rounded-full bg-nude ring-4 ring-nude/20" />
              <b className="text-ink">{l.what}</b> <span className="text-ink-muted">· {l.ref}</span>
              <div className="text-xs text-ink-muted">{l.who} · {new Date(l.t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </li>
          ))}
        </ol>
        {!rows.length && <Empty Icon={History} title="No activity found" sub="Try a different filter." />}
      </Card>
    </div>
  );
}
