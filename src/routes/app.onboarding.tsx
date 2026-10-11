import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AccountFields, OrgFields } from "@/components/grazu/org-form";
import { pageHead } from "@/lib/grazu-navigation";
import { organizationActions, useOrganization, validateAccount, validateOrg, type AccountInfo, type Errors, type OrgProfile } from "@/lib/organization";
import { useDemoRole } from "@/lib/demo-roles";

export const Route = createFileRoute("/app/onboarding")({
  head: () => pageHead("Onboarding Klien", "Lengkapi informasi akun dan organisasi untuk mulai menggunakan GRAZU-AI."),
  component: Onboarding,
});

const steps = ["Informasi Akun", "Informasi Organisasi", "Konfirmasi Data"];

function Onboarding() {
  const { role } = useDemoRole();
  const s = useOrganization();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState<AccountInfo>(s.account);
  const { key: _key, ...orgInit } = s.org;
  const [org, setOrg] = useState(orgInit);
  const [accErr, setAccErr] = useState<Errors<AccountInfo>>({});
  const [orgErr, setOrgErr] = useState<Errors<OrgProfile>>({});

  if (role !== "client")
    return <p className="rounded-md border bg-card p-6 text-sm text-muted-foreground">Onboarding hanya tersedia untuk peran Perwakilan Organisasi. Ganti peran demo untuk mencobanya.</p>;

  const next = () => {
    if (step === 0) { const e = validateAccount(account); setAccErr(e); if (Object.keys(e).length) return; }
    if (step === 1) { const e = validateOrg(org); setOrgErr(e); if (Object.keys(e).length) return; }
    setStep(step + 1);
  };
  const finish = () => { organizationActions.completeOnboarding(account, org); void navigate({ to: "/app" }); };

  const rows: [string, string][] = [
    ["Nama lengkap", account.name], ["Email", account.email], ["Nomor telepon", account.phone], ["Jabatan", account.position],
    ["Nama organisasi", org.name], ["Jenis organisasi", org.type], ["Sektor", org.sector], ["Provinsi", org.province],
    ["Kabupaten/Kota", org.city], ["Website", org.website || "—"], ["Deskripsi", org.description],
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Onboarding Klien</h1>
      <p className="mt-2 text-sm text-muted-foreground">Lengkapi data berikut. Mode demo — data hanya tersimpan sementara.</p>
      <ol className="my-6 grid grid-cols-3 gap-2" aria-label="Langkah onboarding">
        {steps.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined} className={`border-t-2 pt-2 text-xs ${i <= step ? "border-primary font-medium text-primary" : "border-border text-muted-foreground"}`}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>
      <section className="rounded-md border bg-card p-5 md:p-6">
        <h2 className="mb-4 text-sm font-semibold">{steps[step]}</h2>
        {step === 0 && <AccountFields value={account} onChange={setAccount} errors={accErr} />}
        {step === 1 && <OrgFields value={org} onChange={setOrg} errors={orgErr} />}
        {step === 2 && (
          <dl className="divide-y text-sm">
            {rows.map(([k, v]) => <div key={k} className="grid gap-1 py-2 sm:grid-cols-3"><dt className="text-muted-foreground">{k}</dt><dd className="sm:col-span-2">{v}</dd></div>)}
          </dl>
        )}
        <div className="mt-6 flex flex-wrap justify-between gap-2">
          {step === 0 ? <Button asChild variant="ghost"><Link to="/app">Lewati</Link></Button> : <Button variant="outline" onClick={() => setStep(step - 1)}>Kembali</Button>}
          {step < 2 ? <Button onClick={next}>Lanjut</Button> : <Button onClick={finish}>Konfirmasi & Selesai</Button>}
        </div>
      </section>
    </div>
  );
}
