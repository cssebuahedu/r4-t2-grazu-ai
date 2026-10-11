import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EndpointForm } from "@/components/grazu/endpoint-form";
import { pageHead } from "@/lib/grazu-navigation";
import { validateProductSearch } from "@/lib/assessments";
import { useUseCases } from "@/lib/use-cases";
import {
  addRun,
  counts,
  deleteEndpoint,
  redTests,
  severityClass,
  useRedTeam,
  type Endpoint,
} from "@/lib/red-teaming";

export const Route = createFileRoute("/app/red-teaming/")({
  validateSearch: validateProductSearch,
  head: () =>
    pageHead(
      "AI Red Teaming",
      "Pengujian ketahanan dan keamanan sistem kecerdasan artifisial melalui simulasi skenario adversarial.",
    ),
  component: RedTeaming,
});

const th = "px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground";
const td = "px-4 py-3 align-top";

function RedTeaming() {
  const { product } = Route.useSearch();
  const navigate = useNavigate({ from: "/app/red-teaming/" });
  const { endpoints, runs } = useRedTeam();
  const products = useUseCases();
  const pName = (id: string) => products.find((p) => p.id === id)?.name ?? id;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Endpoint | undefined>();
  const [viewing, setViewing] = useState<Endpoint | undefined>();
  const [epQuery, setEpQuery] = useState("");
  const lastRunLabel = (id: string) => {
    const r = runs.find((x) => x.endpointId === id);
    if (!r) return "Belum pernah diuji (simulasi)";
    const k = counts(r.results);
    return `${r.id} · ${r.date} · ${k.passed} lulus, ${k.failed} gagal (simulasi)`;
  };

  const visibleEps = endpoints.filter(
    (e) =>
      (!product || e.productId === product) &&
      (e.name + e.url + pName(e.productId)).toLowerCase().includes(epQuery.toLowerCase()),
  );
  const allResults = runs.flatMap((r) => r.results);
  const c = counts(allResults);
  const failedByTest = redTests
    .map((t) => ({ t, n: allResults.filter((r) => r.testId === t.id && r.status === "Gagal").length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">AI Red Teaming</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Pengujian ketahanan dan keamanan sistem kecerdasan artifisial melalui simulasi skenario adversarial.
          </p>
        </div>
        <span className="status status-warning">MODE DEMO — Tidak ada pengujian endpoint sungguhan</span>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-4">
        {[
          ["Endpoint Terdaftar", endpoints.length],
          ["Total Pengujian", c.passed + c.failed],
          ["Pengujian Berhasil", c.passed],
          ["Temuan Kerentanan", c.failed],
        ].map(([k, v]) => (
          <div key={k} className="bg-card p-5">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="mt-2 text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Endpoint AI Terdaftar</h2>
            <p className="mt-1 text-xs text-muted-foreground">Konfigurasi disimulasikan; tidak ada koneksi ke URL yang dimasukkan.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter produk"
              className="h-9 rounded-md border bg-card px-3 text-xs"
              value={product ?? ""}
              onChange={(e) => navigate({ search: e.target.value ? { product: e.target.value } : {} })}
            >
              <option value="">Semua produk</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
            </select>
            <Input placeholder="Cari endpoint…" className="h-9 w-44 text-xs" value={epQuery} onChange={(e) => setEpQuery(e.target.value)} />
            <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}>+ Tambah Endpoint</Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-md border bg-card">
          <table className="w-full min-w-[760px] text-xs">
            <thead className="border-b bg-muted/40"><tr><th className={th}>ID</th><th className={th}>Nama</th><th className={th}>Produk AI</th><th className={th}>Method</th><th className={th}>Autentikasi</th><th className={th}>Environment</th><th className={th}><span className="sr-only">Aksi</span></th></tr></thead>
            <tbody>
              {visibleEps.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className={`${td} text-muted-foreground`}>{e.id}</td>
                  <td className={td}><p className="font-medium">{e.name}</p><p className="mt-1 max-w-[260px] truncate font-mono text-[10px] text-muted-foreground">{e.url}</p></td>
                  <td className={td}><Link to="/app/use-cases/$id" params={{ id: e.productId }} className="text-link hover:underline">{pName(e.productId)}</Link></td>
                  <td className={td}>{e.method}</td>
                  <td className={td}>{e.authType}{e.hasCredential && <span className="ml-1 text-muted-foreground">· ••••</span>}</td>
                  <td className={td}><span className={`status ${e.env === "Production" ? "status-warning" : "status-info"}`}>{e.env}</span></td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Button size="sm" variant="ghost" onClick={() => setViewing(e)}>Detail</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(e); setFormOpen(true); }}>Edit</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm(`Hapus ${e.name}?`)) deleteEndpoint(e.id); }}>Hapus</Button>
                  </td>
                </tr>
              ))}
              {!visibleEps.length && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Belum ada endpoint{product ? ` untuk ${pName(product)}` : ""}. Tambahkan endpoint untuk memulai simulasi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Simulation endpoints={endpoints} pName={pName} defaultEp={visibleEps[0]?.id} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="mb-3 text-base font-semibold">Riwayat Pengujian</h2>
          <div className="overflow-x-auto rounded-md border bg-card">
            <table className="w-full min-w-[560px] text-xs">
              <thead className="border-b bg-muted/40"><tr><th className={th}>Run</th><th className={th}>Endpoint</th><th className={th}>Tanggal</th><th className={th}>Lulus</th><th className={th}>Gagal</th><th className={th}></th></tr></thead>
              <tbody>
                {runs.map((r) => {
                  const rc = counts(r.results);
                  const ep = endpoints.find((e) => e.id === r.endpointId);
                  return (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className={`${td} font-medium`}>{r.id}</td>
                      <td className={td}>{ep?.name ?? <span className="text-muted-foreground">Endpoint dihapus</span>}</td>
                      <td className={td}>{r.date}</td>
                      <td className={td}>{rc.passed}</td>
                      <td className={td}>{rc.failed > 0 ? <span className="status status-danger">{rc.failed}</span> : 0}</td>
                      <td className={`${td} text-right`}><Link to="/app/red-teaming/runs/$id" params={{ id: r.id }} className="text-link hover:underline">Lihat laporan</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-base font-semibold">Ringkasan Temuan</h2>
          <div className="rounded-md border bg-card">
            {failedByTest.map(({ t, n }) => (
              <div key={t.id} className="flex items-center justify-between gap-3 border-b px-4 py-3 text-xs last:border-0">
                <div><p className="font-medium">{t.name}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{t.category}</p></div>
                <div className="flex items-center gap-3"><span className={`status ${severityClass(t.severity)}`}>{t.severity}</span><span className="w-12 text-right text-muted-foreground">{n} temuan</span></div>
              </div>
            ))}
            {!failedByTest.length && <p className="px-4 py-10 text-center text-xs text-muted-foreground">Belum ada temuan.</p>}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Hasil simulasi, bukan sertifikasi keamanan resmi.</p>
        </section>
      </div>

      <EndpointForm open={formOpen} onOpenChange={setFormOpen} editing={editing} defaultProduct={product} />
      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(undefined)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader><SheetTitle>{viewing?.name}</SheetTitle><SheetDescription>{viewing?.id} · Konfigurasi simulasi</SheetDescription></SheetHeader>
          {viewing && (
            <dl className="mt-4 space-y-4 px-4 pb-6 text-xs">
              {([
                ["Produk AI", pName(viewing.productId)],
                ["URL Endpoint", viewing.url],
                ["HTTP Method", viewing.method],
                ["API Type", viewing.apiType],
                ["Autentikasi", viewing.authType],
                ["Status Kredensial", viewing.authType === "None" ? "Tidak diperlukan" : viewing.hasCredential ? "Terkonfigurasi •••••••• (disamarkan, tidak disimpan)" : "Belum dikonfigurasi"],
                ["Content-Type", viewing.contentType],
                ["Field Session ID", viewing.sessionField || "—"],
                ["Response JSON Path", viewing.responsePath],
                ["Format Response", viewing.responseFormat],
                ["Path Response Error", viewing.errorPath || "—"],
                ["Status Uji Simulasi Terakhir", lastRunLabel(viewing.id)],
                ["Environment", viewing.env],
              ] as const).map(([k, v]) => (
                <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="mt-1 break-all">{v}</dd></div>
              ))}
              <div><dt className="text-muted-foreground">Request Body Template</dt><dd><pre className="mt-1 overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px]">{viewing.bodyTemplate}</pre></dd></div>
            </dl>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Simulation({ endpoints, pName, defaultEp }: { endpoints: Endpoint[]; pName: (id: string) => string; defaultEp?: string | undefined }) {
  const navigate = useNavigate();
  const [ep, setEp] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [doneRun, setDoneRun] = useState<string | null>(null);
  const { runs } = useRedTeam();

  useEffect(() => {
    if (!ep && defaultEp) setEp(defaultEp);
  }, [defaultEp, ep]);

  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const t = setTimeout(() => setProgress(progress + 20), 350);
    return () => clearTimeout(t);
  }, [progress]);
  useEffect(() => {
    if (progress === 100) {
      setDoneRun(addRun(ep, sel));
      setProgress(null);
    }
  }, [progress, ep, sel]);

  const list = redTests.filter((t) => (t.id + t.name + t.category).toLowerCase().includes(q.toLowerCase()));
  const allSel = list.length > 0 && list.every((t) => sel.includes(t.id));
  const toggle = (id: string) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);

  function run() {
    if (!endpoints.some((e) => e.id === ep)) return setError("Pilih endpoint AI terlebih dahulu.");
    if (!sel.length) return setError("Pilih minimal satu pengujian dari katalog.");
    setError("");
    setDoneRun(null);
    setProgress(0);
  }
  const done = runs.find((r) => r.id === doneRun);
  const dc = done && counts(done.results);

  return (
    <section className="rounded-md border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b p-5">
        <div>
          <h2 className="text-base font-semibold">Katalog Pengujian Red Team</h2>
          <p className="mt-1 text-xs text-muted-foreground">Pilih endpoint dan pengujian, lalu jalankan simulasi. Tidak ada prompt yang dikirim ke sistem AI.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Pilih endpoint" className="h-9 rounded-md border bg-card px-3 text-xs" value={ep} onChange={(e) => setEp(e.target.value)}>
            <option value="">Pilih endpoint…</option>
            {endpoints.map((e) => <option key={e.id} value={e.id}>{e.name} · {pName(e.productId)}</option>)}
          </select>
          <Input placeholder="Cari pengujian…" className="h-9 w-44 text-xs" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className={`${th} w-10`}><Checkbox aria-label="Pilih semua" checked={allSel} onCheckedChange={() => setSel(allSel ? sel.filter((s) => !list.some((t) => t.id === s)) : [...new Set([...sel, ...list.map((t) => t.id)])])} /></th>
              <th className={th}>ID</th><th className={th}>Nama Pengujian</th><th className={th}>Kategori</th><th className={th}>Deskripsi</th><th className={th}>Prioritas</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="cursor-pointer border-b last:border-0 hover:bg-muted/30" onClick={() => toggle(t.id)}>
                <td className={td} onClick={(e) => e.stopPropagation()}><Checkbox aria-label={`Pilih ${t.name}`} checked={sel.includes(t.id)} onCheckedChange={() => toggle(t.id)} /></td>
                <td className={`${td} text-muted-foreground`}>{t.id}</td>
                <td className={`${td} font-medium`}>{t.name}</td>
                <td className={td}>{t.category}</td>
                <td className={`${td} text-muted-foreground`}>{t.description}</td>
                <td className={td}><span className={`status ${severityClass(t.severity)}`}>{t.severity}</span></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Tidak ada pengujian yang cocok.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t p-5">
        <p className="text-xs text-muted-foreground">{sel.length} dari {redTests.length} pengujian dipilih</p>
        <div className="flex items-center gap-3">
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          <Button onClick={run} disabled={progress !== null}>{progress !== null ? "Menjalankan…" : "Jalankan Simulasi"}</Button>
        </div>
      </div>
      {progress !== null && (
        <div className="border-t p-5">
          <p className="mb-2 text-xs">Menjalankan simulasi {sel.length} pengujian… {progress}%</p>
          <Progress value={progress} />
        </div>
      )}
      {done && dc && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 p-5 text-xs">
          <div>
            <p className="font-semibold">Hasil Simulasi · {done.id}</p>
            <p className="mt-1 text-muted-foreground">Lulus {dc.passed} · Gagal {dc.failed} · Tidak Diuji {dc.skipped}</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: "/app/red-teaming/runs/$id", params: { id: done.id } })}>Lihat laporan</Button>
        </div>
      )}
    </section>
  );
}
