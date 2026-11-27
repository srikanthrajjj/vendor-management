import { fmtDateTime, markAllRead, useVendor } from "./store";
import { Btn, Card, Empty, Nav, PageHeader } from "./ui";

export default function Notifications({ go }: { go: Nav }) {
  const s = useVendor();
  return (
    <>
      <PageHeader title="My Notifications" sub="Status changes and Hiring Manager comments" right={<Btn size="sm" variant="secondary" disabled={!s.notes.some(n => !n.read)} onClick={markAllRead}>Mark all read</Btn>} />
      <div className="p-6">
        <Card>
          {s.notes.length === 0 ? <Empty title="You are all caught up" /> : s.notes.map(n => (
            <button key={n.id} onClick={() => go("opportunities", n.opp, n.tab)} className="w-full text-left flex items-center gap-3 px-5 py-3.5 border-b last:border-0 border-[rgba(0,0,0,0.06)] hover:bg-[#f8fafc]">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${n.read ? "bg-transparent" : "bg-[#1cabe2]"}`} aria-label={n.read ? "Read" : "Unread"} />
              <div className="flex-1"><p className={`text-sm ${n.read ? "text-[#555]" : "font-semibold text-[#1a2942]"}`}>{n.text}</p><p className="text-xs text-[#999]">{fmtDateTime(n.at)}</p></div>
            </button>))}
        </Card>
      </div>
    </>
  );
}
