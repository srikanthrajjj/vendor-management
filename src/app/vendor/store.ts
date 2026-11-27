import { useSyncExternalStore } from "react";

/* ───────── Types ───────── */
export type Status =
  | "Available" | "Draft" | "Applied" | "Under Review"
  | "Need Clarification" | "Awarded" | "Not Awarded" | "Closed";
export type RespStatus = Exclude<Status, "Available" | "Closed">;

export type DocDef = { label: string; mandatory: boolean; hint: string; profileFile?: string };
export type Opp = {
  id: string; no: string; title: string; ref: string; loc: string;
  cur: string; budget: string; type: string; duration: string; summary: string;
  docs: string[]; deadline: Date; published: Date;
};
export type Comment = { id: string; by: "vendor" | "hm"; text: string; at: string; file?: string };
export type FileMeta = { name: string; size: number; at: string };
export type Resp = {
  status: RespStatus; price: string; currency: string; validity: string; period: string; note: string;
  docs: Record<string, FileMeta>; submittedAt: string | null; ref: string | null; replyBy: string | null;
  comments: Comment[]; history: { at: string; text: string }[];
};
export type Note = { id: string; at: string; text: string; opp: string; tab: "response" | "clarifications" | "tender"; read: boolean };
export type Contract = { no: string; opp: string; value: number; cur: string; start: string };
export type State = { v: 2; resp: Record<string, Resp>; notes: Note[]; contracts: Contract[]; pre: Record<string, Comment[]> };

/* ───────── Reference data ───────── */
export const DOCS: Record<string, DocDef> = {
  tech: { label: "Technical Proposal", mandatory: true, hint: "Methodology, work plan, team and delivery approach. PDF." },
  fin: { label: "Financial Proposal", mandatory: true, hint: "Itemised price schedule in the offered currency. PDF or XLSX." },
  reg: { label: "Company Registration Certificate", mandatory: true, hint: "Valid certificate of incorporation or equivalent.", profileFile: "Company-Registration-Certificate.pdf" },
  tax: { label: "Tax Compliance Certificate", mandatory: true, hint: "Issued within the last 12 months.", profileFile: "Tax-Compliance-Certificate.pdf" },
  coc: { label: "Signed Vendor Code of Conduct", mandatory: true, hint: "Signed and dated by an authorised signatory." },
  ref: { label: "Past Performance References", mandatory: false, hint: "Up to three comparable contracts from the last five years." },
  cert: { label: "Quality / Product Certifications", mandatory: false, hint: "ISO, CE, WHO prequalification or equivalent." },
};
export const CRITERIA: [string, number][] = [
  ["Technical compliance", 40], ["Price competitiveness", 30], ["Relevant experience", 20], ["Delivery timeline", 10],
];
export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED"];
export const VENDOR = { name: "Shirin Haghi", company: "Acme Digital Solutions Pvt Ltd", id: "V-100482" };

const DAY = 864e5;
export function addDays(n: number) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; }

