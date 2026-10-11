import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { pageHead } from "@/lib/grazu-navigation";
import { statuses, useUseCases } from "@/lib/use-cases";
import { analyticsSectors, assessed, count, demoNote, dominant, prioritySlotOf, prioritySlots, simulatedHistory } from "@/lib/adoption";
import { axisTick, Empty, Filter, FilterBar, Metric, PageHeader, Panel, tooltipStyle } from "@/components/grazu/analytics-ui";

export const Route = createFileRoute("/app/analytics/adoption")({
  head: () => pageHead("Analitik Adopsi AI Nasional", "Pemantauan perkembangan pemanfaatan kecerdasan artifisial berdasarkan wilayah, sektor, dan bidang prioritas."),
  component: AdoptionPage,
});

const periods = ["6 bulan terakhir", "12 bulan terakhir"];

function AdoptionPage() {
  const all = useUseCases();
  const [period, setPeriod] = useState(periods[1]!);
  const [province, setProvince] = useState("");
  const [sector, setSector] = useState("");
  const [slot, setSlot] = useState("");
  const [status, setStatus] = useState("");
  const provinceOpts = [...new Set(all.map((u) => u.province))].sort();
  const rows = all.filter(
    (u) => (!province || u.province === province) && (!sector || u.sector === sector) && (!slot || prioritySlotOf(u) === slot) && (!status || u.status === status),
  );
  const trend = simulatedHistory(rows.length, period.startsWith("6") ? 6 : 12);
  const sectorCounts = count(rows, (u) => u.sector);
  const sectorData = analyticsSectors.map((s) => ({ name: s, value: sectorCounts.get(s) ?? 0 }));
  const slotCounts = count(rows, prioritySlotOf);
  const maxSlot = Math.max(1, ...slotCounts.values());
  const regional = [...new Set(rows.map((u) => u.province))]
    .map((p) => {
      const list = rows.filter((u) => u.province === p);
      return { p, n: list.length, orgs: new Set(list.map((u) => u.org)).size, dom: dominant(list, (u) => u.sector), done: list.filter(assessed).length };
    })
    .sort((a, b) => b.n - a.n || a.p.localeCompare(b.p));

  return (
    <>
      <PageHeader title="Analitik Adopsi AI Nasional" subtitle="Pemantauan perkembangan pemanfaatan kecerdasan artifisial berdasarkan wilayah, sektor, dan bidang prioritas." label={demoNote} />
      <FilterBar>
        <Filter label="Periode" value={period} onChange={setPeriod} options={periods} all={null} />
        <Filter label="Provinsi" value={province} onChange={setProvince} options={provinceOpts} />
        <Filter label="Sektor" value={sector} onChange={setSector} options={analyticsSectors} />
        <Filter label="Bidang Prioritas AI" value={slot} onChange={setSlot} options={prioritySlots} />
        <Filter label="Status Use Case" value={status} onChange={setStatus} options={statuses} />
      </FilterBar>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total Use Case Terdaftar" value={rows.length} note="Sumber: registri GRAZU-AI" />
        <Metric label="Organisasi Penyedia AI" value={new Set(rows.map((u) => u.org)).size} />
        <Metric label="Wilayah Terdata" value={regional.length} note="Provinsi dengan minimal satu use case" />
        <Metric label="Use Case yang Telah Dinilai" value={rows.filter(assessed).length} note="Status selain Diajukan" />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Tren Registrasi Kumulatif" note="Kurva simulasi; nilai bulan terakhir sama dengan jumlah registri saat ini.">
          {rows.length ? (
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={trend} margin={{ left: 0, right: 12, top: 8, bottom: 16 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={axisTick} label={{ value: "Bulan", position: "insideBottom", offset: -10, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={axisTick} width={36} label={{ value: "Use case", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Use case (simulasi)"]} />
                  <Line dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} label={{ position: "top", fontSize: 10, fill: "var(--muted-foreground)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty />}
        </Panel>
        <Panel title="Distribusi per Sektor" note="Jumlah use case dalam registri menurut sektor.">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={sectorData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={axisTick} />
                <YAxis type="category" dataKey="name" tick={axisTick} width={92} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Use case"]} />
                <Bar dataKey="value" fill="var(--info)" radius={[0, 3, 3, 0]} label={{ position: "right", fontSize: 10, fill: "var(--muted-foreground)" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Distribusi Wilayah" note="Diurutkan berdasarkan jumlah use case.">
          {regional.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    {["#", "Provinsi", "Jumlah Use Case", "Jumlah Organisasi", "Sektor Dominan", "Status Assessment"].map((h) => <th key={h} className="whitespace-nowrap px-2 py-2 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {regional.map((r, i) => (
                    <tr key={r.p} className="border-b last:border-0">
                      <td className="px-2 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                      <td className="px-2 py-2 font-medium">{r.p}</td>
                      <td className="px-2 py-2 tabular-nums">{r.n}</td>
                      <td className="px-2 py-2 tabular-nums">{r.orgs}</td>
                      <td className="px-2 py-2">{r.dom}</td>
                      <td className="px-2 py-2"><span className={`status ${r.done === r.n ? "status-success" : r.done ? "status-warning" : "status-info"}`}>{r.done}/{r.n} dinilai</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty />}
        </Panel>
        <Panel title="Distribusi Bidang Prioritas" note="Slot katalog netral — nama resmi menunggu katalog terverifikasi.">
          <ul className="grid gap-2.5">
            {prioritySlots.map((s) => {
              const n = slotCounts.get(s) ?? 0;
              return (
                <li key={s} className="grid grid-cols-[130px_1fr_24px] items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{s}</span>
                  <span className="h-2 rounded-sm bg-muted"><span className="block h-2 rounded-sm bg-primary" style={{ width: `${(n / maxSlot) * 100}%` }} /></span>
                  <span className="text-right tabular-nums">{n}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}
