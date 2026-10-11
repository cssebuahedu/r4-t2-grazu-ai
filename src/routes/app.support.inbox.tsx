import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Message, SessionStatusBadge } from "@/components/grazu/assistant";
import { assistantActions, availabilityOptions, closedNotice, demoCs, type CsAvailability, demoParticipant, formatTime, priorities, sessionStatus, useAssistant, type Conversation, type ConversationPriority } from "@/lib/assistant";
import { findings, useRepos } from "@/lib/devsecops";
import { useUseCases } from "@/lib/use-cases";
import { pageHead } from "@/lib/grazu-navigation";

export const Route = createFileRoute("/app/support/inbox")({
  head: () => pageHead("Layanan Pelanggan", "Kelola percakapan pengguna dan bantuan langsung oleh Customer Service."),
  validateSearch: (s: Record<string, unknown>): { c?: string } => (typeof s["c"] === "string" ? { c: s["c"] } : {}),
  component: SupportInbox,
});

const filters = [
  { id: "all", label: "Semua" },
  { id: "AI_ACTIVE", label: "Ditangani AI" },
  { id: "HUMAN_ACTIVE", label: "Ditangani CS" },
  { id: "CLOSED", label: "Ditutup" },
] as const;
type FilterId = (typeof filters)[number]["id"];

const participantName = (c: Conversation) =>
  c.participantType === "guest" ? `Tamu ${c.participantId}` : c.participantId === demoParticipant.id ? demoParticipant.name : c.participantId;

