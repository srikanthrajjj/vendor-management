import { ButtonHTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Status } from "./store";

export const CYAN = "#1cabe2";
export const INK = "#1a2942";
export type Nav = (section: string, oppId?: string | null, tab?: string) => void;

const PILL: Record<Status, string> = {
  Available: "bg-[#e3f4fb] text-[#0b6d96]",
  Draft: "bg-[#eef1f5] text-[#5c7490]",
  Applied: "bg-[#e6eaf7] text-[#374ea2]",
  "Under Review": "bg-[#fff4cf] text-[#8a5a00]",
  "Need Clarification": "bg-[#fde6d8] text-[#b4440c]",
  Awarded: "bg-[#dff3e8] text-[#00693a]",
  "Not Awarded": "bg-[#fbe3e1] text-[#b3261e]",
  Closed: "bg-[#eef1f5] text-[#5c7490]",
};
export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${PILL[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{status}
    </span>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="px-8 py-6 bg-white border-b border-[rgba(0,0,0,0.08)] flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-lg font-bold text-[#1a2942]">{title}</h1>
        {sub && <p className="text-xs text-[#888] mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Crumbs({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#888] mb-5 flex-wrap">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3" aria-hidden />}
          {it.onClick ? <button onClick={it.onClick} className="hover:underline" style={{ color: CYAN }}>{it.label}</button>
            : <span className="text-[#333] font-medium">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-xl border border-[rgba(0,0,0,0.08)] ${className}`} style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      {children}
    </section>
  );
}
export function CardHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[rgba(0,0,0,0.07)]">
      <div>
        <h2 className="text-base font-bold text-[#1a2942]">{title}</h2>
        {sub && <p className="text-xs text-[#888] mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" };
export function Btn({ variant = "primary", size = "md", className = "", style, ...p }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1cabe2]";
  const sz = size === "sm" ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2";
  const v = variant === "primary" ? "text-white hover:enabled:opacity-90"
    : variant === "secondary" ? "border border-[#1cabe2] text-[#0b6d96] bg-white hover:enabled:bg-[#f0f9fd]"
    : "text-[#0b6d96] hover:enabled:bg-[#eef6fb]";
  return <button {...p} className={`${base} ${sz} ${v} ${className}`} style={variant === "primary" ? { backgroundColor: CYAN, ...style } : style} />;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-sm font-semibold text-[#1a2942]">{title}</p>
      {children && <p className="text-xs text-[#888] mt-1">{children}</p>}
    </div>
  );
}

export function Field({ label, required, error, children, htmlFor }: { label: string; required?: boolean; error?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-[#1a2942] mb-1">
        {required && <span className="text-red-500 mr-0.5" aria-hidden>*</span>}{label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 font-medium mt-1" role="alert">{error}</p>}
    </div>
  );
}
export const inputCls = (err?: boolean) =>
  `w-full border rounded px-3 py-2 text-sm text-[#333] outline-none bg-white transition-colors focus:border-[#1cabe2] disabled:bg-[#f4f7fb] disabled:text-[#777] ${err ? "border-red-500" : "border-[rgba(0,0,0,0.18)]"}`;

/* The host Toaster never auto-dismisses, so vendor toasts set their own duration. */
export const ok = (m: string, ms = 3500) => toast.success(m, { duration: ms });
export const fail = (m: string) => toast.error(m, { duration: 5000 });

/* Filter tabs: large pills, the active one filled in brand cyan */
export function PillTabs<T extends string>({ items, value, onChange, label }: { items: { key: T; label: string; count?: number }[]; value: T; onChange: (k: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-2 px-5 py-4 border-b border-[rgba(0,0,0,0.07)] overflow-x-auto overflow-y-hidden no-scrollbar">
      {items.map(it => {
        const on = it.key === value;
        return (
          <button key={it.key} role="tab" aria-selected={on} onClick={() => onChange(it.key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1cabe2] ${on ? "bg-[#1cabe2] text-[#06243a]" : "bg-[#eef4f9] text-[#3a4a5c] hover:bg-[#dcecf7]"}`}>
            {it.label}
            {it.count !== undefined && <span className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-[11px] leading-none text-center font-bold ${on ? "bg-white/70 text-[#06243a]" : "bg-white text-[#5c7490]"}`}>{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
