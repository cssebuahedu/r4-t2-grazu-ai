import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GithubIntegration } from "@/components/grazu/github-integration";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases } from "@/lib/use-cases";
import {
  findings, scanCategories, scanners, scanStatusClass, severityClass, toggleScanner, useRepos, useRuns,
  webhookEvents, type Finding, type FindingSeverity, type Repository,
} from "@/lib/devsecops";

export const Route = createFileRoute("/app/devsecops/repositories/$id")({
  head: ({ params }) => pageHead(`Repository ${params.id}`, "Detail keamanan repository dan pipeline CI/CD tersimulasi."),
  component: RepoDetail,
});

const severities: FindingSeverity[] = ["Critical", "High", "Medium", "Low"];
const th = "px-4 py-3 font-medium";
const td = "px-4 py-3.5";
const head = "border-b bg-background text-[10px] uppercase tracking-wider text-muted-foreground";

function RepoDetail() {
  const { id } = Route.useParams();
  const repo = useRepos().find((r) => r.id === id);
  if (!repo) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-lg font-semibold">Repository tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted-foreground">Repository mungkin telah dihapus dari data demo.</p>
        <Button asChild variant="outline" className="mt-5"><Link to="/app/devsecops">Kembali ke AI DevSecOps</Link></Button>
      </div>
    );
  }
  return <View repo={repo} />;
}

