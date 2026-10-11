import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Choice, DemoNotice, EvidenceTable, Metrics, StatusBadge, tableHead, th, td } from "@/components/grazu/compliance-ui";
import { controls, decisionMessage, regulations, reviewStatuses, summarize, useCompliance, useComplianceEvidence, type Review, type ReviewStatus } from "@/lib/compliance";
import { useUseCases } from "@/lib/use-cases";
import { pageHead } from "@/lib/grazu-navigation";

export const Route = createFileRoute("/app/reviews")({
  head: () => pageHead("Review & Verifikasi", "Peninjauan hasil assessment dan temuan yang memerlukan validasi manusia."),
  component: ReviewsPage,
});

const decisions: [string, ReviewStatus][] = [
  ["Setujui Hasil Review", "Disetujui (Simulasi)"],
  ["Minta Perbaikan", "Perbaikan Diminta"],
  ["Tandai Perlu Tinjauan Lanjutan", "Tinjauan Lanjutan"],
];

function ReviewsPage() {
  const { reviews, assessments } = useCompliance();
  const products = useUseCases();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [selected, setSelected] = useState<string>();
  const rows = reviews.map((r) => {
    const a = assessments.find((a) => a.id === r.assessmentId);
    return { r, p: products.find((p) => p.id === a?.productId) };
  });
  const filtered = rows.filter(({ r, p }) => (!q.trim() || `${r.id} ${p?.name ?? ""} ${p?.org ?? ""} ${r.reviewer}`.toLowerCase().includes(q.trim().toLowerCase())) && (!status || r.status === status) && (!priority || r.priority === priority));
  const review = reviews.find((r) => r.id === selected);
  return <>
    <header><h1 className="text-2xl font-semibold">Review & Verifikasi</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Peninjauan hasil assessment dan temuan yang memerlukan validasi manusia.</p></header>
    <DemoNotice />
    <Metrics items={reviewStatuses.map((s) => [s, reviews.filter((r) => r.status === s).length])} />
    <section>
      <h2 className="mb-4 text-base font-semibold">Antrean Review</h2>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input aria-label="Cari review" placeholder="Cari ID, produk, organisasi, atau peninjau…" value={q} onChange={(e) => setQ(e.target.value)} className="bg-card sm:max-w-xs" />
        <Choice label="Filter status review" value={status} onChange={setStatus} options={reviewStatuses} all="Semua status" />
        <Choice label="Filter prioritas" value={priority} onChange={setPriority} options={["Tinggi", "Sedang", "Rendah"]} all="Semua prioritas" />
      </div>
      <div className="overflow-x-auto border-y"><table className="w-full min-w-[980px] text-xs"><thead className={tableHead}><tr>{["ID Review", "Produk", "Organisasi", "Jenis Review", "Prioritas", "Status", "Peninjau", "Tanggal Diajukan", "Aksi"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map(({ r, p }) => <tr key={r.id} className="cursor-pointer border-b bg-card last:border-0 hover:bg-muted/40" onClick={() => setSelected(r.id)}>
          <td className={`${td} font-medium`}>{r.id}</td><td className={td}>{p?.name ?? "—"}</td><td className={td}>{p?.org ?? "—"}</td><td className={td}>{r.type}</td>
          <td className={td}><span className={`status ${r.priority === "Tinggi" ? "status-danger" : r.priority === "Sedang" ? "status-warning" : "status-info"}`}>{r.priority}</span></td>
          <td className={td}><StatusBadge status={r.status} /></td><td className={td}>{r.reviewer}</td><td className={td}>{r.submitted}</td>
          <td className={td}><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelected(r.id); }}>Tinjau</Button></td>
        </tr>)}{!filtered.length && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Tidak ada item review yang cocok dengan pencarian dan filter.</td></tr>}</tbody></table></div>
      <p className="mt-2 text-xs text-muted-foreground">{filtered.length} dari {reviews.length} item review simulasi.</p>
    </section>
    <Sheet open={!!review} onOpenChange={(o) => !o && setSelected(undefined)}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">{review && <ReviewDetail key={review.id} review={review} />}</SheetContent>
    </Sheet>
  </>;
}

