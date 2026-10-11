import type { UseCase } from "./use-cases";

export type SimRisk = "Rendah" | "Tinggi" | "Tidak Dapat Diterima" | "Belum Dinilai";

export interface RiskIndicator {
  id: string;
  label: string;
  keywords: string[];
  context: string;
  weight: "tinggi" | "sedang" | "larangan";
  /** extra structured-field trigger from the registry record */
  field?: (u: UseCase) => boolean;
}

export const riskIndicators: RiskIndicator[] = [
  { id: "bio", label: "Identifikasi biometrik", keywords: ["biometrik", "wajah", "sidik jari"], weight: "tinggi", context: "Pengenalan individu dari ciri biologis dapat berdampak pada privasi dan kebebasan sipil." },
  { id: "mass", label: "Pemantauan massal waktu nyata", keywords: ["pemantauan massal", "skor sosial"], weight: "larangan", context: "Praktik pemantauan massal atau penilaian sosial umumnya dipandang tidak dapat diterima dalam kerangka tata kelola AI." },
  { id: "health", label: "Data kesehatan pribadi", keywords: ["medis", "radiolog", "rontgen", "pasien", "kesehatan"], weight: "tinggi", context: "Data kesehatan termasuk kategori data pribadi yang bersifat spesifik dan memerlukan pelindungan tambahan." },
  { id: "auto", label: "Pengambilan keputusan otomatis", keywords: ["kelayakan", "penilaian", "deteksi", "mencurigakan"], weight: "tinggi", context: "Keluaran sistem dapat memengaruhi hak atau akses seseorang terhadap layanan tanpa intervensi manusia yang memadai." },
  { id: "fin", label: "Akses layanan keuangan", keywords: ["kredit", "transaksi", "penipuan"], weight: "tinggi", context: "Keputusan di sektor keuangan berdampak langsung pada kesejahteraan ekonomi individu." },
  { id: "sens", label: "Informasi pribadi sensitif", keywords: [], weight: "sedang", field: (u) => u.sensitiveData === "Ya", context: "Pengaju menyatakan sistem memproses data pribadi sensitif." },
  { id: "pers", label: "Pemrosesan data pribadi", keywords: ["mahasiswa", "masyarakat", "capaian belajar"], weight: "sedang", field: (u) => u.personalData === "Ya", context: "Sistem memproses data yang dapat mengidentifikasi individu." },
  { id: "human", label: "Kebutuhan pengawasan manusia", keywords: ["membantu", "rekomendasi", "menjawab"], weight: "sedang", context: "Keluaran bersifat pendukung sehingga perlu memastikan manusia tetap meninjau keputusan akhir." },
];

export interface DetectedIndicator extends RiskIndicator {
  matches: string[];
}

export function detectIndicators(u: UseCase): DetectedIndicator[] {
  const text = u.description.toLowerCase();
  return riskIndicators
    .map((ind) => ({ ...ind, matches: ind.keywords.filter((k) => text.includes(k)) }))
    .filter((ind) => ind.matches.length > 0 || ind.field?.(u));
}

export function classify(found: DetectedIndicator[]): Exclude<SimRisk, "Belum Dinilai"> {
  if (found.some((f) => f.weight === "larangan")) return "Tidak Dapat Diterima";
  const high = found.filter((f) => f.weight === "tinggi").length;
  const med = found.filter((f) => f.weight === "sedang").length;
  return high >= 2 || (high >= 1 && med >= 1) ? "Tinggi" : "Rendah";
}

/** Demo-only label derived from how many keyword hits support the result. */
export function confidenceLabel(found: DetectedIndicator[]) {
  const hits = found.reduce((n, f) => n + f.matches.length, 0);
  return hits >= 4 ? "Kuat (demo)" : hits >= 2 ? "Sedang (demo)" : "Terbatas (demo)";
}

export interface RiskRule {
  criterion: string;
  indicatorIds: string[];
  basis: string;
}

export const riskRules: RiskRule[] = [
  { criterion: "Praktik yang dilarang", indicatorIds: ["mass"], basis: "Prinsip umum: praktik yang mengancam hak asasi tidak dapat diterima." },
  { criterion: "Pemrosesan data spesifik", indicatorIds: ["health", "bio", "sens"], basis: "Kategori data pribadi spesifik menurut kerangka pelindungan data pribadi." },
  { criterion: "Dampak terhadap hak dan akses layanan", indicatorIds: ["auto", "fin"], basis: "Praktik baik tata kelola AI: keputusan berdampak tinggi memerlukan kontrol tambahan." },
  { criterion: "Pemrosesan data pribadi umum", indicatorIds: ["pers"], basis: "Kewajiban dasar pengendali data pribadi." },
  { criterion: "Pengawasan manusia", indicatorIds: ["human"], basis: "Nilai etika transparansi dan akuntabilitas (SE Menkominfo No. 9 Tahun 2023)." },
];

