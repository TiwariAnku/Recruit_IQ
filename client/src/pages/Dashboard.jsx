import { HRS, ST, COL } from '../data/mockData';
import { RecPill } from '../components/FeedbackDetail';
import { nm, go } from '../utils/helpers';
import { useS } from '../context/StoreContext';
import {
  Briefcase, FileText, Search, UserCheck, CalendarDays, ClipboardList, Trophy,
  ArrowUpRight, ArrowRight, Video, Building2, CheckCircle2, CalendarX2,
} from 'lucide-react';

/* ---------- shared Tailwind class strings ---------- */
const CARD = 'rounded-2xl border border-cream-200 bg-white shadow-[0_2px_4px_rgba(90,62,42,.04),0_10px_28px_rgba(90,62,42,.06)]';
const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nude';
const PRIORITY_COLOR = { Urgent: '#C4513F', Today: '#C27A1E', Upcoming: '#3F8F66' };

/* ---------- small building blocks ---------- */
function Pill({ v }) {
  const color = COL[v] || '#8A7C6F';
  return (
    <span className="inline-block rounded-full px-[11px] py-[3px] text-xs font-semibold" style={{ background: color + '1f', color }}>
      {v}
    </span>
  );
}

function StatCard({ l, v, to, Icon, tint }) {
  return (
    <button
      type="button"
      onClick={() => go(to)}
      className={`${CARD} ${FOCUS} group relative flex cursor-pointer flex-col items-start gap-1 p-[18px] text-left font-[inherit] text-inherit transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(90,62,42,.14)]`}
    >
      <span className="mb-2.5 grid h-10 w-10 place-items-center rounded-xl" style={{ background: tint + '24', color: tint }}>
        <Icon size={19} />
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[.09em] text-ink-muted">{l}</span>
      <span className="font-display text-[40px] font-semibold leading-[1.05] text-ink">{v}</span>
      <ArrowUpRight size={16} className="absolute right-4 top-4 text-ink-muted opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

function PanelHead({ title, sub, to, cta = 'View all' }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-2.5">
      <div>
        <h3 className="m-0 font-display text-[20px] font-semibold text-ink">{title}</h3>
        {sub && <span className="mt-0.5 block text-[13px] text-ink-muted">{sub}</span>}
      </div>
      {to && (
        <button type="button" onClick={() => go(to)} className={`${FOCUS} inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-1 font-[inherit] text-[13px] font-semibold text-nude-dark hover:text-ink`}>
          {cta} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function Empty({ Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center gap-2 px-2.5 py-7 text-center text-ink-muted">
      <Icon size={28} className="text-nude" />
      <b className="text-ink-body">{title}</b>
      <span className="text-[13px]">{sub}</span>
    </div>
  );
}

/* ---------- page ---------- */
export default function Dashboard() {
  const S = useS();
  const { R, I } = S;
  const c = (s) => R.filter((r) => r.st == s).length;
  const fbn = S.acts.filter((a) => a.g == 'Urgent').length;
  const mx = Math.max(...ST.map(c), 1);
  const total = Math.max(R.length, 1);
  const todays = I.filter((i) => i.d == 0 && i.st == 'Scheduled');
  const hrCounts = HRS.map((h) => R.filter((r) => r.hr == h).length);
  const hrMax = Math.max(...hrCounts, 1);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const anim = (n) => ({ animationDelay: n * 60 + 'ms' });

  const KPIS = [
    { l: 'Open Positions', v: S.P.filter((p) => p.status === 'Open').length, to: 'positions', Icon: Briefcase, tint: '#4A7BB0' },
    { l: 'Resumes Received', v: R.length, to: 'resumes', Icon: FileText, tint: '#A8764F' },
    { l: 'Under Review', v: c('New') + c('Screening'), to: 'resumes', Icon: Search, tint: '#C27A1E' },
    { l: 'Shortlisted', v: c('Shortlisted'), to: 'resumes', Icon: UserCheck, tint: '#7C62B3' },
    { l: 'Interviews', v: I.filter((i) => i.st == 'Scheduled').length, to: 'interviews', Icon: CalendarDays, tint: '#4A7BB0' },
    { l: 'Feedback Pending', v: S.I.filter((i) => i.st == 'Completed' && i.fb == 'Pending').length, to: 'feedback', Icon: ClipboardList, tint: '#C4513F' },
    { l: 'Selected', v: c('Selected'), to: 'resumes', Icon: Trophy, tint: '#3F8F66' },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Hero */}
      <section style={anim(0)} className="relative flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[20px] bg-gradient-to-br from-espresso via-espresso-800 to-espresso-700 px-8 py-7 text-[#EFE7DD] shadow-[0_16px_36px_rgba(43,32,25,.25)] motion-safe:animate-fade-up">
        <div className="pointer-events-none absolute -right-16 -top-24 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(216,185,160,.2),transparent_70%)]" />
        <div className="relative z-10">
          <div className="text-[11px] font-medium uppercase tracking-[.16em] text-nude-300">{today}</div>
          <h2 className="my-2 font-display text-4xl font-semibold leading-tight text-[#F7EBDD]">{greet}, Manager</h2>
          <p className="m-0 max-w-[520px] text-[#BFB1A2]">
            {S.acts.length} action{S.acts.length === 1 ? '' : 's'} need attention and {todays.length} interview{todays.length === 1 ? '' : 's'} {todays.length === 1 ? 'is' : 'are'} scheduled today.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3">
          {[[S.I.filter((i) => i.st == 'Completed' && i.fb == 'Pending').length, 'Feedback pending', 'feedback'], [todays.length, 'Interviews today', 'interviews']].map(([n, t, to]) => (
            <button key={t} type="button" onClick={() => go(to)} className={`${FOCUS} flex min-w-[132px] cursor-pointer flex-col items-start gap-0.5 rounded-[14px] border border-white/15 bg-white/10 px-4 py-3 text-left font-[inherit] text-[#F7EBDD] transition hover:-translate-y-0.5 hover:border-nude-300/60 hover:bg-white/20`}>
              <b className="font-display text-3xl font-semibold leading-none">{n}</b>
              <span className="text-xs text-[#CDBFAF]">{t}</span>
            </button>
          ))}
        </div>
      </section>

      {/* KPI cards */}
      <section style={anim(1)} className="grid grid-cols-[repeat(auto-fit,minmax(172px,1fr))] gap-4 motion-safe:animate-fade-up">
        {KPIS.map((k) => <StatCard key={k.l} {...k} />)}
      </section>

      {/* Panels */}
      <section style={anim(2)} className="grid grid-cols-12 gap-[22px] motion-safe:animate-fade-up">
        {/* Pipeline */}
        <div className={`${CARD} col-span-12 px-6 py-[22px] xl:col-span-7`}>
          <PanelHead title="Recruitment Pipeline" sub={`${R.length} resumes across ${ST.length} stages`} to="resumes" />
          {ST.map((s) => (
            <div key={s} className="grid grid-cols-[110px_1fr_56px] items-center gap-3.5 py-[9px] sm:grid-cols-[150px_1fr_74px]">
              <span className="flex items-center gap-2 font-medium text-ink-body">
                <i className="h-[9px] w-[9px] flex-none rounded-full" style={{ background: COL[s] }} />{s}
              </span>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#F3EADC]">
                <div className="h-full min-w-[4px] rounded-full transition-[width] duration-700" style={{ width: (c(s) / mx) * 100 + '%', background: COL[s] }} />
              </div>
              <span className="text-right">
                <b className="font-display text-[22px] font-semibold text-ink">{c(s)}</b>
                <span className="ml-1.5 text-xs text-ink-muted">{Math.round((c(s) / total) * 100)}%</span>
              </span>
            </div>
          ))}
        </div>

        {/* Action required */}
        <div className={`${CARD} col-span-12 px-6 py-[22px] xl:col-span-5`}>
          <PanelHead title="Action Required" sub="Most important items first" to="actions" />
          {S.acts.slice(0, 5).map((a) => (
            <div key={a.k} style={{ borderLeftColor: PRIORITY_COLOR[a.g] }} className="mb-2.5 flex items-center justify-between gap-3 rounded-[14px] border border-l-4 border-cream-200 bg-cream-50 py-[13px] pl-4 pr-3.5 transition last:mb-0 hover:translate-x-0.5 hover:shadow-[0_8px_20px_rgba(90,62,42,.08)]">
              <div className="min-w-0">
                <Pill v={a.g == 'Urgent' ? 'High' : a.g == 'Today' ? 'Medium' : 'Low'} />
                <div className="mb-px mt-1 font-semibold text-ink">{a.t}</div>
                <span className="text-[13px] text-ink-muted">{a.r ? nm(a.r) : 'Manager'} · Due {a.due}</span>
              </div>
              <button type="button" onClick={() => go('actions')} className={`${FOCUS} cursor-pointer rounded-[10px] border border-cream-200 bg-white px-2.5 py-[3px] font-[inherit] text-xs font-medium text-ink-body transition hover:border-nude hover:text-nude-dark`}>Open</button>
            </div>
          ))}
          {!S.acts.length && <Empty Icon={CheckCircle2} title="All caught up" sub="No pending actions right now." />}
        </div>

        {/* Today's interviews */}
        <div className={`${CARD} col-span-12 px-6 py-[22px] xl:col-span-5`}>
          <PanelHead title="Today's Interviews" sub={`${todays.length} scheduled`} to="interviews" />
          {todays.map((i) => (
            <div key={i.id} className="flex items-center gap-3.5 border-b border-cream-200 py-[13px] last:border-0">
              <div className="min-w-[68px] rounded-xl bg-cream-100 px-1.5 py-[9px] text-center font-display text-xl font-semibold text-ink">{i.t}</div>
              <div className="min-w-0 flex-1">
                <b className="block text-ink">{S.rn(i.rid)}</b>
                <span className="text-[13px] text-ink-muted">{i.rd}</span>
              </div>
              <span className="inline-flex items-center gap-1.5">
                {i.mode == 'Video' ? <Video size={15} color={COL.Video} /> : <Building2 size={15} color={COL.Onsite} />}
                <Pill v={i.mode} />
              </span>
            </div>
          ))}
          {!todays.length && <Empty Icon={CalendarX2} title="No interviews today" sub="Your calendar is clear." />}
        </div>

        {/* HR workload */}
        <div className={`${CARD} col-span-12 px-6 py-[22px] xl:col-span-7`}>
          <PanelHead title="HR Workload" sub="Resumes currently owned by each HR" to="workspace" cta="Open workspace" />
          {HRS.map((h, idx) => (
            <button key={h} type="button" onClick={() => go('workspace')} className={`${FOCUS} grid w-full cursor-pointer grid-cols-[40px_1fr_70px] items-center gap-3.5 rounded-xl border-0 bg-transparent px-2 py-[11px] text-left font-[inherit] text-inherit transition hover:bg-cream-100/70 sm:grid-cols-[44px_90px_1fr_90px]`}>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-nude-light to-nude font-bold text-ink">{h.slice(-2)}</span>
              <span className="font-semibold text-ink">{h}</span>
              <div className="hidden h-2.5 overflow-hidden rounded-full bg-[#F3EADC] sm:block">
                <div className="h-full min-w-[4px] rounded-full bg-gradient-to-r from-nude-300 to-nude-dark transition-[width] duration-700" style={{ width: (hrCounts[idx] / hrMax) * 100 + '%' }} />
              </div>
              <span className="text-right text-ink-muted"><b className="text-base text-ink">{hrCounts[idx]}</b> resumes</span>
            </button>
          ))}
        </div>

        {/* Latest interview feedback */}
        <div className={`${CARD} col-span-12 px-6 py-[22px]`}>
          <PanelHead title="Latest Interview Feedback" sub="Most recent scorecards from the feedback history" to="feedback" />
          {S.FB.slice(0, 4).map((f) => (
            <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 py-3 first:border-0">
              <div className="min-w-0"><b className="text-ink">{f.candidate}</b> <span className="text-ink-muted">· {f.position} · {f.round}</span>
                <div className="truncate text-[13px] text-ink-muted">{f.strengths}</div></div>
              <div className="flex items-center gap-3"><span className="font-semibold text-ink">★ {f.overall.toFixed(1)}</span><RecPill v={f.recommendation} /><span className="text-xs text-ink-muted">{f.submittedBy}</span></div>
            </div>))}
          {!S.FB.length && <Empty Icon={ClipboardList} title="No feedback yet" sub="Submitted interview feedback appears here." />}
        </div>
      </section>
    </div>
  );
}
