// Artikel edukasi GRAZU-AI. Bukan kutipan hukum resmi.

export type SourceKind = "Sumber resmi" | "Penjelasan GRAZU-AI" | "Dokumen draf";

export interface Article {
  slug: string;
  title: string;
  category: string;
  summary: string;
  source: string;
  sourceKind: SourceKind;
  updated: string;
  body: string[];
}

export const articles: Article[] = [
  { slug: "pengantar-tata-kelola-ai", title: "Pengantar Tata Kelola AI", category: "Tata Kelola", summary: "Apa itu tata kelola kecerdasan artifisial dan mengapa organisasi membutuhkannya.", source: "Penjelasan edukatif GRAZU-AI", sourceKind: "Penjelasan GRAZU-AI", updated: "Okt 2026", body: ["Tata kelola AI adalah rangkaian kebijakan, proses, dan peran yang memastikan sistem kecerdasan artifisial dikembangkan dan digunakan secara bertanggung jawab.", "Komponen umumnya meliputi inventarisasi use case, penilaian risiko, pengawasan manusia, keamanan, serta dokumentasi yang dapat diaudit.", "Tata kelola yang baik membantu organisasi membangun kepercayaan publik sekaligus mengelola risiko operasional."] },
  { slug: "sembilan-nilai-etika-ai", title: "Sembilan Nilai Etika AI", category: "Etika", summary: "Ringkasan nilai etika yang menjadi acuan penggunaan AI di Indonesia.", source: "SE Menkominfo No. 9 Tahun 2023", sourceKind: "Sumber resmi", updated: "Okt 2026", body: ["Surat Edaran Menkominfo No. 9 Tahun 2023 memuat nilai-nilai etika kecerdasan artifisial sebagai pedoman bagi pelaku usaha dan penyelenggara sistem elektronik.", "Nilai tersebut mencakup antara lain inklusivitas, kemanusiaan, keamanan, aksesibilitas, transparansi, kredibilitas dan akuntabilitas, pelindungan data pribadi, keberlanjutan, serta kekayaan intelektual.", "Rujuk dokumen resmi untuk rumusan lengkap. Ringkasan ini merupakan penjelasan edukatif, bukan kutipan hukum."] },
  { slug: "konsep-penilaian-risiko-ai", title: "Konsep Penilaian Risiko AI", category: "Risiko", summary: "Cara mengidentifikasi tingkat risiko berdasarkan dampak dan konteks penggunaan.", source: "Penjelasan edukatif GRAZU-AI", sourceKind: "Penjelasan GRAZU-AI", updated: "Okt 2026", body: ["Penilaian risiko menimbang kemungkinan dan dampak kerugian dari sistem AI terhadap individu, organisasi, dan masyarakat.", "Faktor yang umum dipertimbangkan: jenis data yang diproses, tingkat otomatisasi keputusan, sektor penerapan, dan kelompok terdampak.", "Hasil penilaian menentukan tingkat pengawasan dan mitigasi yang diperlukan."] },
  { slug: "dasar-ai-red-teaming", title: "Dasar-Dasar AI Red Teaming", category: "Keamanan", summary: "Pengujian adversarial untuk menemukan kelemahan sistem AI sebelum dieksploitasi.", source: "Penjelasan edukatif GRAZU-AI", sourceKind: "Penjelasan GRAZU-AI", updated: "Okt 2026", body: ["AI red teaming adalah praktik menguji sistem AI dengan skenario serangan, seperti injeksi prompt atau upaya membocorkan data.", "Pengujian dilakukan secara terkendali dan hasilnya didokumentasikan untuk perbaikan.", "Red teaming melengkapi, bukan menggantikan, kontrol keamanan lainnya."] },
  { slug: "devsecops-aplikasi-ai", title: "DevSecOps untuk Aplikasi AI", category: "Keamanan", summary: "Mengintegrasikan pemeriksaan keamanan ke dalam siklus pengembangan aplikasi AI.", source: "Penjelasan edukatif GRAZU-AI", sourceKind: "Penjelasan GRAZU-AI", updated: "Okt 2026", body: ["DevSecOps menempatkan keamanan sebagai bagian dari setiap tahap pengembangan, dari penulisan kode hingga rilis.", "Untuk aplikasi AI, pemeriksaan mencakup kerentanan dependensi, kebocoran rahasia, konfigurasi infrastruktur, dan keamanan prompt.", "Otomasi melalui pipeline CI/CD membantu menemukan masalah lebih awal."] },
  { slug: "panduan-kepatuhan-regulasi", title: "Panduan Kepatuhan Regulasi AI", category: "Regulasi", summary: "Gambaran regulasi yang relevan serta status dokumen yang masih berupa rancangan.", source: "UU No. 27 Tahun 2022; RPerpres (draf)", sourceKind: "Dokumen draf", updated: "Okt 2026", body: ["UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi berlaku bagi sistem AI yang memproses data pribadi.", "RPerpres Etika KA dan RPerpres Peta Jalan KA Nasional masih berupa rancangan yang menunggu verifikasi dan belum mengikat secara hukum.", "Organisasi disarankan memantau perkembangan resmi dan berkonsultasi dengan ahli hukum."] },
];

export const articleBySlug = (s: string) => articles.find((a) => a.slug === s);
export const kindClass = (k: SourceKind) => (k === "Sumber resmi" ? "status-success" : k === "Dokumen draf" ? "status-warning" : "status-info");
