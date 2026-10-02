import { ArrowRight } from 'lucide-react';
import { go } from '../utils/helpers';

export const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nude';
export const FIELD = 'rounded-[10px] border border-cream-200 bg-white px-3 py-2 text-sm text-ink-body outline-none transition focus:border-nude focus:ring-4 focus:ring-nude/15';
export const TH = 'whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[.1em] text-ink-muted';
export const TD = 'whitespace-nowrap border-t border-cream-200 px-4 py-3';

export const Card = ({ className = '', ...p }) => <div className={`rounded-2xl border border-cream-200 bg-white shadow-card ${className}`} {...p} />;

export function Btn({ v = 'ghost', sm, className = '', ...p }) {
  const vs = {
    ghost: 'border border-cream-200 bg-white text-ink-body hover:border-nude hover:text-nude-dark',
    pr: 'border border-transparent bg-gradient-to-br from-nude-light to-nude font-semibold text-ink hover:brightness-105',
    dark: 'border border-transparent bg-espresso text-nude-light hover:bg-espresso-800',
  };
  return <button type="button" className={`${FOCUS} inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[10px] font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${vs[v]} ${sm ? 'px-2.5 py-[3px] text-xs' : 'px-3.5 py-2 text-sm'} ${className}`} {...p} />;
}
export const Sel = ({ className = '', ...p }) => <select className={`${FIELD} ${className}`} {...p} />;
export const Inp = ({ className = '', ...p }) => <input className={`${FIELD} ${className}`} {...p} />;
export const Tag = ({ x, children }) => <span className={`m-0.5 inline-block rounded-lg px-2.5 py-0.5 text-xs ${x ? 'bg-[#C4513F]/10 text-[#C4513F]' : 'bg-nude/15 text-[#7A5638]'}`}>{children}</span>;
export const Empty = ({ Icon, title, sub }) => (
  <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-ink-muted"><Icon size={28} className="text-nude" /><b className="text-ink-body">{title}</b><span className="text-[13px]">{sub}</span></div>
);
export const Avatar = ({ children, size = 'h-10 w-10' }) => <span className={`${size} grid flex-none place-items-center rounded-full bg-gradient-to-br from-nude-light to-nude text-xs font-bold text-ink`}>{children}</span>;
export const Seg = ({ opts, val, set }) => (
  <div className="inline-flex rounded-xl border border-cream-200 bg-white p-1">
    {opts.map((o) => <button type="button" key={o} onClick={() => set(o)} className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${val === o ? 'bg-espresso text-nude-light' : 'text-ink-muted hover:text-ink'}`}>{o}</button>)}
  </div>
);
export const Section = ({ title, sub, to, cta = 'View all', right, className = '', children }) => (
  <Card className={`p-6 ${className}`}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div><h3 className="font-display text-xl font-semibold text-ink">{title}</h3>{sub && <p className="mt-0.5 text-[13px] text-ink-muted">{sub}</p>}</div>
      {right}
      {to && <button type="button" onClick={() => go(to)} className={`${FOCUS} inline-flex cursor-pointer items-center gap-1 p-1 text-[13px] font-semibold text-nude-dark hover:text-ink`}>{cta} <ArrowRight size={14} /></button>}
    </div>
    {children}
  </Card>
);
