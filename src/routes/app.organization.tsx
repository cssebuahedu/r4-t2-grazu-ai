import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OrgFields } from "@/components/grazu/org-form";
import { pageHead } from "@/lib/grazu-navigation";
import { organizationActions, orgMembers, useOrganization, validateOrg, type Errors, type OrgProfile } from "@/lib/organization";
import { riskClass, useUseCases } from "@/lib/use-cases";
import { useDemoRole } from "@/lib/demo-roles";

export const Route = createFileRoute("/app/organization")({
  head: () => pageHead("Organisasi Saya", "Profil organisasi, anggota, dan use case AI milik organisasi."),
  component: OrganizationPage,
});

function OrganizationPage() {
  const { role } = useDemoRole();
  const { org } = useOrganization();
  const products = useUseCases().filter((u) => u.org === org.key);
  const [editing, setEditing] = useState(false);
  const { key: _k, ...current } = org;
  const [draft, setDraft] = useState(current);
  const [errors, setErrors] = useState<Errors<OrgProfile>>({});
  if (role !== "client") return <p className="rounded-md border bg-card p-6 text-sm text-muted-foreground">Halaman ini menampilkan organisasi milik peran Perwakilan Organisasi.</p>;
  const save = () => { const e = validateOrg(draft); setErrors(e); if (Object.keys(e).length) return; organizationActions.updateOrg(draft); setEditing(false); };
  const info: [string, string][] = [["Jenis organisasi", org.type], ["Sektor", org.sector], ["Provinsi", org.province], ["Kabupaten/Kota", org.city], ["Website", org.website || "—"]];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{org.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Profil organisasi · data demonstrasi</p>
        </div>
        {!editing && <Button variant="outline" onClick={() => { setDraft(current); setErrors({}); setEditing(true); }}>Ubah Profil</Button>}
      </div>
      <section className="mb-6 rounded-md border bg-card p-5">
        {editing ? (
          <>
            <OrgFields value={draft} onChange={setDraft} errors={errors} />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>Batal</Button>
              <Button onClick={save}>Simpan</Button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm">{org.description}</p>
            <dl className="grid gap-4 text-sm sm:grid-cols-3 lg:grid-cols-5">
              {info.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>)}
            </dl>
          </>
        )}
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border bg-card">
          <h2 className="border-b px-5 py-4 text-sm font-semibold">Anggota Organisasi</h2>
          <ul className="divide-y">
            {orgMembers.map((m) => (
              <li key={m.email} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                <span className="status status-info">{m.role}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-md border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-sm font-semibold">Use Case AI Organisasi</h2>
            <Button asChild size="sm"><Link to="/app/use-cases/new">Daftarkan Use Case AI</Link></Button>
          </div>
          <ul className="divide-y">
            {products.length === 0 && <li className="px-5 py-6 text-center text-xs text-muted-foreground">Belum ada use case terdaftar.</li>}
            {products.map((p) => (
              <li key={p.id}>
                <Link to="/app/use-cases/$id" params={{ id: p.id }} className="flex items-center justify-between gap-2 px-5 py-3 text-sm hover:bg-background">
                  <span><span className="font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{p.id} · {p.status}</span></span>
                  <span className={`status ${riskClass(p.risk)}`}>{p.risk}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
