import { fmtDate, money, oppById, useVendor } from "./store";
import { Card, Empty, PageHeader } from "./ui";

export default function Contracts() {
  const s = useVendor();
  return (
    <>
      <PageHeader title="My Contracts" sub="View and manage your contracts easily" />
      <div className="p-6">
        <Card>
          {s.contracts.length === 0 ? <Empty title="No contracts yet">When a Hiring Manager awards you an opportunity, the contract appears here.</Empty> : (
            <table className="w-full"><thead><tr className="bg-[#f8fafc]">{["Contract", "Opportunity", "Value", "Start date"].map(h => <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-[#999]">{h}</th>)}</tr></thead>
              <tbody>{s.contracts.map(c => <tr key={c.no} className="border-t border-[rgba(0,0,0,0.06)]"><td className="px-5 py-3 text-sm font-semibold text-[#1a2942]">{c.no}</td><td className="px-5 py-3 text-sm">{oppById(c.opp)?.title}</td><td className="px-5 py-3 text-sm tabular-nums">{c.cur} {money(c.value)}</td><td className="px-5 py-3 text-sm">{fmtDate(c.start)}</td></tr>)}</tbody></table>)}
        </Card>
      </div>
    </>
  );
}
