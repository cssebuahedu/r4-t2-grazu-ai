import { createContext, useContext, useState, type ReactNode } from "react";
import { classify, detectIndicators, ethicsPrinciples } from "@/lib/assessments";
import { findings, useRepos } from "@/lib/devsecops";
import { redTests, useRedTeam } from "@/lib/red-teaming";
import { useUseCases } from "@/lib/use-cases";

export const demoDisclaimer = "MODE DEMO — Hasil penilaian bukan sertifikasi atau keputusan resmi regulator.";
export const decisionMessage = "Keputusan review disimpan sebagai simulasi. Tidak ada keputusan resmi yang diterbitkan.";
export const controlStatuses = ["Terpenuhi", "Tidak Terpenuhi", "Perlu Ditinjau", "Belum Diuji", "Tidak Berlaku"] as const;
export type ControlStatus = (typeof controlStatuses)[number];
export const categories = ["Tata Kelola AI", "Etika AI", "Pelindungan Data", "Keamanan AI", "Transparansi & Akuntabilitas"] as const;
export const regulations = [
  { id: "SE-9", name: "SE Menkominfo No. 9 Tahun 2023", status: "Diterbitkan", description: "Pedoman nilai etika kecerdasan artifisial; bukan sertifikasi kepatuhan." },
  { id: "UU-PDP", name: "UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi", status: "Diterbitkan", description: "Kerangka pelindungan data pribadi. Penerapan kewajiban perlu ditinjau sesuai konteks." },
  { id: "RP-ETIKA", name: "RPerpres Etika Kecerdasan Artifisial", status: "Draf · Perlu Verifikasi", description: "Referensi rancangan untuk diskusi; bukan hukum yang mengikat. Status terkini belum diverifikasi." },
  { id: "RP-PETA", name: "RPerpres Peta Jalan Kecerdasan Artifisial Nasional", status: "Draf · Perlu Verifikasi", description: "Referensi rancangan arah kebijakan; bukan hukum yang mengikat. Status terkini belum diverifikasi." },
] as const;
export interface Control {
  id: string; name: string; category: (typeof categories)[number]; regulationId: string;
  description: string; criteria: string; source: "risk" | "ethics" | "red" | "dev" | "manual";
}
export const controls: Control[] = [
  { id: "GOV-01", name: "Penanggung jawab sistem AI", category: "Tata Kelola AI", regulationId: "SE-9", description: "Peran dan tanggung jawab pengelolaan AI terdokumentasi.", criteria: "Tersedia penanggung jawab dan jalur eskalasi yang ditinjau manusia.", source: "manual" },
  { id: "GOV-02", name: "Dokumentasi risiko dan mitigasi", category: "Tata Kelola AI", regulationId: "RP-PETA", description: "Risiko dan langkah mitigasi dicatat sepanjang siklus hidup AI.", criteria: "Dokumen risiko mencakup dampak, mitigasi, dan pengawasan manusia. Kontrol praktik baik, bukan kewajiban dari draf.", source: "risk" },
  { id: "ETH-01", name: "Inklusivitas dan pengujian bias", category: "Etika AI", regulationId: "SE-9", description: "Kinerja AI dipertimbangkan pada kelompok pengguna yang beragam.", criteria: "Bukti pengujian bias dan tindak lanjut tersedia untuk peninjauan.", source: "ethics" },
  { id: "ETH-02", name: "Pengawasan keputusan oleh manusia", category: "Etika AI", regulationId: "RP-ETIKA", description: "Keputusan berdampak signifikan dapat ditinjau manusia.", criteria: "Mekanisme intervensi dan keberatan didokumentasikan. Kontrol praktik baik, bukan kewajiban dari draf.", source: "manual" },
  { id: "PDP-01", name: "Dasar pemrosesan data pribadi", category: "Pelindungan Data", regulationId: "UU-PDP", description: "Tujuan dan dasar pemrosesan data pribadi dicatat.", criteria: "Dokumen dasar pemrosesan tersedia apabila sistem memproses data pribadi.", source: "risk" },
  { id: "PDP-02", name: "Minimisasi dan retensi data", category: "Pelindungan Data", regulationId: "UU-PDP", description: "Penggunaan dan penyimpanan data dibatasi sesuai tujuan.", criteria: "Tersedia daftar jenis data, masa retensi, dan prosedur penghapusan.", source: "manual" },
  { id: "SEC-01", name: "Ketahanan terhadap penyalahgunaan AI", category: "Keamanan AI", regulationId: "SE-9", description: "Sistem ditinjau terhadap injeksi instruksi dan kebocoran informasi.", criteria: "Hasil uji keamanan dan rencana perbaikan ditinjau bersama penanggung jawab.", source: "red" },
  { id: "SEC-02", name: "Keamanan kode dan dependensi", category: "Keamanan AI", regulationId: "SE-9", description: "Temuan keamanan kode ditindaklanjuti secara terukur.", criteria: "Laporan pemindaian dan tindak lanjut temuan tersedia. Kontrol praktik baik yang mendukung prinsip keamanan.", source: "dev" },
  { id: "TRA-01", name: "Pemberitahuan penggunaan AI", category: "Transparansi & Akuntabilitas", regulationId: "SE-9", description: "Pengguna mengetahui keterlibatan AI dalam layanan.", criteria: "Pemberitahuan dan penjelasan keterbatasan AI terdokumentasi.", source: "ethics" },
  { id: "TRA-02", name: "Jejak audit dan penanganan keberatan", category: "Transparansi & Akuntabilitas", regulationId: "SE-9", description: "Aktivitas dan keberatan dapat ditelusuri.", criteria: "Contoh catatan audit dan prosedur penanganan keberatan tersedia.", source: "manual" },
];
export interface ControlResult { controlId: string; status: ControlStatus; notes: string }
export interface Assessment { id: string; productId: string; updated: string; results: ControlResult[] }
export const reviewStatuses = ["Menunggu Review", "Disetujui (Simulasi)", "Perbaikan Diminta", "Tinjauan Lanjutan"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];
export interface Review { id: string; assessmentId: string; type: string; priority: string; status: ReviewStatus; reviewer: string; submitted: string; notes: string }
export interface ReviewActivity { id: string; assessmentId: string; reviewer: string; action: string; date: string; comment: string; from: string; to: string }
const profiles: ControlStatus[][] = [
  ["Terpenuhi", "Terpenuhi", "Perlu Ditinjau", "Terpenuhi", "Tidak Berlaku", "Terpenuhi", "Tidak Terpenuhi", "Perlu Ditinjau", "Belum Diuji", "Terpenuhi"],
  ["Terpenuhi", "Perlu Ditinjau", "Belum Diuji", "Terpenuhi", "Perlu Ditinjau", "Tidak Terpenuhi", "Perlu Ditinjau", "Tidak Terpenuhi", "Terpenuhi", "Belum Diuji"],
  ["Terpenuhi", "Perlu Ditinjau", "Perlu Ditinjau", "Terpenuhi", "Terpenuhi", "Belum Diuji", "Belum Diuji", "Tidak Terpenuhi", "Terpenuhi", "Belum Diuji"],
];
export const initialAssessments: Assessment[] = Array.from({ length: 8 }, (_, i) => ({
  id: `CMP-${String(i + 1).padStart(3, "0")}`, productId: `UC-${String(i + 1).padStart(3, "0")}`, updated: "10 Okt 2026 · 15.00 WIB",
  results: controls.map((c, j) => ({ controlId: c.id, status: profiles[i % profiles.length]?.[j] ?? "Belum Diuji", notes: "" })),
}));
export const initialReviews: Review[] = initialAssessments.slice(0, 6).map((a, i) => ({
  id: `REV-${String(i + 1).padStart(3, "0")}`, assessmentId: a.id,
  type: ["Tinjauan Kepatuhan", "Temuan Keamanan", "Validasi Etika"][i % 3] ?? "Tinjauan Kepatuhan",
  priority: i === 1 || i === 2 ? "Tinggi" : i === 5 ? "Rendah" : "Sedang",
  status: "Menunggu Review", reviewer: ["Rina Pratiwi", "Dimas Saputra", "Sari Wulandari"][i % 3] ?? "Tim Review",
  submitted: "10 Okt 2026 · 16.00 WIB", notes: "",
}));
export function summarize(results: ControlResult[]) {
  return Object.fromEntries(controlStatuses.map((s) => [s, results.filter((r) => r.status === s).length])) as Record<ControlStatus, number>;
}
export function assessmentStatus(a: Assessment) {
  if (a.results.every((r) => r.status === "Belum Diuji")) return "Belum Dinilai";
  return a.results.every((r) => r.status === "Terpenuhi" || r.status === "Tidak Berlaku") ? "Kontrol Terpenuhi (Simulasi)" : "Perlu Ditinjau";
}
export const badgeClass = (status: string) => status === "Tidak Terpenuhi" || status === "Perbaikan Diminta" || status === "Terbuka" ? "status-danger" : status === "Terpenuhi" || status === "Disetujui (Simulasi)" || status === "Kontrol Terpenuhi (Simulasi)" ? "status-success" : status === "Belum Diuji" || status === "Tidak Berlaku" || status === "Belum Dinilai" ? "status-info" : "status-warning";
const initialHistory: ReviewActivity[] = initialAssessments.map((a) => ({ id: `ACT-${a.id}`, assessmentId: a.id, reviewer: "Tim Tata Kelola (Simulasi)", action: "Penilaian awal dicatat", date: a.updated, comment: "Kontrol awal merupakan contoh ilustratif; bukti memerlukan validasi manusia.", from: "Belum Dinilai", to: assessmentStatus(a) }));
function useComplianceState() {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [reviews, setReviews] = useState(initialReviews);
  const [history, setHistory] = useState(initialHistory);
  function addActivity(activity: Omit<ReviewActivity, "id" | "date">) {
    setHistory((prev) => [{ ...activity, id: `ACT-LOCAL-${prev.length + 1}`, date: "11 Okt 2026 · Waktu Simulasi" }, ...prev]);
  }
  function updateControl(assessmentId: string, controlId: string, status: ControlStatus, notes: string) {
    const old = assessments.find((a) => a.id === assessmentId)?.results.find((r) => r.controlId === controlId);
    if (!old || (old.status === status && old.notes === notes)) return;
    setAssessments((prev) => prev.map((a) => a.id !== assessmentId ? a : { ...a, updated: "11 Okt 2026 · Waktu Simulasi", results: a.results.map((r) => r.controlId !== controlId ? r : { ...r, status, notes }) }));
    addActivity({ assessmentId, reviewer: "Peninjau Demo", action: `Kontrol ${controlId} diperbarui`, comment: notes || "Status kontrol diperbarui secara lokal.", from: old.status, to: status });
  }
  function decideReview(reviewId: string, status: ReviewStatus, notes: string) {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, status, notes } : r));
    addActivity({ assessmentId: review.assessmentId, reviewer: `${review.reviewer} (Simulasi)`, action: `Keputusan ${review.id} dicatat`, comment: notes || "Keputusan simulasi tanpa otoritas resmi.", from: review.status, to: status });
  }
  return { assessments, reviews, history, updateControl, decideReview };
}
const ComplianceContext = createContext<ReturnType<typeof useComplianceState> | null>(null);
export function ComplianceProvider({ children }: { children: ReactNode }) {
  const state = useComplianceState();
  return <ComplianceContext.Provider value={state}>{children}</ComplianceContext.Provider>;
}
export function useCompliance() {
  const state = useContext(ComplianceContext);
  if (!state) throw new Error("ComplianceProvider diperlukan.");
  return state;
}
export interface Evidence {
  id: string; source: Control["source"]; sourceLabel: string; date: string; status: string; description: string;
  productId: string; runId?: string; repoId?: string;
}
export function useComplianceEvidence(productId: string): Evidence[] {
  const product = useUseCases().find((p) => p.id === productId);
  const { endpoints, runs } = useRedTeam();
  const repos = useRepos().filter((r) => r.productId === productId);
  if (!product) return [];
  const risk = classify(detectIndicators(product));
  const evidence: Evidence[] = [
    { id: productId, source: "risk", sourceLabel: "Penilaian Risiko", date: product.date, status: "Perlu Ditinjau", description: `Indikator risiko: ${risk} (simulasi berbasis deskripsi registri). Bukan hasil resmi yang tersimpan.`, productId },
    { id: `etika-${productId}`, source: "ethics", sourceLabel: "Penilaian Etika", date: product.date, status: "Belum Diuji", description: `${ethicsPrinciples.length} prinsip etika tersedia. Jawaban penilaian terpisah tidak disimpan; validasi bukti belum dilakukan.`, productId },
    { id: `DOC-${productId}`, source: "manual", sourceLabel: "Dokumentasi Manual", date: product.date, status: "Perlu Ditinjau", description: `Deklarasi pengawasan: ${product.humanOversight} Kebijakan: ${product.securityPolicy} Dokumen pendukung belum diverifikasi.`, productId },
  ];
  for (const run of runs.filter((r) => endpoints.some((e) => e.id === r.endpointId && e.productId === productId))) {
    for (const result of run.results.filter((r) => r.status === "Gagal")) {
      const test = redTests.find((t) => t.id === result.testId);
      evidence.push({ id: `${run.id}/${result.testId}`, source: "red", sourceLabel: "Pengujian Keamanan AI", date: run.date, status: "Terbuka", description: `${test?.name ?? result.testId}: gagal pada pengujian simulasi.`, productId, runId: run.id });
    }
    if (!run.results.some((r) => r.status === "Gagal")) evidence.push({ id: run.id, source: "red", sourceLabel: "Pengujian Keamanan AI", date: run.date, status: "Perlu Ditinjau", description: "Tidak ada uji gagal pada laporan simulasi ini; cakupan dan hasil tetap memerlukan review.", productId, runId: run.id });
  }
  for (const repo of repos) {
    const list = findings.filter((f) => f.repoId === repo.id);
    for (const finding of list) evidence.push({ id: finding.id, source: "dev", sourceLabel: "Pemindaian Repositori DevSecOps", date: repo.lastScan, status: finding.status === "Diperbaiki" ? "Terpenuhi" : finding.status === "Terbuka" ? "Terbuka" : "Perlu Ditinjau", description: `${finding.title} (${repo.id}; ${finding.status.toLowerCase()}) — simulasi.`, productId, repoId: repo.id });
    if (!list.length) evidence.push({ id: repo.id, source: "dev", sourceLabel: "Pemindaian Repositori DevSecOps", date: repo.lastScan, status: "Belum Diuji", description: "Belum ada laporan temuan simulasi untuk repositori ini.", productId, repoId: repo.id });
  }
  return evidence;
}