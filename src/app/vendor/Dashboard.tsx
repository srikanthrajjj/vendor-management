import { ArrowRight, Check, Clock, Droplets, FilePen, FileText, Handshake, LayoutGrid, Laptop, Megaphone, MessageSquareWarning, Monitor, Receipt, Scale, Stethoscope, BookOpen } from "lucide-react";
import heroImg from "@/assets/hero-child.png";
import { OPPS, Opp, VENDOR, actionItems, closingSoon, countdown, fmtDate, isClosed, startResponse, statusOf, useVendor } from "./store";
import { Btn, CYAN, Nav, StatusPill } from "./ui";

const ICON: Record<string, typeof Monitor> = {
  rfp0001115: Monitor, rfp0001121: Scale, rfp0001123: Droplets, rfp0001119: Laptop, rfp0001122: Stethoscope,
};
const panel = "bg-white/90 rounded-2xl border border-[rgba(28,120,170,0.14)] backdrop-blur-sm";
const panelShadow = { boxShadow: "0 2px 14px rgba(20,90,140,0.07)" };

function Clipboard() {
  return (
    <svg viewBox="0 0 120 130" className="w-28 h-28 flex-shrink-0" aria-hidden>
      <ellipse cx="60" cy="118" rx="44" ry="7" fill="#1cabe2" opacity=".15" />
      <rect x="22" y="16" width="76" height="98" rx="10" fill="#d9eefa" stroke="#1cabe2" strokeWidth="3" transform="rotate(-6 60 65)" />
      <g transform="rotate(-6 60 65)">
        <rect x="42" y="8" width="36" height="16" rx="6" fill="#1cabe2" />
        <circle cx="60" cy="14" r="3" fill="#fff" />
        {[40, 62, 84].map(y => (
          <g key={y}>
            <rect x="34" y={y} width="14" height="14" rx="3" fill="#fff" stroke="#1cabe2" strokeWidth="2" />
            <path d={`M37 ${y + 7} l3 3 l6 -7`} stroke="#00833d" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="54" y={y + 3} width="32" height="4" rx="2" fill="#9fd4ee" />
            <rect x="54" y={y + 9} width="22" height="3" rx="1.5" fill="#c6e5f5" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function Row({ o, go }: { o: Opp; go: Nav }) {
  const s = useVendor();
  const r = s.resp[o.id];
  const Icon = ICON[o.id] || FileText;
  const soon = closingSoon(o);
  return (
    <li className="flex items-center gap-3 px-1 py-3.5 border-t first:border-0 border-[rgba(0,0,0,0.07)]">
      <button onClick={() => go("opportunities", o.id, "tender")} className="flex items-center gap-4 flex-1 min-w-0 text-left rounded-lg focus-visible:outline-2 focus-visible:outline-[#1cabe2] group">
        <span className="w-11 h-11 rounded-xl bg-[#e3f2fb] text-[#1c8fc4] grid place-items-center flex-shrink-0"><Icon className="w-5 h-5" aria-hidden /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[#1a2942] truncate group-hover:text-[#0b6d96]">{o.title}</span>
          <span className="block text-xs text-[#6b7c8e]">{o.no} · {o.loc}</span>
        </span>
        <span className="hidden sm:flex items-start gap-2 text-xs flex-shrink-0">
          <Clock className={`w-3.5 h-3.5 mt-0.5 ${soon ? "text-[#b4440c]" : "text-[#6b7c8e]"}`} aria-hidden />
          <span><span className={`block font-bold ${soon ? "text-[#b4440c]" : "text-[#1a2942]"}`}>{countdown(o)}</span><span className="block text-[#6b7c8e]">Due {fmtDate(o.deadline)}</span></span>
        </span>
      </button>
      <span className="hidden md:block w-[112px] text-right flex-shrink-0">
        {r ? <StatusPill status={statusOf(o, s)} /> : soon ? <span className="inline-flex rounded-full bg-[#fff4cf] text-[#8a5a00] text-[11px] font-semibold px-2.5 py-0.5">Closing soon</span> : <span className="inline-flex items-center gap-1 rounded-full bg-[#dff3e8] text-[#00693a] text-[11px] font-semibold px-2.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-current" />Open</span>}
      </span>
      <span className="w-[96px] flex-shrink-0 text-right">
        {!r ? <Btn size="sm" disabled={isClosed(o)} onClick={() => { startResponse(o.id); go("opportunities", o.id, "response"); }}>Apply</Btn>
          : <Btn size="sm" variant="secondary" onClick={() => go("opportunities", o.id, r.status === "Need Clarification" ? "clarifications" : "response")}>{r.status === "Draft" ? "Continue" : r.status === "Need Clarification" ? "Reply" : "View"}</Btn>}
      </span>
    </li>
  );
}

export default function Dashboard({ go }: { go: Nav }) {
  const s = useVendor();
  const actions = actionItems(s).filter(a => a.kind !== "closing");
  const open = OPPS.filter(o => !isClosed(o)).sort((a, b) => +a.deadline - +b.deadline);
  const mine = OPPS.filter(o => s.resp[o.id]);
  const fresh = mine.length === 0;
  const submitted = mine.some(o => s.resp[o.id].status !== "Draft");

  const stats: { label: string; n: number; Icon: typeof Monitor; to: string; hi?: boolean }[] = [
    { label: "Open opportunities", n: open.length, Icon: LayoutGrid, to: "opportunities", hi: true },
    { label: "My applications", n: mine.length, Icon: FileText, to: "applications" },
    { label: "Active contracts", n: s.contracts.length, Icon: Handshake, to: "contracts" },
    { label: "Pending invoices", n: 0, Icon: Receipt, to: "invoices" },
  ];
  const steps = [
    { t: "Create your vendor account", d: "", done: true, to: "" },
    { t: "Complete your profile", d: "Add company, contact and compliance details", done: false, to: "profile" },
    { t: "Browse and apply for an opportunity", d: "Find opportunities that match your expertise", done: !fresh, to: "opportunities" },
    { t: "Submit your first application", d: "Upload your documents and send your offer", done: submitted, to: "applications" },
  ];
  const doneN = steps.filter(x => x.done).length;

  return (
    <div className="pb-10">
      {/* Hero with photo */}
      <section className="relative overflow-hidden px-8 pt-9 pb-8 min-h-[150px]">
        <img src={heroImg} alt="" aria-hidden className="absolute right-0 top-0 h-full w-auto max-w-[60%] object-cover object-left pointer-events-none select-none"
          style={{ WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 38%)", maskImage: "linear-gradient(to right, transparent 0, #000 38%)" }} />
        <div className="relative max-w-2xl">
          <h1 className="text-[28px] font-extrabold text-[#0f1f38] leading-tight">Welcome, {VENDOR.name} <span aria-hidden>👋</span></h1>
          <p className="text-sm text-[#37495f] mt-1.5">Access procurement opportunities, submit applications and manage your engagement with UNICEF.</p>
        </div>
      </section>

      <div className="px-8 flex flex-col gap-5">
        {/* Get started / Action needed */}
        {fresh ? (
          <section className={`${panel} flex items-center gap-6 px-8 py-5 flex-wrap`} style={{ ...panelShadow, background: "linear-gradient(100deg,#e4f3fc,#f4fafe)" }}>
            <Clipboard />
            <div className="flex-1 min-w-[260px]">
              <h2 className="text-lg font-bold text-[#0f1f38]">Get started with opportunities</h2>
              <p className="text-sm text-[#37495f] mt-1">Browse open procurement opportunities and submit your first application to work with UNICEF. We will guide you through each step.</p>
              <Btn className="mt-4 !px-5 !py-2.5" onClick={() => go("opportunities")}>Browse opportunities <ArrowRight className="w-4 h-4" aria-hidden /></Btn>
            </div>
          </section>
        ) : actions.length > 0 && (
          <section className={`${panel} border-[#f4c9ae] px-6 py-4`} style={panelShadow}>
            <h2 className="text-base font-bold text-[#0f1f38] mb-1">Action needed <span className="text-xs font-medium text-[#6b7c8e]">· {actions.length} waiting on you</span></h2>
            <ul>{actions.map(a => (
              <li key={a.kind + a.oppId} className="flex items-center gap-4 py-3 border-t first:border-0 border-[rgba(0,0,0,0.07)]">
                <span className={`w-9 h-9 rounded-xl grid place-items-center flex-shrink-0 ${a.kind === "clarify" ? "bg-[#fde6d8] text-[#b4440c]" : "bg-[#e6eaf7] text-[#374ea2]"}`}>{a.kind === "clarify" ? <MessageSquareWarning className="w-4 h-4" aria-hidden /> : <FilePen className="w-4 h-4" aria-hidden />}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#1a2942] truncate">{a.title}</p><p className="text-xs text-[#6b7c8e] truncate">{a.detail}</p></div>
                <Btn size="sm" variant={a.kind === "clarify" ? "primary" : "secondary"} onClick={() => go("opportunities", a.oppId, a.tab)}>{a.cta}</Btn>
              </li>))}</ul>
          </section>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(({ label, n, Icon, to, hi }) => (
            <button key={label} onClick={() => go(to)} className={`${panel} flex items-center gap-4 px-5 py-4 text-left transition hover:border-[#1cabe2] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#1cabe2]`}
              style={{ ...panelShadow, ...(hi ? { background: "#e1f1fa", borderColor: "#9fd4ee" } : {}) }}>
              <span className={`w-12 h-12 rounded-xl grid place-items-center flex-shrink-0 ${hi ? "bg-[#c9e6f6] text-[#1c8fc4]" : "bg-[#eaf1f6] text-[#4a5e72]"}`}><Icon className="w-6 h-6" aria-hidden /></span>
              <span><span className="block text-[28px] font-extrabold text-[#0f1f38] leading-none tabular-nums">{n}</span><span className="block text-sm text-[#37495f] mt-1">{label}</span></span>
            </button>
          ))}
        </div>

        {/* Opportunities + checklist */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
          <section className={`${panel} px-6 py-5`} style={panelShadow} aria-labelledby="oo">
            <div className="flex items-start gap-4 mb-2 flex-wrap">
              <Megaphone className="w-7 h-7 text-[#1c8fc4] mt-1" aria-hidden />
              <div className="flex-1 min-w-[200px]"><h2 id="oo" className="text-lg font-bold text-[#0f1f38]">Open opportunities</h2><p className="text-sm text-[#37495f]">Procurement opportunities you can apply for.</p></div>
              <button onClick={() => go("opportunities")} className="text-sm font-semibold flex items-center gap-1.5 hover:underline" style={{ color: "#0b6d96" }}>View all opportunities <ArrowRight className="w-4 h-4" aria-hidden /></button>
            </div>
            <ul>{open.slice(0, 5).map(o => <Row key={o.id} o={o} go={go} />)}</ul>
          </section>

          <section className={`${panel} px-6 py-5`} style={panelShadow} aria-labelledby="gm">
            <div className="flex items-center gap-3"><BookOpen className="w-7 h-7 text-[#1c8fc4]" aria-hidden /><h2 id="gm" className="text-lg font-bold text-[#0f1f38]">Get the most from the Vendor Portal</h2></div>
            <div className="flex items-center gap-3 mt-4 mb-3 text-xs text-[#37495f]">
              <span className="font-semibold">{doneN} of {steps.length} complete</span>
              <div className="flex-1 h-1.5 rounded-full bg-[#dbe9f3] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(doneN / steps.length) * 100}%`, backgroundColor: CYAN }} /></div>
            </div>
            <ul className="flex flex-col">
              {steps.map(st => (
                <li key={st.t}>
                  <button disabled={!st.to} onClick={() => st.to && go(st.to)} className="w-full flex items-start gap-3.5 py-3 text-left rounded-lg enabled:hover:bg-[#f1f8fd] px-1 focus-visible:outline-2 focus-visible:outline-[#1cabe2]">
                    <span className={`w-7 h-7 rounded-full grid place-items-center flex-shrink-0 mt-0.5 border-2 ${st.done ? "bg-[#1cabe2] border-[#1cabe2] text-white" : "border-[#c5d3de] text-transparent"}`}><Check className="w-4 h-4" aria-hidden /></span>
                    <span><span className={`block text-sm font-bold ${st.done ? "text-[#6b7c8e] line-through" : "text-[#0f1f38]"}`}>{st.t}</span>{st.d && !st.done && <span className="block text-xs text-[#6b7c8e] mt-0.5">{st.d}</span>}</span>
                    {st.to && !st.done && <ArrowRight className="w-4 h-4 text-[#1c8fc4] ml-auto mt-1" aria-hidden />}
                  </button>
                </li>))}
            </ul>
          </section>
        </div>

        {!fresh && (
          <section className={`${panel} px-6 py-5`} style={panelShadow}>
            <div className="flex items-center justify-between mb-1"><h2 className="text-lg font-bold text-[#0f1f38]">My applications</h2><button onClick={() => go("applications")} className="text-sm font-semibold hover:underline" style={{ color: "#0b6d96" }}>View all</button></div>
            <ul>{mine.map(o => (
              <li key={o.id} className="border-t first:border-0 border-[rgba(0,0,0,0.07)]">
                <button onClick={() => go("opportunities", o.id, "response")} className="w-full flex items-center gap-3 py-3 text-left hover:bg-[#f1f8fd] rounded-lg px-1">
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-[#1a2942] truncate">{o.title}</p><p className="text-xs text-[#6b7c8e]">{o.no}{s.resp[o.id].submittedAt ? ` · submitted ${fmtDate(s.resp[o.id].submittedAt!)}` : " · not submitted"}</p></div>
                  <StatusPill status={s.resp[o.id].status} />
                </button>
              </li>))}</ul>
          </section>
        )}
      </div>
    </div>
  );
}