function SupportInbox() {
  const { conversations, notifications, actingCsId: actingCs, availability } = useAssistant();
  const { c: linked } = Route.useSearch();
  const products = useUseCases();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"take" | "end" | "close" | "reassign" | null>(null);
  const [csFilter, setCsFilter] = useState("all");
  const [notice, setNotice] = useState("");
  useEffect(() => { if (linked) { setSelectedId(linked); assistantActions.markRead(linked); } }, [linked]);
  useEffect(() => setNotice(""), [selectedId]);
  const [pendingCs, setPendingCs] = useState("");
  const repos = useRepos();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const unread = new Set(notifications.filter((n) => !n.read).map((n) => n.conversationId));
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...conversations]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((c) => filter === "all" || c.status === filter)
      .filter((c) => csFilter === "all" || (csFilter === "none" ? !c.assignedCsId : c.assignedCsId === csFilter))
      .filter((c) => !q || `${c.title} ${participantName(c)} ${c.messages.at(-1)?.content ?? ""}`.toLowerCase().includes(q));
  }, [conversations, filter, query, csFilter]);
  const selected = conversations.find((c) => c.id === selectedId);
  const isGuest = selected?.participantType === "guest";
  const product = isGuest ? undefined : products.find((p) => p.id === selected?.productId);
  const actingName = demoCs.find((c) => c.id === actingCs)?.name ?? "";
  const assignedName = demoCs.find((c) => c.id === selected?.assignedCsId)?.name;
  const isAssignedToMe = selected?.status === "HUMAN_ACTIVE" && selected.assignedCsId === actingCs;
  const canTake = selected?.status === "AI_ACTIVE" && selected.assignedCsId === actingCs;
  const productRepoIds = repos.filter((r) => r.productId === product?.id).map((r) => r.id);
  const openFindings = product ? findings.filter((f) => productRepoIds.includes(f.repoId) && f.status !== "Diperbaiki") : [];
  const onAssign = (csId: string) => {
    if (!selected || !csId || csId === selected.assignedCsId) return;
    if (selected.assignedCsId) { setPendingCs(csId); setConfirm("reassign"); } else doAssign(csId);
  };

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [selected?.messages.length]);

  const open = (id: string) => { setSelectedId(id); assistantActions.markRead(id); };
  const doAssign = (csId: string) => {
    if (!selected) return;
    const ok = assistantActions.assign(selected.id, csId);
    const name = demoCs.find((c) => c.id === csId)?.name;
    setNotice(ok ? `Percakapan ditugaskan kepada ${name}. Notifikasi demo dikirim.` : `${name} tidak tersedia untuk penugasan baru.`);
  };
  const sendCs = () => { if (!selected) return; assistantActions.csSend(selected.id, draft, actingCs); setDraft(""); };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Layanan Pelanggan</h1>
        <p className="text-sm text-muted-foreground">Pantau percakapan AI Bot dan ambil alih bila pengguna membutuhkan bantuan CS. Mode demo — data simulasi.</p>
        <label className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          Bertindak sebagai (demo)
          <select className={sel} value={actingCs} onChange={(e) => assistantActions.setActingCs(e.target.value)}>
            {demoCs.map((c) => <option key={c.id} value={c.id}>CS {c.name}</option>)}
          </select>
          Ketersediaan
          <select className={sel} aria-label="Ketersediaan CS" value={availability[actingCs] ?? "Tersedia"} onChange={(e) => assistantActions.setAvailability(actingCs, e.target.value as CsAvailability)}>
            {availabilityOptions.map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {demoCs.map((c) => { const a = availability[c.id] ?? "Tersedia"; return (
            <span key={c.id} className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${a === "Tersedia" ? "bg-primary" : a === "Sibuk" ? "bg-warning" : "bg-muted-foreground"}`} />{c.name} · {a}</span>
          ); })}
        </p>
      </div>
      <div className="grid min-h-[560px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <section className={`flex min-w-0 flex-col rounded-lg border bg-card ${selected ? "hidden lg:flex" : ""}`}>
          <div className="space-y-3 border-b p-3">
            <Input placeholder="Cari nama, judul, atau pesan…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Cari percakapan" />
            <div className="flex flex-wrap gap-1.5" role="tablist">
              {filters.map((f) => (
                <Button key={f.id} role="tab" aria-selected={filter === f.id} size="sm" variant={filter === f.id ? "default" : "outline"} className="h-7 text-xs" onClick={() => setFilter(f.id)}>
                  {f.label}
                </Button>
              ))}
            </div>
            <select className={`${sel} w-full`} value={csFilter} onChange={(e) => setCsFilter(e.target.value)} aria-label="Filter CS ditugaskan">
              <option value="all">Semua CS</option>
              <option value="none">Belum ditugaskan</option>
              {demoCs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <ul className="flex-1 divide-y overflow-y-auto">
            {list.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">Tidak ada percakapan.</li>}
            {list.map((c) => {
              const last = c.messages.at(-1);
              const isNew = unread.has(c.id);
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => open(c.id)} className={`w-full px-3 py-2.5 text-left hover:bg-muted ${selectedId === c.id ? "bg-accent" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${isNew ? "font-semibold" : "font-medium"}`}>{participantName(c)}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(c.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs text-foreground">{c.title}</p>
                      {isNew && <span className="shrink-0 rounded bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">Baru</span>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{last?.content}</p>
                    <p className="mt-1 flex flex-wrap gap-x-2 text-[10px]">
                      <span className="text-primary">{sessionStatus(c)}</span>
                      {(c.priority ?? "Normal") !== "Normal" && <span className={c.priority === "Mendesak" ? "text-destructive" : "text-warning"}>{c.priority}</span>}
                      {c.assignedCsId && <span className="text-muted-foreground">Ditugaskan: {demoCs.find((x) => x.id === c.assignedCsId)?.name}</span>}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={`min-w-0 flex-col rounded-lg border bg-card ${selected ? "flex" : "hidden lg:flex"}`}>
          {!selected ? (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">Pilih percakapan untuk melihat detail.</div>
          ) : (
            <>
              <header className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
                <div className="min-w-0 space-y-1">
                  <button type="button" className="text-xs text-muted-foreground hover:text-primary lg:hidden" onClick={() => setSelectedId(null)}>← Daftar percakapan</button>
                  <h2 className="truncate font-semibold">{selected.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {participantName(selected)} · {selected.participantType === "guest" ? "Tamu" : "Klien terdaftar"}
                    {product ? ` · Produk: ${product.name}` : ""}
                  </p>
                  <SessionStatusBadge conversation={selected} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.status === "AI_ACTIVE" && <Button size="sm" disabled={!canTake} title={canTake ? undefined : "Tugaskan percakapan ke CS yang sedang Anda perankan terlebih dahulu."} onClick={() => setConfirm("take")}>Ambil Alih Percakapan</Button>}
                  {isAssignedToMe && <Button size="sm" variant="outline" onClick={() => setConfirm("end")}>Akhiri Bantuan CS</Button>}
                  {selected.status !== "CLOSED" && <Button size="sm" variant="outline" className="text-destructive" onClick={() => setConfirm("close")}>Tutup Percakapan</Button>}
                </div>
              </header>
              {selected.status !== "CLOSED" && (
                <div className="flex flex-wrap items-center gap-3 border-b px-4 py-2 text-xs">
                  <label className="flex items-center gap-2">Assign CS
                    <select className={sel} value={selected.assignedCsId ?? ""} onChange={(e) => onAssign(e.target.value)}>
                      <option value="" disabled>Pilih CS</option>
                      {demoCs.map((c) => { const a = availability[c.id] ?? "Tersedia"; const current = c.id === selected.assignedCsId; return (
                        <option key={c.id} value={c.id} disabled={!current && a !== "Tersedia"}>{c.name}{a !== "Tersedia" ? ` (${a})` : ""}</option>
                      ); })}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">Prioritas
                    <select className={sel} value={selected.priority ?? "Normal"} onChange={(e) => assistantActions.setPriority(selected.id, e.target.value as ConversationPriority)}>
                      {priorities.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </label>
                  {notice && <span role="status" className="text-primary">{notice}</span>}
                  {selected.status === "AI_ACTIVE" && !canTake && <span className="text-muted-foreground">{selected.assignedCsId ? `Ditugaskan ke ${assignedName}; perankan CS tersebut untuk mengambil alih.` : "Tugaskan CS sebelum mengambil alih."}</span>}
                </div>
              )}
              <div className="max-h-[460px] flex-1 space-y-4 overflow-y-auto p-4">
                {selected.messages.map((m) => <Message key={m.id} msg={m} view="cs" />)}
                <div ref={endRef} />
              </div>
              <footer className="border-t p-3">
                {isAssignedToMe ? (
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendCs(); }}>
                    <Textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Balas sebagai GRAZU - CS ${actingName}`} aria-label="Balasan CS"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendCs(); } }} />
                    <Button type="submit" disabled={!draft.trim()}>Kirim</Button>
                  </form>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {selected.status === "CLOSED" ? closedNotice
                      : selected.status === "AI_ACTIVE" ? "Percakapan ditangani AI Bot. Ambil alih untuk membalas sebagai CS."
                      : "Percakapan ditangani CS lain. Hanya CS yang ditugaskan dapat membalas."}
                  </p>
                )}
              </footer>
            </>
          )}
        </section>
        {selected && (
          <aside className="min-w-0 rounded-lg border bg-card p-4 text-xs lg:col-span-2 xl:col-span-1">
            <h3 className="mb-3 text-sm font-semibold">Konteks Klien</h3>
            <dl className="space-y-2.5">
              <Ctx k={isGuest ? "ID Tamu" : "Nama klien"} v={participantName(selected)} />
              {isGuest ? (
                <p className="text-muted-foreground">Data organisasi dan produk tidak ditampilkan untuk pengunjung tamu.</p>
              ) : (
                <>
                  <Ctx k="Organisasi" v={product?.org ?? "—"} />
                  <Ctx k="Produk AI terkait" v={product ? `${product.id} · ${product.name}` : "Belum dipilih"} />
                  <Ctx k="Kategori risiko awal" v={product ? `${product.risk} (simulasi)` : "—"} />
                  <Ctx k="Temuan keamanan terbuka" v={product ? `${openFindings.length} temuan (simulasi)` : "—"} />
                </>
              )}
              <Ctx k="Status percakapan" v={sessionStatus(selected)} />
              <Ctx k="CS ditugaskan" v={assignedName ?? "Belum ditugaskan"} />
              <Ctx k="Prioritas antrean" v={selected.priority ?? "Normal"} />
            </dl>
            <p className="mt-4 text-[11px] text-muted-foreground">Prioritas hanya untuk pengaturan antrean, bukan klasifikasi risiko regulasi.</p>
          </aside>
        )}
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{{ take: "Ambil alih percakapan?", end: "Akhiri bantuan CS?", close: "Tutup percakapan?", reassign: "Tugaskan ulang percakapan?" }[confirm ?? "take"]}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "take" ? `Balasan otomatis AI Bot akan dihentikan dan percakapan ditangani oleh CS ${assignedName ?? actingName}.`
                : confirm === "end" ? "Percakapan akan kembali ditangani GRAZU - AI Bot untuk pesan klien berikutnya. Riwayat tetap tersimpan."
                : confirm === "close" ? "Percakapan akan ditutup dan tidak dapat menerima pesan baru."
                : `Penugasan berpindah dari ${assignedName ?? "-"} ke ${demoCs.find((c) => c.id === pendingCs)?.name ?? "-"}.${selected?.status === "HUMAN_ACTIVE" ? " CS baru akan menangani sesi aktif ini." : ""}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!selected) return;
              if (confirm === "take") assistantActions.takeOver(selected.id, selected.assignedCsId);
              else if (confirm === "end") assistantActions.endCs(selected.id, actingCs);
              else if (confirm === "close") assistantActions.close(selected.id);
              else doAssign(pendingCs);
              setConfirm(null);
            }}>Konfirmasi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const sel = "h-8 rounded-md border bg-background px-2 text-xs";
function Ctx({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-muted-foreground">{k}</dt><dd className="mt-0.5 break-words font-medium">{v}</dd></div>;
}
