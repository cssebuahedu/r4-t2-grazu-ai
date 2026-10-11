import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseRepoUrl, saveRepo, scanners, type Repository, type ScanProfile } from "@/lib/devsecops";
import { useUseCases } from "@/lib/use-cases";

const sel = "h-9 w-full rounded-md border bg-background px-3 text-sm";

export function RepoForm({ open, onOpenChange, repo }: { open: boolean; onOpenChange: (o: boolean) => void; repo?: Repository | undefined }) {
  const products = useUseCases();
  const [v, setV] = useState(() => ({ name: repo?.name ?? "", url: repo?.url ?? "", org: repo?.org ?? "", productId: repo?.productId ?? "", branch: repo?.branch ?? "main", profile: (repo?.profile ?? "Standard") as ScanProfile, owner: repo?.owner ?? (repo ? parseRepoUrl(repo.url)?.owner ?? "" : ""), visibility: (repo?.visibility ?? "Private") as "Public" | "Private" }));
  const [picked, setPicked] = useState<string[]>(repo?.scanners ?? scanners.map((x) => x.id));
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const set = (k: keyof typeof v, val: string) => setV({ ...v, [k]: val });

  function submit() {
    const e: Partial<Record<keyof typeof v, string>> = {};
    if (!v.name.trim()) e.name = "Nama repository wajib diisi.";
    else if (!/^[\w.-]{1,100}$/.test(v.name.trim())) e.name = "Gunakan huruf, angka, titik, garis bawah, atau tanda hubung.";
    if (!/^https:\/\/[\w.-]+\/[\w./-]+$/.test(v.url.trim())) e.url = "Masukkan URL https yang valid.";
    if (!v.owner.trim()) e.owner = "Pemilik repository wajib diisi.";
    else if (!/^[\w.-]{1,60}$/.test(v.owner.trim())) e.owner = "Gunakan huruf, angka, titik, garis bawah, atau tanda hubung.";
    if (!v.org.trim()) e.org = "Organisasi wajib diisi.";
    if (!v.productId) e.productId = "Pilih produk AI terkait.";
    if (!v.branch.trim()) e.branch = "Branch wajib diisi.";
    setErrors(e);
    if (Object.keys(e).length) return;
    saveRepo({ ...v, name: v.name.trim(), url: v.url.trim(), org: v.org.trim(), branch: v.branch.trim(), owner: v.owner.trim() }, repo?.id, picked);
    onOpenChange(false);
  }

  const field = (k: keyof typeof v, label: string, el: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label htmlFor={`rf-${k}`} className="text-xs">{label}</Label>
      {el}
      {errors[k] && <p className="text-[11px] text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{repo ? "Ubah Repository" : "Tambah Repository"}</DialogTitle>
          <DialogDescription>Konfigurasi demo disimpan sementara. Repository tidak dihubungkan ke GitHub dan tidak memerlukan token akses.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {field("url", "URL Repository", <Input id="rf-url" maxLength={255} value={v.url} onChange={(e) => { const u = e.target.value; const p = parseRepoUrl(u); setV({ ...v, url: u, ...(p ? { owner: p.owner, name: p.name } : {}) }); }} placeholder="https://github.com/organisasi/repository" />)}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("owner", "Pemilik Repository", <Input id="rf-owner" maxLength={60} value={v.owner} onChange={(e) => set("owner", e.target.value)} placeholder="organisasi" />)}
            {field("name", "Nama Repository", <Input id="rf-name" maxLength={100} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="nama-repository" />)}
          </div>
          {field("org", "Organisasi", <Input id="rf-org" maxLength={100} value={v.org} onChange={(e) => set("org", e.target.value)} />)}
          {field("productId", "Produk AI Terkait", (
            <select id="rf-productId" className={sel} value={v.productId} onChange={(e) => { const p = products.find((x) => x.id === e.target.value); setV({ ...v, productId: e.target.value, org: v.org || p?.org || "" }); }}>
              <option value="">Pilih produk</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
            </select>
          ))}
          {!products.length && field("productId", "", (
            <p className="text-[11px] text-muted-foreground">Belum ada produk AI terdaftar. Daftarkan produk melalui Registrasi Use Case AI terlebih dahulu.</p>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("branch", "Default Branch", <Input id="rf-branch" maxLength={60} value={v.branch} onChange={(e) => set("branch", e.target.value)} />)}
            {field("profile", "Profil Pemindaian", (
              <select id="rf-profile" className={sel} value={v.profile} onChange={(e) => set("profile", e.target.value)}>
                {["Basic", "Standard", "Comprehensive"].map((p) => <option key={p}>{p}</option>)}
              </select>
            ))}
            {field("visibility", "Visibilitas Repository", (
              <select id="rf-visibility" className={sel} value={v.visibility} onChange={(e) => set("visibility", e.target.value)}>
                <option value="Public">Public</option><option value="Private">Private (Demo)</option>
              </select>
            ))}
          </div>
          <fieldset className="rounded-md border p-3">
            <legend className="px-1 text-xs font-medium">Kategori Pemindaian</legend>
            <ul className="space-y-2">
              {scanners.map((x) => (
                <li key={x.id}>
                  <label className="flex items-start gap-2 text-xs">
                    <input type="checkbox" className="mt-0.5 accent-primary" checked={picked.includes(x.id)} onChange={() => setPicked(picked.includes(x.id) ? picked.filter((i) => i !== x.id) : [...picked, x.id])} />
                    <span><span className="font-medium">{x.label}</span><span className="block text-muted-foreground">{x.description}</span></span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit}>{repo ? "Simpan Perubahan" : "Tambah Repository"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
