import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUseCases } from "@/lib/use-cases";
import { openAiExample, responseFormats, saveEndpoint, validateEndpointConfig, type ApiType, type AuthType, type Endpoint, type Env } from "@/lib/red-teaming";

const sel = "mt-1.5 h-9 w-full rounded-md border bg-card px-3 text-sm";

export function EndpointForm({
  open,
  onOpenChange,
  editing,
  defaultProduct,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: Endpoint | undefined;
  defaultProduct?: string | undefined;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit Endpoint" : "Tambah Endpoint"}</SheetTitle>
          <SheetDescription>
            Konfigurasi hanya disimulasikan. Tidak ada koneksi atau permintaan ke endpoint ini.
          </SheetDescription>
        </SheetHeader>
        {open && (
          <Form key={editing?.id ?? "new"} editing={editing} defaultProduct={defaultProduct} onDone={() => onOpenChange(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function Form({ editing, defaultProduct, onDone }: { editing?: Endpoint | undefined; defaultProduct?: string | undefined; onDone: () => void }) {
  const products = useUseCases();
  const [f, setF] = useState({
    name: editing?.name ?? "",
    productId: editing?.productId ?? defaultProduct ?? "",
    url: editing?.url ?? "",
    method: editing?.method ?? ("POST" as const),
    authType: editing?.authType ?? ("None" as AuthType),
    apiType: editing?.apiType ?? ("Custom REST API" as ApiType),
    contentType: editing?.contentType ?? "application/json",
    bodyTemplate: editing?.bodyTemplate ?? '{\n  "message": "{{prompt}}"\n}',
    sessionField: editing?.sessionField ?? "",
    responsePath: editing?.responsePath ?? "$.reply",
    responseFormat: editing?.responseFormat ?? ("Teks" as Endpoint["responseFormat"]),
    errorPath: editing?.errorPath ?? "",
    env: editing?.env ?? ("Development" as Env),
  });
  // Credential lives only in this component state; it is never saved.
  const [credential, setCredential] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState(false);
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => { setValidated(false); setF({ ...f, [k]: e.target.value }); };
  const check = () => {
    const er = validateEndpointConfig({ ...f, credentialProvided: !!credential || (!!editing?.hasCredential && editing.authType === f.authType) });
    setErrors(er);
    return Object.keys(er).length === 0;
  };
  const applyExample = () => { setValidated(false); setF({ ...f, apiType: "OpenAI-Compatible", method: "POST", ...openAiExample }); };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!check()) return;
    saveEndpoint({
      ...f,
      id: editing?.id,
      hasCredential: f.authType !== "None" && (!!credential || (!!editing?.hasCredential && editing.authType === f.authType)),
    });
    setCredential("");
    onDone();
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-[11px] text-destructive">{errors[k]}</p> : null);
  const L = ({ t, htmlFor }: { t: string; htmlFor: string }) => <label htmlFor={htmlFor} className="text-xs font-medium">{t}</label>;
  const credPlaceholder = f.authType === "Bearer Token" ? "contoh: sk-xxxxxxxxxxxx" : "contoh: X-API-Key: xxxxxxxx";

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 px-4 pb-6" noValidate>
      <div><L t="Nama Endpoint" htmlFor="ep-name" /><Input id="ep-name" className="mt-1.5" value={f.name} onChange={up("name")} /><Err k="name" /></div>
      <div>
        <L t="Produk AI Terkait" htmlFor="ep-prod" />
        <select id="ep-prod" className={sel} value={f.productId} onChange={up("productId")}>
          <option value="">Pilih produk…</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
        </select>
        <Err k="productId" />
      </div>
      <div><L t="Endpoint URL" htmlFor="ep-url" /><Input id="ep-url" className="mt-1.5" placeholder="https://" value={f.url} onChange={up("url")} /><Err k="url" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><L t="HTTP Method" htmlFor="ep-m" /><select id="ep-m" className={sel} value={f.method} onChange={up("method")}><option>POST</option><option>GET</option></select></div>
        <div><L t="Environment" htmlFor="ep-env" /><select id="ep-env" className={sel} value={f.env} onChange={up("env")}><option>Development</option><option>Staging</option><option>Production</option></select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><L t="API Type" htmlFor="ep-api" /><select id="ep-api" className={sel} value={f.apiType} onChange={up("apiType")}><option>OpenAI-Compatible</option><option>Custom REST API</option></select></div>
        <div><L t="Autentikasi" htmlFor="ep-auth" /><select id="ep-auth" className={sel} value={f.authType} onChange={up("authType")}><option>None</option><option>Bearer Token</option><option>API Key Header</option></select></div>
      </div>
      {f.authType !== "None" && (
        <div>
          <L t="Kredensial (demo)" htmlFor="ep-cred" />
          <Input id="ep-cred" type="password" autoComplete="off" className="mt-1.5"
            placeholder={editing?.hasCredential && editing.authType === f.authType ? "•••••••• (terkonfigurasi, kosongkan untuk tetap)" : credPlaceholder}
            value={credential} onChange={(e) => { setValidated(false); setCredential(e.target.value); }} />
          <p className="mt-1 text-[11px] text-muted-foreground">Gunakan nilai contoh. Kredensial tidak disimpan dan dibuang setelah formulir ditutup.</p>
          <Err k="credential" />
        </div>
      )}

      <fieldset className="space-y-3 rounded-md border p-3">
        <div className="flex items-center justify-between gap-2">
          <legend className="text-xs font-semibold">Konfigurasi Request</legend>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-primary" onClick={applyExample}>Gunakan contoh OpenAI-Compatible</Button>
        </div>
        <div><L t="Content-Type" htmlFor="ep-ct" /><Input id="ep-ct" className="mt-1.5 font-mono text-xs" value={f.contentType} onChange={up("contentType")} /><Err k="contentType" /></div>
        <div>
          <L t="Request JSON Template" htmlFor="ep-body" />
          <Textarea id="ep-body" rows={6} className="mt-1.5 font-mono text-xs" value={f.bodyTemplate} onChange={up("bodyTemplate")} />
          <p className="mt-1 text-[11px] text-muted-foreground">Gunakan placeholder {"{{prompt}}"} untuk menyisipkan prompt uji.</p>
          <Err k="bodyTemplate" />
        </div>
        <div><L t="Field Session ID (opsional)" htmlFor="ep-sess" /><Input id="ep-sess" className="mt-1.5 font-mono text-xs" placeholder="contoh: session_id" value={f.sessionField} onChange={up("sessionField")} /></div>
      </fieldset>

      <fieldset className="space-y-3 rounded-md border p-3">
        <legend className="px-1 text-xs font-semibold">Konfigurasi Response</legend>
        <div><L t="Response JSON Path" htmlFor="ep-path" /><Input id="ep-path" className="mt-1.5 font-mono text-xs" value={f.responsePath} onChange={up("responsePath")} /><Err k="responsePath" /></div>
        <div><L t="Format Response yang Diharapkan" htmlFor="ep-fmt" /><select id="ep-fmt" className={sel} value={f.responseFormat} onChange={up("responseFormat")}>{responseFormats.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><L t="Path Response Error (opsional)" htmlFor="ep-err" /><Input id="ep-err" className="mt-1.5 font-mono text-xs" placeholder="$.error.message" value={f.errorPath} onChange={up("errorPath")} /><Err k="errorPath" /></div>
      </fieldset>

      {validated && <p role="status" className="rounded-md border border-primary/30 bg-accent px-3 py-2 text-xs text-primary">Validasi struktur berhasil. Konektivitas endpoint belum diuji.</p>}
      <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={() => setValidated(check())}>Validasi Konfigurasi (Demo)</Button>
        <Button type="button" variant="outline" onClick={onDone}>Batal</Button>
        <Button type="submit">{editing ? "Simpan Perubahan" : "Tambah Endpoint"}</Button>
      </div>
    </form>
  );
}
