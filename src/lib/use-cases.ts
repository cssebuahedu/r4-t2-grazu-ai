import { useSyncExternalStore } from "react";

export type RiskLevel = "Rendah" | "Sedang" | "Tinggi";
export type RegistrationStatus = "Diajukan" | "Dalam penilaian" | "Terdaftar" | "Terverifikasi";

export interface UseCase {
  id: string;
  name: string;
  org: string;
  description: string;
  systemType: string;
  devStatus: string;
  sector: string;
  priorityArea: string;
  province: string;
  city: string;
  targetUsers: string;
  purpose: string;
  modelType: string;
  modelProvider: string;
  dataSource: string;
  dataTypes: string;
  personalData: "Ya" | "Tidak";
  sensitiveData: "Ya" | "Tidak";
  risk: RiskLevel;
  impact: string;
  humanOversight: string;
  mitigation: string;
  securityPolicy: string;
  status: RegistrationStatus;
  date: string;
}

export const sectors = ["Pemerintahan", "Keuangan", "Kesehatan", "Pendidikan", "Pertanian", "Transportasi", "Energi", "Perdagangan"];
export const riskLevels: RiskLevel[] = ["Rendah", "Sedang", "Tinggi"];
export const statuses: RegistrationStatus[] = ["Diajukan", "Dalam penilaian", "Terdaftar", "Terverifikasi"];

const base = (u: Partial<UseCase> & Pick<UseCase, "id" | "name" | "org" | "sector" | "province" | "city" | "risk" | "status" | "date" | "description">): UseCase => ({
  systemType: "Sistem pendukung keputusan",
  devStatus: "Produksi",
  priorityArea: "Layanan publik",
  targetUsers: "Masyarakat umum",
  purpose: "Meningkatkan efisiensi dan kualitas layanan.",
  modelType: "Machine learning terawasi",
  modelProvider: "Dikembangkan internal",
  dataSource: "Data operasional internal",
  dataTypes: "Data terstruktur",
  personalData: "Tidak",
  sensitiveData: "Tidak",
  impact: "Dampak terbatas pada pengalaman pengguna.",
  humanOversight: "Petugas meninjau setiap keluaran sebelum digunakan.",
  mitigation: "Pemantauan kinerja model secara berkala.",
  securityPolicy: "Mengikuti kebijakan keamanan informasi organisasi.",
  ...u,
});

const initial: UseCase[] = [
  base({ id: "UC-001", name: "Asisten Layanan Publik", org: "Kementerian Pelayanan Publik", sector: "Pemerintahan", province: "DKI Jakarta", city: "Jakarta Pusat", risk: "Rendah", status: "Terdaftar", date: "09 Okt 2026", description: "Chatbot untuk menjawab pertanyaan masyarakat tentang layanan administrasi.", systemType: "Asisten percakapan", modelType: "Large language model", modelProvider: "Penyedia model komersial" }),
  base({ id: "UC-002", name: "Deteksi Anomali Transaksi", org: "Bank Nusantara", sector: "Keuangan", province: "DKI Jakarta", city: "Jakarta Selatan", risk: "Tinggi", status: "Dalam penilaian", date: "09 Okt 2026", description: "Deteksi pola transaksi mencurigakan untuk pencegahan penipuan.", personalData: "Ya", sensitiveData: "Ya", priorityArea: "Keamanan finansial", targetUsers: "Analis fraud internal" }),
  base({ id: "UC-003", name: "Analisis Citra Medis", org: "RS Sehat Indonesia", sector: "Kesehatan", province: "Jawa Barat", city: "Bandung", risk: "Tinggi", status: "Dalam penilaian", date: "08 Okt 2026", description: "Membantu radiolog mendeteksi kelainan pada citra rontgen dada.", modelType: "Computer vision", personalData: "Ya", sensitiveData: "Ya", targetUsers: "Dokter radiologi", priorityArea: "Kesehatan" }),
  base({ id: "UC-004", name: "Rekomendasi Pembelajaran", org: "Universitas Cendekia", sector: "Pendidikan", province: "DI Yogyakarta", city: "Sleman", risk: "Sedang", status: "Terdaftar", date: "08 Okt 2026", description: "Rekomendasi materi kuliah sesuai capaian belajar mahasiswa.", personalData: "Ya", targetUsers: "Mahasiswa", priorityArea: "Pendidikan" }),
  base({ id: "UC-005", name: "Prediksi Hasil Pertanian", org: "Agri Teknologi Indonesia", sector: "Pertanian", province: "Jawa Timur", city: "Malang", risk: "Rendah", status: "Terverifikasi", date: "07 Okt 2026", description: "Prakiraan hasil panen berdasarkan data cuaca dan citra satelit.", dataSource: "Data cuaca dan citra satelit publik", targetUsers: "Petani dan penyuluh", priorityArea: "Ketahanan pangan" }),
  base({ id: "UC-006", name: "Optimasi Rute Logistik", org: "Nusa Logistik", sector: "Transportasi", province: "Sumatera Utara", city: "Medan", risk: "Rendah", status: "Diajukan", date: "06 Okt 2026", description: "Optimasi rute pengiriman untuk menekan waktu dan biaya distribusi.", devStatus: "Uji coba", targetUsers: "Tim operasional" }),
  base({ id: "UC-007", name: "Prakiraan Beban Listrik", org: "Energi Daya Nusantara", sector: "Energi", province: "Kalimantan Timur", city: "Balikpapan", risk: "Sedang", status: "Terdaftar", date: "05 Okt 2026", description: "Prakiraan kebutuhan beban listrik harian per gardu induk.", modelType: "Model deret waktu", targetUsers: "Operator jaringan" }),
  base({ id: "UC-008", name: "Penilaian Kredit UMKM", org: "Koperasi Digital Sejahtera", sector: "Perdagangan", province: "Sulawesi Selatan", city: "Makassar", risk: "Tinggi", status: "Diajukan", date: "04 Okt 2026", description: "Penilaian kelayakan kredit pelaku UMKM berbasis data transaksi.", personalData: "Ya", devStatus: "Pengembangan", targetUsers: "Pelaku UMKM" }),
];

let state = initial;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));

export function useUseCases() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

export function addUseCase(data: Omit<UseCase, "id" | "status" | "date">): UseCase {
  const id = `UC-${String(state.length + 1).padStart(3, "0")}`;
  const date = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const record: UseCase = { ...data, id, status: "Diajukan", date };
  state = [record, ...state];
  listeners.forEach((l) => l());
  return record;
}

export function filterUseCases(list: UseCase[], q: string, sector: string, risk: string, status: string) {
  const s = q.trim().toLowerCase();
  return list.filter(
    (u) =>
      (!s || u.name.toLowerCase().includes(s) || u.org.toLowerCase().includes(s)) &&
      (!sector || u.sector === sector) &&
      (!risk || u.risk === risk) &&
      (!status || u.status === status),
  );
}

export const riskClass = (r: string) =>
  r === "Rendah" ? "status-success" : r === "Sedang" ? "status-warning" : "status-danger";
export const statusClass = (s: string) =>
  s === "Terverifikasi" ? "status-success" : s === "Dalam penilaian" ? "status-warning" : "status-info";
