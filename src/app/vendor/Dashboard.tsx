import { ArrowRight, CheckCircle2, Clock, FileSearch, FilePen, Laptop, MapPin, MessageSquareWarning, Monitor, Droplets, Scale, Search, Send, Stethoscope, Upload, Wallet } from "lucide-react";
import { OPPS, Opp, VENDOR, actionItems, closingSoon, countdown, fmtDate, isClosed, startResponse, statusOf, useVendor, DOCS } from "./store";
import { Btn, Card, CardHead, Nav, StatusPill } from "./ui";

const ART: Record<string, { Icon: typeof Monitor; bg: string }> = {
  rfp0001115: { Icon: Monitor, bg: "linear-gradient(135deg,#1cabe2,#0e86b8)" },
  rfp0001121: { Icon: Scale, bg: "linear-gradient(135deg,#374ea2,#25357a)" },
  rfp0001123: { Icon: Droplets, bg: "linear-gradient(135deg,#00a05a,#00733f)" },
  rfp0001119: { Icon: Laptop, bg: "linear-gradient(135deg,#f08a2a,#d1630a)" },
  rfp0001122: { Icon: Stethoscope, bg: "linear-gradient(135deg,#8e3bb0,#62227f)" },
};
const STEPS = [
  { Icon: Search, t: "Choose an opportunity", d: "Pick a tender that fits your business" },
  { Icon: FileSearch, t: "Review requirements", d: "See documents, budget and criteria" },
  { Icon: Upload, t: "Prepare and upload", d: "Add your offer and documents" },
  { Icon: Send, t: "Submit and track", d: "Follow the review in real time" },
];

