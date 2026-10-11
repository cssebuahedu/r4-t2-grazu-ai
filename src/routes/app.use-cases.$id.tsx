import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentsPanel } from "@/components/grazu/documents-panel";
import { pageHead } from "@/lib/grazu-navigation";
import { useRepos } from "@/lib/devsecops";
import { useRedTeam } from "@/lib/red-teaming";
import { riskClass, statusClass, useUseCases, type UseCase } from "@/lib/use-cases";

export const Route = createFileRoute("/app/use-cases/$id")({
  head: ({ params }) => pageHead(`Detail ${params.id}`, "Detail use case kecerdasan artifisial terdaftar."),
  component: Detail,
});

const future = [
  { value: "risk", label: "Risk Assessment", to: "/app/risk", module: "Penilaian Risiko" },
  { value: "ethics", label: "Ethics Assessment", to: "/app/ethics", module: "Etika AI" },
  { value: "endpoints", label: "AI Endpoints", to: "/app/red-teaming", module: "AI Red Teaming" },
  { value: "cicd", label: "CI/CD Repository", to: "/app/devsecops", module: "AI DevSecOps" },
  { value: "compliance", label: "Compliance", to: "/app/compliance", module: "Kepatuhan Regulasi" },
] as const;

function Fields({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 text-xs md:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="mt-1.5 leading-5">{v}</dd></div>
      ))}
    </dl>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const uc = useUseCases().find((u) => u.id === id);
  if (!uc) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-lg font-semibold">Use case tidak ditemukan</h1>
        <Button asChild variant="outline" className="mt-5"><Link to="/app/use-cases">Kembali ke registri</Link></Button>
      </div>
    );
  }
  return <DetailView uc={uc} />;
}

