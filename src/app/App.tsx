import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import ImportedHeader from "@/imports/Header";
import { toast } from "sonner";
import { Toaster } from "sonner";
import {
  Bell, FileText, User, Briefcase, ChevronRight, ChevronDown,
  Plus, Info, Eye, MoreVertical, Landmark, X, HelpCircle,
  Upload, Pencil, RefreshCw, CheckCircle2, ArrowRight, Check, Trash2, AlertTriangle,
} from "lucide-react";

const CYAN = "#1cabe2";
const NAVY = "#1a3055";

// ─── Types ──────────────────────────────────────────────────────
type BankEntry = {
  id: number;
  name: string;
  account: string;
  key: string;
  type: string;
  currency: string;
  isDefault: boolean;
  status: "active" | "removed";
  accountHolder: string;
  routingNo: string;
  swiftCode: string;
  iban: string;
  country: string;
};

type FormData = {
  bankName: string; accountHolder: string; bankAccount: string; routingNo: string;
  bankCountry: string; currency: string; swiftCode: string; accountType: string; iban: string;
};

const BLANK_FORM: FormData = {
  bankName: "", accountHolder: "", bankAccount: "", routingNo: "",
  bankCountry: "", currency: "US Dollar", swiftCode: "", accountType: "Saving account", iban: "",
};

// ─── Initial data (only Bank 1 active, Bank 3 removed) ──────────
const INITIAL_BANKS: BankEntry[] = [
  { id: 1, name: "Bank 1", account: "XXXXXXX7947", key: "ICIC9987", type: "Saving Account", currency: "USD", isDefault: true, status: "active", accountHolder: "Shirin Haghi", routingNo: "", swiftCode: "", iban: "", country: "India" },
  { id: 3, name: "Bank 3", account: "XXXXXXX6408", key: "HDFC8876", type: "Current Account", currency: "USD", isDefault: false, status: "removed", accountHolder: "Shirin Haghi", routingNo: "", swiftCode: "", iban: "", country: "India" },
];

const COL_HEADERS = ["Bank Name", "Account Number", "Bank Key", "Account Type", "Currency", "Actions"];
const CURRENCIES = ["US Dollar","Euro","British Pound","Indian Rupee","UAE Dirham","Afghani","Swiss Franc","Australian Dollar","Canadian Dollar","Japanese Yen"];
const ACCOUNT_TYPES = ["Saving account","Current account","Checking account","Fixed deposit"];
const COUNTRIES = ["Afghanistan","Australia","Canada","France","Germany","India","Japan","United Kingdom","United States","UAE"];
const PREVIEW_COLS: string[] = [];

const navItems = [
  { id: "invoices", label: "My Invoices", icon: FileText },
  { id: "notifications", label: "My Notifications", icon: Bell },
  { id: "cases", label: "My Cases", icon: Briefcase },
  { id: "profile", label: "My Profile", icon: User, children: ["Basic Information","Experience","Contact","Education","Professional Skills","Banking","Supporting Documents"] },
];

// ─── Field helper ────────────────────────────────────────────────
function useField(form: FormData, setForm: React.Dispatch<React.SetStateAction<FormData>>) {
  return (id: keyof FormData) => ({
    value: form[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [id]: e.target.value })),
  });
}

