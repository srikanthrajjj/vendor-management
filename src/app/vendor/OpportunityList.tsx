import { useState } from "react";
import { ArrowUpDown, ChevronRight, Search } from "lucide-react";
import { OPPS, Opp, closingSoon, countdown, fmtDate, isClosed, statusOf, useVendor } from "./store";
import { Card, Empty, Nav, PageHeader, PillTabs, StatusPill, inputCls } from "./ui";

type Tab = "all" | "open" | "mine" | "soon";
type SortKey = "title" | "loc" | "deadline";

export default function OpportunityList({ go }: { go: Nav }) {
  const s = useVendor();
  const [f, setF] = useState({ num: "", kw: "", ref: "", loc: "" });
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: "deadline", dir: 1 });
  const locs = [...new Set(OPPS.map(o => o.loc))];

  const base = (o: Opp) =>
    (!f.num || o.no.toLowerCase().includes(f.num.toLowerCase().replace(/\*/g, ""))) &&
    (!f.kw || (o.title + " " + o.summary).toLowerCase().includes(f.kw.toLowerCase())) &&
    (!f.ref || o.ref.toLowerCase().includes(f.ref.toLowerCase())) &&
    (!f.loc || o.loc === f.loc);
  const tabOk: Record<Tab, (o: Opp) => boolean> = {
    all: () => true,
    open: o => !s.resp[o.id] && !isClosed(o),
    mine: o => !!s.resp[o.id],
    soon: o => closingSoon(o) && !s.resp[o.id],
  };
  const filtered = OPPS.filter(base);
  const rows = filtered.filter(tabOk[tab]).sort((a, b) => {
    const x = sort.k === "title" ? a.title : sort.k === "loc" ? a.loc : +a.deadline;
    const y = sort.k === "title" ? b.title : sort.k === "loc" ? b.loc : +b.deadline;
    return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
  });
  const th = (k: SortKey, label: string) => (
    <button onClick={() => setSort(p => ({ k, dir: p.k === k ? (-p.dir as 1 | -1) : 1 }))} className="inline-flex items-center gap-1.5 text-[11px] font-semibold hover:text-[#1a2942]">
      {label}<ArrowUpDown className="w-3 h-3" aria-hidden />
    </button>
  );
  const tabs: [Tab, string][] = [["all", "All"], ["open", "Open to apply"], ["mine", "My responses"], ["soon", "Closing soon"]];

  return (
    <>
      <PageHeader title="Opportunities" sub="Published tenders and advertisements you can respond to" />
      <div className="p-6 flex flex-col gap-5">
        <Card className="p-5">
          <div role="search" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {([["num", "Number", "RFP*******"], ["kw", "Keywords", "Keywords"], ["ref", "Reference", "Reference"]] as const).map(([k, label, ph]) => (
              <div key={k}>
                <label htmlFor={"f-" + k} className="block text-xs font-medium text-[#1a2942] mb-1">{label}</label>
                <div className="relative">
                  <input id={"f-" + k} className={inputCls() + " pr-9"} placeholder={ph} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
                  <Search className="w-3.5 h-3.5 text-[#888] absolute right-3 top-1/2 -translate-y-1/2" aria-hidden />
                </div>
              </div>
            ))}
            <div>
              <label htmlFor="f-loc" className="block text-xs font-medium text-[#1a2942] mb-1">Location</label>
              <select id="f-loc" className={inputCls()} value={f.loc} onChange={e => setF({ ...f, loc: e.target.value })}>
                <option value="">All Location</option>
                {locs.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <PillTabs label="Opportunity views" value={tab} onChange={setTab} items={tabs.map(([k, label]) => ({ key: k, label, count: filtered.filter(tabOk[k]).length }))} />
          <div className="hidden md:grid grid-cols-[minmax(0,3fr)_1fr_1.3fr_1.3fr_24px] gap-4 px-5 py-2.5 bg-[#f8fafc] text-[11px] font-semibold text-[#999]">
            <span>{th("title", "Tender Position")}</span><span>{th("loc", "Location")}</span><span>{th("deadline", "Deadline for Submission")}</span><span>My status</span><span />
          </div>
          {rows.length === 0 ? <Empty title="No opportunities match">Clear a filter or switch tab to see more.</Empty> : rows.map(o => (
            <button key={o.id} onClick={() => go("opportunities", o.id, "tender")}
              className="w-full text-left grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_1fr_1.3fr_1.3fr_24px] gap-x-4 gap-y-1 items-center px-5 py-4 border-t border-[rgba(0,0,0,0.06)] hover:bg-[#f8fafc] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1cabe2]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold" style={{ color: "#0b6d96" }}>Reference: {o.ref}</p>
                <p className="text-sm font-semibold text-[#1a2942] leading-snug">{o.title}</p>
                <p className="text-xs text-[#888]">{o.no}</p>
              </div>
              <span className="text-sm text-[#333]">{o.loc}</span>
              <div>
                <p className="text-sm text-[#333] tabular-nums">{fmtDate(o.deadline)}</p>
                <p className={`text-xs font-semibold ${closingSoon(o) ? "text-[#b4440c]" : "text-[#888]"}`}>{countdown(o)}</p>
              </div>
              <div><StatusPill status={statusOf(o, s)} /></div>
              <ChevronRight className="w-4 h-4 text-[#bbb] hidden md:block" aria-hidden />
            </button>
          ))}
        </Card>
      </div>
    </>
  );
}