function DetailView({ uc }: { uc: UseCase }) {
  const repos = useRepos().filter((r) => r.productId === uc.id);
  const rt = useRedTeam();
  const endpoints = rt.endpoints.filter((e) => e.productId === uc.id);
  return (
    <>
      <Link to="/app/use-cases" className="text-xs text-muted-foreground hover:text-primary">← Registrasi Use Case AI</Link>
      <header className="mb-6 mt-3 border-b pb-6">
        <p className="text-[11px] text-muted-foreground">{uc.id} · Data Simulasi</p>
        <h1 className="mt-1.5 text-2xl font-semibold">{uc.name}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{uc.org}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <span><span className="text-muted-foreground">Sektor: </span>{uc.sector}</span>
          <span className={`status ${statusClass(uc.status)}`}>{uc.status}</span>
          <span className={`status ${riskClass(uc.risk)}`}>Risiko {uc.risk}</span>
          <span><span className="text-muted-foreground">Diajukan: </span>{uc.date}</span>
        </div>
      </header>
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proposal">Proposal</TabsTrigger>
            <TabsTrigger value="documents">Dokumen Proposal</TabsTrigger>
            {future.map((f) => <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>)}
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="mt-5 rounded-md border bg-card p-6">
          <p className="mb-6 max-w-3xl text-sm leading-6">{uc.description}</p>
          <Fields items={[["Jenis sistem AI", uc.systemType], ["Status pengembangan", uc.devStatus], ["Wilayah", `${uc.city}, ${uc.province}`], ["Bidang prioritas", uc.priorityArea], ["Target pengguna", uc.targetUsers], ["Jenis model", uc.modelType], ["Memproses data pribadi", uc.personalData], ["Menggunakan data sensitif", uc.sensitiveData]]} />
        </TabsContent>
        <TabsContent value="proposal" className="mt-5 space-y-6 rounded-md border bg-card p-6">
          <section><h2 className="mb-4 text-sm font-semibold">Pemanfaatan</h2><Fields items={[["Tujuan dan manfaat", uc.purpose], ["Target pengguna", uc.targetUsers]]} /></section>
          <section className="border-t pt-6"><h2 className="mb-4 text-sm font-semibold">Teknologi & Data</h2><Fields items={[["Penyedia model", uc.modelProvider], ["Sumber data", uc.dataSource], ["Jenis data", uc.dataTypes], ["Jenis model", uc.modelType]]} /></section>
          <section className="border-t pt-6"><h2 className="mb-4 text-sm font-semibold">Deklarasi Risiko & Tata Kelola</h2><Fields items={[["Deklarasi awal risiko", uc.risk], ["Potensi dampak", uc.impact], ["Pengawasan manusia", uc.humanOversight], ["Mitigasi risiko", uc.mitigation], ["Kebijakan keamanan dan privasi", uc.securityPolicy]]} /></section>
          <p className="text-[11px] text-muted-foreground">Deklarasi diisi oleh pengaju dan belum merupakan hasil penilaian resmi.</p>
        </TabsContent>
        <TabsContent value="documents" className="mt-5"><DocumentsPanel product={uc} /></TabsContent>
        {endpoints.length > 0 && (
          <TabsContent value="endpoints" className="mt-5 rounded-md border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">Endpoint terkait di modul AI Red Teaming · Data simulasi, belum diuji terhadap sistem nyata</p>
              <Button asChild variant="outline" size="sm"><Link to="/app/red-teaming" search={{ product: uc.id }}>Buka Red Teaming</Link></Button>
            </div>
            <ul className="divide-y text-xs">
              {endpoints.map((e) => {
                const last = rt.runs.filter((r) => r.endpointId === e.id).sort((a, b) => b.date.localeCompare(a.date))[0];
                return (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div><p className="font-medium">{e.id} · {e.name}</p><p className="mt-1 text-muted-foreground">{e.env} · {last ? `Simulasi terakhir ${last.date}` : "Belum ada riwayat simulasi"}</p></div>
                    {last && <Button asChild variant="outline" size="sm"><Link to="/app/red-teaming/runs/$id" params={{ id: last.id }}>Lihat laporan</Link></Button>}
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        )}
        {future.filter((f) => (f.value !== "cicd" || !repos.length) && (f.value !== "endpoints" || !endpoints.length)).map((f) => (
          <TabsContent key={f.value} value={f.value} className="mt-5">
            <section className="flex min-h-72 flex-col items-center justify-center border-y border-dashed px-5 text-center">
              <span className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-primary">BELUM DINILAI</span>
              <h2 className="mt-4 text-base font-semibold">{f.label} belum tersedia</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Belum ada hasil untuk {uc.name}. {f.value === "risk" || f.value === "ethics" ? `Jalankan simulasi melalui modul ${f.module}.` : `Proses ini akan dijalankan melalui modul ${f.module} pada tahap berikutnya.`}
              </p>
              {f.value === "risk" || f.value === "ethics" || f.value === "endpoints" ? (
                <Button asChild variant="outline" className="mt-5"><Link to={f.to} search={{ product: uc.id }}>Buka {f.module} untuk produk ini</Link></Button>
              ) : (
                <Button asChild variant="outline" className="mt-5"><Link to={f.to}>Buka modul {f.module}</Link></Button>
              )}
            </section>
          </TabsContent>
        ))}
        {repos.length > 0 && (
          <TabsContent value="cicd" className="mt-5 rounded-md border bg-card p-5">
            <p className="mb-4 text-[11px] text-muted-foreground">Repository terkait di modul AI DevSecOps · Data simulasi</p>
            <ul className="divide-y text-xs">
              {repos.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div><p className="font-medium">{r.name}</p><p className="mt-1 text-muted-foreground">Branch {r.branch} · Scan terakhir {r.lastScan}</p></div>
                  <Button asChild variant="outline" size="sm"><Link to="/app/devsecops/repositories/$id" params={{ id: r.id }}>Buka repository</Link></Button>
                </li>
              ))}
            </ul>
          </TabsContent>
        )}
        <TabsContent value="activity" className="mt-5 rounded-md border bg-card p-6">
          <div className="flex gap-3">
            <span className="activity-dot mt-1 shrink-0" />
            <div><p className="text-xs font-medium">Use case diajukan</p><p className="mt-1.5 text-[11px] text-muted-foreground">{uc.date} · {uc.org}</p></div>
          </div>
          <p className="mt-6 text-[11px] text-muted-foreground">Riwayat aktivitas lengkap akan tersedia pada tahap berikutnya.</p>
        </TabsContent>
      </Tabs>
    </>
  );
}
