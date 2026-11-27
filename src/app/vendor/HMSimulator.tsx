import { useState } from "react";
import { UserCog, X } from "lucide-react";
import { HMAction, OPPS, hmAct, resetDemo, useVendor } from "./store";
import { Btn, inputCls, ok, fail } from "./ui";

export default function HMSimulator({ currentOpp }: { currentOpp: string | null }) {
  const s = useVendor();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState("");
  const [msg, setMsg] = useState("");
  const list = OPPS.filter(o => s.resp[o.id] && s.resp[o.id].status !== "Draft");
  const id = list.some(o => o.id === sel) ? sel : list.some(o => o.id === currentOpp) ? currentOpp! : list[0]?.id || "";
  const run = (a: HMAction, label: string) => { if (a === "comment" && !msg.trim()) return fail("Type a message first"); hmAct(id, a, msg); if (a === "clarify" || a === "comment") setMsg(""); ok(label); };
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[360px] max-w-[calc(100vw-2.5rem)] bg-white rounded-xl border border-[rgba(0,0,0,0.12)] shadow-2xl p-4">
          <div className="flex items-start justify-between"><div><h2 className="text-sm font-bold text-[#1a2942]">Hiring Manager simulator</h2>
            <p className="text-xs text-[#888] mt-0.5 mb-3">Prototype only. Move a submitted response through review and award, then watch the vendor view update.</p></div>
            <button onClick={() => setOpen(false)} aria-label="Close simulator" className="p-1 text-[#888]"><X className="w-4 h-4" /></button></div>
          {list.length === 0 ? <p className="text-xs text-[#555]">No submitted responses yet. Submit one first.</p> : (
            <>
              <label htmlFor="hm-opp" className="sr-only">Opportunity</label>
              <select id="hm-opp" className={inputCls() + " mb-2"} value={id} onChange={e => setSel(e.target.value)}>{list.map(o => <option key={o.id} value={o.id}>{o.no} · {s.resp[o.id].status}</option>)}</select>
              <label htmlFor="hm-msg" className="sr-only">Message</label>
              <textarea id="hm-msg" rows={3} className={inputCls() + " mb-3 resize-y"} placeholder="Message to vendor (used for clarification or comment)" value={msg} onChange={e => setMsg(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" variant="secondary" onClick={() => run("review", "Marked Under Review")}>Under review</Btn>
                <Btn size="sm" variant="secondary" onClick={() => run("clarify", "Clarification requested")}>Request clarification</Btn>
                <Btn size="sm" variant="secondary" onClick={() => run("comment", "Comment posted")}>Post comment</Btn>
                <Btn size="sm" onClick={() => run("award", "Awarded, contract created")}>Award</Btn>
                <Btn size="sm" variant="secondary" onClick={() => run("reject", "Marked Not Awarded")}>Not awarded</Btn>
              </div>
            </>)}
          <button onClick={() => { resetDemo(); ok("Demo data reset"); }} className="mt-3 text-xs text-[#0b6d96] underline">Reset demo data</button>
        </div>)}
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-center gap-2 rounded-full bg-[#1a2942] text-white text-xs font-semibold px-4 py-2.5 shadow-lg hover:opacity-90">
        <UserCog className="w-4 h-4" aria-hidden />Simulate Hiring Manager
      </button>
    </div>
  );
}