const RAW = [
  { id: "rfp0001115", no: "RFP0001115", title: "Procurement and Deployment of Enterprise Document Management System (EDMS)", ref: "PRC0001022", loc: "USA", pub: -9, due: 14, cur: "INR", budget: "1,20,00,000", type: "Open Tender", duration: "12 Months (Implementation) + 3 Years Annual Maintenance & Support (AMC)",
    summary: "This procurement seeks proposals from qualified technology vendors for the supply, implementation, configuration, and ongoing support of an Enterprise Document Management System (EDMS). The solution will provide secure document storage, version control, workflow automation, electronic approvals, advanced search capabilities, and seamless integration with existing enterprise applications. The objective is to improve operational efficiency, ensure regulatory compliance, strengthen information security, and enable centralized management of digital documents across the organization.",
    docs: ["tech", "fin", "reg", "tax", "coc", "ref"] },
  { id: "rfp0001121", no: "RFP0001121", title: "Procurement of Mobile Legal Support Units", ref: "PRC0001018", loc: "USA", pub: -20, due: 5, cur: "USD", budget: "2,600,000", type: "Open Tender", duration: "9 Months delivery + 2 Years warranty",
    summary: "Supply of fully fitted mobile units that bring legal aid and child-protection case support to remote communities, including vehicle, onboard communications equipment, and operator training.",
    docs: ["tech", "fin", "reg", "tax", "coc", "cert"] },
  { id: "rfp0001123", no: "RFP0001123", title: "Supply of Water Purification and Sanitation Equipment", ref: "PRC0001024", loc: "AFG", pub: -14, due: 35, cur: "USD", budget: "1,850,000", type: "Restricted Tender", duration: "6 Months delivery + installation",
    summary: "Supply, delivery and commissioning of water purification units, hand-washing stations and sanitation kits for schools and health facilities, with spare parts and user training.",
    docs: ["tech", "fin", "reg", "tax", "coc", "cert"] },
  { id: "rfp0001119", no: "RFP0001119", title: "Procurement of ICT Equipment for Digital Learning Centers", ref: "PRC0001015", loc: "USA", pub: -6, due: 60, cur: "USD", budget: "940,000", type: "Open Tender", duration: "4 Months delivery + 3 Years warranty",
    summary: "Laptops, tablets, networking gear and charging carts for digital learning centers, including configuration, asset tagging and a three-year onsite warranty.",
    docs: ["tech", "fin", "reg", "tax", "coc", "ref"] },
  { id: "rfp0001122", no: "RFP0001122", title: "Supply and Delivery of Medical Equipment for Primary Health Centres", ref: "PRC0001021", loc: "South Africa", pub: -11, due: 21, cur: "USD", budget: "3,200,000", type: "Open Tender", duration: "8 Months delivery + 12 Months service",
    summary: "Supply and delivery of diagnostic and maternal-health equipment for primary health centres, including installation, calibration and biomedical technician training.",
    docs: ["tech", "fin", "reg", "tax", "coc", "cert"] },
];
export const OPPS: Opp[] = RAW.map(({ pub, due, ...o }) => ({ ...o, published: addDays(pub), deadline: addDays(due) }));
export const oppById = (id: string | null | undefined) => OPPS.find(o => o.id === id);

/* ───────── Seed ───────── */
const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();
const ahead = (d: number) => new Date(Date.now() + d * DAY).toISOString();
function seed(sample = false): State {
  const f = (name: string, size: number, d: number): FileMeta => ({ name, size, at: ago(d) });
  if (!sample) return { v: 2, contracts: [], pre: {}, resp: {}, notes: [] };
  return {
    v: 2, contracts: [], pre: {},
    resp: {
      rfp0001121: {
        status: "Under Review", price: "2450000", currency: "USD", validity: "90", period: "16 weeks",
        note: "Fully equipped units on a certified chassis, with 24 months onsite service and operator training included.",
        docs: { tech: f("Technical-Proposal-MLSU.pdf", 2400000, 6), fin: f("Financial-Proposal-MLSU.xlsx", 310000, 6), reg: f("Company-Registration-Certificate.pdf", 480000, 6), tax: f("Tax-Compliance-Certificate.pdf", 520000, 6), coc: f("Code-of-Conduct-signed.pdf", 210000, 6) },
        submittedAt: ago(6), ref: "RSP482913", replyBy: null, comments: [],
        history: [{ at: ago(7), text: "Response started" }, { at: ago(6), text: "Response submitted (RSP482913)" }, { at: ago(4), text: "Status changed to Under Review" }],
      },
      rfp0001123: {
        status: "Need Clarification", price: "1790000", currency: "USD", validity: "120", period: "5 months",
        note: "Modular purification units with a local installation partner in Kabul.",
        docs: { tech: f("WASH-Technical-Proposal.pdf", 3100000, 9), fin: f("WASH-Price-Schedule.pdf", 260000, 9), reg: f("Company-Registration-Certificate.pdf", 480000, 9), tax: f("Tax-Compliance-Certificate.pdf", 520000, 9), coc: f("Code-of-Conduct-signed.pdf", 210000, 9) },
        submittedAt: ago(9), ref: "RSP307744", replyBy: ahead(5),
        comments: [{ id: "c1", by: "hm", at: ago(1), text: "Please upload your NSF/WHO certification for the filtration units and confirm the installation timeline for remote districts." }],
        history: [{ at: ago(10), text: "Response started" }, { at: ago(9), text: "Response submitted (RSP307744)" }, { at: ago(5), text: "Status changed to Under Review" }, { at: ago(1), text: "Hiring Manager requested clarification" }],
      },
    },
    notes: [{ id: "n1", at: ago(1), text: "Clarification requested on RFP0001123", opp: "rfp0001123", tab: "clarifications", read: false }],
  };
}

