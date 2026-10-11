import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/grazu-navigation";
import { Panel, selectCls } from "@/components/grazu/analytics-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUseCases, type UseCase } from "@/lib/use-cases";
import { classify, detectIndicators } from "@/lib/assessments";
import { findings } from "@/lib/devsecops";
import { counts, useRedTeam } from "@/lib/red-teaming";

export const Route = createFileRoute("/app/reports")({
  head: () => pageHead("Pusat Laporan", "Ringkasan hasil pemantauan, assessment, keamanan, dan tata kelola AI."),
  component: ReportsPage,
});

const templates = [
  { id: "registry", name: "Laporan Registrasi Use Case AI", scope: "Inventarisasi use case dan status registrasi", sections: ["Ringkasan registri", "Distribusi sektor", "Status registrasi"] },
  { id: "risk", name: "Laporan Penilaian Risiko & Etika", scope: "Klasifikasi risiko simulasi dan tinjauan etika", sections: ["Klasifikasi risiko", "Indikator terdeteksi", "Tinjauan etika"] },
  { id: "red", name: "Laporan AI Red Teaming", scope: "Hasil pengujian adversarial endpoint", sections: ["Ringkasan pengujian", "Hasil per run"] },
  { id: "devsecops", name: "Laporan DevSecOps Security", scope: "Temuan keamanan repositori", sections: ["Ringkasan temuan", "Tingkat keparahan", "Status perbaikan"] },
  { id: "compliance", name: "Laporan Kepatuhan & Analitik Adopsi", scope: "Ringkasan kepatuhan dan tren adopsi", sections: ["Ringkasan kepatuhan", "Analitik adopsi"] },
] as const;
type Tpl = (typeof templates)[number];

const history = [
  { name: "Registrasi Use Case Q3 2026", type: "Registrasi Use Case", date: "30 Sep 2026", product: "Semua produk", status: "Selesai" },
  { name: "Risiko Analisis Citra Medis", type: "Risiko & Etika", date: "28 Sep 2026", product: "UC-003", status: "Selesai" },
  { name: "Red Teaming Asisten Layanan Publik", type: "AI Red Teaming", date: "25 Sep 2026", product: "UC-001", status: "Selesai" },
  { name: "DevSecOps Deteksi Anomali", type: "DevSecOps", date: "20 Sep 2026", product: "UC-002", status: "Draf" },
];

