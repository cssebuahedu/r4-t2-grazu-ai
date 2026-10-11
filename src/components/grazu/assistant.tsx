import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pencil, Plus, SendHorizonal, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { accessibleProducts, assistantActions, closedNotice, demoParticipant, conversationGroup, demoLabel, formatTime, senderLabel, sessionStatus, suggestedQuestions, useAssistant, type AssistantContext, type ChatMsg, type Conversation } from "@/lib/assistant";
import { demoRoles, useDemoRole } from "@/lib/demo-roles";
import { useUseCases } from "@/lib/use-cases";
import { findings, useRepos } from "@/lib/devsecops";
import { assessmentStatus, controls, useCompliance } from "@/lib/compliance";

export function useAssistantContext(): AssistantContext {
  const { productId } = useAssistant();
  const list = useUseCases();
  const repos = useRepos();
  const { assessments } = useCompliance();
  const product = list.find((u) => u.id === productId);
  return useMemo(() => {
    if (!product) return { product: undefined, findings: [] };
    const repoIds = repos.filter((r) => r.productId === product.id && r.org === product.org).map((r) => r.id);
    const a = assessments.find((x) => x.productId === product.id);
    const name = (id: string) => `${id} — ${controls.find((c) => c.id === id)?.name ?? id}`;
    return {
      product,
      findings: findings.filter((f) => repoIds.includes(f.repoId)),
      ...(a && assessmentStatus(a) !== "Belum Dinilai"
        ? { assessment: { status: assessmentStatus(a), failing: a.results.filter((r) => r.status === "Tidak Terpenuhi").map((r) => name(r.controlId)), review: a.results.filter((r) => r.status === "Perlu Ditinjau").map((r) => name(r.controlId)) } }
        : {}),
    };
  }, [product, repos, assessments]);
}

export function ProductSwitcher({ id = "assistant-product" }: { id?: string }) {
  const { productId, activeId, conversations } = useAssistant();
  const { role } = useDemoRole();
  const list = accessibleProducts(useUseCases(), role);
  const [pendingProduct, setPendingProduct] = useState<string | null | undefined>(undefined);
  const active = conversations.find((c) => c.id === activeId);
  const choose = (value: string) => {
    const next = value || null;
    if (next === productId) return;
    // Changing context of an existing session requires explicit confirmation.
    if (active && active.messages.length > 0) setPendingProduct(next);
    else assistantActions.setProduct(next);
  };
  return (
    <>
      <select id={id} aria-label="Produk AI aktif" value={productId ?? ""} onChange={(e) => choose(e.target.value)} className="h-9 w-full min-w-0 rounded-md border bg-card px-2 text-xs">
        <option value="">Pilih use case</option>
        {list.map((u) => <option key={u.id} value={u.id}>{u.id} · {u.name}</option>)}
      </select>
      <AlertDialog open={pendingProduct !== undefined} onOpenChange={(o) => !o && setPendingProduct(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah konteks use case?</AlertDialogTitle>
            <AlertDialogDescription>Percakapan "{active?.title}" akan menggunakan {list.find((u) => u.id === pendingProduct)?.name ?? "tanpa use case"} untuk pesan berikutnya. Riwayat pesan tetap dipertahankan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingProduct !== undefined) assistantActions.setProduct(pendingProduct); setPendingProduct(undefined); }}>Ubah</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Session picker shared by the drawer; selection is the same store state as the full page. */
export function SessionSelector({ id = "drawer-session" }: { id?: string }) {
  const { conversations, activeId } = useAssistant();
  const mine = conversations.filter((c) => c.participantId === demoParticipant.id);
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] text-muted-foreground">Pilih sesi chat</label>
      <select id={id} value={activeId ?? ""} onChange={(e) => (e.target.value ? assistantActions.select(e.target.value) : assistantActions.newConversation())} className="h-9 w-full min-w-0 rounded-md border bg-card px-2 text-xs">
        <option value="">Percakapan Baru</option>
        {mine.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
    </div>
  );
}

