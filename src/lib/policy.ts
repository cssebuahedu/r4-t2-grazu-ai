// Seluruh rekomendasi di modul ini ILUSTRATIF untuk demo — bukan keputusan kebijakan resmi pemerintah.

export type Priority = "Tinggi" | "Sedang" | "Rendah";
export type RecStatus = "Draf" | "Perlu Review" | "Ditinjau" | "Diarsipkan";

export interface RegRef {
  id: string;
  name: string;
  kind: "Resmi" | "Draf";
  note: string;
}

export const regulatoryRefs: RegRef[] = [
  { id: "se9", name: "SE Menkominfo No. 9 Tahun 2023", kind: "Resmi", note: "Surat edaran tentang etika kecerdasan artifisial; bersifat pedoman." },
  { id: "pdp", name: "UU No. 27 Tahun 2022", kind: "Resmi", note: "Undang-undang Pelindungan Data Pribadi." },
  { id: "etika", name: "RPerpres Etika KA", kind: "Draf", note: "Rancangan — menunggu verifikasi, belum mengikat secara hukum." },
  { id: "peta", name: "RPerpres Peta Jalan KA Nasional", kind: "Draf", note: "Rancangan — menunggu verifikasi, belum mengikat secara hukum." },
];

export interface Recommendation {
  id: string;
  title: string;
  region: string;
  sector: string;
  priority: Priority;
  status: RecStatus;
  problem: string;
  data: string[];
  intervention: string;
  outcome: string;
  refs: string[];
  notes: string;
}

export const recommendations: Recommendation[] = [
  { id: "REK-01", title: "Pedoman pengawasan manusia untuk AI kesehatan", region: "Jawa Barat", sector: "Kesehatan", priority: "Tinggi", status: "Perlu Review", problem: "Use case analisis citra medis memproses data kesehatan sensitif dengan tingkat risiko tinggi.", data: ["1 use case kesehatan berisiko tinggi di registri demo", "Memproses data pribadi sensitif"], intervention: "Menyusun pedoman verifikasi klinis oleh tenaga medis sebelum keluaran digunakan.", outcome: "Keputusan klinis tetap berada pada tenaga kesehatan.", refs: ["se9", "pdp", "etika"], notes: "Perlu masukan dari asosiasi profesi medis." },
  { id: "REK-02", title: "Standar audit model penilaian kredit", region: "Sulawesi Selatan", sector: "Perdagangan", priority: "Tinggi", status: "Perlu Review", problem: "Penilaian kredit UMKM berbasis AI berpotensi menimbulkan bias akses pembiayaan.", data: ["1 use case kredit berisiko tinggi berstatus Diajukan", "Memproses data pribadi pelaku UMKM"], intervention: "Mewajibkan uji bias berkala dan mekanisme banding bagi pemohon.", outcome: "Akses pembiayaan yang lebih adil dan dapat dijelaskan.", refs: ["se9", "pdp"], notes: "" },
  { id: "REK-03", title: "Kerangka deteksi fraud yang akuntabel", region: "DKI Jakarta", sector: "Keuangan", priority: "Sedang", status: "Ditinjau", problem: "Deteksi anomali transaksi masih dalam penilaian dan memproses data sensitif.", data: ["Konsentrasi use case tertinggi di DKI Jakarta", "1 use case keuangan dalam penilaian"], intervention: "Pedoman dokumentasi alasan penandaan transaksi dan peninjauan analis.", outcome: "Pengurangan positif palsu yang merugikan nasabah.", refs: ["pdp", "etika"], notes: "Telah dibahas dalam forum internal (simulasi)." },
  { id: "REK-04", title: "Percepatan literasi AI di sektor pertanian", region: "Jawa Timur", sector: "Pertanian", priority: "Sedang", status: "Draf", problem: "Pemanfaatan AI pertanian masih terbatas pada sedikit organisasi.", data: ["1 use case pertanian terverifikasi di registri demo"], intervention: "Program pendampingan penyuluh dan berbagi data cuaca terbuka.", outcome: "Perluasan adopsi AI untuk ketahanan pangan.", refs: ["peta"], notes: "" },
  { id: "REK-05", title: "Pemerataan adopsi AI di luar Jawa", region: "Kalimantan Timur", sector: "Energi", priority: "Sedang", status: "Draf", problem: "Sebaran use case terkonsentrasi di Pulau Jawa.", data: ["3 dari 8 use case demo berada di luar Jawa"], intervention: "Insentif proyek percontohan AI untuk utilitas daerah.", outcome: "Distribusi adopsi antarwilayah yang lebih seimbang.", refs: ["peta"], notes: "" },
  { id: "REK-06", title: "Transparansi chatbot layanan publik", region: "DKI Jakarta", sector: "Pemerintahan", priority: "Rendah", status: "Ditinjau", problem: "Masyarakat perlu mengetahui ketika berinteraksi dengan sistem AI.", data: ["1 asisten percakapan layanan publik terdaftar"], intervention: "Label pemberitahuan interaksi AI pada kanal layanan.", outcome: "Kepercayaan publik terhadap layanan digital meningkat.", refs: ["se9", "etika"], notes: "" },
  { id: "REK-07", title: "Panduan logistik berbasis AI", region: "Sumatera Utara", sector: "Transportasi", priority: "Rendah", status: "Diarsipkan", problem: "Use case optimasi rute masih tahap uji coba.", data: ["1 use case transportasi berstatus uji coba"], intervention: "Menunggu hasil uji coba sebelum menyusun panduan.", outcome: "Panduan berbasis bukti lapangan.", refs: ["peta"], notes: "Ditunda hingga data uji coba tersedia." },
];

export const quickWins = [
  { region: "Jawa Barat", sector: "Kesehatan", gap: "Belum ada pedoman verifikasi klinis", win: "Templat formulir verifikasi tenaga medis", priority: "Tinggi" as Priority },
  { region: "Sulawesi Selatan", sector: "Perdagangan", gap: "Belum ada mekanisme banding", win: "Kanal pengaduan keputusan kredit", priority: "Tinggi" as Priority },
  { region: "DKI Jakarta", sector: "Pemerintahan", gap: "Label interaksi AI belum seragam", win: "Teks pemberitahuan standar", priority: "Sedang" as Priority },
  { region: "Jawa Timur", sector: "Pertanian", gap: "Literasi AI penyuluh terbatas", win: "Modul pelatihan daring singkat", priority: "Rendah" as Priority },
];

export const priorityClass = (p: Priority) => (p === "Tinggi" ? "status-danger" : p === "Sedang" ? "status-warning" : "status-info");
export const recStatusClass = (s: RecStatus) => (s === "Ditinjau" ? "status-success" : s === "Perlu Review" ? "status-warning" : "status-info");
