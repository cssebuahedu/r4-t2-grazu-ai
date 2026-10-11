import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UploadDocumentDialog } from "./upload-document-dialog";
import { demoUploadNotice, docCategories, docPermissions, docStatuses, documentActions, formatSize, useDocuments, type DocCategory, type DocStatus, type ProposalDoc } from "@/lib/documents";
import { useDemoRole, demoRoles } from "@/lib/demo-roles";
import { useOrganization } from "@/lib/organization";
import type { UseCase } from "@/lib/use-cases";

const selectCls = "h-9 rounded-md border bg-background px-2 text-xs outline-none focus:border-primary";
export const docStatusClass = (s: DocStatus) =>
  s === "Diterima untuk Penilaian" ? "status-success" : s === "Perlu Perbaikan" ? "status-danger" : s === "Dalam Peninjauan" ? "status-warning" : "status-info";

export function DocumentsPanel({ product }: { product: UseCase }) {
  const { role } = useDemoRole();
  const { org, account } = useOrganization();
  const perms = docPermissions(role, product.org, org.key);
  const actor = role === "client" ? account.name : `${demoRoles[role].label} (Demo)`;
  const all = useDocuments().filter((d) => d.productId === product.id);
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [upload, setUpload] = useState(false);
  const [notice, setNotice] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProposalDoc | null>(null);
  const [deleting, setDeleting] = useState<ProposalDoc | null>(null);
  const shown = all.filter((d) => (!cat || d.category === cat) && (!status || d.status === status));
  const viewed = all.find((d) => d.id === viewing);

  if (!perms.view) return <p className="rounded-md border bg-card p-6 text-sm text-muted-foreground">Dokumen hanya dapat dilihat oleh organisasi pemilik produk.</p>;

  return (
    <div className="space-y-5">
      {notice && <p role="status" className="rounded-md border border-primary/30 bg-accent px-4 py-2.5 text-xs text-primary">{demoUploadNotice}</p>}
      <section className="rounded-md border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Dokumen Proposal</h2>
            <p className="mt-1 text-xs text-muted-foreground">Status menunjukkan progres alur kerja, bukan sertifikasi atau persetujuan produk.</p>
          </div>
          {perms.manage && <Button size="sm" onClick={() => setUpload(true)}>+ Unggah Dokumen</Button>}
        </div>
        <div className="flex flex-wrap gap-2 border-b px-5 py-3">
          <select aria-label="Filter kategori" className={selectCls} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Semua kategori</option>{docCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Filter status" className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>{docStatuses.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="border-b bg-background text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>{["Nama dokumen", "Jenis", "Format", "Ukuran", "Tanggal unggah", "Diunggah oleh", "Status", "Aksi"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">{all.length ? "Tidak ada dokumen yang cocok dengan filter." : "Belum ada dokumen proposal."}</td></tr>}
              {shown.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="px-4 py-3"><p className="font-medium">{d.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{d.fileName}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{d.category}</td>
                  <td className="px-4 py-3">{d.format}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatSize(d.size)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{d.uploadedAt}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.uploadedBy}</td>
                  <td className="px-4 py-3"><span className={`status ${docStatusClass(d.status)}`}>{d.status}</span></td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-primary" onClick={() => setViewing(d.id)}>Detail</Button>
                    {perms.manage && <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setEditing(d)}>Ubah</Button>}
                    {perms.manage && <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => setDeleting(d)}>Hapus</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-disabled="true" className="rounded-md border border-dashed bg-background p-5 opacity-80">
        <div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold">Analisis Dokumen dengan AI</h2><span className="status status-info">Segera hadir</span></div>
        <p className="mt-2 text-xs text-muted-foreground">Ekstraksi informasi proposal, deteksi indikator risiko, dan analisis kesesuaian dokumen akan tersedia setelah integrasi backend AI.</p>
        <Button size="sm" variant="outline" className="mt-3" disabled>Analisis Dokumen</Button>
      </section>

      <UploadDocumentDialog open={upload} onOpenChange={setUpload} productLabel={`${product.id} · ${product.name}`}
        onSubmit={(input) => { documentActions.add(product.id, input, actor); setNotice(true); }} />
      {viewed && <DetailDialog doc={viewed} canReview={perms.review} actor={actor} onClose={() => setViewing(null)} />}
      {editing && <EditDialog doc={editing} onClose={() => setEditing(null)} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dokumen?</AlertDialogTitle>
            <AlertDialogDescription>Catatan dokumen "{deleting?.title}" akan dihapus dari data demo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleting) documentActions.remove(deleting.id); setDeleting(null); }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DetailDialog({ doc, canReview, actor, onClose }: { doc: ProposalDoc; canReview: boolean; actor: string; onClose: () => void }) {
  const [next, setNext] = useState<DocStatus>(doc.status);
  const [note, setNote] = useState("");
  const rows: [string, string][] = [["Kategori", doc.category], ["File", `${doc.fileName} · ${doc.format} · ${formatSize(doc.size)}`], ["Diunggah", `${doc.uploadedAt} oleh ${doc.uploadedBy}`], ["Deskripsi", doc.description || "—"]];
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{doc.title}</DialogTitle>
          <DialogDescription>{doc.id} · <span className={`status ${docStatusClass(doc.status)}`}>{doc.status}</span></DialogDescription>
        </DialogHeader>
        <dl className="space-y-2 text-sm">{rows.map(([k, v]) => <div key={k} className="grid grid-cols-3 gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="col-span-2 break-words">{v}</dd></div>)}</dl>
        {doc.previewUrl
          ? <a href={doc.previewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Pratinjau sementara (sesi ini saja)</a>
          : <p className="text-xs text-muted-foreground">File contoh tidak tersedia untuk diunduh dalam mode demo.</p>}
        <div>
          <h3 className="mb-2 text-xs font-semibold">Riwayat Peninjauan</h3>
          <ol className="space-y-2 border-l pl-4">
            {doc.timeline.map((e, i) => (
              <li key={i} className="text-xs">
                <p><span className="font-medium">{e.status}</span> · <span className="text-muted-foreground">{e.by} · {e.date}</span></p>
                {e.note && <p className="mt-0.5 text-muted-foreground">Catatan: {e.note}</p>}
              </li>
            ))}
          </ol>
        </div>
        {canReview && (
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="rev-status">Perbarui status (simulasi)</Label>
            <select id="rev-status" className={`${selectCls} w-full`} value={next} onChange={(e) => setNext(e.target.value as DocStatus)}>{docStatuses.map((s) => <option key={s}>{s}</option>)}</select>
            <Textarea aria-label="Catatan peninjau" placeholder="Catatan peninjau (opsional)" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button size="sm" disabled={next === doc.status && !note.trim()} onClick={() => { documentActions.setStatus(doc.id, next, actor, note); setNote(""); }}>Simpan Tinjauan</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ doc, onClose }: { doc: ProposalDoc; onClose: () => void }) {
  const [title, setTitle] = useState(doc.title);
  const [description, setDescription] = useState(doc.description);
  const [category, setCategory] = useState<DocCategory>(doc.category);
  const invalid = title.trim().length < 3;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Ubah Dokumen</DialogTitle><DialogDescription>Perubahan hanya tersimpan sementara.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label htmlFor="ed-title">Judul dokumen</Label><Input id="ed-title" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />{invalid && <p className="text-xs text-destructive">Judul minimal 3 karakter.</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="ed-cat">Kategori</Label><select id="ed-cat" className={`${selectCls} w-full text-sm`} value={category} onChange={(e) => setCategory(e.target.value as DocCategory)}>{docCategories.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="space-y-1.5"><Label htmlFor="ed-desc">Deskripsi</Label><Textarea id="ed-desc" rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button disabled={invalid} onClick={() => { documentActions.update(doc.id, { title: title.trim(), description: description.trim(), category }); onClose(); }}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