export function ContextPanel() {
  const { role } = useDemoRole();
  const ctx = useAssistantContext();
  const p = ctx.product;
  const open = ctx.findings.filter((f) => f.status !== "Diperbaiki").length;
  const rows: [string, string][] = [
    ["Organisasi aktif", p?.org ?? "—"], ["Peran pengguna", demoRoles[role].label], ["Sektor", p?.sector ?? "—"],
    ["Risiko awal", p?.risk ?? "—"], ["Temuan keamanan terbuka", String(open)],
    ["Status assessment", ctx.assessment?.status ?? "Belum ada assessment"],
  ];
  return (
    <div className="space-y-4 text-xs">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Konteks Akun Demo</p>
      <div><label htmlFor="ctx-product" className="mb-1.5 block text-muted-foreground">Produk AI terpilih</label><ProductSwitcher id="ctx-product" /></div>
      <dl className="space-y-3">
        {rows.map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>)}
      </dl>
    </div>
  );
}

function MessageBody({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split("\n\n").map((block, i) => {
        const lines = block.split("\n");
        const items = lines.filter((l) => l.startsWith("- "));
        const head = lines.filter((l) => !l.startsWith("- "));
        return (
          <div key={i}>
            {head.map((h, j) => <p key={j}>{h}</p>)}
            {items.length > 0 && <ul className="mt-1 list-disc space-y-0.5 pl-5">{items.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>}
          </div>
        );
      })}
    </div>
  );
}

export function Message({ msg, view = "client" }: { msg: ChatMsg; view?: "client" | "cs" }) {
  const [copied, setCopied] = useState(false);
  const label = senderLabel(msg, view);
  const time = formatTime(msg.timestamp);
  if (msg.senderType === "system")
    return <p role="note" className="mx-auto max-w-md rounded border bg-muted px-3 py-1.5 text-center text-[11px] text-muted-foreground">{msg.content}</p>;
  if (msg.senderType === "client" || msg.senderType === "guest")
    return (
      <div className="flex flex-col items-end">
        <span className="mb-1 text-[11px] font-semibold text-muted-foreground">{label}</span>
        <div className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">{msg.content}</div>
        <span className="mt-1 text-[10px] text-muted-foreground">{time}</span>
      </div>
    );
  const isCs = msg.senderType === "cs";
  return (
    <div className={`max-w-[92%] text-sm leading-6 ${isCs ? "border-l-2 border-primary pl-3" : ""}`}>
      <p className={`mb-1 text-[11px] font-semibold ${isCs ? "text-foreground" : "text-primary"}`}>{label}</p>
      <MessageBody text={msg.content} />
      {msg.refs && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {msg.refs.map((r) => <span key={r} className="rounded border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">{r}</span>)}
        </div>
      )}
      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{time}</span>
        <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => { void navigator.clipboard?.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Disalin" : "Salin"}
        </button>
      </div>
    </div>
  );
}

export function SessionStatusBadge({ conversation }: { conversation: Conversation | undefined }) {
  const status = conversation?.status ?? "AI_ACTIVE";
  const tone = status === "HUMAN_ACTIVE" ? "border-primary/30 bg-accent text-primary" : status === "CLOSED" ? "bg-muted text-muted-foreground" : "bg-background text-foreground";
  return (
    <span aria-live="polite" className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      <span className={`size-1.5 rounded-full ${status === "CLOSED" ? "bg-muted-foreground" : "bg-primary"}`} aria-hidden />
      {sessionStatus(conversation)}
    </span>
  );
}

