import type { UseCase } from "@/lib/use-cases";
import { sectors } from "@/lib/use-cases";

// Semua indikator di modul ini adalah SIMULASI untuk demo, bukan statistik resmi.

export const demoNote = "MODE DEMO — Data simulasi, bukan statistik resmi nasional.";

export const analyticsSectors = sectors.includes("Industri") ? sectors : [...sectors, "Industri"];

/** Sepuluh slot katalog bidang prioritas — nama resmi belum diverifikasi. */
export const prioritySlots = Array.from({ length: 10 }, (_, i) => `Bidang Prioritas ${String(i + 1).padStart(2, "0")}`);

/** Pemetaan deterministik produk ke slot katalog (sementara, hingga katalog resmi tersedia). */
export const prioritySlotOf = (u: UseCase) => {
  const n = parseInt(u.id.replace(/\D/g, ""), 10) || 1;
  return prioritySlots[(n - 1) % 10]!;
};

export const assessed = (u: UseCase) => u.status !== "Diajukan";

export const regions: Record<string, string[]> = {
  Sumatera: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Bengkulu", "Lampung"],
  Jawa: ["DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur"],
  "Bali & Nusa Tenggara": ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"],
  Kalimantan: ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"],
  Sulawesi: ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara"],
  "Maluku & Papua": ["Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Barat Daya", "Papua Tengah", "Papua Pegunungan", "Papua Selatan"],
};
export const provinces = Object.values(regions).flat();
export const regionOf = (p: string) => Object.keys(regions).find((r) => regions[r]!.includes(p)) ?? "Lainnya";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
// Bulan acuan registri demo: Oktober 2026.
const BASE_Y = 2026;
const BASE_M = 9;
export const monthLabel = (offset: number) => {
  const t = BASE_Y * 12 + BASE_M + offset;
  return `${monthNames[((t % 12) + 12) % 12]} ${Math.floor(t / 12)}`;
};

// Kurva kumulatif simulasi 12 bulan (fraksi dari jumlah registri saat ini).
const curve = [0.12, 0.18, 0.22, 0.3, 0.36, 0.42, 0.5, 0.58, 0.66, 0.75, 0.88, 1];

/** Riwayat kumulatif simulasi; titik terakhir = jumlah registri aktual. */
export function simulatedHistory(current: number, months: number) {
  return curve.slice(12 - months).map((f, i) => ({
    month: monthLabel(i - months + 1),
    value: Math.round(current * f),
  }));
}

export const scenarios = { Konservatif: 0.02, Moderat: 0.04, Optimistis: 0.07 } as const;
export type Scenario = keyof typeof scenarios;

export const project = (base: number, rate: number, step: number) => Math.round(base * Math.pow(1 + rate, step));

export const count = <T,>(list: T[], key: (x: T) => string) => {
  const m = new Map<string, number>();
  list.forEach((x) => m.set(key(x), (m.get(key(x)) ?? 0) + 1));
  return m;
};

export const dominant = <T,>(list: T[], key: (x: T) => string) => {
  const e = [...count(list, key)].sort((a, b) => b[1] - a[1]);
  return e[0]?.[0] ?? "—";
};