export function riskClassSim(r: SimRisk) {
  return r === "Rendah" ? "status-success" : r === "Belum Dinilai" ? "status-info" : "status-danger";
}

export type EthicsAnswer = "Ya" | "Tidak" | "Belum Diketahui" | "Tidak Berlaku";
export const ethicsAnswers: EthicsAnswer[] = ["Ya", "Tidak", "Belum Diketahui", "Tidak Berlaku"];

export interface EthicsPrinciple {
  id: string;
  name: string;
  summary: string;
  questions: string[];
}

export const ethicsPrinciples: EthicsPrinciple[] = [
  { id: "inklusivitas", name: "Inklusivitas", summary: "AI dirancang dan digunakan secara adil tanpa diskriminasi terhadap kelompok mana pun.", questions: ["Apakah data pelatihan telah diperiksa terhadap bias kelompok tertentu?", "Apakah kinerja model diuji pada kelompok pengguna yang beragam?"] },
  { id: "kemanusiaan", name: "Kemanusiaan", summary: "AI menghormati hak asasi, martabat, dan nilai kemanusiaan.", questions: ["Apakah keputusan akhir tetap berada di tangan manusia?", "Apakah tersedia mekanisme keberatan bagi pihak terdampak?"] },
  { id: "keamanan", name: "Keamanan", summary: "AI aman bagi pengguna dan lingkungan serta tahan terhadap penyalahgunaan.", questions: ["Apakah sistem telah melalui uji keamanan atau penetrasi?", "Apakah tersedia prosedur penanganan insiden AI?", "Apakah akses ke model dan data dibatasi sesuai peran?"] },
  { id: "aksesibilitas", name: "Aksesibilitas", summary: "Manfaat AI dapat dijangkau oleh seluruh lapisan masyarakat.", questions: ["Apakah antarmuka dapat digunakan oleh penyandang disabilitas?", "Apakah layanan tersedia dalam Bahasa Indonesia yang mudah dipahami?"] },
  { id: "transparansi", name: "Transparansi", summary: "Pengguna mengetahui bahwa mereka berinteraksi dengan AI dan memahami cara kerjanya.", questions: ["Apakah pengguna diberi tahu bahwa layanan menggunakan AI?", "Apakah tersedia penjelasan sederhana tentang dasar keluaran sistem?"] },
  { id: "akuntabilitas", name: "Kredibilitas dan Akuntabilitas", summary: "Terdapat pihak yang bertanggung jawab atas keluaran dan dampak AI.", questions: ["Apakah penanggung jawab sistem AI telah ditetapkan?", "Apakah keluaran sistem tercatat dan dapat diaudit?"] },
  { id: "pdp", name: "Pelindungan Data Pribadi", summary: "Data pribadi diproses secara sah, terbatas, dan aman.", questions: ["Apakah terdapat dasar pemrosesan yang sah untuk data pribadi?", "Apakah data diminimalkan sesuai tujuan pemrosesan?", "Apakah penilaian dampak pelindungan data telah dilakukan?"] },
  { id: "berkelanjutan", name: "Pembangunan dan Lingkungan Berkelanjutan", summary: "AI mempertimbangkan dampak sosial, ekonomi, dan lingkungan jangka panjang.", questions: ["Apakah konsumsi energi pelatihan dan operasional model dipantau?", "Apakah dampak sosial jangka panjang telah dipertimbangkan?"] },
  { id: "hki", name: "Kekayaan Intelektual", summary: "AI menghormati hak kekayaan intelektual atas data, model, dan keluaran.", questions: ["Apakah lisensi data dan model yang digunakan telah diverifikasi?", "Apakah kepemilikan keluaran AI telah diatur dengan jelas?"] },
];

export type PrincipleStatus = "Belum Dinilai" | "Perlu Ditinjau" | "Terpenuhi (Simulasi)";

export function principleStatus(answers: (EthicsAnswer | undefined)[]): PrincipleStatus {
  if (answers.every((a) => !a)) return "Belum Dinilai";
  if (answers.some((a) => !a || a === "Tidak" || a === "Belum Diketahui")) return "Perlu Ditinjau";
  return "Terpenuhi (Simulasi)";
}

export const validateProductSearch = (s: Record<string, unknown>): { product?: string } =>
  typeof s["product"] === "string" ? { product: s["product"] as string } : {};
