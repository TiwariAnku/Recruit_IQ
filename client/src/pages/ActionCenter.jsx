import { PartyPopper, ExternalLink, Check } from 'lucide-react';
import { nm, go } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import { Btn, Section, Empty } from '../components/ui';

const G = { Urgent: ['#C4513F', 'Needs action now'], Today: ['#C27A1E', 'Due today'], Upcoming: ['#3F8F66', 'Coming up this week'] };

export default function ActionCenter() {
  const S = useS();
  return (
    <div className="flex animate-fade-up flex-col gap-5">
      {Object.entries(G).map(([g, [c, sub]]) => {
        const list = S.acts.filter((a) => a.g == g);
        return (
          <Section key={g} title={`${g} (${list.length})`} sub={sub}>
            {list.map((a) => (
              <div key={a.k} style={{ borderLeftColor: c }} className="mb-2.5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-l-4 border-cream-200 bg-cream-50 px-4 py-3 last:mb-0">
                <div><b className="text-ink">{a.t}</b><div className="text-[13px] text-ink-muted">{a.r ? `${nm(a.r)} · ${a.r.pos} · ${a.r.hr}` : 'Manager'} · Due {a.due}</div></div>
                <div className="flex gap-2">
                  {a.r && <Btn sm onClick={() => { S.setSel(a.r.id); go('resumes'); }}><ExternalLink size={13} /> Open Related Item</Btn>}
                  <Btn sm v="pr" onClick={a.do}><Check size={13} /> Mark Complete</Btn>
                </div>
              </div>
            ))}
            {!list.length && <Empty Icon={PartyPopper} title="All clear" sub="Nothing here right now." />}
          </Section>
        );
      })}
    </div>
  );
}
