import { COL } from '../data/mockData';

export default function StatusBadge({ v }) {
  const c = COL[v] || '#8A7C6F';
  return <span className="inline-block whitespace-nowrap rounded-full px-[11px] py-[3px] text-xs font-semibold" style={{ background: c + '1f', color: c }}>{v}</span>;
}
