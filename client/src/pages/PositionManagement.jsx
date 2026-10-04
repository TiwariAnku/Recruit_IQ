import { useState } from 'react';
import { Plus, Search, Pencil, PauseCircle, PlayCircle, XCircle, Trash2, Users, MapPin, Briefcase, Layers } from 'lucide-react';
import { go } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import { POS_COLOR } from '../utils/positionStore';
import Drawer from '../components/Drawer';
import PositionForm from '../components/PositionForm';
import { Card, Btn, Inp, Seg, Tag, Empty } from '../components/ui';

const Pill = ({ v }) => <span className="inline-block whitespace-nowrap rounded-full px-[11px] py-[3px] text-xs font-semibold" style={{ background: POS_COLOR[v] + '1f', color: POS_COLOR[v] }}>{v}</span>;

export default function PositionManagement() {
  const S = useS();
  const [form, setForm] = useState(null), [q, setQ] = useState(''), [tab, setTab] = useState('All');
  const stats = (p) => {
    const rs = S.R.filter((r) => r.pos === p.title), ids = new Set(rs.map((r) => r.id));
    return { res: rs.length, short: rs.filter((r) => r.st === 'Shortlisted').length, iv: S.I.filter((i) => ids.has(i.rid) && i.st === 'Scheduled').length, sel: rs.filter((r) => r.st === 'Selected').length };
  };
  const list = S.P.filter((p) => (tab === 'All' || p.status === tab) && (p.title + p.dept + p.location + p.must.join()).toLowerCase().includes(q.toLowerCase()));
  const open = S.P.filter((p) => p.status === 'Open');
  const totalOpenings = open.reduce((a, p) => a + p.openings, 0), filled = S.R.filter((r) => r.st === 'Selected' && open.some((p) => p.title === r.pos)).length;
  const del = (p) => { if (confirm(`Delete "${p.title}"?`) && !S.removePosition(p.id)) S.flash(`Cannot delete – resumes are linked to "${p.title}". Close the position instead.`, 'err'); };

  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
        {[['Open positions', open.length, '#4A7BB0', Briefcase], ['Total openings', totalOpenings, '#A8764F', Layers], ['Filled', filled, '#3F8F66', Users], ['On hold / closed', S.P.length - open.length, '#8A7C6F', PauseCircle]].map(([l, v, c, I]) => (
          <Card key={l} className="flex items-center gap-4 p-[18px]"><span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: c + '24', color: c }}><I size={20} /></span>
            <div><span className="text-[11px] font-medium uppercase tracking-[.09em] text-ink-muted">{l}</span><div className="font-display text-[34px] font-semibold leading-none text-ink">{v}</div></div></Card>))}
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" /><Inp className="w-full pl-9" placeholder="Search title, department, skill…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Seg opts={['All', 'Open', 'On hold', 'Closed']} val={tab} set={setTab} />
        <Btn v="pr" onClick={() => setForm('new')}><Plus size={16} /> Add position</Btn>
      </Card>

      {!list.length && <Card><Empty Icon={Briefcase} title="No positions found" sub="Add your first open position to start receiving analysed resumes." /></Card>}
      <div className="grid gap-5 lg:grid-cols-2">
        {list.map((p) => { const s = stats(p), pct = Math.min(100, Math.round((s.sel / p.openings) * 100)); return (
          <Card key={p.id} className={`flex flex-col gap-4 p-6 transition hover:shadow-lift ${p.status === 'Closed' ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="font-display text-[24px] font-semibold leading-tight text-ink">{p.title}</h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[13px] text-ink-muted"><span>{p.dept}</span><span className="inline-flex items-center gap-1"><MapPin size={12} />{p.location}</span><span>{p.type}</span></p></div>
              <div className="flex flex-none flex-col items-end gap-1.5"><Pill v={p.status} /><Pill v={p.priority} /></div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[13px]"><span className="text-ink-muted">Hiring progress</span><b className="text-ink">{s.sel} of {p.openings} filled</b></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#F3EADC]"><div className="h-full rounded-full bg-gradient-to-r from-nude-300 to-nude-dark transition-[width] duration-700" style={{ width: pct + '%' }} /></div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[['Resumes', s.res], ['Shortlisted', s.short], ['Interviews', s.iv], ['Selected', s.sel]].map(([l, v]) => <div key={l} className="rounded-xl bg-cream-50 py-2.5"><b className="block font-display text-2xl font-semibold text-ink">{v}</b><span className="text-[11px] text-ink-muted">{l}</span></div>)}
            </div>
            <div className="text-[13px]"><b className="text-ink">Required</b><div className="mt-1">{p.must.map((k) => <Tag key={k}>{k}</Tag>)}</div>
              {p.nice.length > 0 && <><b className="mt-2 block text-ink-muted">Preferred</b><div className="mt-1">{p.nice.map((k) => <span key={k} className="m-0.5 inline-block rounded-lg bg-cream-100 px-2.5 py-0.5 text-xs text-ink-body">{k}</span>)}</div></>}</div>
            <p className="text-xs text-ink-muted">{p.minExp}–{p.maxExp} yrs experience · Owner {p.owner} · Posted {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <div className="flex flex-wrap gap-2 border-t border-cream-200 pt-4">
              <Btn sm v="pr" onClick={() => { S.setPosFilter(p.title); go('resumes'); }}><Users size={13} /> View resumes</Btn>
              <Btn sm onClick={() => setForm(p)}><Pencil size={13} /> Edit</Btn>
              {p.status === 'Open' && <Btn sm onClick={() => S.setPositionStatus(p.id, 'On hold')}><PauseCircle size={13} /> Hold</Btn>}
              {p.status !== 'Open' && <Btn sm onClick={() => S.setPositionStatus(p.id, 'Open')}><PlayCircle size={13} /> Reopen</Btn>}
              {p.status !== 'Closed' && <Btn sm onClick={() => S.setPositionStatus(p.id, 'Closed')}><XCircle size={13} /> Close</Btn>}
              <Btn sm className="ml-auto" onClick={() => del(p)}><Trash2 size={13} /> Delete</Btn>
            </div>
          </Card>); })}
      </div>

      {form && <Drawer onClose={() => setForm(null)}><PositionForm initial={form === 'new' ? null : form} titles={S.P.map((p) => p.title)} onSave={(d) => { form === 'new' ? S.addPosition(d) : S.updatePosition(form.id, d); setForm(null); }} /></Drawer>}
    </div>
  );
}
