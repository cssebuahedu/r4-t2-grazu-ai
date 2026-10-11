import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orgTypes, type AccountInfo, type Errors, type OrgProfile } from "@/lib/organization";
import { sectors } from "@/lib/use-cases";

type OrgDraft = Omit<OrgProfile, "key">;

function Field({ id, label, error, optional, children }: { id: string; label: string; error?: string | undefined; optional?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}{optional && <span className="ml-1 font-normal text-muted-foreground">(opsional)</span>}</Label>
      {children}
      {error && <p id={`${id}-err`} className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
const selectCls = "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary";

export function AccountFields({ value, onChange, errors }: { value: AccountInfo; onChange: (v: AccountInfo) => void; errors: Errors<AccountInfo> }) {
  const f = (k: keyof AccountInfo, label: string, type = "text") => (
    <Field id={`acc-${k}`} label={label} error={errors[k]}>
      <Input id={`acc-${k}`} type={type} value={value[k]} aria-invalid={!!errors[k]} onChange={(e) => onChange({ ...value, [k]: e.target.value })} />
    </Field>
  );
  return <div className="grid gap-4 sm:grid-cols-2">{f("name", "Nama lengkap")}{f("email", "Email", "email")}{f("phone", "Nomor telepon", "tel")}{f("position", "Jabatan")}</div>;
}

export function OrgFields({ value, onChange, errors }: { value: OrgDraft; onChange: (v: OrgDraft) => void; errors: Errors<OrgProfile> }) {
  const set = (k: keyof OrgDraft, v: string) => onChange({ ...value, [k]: v });
  const input = (k: keyof OrgDraft, label: string, optional = false) => (
    <Field id={`org-${k}`} label={label} error={errors[k]} optional={optional}>
      <Input id={`org-${k}`} value={value[k]} aria-invalid={!!errors[k]} onChange={(e) => set(k, e.target.value)} />
    </Field>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {input("name", "Nama organisasi")}
      <Field id="org-type" label="Jenis organisasi" error={errors.type}>
        <select id="org-type" className={selectCls} value={value.type} onChange={(e) => set("type", e.target.value)}>
          <option value="">Pilih jenis</option>{orgTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field id="org-sector" label="Sektor" error={errors.sector}>
        <select id="org-sector" className={selectCls} value={value.sector} onChange={(e) => set("sector", e.target.value)}>
          <option value="">Pilih sektor</option>{sectors.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      {input("province", "Provinsi")}
      {input("city", "Kabupaten/Kota")}
      {input("website", "Website", true)}
      <div className="sm:col-span-2">
        <Field id="org-description" label="Deskripsi organisasi" error={errors.description}>
          <Textarea id="org-description" rows={3} value={value.description} aria-invalid={!!errors.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
