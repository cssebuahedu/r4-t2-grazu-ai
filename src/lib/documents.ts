import { useSyncExternalStore } from "react";
import type { DemoRole } from "./demo-roles";

/** Demo proposal document metadata, linked to products by `productId` (UseCase.id). In-memory only. */
export const docCategories = [
  "Proposal utama", "Dokumen arsitektur AI", "Dokumentasi dataset", "Kebijakan keamanan",
  "Kebijakan privasi", "Dokumen mitigasi risiko", "Dokumen pendukung lainnya",
] as const;
export type DocCategory = (typeof docCategories)[number];
export const docStatuses = ["Draft", "Diajukan", "Dalam Peninjauan", "Perlu Perbaikan", "Diterima untuk Penilaian"] as const;
export type DocStatus = (typeof docStatuses)[number];
export const acceptedFormats = ["PDF", "DOCX", "TXT"] as const;
export const maxFileBytes = 10 * 1024 * 1024;
export const demoUploadNotice = "Dokumen ditambahkan dalam mode demo. File belum diunggah ke server.";

export interface DocEvent { status: DocStatus; by: string; date: string; note?: string }
export interface ProposalDoc {
  id: string; productId: string; title: string; description: string; category: DocCategory;
  fileName: string; format: string; size: number; uploadedAt: string; uploadedBy: string;
  status: DocStatus; timeline: DocEvent[];
  /** Temporary object URL for files selected in this browser session only. */
  previewUrl?: string;
}
export type DocInput = Pick<ProposalDoc, "title" | "description" | "category" | "fileName" | "format" | "size"> & { previewUrl?: string };

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
/** Returns an error message, or null when the file is acceptable. */
export function validateFile(name: string, size: number): string | null {
  const ext = name.split(".").pop()?.toUpperCase() ?? "";
  if (!(acceptedFormats as readonly string[]).includes(ext)) return "Format tidak didukung. Gunakan PDF, DOCX, atau TXT.";
  if (size > maxFileBytes) return "Ukuran file melebihi batas 10 MB.";
  if (size === 0) return "File kosong tidak dapat ditambahkan.";
  return null;
}
export const fileFormat = (name: string) => name.split(".").pop()?.toUpperCase() ?? "";

const now = () => new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const seedDoc = (id: string, productId: string, title: string, category: DocCategory, fileName: string, size: number, by: string, status: DocStatus, timeline: DocEvent[]): ProposalDoc => ({
  id, productId, title, description: "", category, fileName, format: fileFormat(fileName), size, uploadedAt: timeline[0]!.date, uploadedBy: by, status, timeline,
});
const seed = (): ProposalDoc[] => [
  seedDoc("DOC-001", "UC-001", "Proposal Asisten Layanan Publik", "Proposal utama", "proposal-asisten-layanan.pdf", 2_457_600, "Anisa Putri", "Dalam Peninjauan", [
    { status: "Diajukan", by: "Anisa Putri", date: "09 Okt 2026 10.12" },
    { status: "Dalam Peninjauan", by: "Rina Pratiwi", date: "10 Okt 2026 09.00", note: "Peninjauan kelengkapan dimulai." },
  ]),
  seedDoc("DOC-002", "UC-001", "Kebijakan Privasi Layanan", "Kebijakan privasi", "kebijakan-privasi.docx", 348_160, "Bagus Hartono", "Perlu Perbaikan", [
    { status: "Diajukan", by: "Bagus Hartono", date: "09 Okt 2026 11.30" },
    { status: "Perlu Perbaikan", by: "Rina Pratiwi", date: "10 Okt 2026 14.20", note: "Lengkapi masa retensi data pengguna." },
  ]),
  seedDoc("DOC-003", "UC-002", "Arsitektur Deteksi Anomali", "Dokumen arsitektur AI", "arsitektur-anomali.pdf", 5_242_880, "Tim Bank Nusantara", "Diterima untuk Penilaian", [
    { status: "Diajukan", by: "Tim Bank Nusantara", date: "08 Okt 2026 08.45" },
    { status: "Diterima untuk Penilaian", by: "Dimas Saputra", date: "09 Okt 2026 16.00" },
  ]),
];

let docs: ProposalDoc[] = seed();
let counter = docs.length;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const initialDocs = docs;
export const useDocuments = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => docs, () => initialDocs);
export const getDocuments = () => docs;
export const resetDocuments = () => { docs = seed(); counter = docs.length; emit(); };

export const documentActions = {
  add(productId: string, input: DocInput, by: string): ProposalDoc {
    counter += 1;
    const date = now();
    const doc: ProposalDoc = { ...input, id: `DOC-${String(counter).padStart(3, "0")}`, productId, uploadedAt: date, uploadedBy: by, status: "Diajukan", timeline: [{ status: "Diajukan", by, date }] };
    docs = [doc, ...docs]; emit();
    return doc;
  },
  update(id: string, patch: Pick<ProposalDoc, "title" | "description" | "category">) {
    docs = docs.map((d) => (d.id === id ? { ...d, ...patch } : d)); emit();
  },
  remove(id: string) {
    const d = docs.find((x) => x.id === id);
    if (d?.previewUrl) URL.revokeObjectURL(d.previewUrl);
    docs = docs.filter((x) => x.id !== id); emit();
  },
  setStatus(id: string, status: DocStatus, by: string, note?: string) {
    docs = docs.map((d) => (d.id === id ? { ...d, status, timeline: [...d.timeline, { status, by, date: now(), ...(note?.trim() ? { note: note.trim() } : {}) }] } : d)); emit();
  },
};

/** Presentation-only permissions (not real file security). */
export function docPermissions(role: DemoRole, productOrg: string, clientOrgKey: string) {
  const own = role === "client" && productOrg === clientOrgKey;
  return { view: role !== "client" || own, manage: own || role === "superadmin", review: role === "admin" || role === "superadmin" };
}