function View({ repo }: { repo: Repository }) {
  const product = useUseCases().find((p) => p.id === repo.productId);
  const runs = useRuns().filter((r) => r.repoId === repo.id);
  const list = findings.filter((f) => f.repoId === repo.id);
  const [sev, setSev] = useState("");
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState<Finding>();
  const filtered = list.filter((f) => (!sev || f.severity === sev) && (!cat || f.category === cat));
  const events = webhookEvents.filter((e) => e.repoId === repo.id);

  return (
    <>
      <Link to="/app/devsecops" className="text-xs text-muted-foreground hover:text-primary">← AI DevSecOps</Link>
      <header className="mb-6 mt-3 border-b pb-6">
        <p className="text-[11px] text-muted-foreground">{repo.id} · Data Simulasi</p>
        <h1 className="mt-1.5 break-all text-2xl font-semibold">{repo.name}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <span><span className="text-muted-foreground">Produk AI: </span>{product ? <Link to="/app/use-cases/$id" params={{ id: product.id }} className="text-primary hover:underline">{product.name}</Link> : repo.productId}</span>
          <span><span className="text-muted-foreground">Branch: </span><span className="font-mono">{repo.branch}</span></span>
          <span><span className="text-muted-foreground">Scan simulasi terakhir: </span>{repo.lastScan}</span>
          <span className={`status ${scanStatusClass(repo.scanStatus)}`}>{repo.scanStatus}</span>
        </div>
      </header>
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="findings">Security Findings</TabsTrigger>
            <TabsTrigger value="pipeline">CI/CD Pipeline</TabsTrigger>
            <TabsTrigger value="config">Scan Configuration</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
            <TabsTrigger value="actions">Integrasi GitHub Actions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {severities.map((s) => (
              <article key={s} className="rounded-md border bg-card p-5">
                <span className={`status ${severityClass(s)}`}>{s}</span>
                <p className="mt-3 text-3xl font-semibold">{list.filter((f) => f.severity === s && f.status !== "Diperbaiki").length}</p>
              </article>
            ))}
          </div>
          <section className="rounded-md border bg-card p-5">
            <h2 className="text-sm font-semibold">Ringkasan per Kategori</h2>
            <table className="mt-3 w-full text-left text-xs">
              <tbody>
                {scanCategories.map((c) => (
                  <tr key={c} className="border-b last:border-0"><td className="py-2.5">{c}</td><td className="py-2.5 text-right font-semibold">{list.filter((f) => f.category === c).length}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="rounded-md border bg-card p-5 text-xs">
            <h2 className="text-sm font-semibold">Scan Simulasi Terakhir</h2>
            {runs[0] ? (
              <p className="mt-3 text-muted-foreground">{runs[0].workflow} · commit <span className="font-mono">{runs[0].sha}</span> · {runs[0].time} · <span className={`status ${scanStatusClass(runs[0].status)}`}>{runs[0].status}</span></p>
            ) : <p className="mt-3 text-muted-foreground">Belum ada scan. Jalankan simulasi dari halaman AI DevSecOps.</p>}
          </section>
        </TabsContent>

        <TabsContent value="findings" className="mt-5 overflow-hidden rounded-md border bg-card">
          <div className="flex flex-wrap gap-2 border-b px-5 py-4">
            <select aria-label="Filter severity" className="h-9 rounded-md border bg-background px-3 text-sm" value={sev} onChange={(e) => setSev(e.target.value)}>
              <option value="">Semua severity</option>
              {severities.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select aria-label="Filter kategori" className="h-9 rounded-md border bg-background px-3 text-sm" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Semua kategori</option>
              {scanCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className={head}><tr>{["ID Temuan", "Kategori", "Severity", "File", "Alat Deteksi", "Status", "Aksi"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-b last:border-0 hover:bg-background">
                    <td className={`${td} font-mono`}>{f.id}</td>
                    <td className={td}>{f.category}</td>
                    <td className={td}><span className={`status ${severityClass(f.severity)}`}>{f.severity}</span></td>
                    <td className={`${td} font-mono text-[11px]`}>{f.file}</td>
                    <td className={`${td} text-muted-foreground`}>{f.tool}</td>
                    <td className={td}>{f.status}</td>
                    <td className={td}><Button variant="ghost" size="sm" onClick={() => setOpen(f)}>Detail</Button></td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">{list.length ? "Tidak ada temuan yang cocok dengan filter." : "Belum ada temuan untuk repository ini."}</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-5 rounded-md border bg-card p-5">
          <p className="mb-4 text-[11px] text-muted-foreground">Eksekusi workflow GitHub Actions tersimulasi, terbaru di atas.</p>
          {runs.length ? (
            <ol className="space-y-4 border-l pl-5">
              {runs.map((r) => (
                <li key={r.id} className="text-xs">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{r.workflow}</span><span className={`status ${scanStatusClass(r.status)}`}>{r.status}</span></div>
                  <p className="mt-1.5 text-muted-foreground"><span className="font-mono">{r.branch}</span> · <span className="font-mono">{r.sha}</span> · {r.trigger} · {r.time}</p>
                </li>
              ))}
            </ol>
          ) : <p className="py-8 text-center text-xs text-muted-foreground">Belum ada pipeline run tersimulasi.</p>}
        </TabsContent>

        <TabsContent value="config" className="mt-5 rounded-md border bg-card p-5">
          <p className="mb-4 text-[11px] text-muted-foreground">Profil {repo.profile} · Perubahan disimpan secara lokal.</p>
          <ul className="divide-y">
            {scanners.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <label htmlFor={`sc-${s.id}`}><span className="block">{s.label}</span><span className="block text-xs text-muted-foreground">{s.description}</span></label>
                <Switch id={`sc-${s.id}`} checked={repo.scanners.includes(s.id)} onCheckedChange={() => toggleScanner(repo.id, s.id)} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">{repo.scanners.length} dari {scanners.length} pemindai aktif.</p>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-5 overflow-hidden rounded-md border bg-card">
          <p className="border-b px-5 py-3 text-[11px] text-muted-foreground">Riwayat penerimaan laporan tersimulasi. Endpoint webhook belum tersedia.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className={head}><tr>{["ID Event", "Jenis Event", "Repository", "Waktu", "Status"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className={`${td} font-mono`}>{e.id}</td>
                    <td className={`${td} font-mono text-[11px]`}>{e.type}</td>
                    <td className={td}>{repo.name}</td>
                    <td className={`${td} text-muted-foreground`}>{e.time}</td>
                    <td className={td}><span className={`status ${e.status === "Diproses" ? "status-success" : e.status === "Menunggu" ? "status-warning" : "status-danger"}`}>{e.status}</span></td>
                  </tr>
                ))}
                {!events.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Belum ada event webhook tersimulasi.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="actions" className="mt-5"><GithubIntegration repo={repo} lastEvent={events[0]} /></TabsContent>
      </Tabs>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(undefined)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader><SheetTitle>{open?.title}</SheetTitle><SheetDescription>{open?.id} · Hasil Simulasi</SheetDescription></SheetHeader>
          {open && (
            <dl className="space-y-5 px-4 pb-6 text-xs">
              <div><span className={`status ${severityClass(open.severity)}`}>{open.severity}</span> <span className="ml-2 text-muted-foreground">{open.category}</span></div>
              <div><dt className="text-muted-foreground">Deskripsi kerentanan</dt><dd className="mt-1.5 leading-5">{open.description}</dd></div>
              <div><dt className="text-muted-foreground">File terdampak</dt><dd className="mt-1.5 font-mono">{open.file}:{open.line}</dd></div>
              <div><dt className="text-muted-foreground">Metode deteksi</dt><dd className="mt-1.5">{open.tool} (simulasi)</dd></div>
              <div><dt className="text-muted-foreground">Rekomendasi perbaikan</dt><dd className="mt-1.5 leading-5">{open.remediation}</dd></div>
              <div><dt className="text-muted-foreground">Bukti simulasi</dt><dd className="mt-1.5"><pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-[11px]">{open.evidence}</pre><p className="mt-1.5 text-[10px] text-muted-foreground">Bukti ilustratif, tidak memuat kredensial asli.</p></dd></div>
            </dl>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
