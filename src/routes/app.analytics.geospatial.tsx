import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { pageHead } from "@/lib/grazu-navigation";
import { riskLevels, useUseCases, type UseCase } from "@/lib/use-cases";
import { analyticsSectors, count, demoNote, prioritySlotOf, prioritySlots, provinces, regions } from "@/lib/adoption";
import { Filter, FilterBar, Metric, PageHeader, Panel } from "@/components/grazu/analytics-ui";

export const Route = createFileRoute("/app/analytics/geospatial")({
  head: () => pageHead("Pemetaan Geospasial AI", "Visualisasi persebaran use case kecerdasan artifisial dan identifikasi wilayah prioritas pembinaan."),
  component: GeoPage,
});

interface Row { p: string; list: UseCase[]; n: number; gap: number; risk: number; score: number; action: string }

// Metode skor ilustratif (demo):
// Kesenjangan = 100 − min(100, jumlah use case × 25)
// Perhatian risiko = rata-rata bobot risiko (Rendah 0, Sedang 50, Tinggi 100)
// Skor prioritas = 0,6 × kesenjangan + 0,4 × perhatian risiko
const weight = { Rendah: 0, Sedang: 50, Tinggi: 100 } as const;
function score(p: string, list: UseCase[]): Row {
  const n = list.length;
  const gap = 100 - Math.min(100, n * 25);
  const risk = n ? Math.round(list.reduce((s, u) => s + weight[u.risk], 0) / n) : 0;
  const sc = Math.round(0.6 * gap + 0.4 * risk);
  const action = n === 0 ? "Sosialisasi dan pendataan awal" : risk >= 60 ? "Pendampingan tata kelola risiko" : gap >= 50 ? "Peningkatan kapasitas dan inkubasi" : "Pemantauan berkala";
  return { p, list, n, gap, risk, score: sc, action };
}

type SortKey = "score" | "n" | "gap" | "risk" | "p";
const cols: [SortKey | null, string][] = [[null, "Ranking"], ["p", "Provinsi"], ["n", "Use Case Terdaftar"], ["gap", "Indikator Kesenjangan"], ["risk", "Indikator Perhatian Risiko"], ["score", "Skor Prioritas (Demo)"], [null, "Rekomendasi Intervensi"]];

