import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { demoRoles, useDemoRole, type DemoRole } from "@/lib/demo-roles";
import { demoClientOrg, demoParticipant } from "@/lib/assistant";

interface Profile { name: string; email: string; org: string; phone: string }
const defaults: Record<DemoRole, Profile> = {
  superadmin: { name: "Dimas Prakoso", email: "superadmin@demo.grazu.id", org: "GRAZU-AI", phone: "" },
  admin: { name: "Ayulia Ningsih", email: "operator@demo.grazu.id", org: "GRAZU-AI", phone: "" },
  client: { name: demoParticipant.name, email: "anisa.putri@demo.grazu.id", org: demoClientOrg, phone: "" },
};

/** Demo profile menu. Edits live in component state only; no real account exists. */
export function ProfileMenu() {
  const { role, setRole } = useDemoRole();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(defaults);
  const [panel, setPanel] = useState<"profile" | "settings" | null>(null);
  const [draft, setDraft] = useState<Profile>(defaults[role]);
  const [notify, setNotify] = useState(true);
  const p = profiles[role];
  const r = demoRoles[role];
  const openPanel = (k: "profile" | "settings") => { setDraft(p); setPanel(k); };
  const save = () => { setProfiles((all) => ({ ...all, [role]: { ...draft, name: draft.name.trim() || p.name } })); setPanel(null); };
  const signOut = () => { setProfiles(defaults); setRole("superadmin"); void navigate({ to: "/" }); };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="Menu profil" className="flex items-center gap-3 rounded-md p-1 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">{r.initials}</span>
            <span className="hidden lg:block">
              <span className="block text-xs font-semibold">{p.name}</span>
              <span className="mt-1 block text-[10px] text-muted-foreground">{r.label}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-semibold">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.email} (demo)</p>
            <p className="mt-2 text-[11px] text-muted-foreground">Peran: <span className="text-foreground">{r.label}</span></p>
            {p.org && <p className="text-[11px] text-muted-foreground">Organisasi: <span className="text-foreground">{p.org}</span></p>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => openPanel("profile")}><User size={14} /> Profil Saya</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openPanel("settings")}><Settings size={14} /> Pengaturan Akun</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={signOut}><LogOut size={14} /> Keluar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={panel !== null} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{panel === "profile" ? "Profil Saya" : "Pengaturan Akun"}</DialogTitle>
            <DialogDescription>Mode demo — perubahan hanya tersimpan sementara di halaman ini.</DialogDescription>
          </DialogHeader>
          {panel === "profile" ? (
            <div className="space-y-3">
              <Field id="pf-name" label="Nama tampilan" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
              <Field id="pf-org" label="Organisasi" value={draft.org} onChange={(v) => setDraft({ ...draft, org: v })} />
              <Field id="pf-phone" label="Telepon (opsional)" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
              <p className="text-xs text-muted-foreground">Peran: {r.label}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Field id="pf-email" label="Email (demo)" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-primary" />
                Notifikasi email (simulasi)
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPanel(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
