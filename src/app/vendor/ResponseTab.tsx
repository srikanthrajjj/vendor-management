import { useRef, useState } from "react";
import { Check, ChevronDown, FileText, Paperclip, Upload, X, AlertCircle } from "lucide-react";
import {
  DOCS, CRITERIA, VENDOR, countdown, Opp, Resp, CURRENCIES, canEdit, checklist, fmtDate, fmtDateTime, fmtSize, isClosed, money,
  removeDoc, saveDraft, setDoc, startResponse, submitResponse, updateResp,
} from "./store";
import { Btn, Card, CardHead, Field, Nav, inputCls, CYAN, ok, fail } from "./ui";

const STEPS = ["Requirements", "Details", "Documents", "Review & submit"];
const ALLOWED = /\.(pdf|docx?|xlsx?|zip|png|jpe?g)$/i;

/* Progress tracker shared by editable and read-only views */
export function Tracker({ r }: { r: Resp }) {
  const idx = { Draft: 0, Applied: 1, "Under Review": 2, "Need Clarification": 2, Awarded: 3, "Not Awarded": 3 }[r.status];
  const labels = ["Draft", "Submitted", "Under review", "Decision"];
  return (
    <ol aria-label="Response progress" className="grid grid-cols-2 md:grid-cols-4 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden mb-4">
      {labels.map((l, i) => {
        let state: "done" | "now" | "warn" | "bad" | "todo" = i < idx ? "done" : i === idx ? "now" : "todo";
        let label = l;
        if (i === idx && r.status === "Need Clarification") { state = "warn"; label = "Clarification needed"; }
        if (i === idx && r.status === "Applied") { state = "done"; }
        if (r.status === "Applied" && i === 2) { state = "now"; label = "Awaiting review"; }
        if (i === idx && r.status === "Awarded") { state = "done"; label = "Awarded"; }
        if (i === idx && r.status === "Not Awarded") { state = "bad"; label = "Not selected"; }
        const dot = { done: "bg-[#00833d] border-[#00833d] text-white", now: "border-[#1cabe2] text-[#0b6d96]", warn: "border-[#e87a1e] bg-[#fde6d8] text-[#b4440c]", bad: "bg-[#b3261e] border-[#b3261e] text-white", todo: "border-[#d5dde6] text-[#999]" }[state];
        return (
          <li key={l} className={`flex items-center gap-2.5 px-4 py-3 text-xs border-r last:border-0 border-[rgba(0,0,0,0.06)] ${state === "todo" ? "text-[#999]" : "text-[#1a2942] font-semibold"}`}>
            <span className={`w-5 h-5 rounded-full border-2 grid place-items-center text-[10px] font-bold flex-shrink-0 ${dot}`}>
              {state === "done" ? <Check className="w-3 h-3" aria-hidden /> : state === "warn" ? "!" : state === "bad" ? "×" : i + 1}
            </span>{label}
          </li>
        );
      })}
    </ol>
  );
}

