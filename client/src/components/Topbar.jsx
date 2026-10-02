import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, CheckCheck, AlertTriangle, ClipboardList, History, ChevronDown, Repeat, BellOff } from 'lucide-react';
import { ROUTES } from '../routes';
import { useS } from '../context/StoreContext';
import { nm, ago } from '../utils/helpers';
import { Avatar, FOCUS } from './ui';
import UploadButton from './UploadButton';

const ICON = { Urgent: [AlertTriangle, '#C4513F'], Task: [ClipboardList, '#C27A1E'], Activity: [History, '#A8764F'] };

export default function Topbar() {
  const { pathname } = useLocation(), nav = useNavigate(), S = useS();
  const cur = ROUTES.find((r) => '/' + r.path === pathname) || ROUTES[0];
  const [open, setOpen] = useState(null), [tab, setTab] = useState('All'), [read, setRead] = useState(() => new Set()), [sq, setSq] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(null);
    const k = (e) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, []);

  const items = [
    ...S.acts.map((a) => ({ k: 'a' + a.k, kind: a.g === 'Urgent' ? 'Urgent' : 'Task', title: a.t, sub: (a.r ? nm(a.r) : 'Manager') + ' · Due ' + a.due, to: 'actions' })),
    ...S.I.filter((i) => i.d === 0 && i.st === 'Scheduled').map((i) => ({ k: 'i' + i.id, kind: 'Task', title: 'Interview today · ' + i.t, sub: S.rn(i.rid) + ' · ' + i.rd, to: 'interviews' })),
    ...S.L.slice(0, 5).map((l) => ({ k: 'l' + l.t, kind: 'Activity', title: l.what, sub: l.ref + ' · ' + ago(l.t), to: 'log' })),
  ];
  const shown = items.filter((n) => tab === 'All' || (tab === 'Urgent' ? n.kind === 'Urgent' : n.kind === 'Activity'));
  const unread = items.filter((n) => !read.has(n.k)).length;
  const go = (to) => { setOpen(null); nav('/' + to); };
  const openItem = (n) => { setRead(new Set(read).add(n.k)); go(n.to); };
  const submit = (e) => { if (e.key === 'Enter') { S.setQ(sq); nav('/resumes'); } };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-cream-200 bg-cream/85 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[28px] font-semibold leading-tight text-ink">{cur.label}</h1>
        <p className="hidden truncate text-[13px] text-ink-muted sm:block">{cur.sub}</p>
      </div>
      <div className="relative hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input value={sq} onChange={(e) => setSq(e.target.value)} onKeyDown={submit} placeholder="Search resumes, skills…  ↵" className="w-64 rounded-xl border border-cream-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-nude focus:ring-4 focus:ring-nude/15" />
      </div>
      <UploadButton className="hidden sm:inline-flex" label="Upload resume" onDone={() => nav('/resumes')} />

      <div ref={ref} className="flex items-center gap-2">
        <div className="relative">
          <button type="button" aria-label="Notifications" onClick={() => setOpen(open === 'n' ? null : 'n')} className={`${FOCUS} relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-cream-200 bg-white text-ink-body transition hover:border-nude`}>
            <Bell size={18} />
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#C4513F] px-1 text-[10px] font-bold text-white">{unread}</span>}
          </button>
          {open === 'n' && (
            <div className="absolute right-0 top-12 z-50 w-[390px] max-w-[92vw] animate-pop overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-lift">
              <div className="flex items-center justify-between px-4 pb-2 pt-4">
                <b className="font-display text-xl text-ink">Notifications <span className="ml-1 rounded-full bg-nude/20 px-2 py-px font-sans text-xs text-[#7A5638]">{unread} new</span></b>
                <button type="button" onClick={() => setRead(new Set(items.map((n) => n.k)))} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-nude-dark hover:text-ink"><CheckCheck size={14} /> Mark all read</button>
              </div>
              <div className="flex gap-1 border-b border-cream-200 px-4">
                {['All', 'Urgent', 'Activity'].map((t) => <button type="button" key={t} onClick={() => setTab(t)} className={`-mb-px cursor-pointer border-b-2 px-3 py-2 text-[13px] font-medium ${tab === t ? 'border-nude text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`}>{t}</button>)}
              </div>
              <div className="max-h-[360px] overflow-auto">
                {shown.map((n) => { const [I, c] = ICON[n.kind]; const isNew = !read.has(n.k); return (
                  <button type="button" key={n.k} onClick={() => openItem(n)} className={`flex w-full cursor-pointer items-start gap-3 border-b border-cream-200 px-4 py-3 text-left transition hover:bg-cream-50 ${isNew ? 'bg-nude/[.06]' : ''}`}>
                    <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg" style={{ background: c + '1f', color: c }}><I size={16} /></span>
                    <span className="min-w-0 flex-1"><b className="block truncate text-ink">{n.title}</b><span className="text-xs text-ink-muted">{n.sub}</span></span>
                    {isNew && <i className="mt-2 h-2 w-2 flex-none rounded-full bg-[#C4513F]" />}
                  </button>); })}
                {!shown.length && <div className="flex flex-col items-center gap-2 px-4 py-9 text-ink-muted"><BellOff size={26} className="text-nude" /><b className="text-ink-body">You're all caught up</b></div>}
              </div>
              <button type="button" onClick={() => go('log')} className="w-full cursor-pointer bg-cream-50 py-3 text-[13px] font-semibold text-nude-dark hover:text-ink">View full activity log</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button type="button" onClick={() => setOpen(open === 'u' ? null : 'u')} className={`${FOCUS} flex cursor-pointer items-center gap-2 rounded-xl border border-cream-200 bg-white py-1 pl-1 pr-2 transition hover:border-nude`}>
            <Avatar size="h-8 w-8">M</Avatar><span className="hidden text-left leading-tight lg:block"><b className="block text-[13px] text-ink">Manager</b><span className="text-[11px] text-ink-muted">Senior HR</span></span><ChevronDown size={14} className="text-ink-muted" />
          </button>
          {open === 'u' && (
            <div className="absolute right-0 top-12 z-50 w-56 animate-pop overflow-hidden rounded-2xl border border-cream-200 bg-white p-1.5 shadow-lift">
              {[['handover', Repeat, 'HR Handover'], ['log', History, 'Activity Log'], ['actions', ClipboardList, 'Action Center']].map(([to, I, t]) => (
                <button type="button" key={to} onClick={() => go(to)} className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-ink-body hover:bg-cream-100"><I size={16} className="text-nude-dark" /> {t}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
