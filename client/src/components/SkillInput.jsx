import { useState } from 'react';
import { X } from 'lucide-react';
import { SKILL_CATALOG } from '../utils/positionStore';
import { FIELD } from './ui';

const canon = (s) => SKILL_CATALOG.find((k) => k.toLowerCase() === s.toLowerCase()) || s;

// Tag input: type a skill and press Enter / comma, or tap a suggestion. Custom skills are allowed.
export default function SkillInput({ value, onChange, placeholder, tone = 'nude', exclude = [] }) {
  const [t, setT] = useState('');
  const taken = (s) => [...value, ...exclude].some((v) => v.toLowerCase() === s.toLowerCase());
  const add = (raw) => { const s = canon(raw.trim().replace(/,+$/, '')); setT(''); if (s && !taken(s)) onChange([...value, s]); };
  const sug = SKILL_CATALOG.filter((k) => !taken(k) && k.toLowerCase().includes(t.trim().toLowerCase())).slice(0, 8);
  const chip = tone === 'nude' ? 'bg-nude/15 text-[#7A5638]' : 'bg-cream-100 text-ink-body';
  return (
    <div>
      <div className={`${FIELD} flex min-h-[44px] flex-wrap items-center gap-1.5`}>
        {value.map((s) => <span key={s} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs ${chip}`}>{s}<button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(value.filter((v) => v !== s))} className="cursor-pointer opacity-60 hover:opacity-100"><X size={12} /></button></span>)}
        <input value={t} placeholder={value.length ? '' : placeholder} onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setT(e.target.value))}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(t); } else if (e.key === 'Backspace' && !t && value.length) onChange(value.slice(0, -1)); }}
          onBlur={() => t.trim() && add(t)} className="min-w-[120px] flex-1 bg-transparent py-1 text-sm outline-none" />
      </div>
      {sug.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{sug.map((k) => <button type="button" key={k} onClick={() => add(k)} className="cursor-pointer rounded-lg border border-cream-200 bg-white px-2.5 py-0.5 text-xs text-ink-muted hover:border-nude hover:text-nude-dark">+ {k}</button>)}</div>}
    </div>
  );
}