/* ───────── Store ───────── */
const KEY = "vendor-portal-v3";
function load(): State {
  try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p?.v === 2) return p; } } catch { /* ignore */ }
  return seed();
}
let state: State = load();
const subs = new Set<() => void>();
function commit(fn: (s: State) => void) {
  const next = structuredClone(state); fn(next); state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach(f => f());
}
export function useVendor(): State {
  return useSyncExternalStore(cb => { subs.add(cb); return () => { subs.delete(cb); }; }, () => state, () => state);
}

/* ───────── Selectors / helpers ───────── */
export const isClosed = (o: Opp) => o.deadline.getTime() < addDays(0).getTime();
export const statusOf = (o: Opp, s: State): Status => s.resp[o.id]?.status ?? (isClosed(o) ? "Closed" : "Available");
export const canEdit = (r?: Resp) => !!r && (r.status === "Draft" || r.status === "Need Clarification");
export const daysLeft = (o: Opp) => Math.round((o.deadline.getTime() - addDays(0).getTime()) / DAY);
export const closingSoon = (o: Opp) => !isClosed(o) && daysLeft(o) <= 7;
export function countdown(o: Opp) {
  const d = daysLeft(o);
  return d < 0 ? "Closed" : d === 0 ? "Due today" : d === 1 ? "1 day left" : `${d} days left`;
}
export const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const fmtSize = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
export const money = (n: string | number) => Number(n).toLocaleString("en-US");
export const unreadCount = (s: State) => s.notes.filter(n => !n.read).length;

export type Check = { key: string; label: string; ok: boolean; step: 1 | 2 };
export function checklist(o: Opp, r: Resp): Check[] {
  const c: Check[] = [
    { key: "price", label: "Offered price entered", ok: Number(r.price) > 0, step: 1 },
    { key: "validity", label: "Offer validity entered", ok: Number(r.validity) > 0, step: 1 },
    { key: "note", label: "Cover note written", ok: r.note.trim().length > 0, step: 1 },
  ];
  o.docs.filter(d => DOCS[d].mandatory).forEach(d => c.push({ key: d, label: `${DOCS[d].label} attached`, ok: !!r.docs[d], step: 2 }));
  return c;
}

export type ActionItem = { kind: "clarify" | "draft" | "closing"; oppId: string; title: string; detail: string; cta: string; tab: "response" | "clarifications" | "tender" };
export function actionItems(s: State): ActionItem[] {
  const out: ActionItem[] = [];
  OPPS.forEach(o => { const r = s.resp[o.id];
    if (r?.status === "Need Clarification") out.push({ kind: "clarify", oppId: o.id, title: `Reply to clarification on ${o.no}`, detail: r.replyBy ? `Reply by ${fmtDate(r.replyBy)}` : "Hiring Manager is waiting", cta: "Reply", tab: "clarifications" }); });
  OPPS.forEach(o => { const r = s.resp[o.id];
    if (r?.status === "Draft") out.push({ kind: "draft", oppId: o.id, title: `Finish your draft for ${o.no}`, detail: `Deadline ${fmtDate(o.deadline)} · ${countdown(o)}`, cta: "Continue", tab: "response" }); });
  OPPS.filter(o => !s.resp[o.id] && closingSoon(o)).forEach(o =>
    out.push({ kind: "closing", oppId: o.id, title: `${o.no} closes ${daysLeft(o) === 0 ? "today" : "in " + daysLeft(o) + " days"}`, detail: o.title, cta: "Start response", tab: "tender" }));
  return out;
}

/* ───────── Actions ───────── */
const hist = (r: Resp, text: string) => r.history.push({ at: new Date().toISOString(), text });
const note = (s: State, opp: string, text: string, tab: Note["tab"]) =>
  s.notes.unshift({ id: Math.random().toString(36).slice(2), at: new Date().toISOString(), text, opp, tab, read: false });

