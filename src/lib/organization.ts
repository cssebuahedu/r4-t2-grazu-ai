import { useSyncExternalStore } from "react";
import { demoClientOrg } from "./assistant";

/**
 * Demo client organization profile (in-memory only).
 * `key` is the stable link to use cases (`UseCase.org`); renaming the display name never relinks products.
 */
export interface OrgProfile {
  key: string; name: string; type: string; sector: string; province: string; city: string; website: string; description: string;
}
export interface AccountInfo { name: string; email: string; phone: string; position: string }
export interface Member { name: string; email: string; role: string }

export const orgTypes = ["Kementerian/Lembaga", "Pemerintah Daerah", "BUMN/BUMD", "Swasta", "Akademik", "Organisasi Nirlaba"];

const initialOrg: OrgProfile = {
  key: demoClientOrg, name: demoClientOrg, type: "Kementerian/Lembaga", sector: "Pemerintahan",
  province: "DKI Jakarta", city: "Jakarta Pusat", website: "",
  description: "Instansi pemerintah yang mengelola layanan administrasi publik berbasis digital.",
};
const initialAccount: AccountInfo = { name: "Anisa Putri", email: "anisa.putri@demo.grazu.id", phone: "081234567890", position: "Kepala Unit Transformasi Digital" };
export const orgMembers: Member[] = [
  { name: "Anisa Putri", email: "anisa.putri@demo.grazu.id", role: "Pemilik Organisasi" },
  { name: "Bagus Hartono", email: "bagus.h@demo.grazu.id", role: "Pengelola Produk AI" },
  { name: "Citra Lestari", email: "citra.l@demo.grazu.id", role: "Petugas Kepatuhan" },
];

interface State { org: OrgProfile; account: AccountInfo; onboarded: boolean }
let state: State = { org: initialOrg, account: initialAccount, onboarded: false };
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };
const initialState = state;
export const useOrganization = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => state, () => initialState);
export const getOrganizationState = () => state;
export const resetOrganization = () => set({ org: initialOrg, account: initialAccount, onboarded: false });

export const organizationActions = {
  /** The stable key is preserved so existing products stay linked. */
  updateOrg: (data: Omit<OrgProfile, "key">) => set({ org: { ...data, key: state.org.key } }),
  completeOnboarding(account: AccountInfo, org: Omit<OrgProfile, "key">) {
    set({ account, org: { ...org, key: state.org.key }, onboarded: true });
  },
};

export type Errors<T> = Partial<Record<keyof T, string>>;
export function validateAccount(a: AccountInfo): Errors<AccountInfo> {
  const e: Errors<AccountInfo> = {};
  if (a.name.trim().length < 3) e.name = "Nama lengkap minimal 3 karakter.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) e.email = "Format email tidak valid.";
  if (!/^(\+62|0)8\d{7,11}$/.test(a.phone.replace(/[\s-]/g, ""))) e.phone = "Nomor telepon harus diawali 08 atau +628 (9–13 digit).";
  if (!a.position.trim()) e.position = "Jabatan wajib diisi.";
  return e;
}
export function validateOrg(o: Omit<OrgProfile, "key">): Errors<OrgProfile> {
  const e: Errors<OrgProfile> = {};
  if (o.name.trim().length < 3) e.name = "Nama organisasi minimal 3 karakter.";
  if (!o.type) e.type = "Pilih jenis organisasi.";
  if (!o.sector) e.sector = "Pilih sektor.";
  if (!o.province.trim()) e.province = "Provinsi wajib diisi.";
  if (!o.city.trim()) e.city = "Kabupaten/Kota wajib diisi.";
  if (o.website.trim() && !/^https?:\/\/[^\s.]+\.[^\s]+$/.test(o.website.trim())) e.website = "Website harus diawali http:// atau https://.";
  if (o.description.trim().length < 20) e.description = "Deskripsi minimal 20 karakter.";
  return e;
}
