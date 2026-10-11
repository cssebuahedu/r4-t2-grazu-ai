import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/grazu-navigation";
import { Empty, Filter, FilterBar, Metric, PageHeader, Panel } from "@/components/grazu/analytics-ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { priorityClass, quickWins, recStatusClass, recommendations, regulatoryRefs, type Recommendation } from "@/lib/policy";

export const Route = createFileRoute("/app/policy")({
  head: () => pageHead("Intelijen Kebijakan AI", "Analisis prioritas dan rekomendasi kebijakan pengembangan kecerdasan artifisial di Indonesia."),
  component: PolicyPage,
});

const uniq = (k: keyof Recommendation) => [...new Set(recommendations.map((r) => r[k] as string))];

function PolicyPage() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<Recommendation | null>(null);
  const s = q.trim().toLowerCase();
  const list = recommendations.filter((r) => (!s || r.title.toLowerCase().includes(s) || r.id.toLowerCase().includes(s)) && (!region || r.region === region) && (!sector || r.sector === sector) && (!priority || r.priority === priority) && (!status || r.status === status));

  return (
    <>
      <PageHeader title="Intelijen Kebijakan AI" subtitle="Analisis prioritas dan rekomendasi kebijakan pengembangan kecerdasan artifisial di Indonesia." label="MODE DEMO — Rekomendasi kebijakan merupakan simulasi." />
      <p className="mb-6 rounded-md border bg-card px-4 py-3 text-xs text-muted-foreground">Seluruh rekomendasi bersifat ilustratif dan bukan keputusan kebijakan resmi pemerintah.</p>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total rekomendasi" value={recommendations.length} />
        <Metric label="Wilayah prioritas" value={new Set(recommendations.filter((r) => r.priority === "Tinggi").map((r) => r.region)).size} note="Prioritas tinggi" />
        <Metric label="Sektor prioritas" value={new Set(recommendations.filter((r) => r.priority === "Tinggi").map((r) => r.sector)).size} note="Prioritas tinggi" />
        <Metric label="Rekomendasi perlu review" value={recommendations.filter((r) => r.status === "Perlu Review").length} />
      </div>
      <FilterBar>
        <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">Cari
          <Input aria-label="Cari rekomendasi" className="h-9 text-xs" placeholder="Judul atau ID" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <Filter label="Wilayah" value={region} onChange={setRegion} options={uniq("region")} />
        <Filter label="Sektor" value={sector} onChange={setSector} options={uniq("sector")} />
        <Filter label="Prioritas" value={priority} onChange={setPriority} options={["Tinggi", "Sedang", "Rendah"]} />
        <Filter label="Status" value={status} onChange={setStatus} options={["Draf", "Perlu Review", "Ditinjau", "Diarsipkan"]} />
      </FilterBar>
      <Panel title="Daftar Rekomendasi Kebijakan" note="Ilustratif — berdasarkan analitik adopsi simulasi" className="mb-6">
        {list.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="text-muted-foreground"><tr className="border-b">{["ID", "Judul Kebijakan", "Wilayah", "Sektor", "Prioritas", "Status", ""].map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>{list.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-3 pr-3 text-muted-foreground">{r.id}</td>
                  <td className="py-3 pr-3 font-medium">{r.title}</td>
                  <td className="py-3 pr-3">{r.region}</td>
                  <td className="py-3 pr-3">{r.sector}</td>
                  <td className="py-3 pr-3"><span className={`status ${priorityClass(r.priority)}`}>{r.priority}</span></td>
                  <td className="py-3 pr-3"><span className={`status ${recStatusClass(r.status)}`}>{r.status}</span></td>
                  <td className="py-3 text-right"><Button size="sm" variant="outline" onClick={() => setOpen(r)}>Detail</Button></td>
                </tr>))}</tbody>
            </table>
          </div>)}
      </Panel>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Prioritas Quick Win" note="Simulasi" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="text-muted-foreground"><tr className="border-b">{["Wilayah", "Sektor", "Kesenjangan", "Quick win", "Prioritas"].map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>{quickWins.map((w) => (
                <tr key={w.region + w.sector} className="border-b last:border-0">
                  <td className="py-3 pr-3">{w.region}</td><td className="py-3 pr-3">{w.sector}</td><td className="py-3 pr-3">{w.gap}</td><td className="py-3 pr-3">{w.win}</td>
                  <td className="py-3"><span className={`status ${priorityClass(w.priority)}`}>{w.priority}</span></td>
                </tr>))}</tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Referensi Regulasi">
          <ul className="grid gap-4">{regulatoryRefs.map((r) => (
            <li key={r.id}><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{r.name}</p><span className={`status ${r.kind === "Resmi" ? "status-success" : "status-warning"}`}>{r.kind}</span></div><p className="mt-1 text-xs text-muted-foreground">{r.note}</p></li>))}</ul>
        </Panel>
      </div>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (<>
            <SheetHeader><SheetTitle>{open.title}</SheetTitle><SheetDescription>{open.id} · Ilustratif, bukan kebijakan resmi</SheetDescription></SheetHeader>
            <dl className="mt-6 grid gap-5 text-sm">
              <Field k="Identifikasi masalah">{open.problem}</Field>
              <Field k="Data pendukung (simulasi)"><ul className="list-disc pl-4">{open.data.map((d) => <li key={d}>{d}</li>)}</ul></Field>
              <Field k="Wilayah & sektor">{open.region} · {open.sector}</Field>
              <Field k="Intervensi yang disarankan">{open.intervention}</Field>
              <Field k="Hasil yang diharapkan">{open.outcome}</Field>
              <Field k="Referensi regulasi"><ul className="grid gap-1">{open.refs.map((id) => { const r = regulatoryRefs.find((x) => x.id === id)!; return <li key={id}>{r.name} <span className="text-xs text-muted-foreground">({r.kind === "Draf" ? "draf, belum mengikat" : "resmi"})</span></li>; })}</ul></Field>
              <Field k="Status"><span className={`status ${recStatusClass(open.status)}`}>{open.status}</span></Field>
              <Field k="Catatan reviewer">{open.notes || "Belum ada catatan."}</Field>
            </dl>
          </>)}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({ k, children }: { k: string; children: React.ReactNode }) {
  return <div><dt className="mb-1 text-xs font-medium text-muted-foreground">{k}</dt><dd className="leading-6">{children}</dd></div>;
}
