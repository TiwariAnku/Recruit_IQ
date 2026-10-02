import { useState } from 'react';
import { Search, FileSearch, Eye } from 'lucide-react';
import UploadButton from '../components/UploadButton';
import { HRS, ST, POS, COL } from '../data/mockData';
import { nm, ago } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import ResumeViewer from '../components/ResumeViewer';
import Drawer from '../components/Drawer';
import { Card, Btn, Sel, Inp, Tag, Avatar, Empty, TH, TD } from '../components/ui';

export default function ResumeManagement() {
  const S = useS();
  const [st, setSt] = useState(''), [hr, setHr] = useState(''), [ps, setPs] = useState(''), [ex, setEx] = useState('');
  const rows = S.R.filter((r) => (nm(r) + r.sk.join()).toLowerCase().includes(S.q.toLowerCase()) && (!st || r.st == st) && (!hr || r.hr == hr) && (!ps || r.pos == ps) && (!ex || r.exp >= +ex));
  const v = S.R.find((r) => r.id == S.sel);
  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <Card className="flex flex-wrap items-center gap-2.5 p-4">
        <div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" /><Inp className="w-full pl-9" placeholder="Search name or skill…" value={S.q} onChange={(e) => S.setQ(e.target.value)} /></div>
        <Sel value={ps} onChange={(e) => setPs(e.target.value)}><option value="">All positions</option>{POS.map((p) => <option key={p}>{p}</option>)}</Sel>
        <Sel value={st} onChange={(e) => setSt(e.target.value)}><option value="">All statuses</option>{ST.map((p) => <option key={p}>{p}</option>)}</Sel>
        <Sel value={hr} onChange={(e) => setHr(e.target.value)}><option value="">All HRs</option>{HRS.map((p) => <option key={p}>{p}</option>)}</Sel>
        <Sel value={ex} onChange={(e) => setEx(e.target.value)}><option value="">Any exp.</option><option value="3">3+ yrs</option><option value="5">5+ yrs</option></Sel>
        <UploadButton />
      </Card>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4"><b className="font-display text-xl text-ink">All resumes <span className="font-sans text-sm font-normal text-ink-muted">({rows.length})</span></b></div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-cream-50"><tr>{['Resume', 'Position', 'Exp', 'Skills', 'Owner', 'Uploaded', 'Status', 'Updated', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="transition hover:bg-cream-50">
                  <td className={TD}><button type="button" title="View resume" onClick={() => S.setSel(r.id)} className="flex cursor-pointer items-center gap-3 text-left"><Avatar size="h-9 w-9">{nm(r).split(' ').map((w) => w[0]).slice(0, 2).join('')}</Avatar><div><b className="block text-ink">{nm(r)}</b><span className="text-xs text-ink-muted">{r.file ? r.n : r.n + ' · demo'}</span></div></button></td>
                  <td className={TD}><Sel className="!py-1 text-xs" value={r.pos} onChange={(e) => S.setPos(r.id, e.target.value)}>{POS.map((p) => <option key={p}>{p}</option>)}</Sel></td><td className={TD}>{r.exp} yrs</td>
                  <td className={TD}>{r.sk.slice(0, 3).map((s) => <Tag key={s}>{s}</Tag>)}</td>
                  <td className={TD}><Sel className="!py-1 text-xs" value={r.hr} onChange={(e) => S.assign(r.id, e.target.value)}>{HRS.map((h) => <option key={h}>{h}</option>)}</Sel></td>
                  <td className={TD}>{new Date(r.dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className={TD}><Sel className="!py-1 text-xs font-semibold" style={{ color: COL[r.st] }} value={r.st} onChange={(e) => S.status(r.id, e.target.value)}>{ST.map((s) => <option key={s}>{s}</option>)}</Sel></td>
                  <td className={`${TD} text-ink-muted`}>{ago(r.up)}</td>
                  <td className={TD}><Btn sm onClick={() => S.setSel(r.id)}><Eye size={13} /> View</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty Icon={FileSearch} title="No resumes match" sub="Try clearing a filter or the search box." />}
      </Card>
      {v && <Drawer onClose={() => S.setSel(null)}><ResumeViewer r={v} /></Drawer>}
    </div>
  );
}