function ReportsPage() {
  const useCases = useUseCases();
  const { runs } = useRedTeam();
  const [tpl, setTpl] = useState<Tpl | null>(null);
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [period, setPeriod] = useState("Q3 2026");
  const [sections, setSections] = useState<string[]>([]);
  const [format, setFormat] = useState<"CSV" | "PDF">("CSV");
  const [preview, setPreview] = useState(false);

  const pick = (t: Tpl) => { setTpl(t); setName(t.name); setSections([...t.sections]); setProduct(""); setPreview(false); setFormat("CSV"); };
  const scope: UseCase[] = product ? useCases.filter((u) => u.id === product) : useCases;
  const stats = tpl ? buildStats(tpl.id, scope, runs) : [];

  const exportCsv = () => {
    const rows = [["Laporan", name], ["Produk/Organisasi", product ? `${scope[0]!.name} (${scope[0]!.org})` : "Semua produk"], ["Periode", period], ["Keterangan", "Laporan Simulasi"], [], ["Indikator", "Nilai"], ...stats.map((s) => [s.label, String(s.value)])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${name.replace(/\s+/g, "-").toLowerCase()}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Pusat Laporan</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ringkasan hasil pemantauan, assessment, keamanan, dan tata kelola AI.</p>
      </header>
      <Panel title="Templat Laporan" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead className="text-muted-foreground"><tr className="border-b">{["No", "Templat", "Cakupan", ""].map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{templates.map((t, i) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-3 pr-3 text-muted-foreground">{i + 1}</td>
                <td className="py-3 pr-3 font-medium">{t.name}</td>
                <td className="py-3 pr-3 text-muted-foreground">{t.scope}</td>
                <td className="py-3 text-right"><Button size="sm" variant="outline" onClick={() => pick(t)}>Konfigurasi</Button></td>
              </tr>))}</tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Riwayat Laporan" note="Riwayat simulasi — bukan laporan yang benar-benar dibuat">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead className="text-muted-foreground"><tr className="border-b">{["Nama", "Jenis", "Tanggal", "Produk", "Status"].map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{history.map((h) => (
              <tr key={h.name} className="border-b last:border-0">
                <td className="py-3 pr-3 font-medium">{h.name}</td><td className="py-3 pr-3">{h.type}</td><td className="py-3 pr-3">{h.date}</td><td className="py-3 pr-3">{h.product}</td>
                <td className="py-3"><span className={`status ${h.status === "Selesai" ? "status-success" : "status-info"}`}>{h.status}</span></td>
              </tr>))}</tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={!!tpl} onOpenChange={(o) => !o && setTpl(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {tpl && (<>
            <DialogHeader><DialogTitle>Konfigurasi Laporan</DialogTitle><DialogDescription>{tpl.name}</DialogDescription></DialogHeader>
            <div className="grid gap-4 text-xs sm:grid-cols-2">
              <label className="grid gap-1 font-medium text-muted-foreground">Nama laporan<Input className="h-9 text-xs" value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label className="grid gap-1 font-medium text-muted-foreground">Jenis laporan<Input className="h-9 text-xs" value={tpl.name} readOnly /></label>
              <label className="grid gap-1 font-medium text-muted-foreground">Produk / organisasi
                <select className={selectCls} value={product} onChange={(e) => setProduct(e.target.value)}>
                  <option value="">Semua produk</option>
                  {useCases.map((u) => <option key={u.id} value={u.id}>{u.id} — {u.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1 font-medium text-muted-foreground">Periode pelaporan
                <select className={selectCls} value={period} onChange={(e) => setPeriod(e.target.value)}>{["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"].map((p) => <option key={p}>{p}</option>)}</select>
              </label>
              <fieldset className="grid gap-2"><legend className="mb-1 font-medium text-muted-foreground">Bagian laporan</legend>
                {tpl.sections.map((s) => (
                  <label key={s} className="flex items-center gap-2"><Checkbox checked={sections.includes(s)} onCheckedChange={(c) => setSections(c ? [...sections, s] : sections.filter((x) => x !== s))} />{s}</label>))}
              </fieldset>
              <fieldset className="grid gap-2"><legend className="mb-1 font-medium text-muted-foreground">Format</legend>
                <label className="flex items-center gap-2"><input type="radio" name="fmt" checked={format === "CSV"} onChange={() => setFormat("CSV")} />CSV</label>
                <label className="flex items-center gap-2 text-muted-foreground"><input type="radio" name="fmt" disabled />PDF (belum tersedia)</label>
                <p className="text-[11px] text-muted-foreground">Ekspor PDF belum diimplementasikan pada tahap demo ini.</p>
              </fieldset>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setPreview(true)}>Pratinjau Laporan</Button>
              <Button onClick={exportCsv} disabled={!name.trim()}>Buat Laporan (CSV)</Button>
            </div>
            {preview && (
              <article className="relative mt-2 rounded-md border bg-card p-5" aria-label="Pratinjau laporan">
                <span className="status status-warning absolute right-4 top-4">LAPORAN SIMULASI</span>
                <h3 className="pr-36 text-lg font-semibold">{name || tpl.name}</h3>
                <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                  <div>Produk/organisasi: <span className="text-foreground">{product ? `${scope[0]!.name} — ${scope[0]!.org}` : "Semua produk"}</span></div>
                  <div>Periode: <span className="text-foreground">{period}</span></div>
                  <div>Dibuat: <span className="text-foreground">{new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                </dl>
                <p className="mt-4 text-sm leading-6">Ringkasan {tpl.scope.toLowerCase()} berdasarkan data demo GRAZU-AI untuk {scope.length} produk. Angka berikut merupakan simulasi.</p>
                {sections.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Bagian: {sections.join(", ")}</p>}
                <table className="mt-4 w-full text-left text-xs"><tbody>{stats.map((s) => (
                  <tr key={s.label} className="border-t"><td className="py-2">{s.label}</td><td className="py-2 text-right font-medium tabular-nums">{s.value}</td></tr>))}</tbody></table>
              </article>)}
          </>)}
        </DialogContent>
      </Dialog>
    </>
  );
}

function buildStats(id: Tpl["id"], list: UseCase[], runs: ReturnType<typeof useRedTeam>["runs"]) {
  const ids = new Set(list.map((u) => u.id));
  const risk = list.map((u) => classify(detectIndicators(u)));
  const f = findings;
  const all = runs.flatMap((r) => r.results);
  switch (id) {
    case "registry": return [{ label: "Jumlah use case", value: list.length }, { label: "Terverifikasi", value: list.filter((u) => u.status === "Terverifikasi").length }, { label: "Dalam penilaian", value: list.filter((u) => u.status === "Dalam penilaian").length }, { label: "Sektor tercakup", value: new Set(list.map((u) => u.sector)).size }];
    case "risk": return [{ label: "Produk dinilai", value: list.length }, { label: "Risiko tinggi (simulasi)", value: risk.filter((r) => r === "Tinggi").length }, { label: "Risiko rendah (simulasi)", value: risk.filter((r) => r === "Rendah").length }, { label: "Memproses data sensitif", value: list.filter((u) => u.sensitiveData === "Ya").length }];
    case "red": { const c = counts(all); return [{ label: "Jumlah run pengujian", value: runs.length }, { label: "Uji lulus", value: c.passed }, { label: "Uji gagal", value: c.failed }, { label: "Tidak diuji", value: c.skipped }]; }
    case "devsecops": return [{ label: "Total temuan", value: f.length }, { label: "Critical/High", value: f.filter((x) => x.severity === "Critical" || x.severity === "High").length }, { label: "Belum diperbaiki", value: f.filter((x) => x.status !== "Diperbaiki").length }, { label: "Produk dalam cakupan", value: ids.size }];
    case "compliance": return [{ label: "Produk terdaftar/terverifikasi", value: list.filter((u) => u.status === "Terdaftar" || u.status === "Terverifikasi").length }, { label: "Memproses data pribadi", value: list.filter((u) => u.personalData === "Ya").length }, { label: "Provinsi tercakup", value: new Set(list.map((u) => u.province)).size }];
  }
}
