import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FilePen, MessageSquareWarning } from "lucide-react";
import { OPPS, VENDOR, actionItems, closingSoon, countdown, fmtDate, isClosed, statusOf, useVendor } from "./store";
import { Btn, Card, CardHead, Empty, Nav, PageHeader, StatusPill } from "./ui";

const KIND = {
  clarify: { Icon: MessageSquareWarning, tone: "bg-[#fde6d8] text-[#b4440c]" },
  draft: { Icon: FilePen, tone: "bg-[#e6eaf7] text-[#374ea2]" },
  closing: { Icon: Clock, tone: "bg-[#fff4cf] text-[#8a5a00]" },
};

export default function Dashboard({ go }: { go: Nav }) {
  const s = useVendor();
  const actions = actionItems(s);
  const resp = Object.values(s.resp);
  const open = OPPS.filter(o => !s.resp[o.id] && !isClosed(o)).length;
  const kpis: [string, number, string][] = [
    ["Open to apply", open, "opportunities"],
    ["Drafts", resp.filter(r => r.status === "Draft").length, "applications"],
    ["In review", resp.filter(r => r.status === "Applied" || r.status === "Under Review").length, "applications"],
    ["Awarded", resp.filter(r => r.status === "Awarded").length, "applications"],
  ];
  const soon = OPPS.filter(o => !isClosed(o)).sort((a, b) => +a.deadline - +b.deadline).slice(0, 4);
  const mine = OPPS.filter(o => s.resp[o.id]);

  return (
    <>
      <PageHeader title={`Welcome back, ${VENDOR.name}`} sub={`${VENDOR.company} · Vendor ID ${VENDOR.id}`}
        right={<Btn onClick={() => go("opportunities")}>Browse opportunities <ArrowRight className="w-3.5 h-3.5" /></Btn>} />
      <div className="p-6 flex flex-col gap-6">
        {/* Action needed */}
        <Card className={actions.length ? "border-[#f4c9ae]" : ""}>
          <CardHead title="Action needed" sub={actions.length ? `${actions.length} item${actions.length > 1 ? "s" : ""} waiting on you` : undefined} />
          {actions.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-5 text-sm text-[#1a2942]">
              <CheckCircle2 className="w-5 h-5 text-[#00833d]" aria-hidden /> You are all caught up. Nothing needs your attention.
            </div>
          ) : (
            <ul>
              {actions.map(a => { const { Icon, tone } = KIND[a.kind]; return (
                <li key={a.kind + a.oppId} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 border-[rgba(0,0,0,0.06)]">
                  <span className={`w-9 h-9 rounded-lg grid place-items-center flex-shrink-0 ${tone}`}><Icon className="w-4 h-4" aria-hidden /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a2942] truncate">{a.title}</p>
                    <p className="text-xs text-[#777] truncate">{a.detail}</p>
                  </div>
                  <Btn size="sm" variant={a.kind === "clarify" ? "primary" : "secondary"} onClick={() => go("opportunities", a.oppId, a.tab)}>{a.cta}</Btn>
                </li>); })}
            </ul>
          )}
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(([label, n, target]) => (
            <button key={label} onClick={() => go(target)} className="text-left bg-white rounded-xl border border-[rgba(0,0,0,0.08)] px-5 py-4 hover:border-[#1cabe2] transition-colors focus-visible:outline-2 focus-visible:outline-[#1cabe2]" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <span className="block text-3xl font-bold text-[#1a2942] tabular-nums leading-tight">{n}</span>
              <span className="text-xs text-[#777]">{label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHead title="Closing soon" sub="Published opportunities by deadline" right={<Btn size="sm" variant="ghost" onClick={() => go("opportunities")}>View all</Btn>} />
            <ul>
              {soon.map(o => (
                <li key={o.id}>
                  <button onClick={() => go("opportunities", o.id, "tender")} className="w-full text-left flex items-center gap-3 px-5 py-3.5 border-b last:border-0 border-[rgba(0,0,0,0.06)] hover:bg-[#f8fafc]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1a2942] truncate">{o.title}</p>
                      <p className="text-xs text-[#777]">{o.no} · {o.loc}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-semibold ${closingSoon(o) ? "text-[#b4440c]" : "text-[#555]"}`}>
                        {closingSoon(o) && <AlertTriangle className="inline w-3 h-3 mr-1 -mt-0.5" aria-hidden />}{countdown(o)}
                      </p>
                      <p className="text-[11px] text-[#999]">{fmtDate(o.deadline)}</p>
                    </div>
                    <StatusPill status={statusOf(o, s)} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHead title="My applications" sub="Track every response" right={<Btn size="sm" variant="ghost" onClick={() => go("applications")}>View all</Btn>} />
            {mine.length === 0 ? <Empty title="No applications yet">Open an opportunity and choose Start response.</Empty> : (
              <ul>
                {mine.map(o => (
                  <li key={o.id}>
                    <button onClick={() => go("opportunities", o.id, "response")} className="w-full text-left flex items-center gap-3 px-5 py-3.5 border-b last:border-0 border-[rgba(0,0,0,0.06)] hover:bg-[#f8fafc]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a2942] truncate">{o.title}</p>
                        <p className="text-xs text-[#777]">{o.no}{s.resp[o.id].submittedAt ? ` · submitted ${fmtDate(s.resp[o.id].submittedAt!)}` : " · not submitted"}</p>
                      </div>
                      <StatusPill status={s.resp[o.id].status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
