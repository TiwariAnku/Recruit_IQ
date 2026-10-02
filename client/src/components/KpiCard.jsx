import { ArrowUpRight, Circle } from 'lucide-react';
import { go } from '../utils/helpers';
import { FOCUS } from './ui';

export default function KpiCard({ l, v, to, Icon = Circle, tint = '#A8764F' }) {
  return (
    <button type="button" onClick={() => go(to)} className={`${FOCUS} group relative flex cursor-pointer flex-col items-start gap-1 rounded-2xl border border-cream-200 bg-white p-[18px] text-left shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lift`}>
      <span className="mb-2.5 grid h-10 w-10 place-items-center rounded-xl" style={{ background: tint + '24', color: tint }}><Icon size={19} /></span>
      <span className="text-[11px] font-medium uppercase tracking-[.09em] text-ink-muted">{l}</span>
      <span className="font-display text-[40px] font-semibold leading-[1.05] text-ink">{v}</span>
      <ArrowUpRight size={16} className="absolute right-4 top-4 text-ink-muted opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}
