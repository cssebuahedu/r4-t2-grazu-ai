import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ProductSelector } from "@/components/grazu/product-selector";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases, type UseCase } from "@/lib/use-cases";
import {
  classify,
  confidenceLabel,
  detectIndicators,
  riskClassSim,
  riskRules,
  validateProductSearch,
  type DetectedIndicator,
  type SimRisk,
} from "@/lib/assessments";

export const Route = createFileRoute("/app/risk")({
  validateSearch: validateProductSearch,
  head: () =>
    pageHead(
      "Penilaian Risiko AI",
      "Simulasi analisis awal tingkat risiko pemanfaatan kecerdasan artifisial berdasarkan karakteristik use case.",
    ),
  component: RiskPage,
});

function RiskPage() {
  const { product } = Route.useSearch();
  const navigate = useNavigate({ from: "/app/risk" });
  const uc = useUseCases().find((u) => u.id === product);
  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Penilaian Risiko AI</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Analisis awal tingkat risiko pemanfaatan kecerdasan artifisial berdasarkan karakteristik use case dan kriteria regulasi.
          </p>
        </div>
        <span className="status status-warning">Simulasi — Bukan Keputusan Regulator</span>
      </header>
      <ProductSelector value={product} onChange={(id) => navigate({ search: id ? { product: id } : {} })} />
      {uc ? (
        <Assessment key={uc.id} uc={uc} />
      ) : (
        <section className="border-y border-dashed py-16 text-center">
          <h2 className="text-sm font-semibold">Belum ada produk dipilih</h2>
          <p className="mt-2 text-sm text-muted-foreground">Pilih produk AI dari registri untuk memulai simulasi penilaian.</p>
        </section>
      )}
    </>
  );
}

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="rounded-sm bg-accent px-0.5 font-medium text-primary">{part}</mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mb-6 overflow-hidden rounded-md border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {note && <span className="text-[10px] text-muted-foreground">{note}</span>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Assessment({ uc }: { uc: UseCase }) {
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [showDetail, setShowDetail] = useState(false);
  const [runAt, setRunAt] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const found = detectIndicators(uc);
  const level: SimRisk = phase === "done" ? classify(found) : "Belum Dinilai";
  const words = found.flatMap((f) => f.matches);

  function run() {
    setPhase("loading");
    setShowDetail(false);
    timer.current = setTimeout(() => {
      setRunAt(new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));
      setPhase("done");
    }, 1200);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Button onClick={run} disabled={phase === "loading"}>
          {phase === "loading" ? "Menjalankan simulasi…" : phase === "done" ? "Jalankan Ulang Simulasi" : "Jalankan Simulasi Penilaian"}
        </Button>
        {phase === "done" && (
          <Button variant="outline" onClick={() => setShowDetail(!showDetail)} aria-expanded={showDetail}>
            {showDetail ? "Sembunyikan detail" : "Lihat detail penilaian"}
          </Button>
        )}
        <span className="text-[11px] text-muted-foreground">Data Simulasi · tidak ada permintaan ke server</span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Tingkat Risiko Awal (Simulasi)">
          <span className={`status ${riskClassSim(level)}`}>{level}</span>
        </Kpi>
        <Kpi label="Status Penilaian">{phase === "done" ? "Simulasi selesai" : phase === "loading" ? "Sedang diproses" : "Belum dijalankan"}</Kpi>
        <Kpi label="Indikator Risiko Terdeteksi">{phase === "done" ? found.length : "—"}</Kpi>
        <Kpi label="Tanggal Simulasi Terakhir">{runAt || "—"}</Kpi>
      </div>

      {phase === "loading" && (
        <div role="status" className="mb-6 rounded-md border bg-card p-5 text-sm text-muted-foreground">
          Menganalisis narasi use case dan mencocokkan aturan klasifikasi (simulasi lokal)…
        </div>
      )}

      {phase === "done" && (
        <>
          <p className="mb-6 rounded-md border border-warning/30 bg-warning-soft px-4 py-3 text-xs leading-5 text-warning">
            Hasil ini merupakan simulasi deterministik berbasis pencocokan kata kunci pada data demonstrasi. Tidak ada analisis NLP sungguhan maupun verifikasi regulasi yang dilakukan, dan hasil ini bukan penetapan hukum resmi.
          </p>
          <Panel title="Analisis NLP (Simulasi)" note={`Keyakinan: ${confidenceLabel(found)} — bukan probabilitas terkalibrasi`}>
            <h3 className="text-xs font-medium text-muted-foreground">Narasi use case</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7"><Highlight text={uc.description} words={words} /></p>
            <h3 className="mt-6 text-xs font-medium text-muted-foreground">Indikator risiko terekstraksi</h3>
            {found.length ? (
              <ul className="mt-2 divide-y border-y">
                {found.map((f) => <IndicatorRow key={f.id} f={f} />)}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Tidak ditemukan indikator risiko pada narasi dan data registri.</p>
            )}
          </Panel>
          <Panel title="Klasifikasi Berbasis Aturan" note="Data Simulasi">
            <div className="-m-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b bg-background text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>{["Kriteria Risiko", "Indikator Terdeteksi", "Hasil Pemeriksaan", "Dasar Penilaian"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {riskRules.map((r) => {
                    const hit = found.filter((f) => r.indicatorIds.includes(f.id));
                    return (
                      <tr key={r.criterion} className="border-b last:border-0 align-top">
                        <td className="px-5 py-4 font-medium">{r.criterion}</td>
                        <td className="px-5 py-4 text-muted-foreground">{hit.length ? hit.map((h) => h.label).join(", ") : "—"}</td>
                        <td className="px-5 py-4"><span className={`status ${hit.length ? "status-warning" : "status-success"}`}>{hit.length ? "Terpenuhi" : "Tidak terpenuhi"}</span></td>
                        <td className="px-5 py-4 leading-5 text-muted-foreground">{r.basis}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
          {showDetail && (
            <Panel title="Detail Penilaian">
              <dl className="grid gap-5 text-xs md:grid-cols-2">
                <Item k="Logika klasifikasi" v="Tidak Dapat Diterima jika ada indikator praktik terlarang; Tinggi jika ≥2 indikator berbobot tinggi atau 1 tinggi + 1 sedang; selain itu Rendah." />
                <Item k="Deklarasi risiko pengaju" v={`${uc.risk} (diisi saat registrasi)`} />
                <Item k="Data pribadi / sensitif" v={`${uc.personalData} / ${uc.sensitiveData}`} />
                <Item k="Pengawasan manusia" v={uc.humanOversight} />
                <Item k="Jenis model" v={uc.modelType} />
                <Item k="Keterangan" v="Kategori Rendah, Tinggi, dan Tidak Dapat Diterima digunakan sebagai ilustrasi dan tidak mengacu pada pasal regulasi tertentu." />
              </dl>
            </Panel>
          )}
        </>
      )}
    </>
  );
}

function IndicatorRow({ f }: { f: DetectedIndicator }) {
  return (
    <li className="grid gap-1 py-3 text-xs md:grid-cols-[220px_1fr]">
      <div>
        <p className="font-medium">{f.label}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {f.matches.length ? `Kata kunci: ${f.matches.join(", ")}` : "Sumber: data registri"} · bobot {f.weight}
        </p>
      </div>
      <p className="leading-5 text-muted-foreground">{f.context}</p>
    </li>
  );
}

function Kpi({ label, children }: { label: string; children: ReactNode }) {
  return (
    <article className="rounded-md border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-3 text-lg font-semibold">{children}</div>
    </article>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-muted-foreground">{k}</dt><dd className="mt-1.5 leading-5">{v}</dd></div>;
}
