import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases } from "@/lib/use-cases";
import { counts, detailFor, redTests, resultClass, severityClass, useRedTeam, type ResultStatus } from "@/lib/red-teaming";

export const Route = createFileRoute("/app/red-teaming/runs/$id")({
  head: ({ params }) => pageHead(`Laporan ${params.id}`, "Laporan hasil simulasi pengujian red teaming AI."),
  component: RunDetail,
});

const th = "px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground";
const td = "px-4 py-3 align-top";

function RunDetail() {
  const { id } = Route.useParams();
  const { runs, endpoints } = useRedTeam();
  const products = useUseCases();
  const [filter, setFilter] = useState<ResultStatus | "">("");
  const [open, setOpen] = useState<string | null>(null);
  const run = runs.find((r) => r.id === id);
  if (!run) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-lg font-semibold">Laporan tidak ditemukan</h1>
        <Button asChild variant="outline" className="mt-5"><Link to="/app/red-teaming">Kembali ke Red Teaming</Link></Button>
      </div>
    );
  }
  const ep = endpoints.find((e) => e.id === run.endpointId);
  const prod = products.find((p) => p.id === ep?.productId);
  const c = counts(run.results);
  const rows = run.results.filter((r) => !filter || r.status === filter);
  const openTest = redTests.find((t) => t.id === open);
  const openStatus = run.results.find((r) => r.testId === open)?.status ?? "Tidak Diuji";
  const d = openTest && detailFor(openTest, openStatus);

  return (
    <>
      <Link to="/app/red-teaming" className="text-xs text-muted-foreground hover:text-primary">← AI Red Teaming</Link>
      <header className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-[11px] text-muted-foreground">{run.id} · Hasil Simulasi</p>
          <h1 className="mt-1.5 text-2xl font-semibold">Laporan Pengujian {run.id}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <span><span className="text-muted-foreground">Produk: </span>{prod ? <Link to="/app/use-cases/$id" params={{ id: prod.id }} className="text-link hover:underline">{prod.name}</Link> : "—"}</span>
            <span><span className="text-muted-foreground">Endpoint: </span>{ep?.name ?? "Endpoint dihapus"}</span>
            <span><span className="text-muted-foreground">Tanggal: </span>{run.date}</span>
            <span className="status status-success">Simulasi selesai</span>
          </div>
        </div>
        <span className="status status-warning">MODE DEMO — Bukan sertifikasi resmi</span>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border md:grid-cols-4">
        {[["Total Pengujian", run.results.length], ["Lulus", c.passed], ["Gagal", c.failed], ["Tidak Diuji", c.skipped]].map(([k, v]) => (
          <div key={k} className="bg-card p-5"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-2 text-2xl font-semibold">{v}</p></div>
        ))}
      </section>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Hasil Simulasi</h2>
        <select aria-label="Filter status" className="h-9 rounded-md border bg-card px-3 text-xs" value={filter} onChange={(e) => setFilter(e.target.value as ResultStatus | "")}>
          <option value="">Semua status</option><option>Lulus</option><option>Gagal</option><option>Tidak Diuji</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[720px] text-xs">
          <thead className="border-b bg-muted/40"><tr><th className={th}>ID</th><th className={th}>Nama Pengujian</th><th className={th}>Status</th><th className={th}>Tingkat</th><th className={th}>Deskripsi</th><th className={th}></th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const t = redTests.find((x) => x.id === r.testId)!;
              return (
                <tr key={r.testId} className="border-b last:border-0">
                  <td className={`${td} text-muted-foreground`}>{t.id}</td>
                  <td className={`${td} font-medium`}>{t.name}</td>
                  <td className={td}><span className={`status ${resultClass(r.status)}`}>{r.status}</span></td>
                  <td className={td}><span className={`status ${severityClass(t.severity)}`}>{t.severity}</span></td>
                  <td className={`${td} text-muted-foreground`}>{t.description}</td>
                  <td className={`${td} text-right`}><Button size="sm" variant="ghost" onClick={() => setOpen(t.id)}>Detail</Button></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Tidak ada hasil dengan status ini.</td></tr>}
          </tbody>
        </table>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{openTest?.name}</SheetTitle>
            <SheetDescription>{openTest?.id} · Hasil Simulasi · {openStatus}</SheetDescription>
          </SheetHeader>
          {d && (
            <div className="space-y-5 px-4 pb-6 text-xs leading-5">
              <div><h3 className="font-semibold">Deskripsi Skenario</h3><p className="mt-1 text-muted-foreground">{d.scenario}</p></div>
              <div><h3 className="font-semibold">Contoh Request (simulasi)</h3><pre className="mt-1 overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px]">{d.request}</pre></div>
              <div><h3 className="font-semibold">Contoh Response (simulasi)</h3><pre className="mt-1 overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px]">{d.response}</pre></div>
              <div><h3 className="font-semibold">Penjelasan Temuan</h3><p className="mt-1 text-muted-foreground">{d.finding}</p></div>
              <div><h3 className="font-semibold">Rekomendasi Remediasi</h3><p className="mt-1 text-muted-foreground">{d.remediation}</p></div>
              <p className="border-t pt-4 text-[11px] text-muted-foreground">Data ilustratif. Tidak ada permintaan nyata yang dikirim ke endpoint.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
