import { useEffect, useRef, useState } from "react";
import { MessageCircle, SendHorizonal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message, SessionStatusBadge } from "@/components/grazu/assistant";
import { assistantActions, guestDisclaimer, useAssistant } from "@/lib/assistant";

/** Public guest chat: shows only the visitor's own temporary conversation. */
export function GuestChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { conversations, guestId, pending } = useAssistant();
  const conv = conversations.find((c) => c.id === guestId);
  const busy = !!conv && pending === conv.id;
  const closed = conv?.status === "CLOSED";
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [conv?.messages.length, busy]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open, busy]);
  const send = () => { if (!draft.trim() || busy || closed) return; assistantActions.guestSend(draft); setDraft(""); };

  if (!open)
    return (
      <Button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-50 h-11 rounded-full px-5 shadow-lg">
        <MessageCircle size={16} /> Bantuan GRAZU AI
      </Button>
    );
  return (
    <section role="dialog" aria-label="GRAZU AI Assistant" className="fixed inset-x-3 bottom-3 z-50 flex h-[min(560px,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-lg border bg-card shadow-xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px]">
      <header className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">GRAZU AI Assistant</p>
          <p className="text-[11px] text-muted-foreground">Bantuan tata kelola dan layanan AI</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Tutup chat" onClick={() => setOpen(false)}><X size={16} /></Button>
      </header>
      {conv && <div className="border-b px-4 py-1.5"><SessionStatusBadge conversation={conv} /></div>}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {!conv ? (
          <p className="text-xs text-muted-foreground">Halo! Ajukan pertanyaan umum seputar tata kelola AI. Anda tidak perlu masuk atau memberikan data pribadi.</p>
        ) : conv.messages.map((m) => <Message key={m.id} msg={m} />)}
        {busy && <p className="text-xs text-muted-foreground" aria-live="polite">GRAZU - AI Bot sedang menyiapkan jawaban<span className="animate-pulse">…</span></p>}
        <div ref={endRef} />
      </div>
      <form className="border-t px-3 py-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <div className="flex items-end gap-2 rounded-md border bg-background p-2 focus-within:border-primary">
          <textarea ref={inputRef} rows={1} value={draft} aria-label="Tulis pesan" disabled={closed}
            placeholder={closed ? "Percakapan ditutup" : "Tulis pertanyaan…"}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground" />
          <Button type="submit" size="icon" aria-label="Kirim pesan" disabled={!draft.trim() || busy || closed}><SendHorizonal size={15} /></Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">{guestDisclaimer}</p>
      </form>
    </section>
  );
}
