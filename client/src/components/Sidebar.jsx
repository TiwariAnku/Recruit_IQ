import { NavLink, Link } from 'react-router-dom';
import { Repeat } from 'lucide-react';
import { ROUTES } from '../routes';
import { useS } from '../context/StoreContext';

export default function Sidebar() {
  const S = useS();
  return (
    <aside className="sticky top-0 flex h-screen w-[72px] flex-none flex-col bg-espresso px-3 py-5 text-[#EFE7DD] lg:w-64">
      <div className="mb-7 flex items-center px-2">
        <span className="hidden font-display text-[26px] font-semibold text-nude-light lg:block">Recruit<span className="text-nude">IQ</span></span>
      </div>
      <nav className="flex flex-col gap-1">
        {ROUTES.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={'/' + path} title={label} className={({ isActive }) => `relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${isActive ? 'bg-nude/15 text-nude-light' : 'text-[#B5A899] hover:bg-white/5 hover:text-white'}`}>
            {({ isActive }) => (<>
              {isActive && <span className="absolute -left-3 top-2 h-[calc(100%-16px)] w-1 rounded-r bg-nude-300" />}
              <Icon size={18} className="flex-none" /><span className="hidden lg:inline">{label}</span>
              {path === 'actions' && S.acts.length > 0 && <span className="ml-auto hidden rounded-full bg-nude px-2 py-px text-[11px] font-bold text-ink lg:inline">{S.acts.length}</span>}
            </>)}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
        <b className="font-display text-lg text-nude-light">Someone absent?</b>
        <p className="mb-3 mt-1 text-xs text-[#B5A899]">Open a one-click summary of their active work and reassign it.</p>
        <Link to="/handover" className="inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-br from-nude-light to-nude px-3 py-1.5 text-xs font-semibold text-ink"><Repeat size={14} /> HR Handover</Link>
      </div>
    </aside>
  );
}