function ReviewDetail({ review }: { review: Review }) {
  const { assessments, decideReview } = useCompliance();
  const a = assessments.find((a) => a.id === review.assessmentId);
  const p = useUseCases().find((p) => p.id === a?.productId);
  const evidence = useComplianceEvidence(p?.id ?? "");
  const [notes, setNotes] = useState(review.notes);
  const [decision, setDecision] = useState<ReviewStatus>(review.status === "Menunggu Review" ? "Disetujui (Simulasi)" : review.status);
  const [saved, setSaved] = useState(false);
  const counts = a ? summarize(a.results) : undefined;
  const pending = a?.results.filter((r) => r.status === "Tidak Terpenuhi" || r.status === "Perlu Ditinjau") ?? [];
  const regIds = [...new Set(pending.map((r) => controls.find((c) => c.id === r.controlId)?.regulationId))];
  return <>
    <SheetHeader><SheetTitle>{review.id} · {review.type}</SheetTitle><SheetDescription>Data review simulasi. Tidak ada keputusan resmi.</SheetDescription></SheetHeader>
    <div className="space-y-6 px-4 pb-8 text-sm">
      <section><h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Konteks Produk</h3>
        {p ? <><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.org} · {p.sector}</p><Link to="/app/use-cases/$id" params={{ id: p.id }} className="mt-1 inline-block text-xs text-primary hover:underline">Buka Produk {p.id}</Link></> : <p className="text-muted-foreground">Produk tidak tersedia.</p>}
      </section>
      {a && counts && <section><h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Ringkasan Penilaian</h3>
        <p className="text-xs">{counts.Terpenuhi} terpenuhi · {counts["Tidak Terpenuhi"]} tidak terpenuhi · {counts["Perlu Ditinjau"]} perlu ditinjau · {counts["Belum Diuji"]} belum diuji</p>
        <ul className="mt-2 space-y-1 text-xs">{pending.map((r) => <li key={r.controlId} className="flex justify-between gap-2"><span>{r.controlId} · {controls.find((c) => c.id === r.controlId)?.name}</span><StatusBadge status={r.status} /></li>)}</ul>
        <Link to="/app/compliance/assessments/$id" params={{ id: a.id }} className="mt-2 inline-block text-xs text-primary hover:underline">Buka Penilaian {a.id}</Link>
      </section>}
      <section><h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Temuan Terkait (Simulasi)</h3>
        {evidence.length ? <EvidenceTable evidence={evidence.filter((e) => e.status !== "Terpenuhi").slice(0, 6)} /> : <p className="text-xs text-muted-foreground">Tidak ada temuan terkait.</p>}
      </section>
      <section><h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Referensi Regulasi</h3>
        <ul className="space-y-1 text-xs">{regulations.filter((r) => regIds.includes(r.id)).map((r) => <li key={r.id}>{r.name} <span className={`status ${r.status === "Diterbitkan" ? "status-info" : "status-warning"}`}>{r.status}</span></li>)}</ul>
        {!regIds.length && <p className="text-xs text-muted-foreground">Tidak ada kontrol tertunda.</p>}
      </section>
      <section className="space-y-3 border-t pt-4">
        <label className="block text-xs font-medium" htmlFor="rev-notes">Catatan Peninjau</label>
        <Textarea id="rev-notes" value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} placeholder="Tulis catatan review…" />
        <Choice label="Keputusan review" value={decision} onChange={(v) => { setDecision(v as ReviewStatus); setSaved(false); }} options={decisions.map((d) => d[1])} />
        <div className="flex flex-wrap gap-2">{decisions.map(([label, s]) => <Button key={s} size="sm" variant={s === decision ? "default" : "outline"} onClick={() => { setDecision(s); decideReview(review.id, s, notes); setSaved(true); }}>{label}</Button>)}</div>
        <p className="text-xs">Status saat ini: <StatusBadge status={review.status} /></p>
        {saved && <p role="status" className="rounded-md border bg-muted p-3 text-xs">{decisionMessage}</p>}
      </section>
    </div>
  </>;
}
