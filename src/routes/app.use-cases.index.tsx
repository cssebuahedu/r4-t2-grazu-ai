import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageHead } from "@/lib/grazu-navigation";
import { filterUseCases, riskClass, riskLevels, sectors, statusClass, statuses, useUseCases } from "@/lib/use-cases";

export const Route = createFileRoute("/app/use-cases/")({
  head: () => pageHead("Registrasi Use Case AI", "Kelola pendaftaran dan pemantauan implementasi kecerdasan artifisial."),
  component: Registry,
});

const selectCls = "h-9 rounded-md border bg-card px-3 text-xs text-foreground";

function Registry() {
  const list = useUseCases();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [risk, setRisk] = useState("");
  const [status, setStatus] = useState("");
  const rows = filterUseCases(list, q, sector, risk, status);
  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Registrasi Use Case AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelola pendaftaran dan pemantauan implementasi kecerdasan artifisial.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/use-cases/new">+ Daftarkan Use Case</Link>
        </Button>
      </div>
      <section className="overflow-hidden rounded-md border bg-card">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama produk atau organisasi..."
            aria-label="Cari use case"
            className="h-9 w-full text-xs sm:w-72"
          />
          <select aria-label="Filter sektor" className={selectCls} value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="">Semua sektor</option>
            {sectors.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select aria-label="Filter risiko" className={selectCls} value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option value="">Semua tingkat risiko</option>
            {riskLevels.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select aria-label="Filter status" className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-xs">
            <thead className="border-b bg-background text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Nama Produk AI", "Organisasi", "Sektor", "Wilayah", "Tingkat Risiko", "Status", "Tanggal Pengajuan", "Aksi"].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b last:border-0 hover:bg-background"
                  onClick={() => navigate({ to: "/app/use-cases/$id", params: { id: row.id } })}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium">{row.name}</p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">{row.id}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{row.org}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.sector}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.city}, {row.province}</td>
                  <td className="px-5 py-4"><span className={`status ${riskClass(row.risk)}`}>{row.risk}</span></td>
                  <td className="px-5 py-4"><span className={`status ${statusClass(row.status)}`}>{row.status}</span></td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{row.date}</td>
                  <td className="px-5 py-4">
                    <Link
                      to="/app/use-cases/$id"
                      params={{ id: row.id }}
                      className="font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Lihat detail
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">Tidak ada use case yang sesuai dengan pencarian.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t px-5 py-3 text-[10px] text-muted-foreground">
          Menampilkan {rows.length} dari {list.length} use case · Data Simulasi
        </div>
      </section>
    </>
  );
}