function GeoPage() {
  const all = useUseCases();
  const [province, setProvince] = useState("");
  const [sector, setSector] = useState("");
  const [slot, setSlot] = useState("");
  const [risk, setRisk] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; desc: boolean }>({ k: "score", desc: true });
  const [open, setOpen] = useState<string | null>(null);
  const rows = all.filter((u) => (!sector || u.sector === sector) && (!slot || prioritySlotOf(u) === slot) && (!risk || u.risk === risk));
  const data = provinces.map((p) => score(p, rows.filter((u) => u.province === p)));
  const byP = new Map(data.map((d) => [d.p, d]));
  const rankOrder = [...data].sort((a, b) => b.score - a.score || a.p.localeCompare(b.p));
  const rank = new Map(rankOrder.map((d, i) => [d.p, i + 1]));
  const table = data
    .filter((d) => !province || d.p === province)
    .sort((a, b) => {
      const v = sort.k === "p" ? a.p.localeCompare(b.p) : a[sort.k] - b[sort.k];
      return (sort.desc ? -v : v) || a.p.localeCompare(b.p);
    });
  const max = Math.max(1, ...data.map((d) => d.n));
  const detail = open ? byP.get(open) : undefined;
  const covered = data.filter((d) => d.n).length;

  return (
    <>
      <PageHeader title="Pemetaan Geospasial AI" subtitle="Visualisasi persebaran use case kecerdasan artifisial dan identifikasi wilayah prioritas pembinaan." label={demoNote} />
      <FilterBar>
        <Filter label="Provinsi" value={province} onChange={setProvince} options={provinces} />
        <Filter label="Sektor" value={sector} onChange={setSector} options={analyticsSectors} />
        <Filter label="Bidang Prioritas" value={slot} onChange={setSlot} options={prioritySlots} />
        <Filter label="Kategori Risiko" value={risk} onChange={setRisk} options={riskLevels} />
      </FilterBar>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Use case terdaftar di GRAZU-AI" value={rows.length} note="Hanya produk yang didaftarkan ke registri" />
        <Metric label="Provinsi dengan data registri" value={`${covered} / ${provinces.length}`} />
        <Metric label="Estimasi adopsi AI populasi luas" value="Belum tersedia" note="Memerlukan survei atau data resmi; tidak diperkirakan dari registri" />
      </div>

      <Panel className="mb-6" title="Persebaran per Provinsi" note="Tampilan skematis berdasarkan kelompok wilayah — bukan batas geografis. Klik provinsi untuk detail.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(regions).map(([r, ps]) => (
            <div key={r}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{r}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ps.map((p) => {
                  const d = byP.get(p)!;
                  const dim = province && province !== p;
                  return (
                    <button key={p} type="button" onClick={() => setOpen(p)} className={`flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-left text-[11px] transition-colors hover:border-primary ${dim ? "opacity-40" : ""}`} style={d.n ? { background: `color-mix(in oklab, var(--primary) ${15 + (d.n / max) * 45}%, var(--card))` } : undefined}>
                      <span className="truncate">{p}</span>
                      <span className="font-semibold tabular-nums">{d.n}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Peringkat Prioritas Wilayah" note="Skor ilustratif: 0,6 × kesenjangan adopsi + 0,4 × perhatian risiko. Kesenjangan = 100 − min(100, use case × 25); risiko = rata-rata bobot (Rendah 0, Sedang 50, Tinggi 100).">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                {cols.map(([k, h]) => (
                  <th key={h} className="whitespace-nowrap px-2 py-2 font-medium">
                    {k ? (
                      <button type="button" className="hover:text-foreground" onClick={() => setSort((s) => ({ k, desc: s.k === k ? !s.desc : k !== "p" }))}>
                        {h}{sort.k === k ? (sort.desc ? " ↓" : " ↑") : ""}
                      </button>
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((d) => (
                <tr key={d.p} onClick={() => setOpen(d.p)} className="cursor-pointer border-b last:border-0 hover:bg-muted/50">
                  <td className="px-2 py-2 tabular-nums text-muted-foreground">{rank.get(d.p)}</td>
                  <td className="px-2 py-2 font-medium">{d.p}</td>
                  <td className="px-2 py-2 tabular-nums">{d.n}</td>
                  <td className="px-2 py-2 tabular-nums">{d.gap}</td>
                  <td className="px-2 py-2 tabular-nums">{d.n ? d.risk : "—"}</td>
                  <td className="px-2 py-2 font-semibold tabular-nums">{d.score}</td>
                  <td className="px-2 py-2">{d.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto bg-card sm:max-w-md">
          {detail && <Detail d={detail} rank={rank.get(detail.p)!} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Detail({ d, rank }: { d: Row; rank: number }) {
  const sec = [...count(d.list, (u) => u.sector)].sort((a, b) => b[1] - a[1]);
  const rc = count(d.list, (u) => u.risk);
  const gaps = [
    d.n === 0 && "Belum ada use case AI yang terdaftar dari provinsi ini.",
    d.n > 0 && sec.length < 3 && `Hanya ${sec.length} sektor yang terwakili dalam registri.`,
    d.n > 0 && d.list.every((u) => u.status === "Diajukan") && "Belum ada use case yang melalui penilaian.",
    d.gap >= 50 && "Indikator kesenjangan adopsi (demo) tergolong tinggi.",
  ].filter(Boolean) as string[];
  return (
    <div className="grid gap-5 text-sm">
      <div>
        <SheetTitle>{d.p}</SheetTitle>
        <SheetDescription className="mt-1 text-xs">Peringkat {rank} · Skor prioritas (demo) {d.score} · Data simulasi</SheetDescription>
      </div>
      <section>
        <h3 className="mb-2 text-xs font-semibold">Produk AI terdaftar ({d.n})</h3>
        {d.n ? (
          <ul className="grid gap-1.5 text-xs">
            {d.list.map((u) => <li key={u.id} className="rounded border px-2 py-1.5"><span className="font-medium">{u.name}</span> <span className="text-muted-foreground">· {u.org}</span></li>)}
          </ul>
        ) : <p className="text-xs text-muted-foreground">Belum ada produk terdaftar sesuai filter.</p>}
      </section>
      <section>
        <h3 className="mb-2 text-xs font-semibold">Sektor dominan</h3>
        <p className="text-xs text-muted-foreground">{sec.length ? sec.map(([s, n]) => `${s} (${n})`).join(", ") : "—"}</p>
      </section>
      <section>
        <h3 className="mb-2 text-xs font-semibold">Distribusi risiko awal</h3>
        <div className="flex flex-wrap gap-2">
          {riskLevels.map((r) => <span key={r} className={`status ${r === "Rendah" ? "status-success" : r === "Sedang" ? "status-warning" : "status-danger"}`}>{r}: {rc.get(r) ?? 0}</span>)}
        </div>
      </section>
      <section>
        <h3 className="mb-2 text-xs font-semibold">Kesenjangan teridentifikasi</h3>
        {gaps.length ? <ul className="list-disc pl-4 text-xs text-muted-foreground">{gaps.map((g) => <li key={g}>{g}</li>)}</ul> : <p className="text-xs text-muted-foreground">Tidak ada kesenjangan menonjol pada data demo.</p>}
      </section>
      <section>
        <h3 className="mb-2 text-xs font-semibold">Saran prioritas pengembangan</h3>
        <p className="text-xs">{d.action}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">Saran bersifat ilustratif dan bukan keputusan kebijakan.</p>
      </section>
    </div>
  );
}
