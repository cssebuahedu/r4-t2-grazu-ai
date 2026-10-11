import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases } from "@/lib/use-cases";
import { analyticsSectors, monthLabel, project, regionOf, regions, scenarios, simulatedHistory, type Scenario } from "@/lib/adoption";
import { axisTick, Empty, Filter, FilterBar, Metric, PageHeader, Panel, tooltipStyle } from "@/components/grazu/analytics-ui";

export const Route = createFileRoute("/app/analytics/forecast")({
  head: () => pageHead("Prediksi Tren Adopsi AI", "Simulasi proyeksi perkembangan adopsi kecerdasan artifisial berdasarkan data historis."),
  component: ForecastPage,
});

const horizons = ["3 bulan", "6 bulan", "12 bulan"];
const names = Object.keys(scenarios) as Scenario[];

function ForecastPage() {
  const all = useUseCases();
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [horizon, setHorizon] = useState(horizons[1]!);
  const [scenario, setScenario] = useState<Scenario>("Moderat");
  const h = parseInt(horizon, 10);
  const current = all.filter((u) => (!region || regionOf(u.province) === region) && (!sector || u.sector === sector)).length;
  const hist = simulatedHistory(current, 12);
  const future = Array.from({ length: h }, (_, i) => {
    const s = i + 1;
    return { month: monthLabel(s), Konservatif: project(current, scenarios.Konservatif, s), Moderat: project(current, scenarios.Moderat, s), Optimistis: project(current, scenarios.Optimistis, s) };
  });
  const startMonth = hist[hist.length - 1]!.month;
  const chart = [
    ...hist.map((x, i) => ({ month: x.month, historis: x.value, proyeksi: i === hist.length - 1 ? x.value : undefined })),
    ...future.map((f) => ({ month: f.month, proyeksi: f[scenario] })),
  ];
  const projected = future[future.length - 1]![scenario];
  const growth = current ? ((projected - current) / current) * 100 : 0;

  return (
    <>
      <PageHeader title="Prediksi Tren Adopsi AI" subtitle="Simulasi proyeksi perkembangan adopsi kecerdasan artifisial berdasarkan data historis." label="Proyeksi ilustratif — Bukan hasil model prediksi nyata." />
      <FilterBar>
        <Filter label="Wilayah" value={region} onChange={setRegion} options={Object.keys(regions)} />
        <Filter label="Sektor" value={sector} onChange={setSector} options={analyticsSectors} />
        <Filter label="Horizon Proyeksi" value={horizon} onChange={setHorizon} options={horizons} all={null} />
        <div className="grid gap-1 text-[11px] font-medium text-muted-foreground sm:col-span-2">
          Skenario
          <div role="radiogroup" aria-label="Skenario" className="grid h-9 grid-cols-3 rounded-md border p-0.5">
            {names.map((n) => (
              <button key={n} type="button" role="radio" aria-checked={scenario === n} onClick={() => setScenario(n)} className={`rounded text-xs ${scenario === n ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </FilterBar>

      {current === 0 ? (
        <Panel title="Proyeksi"><Empty text="Belum ada use case terdaftar untuk filter ini, sehingga proyeksi tidak dapat disimulasikan." /></Panel>
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Use case terdaftar saat ini" value={current} note={`Registri GRAZU-AI per ${startMonth}`} />
            <Metric label="Proyeksi use case terdaftar" value={projected} note={`Skenario ${scenario}`} />
            <Metric label="Pertumbuhan ilustratif" value={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`} note={`Asumsi ${(scenarios[scenario] * 100).toFixed(0)}% per bulan`} />
            <Metric label="Horizon proyeksi" value={horizon} note={`${monthLabel(1)} – ${monthLabel(h)}`} />
          </div>
          <div className="mb-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Panel title="Historis vs Proyeksi" note="Garis utuh: riwayat kumulatif simulasi. Garis putus-putus: proyeksi skenario terpilih.">
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={chart} margin={{ left: 0, right: 16, top: 16, bottom: 16 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={axisTick} interval="preserveStartEnd" label={{ value: "Bulan", position: "insideBottom", offset: -10, fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={axisTick} width={36} label={{ value: "Use case", angle: -90, position: "insideLeft", fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine x={startMonth} stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ value: "Awal proyeksi", position: "insideTopLeft", fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <Line name="Historis (simulasi)" dataKey="historis" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
                    <Line name={`Proyeksi ${scenario}`} dataKey="proyeksi" stroke="var(--info)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Asumsi Proyeksi">
              <ul className="grid gap-2 text-xs leading-5 text-muted-foreground">
                <li>Proyeksi memakai asumsi pertumbuhan majemuk bulanan yang telah ditetapkan: Konservatif 2%, Moderat 4%, Optimistis 7%.</li>
                <li>Titik awal adalah jumlah use case di registri GRAZU-AI sesuai filter.</li>
                <li>Riwayat 12 bulan merupakan kurva simulasi, bukan catatan registrasi aktual.</li>
                <li>Tidak ada model machine learning yang dijalankan.</li>
                <li>Hasil bukan prediksi resmi pemerintah.</li>
              </ul>
            </Panel>
          </div>
          <Panel title="Tabel Proyeksi Bulanan">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    {["Bulan", "Jenis", "Nilai", "Konservatif", "Moderat", "Optimistis"].map((c) => <th key={c} className="whitespace-nowrap px-2 py-2 font-medium">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {hist.map((x) => (
                    <tr key={x.month} className="border-b">
                      <td className="px-2 py-2">{x.month}</td>
                      <td className="px-2 py-2 text-muted-foreground">Historis (simulasi)</td>
                      <td className="px-2 py-2 tabular-nums">{x.value}</td>
                      <td className="px-2 py-2 text-muted-foreground">—</td>
                      <td className="px-2 py-2 text-muted-foreground">—</td>
                      <td className="px-2 py-2 text-muted-foreground">—</td>
                    </tr>
                  ))}
                  {future.map((f) => (
                    <tr key={f.month} className="border-b last:border-0 bg-muted/30">
                      <td className="px-2 py-2">{f.month}</td>
                      <td className="px-2 py-2 text-muted-foreground">Proyeksi</td>
                      <td className="px-2 py-2 font-semibold tabular-nums">{f[scenario]}</td>
                      {names.map((n) => <td key={n} className={`px-2 py-2 tabular-nums ${n === scenario ? "font-semibold" : ""}`}>{f[n]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