function Stepper({ step, setStep, done }: { step: number; setStep: (n: number) => void; done: boolean[] }) {
  return (
    <ol className="flex items-center gap-2 mb-5 flex-wrap">
      {STEPS.map((l, i) => (
        <li key={l} className="flex items-center gap-2">
          <button onClick={() => setStep(i)} aria-current={step === i ? "step" : undefined}
            className={`flex items-center gap-2 rounded-full pl-1 pr-3.5 py-1 text-xs font-semibold border transition-colors ${step === i ? "bg-white border-[#1cabe2] text-[#1a2942]" : "bg-transparent border-transparent text-[#777] hover:text-[#1a2942]"}`}>
            <span className={`w-6 h-6 rounded-full grid place-items-center text-[11px] ${done[i] && step !== i ? "bg-[#00833d] text-white" : step === i ? "text-white" : "bg-[#e3e9f0] text-[#5c7490]"}`} style={step === i ? { backgroundColor: CYAN } : undefined}>
              {done[i] && step !== i ? <Check className="w-3 h-3" aria-hidden /> : i + 1}
            </span>{l}
          </button>
          {i < STEPS.length - 1 && <span className="w-6 h-px bg-[#d5dde6]" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

/* Read-only summary used on Review step and after submission */
function Summary({ o, r, onEdit }: { o: Opp; r: Resp; onEdit?: (step: number) => void }) {
  const row = (k: string, v: string) => (<><dt className="text-[#888]">{k}</dt><dd className="font-medium text-[#1a2942] break-words">{v || "—"}</dd></>);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-[#1a2942]">Proposal details</h3>
          {onEdit && <Btn size="sm" variant="ghost" onClick={() => onEdit(1)}>Edit</Btn>}
        </div>
        <dl className="grid grid-cols-[170px_minmax(0,1fr)] gap-y-2 text-xs">
          {row("Total offered price", r.price ? `${r.currency} ${money(r.price)}` : "")}
          {row("Offer validity", r.validity ? `${r.validity} days` : "")}
          {row("Delivery period", r.period)}
          {row("Cover note", r.note)}
        </dl>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-[#1a2942]">Documents</h3>
          {onEdit && <Btn size="sm" variant="ghost" onClick={() => onEdit(2)}>Edit</Btn>}
        </div>
        <ul className="text-xs divide-y divide-[rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.08)] rounded-lg">
          {o.docs.map(d => { const f = r.docs[d]; return (
            <li key={d} className="flex items-center gap-3 px-3 py-2.5">
              <FileText className="w-4 h-4 text-[#999] flex-shrink-0" aria-hidden />
              <span className="flex-1 min-w-0"><span className="font-semibold text-[#1a2942]">{DOCS[d].label}</span>{!DOCS[d].mandatory && <span className="text-[#999]"> (optional)</span>}</span>
              {f ? <span className="text-[#555] break-all text-right">{f.name} · {fmtSize(f.size)}</span> : <span className={DOCS[d].mandatory ? "text-red-600 font-semibold" : "text-[#aaa]"}>{DOCS[d].mandatory ? "Missing" : "Not attached"}</span>}
            </li>); })}
        </ul>
      </div>
    </div>
  );
}


/* Step 1: what you need before you start */
function Requirements({ o }: { o: Opp }) {
  const mand = o.docs.filter(d => DOCS[d].mandatory), opt = o.docs.filter(d => !DOCS[d].mandatory);
  return (
    <>
      <CardHead title="Before you start" sub="About 15 minutes. Have these ready, or save a draft and come back." />
      <div className="p-5 flex flex-col gap-5">
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          {([["Deadline", `${fmtDate(o.deadline)} · ${countdown(o)}`], ["Estimated budget", `${o.cur} ${o.budget}`], ["Delivery", o.duration]] as const).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-[#f4f9fc] px-3.5 py-2.5"><p className="text-[#888]">{k}</p><p className="font-semibold text-[#1a2942]">{v}</p></div>))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1a2942] mb-2">You will need</h3>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {mand.map(d => <li key={d} className="flex items-start gap-2 text-xs text-[#333]"><FileText className="w-3.5 h-3.5 mt-0.5 text-[#1cabe2] flex-shrink-0" aria-hidden /><span><b>{DOCS[d].label}</b><br /><span className="text-[#888]">{DOCS[d].hint}</span></span></li>)}
          </ul>
          {opt.length > 0 && <p className="text-xs text-[#888] mt-3">Optional: {opt.map(d => DOCS[d].label).join(", ")}.</p>}
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1a2942] mb-2">How you will be evaluated</h3>
          <div className="flex gap-2 flex-wrap">{CRITERIA.map(([k, w]) => <span key={k} className="rounded-full bg-[#eef2f8] px-3 py-1 text-xs text-[#1a2942]"><b>{w}%</b> {k}</span>)}</div>
        </div>
      </div>
    </>
  );
}

/* Shown in the right rail while a response can be edited */
export function HowTo() {
  return (
    <Card className="p-5 mt-4">
      <h2 className="text-sm font-bold text-[#1a2942] mb-2">How to attach &amp; submit documents</h2>
      <ol className="list-decimal pl-4 text-xs text-[#555] flex flex-col gap-1.5">
        <li>Review the required documents on the Requirements step.</li>
        <li>Fill in your proposal details.</li>
        <li>Upload each document with its Upload button, or drag a file onto its row (max 10 MB).</li>
        <li>Save the draft any time and return later.</li>
        <li>Check the Review step, then submit.</li>
        <li>You can replace any document before submitting.</li>
      </ol>
    </Card>
  );
}

export default function ResponseTab({ o, r, go }: { o: Opp; r?: Resp; go: Nav }) {
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [agree, setAgree] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const fileRef = useRef<Record<string, HTMLInputElement | null>>({});

  if (!r) {
    return (
      <Card>
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-semibold text-[#1a2942]">You have not started a response yet</p>
          <p className="text-xs text-[#888] mt-1 mb-4">Starting creates a draft you can save and finish later.</p>
          <Btn disabled={isClosed(o)} onClick={() => { startResponse(o.id); setStep(0); }}>{isClosed(o) ? "Closed" : "Start response"}</Btn>
        </div>
      </Card>
    );
  }

  const checks = checklist(o, r);
  const failing = checks.filter(c => !c.ok);
  const edit = canEdit(r);
  const detailsOk = checks.filter(c => c.step === 1).every(c => c.ok);
  const docsOk = checks.filter(c => c.step === 2).every(c => c.ok);
  const bad = (k: string, msg: string) => (touched[k] && !checks.find(c => c.key === k)?.ok ? msg : undefined);
  const set = (p: Parameters<typeof updateResp>[1]) => { updateResp(o.id, p); setSavedAt(new Date().toISOString()); };
  const reqDocs = o.docs.filter(d => DOCS[d].mandatory);
  const have = reqDocs.filter(d => r.docs[d]).length;

  function pick(d: string, file?: File) {
    if (!file) return;
    if (file.size > 10 * 1048576) return fail("File is larger than 10 MB");
    if (!ALLOWED.test(file.name)) return fail("Unsupported file type. Use PDF, Word, Excel, ZIP or an image.");
    setDoc(o.id, d, { name: file.name, size: file.size }); setSavedAt(new Date().toISOString());
    ok(`${DOCS[d].label} uploaded`);
  }
  function submit() {
    const ref = submitResponse(o.id);
    ok(`Your response has been submitted. Reference: ${ref}. The Hiring Manager will review it and may contact you through Clarifications.`, 9000);
    setAgree(false); setStep(0);
  }

  const banner = {
    Draft: ["border-[#bfe6f6] bg-[#eef9fd] text-[#0b5878]", `Draft. Not yet submitted${savedAt ? ` · saved ${fmtDateTime(savedAt)}` : ""}. Changes are saved as you type.`],
    Applied: ["border-[#cfd6ef] bg-[#f0f3fb] text-[#2d3f86]", `Submitted on ${r.submittedAt ? fmtDateTime(r.submittedAt) : ""} · Reference ${r.ref}. Editing is locked unless the Hiring Manager requests clarification.`],
    "Under Review": ["border-[#f1de9b] bg-[#fffaea] text-[#7a5200]", "Your response is under review. Editing is locked. Use Clarifications to ask a question."],
    "Need Clarification": ["border-[#f4c9ae] bg-[#fff3ec] text-[#9a3a08]", `The Hiring Manager needs clarification${r.replyBy ? ` by ${fmtDate(r.replyBy)}` : ""}. Read Clarifications, update your response, then resubmit.`],
    Awarded: ["border-[#bfe3cf] bg-[#effaf3] text-[#00693a]", "Congratulations. This opportunity was awarded to you. Your contract is in My Contracts."],
    "Not Awarded": ["border-[#f2c6c2] bg-[#fdf1f0] text-[#9c1f18]", "Thank you for applying. Your proposal was not selected for this opportunity."],
  }[r.status];

  return (
    <div className="flex flex-col">
      <Tracker r={r} />
      <div className={`rounded-lg border px-4 py-3 text-xs mb-4 flex gap-2 items-start ${banner[0]}`} role="status">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden /><span>{banner[1]}</span>
        {r.status === "Need Clarification" && <button className="ml-auto font-semibold underline whitespace-nowrap" onClick={() => go("opportunities", o.id, "clarifications")}>Open clarifications</button>}
      </div>

      {!edit ? (
        <Card><CardHead title="Your submitted response" sub={r.ref ? `Reference ${r.ref}` : undefined} /><div className="p-5"><Summary o={o} r={r} /></div></Card>
      ) : (
        <>
          <Stepper step={step} setStep={setStep} done={[true, detailsOk, docsOk, false]} />


          <Card className="mb-4">
            {step === 0 && <Requirements o={o} />}

            {step === 1 && (
              <>
                <CardHead title="Proposal details" sub="Fields marked * are required." />
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <Field label="Total offered price" required htmlFor="r-price" error={bad("price", "Enter a price greater than 0.")}>
                    <input id="r-price" type="number" min="0" inputMode="decimal" className={inputCls(!!bad("price", "x"))} value={r.price}
                      onBlur={() => setTouched(t => ({ ...t, price: true }))} onChange={e => set({ price: e.target.value })} />
                  </Field>
                  <Field label="Currency" htmlFor="r-cur">
                    <select id="r-cur" className={inputCls()} value={r.currency} onChange={e => set({ currency: e.target.value })}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
                  </Field>
                  <Field label="Offer validity (days)" required htmlFor="r-val" error={bad("validity", "Enter how many days your offer is valid.")}>
                    <input id="r-val" type="number" min="1" className={inputCls(!!bad("validity", "x"))} value={r.validity}
                      onBlur={() => setTouched(t => ({ ...t, validity: true }))} onChange={e => set({ validity: e.target.value })} />
                  </Field>
                  <Field label="Delivery / implementation period" htmlFor="r-per">
                    <input id="r-per" className={inputCls()} placeholder="e.g. 12 weeks" value={r.period} onChange={e => set({ period: e.target.value })} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Cover note" required htmlFor="r-note" error={bad("note", "Add a short cover note.")}>
                      <textarea id="r-note" rows={5} className={inputCls(!!bad("note", "x")) + " resize-y"} placeholder="Summarise your offer and why you are a good fit."
                        value={r.note} onBlur={() => setTouched(t => ({ ...t, note: true }))} onChange={e => set({ note: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <CardHead title="Document upload" sub="Attach each required document. PDF, Word, Excel, ZIP or image, up to 10 MB."
                  right={<div className="text-right text-xs"><span className="font-semibold text-[#1a2942]">{have} of {reqDocs.length}</span> <span className="text-[#888]">mandatory attached</span>
                    <div className="h-1.5 w-36 bg-[#e8eff7] rounded-full mt-1.5 overflow-hidden"><div className="h-full" style={{ width: `${reqDocs.length ? (have / reqDocs.length) * 100 : 0}%`, backgroundColor: CYAN }} /></div></div>} />
                <div className="p-5 flex flex-col gap-3">
                  {o.docs.map(d => { const def = DOCS[d], f = r.docs[d]; return (
                    <div key={d}
                      onDragOver={e => { e.preventDefault(); setDrag(d); }} onDragLeave={() => setDrag(null)}
                      onDrop={e => { e.preventDefault(); setDrag(null); pick(d, e.dataTransfer.files[0]); }}
                      className={`grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_auto] gap-3 items-center rounded-lg border-[1.5px] border-dashed px-4 py-3 ${drag === d ? "border-[#1cabe2] bg-[#eef9fd]" : "border-[rgba(0,0,0,0.14)]"}`}>
                      <div>
                        <p className="text-sm font-semibold text-[#1a2942]">{def.label} <span className={`ml-1 text-[10px] rounded-full px-2 py-0.5 ${def.mandatory ? "bg-[#fde6d8] text-[#b4440c]" : "bg-[#eef1f5] text-[#5c7490]"}`}>{def.mandatory ? "Mandatory" : "Optional"}</span></p>
                        <p className="text-xs text-[#888] mt-0.5">{def.hint}</p>
                      </div>
                      <div className="text-xs min-w-0">
                        {f ? <div className="flex items-start gap-2"><FileText className="w-4 h-4 mt-px flex-shrink-0" style={{ color: CYAN }} aria-hidden /><span className="min-w-0"><b className="text-[#1a2942] break-all">{f.name}</b><br /><span className="text-[#888]">{fmtSize(f.size)} · {fmtDateTime(f.at)}</span></span></div>
                          : <span className="text-[#999]">Drop a file here or use Upload</span>}
                      </div>
                      <div className="flex gap-2 flex-wrap md:justify-end">
                        <input ref={el => { fileRef.current[d] = el; }} type="file" className="sr-only" id={"u-" + d} accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg" onChange={e => { pick(d, e.target.files?.[0]); e.target.value = ""; }} />
                        <Btn size="sm" variant="secondary" onClick={() => fileRef.current[d]?.click()}><Upload className="w-3 h-3" aria-hidden />{f ? "Replace" : "Upload"}</Btn>
                        {!f && def.profileFile && <Btn size="sm" variant="ghost" onClick={() => { setDoc(o.id, d, { name: def.profileFile!, size: 500000 }); ok(`${def.label} attached from your profile`); }}>Use from profile</Btn>}
                        {f && <Btn size="sm" variant="ghost" aria-label={`Remove ${def.label}`} onClick={() => removeDoc(o.id, d)}><X className="w-3 h-3" aria-hidden />Remove</Btn>}
                      </div>
                    </div>); })}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <CardHead title="Review & submit" sub="Check everything before you submit. You can go back to change any part." />
                <div className="p-5 flex flex-col gap-6">
                  <div className={`rounded-lg border px-4 py-3 ${failing.length ? "border-[#f4c9ae] bg-[#fff8f3]" : "border-[#bfe3cf] bg-[#effaf3]"}`}>
                    <p className={`text-xs font-bold mb-2 ${failing.length ? "text-[#9a3a08]" : "text-[#00693a]"}`}>{failing.length ? `${failing.length} item${failing.length > 1 ? "s" : ""} to complete before you can submit` : "Everything required is complete"}</p>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      {checks.map(c => (
                        <li key={c.key} className="flex items-center gap-2 text-xs">
                          <span className={`w-4 h-4 rounded-full grid place-items-center flex-shrink-0 ${c.ok ? "bg-[#00833d] text-white" : "bg-[#fde6d8] text-[#b4440c]"}`}>{c.ok ? <Check className="w-2.5 h-2.5" aria-hidden /> : <X className="w-2.5 h-2.5" aria-hidden />}</span>
                          <span className={c.ok ? "text-[#555]" : "text-[#1a2942] font-semibold"}>{c.label}</span>
                          {!c.ok && <button className="underline text-[#0b6d96] ml-auto" onClick={() => { setTouched(t => ({ ...t, [c.key]: true })); setStep(c.step); }}>Fix</button>}
                        </li>))}
                    </ul>
                  </div>
                  <Summary o={o} r={r} onEdit={setStep} />
                  <label className="flex items-start gap-2.5 text-xs text-[#444] cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-[#1cabe2] w-4 h-4" checked={agree} onChange={e => setAgree(e.target.checked)} />
                    <span>I confirm the information and documents are accurate and that I am authorised to submit this response on behalf of {" "}<b>{VENDOR.company}</b>.</span>
                  </label>
                </div>
              </>
            )}
          </Card>

          {/* Sticky action bar */}
          <div className="sticky bottom-4 px-5 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] flex items-center gap-3 flex-wrap z-10" style={{ boxShadow: "0 4px 18px rgba(20,90,140,0.14)" }}>
            <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Btn>
            <span className="text-xs text-[#888] mr-auto" aria-live="polite">{savedAt ? `Saved ${fmtDateTime(savedAt)}` : "Changes are saved as you type"}</span>
            <Btn variant="secondary" onClick={() => { saveDraft(o.id); setSavedAt(new Date().toISOString()); ok("Draft saved"); }}>Save draft</Btn>
            {step < 3
              ? <Btn onClick={() => { if (step === 1) setTouched(t => ({ ...t, price: true, validity: true, note: true })); setStep(step + 1); }}>{step === 0 ? "Start my response" : "Next"}</Btn>
              : <Btn disabled={failing.length > 0 || !agree} onClick={submit}>{r.status === "Need Clarification" ? "Resubmit response" : "Submit response"}</Btn>}
          </div>
        </>
      )}
    </div>
  );
}
