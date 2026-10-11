import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ProductSelector } from "@/components/grazu/product-selector";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases, type UseCase } from "@/lib/use-cases";
import {
  ethicsAnswers,
  ethicsPrinciples,
  principleStatus,
  validateProductSearch,
  type EthicsAnswer,
  type PrincipleStatus,
} from "@/lib/assessments";

export const Route = createFileRoute("/app/ethics")({
  validateSearch: validateProductSearch,
  head: () => pageHead("Penilaian Etika AI", "Evaluasi penerapan sembilan nilai etika kecerdasan artifisial."),
  component: EthicsPage,
});

function EthicsPage() {
  const { product } = Route.useSearch();
  const navigate = useNavigate({ from: "/app/ethics" });
  const uc = useUseCases().find((u) => u.id === product);
  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Penilaian Etika AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">Evaluasi penerapan sembilan nilai etika kecerdasan artifisial.</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Mengacu pada SE Menkominfo No. 9 Tahun 2023 tentang Etika Kecerdasan Artifisial.</p>
        </div>
        <span className="status status-warning">Data Simulasi</span>
      </header>
      <ProductSelector value={product} onChange={(id) => navigate({ search: id ? { product: id } : {} })} />
      {uc ? (
        <Checklist key={uc.id} uc={uc} />
      ) : (
        <section className="border-y border-dashed py-16 text-center">
          <h2 className="text-sm font-semibold">Belum ada produk dipilih</h2>
          <p className="mt-2 text-sm text-muted-foreground">Pilih produk AI untuk mengisi daftar periksa etika.</p>
        </section>
      )}
    </>
  );
}

const statusCls = (s: PrincipleStatus) =>
  s === "Terpenuhi (Simulasi)" ? "status-success" : s === "Perlu Ditinjau" ? "status-warning" : "status-info";

function Checklist({ uc }: { uc: UseCase }) {
  const [answers, setAnswers] = useState<Record<string, EthicsAnswer>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState("");

  const statuses = ethicsPrinciples.map((p) => principleStatus(p.questions.map((_, i) => answers[`${p.id}-${i}`])));
  const reviewed = statuses.filter((s) => s !== "Belum Dinilai").length;
  const needReview = statuses.filter((s) => s === "Perlu Ditinjau").length;
  const totalQ = ethicsPrinciples.reduce((n, p) => n + p.questions.length, 0);
  const pct = Math.round((Object.keys(answers).length / totalQ) * 100);

  function setAnswer(key: string, a: EthicsAnswer) {
    setAnswers((s) => ({ ...s, [key]: a }));
    setSaved("");
  }

  return (
    <>
      <section className="mb-6 rounded-md border bg-card p-5">
        <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
          <Stat label="Prinsip ditinjau" value={`${reviewed} / 9`} />
          <Stat label="Perlu ditinjau lanjut" value={needReview} />
          <Stat label="Belum dinilai" value={9 - reviewed} />
          <Stat label="Pertanyaan terjawab" value={`${Object.keys(answers).length} / ${totalQ}`} />
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-[11px] text-muted-foreground">
            <span>Kelengkapan pengisian</span><span>{pct}%</span>
          </div>
          <Progress value={pct} aria-label="Kelengkapan pengisian" />
          <p className="mt-2 text-[10px] text-muted-foreground">Persentase menunjukkan kelengkapan pengisian, bukan skor kepatuhan etika resmi.</p>
        </div>
      </section>

      <Accordion type="multiple" className="mb-6 rounded-md border bg-card">
        {ethicsPrinciples.map((p, idx) => (
          <AccordionItem key={p.id} value={p.id} className="px-5 last:border-b-0">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-3 text-left">
                <span className="text-sm font-medium"><span className="mr-3 text-xs text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>{p.name}</span>
                <span className={`status ${statusCls(statuses[idx] ?? "Belum Dinilai")}`}>{statuses[idx] ?? "Belum Dinilai"}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-4 text-xs leading-5 text-muted-foreground">{p.summary}</p>
              <ol className="divide-y border-y">
                {p.questions.map((q, i) => {
                  const key = `${p.id}-${i}`;
                  return (
                    <li key={key} className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
                      <p className="text-xs leading-5 lg:max-w-xl">{q}</p>
                      <div role="radiogroup" aria-label={q} className="flex flex-wrap gap-1.5">
                        {ethicsAnswers.map((a) => (
                          <button
                            key={a}
                            type="button"
                            role="radio"
                            aria-checked={answers[key] === a}
                            onClick={() => setAnswer(key, a)}
                            className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${answers[key] === a ? "border-primary bg-accent font-medium text-primary" : "bg-card text-muted-foreground hover:border-primary/40"}`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ol>
              <label htmlFor={`note-${p.id}`} className="mt-4 block text-[11px] font-medium">Catatan bukti (opsional)</label>
              <Textarea
                id={`note-${p.id}`}
                className="mt-1.5 text-xs"
                placeholder="Contoh: dokumen kebijakan, hasil uji, atau tautan internal."
                value={notes[p.id] ?? ""}
                onChange={(e) => { setNotes((s) => ({ ...s, [p.id]: e.target.value })); setSaved(""); }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => setSaved(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))}>Simpan Draft (Demo)</Button>
        <Button variant="outline" onClick={() => { setAnswers({}); setNotes({}); setSaved(""); }}>Atur ulang</Button>
        {saved && (
          <p role="status" className="text-xs text-primary">
            Draft untuk {uc.name} disimpan sementara di sesi ini pukul {saved}. Data tidak dikirim atau disimpan ke server.
          </p>
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>;
}
