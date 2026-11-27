import { Fragment, useRef, useState } from "react";
import { CalendarClock, FileText, Globe2, Hash, Paperclip, Send, Timer } from "lucide-react";
import {
  CRITERIA, DOCS, Opp, canEdit, countdown, fmtDate, fmtDateTime, isClosed, addComment, startResponse, statusOf, useVendor, closingSoon,
} from "./store";
import ResponseTab, { HowTo } from "./ResponseTab";
import { Btn, Card, CardHead, Crumbs, Nav, StatusPill, CYAN, inputCls, ok, fail } from "./ui";

const TABS = [["tender", "Tender"], ["response", "Response"], ["clarifications", "Clarifications"], ["history", "History"]] as const;

function TenderTab({ o }: { o: Opp }) {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHead title="Summary" />
        <p className="px-5 py-4 text-sm text-[#333] leading-relaxed max-w-[72ch]">{o.summary}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgba(0,0,0,0.06)] border-t border-[rgba(0,0,0,0.06)]">
          {([["Estimated budget", `${o.cur} ${o.budget}`], ["Tender type", o.type], ["Duration", o.duration]] as const).map(([k, v]) => (
            <div key={k} className="bg-white px-5 py-3.5"><p className="text-[11px] text-[#888]">{k}</p><p className="text-sm font-semibold text-[#1a2942]">{v}</p></div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHead title="Required documents" sub="Prepare these before you start. Mandatory items must be attached to submit." />
        <ul className="divide-y divide-[rgba(0,0,0,0.06)]">
          {o.docs.map(d => (
            <li key={d} className="flex items-start gap-3 px-5 py-3">
              <FileText className="w-4 h-4 mt-0.5 text-[#999] flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#1a2942]">{DOCS[d].label}</p><p className="text-xs text-[#888]">{DOCS[d].hint}</p></div>
              <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${DOCS[d].mandatory ? "bg-[#fde6d8] text-[#b4440c]" : "bg-[#eef1f5] text-[#5c7490]"}`}>{DOCS[d].mandatory ? "Mandatory" : "Optional"}</span>
            </li>))}
        </ul>
      </Card>
      <Card>
        <CardHead title="Evaluation criteria" sub="The Hiring Manager decides the award manually using these parameters." />
        <ul className="px-5 py-4 flex flex-col gap-3">
          {CRITERIA.map(([k, w]) => (
            <li key={k} className="grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-center gap-3 text-xs">
              <span className="text-[#1a2942] font-medium">{k}</span><span className="text-[#555] tabular-nums">{w}%</span>
              <div className="h-1.5 bg-[#e8eff7] rounded-full overflow-hidden"><div className="h-full" style={{ width: `${w * 2}%`, backgroundColor: CYAN }} /></div>
            </li>))}
        </ul>
      </Card>
    </div>
  );
}

function Clarifications({ o }: { o: Opp }) {
  const s = useVendor();
  const r = s.resp[o.id];
  const list = r ? r.comments : s.pre[o.id] || [];
  const [text, setText] = useState("");
  const [file, setFile] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const send = () => { if (!text.trim()) return fail("Write a comment first"); addComment(o.id, text.trim(), file); setText(""); setFile(undefined); ok("Comment sent"); };
  return (
    <Card>
      <CardHead title="Clarifications" sub="Ask the Hiring Manager a question or reply to a request. Comments stay open for the whole process." />
      {r?.status === "Need Clarification" && (
        <div className="mx-5 mt-4 rounded-lg border border-[#f4c9ae] bg-[#fff3ec] px-4 py-3 text-xs text-[#9a3a08] flex items-center gap-3 flex-wrap" role="status">
          <span>The Hiring Manager is waiting for your reply{r.replyBy ? ` by ${fmtDate(r.replyBy)}` : ""}.</span>
        </div>
      )}
      <div className="px-5 py-4 flex flex-col gap-3">
        {list.length === 0 && <p className="text-xs text-[#888] py-4">No messages yet.</p>}
        {list.map(c => (
          <div key={c.id} className={`max-w-[80%] rounded-xl px-4 py-2.5 border ${c.by === "vendor" ? "self-end bg-[#e9f6fc] border-transparent" : "self-start bg-white border-[rgba(0,0,0,0.1)]"}`}>
            <p className="text-[11px] font-bold text-[#1a2942]">{c.by === "vendor" ? "You" : "Hiring Manager"}</p>
            <p className="text-sm text-[#333] whitespace-pre-wrap break-words">{c.text}</p>
            {c.file && <p className="text-xs mt-1 text-[#0b6d96] flex items-center gap-1"><Paperclip className="w-3 h-3" aria-hidden />{c.file}</p>}
            <p className="text-[10px] text-[#999] mt-1">{fmtDateTime(c.at)}</p>
          </div>))}
      </div>
      <div className="px-5 pb-5 border-t border-[rgba(0,0,0,0.06)] pt-4">
        <label htmlFor="cmt" className="block text-xs font-medium text-[#1a2942] mb-1">Add a comment</label>
        <textarea id="cmt" rows={3} className={inputCls() + " resize-y"} placeholder="Type your question or reply" value={text} onChange={e => setText(e.target.value)} />
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <input ref={fileRef} type="file" className="sr-only" id="cmt-file" onChange={e => setFile(e.target.files?.[0]?.name)} />
          <Btn variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Paperclip className="w-3 h-3" aria-hidden />Attach file</Btn>
          {file && <span className="text-xs text-[#555]">{file}</span>}
          <Btn className="ml-auto" onClick={send}><Send className="w-3.5 h-3.5" aria-hidden />Send comment</Btn>
        </div>
      </div>
    </Card>
  );
}

function History({ o }: { o: Opp }) {
  const r = useVendor().resp[o.id];
  return (
    <Card>
      <CardHead title="History" sub="Every action on this opportunity" />
      {!r ? <p className="px-5 py-8 text-xs text-[#888]">No activity yet. Your actions will be listed here.</p> : (
        <ol className="px-6 py-5 border-l-2 border-[#e1e8f0] ml-6 my-2">
          {[...r.history].reverse().map((h, i) => (
            <li key={i} className="relative pl-5 pb-5 last:pb-0">
              <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: CYAN }} aria-hidden />
              <time className="block text-[11px] text-[#888]">{fmtDateTime(h.at)}</time><span className="text-sm text-[#1a2942]">{h.text}</span>
            </li>))}
        </ol>)}
    </Card>
  );
}

export default function OpportunityDetail({ o, tab, go }: { o: Opp; tab: string; go: Nav }) {
  const s = useVendor();
  const r = s.resp[o.id];
  const st = statusOf(o, s);
  const t = TABS.some(x => x[0] === tab) ? tab : "tender";
  const needs = r?.status === "Need Clarification";

  let cta: React.ReactNode;
  let hint = "";
  if (!r) cta = <Btn className="w-full" disabled={isClosed(o)} onClick={() => { startResponse(o.id); go("opportunities", o.id, "response"); }}>{isClosed(o) ? "Closed" : "Start response"}</Btn>;
  else if (r.status === "Draft") cta = <Btn className="w-full" onClick={() => go("opportunities", o.id, "response")}>Continue response</Btn>;
  else if (needs) { cta = <Btn className="w-full" onClick={() => go("opportunities", o.id, "response")}>Update response</Btn>; hint = "Editing is open again because the Hiring Manager asked for clarification."; }
  else { cta = <Btn className="w-full" disabled>{r.status === "Applied" ? "Applied" : r.status}</Btn>; hint = "Editing is locked. Use Clarifications to message the Hiring Manager."; }

  const meta: [React.ReactNode, string, string][] = [
    [<CalendarClock key="a" className="w-3.5 h-3.5" aria-hidden />, "Deadline", fmtDate(o.deadline)],
    [<Timer key="b" className="w-3.5 h-3.5" aria-hidden />, "Published", fmtDate(o.published)],
    [<Globe2 key="c" className="w-3.5 h-3.5" aria-hidden />, "Beneficiary Country/Territory", o.loc],
    [<Hash key="d" className="w-3.5 h-3.5" aria-hidden />, "Reference", o.ref],
    [<FileText key="e" className="w-3.5 h-3.5" aria-hidden />, "Number", o.no],
  ];

  return (
    <div className="px-8 pt-5 pb-6">
      <Crumbs items={[{ label: "Opportunities", onClick: () => go("opportunities") }, { label: o.no }]} />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
        <div className="min-w-0">
          <div className="flex items-start gap-3 flex-wrap mb-4">
            <h1 className="text-xl font-bold text-[#1a2942] leading-snug flex-1 min-w-[260px]">{o.title}</h1>
            <StatusPill status={st} />
          </div>
          <div role="tablist" className="flex gap-1 border-b border-[rgba(0,0,0,0.1)] mb-5 overflow-x-auto overflow-y-hidden no-scrollbar">
            {TABS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={t === k} onClick={() => go("opportunities", o.id, k)}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide -mb-px border-b-[3px] whitespace-nowrap"
                style={{ color: t === k ? "#1a2942" : "#0b6d96", borderColor: t === k ? CYAN : "transparent" }}>
                {label}{k === "clarifications" && needs && <span className="ml-1.5 rounded-full bg-[#e87a1e] text-white text-[10px] px-1.5 py-0.5">1</span>}
              </button>))}
          </div>
          {t === "tender" && <TenderTab o={o} />}
          {t === "response" && <ResponseTab o={o} r={r} go={go} />}
          {t === "clarifications" && <Clarifications o={o} />}
          {t === "history" && <History o={o} />}
        </div>

        <aside className="lg:sticky lg:top-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-[#1a2942] mb-3">Opportunity Overview</h2>
            <div className={`rounded-lg px-3 py-2.5 mb-4 ${closingSoon(o) ? "bg-[#fff4cf] text-[#7a5200]" : "bg-[#eef6fb] text-[#0b5878]"}`}>
              <p className="text-[11px]">Time remaining</p><p className="text-sm font-bold">{countdown(o)}</p>
            </div>
            <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-y-2.5 gap-x-3 text-xs mb-4">
              {meta.map(([ic, k, v]) => (<Fragment key={k}><dt className="text-[#888] flex items-center gap-1.5">{ic}{k}</dt><dd className="font-medium text-[#1a2942] text-right tabular-nums">{v}</dd></Fragment>))}
            </dl>
            {cta}
            {hint && <p className="text-[11px] text-[#888] mt-2.5">{hint}</p>}
          </Card>
          {t === "response" && canEdit(r) && <HowTo />}
        </aside>
      </div>
    </div>
  );
}