export function startResponse(id: string) {
  commit(s => {
    if (s.resp[id]) return;
    const o = oppById(id)!;
    const pre = s.pre[id] || [];
    s.resp[id] = { status: "Draft", price: "", currency: o.cur === "INR" ? "INR" : "USD", validity: "90", period: "", note: "", docs: {}, submittedAt: null, ref: null, replyBy: null, comments: pre, history: [] };
    delete s.pre[id];
    hist(s.resp[id], "Response started");
  });
}
export function updateResp(id: string, patch: Partial<Pick<Resp, "price" | "currency" | "validity" | "period" | "note">>) {
  commit(s => { if (canEdit(s.resp[id])) Object.assign(s.resp[id], patch); });
}
export function saveDraft(id: string) { commit(s => { if (s.resp[id]) hist(s.resp[id], "Draft saved"); }); }
export function setDoc(id: string, d: string, meta: { name: string; size: number }) {
  commit(s => { const r = s.resp[id]; if (!canEdit(r)) return; const had = !!r.docs[d];
    r.docs[d] = { ...meta, at: new Date().toISOString() }; hist(r, `${had ? "Replaced" : "Uploaded"} ${DOCS[d].label} (${meta.name})`); });
}
export function removeDoc(id: string, d: string) {
  commit(s => { const r = s.resp[id]; if (!canEdit(r)) return; delete r.docs[d]; hist(r, `Removed ${DOCS[d].label}`); });
}
export function submitResponse(id: string): string {
  let ref = "";
  commit(s => {
    const r = s.resp[id], o = oppById(id)!; if (!canEdit(r)) return;
    const re = r.status === "Need Clarification";
    ref = r.ref || "RSP" + Math.floor(100000 + Math.random() * 900000);
    r.ref = ref; r.status = "Applied"; r.submittedAt = new Date().toISOString(); r.replyBy = null;
    hist(r, `${re ? "Response resubmitted after clarification" : "Response submitted"} (${ref})`);
    note(s, id, `${re ? "Response resubmitted for" : "Response submitted for"} ${o.no} (${ref})`, "response");
  });
  return ref;
}
export function addComment(id: string, text: string, file?: string) {
  commit(s => {
    const c: Comment = { id: Math.random().toString(36).slice(2), by: "vendor", text, at: new Date().toISOString(), file };
    if (s.resp[id]) { s.resp[id].comments.push(c); hist(s.resp[id], "Vendor commented"); }
    else (s.pre[id] = s.pre[id] || []).push(c);
  });
}
export function markAllRead() { commit(s => s.notes.forEach(n => (n.read = true))); }
export function resetDemo(sample = false) { commit(s => { Object.assign(s, seed(sample)); }); }

/* Hiring Manager simulation */
export type HMAction = "review" | "clarify" | "comment" | "award" | "reject";
export function hmAct(id: string, what: HMAction, msg: string) {
  commit(s => {
    const r = s.resp[id], o = oppById(id)!; if (!r || r.status === "Draft") return;
    const c = (text: string): Comment => ({ id: Math.random().toString(36).slice(2), by: "hm", text, at: new Date().toISOString() });
    if (what === "review") { r.status = "Under Review"; hist(r, "Status changed to Under Review"); note(s, id, `${o.no} is now under review`, "response"); }
    if (what === "clarify") { r.status = "Need Clarification"; r.replyBy = ahead(7); r.comments.push(c(msg.trim() || "Please clarify your delivery timeline and warranty terms.")); hist(r, "Hiring Manager requested clarification"); note(s, id, `Clarification requested on ${o.no}`, "clarifications"); }
    if (what === "comment" && msg.trim()) { r.comments.push(c(msg.trim())); hist(r, "Hiring Manager commented"); note(s, id, `New comment from Hiring Manager on ${o.no}`, "clarifications"); }
    if (what === "award") { r.status = "Awarded"; const no = "CON-" + (2026101 + s.contracts.length); s.contracts.push({ no, opp: id, value: Number(r.price) || 0, cur: r.currency, start: new Date().toISOString() }); hist(r, `Awarded. Contract ${no} created`); note(s, id, `${o.no} was awarded to you (contract ${no})`, "response"); }
    if (what === "reject") { r.status = "Not Awarded"; hist(r, "Status changed to Not Awarded"); note(s, id, `${o.no} was not awarded to your proposal`, "response"); }
  });
}