function OppCard({ o, go }: { o: Opp; go: Nav }) {
  const s = useVendor();
  const r = s.resp[o.id];
  const st = statusOf(o, s);
  const { Icon, bg } = ART[o.id] || ART.rfp0001115;
  const soon = closingSoon(o);
  const mand = o.docs.filter(d => DOCS[d].mandatory).length;

  let primary: React.ReactNode;
  if (!r) primary = <Btn className="flex-1" disabled={isClosed(o)} onClick={() => { startResponse(o.id); go("opportunities", o.id, "response"); }}>Apply now <ArrowRight className="w-3.5 h-3.5" aria-hidden /></Btn>;
  else if (r.status === "Draft") primary = <Btn className="flex-1" onClick={() => go("opportunities", o.id, "response")}>Continue application</Btn>;
  else if (r.status === "Need Clarification") primary = <Btn className="flex-1" onClick={() => go("opportunities", o.id, "clarifications")}>Reply to clarification</Btn>;
  else primary = <Btn className="flex-1" variant="secondary" onClick={() => go("opportunities", o.id, "response")}>View my response</Btn>;

  return (
    <article className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-shadow hover:shadow-lg" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <div className="relative h-24 grid place-items-center text-white overflow-hidden" style={{ background: bg }}>
        <span className="absolute -left-8 -bottom-12 w-32 h-32 rounded-full bg-white/15" aria-hidden />
        <span className="absolute -right-6 -top-10 w-24 h-24 rounded-full bg-white/15" aria-hidden />
        <Icon className="w-10 h-10 relative" aria-hidden />
        {soon && !r && <span className="absolute top-3 left-3 rounded-full bg-white text-[#b4440c] text-[11px] font-bold px-2.5 py-0.5 flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden />Closing soon</span>}
        {r && <span className="absolute top-3 left-3"><StatusPill status={st} /></span>}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-[11px] font-semibold text-[#0b6d96]">{o.no} · {o.type}</p>
          <h3 className="text-sm font-bold text-[#1a2942] leading-snug mt-0.5 line-clamp-2 min-h-[2.5rem]">{o.title}</h3>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#555]">
          <li className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#999]" aria-hidden />{o.loc}</li>
          <li className="flex items-center gap-1"><Wallet className="w-3 h-3 text-[#999]" aria-hidden />{o.cur} {o.budget}</li>
          <li className="flex items-center gap-1"><FilePen className="w-3 h-3 text-[#999]" aria-hidden />{mand} documents needed</li>
        </ul>
        <div className="flex items-center justify-between text-xs mt-auto pt-1">
          <span className="text-[#888]">Deadline {fmtDate(o.deadline)}</span>
          <span className={`font-bold ${soon ? "text-[#b4440c]" : "text-[#1a2942]"}`}>{countdown(o)}</span>
        </div>
        <div className="flex gap-2">
          {primary}
          <Btn variant="secondary" onClick={() => go("opportunities", o.id, "tender")}>Details</Btn>
        </div>
      </div>
    </article>
  );
}

export default function Dashboard({ go }: { go: Nav }) {
  const s = useVendor();
  const actions = actionItems(s).filter(a => a.kind !== "closing");
  const open = OPPS.filter(o => !isClosed(o)).sort((a, b) => +a.deadline - +b.deadline);
  const mine = OPPS.filter(o => s.resp[o.id]);
  const fresh = mine.length === 0;
  const first = VENDOR.name.split(" ")[0];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden text-white px-8 pt-8 pb-7" style={{ background: "linear-gradient(120deg,#1cabe2 0%,#1596cc 55%,#374ea2 130%)" }}>
        <span className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-white/10" aria-hidden />
        <span className="absolute right-40 -bottom-24 w-56 h-56 rounded-full bg-white/10" aria-hidden />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-xl">
            <p className="text-xs font-semibold opacity-90">{VENDOR.company} · {VENDOR.id}</p>
            <h1 className="text-2xl font-bold mt-1 leading-tight">{fresh ? `Welcome, ${first}. Let's find your first opportunity.` : `Welcome back, ${first}.`}</h1>
            <p className="text-sm mt-1.5 opacity-95">{open.length} opportunities are open for your response{fresh ? ". Choose one and we will guide you through each step." : "."}</p>
          </div>
          <button onClick={() => document.getElementById("open-opps")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-lg bg-white text-[#0b5878] text-sm font-bold px-5 py-2.5 hover:bg-[#f0f9fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            See open opportunities
          </button>
        </div>
        <ol className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7" aria-label="How applying works">
          {STEPS.map(({ Icon, t, d }, i) => (
            <li key={t} className="flex items-start gap-3 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3">
              <span className="w-8 h-8 rounded-full bg-white text-[#0b5878] grid place-items-center flex-shrink-0 text-sm font-bold">{i + 1}</span>
              <span className="min-w-0"><span className="flex items-center gap-1.5 text-sm font-semibold"><Icon className="w-3.5 h-3.5" aria-hidden />{t}</span><span className="block text-xs opacity-90 mt-0.5">{d}</span></span>
            </li>
          ))}
        </ol>
      </section>

      <div className="p-6 flex flex-col gap-8">
        {actions.length > 0 && (
          <Card className="border-[#f4c9ae]">
            <CardHead title="Action needed" sub={`${actions.length} item${actions.length > 1 ? "s" : ""} waiting on you`} />
            <ul>
              {actions.map(a => (
                <li key={a.kind + a.oppId} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 border-[rgba(0,0,0,0.06)]">
                  <span className={`w-9 h-9 rounded-lg grid place-items-center flex-shrink-0 ${a.kind === "clarify" ? "bg-[#fde6d8] text-[#b4440c]" : "bg-[#e6eaf7] text-[#374ea2]"}`}>
                    {a.kind === "clarify" ? <MessageSquareWarning className="w-4 h-4" aria-hidden /> : <FilePen className="w-4 h-4" aria-hidden />}
                  </span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#1a2942] truncate">{a.title}</p><p className="text-xs text-[#777] truncate">{a.detail}</p></div>
                  <Btn size="sm" variant={a.kind === "clarify" ? "primary" : "secondary"} onClick={() => go("opportunities", a.oppId, a.tab)}>{a.cta}</Btn>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <section id="open-opps" aria-labelledby="open-h" className="scroll-mt-4">
          <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h2 id="open-h" className="text-lg font-bold text-[#1a2942]">Open opportunities</h2>
              <p className="text-xs text-[#888]">Sorted by deadline. Choose Apply now and we will walk you through it.</p>
            </div>
            <Btn variant="ghost" onClick={() => go("opportunities")}>Search and filter <ArrowRight className="w-3.5 h-3.5" aria-hidden /></Btn>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
            {open.map(o => <OppCard key={o.id} o={o} go={go} />)}
          </div>
        </section>

        {!fresh && (
          <Card>
            <CardHead title="My applications" sub="Track every response" right={<Btn size="sm" variant="ghost" onClick={() => go("applications")}>View all</Btn>} />
            <ul>
              {mine.map(o => (
                <li key={o.id}>
                  <button onClick={() => go("opportunities", o.id, "response")} className="w-full text-left flex items-center gap-3 px-5 py-3.5 border-b last:border-0 border-[rgba(0,0,0,0.06)] hover:bg-[#f8fafc]">
                    <CheckCircle2 className="w-4 h-4 text-[#bbb] flex-shrink-0" aria-hidden />
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#1a2942] truncate">{o.title}</p><p className="text-xs text-[#777]">{o.no}{s.resp[o.id].submittedAt ? ` · submitted ${fmtDate(s.resp[o.id].submittedAt!)}` : " · not submitted"}</p></div>
                    <StatusPill status={s.resp[o.id].status} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
