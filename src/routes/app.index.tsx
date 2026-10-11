import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases, riskClass, statusClass } from "@/lib/use-cases";
import { useDemoRole } from "@/lib/demo-roles";
import { useOrganization } from "@/lib/organization";
import { assessmentStatus, useCompliance } from "@/lib/compliance";
import { findings, useRepos } from "@/lib/devsecops";

export const Route = createFileRoute("/app/")({
  head: () =>
    pageHead(
      "Dashboard",
      "Ringkasan tata kelola dan pemantauan kecerdasan artifisial di Indonesia.",
    ),
  component: Dashboard,
});
function Dashboard() {
  const { role } = useDemoRole();
  return role === "client" ? <ClientDashboard /> : <AdminDashboard />;
}

function ClientDashboard() {
  const { org, account, onboarded } = useOrganization();
  const products = useUseCases().filter((u) => u.org === org.key);
  const ids = new Set(products.map((p) => p.id));
  const pendingAssessments = useCompliance().assessments.filter((a) => ids.has(a.productId) && assessmentStatus(a) !== "Kontrol Terpenuhi (Simulasi)");
  const repoIds = new Set(useRepos().filter((r) => ids.has(r.productId)).map((r) => r.id));
  const openFindings = findings.filter((f) => repoIds.has(f.repoId) && f.status === "Terbuka");
  const activity = [
    ...products.map((p) => ({ k: `p-${p.id}`, title: `Use case ${p.name}`, text: `Status registrasi: ${p.status}`, date: p.date })),
    ...pendingAssessments.map((a) => ({ k: `a-${a.id}`, title: `Assessment ${a.id} perlu diselesaikan`, text: assessmentStatus(a), date: a.updated })),
  ].slice(0, 5);
  const kpis = [
    ["Organisasi aktif", org.name], ["Produk AI terdaftar", String(products.length)],
    ["Assessment perlu diselesaikan", String(pendingAssessments.length)], ["Temuan keamanan terbuka", String(openFindings.length)],
  ];
  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Organisasi</h1>
          <p className="mt-2 text-sm text-muted-foreground">Selamat datang, {account.name}. Ringkasan produk AI organisasi Anda.</p>
        </div>
        <Button asChild><Link to="/app/use-cases/new">Daftarkan Use Case AI</Link></Button>
      </div>
      {!onboarded && (
        <div role="note" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/30 bg-accent px-4 py-3 text-sm">
          <span>Lengkapi data akun dan organisasi Anda untuk memulai.</span>
          <Button asChild size="sm" variant="outline"><Link to="/app/onboarding">Mulai Onboarding</Link></Button>
        </div>
      )}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value]) => (
          <article key={label} className="rounded-md border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className={`mt-4 font-semibold ${label === "Organisasi aktif" ? "text-base" : "text-3xl"}`}>{value}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-sm font-semibold">Produk AI Organisasi</h2>
            <Button asChild variant="ghost" size="sm" className="text-primary"><Link to="/app/organization">Kelola organisasi</Link></Button>
          </div>
          <ul className="divide-y">
            {products.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 px-5 py-3 text-sm">
                <span><span className="font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{p.id}</span></span>
                <span className="flex gap-1.5"><span className={`status ${riskClass(p.risk)}`}>{p.risk}</span><span className={`status ${statusClass(p.status)}`}>{p.status}</span></span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-md border bg-card">
          <h2 className="border-b px-5 py-3 text-sm font-semibold">Aktivitas Terbaru</h2>
          <ul className="divide-y">
            {activity.map((a) => (
              <li key={a.k} className="px-5 py-3 text-sm"><p className="font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.text} · {a.date}</p></li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Seluruh informasi merupakan data demonstrasi.</p>
    </>
  );
}

function AdminDashboard() {
  const rows = useUseCases().slice(0, 5);
  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Ringkasan platform
          </div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Selamat datang, Admin. Berikut gambaran tata kelola AI nasional.
          </p>
        </div>
        <span className="mt-2 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
          Sabtu, 10 Oktober 2026
        </span>
      </div>
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Use Case AI",
            value: "128",
            change: "+12",
            detail: "use case bulan ini",
            tone: "primary",
          },
          {
            label: "Organisasi Terdaftar",
            value: "42",
            change: "+5",
            detail: "organisasi bulan ini",
            tone: "primary",
          },
          {
            label: "Assessment Risiko",
            value: "86",
            change: "67%",
            detail: "dari total use case",
            tone: "info",
          },
          {
            label: "Temuan Keamanan",
            value: "7",
            change: "3",
            detail: "memerlukan tindak lanjut",
            tone: "warning",
          },
        ].map((kpi) => (
          <article key={kpi.label} className="rounded-md border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <p className="mb-5 mt-4 text-3xl font-semibold">{kpi.value}</p>
            <p className="text-[11px] text-muted-foreground">
              <span
                className={
                  kpi.tone === "primary"
                    ? "mr-1.5 font-semibold text-primary"
                    : kpi.tone === "info"
                      ? "mr-1.5 font-semibold text-info"
                      : "mr-1.5 font-semibold text-warning"
                }
              >
                {kpi.change}
              </span>
              {kpi.detail}
            </p>
          </article>
        ))}
      </div>
      <section className="mb-7 overflow-hidden rounded-md border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5">
          <div>
            <h2 className="text-sm font-semibold">Use Case Terbaru</h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Penerapan AI yang baru terdaftar di platform.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/app/use-cases">
              Lihat semua <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b bg-background text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Use Case", "Organisasi", "Sektor", "Risiko", "Status", "Tanggal"].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-background">
                  <td className="px-5 py-4">
                    <p className="font-medium">{row.name}</p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">{row.id}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{row.org}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.sector}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`status ${row.risk === "Rendah" ? "status-success" : row.risk === "Sedang" ? "status-warning" : "status-danger"}`}
                    >
                      {row.risk}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`status ${row.status === "Dalam penilaian" ? "status-warning" : row.status === "Terverifikasi" ? "status-success" : "status-info"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t px-5 py-3 text-[10px] text-muted-foreground">
          Menampilkan 5 use case terbaru · Data demonstrasi
        </div>
      </section>
      <section className="border-y bg-card px-5 py-5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Aktivitas Terbaru</h2>
          <span className="text-[10px] text-muted-foreground">7 hari terakhir</span>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Use case baru terdaftar",
              text: "Asisten Layanan Publik berhasil ditambahkan ke inventaris.",
              time: "09 Okt 2026 · 14.30 WIB",
            },
            {
              title: "Penilaian risiko diperbarui",
              text: "Deteksi Anomali Transaksi memasuki tahap penilaian.",
              time: "09 Okt 2026 · 10.15 WIB",
            },
            {
              title: "Organisasi baru bergabung",
              text: "Universitas Cendekia terdaftar di platform.",
              time: "08 Okt 2026 · 09.00 WIB",
            },
          ].map((item) => (
            <article key={item.title} className="flex gap-3">
              <span className="activity-dot mt-1 shrink-0" />
              <div>
                <h3 className="text-xs font-medium">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.text}</p>
                <p className="mt-3 text-[10px] text-muted-foreground">{item.time}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <p className="my-6 text-[11px] text-muted-foreground">
        Seluruh informasi yang ditampilkan merupakan data demonstrasi, bukan data operasional.
      </p>
    </>
  );
}
