import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Choice, DemoNotice, Metrics, StatusBadge, tableHead, th, td } from "@/components/grazu/compliance-ui";
import { assessmentStatus, categories, controls, regulations, summarize, useCompliance, useComplianceEvidence } from "@/lib/compliance";
import { pageHead } from "@/lib/grazu-navigation";
import { sectors, useUseCases } from "@/lib/use-cases";

export const Route = createFileRoute("/app/compliance/")({
  head: () => pageHead("Kepatuhan Regulasi AI", "Pemantauan kontrol tata kelola, keamanan, dan etika AI dengan penilaian simulasi."),
  component: ComplianceDashboard,
});
function OpenFindings({ productId }: { productId: string }) {
  const evidence = useComplianceEvidence(productId);
  return <span>{evidence.filter((e) => e.status === "Terbuka").length}</span>;
}
function ComplianceDashboard() {
  const { assessments } = useCompliance();
  const products = useUseCases();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sector, setSector] = useState("");
  const rows = assessments.flatMap((a) => { const p = products.find((p) => p.id === a.productId); return p ? [{ a, p }] : []; });
  const filtered = rows.filter(({ a, p }) => (!q.trim() || `${a.id} ${p.name} ${p.org}`.toLowerCase().includes(q.trim().toLowerCase())) && (!status || assessmentStatus(a) === status) && (!sector || p.sector === sector));
  const totals = summarize(rows.flatMap(({ a }) => a.results));
  return <>
    <header><h1 className="text-2xl font-semibold">Kepatuhan Regulasi AI</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Pemantauan pemenuhan kontrol tata kelola, keamanan, dan etika kecerdasan artifisial.</p></header>
    <DemoNotice />
    <Metrics items={[["Produk AI Dinilai", rows.filter(({ a }) => assessmentStatus(a) !== "Belum Dinilai").length], ["Kontrol Terpenuhi", totals["Terpenuhi"]], ["Kontrol Perlu Ditinjau", totals["Perlu Ditinjau"]], ["Temuan Terbuka", totals["Tidak Terpenuhi"]]]} />
    <section className="mb-9"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">Ringkasan Kepatuhan Produk</h2><Button asChild variant="outline" size="sm"><Link to="/app/reviews">Buka Antrean Review</Link></Button></div>
      <div className="mb-4 flex flex-wrap gap-3"><Input aria-label="Cari penilaian kepatuhan" placeholder="Cari produk, organisasi, atau ID…" value={q} onChange={(e) => setQ(e.target.value)} className="bg-card sm:max-w-xs" /><Choice label="Filter status penilaian" value={status} onChange={setStatus} options={["Belum Dinilai", "Perlu Ditinjau", "Kontrol Terpenuhi (Simulasi)"]} all="Semua status penilaian" /><Choice label="Filter sektor" value={sector} onChange={setSector} options={sectors} all="Semua sektor" /></div>
      <div className="overflow-x-auto border-y"><table className="w-full min-w-[1020px] text-xs"><thead className={tableHead}><tr>{["Nama Produk AI", "Organisasi", "Sektor", "Status Penilaian", "Kontrol Terpenuhi", "Kontrol Perlu Tinjauan", "Terakhir Diperbarui", "Aksi"].map((h) => <th className={th} key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(({ a, p }) => { const c = summarize(a.results); return <tr key={a.id} className="border-b bg-card last:border-0 hover:bg-muted/40"><td className={td}><Link className="font-medium text-primary hover:underline" to="/app/compliance/assessments/$id" params={{ id: a.id }}>{p.name}</Link><p className="mt-1 text-muted-foreground">{a.id} · Simulasi</p></td><td className={td}>{p.org}</td><td className={td}>{p.sector}</td><td className={td}><StatusBadge status={assessmentStatus(a)} /></td><td className={td}>{c.Terpenuhi} / {a.results.length}</td><td className={td}>{c["Perlu Ditinjau"]}<p className="mt-1 text-muted-foreground">Bukti terbuka: <OpenFindings productId={p.id} /></p></td><td className={td}>{a.updated}</td><td className={td}><Button asChild variant="outline" size="sm"><Link to="/app/compliance/assessments/$id" params={{ id: a.id }}>Detail</Link></Button></td></tr>; })}{!filtered.length && <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Tidak ada penilaian yang cocok dengan pencarian dan filter.</td></tr>}</tbody></table></div>
      <p className="mt-2 text-xs text-muted-foreground">{filtered.length} dari {rows.length} penilaian simulasi · Temuan terbuka pada ringkasan menghitung kontrol tidak terpenuhi.</p>
    </section>
    <section className="mb-9"><h2 className="mb-4 text-base font-semibold">Referensi Regulasi</h2><div className="overflow-x-auto border-y"><table className="w-full min-w-[650px] text-xs"><thead className={tableHead}><tr>{["Dokumen", "Status Dokumen", "Keterangan"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>{regulations.map((r) => <tr key={r.id} className="border-b last:border-0"><td className={`${td} font-medium`}>{r.name}</td><td className={td}><span className={`status ${r.status === "Diterbitkan" ? "status-info" : "status-warning"}`}>{r.status}</span></td><td className={`${td} max-w-md leading-5`}>{r.description}</td></tr>)}</tbody></table></div></section>
    <section><h2 className="mb-4 text-base font-semibold">Ringkasan Kontrol Kepatuhan</h2><div className="overflow-x-auto border-y"><table className="w-full min-w-[680px] text-xs"><thead className={tableHead}><tr>{["Kategori", "Terpenuhi", "Tidak Terpenuhi", "Perlu Ditinjau", "Belum Diuji", "Tidak Berlaku"].map((h) => <th className={th} key={h}>{h}</th>)}</tr></thead><tbody>{categories.map((category) => { const ids = controls.filter((c) => c.category === category).map((c) => c.id); const counts = summarize(rows.flatMap(({ a }) => a.results.filter((r) => ids.includes(r.controlId)))); return <tr key={category} className="border-b last:border-0"><td className={`${td} font-medium`}>{category}</td>{Object.values(counts).map((n, i) => <td key={i} className={td}>{n}</td>)}</tr>; })}</tbody></table></div></section>
  </>;
}