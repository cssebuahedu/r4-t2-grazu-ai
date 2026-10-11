import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/grazu/public-layout";
import { Metric, Panel } from "@/components/grazu/analytics-ui";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases } from "@/lib/use-cases";
import { count, demoNote, regionOf } from "@/lib/adoption";
import { regulatoryRefs } from "@/lib/policy";

export const Route = createFileRoute("/explore")({
  head: () => pageHead("Eksplorasi Adopsi AI Indonesia", "Informasi publik mengenai perkembangan pemanfaatan kecerdasan artifisial yang bertanggung jawab."),
  component: Explore,
});

function Bars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map((d) => d[1]));
  return (
    <ul className="grid gap-3">{data.map(([k, v]) => (
      <li key={k} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 text-xs">
        <span className="truncate">{k}</span>
        <span className="h-2 rounded-sm bg-muted"><span className="block h-2 rounded-sm bg-primary" style={{ width: `${(v / max) * 100}%` }} /></span>
        <span className="text-right tabular-nums">{v}</span>
      </li>))}</ul>
  );
}

function Explore() {
  // Hanya agregat — tidak menampilkan nama organisasi, temuan, atau endpoint.
  const list = useUseCases();
  const sort = (m: Map<string, number>) => [...m].sort((a, b) => b[1] - a[1]);
  return (
    <PublicLayout>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Eksplorasi Adopsi AI Indonesia</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Informasi publik mengenai perkembangan pemanfaatan kecerdasan artifisial yang bertanggung jawab.</p>
        </div>
        <span className="status status-warning">{demoNote}</span>
      </header>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Use case terdaftar" value={list.length} note="Simulasi" />
        <Metric label="Sektor" value={new Set(list.map((u) => u.sector)).size} note="Simulasi" />
        <Metric label="Provinsi" value={new Set(list.map((u) => u.province)).size} note="Simulasi" />
        <Metric label="Terverifikasi" value={list.filter((u) => u.status === "Terverifikasi").length} note="Simulasi" />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Distribusi Sektor" note="Data agregat simulasi"><Bars data={sort(count(list, (u) => u.sector))} /></Panel>
        <Panel title="Distribusi Wilayah" note="Data agregat simulasi"><Bars data={sort(count(list, (u) => regionOf(u.province)))} /></Panel>
      </div>
      <Panel title="Informasi Tata Kelola AI" note="Status dokumen sebagaimana tercatat; rujuk sumber resmi">
        <ul className="grid gap-4 md:grid-cols-2">{regulatoryRefs.map((r) => (
          <li key={r.id} className="border-t pt-3"><p className="text-sm font-medium">{r.name} <span className={`status ml-2 ${r.kind === "Resmi" ? "status-success" : "status-warning"}`}>{r.kind}</span></p><p className="mt-1 text-xs text-muted-foreground">{r.note}</p></li>))}</ul>
        <p className="mt-6 text-sm">Pelajari lebih lanjut di <Link to="/knowledge" className="font-medium text-link hover:underline">Pusat Pengetahuan GRAZU-AI</Link>.</p>
      </Panel>
    </PublicLayout>
  );
}
