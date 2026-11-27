import { useState } from "react";
import { OPPS, Status, fmtDate, money, useVendor } from "./store";
import { Btn, Card, Empty, Nav, PageHeader, PillTabs, StatusPill } from "./ui";

const GROUPS: [string, Status[]][] = [
  ["All", []], ["Draft", ["Draft"]], ["Submitted", ["Applied", "Under Review"]],
  ["Need clarification", ["Need Clarification"]], ["Decided", ["Awarded", "Not Awarded"]],
];

export default function MyApplications({ go }: { go: Nav }) {
  const s = useVendor();
  const [g, setG] = useState(0);
  const all = OPPS.filter(o => s.resp[o.id]);
  const rows = all.filter(o => !GROUPS[g][1].length || GROUPS[g][1].includes(s.resp[o.id].status));
  return (
    <>
      <PageHeader title="My Applications" sub="Every response you started, with its review status" right={<Btn variant="secondary" onClick={() => go("opportunities")}>Browse opportunities</Btn>} />
      <div className="p-6">
        <Card>
          <PillTabs label="Application status" value={String(g)} onChange={k => setG(Number(k))}
            items={GROUPS.map(([label, sts], i) => ({ key: String(i), label, count: all.filter(o => !sts.length || sts.includes(s.resp[o.id].status)).length }))} />
          {rows.length === 0 ? <Empty title="Nothing here yet">Start a response from an opportunity and it will appear in this list.</Empty> : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                <thead><tr className="bg-[#f8fafc]">{["Opportunity", "Reference", "Submitted", "Offer", "Status", ""].map(h => <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-[#999] whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map(o => { const r = s.resp[o.id]; return (
                    <tr key={o.id} className="border-t border-[rgba(0,0,0,0.06)] hover:bg-[#f8fafc]">
                      <td className="px-5 py-3.5 max-w-[360px]"><p className="text-sm font-semibold text-[#1a2942]">{o.title}</p><p className="text-xs text-[#888]">{o.no}</p></td>
                      <td className="px-5 py-3.5 text-xs text-[#555] whitespace-nowrap">{r.ref || "Not submitted"}</td>
                      <td className="px-5 py-3.5 text-xs text-[#555] whitespace-nowrap">{r.submittedAt ? fmtDate(r.submittedAt) : "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-[#555] whitespace-nowrap tabular-nums">{r.price ? `${r.currency} ${money(r.price)}` : "—"}</td>
                      <td className="px-5 py-3.5"><StatusPill status={r.status} /></td>
                      <td className="px-5 py-3.5 text-right"><Btn size="sm" variant={r.status === "Need Clarification" ? "primary" : "secondary"}
                        onClick={() => go("opportunities", o.id, r.status === "Need Clarification" ? "clarifications" : r.status === "Draft" ? "response" : "tender")}>
                        {r.status === "Need Clarification" ? "Respond" : r.status === "Draft" ? "Continue" : "Open"}</Btn></td>
                    </tr>); })}
                </tbody>
              </table>
            </div>)}
        </Card>
      </div>
    </>
  );
}