export function ChatArea({ compact = false }: { compact?: boolean }) {
  const { conversations, activeId, pending } = useAssistant();
  const ctx = useAssistantContext();
  const conv = conversations.find((c) => c.id === activeId);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = pending !== null;
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [conv?.messages.length, pending]);
  useEffect(() => { inputRef.current?.focus(); }, [activeId, busy]);
  const closed = conv?.status === "CLOSED";
  const send = (t: string) => { if (!t.trim() || busy || closed) return; assistantActions.send(t, ctx); setDraft(""); };
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2 md:px-6">
        <p className="min-w-0 truncate text-xs font-medium">{conv?.title ?? "Percakapan Baru"}</p>
        <SessionStatusBadge conversation={conv} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
        {!conv || conv.messages.length === 0 ? (
          <div className="mx-auto max-w-xl py-6">
            <p className="text-sm font-semibold">Mulai percakapan baru</p>
            <p className="mt-1 text-xs text-muted-foreground">Pilih pertanyaan contoh atau tulis pertanyaan Anda {ctx.product ? ` tentang ${ctx.product.name}` : ""}. Memilih use case bersifat opsional.</p>
            <ul className="mt-4 divide-y border-y">
              {suggestedQuestions.map((q) => (
                <li key={q}><button type="button" disabled={busy} onClick={() => send(q)} className="w-full py-2.5 text-left text-sm text-primary hover:underline">{q}</button></li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={`mx-auto space-y-5 ${compact ? "" : "max-w-3xl"}`}>
            {conv.messages.map((m) => <Message key={m.id} msg={m} />)}
            {pending === conv.id && <p className="text-xs text-muted-foreground" aria-live="polite">GRAZU - AI Bot sedang menyiapkan jawaban<span className="animate-pulse">…</span></p>}
          </div>
        )}
        <div ref={endRef} />
      </div>
      {closed && <p role="status" className="shrink-0 border-t bg-muted px-4 py-2 text-center text-xs text-muted-foreground md:px-6">{closedNotice}</p>}
      <form className="shrink-0 border-t bg-card px-3 py-3 md:px-6" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
        <div className={`mx-auto flex items-end gap-2 rounded-md border bg-background p-2 focus-within:border-primary ${compact ? "" : "max-w-3xl"}`}>
          <textarea
            ref={inputRef} value={draft} rows={compact ? 1 : 2} aria-label="Tulis pesan"
            disabled={closed} placeholder={closed ? "Percakapan ditutup" : "Tulis pertanyaan…"}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="icon" aria-label="Kirim pesan" disabled={!draft.trim() || busy || closed}><SendHorizonal size={15} /></Button>
        </div>
        <p className="mx-auto mt-1.5 max-w-3xl text-[10px] text-muted-foreground">{demoLabel}</p>
      </form>
    </div>
  );
}

export function ConversationList({ onPick }: { onPick?: () => void }) {
  const { conversations, activeId } = useAssistant();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const mine = conversations.filter((c) => c.participantId === demoParticipant.id);
  const shown = mine.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 border-b p-3">
        <Button className="w-full justify-start" onClick={() => { assistantActions.newConversation(); onPick?.(); }}><Plus size={15} /> Percakapan Baru</Button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari percakapan…" aria-label="Cari percakapan" className="h-9 w-full rounded-md border bg-background px-3 text-xs outline-none focus:border-primary" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {shown.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">{mine.length ? "Tidak ada percakapan yang cocok." : "Belum ada percakapan."}</p>}
        {(["Hari Ini", "Kemarin", "Sebelumnya"] as const).map((g) => {
          const items = shown.filter((c) => conversationGroup(c) === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-3">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</p>
              {items.map((c) => (
                <div key={c.id} className={`group flex items-center gap-1 rounded-md px-2 ${c.id === activeId ? "bg-accent" : "hover:bg-muted"}`}>
                  {editing === c.id ? (
                    <form className="flex flex-1 items-center gap-1 py-1" onSubmit={(e) => { e.preventDefault(); if (title.trim()) assistantActions.rename(c.id, title.trim()); setEditing(null); }}>
                      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Nama percakapan" className="h-7 min-w-0 flex-1 rounded border bg-card px-2 text-xs" />
                      <button type="submit" aria-label="Simpan nama" className="p-1"><Check size={13} /></button>
                      <button type="button" aria-label="Batal" className="p-1" onClick={() => setEditing(null)}><X size={13} /></button>
                    </form>
                  ) : (
                    <>
                      <button type="button" className="min-w-0 flex-1 truncate py-2 text-left text-xs" onClick={() => { assistantActions.select(c.id); onPick?.(); }}>{c.title}</button>
                      <button type="button" aria-label={`Ubah nama ${c.title}`} className="p-1 text-muted-foreground hover:text-foreground" onClick={() => { setEditing(c.id); setTitle(c.title); }}><Pencil size={12} /></button>
                      <button type="button" aria-label={`Hapus ${c.title}`} className="p-1 text-muted-foreground hover:text-destructive" onClick={() => assistantActions.remove(c.id)}><Trash2 size={12} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
