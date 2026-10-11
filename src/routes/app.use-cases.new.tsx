import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { pageHead } from "@/lib/grazu-navigation";
import { UploadDocumentDialog } from "@/components/grazu/upload-document-dialog";
import { demoUploadNotice, documentActions, formatSize, type DocInput } from "@/lib/documents";
import { useOrganization } from "@/lib/organization";
import { useDemoRole, demoRoles } from "@/lib/demo-roles";
import { addUseCase, riskLevels, sectors, type UseCase } from "@/lib/use-cases";

export const Route = createFileRoute("/app/use-cases/new")({
  head: () => pageHead("Daftarkan Use Case AI", "Formulir pendaftaran use case kecerdasan artifisial."),
  component: Wizard,
});

type Form = Omit<UseCase, "id" | "status" | "date">;
type Field = { key: keyof Form; label: string; type?: "text" | "area" | "select"; options?: readonly string[] };

const steps: { title: string; fields: Field[] }[] = [
  { title: "Informasi Produk", fields: [
    { key: "name", label: "Nama produk AI" },
    { key: "org", label: "Nama organisasi" },
    { key: "description", label: "Deskripsi singkat", type: "area" },
    { key: "systemType", label: "Jenis sistem AI", type: "select", options: ["Asisten percakapan", "Sistem pendukung keputusan", "Sistem rekomendasi", "Analisis citra", "Otomasi proses"] },
    { key: "devStatus", label: "Status pengembangan", type: "select", options: ["Perencanaan", "Pengembangan", "Uji coba", "Produksi"] },
  ]},
  { title: "Informasi Pemanfaatan", fields: [
    { key: "sector", label: "Sektor pemanfaatan", type: "select", options: sectors },
    { key: "priorityArea", label: "Bidang prioritas AI", type: "select", options: ["Layanan publik", "Kesehatan", "Pendidikan", "Ketahanan pangan", "Keamanan finansial", "Mobilitas", "Reformasi birokrasi"] },
    { key: "province", label: "Provinsi" },
    { key: "city", label: "Kabupaten/Kota" },
    { key: "targetUsers", label: "Target pengguna" },
    { key: "purpose", label: "Tujuan dan manfaat sistem", type: "area" },
  ]},
  { title: "Teknologi & Data", fields: [
    { key: "modelType", label: "Jenis model AI", type: "select", options: ["Large language model", "Computer vision", "Machine learning terawasi", "Model deret waktu", "Lainnya"] },
    { key: "modelProvider", label: "Penyedia model" },
    { key: "dataSource", label: "Sumber data" },
    { key: "dataTypes", label: "Jenis data yang diproses" },
    { key: "personalData", label: "Apakah memproses data pribadi?", type: "select", options: ["Ya", "Tidak"] },
    { key: "sensitiveData", label: "Apakah menggunakan data sensitif?", type: "select", options: ["Ya", "Tidak"] },
  ]},
  { title: "Risiko & Tata Kelola", fields: [
    { key: "risk", label: "Deklarasi awal tingkat risiko", type: "select", options: riskLevels },
    { key: "impact", label: "Potensi dampak terhadap pengguna", type: "area" },
    { key: "humanOversight", label: "Mekanisme pengawasan manusia", type: "area" },
    { key: "mitigation", label: "Penjelasan mitigasi risiko", type: "area" },
    { key: "securityPolicy", label: "Kebijakan keamanan dan privasi", type: "area" },
  ]},
];
const titles = [...steps.map((s) => s.title), "Review & Pengajuan"];
const empty = Object.fromEntries(steps.flatMap((s) => s.fields.map((f) => [f.key, ""]))) as unknown as Form;

function Wizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState<UseCase | null>(null);
  const [attachments, setAttachments] = useState<DocInput[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { role } = useDemoRole();
  const { account } = useOrganization();
  const submit = () => {
    const uc = addUseCase(form);
    const by = role === "client" ? account.name : `${demoRoles[role].label} (Demo)`;
    attachments.forEach((a) => documentActions.add(uc.id, a, by));
    setDone(uc);
  };

  const validate = (i: number) => {
    const missing = steps[i]!.fields.filter((f) => !String(form[f.key]).trim()).map((f) => f.key);
    setErrors(missing);
    return missing.length === 0;
  };
  const next = () => validate(step) && setStep(step + 1);

  if (done) {
    return (
      <section className="mx-auto max-w-xl rounded-md border bg-card p-8 text-center">
        <span className="status status-success">Pengajuan terkirim (DEMO)</span>
        <h1 className="mt-5 text-xl font-semibold">{done.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use case tercatat dengan nomor {done.id} berstatus Diajukan. Ini adalah simulasi — tidak ada data yang disimpan secara permanen.
          {attachments.length > 0 && ` ${attachments.length} dokumen pendukung tercatat. ${demoUploadNotice}`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/app/use-cases/$id" params={{ id: done.id }}>Lihat detail</Link></Button>
          <Button asChild variant="outline"><Link to="/app/use-cases">Kembali ke registri</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link to="/app/use-cases" className="text-xs text-muted-foreground hover:text-primary">← Registrasi Use Case AI</Link>
        <h1 className="mt-3 text-2xl font-semibold">Daftarkan Use Case</h1>
        <p className="mt-2 text-sm text-muted-foreground">Langkah {step + 1} dari {titles.length} · {titles[step]}</p>
      </div>
      <ol className="mb-6 grid grid-cols-5 gap-2" aria-label="Progres pendaftaran">
        {titles.map((t, i) => (
          <li key={t}>
            <div className={`h-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
            <p className={`mt-2 hidden text-[11px] md:block ${i === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{i + 1}. {t}</p>
          </li>
        ))}
      </ol>
      <section className="rounded-md border bg-card p-5 md:p-7">
        {step < steps.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {steps[step]!.fields.map((f) => {
              const err = errors.includes(f.key);
              const common = { id: f.key, value: String(form[f.key]), "aria-invalid": err,
                onChange: (e: { target: { value: string } }) => setForm({ ...form, [f.key]: e.target.value }) };
              return (
                <div key={f.key} className={f.type === "area" ? "md:col-span-2" : ""}>
                  <label htmlFor={f.key} className="mb-1.5 block text-xs font-medium">{f.label} <span className="text-destructive">*</span></label>
                  {f.type === "area" ? <Textarea {...common} rows={3} className="text-sm" />
                    : f.type === "select" ? (
                      <select {...common} className="h-9 w-full rounded-md border bg-card px-3 text-sm aria-[invalid=true]:border-destructive">
                        <option value="">Pilih...</option>
                        {f.options!.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : <Input {...common} className="text-sm" />}
                  {err && <p className="mt-1 text-[11px] text-destructive">Wajib diisi.</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={s.title} className="border-b pb-5 last:border-0">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{s.title}</h2>
                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => setStep(i)}>Ubah</Button>
                </div>
                <dl className="grid gap-x-6 gap-y-3 text-xs md:grid-cols-2">
                  {s.fields.map((f) => (
                    <div key={f.key}><dt className="text-muted-foreground">{f.label}</dt><dd className="mt-1">{String(form[f.key])}</dd></div>
                  ))}
                </dl>
              </div>
            ))}
            <div className="border-b pb-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Dokumen Pendukung <span className="font-normal text-muted-foreground">(opsional)</span></h2>
                <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>+ Unggah Dokumen</Button>
              </div>
              {attachments.length === 0 ? <p className="text-xs text-muted-foreground">Belum ada dokumen dilampirkan.</p> : (
                <ul className="divide-y rounded-md border text-xs">
                  {attachments.map((a, i) => (
                    <li key={`${a.fileName}-${i}`} className="flex items-center justify-between gap-2 px-3 py-2">
                      <span className="min-w-0"><span className="block truncate font-medium">{a.title}</span><span className="text-muted-foreground">{a.category} · {a.format} · {formatSize(a.size)}</span></span>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}>Hapus</Button>
                    </li>
                  ))}
                </ul>
              )}
              <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} productLabel={form.name ? `${form.name} (pengajuan baru)` : "Use case baru"} onSubmit={(d) => setAttachments((l) => [...l, d])} />
            </div>
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-primary" />
              Saya menyatakan bahwa informasi yang disampaikan benar dan dapat dipertanggungjawabkan.
            </label>
          </div>
        )}
        <div className="mt-7 flex justify-between gap-3 border-t pt-5">
          <Button variant="outline" disabled={step === 0} onClick={() => { setErrors([]); setStep(step - 1); }}>Sebelumnya</Button>
          {step < steps.length ? <Button onClick={next}>Selanjutnya</Button>
            : <Button disabled={!agree} onClick={submit}>Kirim Pengajuan</Button>}
        </div>
      </section>
      <p className="mt-4 text-[11px] text-muted-foreground">Mode demo · Data Simulasi, tidak tersimpan ke sistem.</p>
    </>
  );
}
