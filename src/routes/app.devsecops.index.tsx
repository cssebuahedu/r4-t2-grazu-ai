import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases } from "@/lib/use-cases";
import { RepoForm } from "@/components/grazu/repo-form";
import {
  deleteRepo, findings, openFindings, recordSimulatedScan, scanCategories, scanStatusClass, severityClass,
  simulatedResults, useRepos, useRuns, workflowYaml, type Repository, type ScanCategory,
} from "@/lib/devsecops";

export const Route = createFileRoute("/app/devsecops/")({
  head: () => pageHead("AI DevSecOps", "Pemantauan keamanan repository, workflow CI/CD, dan implementasi sistem kecerdasan artifisial."),
  component: DevSecOps,
});

const th = "px-4 py-3 font-medium";
const td = "px-4 py-3.5";

function DevSecOps() {
  const repos = useRepos();
  const runs = useRuns();
  const products = useUseCases();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState<{ open: boolean; repo?: Repository | undefined }>({ open: false });
  const [del, setDel] = useState<Repository>();
  const [yaml, setYaml] = useState(false);
  const [scan, setScan] = useState(false);
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id;
  const repoName = (id: string) => repos.find((r) => r.id === id)?.name ?? id;

  const list = repos.filter((r) => {
    const s = q.trim().toLowerCase();
    return (!s || [r.name, r.org, productName(r.productId)].some((x) => x.toLowerCase().includes(s))) && (!status || r.scanStatus === status);
  });
  const repoIds = new Set(repos.map((r) => r.id));
  const activeFindings = findings.filter((f) => repoIds.has(f.repoId) && f.status !== "Diperbaiki");
  const maxCat = Math.max(1, ...scanCategories.map((c) => activeFindings.filter((f) => f.category === c).length));

  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">AI DevSecOps</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Pemantauan keamanan repository, workflow CI/CD, dan implementasi sistem kecerdasan artifisial.</p>
          <span className="mt-3 inline-block rounded border border-primary/20 bg-accent px-2 py-1 text-[10px] font-semibold tracking-wider text-primary">MODE DEMO — Tidak terhubung ke GitHub</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setYaml(true)}>Integrasi GitHub Actions</Button>
          <Button variant="outline" onClick={() => setScan(true)} disabled={!repos.length}>Jalankan Simulasi Scan</Button>
          <Button onClick={() => setForm({ open: true })}>+ Tambah Repository</Button>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ["Repository Terdaftar", repos.length],
          ["Total Security Scans", 42 + runs.length],
          ["Temuan Kerentanan", activeFindings.length],
          ["Pipeline Bermasalah", runs.filter((r) => r.status === "Failed").length],
        ].map(([l, v]) => (
          <article key={l} className="rounded-md border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">{l}</p>
            <p className="mt-3 text-3xl font-semibold">{v}</p>
          </article>
        ))}
      </div>

      <section className="mb-7 overflow-hidden rounded-md border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Daftar Repository</h2>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Input aria-label="Cari repository" placeholder="Cari repository, organisasi, produk..." value={q} onChange={(e) => setQ(e.target.value)} className="h-9 sm:w-64" />
            <select aria-label="Filter status scan" className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Semua status</option>
              {["Berhasil", "Gagal", "Berjalan", "Belum dipindai"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="border-b bg-background text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>{["Repository", "Organisasi", "Produk AI", "Branch", "Scan Terakhir", "Status Scan", "Temuan Terbuka", "Aksi"].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-background">
                  <td className={td}><Link to="/app/devsecops/repositories/$id" params={{ id: r.id }} className="font-medium text-primary hover:underline">{r.name}</Link><p className="mt-1 text-[10px] text-muted-foreground">{r.profile}</p></td>
                  <td className={`${td} text-muted-foreground`}>{r.org}</td>
                  <td className={td}><Link to="/app/use-cases/$id" params={{ id: r.productId }} className="hover:text-primary">{productName(r.productId)}</Link></td>
                  <td className={`${td} font-mono text-[11px]`}>{r.branch}</td>
                  <td className={`${td} whitespace-nowrap text-muted-foreground`}>{r.lastScan}</td>
                  <td className={td}><span className={`status ${scanStatusClass(r.scanStatus)}`}>{r.scanStatus}</span></td>
                  <td className={td}>{openFindings(r.id)}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    <Button variant="ghost" size="sm" onClick={() => setForm({ open: true, repo: r })}>Ubah</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDel(r)}>Hapus</Button>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">{repos.length ? "Tidak ada repository yang cocok dengan pencarian atau filter." : "Belum ada repository. Tambahkan repository untuk mulai memantau keamanan."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mb-7 grid gap-7 lg:grid-cols-[2fr_3fr]">
        <section className="rounded-md border bg-card p-5">
          <h2 className="text-sm font-semibold">Ringkasan Security Scan</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">Temuan terbuka per kategori · Data simulasi</p>
          <div className="mt-5 space-y-4">
            {scanCategories.map((c) => {
              const n = activeFindings.filter((f) => f.category === c).length;
              return (
                <div key={c}>
                  <div className="mb-1.5 flex justify-between text-xs"><span>{c}</span><span className="font-semibold">{n}</span></div>
                  <div className="h-1.5 rounded bg-muted"><div className="h-1.5 rounded bg-primary" style={{ width: `${(n / maxCat) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="overflow-hidden rounded-md border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Pipeline Run Terbaru</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">Seluruh eksekusi merupakan simulasi</p>
          </div>
          <PipelineTable runs={runs.slice(0, 8)} repoName={repoName} />
        </section>
      </div>

      <RepoForm key={form.repo?.id ?? (form.open ? "new-open" : "new")} open={form.open} repo={form.repo} onOpenChange={(o) => setForm({ open: o, repo: o ? form.repo : undefined })} />
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus repository?</AlertDialogTitle>
            <AlertDialogDescription>{del?.name} akan dihapus dari daftar demo lokal.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (del) deleteRepo(del.id); setDel(undefined); }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <YamlDialog open={yaml} onOpenChange={setYaml} />
      <ScanDialog open={scan} onOpenChange={setScan} repos={repos} />
    </>
  );
}

function PipelineTable({ runs, repoName }: { runs: ReturnType<typeof useRuns>; repoName: (id: string) => string }) {
  if (!runs.length) return <p className="px-5 py-10 text-center text-xs text-muted-foreground">Belum ada pipeline run tersimulasi.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead className="border-b bg-background text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>{["Workflow", "Repository", "Branch", "Commit", "Trigger", "Status", "Waktu"].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="border-b last:border-0">
              <td className={td}>{r.workflow}<p className="mt-1 text-[10px] text-muted-foreground">Simulasi</p></td>
              <td className={td}>{repoName(r.repoId)}</td>
              <td className={`${td} font-mono text-[11px]`}>{r.branch}</td>
              <td className={`${td} font-mono text-[11px]`}>{r.sha}</td>
              <td className={`${td} text-muted-foreground`}>{r.trigger}</td>
              <td className={td}><span className={`status ${scanStatusClass(r.status)}`}>{r.status}</span></td>
              <td className={`${td} whitespace-nowrap text-muted-foreground`}>{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function YamlDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  async function copy() {
    try { await navigator.clipboard.writeText(workflowYaml); toast.success("Template YAML disalin."); }
    catch { toast.error("Gagal menyalin. Salin teks secara manual."); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Integrasi GitHub Actions</DialogTitle>
          <DialogDescription>Pada fase backend berikutnya, workflow GitHub Actions akan menjalankan pemindaian di repository Anda lalu mengirim laporan hasil ke GRAZU-AI untuk dipantau.</DialogDescription>
        </DialogHeader>
        <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-medium text-warning">Template demonstrasi — belum terhubung dengan layanan GRAZU-AI.</p>
        <pre className="max-h-80 overflow-auto rounded-md border bg-background p-4 font-mono text-[11px] leading-5">{workflowYaml}</pre>
        <div className="flex justify-end"><Button onClick={copy}>Salin YAML</Button></div>
      </DialogContent>
    </Dialog>
  );
}

function ScanDialog({ open, onOpenChange, repos }: { open: boolean; onOpenChange: (o: boolean) => void; repos: Repository[] }) {
  const [repoId, setRepoId] = useState("");
  const [cats, setCats] = useState<ScanCategory[]>([...scanCategories]);
  const [phase, setPhase] = useState<"form" | "running" | "done">("form");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<ScanCategory[]>([]);

  function reset(o: boolean) {
    onOpenChange(o);
    if (!o) { setPhase("form"); setProgress(0); setRepoId(""); setCats([...scanCategories]); }
  }
  function run() {
    setPhase("running");
    const steps = cats.length;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setProgress(Math.round((i / steps) * 100));
      if (i >= steps) {
        clearInterval(t);
        recordSimulatedScan(repoId);
        setDone(cats);
        setPhase("done");
      }
    }, 350);
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Jalankan Simulasi Scan</DialogTitle>
          <DialogDescription>Simulasi lokal dengan hasil yang telah ditentukan. Tidak ada pemindai atau repository yang diakses.</DialogDescription>
        </DialogHeader>
        {phase === "form" && (
          <div className="space-y-4">
            <select aria-label="Pilih repository" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={repoId} onChange={(e) => setRepoId(e.target.value)}>
              <option value="">Pilih repository</option>
              {repos.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <div className="space-y-2.5">
              {scanCategories.map((c) => (
                <label key={c} className="flex items-center gap-2.5 text-xs">
                  <Checkbox checked={cats.includes(c)} onCheckedChange={() => setCats(cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c])} />
                  {c}
                </label>
              ))}
            </div>
            <Button className="w-full" disabled={!repoId || !cats.length} onClick={run}>Jalankan Simulasi Scan</Button>
          </div>
        )}
        {phase === "running" && (
          <div className="py-6">
            <p className="mb-3 text-xs text-muted-foreground">Memproses simulasi... {progress}%</p>
            <div className="h-1.5 rounded bg-muted"><div className="h-1.5 rounded bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}
        {phase === "done" && (
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-primary">Hasil Simulasi</p>
            <ul className="divide-y rounded-md border text-xs">
              {done.map((c) => (
                <li key={c} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div><p className="font-medium">{c}</p><p className="mt-1 text-muted-foreground">{simulatedResults[c].text}</p></div>
                  <span className={`status ${severityClass(simulatedResults[c].severity)}`}>{simulatedResults[c].severity}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">Catatan simulasi ditambahkan ke riwayat pipeline.</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => reset(false)}>Tutup</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