// ─── View Bank Modal ─────────────────────────────────────────────
function ViewBankModal({ bank, onClose }: { bank: BankEntry; onClose: () => void }) {
  function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <label className="block text-xs font-medium text-[#1a2942] mb-1">{label}</label>
        <div className="w-full border border-[rgba(0,0,0,0.12)] rounded px-3 py-2 text-sm text-[#333] bg-[#f8fafc]">{value || "—"}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ width: "780px", maxWidth: "95vw", maxHeight: "92vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <h2 className="text-base font-bold text-[#1a2942]">View Bank Account</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0f4f8] transition-colors text-[#888]"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-[#1a2942]">Bank Details</span>
            <HelpCircle className="w-3.5 h-3.5 text-[#aaa]" />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <ReadOnlyField label="Name of Bank" value={bank.name} />
              <ReadOnlyField label="Bank Account" value={bank.account} />
              <ReadOnlyField label="Bank Country" value={bank.country} />
            </div>
            {/* Right */}
            <div className="flex flex-col gap-4">
              <ReadOnlyField label="Account Holder" value={bank.accountHolder} />
              <ReadOnlyField label="Routing No / Branch code / Bank key" value={bank.routingNo || bank.key} />
              <ReadOnlyField label="Bank Account Currency" value={bank.currency} />
              <ReadOnlyField label="SWIFT Code" value={bank.swiftCode} />
              <ReadOnlyField label="Bank Account Type" value={bank.type} />
              <ReadOnlyField label="IBAN" value={bank.iban} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.08)] bg-[#fafbfc]">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: CYAN }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bank Form Helpers ─────────────────────────────────────────
function BankLabel({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-[#1a2942] mb-1">
      {required && <span className="text-red-500 mr-0.5">*</span>}{children}
    </label>
  );
}

function BankInput({ id, value, onChange }: { id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input type="text" className="w-full border border-[rgba(0,0,0,0.18)] rounded px-3 py-2 text-sm text-[#333] outline-none focus:border-[#1cabe2] transition-colors" value={value} onChange={onChange} />
  );
}

function BankSelect({ id, value, onChange, options, showEmpty }: { id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; showEmpty?: boolean }) {
  return (
    <div className="relative">
      <select className="w-full border border-[rgba(0,0,0,0.18)] rounded px-3 py-2 text-sm text-[#333] outline-none focus:border-[#1cabe2] appearance-none bg-white transition-colors" value={value} onChange={onChange}>
        {showEmpty && <option value=""></option>}
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-[#888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// ─── Add / Edit Bank Modal ───────────────────────────────────────
function BankFormModal({ editBank, onSave, onClose }: {
  editBank?: BankEntry;
  onSave: (data: FormData) => void;
  onClose: () => void;
}) {
  const isEdit = !!editBank;
  const [showCurrencyNote, setShowCurrencyNote] = useState(true);
  const [showProofNote, setShowProofNote] = useState(true);
  const [form, setForm] = useState<FormData>(
    editBank ? {
      bankName: editBank.name, accountHolder: editBank.accountHolder,
      bankAccount: editBank.account, routingNo: editBank.routingNo,
      bankCountry: editBank.country, currency: editBank.currency,
      swiftCode: editBank.swiftCode, accountType: editBank.type, iban: editBank.iban,
    } : BLANK_FORM
  );
  const field = useField(form, setForm);

  const isValid = form.bankName && form.accountHolder && form.bankAccount && form.bankCountry && form.currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ width: "780px", maxWidth: "95vw", maxHeight: "92vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <h2 className="text-base font-bold text-[#1a2942]">{isEdit ? "Edit Bank Account" : "Add Bank Account"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0f4f8] transition-colors text-[#888]"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-[#1a2942]">Bank Details</span>
            <HelpCircle className="w-3.5 h-3.5 text-[#aaa]" />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <div><BankLabel required>Name of Bank</BankLabel><BankInput id="bankName" value={form.bankName} onChange={field("bankName").onChange} /></div>
              <div><BankLabel required>Bank Account</BankLabel><BankInput id="bankAccount" value={form.bankAccount} onChange={field("bankAccount").onChange} /></div>
              <div><BankLabel required>Bank Country</BankLabel><BankSelect id="bankCountry" value={form.bankCountry} onChange={field("bankCountry").onChange} options={COUNTRIES} showEmpty /></div>
            </div>
            {/* Right */}
            <div className="flex flex-col gap-4">
              <div><BankLabel required>Account Holder</BankLabel><BankInput id="accountHolder" value={form.accountHolder} onChange={field("accountHolder").onChange} /></div>
              <div><BankLabel>Routing No/Branch code/Bank key</BankLabel><BankInput id="routingNo" value={form.routingNo} onChange={field("routingNo").onChange} /></div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-xs font-medium text-[#1a2942]"><span className="text-red-500 mr-0.5">*</span>Bank Account Currency</label>
                  <HelpCircle className="w-3 h-3 text-[#aaa]" />
                </div>
                {showCurrencyNote && (
                  <div className="relative text-xs text-[#555] bg-[#f5f5f5] border border-[rgba(0,0,0,0.1)] rounded p-3 mb-2 leading-relaxed pr-7">
                    If you nominate a bank account currency other than the Purchase Order currency, bank charges applied by the beneficiary or intermediary bank is not covered by UNICEF.
                    <button onClick={() => setShowCurrencyNote(false)} className="absolute top-2 right-2 text-[#aaa] hover:text-[#555]"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                <BankSelect id="currency" value={form.currency} onChange={field("currency").onChange} options={CURRENCIES} />
              </div>
              <div><BankLabel>SWIFT Code</BankLabel><BankInput id="swiftCode" value={form.swiftCode} onChange={field("swiftCode").onChange} /></div>
              <div><BankLabel>Bank Account Type</BankLabel><BankSelect id="accountType" value={form.accountType} onChange={field("accountType").onChange} options={ACCOUNT_TYPES} /></div>
              <div><BankLabel>IBAN</BankLabel><BankInput id="iban" value={form.iban} onChange={field("iban").onChange} /></div>
            </div>
          </div>

          {!isEdit && (
            <div className="mt-6">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-medium text-[#1a2942]"><span className="text-red-500 mr-0.5">*</span>Add Proof of Bank account</span>
                <HelpCircle className="w-3 h-3 text-[#aaa]" />
              </div>
              {showProofNote && (
                <div className="relative text-xs text-[#555] bg-[#f5f5f5] border border-[rgba(0,0,0,0.1)] rounded p-3 mb-3 leading-relaxed pr-7">
                  A proof of bank account is a bank issued document (e.g. voided check, bank statement, bank letter or internet banking screenshot) and should contain the following information: bank name, bank account number and account holder name.
                  <button onClick={() => setShowProofNote(false)} className="absolute top-2 right-2 text-[#aaa] hover:text-[#555]"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <button className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90" style={{ backgroundColor: CYAN }}>
                <Upload className="w-3.5 h-3.5" />Upload
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.08)] bg-[#fafbfc]">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#555] rounded-lg border border-[rgba(0,0,0,0.15)] hover:bg-[#f0f4f8] transition-colors">Cancel</button>
          <button
            disabled={!isValid}
            onClick={() => { onSave(form); onClose(); }}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: CYAN }}
          >
            {isEdit ? "Save Changes" : "Save Bank Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Replace Bank Modal ──────────────────────────────────────────
function ReplaceBankModal({ bank, otherActive, onConfirm, onClose }: {
  bank: BankEntry;
  otherActive: BankEntry[];
  onConfirm: (replacementId: number | "new", formData?: FormData) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"select" | "new-form" | "confirm" | "done">("select");
  const [selected, setSelected] = useState<number | "new" | null>(null);
  const [newForm, setNewForm] = useState<FormData>(BLANK_FORM);
  const selectedBank = typeof selected === "number" ? otherActive.find(b => b.id === selected) : null;

  function handleConfirm() {
    if (selected === "new") {
      onConfirm("new", newForm);
    } else if (typeof selected === "number") {
      onConfirm(selected);
    }
    setStep("done");
  }

  function handleNewFormSave(data: FormData) {
    setNewForm(data);
    setStep("confirm");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      {step === "new-form" && (
        <BankFormModal
          onSave={handleNewFormSave}
          onClose={() => setStep("select")}
        />
      )}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden" style={{ width: "460px", maxWidth: "95vw", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)] flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-[#1a2942]">Replace Bank Account</h2>
            <p className="text-[11px] text-[#888] mt-0.5">Choose what replaces this account</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0f4f8] transition-colors text-[#888]"><X className="w-4 h-4" /></button>
        </div>

        {/* Step indicator */}
        {step !== "done" && (
          <div className="flex items-center gap-2 px-6 pt-4 pb-1 flex-shrink-0">
            {(["select", "confirm"] as const).map((s, i) => {
              const done = (step === "confirm" && s === "select") || (step === "new-form" && s === "select");
              const active = step === s || (step === "new-form" && s === "select");
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: done ? "#dcfce7" : active ? CYAN : "#f0f4f8", color: done ? "#16a34a" : active ? "white" : "#aaa" }}>
                      {done ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className="text-xs font-medium" style={{ color: active || done ? "#1a2942" : "#aaa" }}>
                      {s === "select" ? "Select replacement" : "Confirm"}
                    </span>
                  </div>
                  {i < 1 && <ArrowRight className="w-3 h-3 text-[#ccc]" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="px-6 pb-5 pt-3 overflow-y-auto flex-1">

          {/* Step 1 — select */}
          {step === "select" && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-[#fff8f0] border border-orange-200 px-4 py-3 flex items-center gap-3">
                <Landmark className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#1a2942]">{bank.name}</div>
                  <div className="text-[11px] text-[#888]">{bank.account} · {bank.type}</div>
                </div>
                <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Being replaced</span>
              </div>
              <p className="text-xs text-[#666] mt-1">Choose an existing account or add a new one:</p>
              {otherActive.map(b => (
                <button key={b.id} onClick={() => setSelected(b.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all"
                  style={{ borderColor: selected === b.id ? CYAN : "rgba(0,0,0,0.1)", backgroundColor: selected === b.id ? "rgba(28,171,226,0.04)" : "white" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(28,171,226,0.1)" }}>
                    <Landmark className="w-3.5 h-3.5" style={{ color: CYAN }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#1a2942] flex items-center gap-2">{b.name}
                      {b.isDefault && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(28,171,226,0.12)", color: CYAN }}>Default</span>}
                    </div>
                    <div className="text-[11px] text-[#888] mt-0.5">{b.account} · {b.type} · {b.currency}</div>
                  </div>
                  {selected === b.id && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />}
                </button>
              ))}
              <button onClick={() => setSelected("new")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all"
                style={{ borderColor: selected === "new" ? CYAN : "rgba(0,0,0,0.1)", backgroundColor: selected === "new" ? "rgba(28,171,226,0.04)" : "white", borderStyle: "dashed" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#f0f4f8]">
                  <Plus className="w-3.5 h-3.5 text-[#888]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#1a2942]">Add a new bank account</div>
                  <div className="text-[11px] text-[#888] mt-0.5">Enter new account details</div>
                </div>
                {selected === "new" && <CheckCircle2 className="w-4 h-4 flex-shrink-0 ml-auto" style={{ color: CYAN }} />}
              </button>
              <button disabled={selected === null}
                onClick={() => selected === "new" ? setStep("new-form") : setStep("confirm")}
                className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: CYAN }}>
                Continue
              </button>
            </div>
          )}

          {/* Step 2 — confirm */}
          {step === "confirm" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[#666]">Please review the replacement before confirming.</p>
              <div className="rounded-lg border border-[rgba(0,0,0,0.08)] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#fff8f0]">
                  <Landmark className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-orange-400 mb-0.5">Replacing</div>
                    <div className="text-xs font-semibold text-[#1a2942]">{bank.name}</div>
                    <div className="text-[11px] text-[#888]">{bank.account} · {bank.type}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2 border-t border-b border-[rgba(0,0,0,0.06)] bg-[#f8fafc]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ccc]" />
                </div>
                <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: "rgba(28,171,226,0.03)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(28,171,226,0.1)" }}>
                    <Landmark className="w-3.5 h-3.5" style={{ color: CYAN }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: CYAN }}>Replacing with</div>
                    {selected === "new" ? (
                      <><div className="text-xs font-semibold text-[#1a2942]">{newForm.bankName}</div><div className="text-[11px] text-[#888]">{newForm.bankAccount} · {newForm.accountType}</div></>
                    ) : (
                      <><div className="text-xs font-semibold text-[#1a2942]">{selectedBank?.name}</div><div className="text-[11px] text-[#888]">{selectedBank?.account} · {selectedBank?.type}</div></>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#f0f7fd] border border-[rgba(28,171,226,0.2)]">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: CYAN }} />
                <p className="text-[11px] text-[#555] leading-relaxed">Any pending invoices linked to the current account will be reassigned to the replacement account.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(selected === "new" ? "new-form" : "select")} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#555] border border-[rgba(0,0,0,0.15)] hover:bg-[#f0f4f8] transition-colors">Back</button>
                <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: CYAN }}>Confirm Replacement</button>
              </div>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-[#1a2942]">Account replaced successfully</div>
                <div className="text-xs text-[#888] mt-1">
                  {selected === "new" ? `${newForm.bankName} is now the active account.` : `${selectedBank?.name} is now the active account.`}
                </div>
              </div>
              <button onClick={onClose} className="mt-2 px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: CYAN }}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ────────────────────────────────────────
function ConfirmDeleteModal({ bank, onConfirm, onClose }: {
  bank: BankEntry; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden" style={{ width: "400px", maxWidth: "95vw" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-sm font-bold text-[#1a2942]">Remove Bank Account</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0f4f8] transition-colors text-[#888]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm text-[#444] leading-relaxed">
            Are you sure you want to remove <span className="font-semibold text-[#1a2942]">{bank.name}</span>?
          </p>
          <div className="mt-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-100">
            <Landmark className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[#1a2942]">{bank.name}</div>
              <div className="text-[11px] text-[#888]">{bank.account} · {bank.type} · {bank.currency}</div>
            </div>
          </div>
          <p className="text-xs text-[#888] mt-3 leading-relaxed">
            This account will be moved to the removed list. You can reinstate it later.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-[rgba(0,0,0,0.07)] bg-[#fafbfc]">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#555] rounded-lg border border-[rgba(0,0,0,0.15)] hover:bg-[#f0f4f8] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kebab Menu ──────────────────────────────────────────────────
function KebabMenu({ onEdit, onReplace }: { onEdit?: () => void; onReplace?: () => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const recalc = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 4, right: window.innerWidth - r.right });
  }, []);

  useEffect(() => {
    if (!open) return;
    recalc();
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, recalc]);

  return (
    <>
      <button ref={btnRef} onClick={() => setOpen(o => !o)} className="p-1 rounded hover:bg-[#f0f4f8] transition-colors text-[#aaa]">
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-white rounded-lg border border-[rgba(0,0,0,0.1)] overflow-hidden"
          style={{ top: pos.top, right: pos.right, width: 140, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.14)" }}
        >
          <button onClick={() => { setOpen(false); onEdit?.(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-[#333] hover:bg-[#f0f4f8] transition-colors">
            <Pencil className="w-3.5 h-3.5 text-[#888]" />Edit
          </button>
          <div className="border-t border-[rgba(0,0,0,0.06)]" />
          <button onClick={() => { setOpen(false); onReplace?.(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-[#333] hover:bg-[#f0f4f8] transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-[#888]" />Replace
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Bank Row ────────────────────────────────────────────────────
function BankRow({ bank, removed, canRemove = true, onView, onRemove, onReinstate, onEdit, onReplace }: {
  bank: BankEntry; removed?: boolean; canRemove?: boolean;
  onView?: () => void; onRemove?: () => void; onReinstate?: () => void;
  onEdit?: () => void; onReplace?: () => void;
}) {
  return (
    <tr className="border-t border-[rgba(0,0,0,0.06)] hover:bg-[#fafbfd] transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Landmark className="w-4 h-4 flex-shrink-0 text-[#aab]" />
          <span className="text-xs font-medium text-[#1a2942]">{bank.name}</span>
          {bank.isDefault && !removed && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(28,171,226,0.12)", color: CYAN }}>Default</span>
          )}
        </div>
      </td>
      <td className="px-5 py-3 text-xs text-[#555] font-mono">{bank.account}</td>
      <td className="px-5 py-3 text-xs text-[#555] font-mono">{bank.key}</td>
      <td className="px-5 py-3 text-xs text-[#555]">{bank.type}</td>
      <td className="px-5 py-3 text-xs text-[#555]">{bank.currency}</td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          {removed ? (
            <button onClick={onReinstate} className="text-xs font-semibold px-3 py-1 rounded-md border transition-colors hover:bg-[#f0f4f8]" style={{ borderColor: CYAN, color: CYAN }}>
              Reinstate
            </button>
          ) : (
            <button onClick={onView} className="p-1 rounded hover:bg-[#f0f4f8] transition-colors text-[#888]">
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {!removed && (
            <button
              onClick={canRemove ? onRemove : undefined}
              disabled={!canRemove}
              title={!canRemove ? "At least one active bank account is required" : "Remove account"}
              className="p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-red-50 text-red-400 hover:enabled:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!removed && <KebabMenu onEdit={onEdit} onReplace={onReplace} />}
        </div>
      </td>
    </tr>
  );
}

// ─── App ─────────────────────────────────────────────────────────
let nextId = 10;

function generateCaseNumber(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `VC${num}`;
}

export default function App() {
  const [activeNav, setActiveNav] = useState("profile");
  const [activeSubNav, setActiveSubNav] = useState("Banking");
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [banks, setBanks] = useState<BankEntry[]>(INITIAL_BANKS);

  const [showAddBank, setShowAddBank] = useState(false);
  const [editBank, setEditBank] = useState<BankEntry | null>(null);
  const [viewBank, setViewBank] = useState<BankEntry | null>(null);
  const [replaceBank, setReplaceBank] = useState<BankEntry | null>(null);
  const [deleteBank, setDeleteBank] = useState<BankEntry | null>(null);

  const activeBanks = banks.filter(b => b.status === "active");
  const removedBanks = banks.filter(b => b.status === "removed");
  const canAddBank = activeBanks.length < 2;

  function handleAddBank(data: FormData) {
    const newBank: BankEntry = {
      id: nextId++, name: data.bankName, account: data.bankAccount,
      key: data.routingNo || "—", type: data.accountType, currency: data.currency,
      isDefault: activeBanks.length === 0, status: "active",
      accountHolder: data.accountHolder, routingNo: data.routingNo,
      swiftCode: data.swiftCode, iban: data.iban, country: data.bankCountry,
    };
    setBanks(prev => [...prev, newBank]);
  }

  function handleEditBank(data: FormData) {
    if (!editBank) return;
    setBanks(prev => prev.map(b => b.id === editBank.id ? {
      ...b, name: data.bankName, account: data.bankAccount,
      key: data.routingNo || b.key, type: data.accountType, currency: data.currency,
      accountHolder: data.accountHolder, routingNo: data.routingNo,
      swiftCode: data.swiftCode, iban: data.iban, country: data.bankCountry,
    } : b));
  }

  function handleRemove(id: number) {
    const bank = banks.find(b => b.id === id);
    if (bank?.status === "removed") {
      setBanks(prev => prev.filter(b => b.id !== id));
    } else {
      setBanks(prev => prev.map(b => b.id === id ? { ...b, status: "removed", isDefault: false } : b));
      const caseNumber = generateCaseNumber();
      toast.success(`Your request to remove bank account has been submitted. Case number: ${caseNumber}`);
    }
  }

  function handleReinstate(id: number) {
    if (activeBanks.length >= 2) return;
    setBanks(prev => prev.map(b => b.id === id ? { ...b, status: "active" } : b));
  }

  function handleReplace(targetId: number, replacementId: number | "new", formData?: FormData) {
    setBanks(prev => {
      // Move the replaced bank to removed
      let updated = prev.map(b =>
        b.id === targetId ? { ...b, status: "removed" as const, isDefault: false } : b
      );
      if (replacementId === "new" && formData) {
        // Add the brand-new bank as active
        const newBank: BankEntry = {
          id: nextId++,
          name: formData.bankName,
          account: formData.bankAccount,
          key: formData.routingNo || "—",
          type: formData.accountType,
          currency: formData.currency,
          isDefault: updated.filter(b => b.status === "active").length === 0,
          status: "active",
          accountHolder: formData.accountHolder,
          routingNo: formData.routingNo,
          swiftCode: formData.swiftCode,
          iban: formData.iban,
          country: formData.bankCountry,
        };
        updated = [...updated, newBank];
      }
      // If replacementId is a number the bank is already active — no status change needed
      return updated;
    });
  }

  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="top-right" richColors />

      {/* Modals */}
      {showAddBank && (
        <BankFormModal onSave={handleAddBank} onClose={() => setShowAddBank(false)} />
      )}
      {editBank && (
        <BankFormModal editBank={editBank} onSave={handleEditBank} onClose={() => setEditBank(null)} />
      )}
      {viewBank && <ViewBankModal bank={viewBank} onClose={() => setViewBank(null)} />}
      {deleteBank && (
        <ConfirmDeleteModal
          bank={deleteBank}
          onConfirm={() => handleRemove(deleteBank.id)}
          onClose={() => setDeleteBank(null)}
        />
      )}
      {replaceBank && (
        <ReplaceBankModal
          bank={replaceBank}
          otherActive={activeBanks.filter(b => b.id !== replaceBank.id)}
          onConfirm={(rid, fd) => handleReplace(replaceBank.id, rid, fd)}
          onClose={() => setReplaceBank(null)}
        />
      )}

      {/* ── Top Navbar ── */}
      <div className="flex-shrink-0 z-30" style={{ height: "48px" }}>
        <ImportedHeader />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="flex-shrink-0 bg-white border-r border-[rgba(0,0,0,0.08)] flex flex-col overflow-y-auto" style={{ width: "220px", boxShadow: "1px 0 4px rgba(0,0,0,0.04)" }}>
          <nav className="flex-1 py-3">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              const hasChildren = !!item.children;
              const isExpanded = hasChildren && (isActive || profileExpanded);
              return (
                <div key={item.id}>
                  <button onClick={() => { setActiveNav(item.id); if (hasChildren) setProfileExpanded(!profileExpanded || !isActive); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors text-sm"
                    style={{ color: isActive ? CYAN : "#444", fontWeight: isActive ? 600 : 400, backgroundColor: isActive && !hasChildren ? "rgba(28,171,226,0.07)" : "transparent", borderLeft: isActive ? `3px solid ${CYAN}` : "3px solid transparent" }}>
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? CYAN : "#888" }} />
                    <span className="flex-1">{item.label}</span>
                    {hasChildren && <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ color: "#aaa", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />}
                  </button>
                  {hasChildren && isExpanded && (
                    <div className="pb-1">
                      {item.children!.map(child => {
                        const isChildActive = activeSubNav === child;
                        return (
                          <button key={child} onClick={() => { setActiveNav(item.id); setActiveSubNav(child); }}
                            className="w-full text-left text-xs px-10 py-2 transition-colors"
                            style={{ color: isChildActive ? CYAN : "#666", fontWeight: isChildActive ? 600 : 400, backgroundColor: isChildActive ? "rgba(28,171,226,0.07)" : "transparent" }}>
                            {child}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="mx-3 mb-4 px-3 py-2.5 rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#f8fafc] flex items-center justify-between gap-2">
            <span className="text-xs text-[#666]">Need help?</span>
            <button className="text-xs font-semibold hover:underline" style={{ color: CYAN }}>Contact Support</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 bg-white border-b border-[rgba(0,0,0,0.08)]">
            <h1 className="text-lg font-bold text-[#1a2942]">My Profile</h1>
            <p className="text-xs text-[#888] mt-0.5">Manage your profile, supporting documents and more</p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-1.5 text-xs text-[#888] mb-5">
              <button className="hover:underline" style={{ color: CYAN }}>My Profile</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#333] font-medium">Banking</span>
            </div>

            <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>

              {/* Card header */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.07)]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(28,171,226,0.1)" }}>
                    <Landmark className="w-5 h-5" style={{ color: CYAN }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1a2942]">Bank Accounts</h2>
                    <p className="text-xs text-[#888] mt-0.5">Manage your bank accounts used for receiving payments.</p>
                    <p className="text-xs text-[#888]">At least one active bank account is required.</p>
                  </div>
                </div>
                <button
                  disabled={!canAddBank}
                  onClick={() => setShowAddBank(true)}
                  title={!canAddBank ? "Maximum 2 active accounts allowed" : ""}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-2 rounded-lg flex-shrink-0 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:opacity-90"
                  style={{ backgroundColor: CYAN }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Bank Account
                </button>
              </div>

              {/* Active Accounts */}
              <div className="px-5 pt-4 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1a2942]">Active Accounts ({activeBanks.length})</span>
                  {!canAddBank && <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Max 2 reached — Add disabled</span>}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8fafc]">
                      {COL_HEADERS.map(col => <th key={col} className="text-left px-5 py-2.5 text-[11px] font-semibold text-[#999] whitespace-nowrap">{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {activeBanks.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-6 text-center text-xs text-[#aaa]">No active bank accounts. Add one to receive payments.</td></tr>
                    ) : (
                      activeBanks.map(b => (
                        <BankRow key={b.id} bank={b}
                          canRemove={activeBanks.length > 1}
                          onView={() => setViewBank(b)}
                          onRemove={() => setDeleteBank(b)}
                          onEdit={() => setEditBank(b)}
                          onReplace={() => setReplaceBank(b)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Removed Accounts */}
              {removedBanks.length > 0 && (
                <>
                  <div className="px-5 pt-5 pb-1">
                    <span className="text-xs font-semibold text-[#1a2942]">Removed Accounts ({removedBanks.length})</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc]">
                          {COL_HEADERS.map(col => <th key={col} className="text-left px-5 py-2.5 text-[11px] font-semibold text-[#999] whitespace-nowrap">{col}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {removedBanks.map(b => (
                          <BankRow key={b.id} bank={b} removed
                            onRemove={() => setDeleteBank(b)}
                            onReinstate={() => handleReinstate(b.id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Info bar */}
              <div className="flex items-center gap-2.5 px-5 py-3 mt-3 border-t border-[rgba(28,171,226,0.15)]" style={{ backgroundColor: "rgba(28,171,226,0.06)" }}>
                <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: CYAN }} />
                <p className="text-xs text-[#555]">You must have at least one active bank account at all times.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
