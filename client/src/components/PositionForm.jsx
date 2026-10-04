import { useState } from 'react';
import { Save } from 'lucide-react';
import { HRS } from '../data/mockData';
import { DEPARTMENTS, TYPES, PRIORITIES, POS_STATUS } from '../utils/positionStore';
import SkillInput from './SkillInput';
import { Btn, Sel, Inp, Card, FIELD } from './ui';

const blank = () => ({ title: '', dept: DEPARTMENTS[0], location: '', type: TYPES[0], openings: 1, minExp: 0, maxExp: 5, must: [], nice: [], owner: HRS[0], priority: 'Medium', status: 'Open', desc: '' });
const L = ({ t, req, children }) => <label className="block text-[13px] font-medium text-ink-muted">{t}{req && <span className="text-[#C4513F]"> *</span>}<div className="mt-1 font-normal">{children}</div></label>;

export default function PositionForm({ initial, titles, onSave }) {
  const [f, setF] = useState(initial || blank()), [tried, setTried] = useState(false);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const errs = [];
  if (!f.title.trim()) errs.push('Position title is required');
  else if (titles.some((t) => t.toLowerCase() === f.title.trim().toLowerCase() && t !== initial?.title)) errs.push('A position with this title already exists');
  if (!f.location.trim()) errs.push('Location is required');
  if (!(f.openings >= 1)) errs.push('Openings must be at least 1');
  if (f.minExp < 0 || f.maxExp < f.minExp) errs.push('Maximum experience must be greater than or equal to minimum');
  if (!f.must.length) errs.push('Add at least one required skill');
  const submit = () => { setTried(true); if (!errs.length) onSave({ ...f, title: f.title.trim(), location: f.location.trim(), desc: f.desc.trim() }); };
  return (
    <div className="flex flex-col gap-4 pt-1">
      <div>
        <h3 className="font-display text-[26px] font-semibold text-ink">{initial ? 'Edit position' : 'Add open position'}</h3>
        <p className="mt-1 text-ink-muted">Required and preferred skills here drive the AI resume analysis for every candidate.</p>
      </div>
      <Card className="grid gap-3 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><L t="Position title" req><Inp className="w-full" placeholder="e.g. Senior React Developer" value={f.title} onChange={(e) => set({ title: e.target.value })} /></L></div>
        <L t="Department"><Sel className="w-full" value={f.dept} onChange={(e) => set({ dept: e.target.value })}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</Sel></L>
        <L t="Location" req><Inp className="w-full" placeholder="City or Remote" value={f.location} onChange={(e) => set({ location: e.target.value })} /></L>
        <L t="Employment type"><Sel className="w-full" value={f.type} onChange={(e) => set({ type: e.target.value })}>{TYPES.map((d) => <option key={d}>{d}</option>)}</Sel></L>
        <L t="Number of openings" req><Inp className="w-full" type="number" min={1} value={f.openings} onChange={(e) => set({ openings: +e.target.value })} /></L>
        <L t="Min experience (years)"><Inp className="w-full" type="number" min={0} value={f.minExp} onChange={(e) => set({ minExp: +e.target.value })} /></L>
        <L t="Max experience (years)"><Inp className="w-full" type="number" min={0} value={f.maxExp} onChange={(e) => set({ maxExp: +e.target.value })} /></L>
        <L t="Priority"><Sel className="w-full" value={f.priority} onChange={(e) => set({ priority: e.target.value })}>{PRIORITIES.map((d) => <option key={d}>{d}</option>)}</Sel></L>
        <L t="Owner HR"><Sel className="w-full" value={f.owner} onChange={(e) => set({ owner: e.target.value })}>{HRS.map((d) => <option key={d}>{d}</option>)}</Sel></L>
        {initial && <L t="Status"><Sel className="w-full" value={f.status} onChange={(e) => set({ status: e.target.value })}>{POS_STATUS.map((d) => <option key={d}>{d}</option>)}</Sel></L>}
      </Card>
      <Card className="flex flex-col gap-4 p-5">
        <L t="Required skills (must-have)" req><SkillInput value={f.must} onChange={(must) => set({ must })} exclude={f.nice} placeholder="Type a skill and press Enter" /></L>
        <L t="Preferred skills (nice-to-have)"><SkillInput tone="cream" value={f.nice} onChange={(nice) => set({ nice })} exclude={f.must} placeholder="Optional" /></L>
        <L t="Description"><textarea className={`${FIELD} w-full resize-y`} rows={3} maxLength={1000} placeholder="What will this person work on?" value={f.desc} onChange={(e) => set({ desc: e.target.value })} /></L>
      </Card>
      {tried && errs.length > 0 && <ul className="list-disc space-y-0.5 rounded-lg bg-[#C4513F]/10 py-3 pl-8 pr-3 text-xs text-[#C4513F]">{errs.map((e) => <li key={e}>{e}</li>)}</ul>}
      <div className="flex justify-end pb-2"><Btn v="pr" onClick={submit}><Save size={15} /> {initial ? 'Save changes' : 'Create position'}</Btn></div>
    </div>
  );
}
