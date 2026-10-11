import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { docCategories, fileFormat, formatSize, validateFile, type DocCategory, type DocInput } from "@/lib/documents";

const selectCls = "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary";

/** Collects demo document metadata; the file never leaves the browser. */
export function UploadDocumentDialog({ open, onOpenChange, productLabel, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; productLabel: string; onSubmit: (input: DocInput) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [category, setCategory] = useState<DocCategory | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"file" | "category" | "title", string>>>({});
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setFile(null); setFileError(null); setCategory(""); setTitle(""); setDescription(""); setErrors({}); };
  const pick = (f: File | undefined) => {
    if (!f) return;
    const err = validateFile(f.name, f.size);
    setFileError(err);
    setFile(err ? null : f);
    if (!err && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };
  const submit = () => {
    const e: Partial<Record<"file" | "category" | "title", string>> = {};
    if (!file) e.file = "Pilih file terlebih dahulu.";
    if (!category) e.category = "Pilih kategori dokumen.";
    if (title.trim().length < 3) e.title = "Judul minimal 3 karakter.";
    if (title.length > 120) e.title = "Judul maksimal 120 karakter.";
    setErrors(e);
    if (Object.keys(e).length || !file || !category) return;
    const fmt = fileFormat(file.name);
    // Temporary preview only for formats browsers can render safely.
    const previewUrl = fmt === "PDF" || fmt === "TXT" ? URL.createObjectURL(file) : undefined;
    onSubmit({ title: title.trim(), description: description.trim().slice(0, 500), category, fileName: file.name, format: fmt, size: file.size, ...(previewUrl ? { previewUrl } : {}) });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Unggah Dokumen</DialogTitle>
          <DialogDescription>Format PDF, DOCX, atau TXT · maksimal 10 MB. Mode demo — file tidak dikirim ke server.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2.5 text-sm">
              <span className="min-w-0"><span className="block truncate font-medium">{file.name}</span><span className="text-xs text-muted-foreground">{fileFormat(file.name)} · {formatSize(file.size)}</span></span>
              <Button variant="ghost" size="icon" aria-label="Hapus file terpilih" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}><X size={15} /></Button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              className={`rounded-md border border-dashed px-4 py-6 text-center text-sm ${drag ? "border-primary bg-accent" : "bg-background"}`}
            >
              <p className="text-muted-foreground">Tarik file ke sini, atau</p>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => inputRef.current?.click()}>Pilih File</Button>
            </div>
          )}
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" aria-label="Pilih file dokumen" onChange={(e) => pick(e.target.files?.[0])} />
          {(fileError || errors.file) && <p className="text-xs text-destructive">{fileError ?? errors.file}</p>}

          <div className="space-y-1.5">
            <Label htmlFor="doc-category">Kategori dokumen</Label>
            <select id="doc-category" className={selectCls} value={category} onChange={(e) => setCategory(e.target.value as DocCategory)}>
              <option value="">Pilih kategori</option>{docCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">Judul dokumen</Label>
            <Input id="doc-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-desc">Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span></Label>
            <Textarea id="doc-desc" rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-product">Produk AI terkait</Label>
            <Input id="doc-product" value={productLabel} disabled />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit}>Tambahkan Dokumen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
