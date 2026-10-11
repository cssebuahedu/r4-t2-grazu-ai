import { useState } from "react";
import { Button } from "@/components/ui/button";
import { integrationStatus, repoOwner, scanners, type Repository } from "@/lib/devsecops";

/** Nonfunctional illustration: placeholder steps only, no real jobs, URLs, or secrets. */
export function demoWorkflowYaml(repo: Repository): string {
  const ids = repo.scanners.length ? repo.scanners.join(", ") : "(belum ada)";
  return `# Template demonstrasi — belum dapat dijalankan.
# Tidak memuat URL webhook, token, atau job pemindaian yang berfungsi.
name: grazu-security-scan-demo
on:
  push:
    branches: [${repo.branch}]
jobs:
  demo-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout (ilustrasi)
        run: echo "Contoh langkah checkout"
      - name: Pemindaian (ilustrasi)
        run: echo "Profil ${repo.profile}; kategori: ${ids}"
      - name: Kirim laporan ke GRAZU-AI (belum tersedia)
        run: echo "Menunggu integrasi backend GRAZU-AI"
        # env:
        #   GRAZU_REPORT_TOKEN: <placeholder — belum diterbitkan>
`;
}

const statusTone = (s: string) => (s === "Konfigurasi Demo Lengkap" ? "status-success" : s === "Belum Dikonfigurasi" ? "status-warning" : "status-info");

export function GithubIntegration({ repo, lastEvent }: { repo: Repository; lastEvent?: { type: string; time: string } | undefined }) {
  const [copied, setCopied] = useState(false);
  const [auth, setAuth] = useState<"Bearer Token" | "Signed Payload">("Bearer Token");
  const yaml = demoWorkflowYaml(repo);
  const status = integrationStatus(repo);
  const steps = [
    ["Konfigurasi repository dan profil pemindaian", `Repository ${repoOwner(repo)}/${repo.name} · branch ${repo.branch} · profil ${repo.profile} · ${repo.scanners.length} dari ${scanners.length} kategori aktif.`],
    ["Tambahkan workflow GitHub Actions", "Salin template di bawah ke .github/workflows/ sebagai ilustrasi struktur. Template belum dapat dijalankan."],
    ["Konfigurasikan kredensial pelaporan GRAZU-AI", "Kredensial pelaporan akan diterbitkan setelah integrasi backend tersedia. Belum ada token yang dibuat."],
  ];
  return (
    <div className="space-y-5">
      <section className="rounded-md border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Integrasi GitHub Actions</h2>
          <div className="flex flex-wrap gap-1.5">
            <span className={`status ${statusTone(status)}`}>{status}</span>
            <span className={`status ${statusTone("Menunggu Integrasi Backend")}`}>Menunggu Integrasi Backend</span>
          </div>
        </div>
        <ol className="space-y-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="flex gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-primary">{i + 1}</span>
              <span><span className="font-medium">{t}</span><span className="block text-xs text-muted-foreground">{d}</span></span>
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-warning">Template demonstrasi — belum dapat dijalankan.</p>
            <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard?.writeText(yaml); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Disalin" : "Salin Template"}</Button>
          </div>
          <pre aria-label="Template workflow demonstrasi" className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-[11px] leading-5">{yaml}</pre>
        </div>
      </section>

      <section className="rounded-md border bg-card p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Webhook & Penerimaan Laporan (Pratinjau)</h2>
          <span className="status status-warning">Belum Terhubung</span>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">Webhook event GitHub (push, workflow_run) dan penerimaan laporan pemindaian adalah dua integrasi terpisah. Keduanya belum aktif dalam mode demo.</p>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-md border p-4">
            <h3 className="mb-3 text-xs font-semibold">Webhook Event GitHub</h3>
            <dl className="space-y-2 text-xs">
              <Row k="Jenis event" v="push, pull_request, workflow_run.completed" />
              <Row k="Event simulasi terakhir" v={lastEvent ? `${lastEvent.type} · ${lastEvent.time}` : "Belum ada"} />
              <Row k="Status koneksi" v="Belum Terhubung" />
            </dl>
          </div>
          <div className="rounded-md border p-4">
            <h3 className="mb-3 text-xs font-semibold">Penerimaan Laporan Pemindaian</h3>
            <dl className="space-y-2 text-xs">
              <Row k="Integration ID (Demo)" v={`DEMO-${repo.id.toUpperCase()}`} mono />
              <Row k="Endpoint penerimaan" v="<placeholder — tersedia setelah integrasi backend>" mono />
              <div className="grid grid-cols-2 gap-2">
                <dt className="text-muted-foreground"><label htmlFor="ing-auth">Metode autentikasi</label></dt>
                <dd><select id="ing-auth" className="h-8 w-full rounded-md border bg-background px-2 text-xs" value={auth} onChange={(e) => setAuth(e.target.value as typeof auth)}><option>Bearer Token</option><option>Signed Payload</option></select></dd>
              </div>
              <Row k="Kredensial" v="Belum diterbitkan" />
              <Row k="Status" v="Menunggu Integrasi Backend" />
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return <div className="grid grid-cols-2 gap-2"><dt className="text-muted-foreground">{k}</dt><dd className={`break-words ${mono ? "font-mono text-[11px]" : ""}`}>{v}</dd></div>;
}
