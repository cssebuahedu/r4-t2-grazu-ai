import { useSyncExternalStore } from "react";
import type { UseCase } from "./use-cases";
import type { Finding } from "./devsecops";

export const demoLabel = "MODE DEMO — Respons chatbot merupakan simulasi.";
export const unsupportedReply =
  "Pertanyaan ini belum didukung dalam mode demonstrasi. Kemampuan konsultasi lebih lanjut akan tersedia setelah integrasi AI.";
export const noAssessmentReply = "Belum ada hasil assessment untuk produk ini.";

export const suggestedQuestions = [
  "Apa saja sembilan nilai etika AI di Indonesia?",
  "Jelaskan hasil penilaian risiko produk AI saya.",
  "Bagaimana cara mengatasi prompt injection?",
  "Apa arti temuan keamanan pada repository saya?",
  "Apa saja kontrol kepatuhan yang perlu diperbaiki?",
  "Bagaimana cara mendaftarkan use case AI?",
];

export type SenderType = "client" | "guest" | "ai" | "cs" | "system";
export type ConversationStatus = "AI_ACTIVE" | "HUMAN_ACTIVE" | "CLOSED";
export type ConversationPriority = "Normal" | "Tinggi" | "Mendesak";
export const priorities: ConversationPriority[] = ["Normal", "Tinggi", "Mendesak"];
export interface ChatMsg {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  refs?: string[];
}
export interface Conversation {
  id: string;
  title: string;
  participantId: string;
  participantType: "guest" | "client";
  productId?: string | null;
  status: ConversationStatus;
  /** Queue assignment only; does not by itself activate human handling. */
  assignedCsId?: string | undefined;
  priority?: ConversationPriority;
  messages: ChatMsg[];
  createdAt: string;
  updatedAt: string;
  /** Simulated lifecycle events (demo activity timeline). */
  events?: LifecycleEvent[];
}

export const demoCs = [
  { id: "cs-ayulia", name: "Ayulia Ningsih" },
  { id: "cs-rina", name: "Rina Pratama" },
  { id: "cs-dimas", name: "Dimas Setiawan" },
] as const;
export const demoParticipant = { id: "client-demo", name: "Anisa Putri" };

export function conversationTitle(content: string): string {
  return content.trim().split(/\s+/).filter(Boolean).slice(0, 6).join(" ") || "Percakapan Baru";
}

export function senderLabel(message: ChatMsg, view: "client" | "cs" = "client"): string {
  if (message.senderType === "ai") return "GRAZU - AI Bot";
  if (message.senderType === "cs") return `GRAZU - CS ${message.senderName}`;
  if (message.senderType === "system") return "Sistem";
  return view === "client" ? "Anda" : message.senderName;
}

export function sessionStatus(conversation: Conversation | undefined): string {
  if (conversation?.status === "CLOSED") return "Percakapan Ditutup";
  if (conversation?.status === "HUMAN_ACTIVE") {
    const cs = demoCs.find((person) => person.id === conversation.assignedCsId);
    return `Ditangani CS — ${cs?.name ?? "Petugas Layanan"}`;
  }
  return "Ditangani AI Bot";
}

export function conversationGroup(conversation: Conversation, now = new Date()): "Hari Ini" | "Kemarin" | "Sebelumnya" {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const created = new Date(conversation.createdAt);
  const day = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return day >= today ? "Hari Ini" : day >= yesterday ? "Kemarin" : "Sebelumnya";
}

export const noProductReply = "Pilih use case terlebih dahulu agar GRAZU - AI Bot dapat menjawab berdasarkan data produk tersebut.";
/** Demo organization of the signed-in client; clients only see its products. */
export const demoClientOrg = "Kementerian Pelayanan Publik";
export function accessibleProducts<T extends { org: string }>(list: T[], role: string): T[] {
  return role === "client" ? list.filter((u) => u.org === demoClientOrg) : list;
}

export interface AssistantContext {
  product?: UseCase | undefined;
  findings: Finding[];
  assessment?: { status: string; failing: string[]; review: string[] };
}

type Topic = "ethics" | "risk" | "redteam" | "devsecops" | "compliance" | "registration";
const keywords: [Topic, RegExp][] = [
  ["redteam", /prompt injection|injeksi|red team|kebocoran prompt|system prompt|jailbreak/i],
  ["devsecops", /repository|repositori|secret|sast|sca|ci\/cd|pipeline|kerentanan|temuan keamanan|devsecops/i],
  ["compliance", /kepatuhan|kontrol|compliance|bukti|evidence|verifikasi/i],
  ["registration", /daftar|registrasi|use case|usulan/i],
  ["risk", /risiko|risk|klasifikasi/i],
  ["ethics", /etika|nilai|prinsip|se menkominfo/i],
];

export function detectTopic(text: string): Topic | null {
  return keywords.find(([, re]) => re.test(text))?.[0] ?? null;
}

const bullets = (items: string[]) => items.map((x) => `- ${x}`).join("\n");

export function respond(text: string, ctx: AssistantContext): { text: string; refs: string[] } {
  const p = ctx.product;
  const open = ctx.findings.filter((f) => f.status !== "Diperbaiki");
  const topic = detectTopic(text);
  if (!p && (topic === "risk" || topic === "devsecops" || topic === "compliance")) return { refs: [], text: noProductReply };
  switch (topic) {
    case "ethics":
      return {
        refs: ["SE Menkominfo No. 9 Tahun 2023"],
        text: `Surat Edaran Menkominfo No. 9 Tahun 2023 tentang Etika Kecerdasan Artifisial memuat sembilan nilai etika:\n${bullets(["Inklusivitas", "Kemanusiaan", "Keamanan", "Aksesibilitas", "Transparansi", "Kredibilitas dan akuntabilitas", "Pelindungan data pribadi", "Pembangunan dan lingkungan berkelanjutan", "Kekayaan intelektual"])}\n\nSurat edaran ini bersifat pedoman etika, bukan peraturan yang mengikat dengan sanksi. ${p ? `Untuk ${p.name}, Anda` : "Anda"} dapat menilai penerapan setiap nilai melalui modul Checklist Etika.`,
      };
    case "risk":
      if (!p) return { refs: [], text: noProductReply };
      return {
        refs: ["Dokumen Assessment Produk (Simulasi)"],
        text: `Indikator risiko simulasi untuk ${p.name} (${p.org}):\n${bullets([`Klasifikasi risiko awal: ${p.risk}`, `Sektor: ${p.sector}`, `Memproses data pribadi: ${p.personalData}`, `Memproses data sensitif: ${p.sensitiveData}`, `Pengawasan manusia: ${p.humanOversight}`])}\n\nKlasifikasi ini merupakan hasil penilaian awal berbasis aturan demonstrasi. Klasifikasi awal bukan keputusan resmi regulator dan tetap memerlukan verifikasi oleh peninjau manusia.`,
      };
    case "redteam": {
      const pf = open.filter((f) => f.category === "AI Prompt Security");
      const local = !p ? "" : pf.length
        ? `\n\nTemuan simulasi pada produk ini:\n${bullets(pf.map((f) => `${f.id} — ${f.title} (${f.severity}): ${f.description}`))}`
        : `\n\nTidak ada temuan prompt injection simulasi yang terbuka untuk ${p.name}.`;
      return {
        refs: pf.length ? ["Hasil Red Teaming (Simulasi)", "Laporan DevSecOps (Simulasi)"] : ["Hasil Red Teaming (Simulasi)"],
        text: `Prompt injection adalah upaya memasukkan instruksi berbahaya melalui input pengguna agar model mengabaikan instruksi sistem. Risiko terkait adalah kebocoran system prompt, yaitu model membocorkan instruksi internal atau konfigurasi.\n\nMitigasi teknis umum:\n${bullets(["Pisahkan instruksi sistem dari input pengguna dengan pembatas yang jelas", "Validasi dan saring input serta keluaran model", "Terapkan prinsip hak akses minimum untuk alat yang dapat dipanggil model", "Jangan simpan rahasia atau kredensial di dalam prompt", "Lakukan pengujian red teaming secara berkala"])}${local}`,
      };
    }
    case "devsecops": {
      if (!p) return { refs: [], text: noProductReply };
      const local = ctx.findings.length
        ? `Temuan simulasi pada repository ${p.name}:\n${bullets(ctx.findings.map((f) => `${f.id} — ${f.title} · ${f.category} · ${f.severity} · ${f.status}`))}`
        : `Belum ada repository atau temuan simulasi yang terhubung dengan ${p.name}.`;
      return {
        refs: ["Laporan DevSecOps (Simulasi)"],
        text: `Kategori pemindaian keamanan yang digunakan:\n${bullets(["Secret scanning — mendeteksi kredensial yang tertanam di kode", "Vulnerability scanning — memeriksa kerentanan pada dependensi dan kontainer", "SAST — analisis statis kode sumber untuk pola tidak aman", "SCA — analisis komponen pihak ketiga dan lisensinya", "CI/CD security — pemeriksaan otomatis pada setiap pipeline"])}\n\n${local}`,
      };
    }
    case "compliance": {
      if (!ctx.assessment) return { refs: [], text: noAssessmentReply };
      const a = ctx.assessment;
      return {
        refs: ["Dokumen Assessment Produk (Simulasi)", "UU No. 27 Tahun 2022"],
        text: `Status assessment kepatuhan ${p?.name ?? "produk"}: ${a.status}.\n\n${a.failing.length ? `Kontrol yang tidak terpenuhi:\n${bullets(a.failing)}` : "Tidak ada kontrol berstatus Tidak Terpenuhi."}${a.review.length ? `\n\nKontrol yang perlu ditinjau:\n${bullets(a.review)}` : ""}\n\nSetiap kontrol memerlukan bukti pendukung seperti dokumen kebijakan, hasil pengujian, atau laporan pemindaian. Hasil ini adalah simulasi dan wajib diverifikasi oleh peninjau manusia; bukan sertifikasi atau keputusan resmi.`,
      };
    }
    case "registration":
      return {
        refs: [],
        text: `Langkah pendaftaran use case AI di GRAZU-AI:\n${bullets(["Buka menu Registri Use Case lalu pilih Daftarkan Use Case", "Isi identitas produk, organisasi, sektor, dan lokasi", "Jelaskan tujuan, pengguna sasaran, jenis model, dan penyedia model", "Uraikan sumber data serta penggunaan data pribadi atau sensitif", "Jelaskan dampak, pengawasan manusia, mitigasi, dan kebijakan keamanan", "Kirim usulan untuk ditinjau"])}\n\nPendaftaran dalam mode demo hanya tersimpan sementara di peramban.`,
      };
    default:
      return { refs: [], text: unsupportedReply };
  }
}

// ---- shared local conversation store (page + drawer read the same state) ----
const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const at = (daysAgo: number, hhmm: string) => {
  const [h, min] = hhmm.split(".").map(Number);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h ?? 0, min ?? 0, 0, 0);
  return d.toISOString();
};
const aiSender = { senderType: "ai" as const, senderId: "grazu-ai", senderName: "AI Bot" };
const clientSender = { senderType: "client" as const, senderId: demoParticipant.id, senderName: demoParticipant.name };
const csSender = (id: string) => ({ senderType: "cs" as const, senderId: id, senderName: demoCs.find((c) => c.id === id)?.name ?? "Petugas Layanan" });
const systemSender = { senderType: "system" as const, senderId: "system", senderName: "Sistem" };
type Sender = Pick<ChatMsg, "senderType" | "senderId" | "senderName">;
const msg = (conversationId: string, sender: Sender, content: string, timestamp: string, refs?: string[]): ChatMsg => ({
  id: uid(), conversationId, ...sender, content, timestamp, ...(refs ? { refs } : {}),
});
export const csJoinedNotice = (name: string) => `CS ${name} telah bergabung dan akan membantu Anda. Balasan otomatis AI Bot dihentikan selama sesi ini.`;
export type LifecycleEventType = "created" | "assigned" | "takeover" | "cs_reply" | "handback" | "closed" | "reopened";
export interface LifecycleEvent { id: string; type: LifecycleEventType; at: string; by: string }
export const lifecycleLabels: Record<LifecycleEventType, string> = {
  created: "Percakapan dibuat", assigned: "CS ditugaskan", takeover: "Diambil alih CS", cs_reply: "Balasan CS", handback: "Kembali ke AI Bot", closed: "Percakapan ditutup", reopened: "Percakapan dibuka kembali",
};
export const reopenNotice = "Percakapan dibuka kembali dan kembali ditangani GRAZU - AI Bot.";
/** Timeline including a derived "created" event for seeded conversations. */
export function conversationEvents(c: Conversation): LifecycleEvent[] {
  const ev = c.events ?? [];
  return ev.some((e) => e.type === "created") ? ev : [{ id: `ev-created-${c.id}`, type: "created", at: c.createdAt, by: c.participantId }, ...ev];
}
let evSeq = 0;
const logEvent = (cid: string, type: LifecycleEventType, by: string) => set((s) => ({
  conversations: s.conversations.map((x) => (x.id === cid ? { ...x, events: [...(x.events ?? []), { id: `ev-${++evSeq}`, type, at: new Date().toISOString(), by }] } : x)),
}));
export const closedNotice = "Percakapan ini telah ditutup. Pesan baru tidak dapat dikirim.";

const conv = (id: string, title: string, daysAgo: number, time: string, rows: [Sender, string, string[]?][], extra: Partial<Conversation> = {}): Conversation => {
  const ts = at(daysAgo, time);
  return {
    id, title, participantId: demoParticipant.id, participantType: "client", productId: "UC-001", status: "AI_ACTIVE",
    messages: rows.map(([s, c, r]) => msg(id, s, c, ts, r)), createdAt: ts, updatedAt: ts, ...extra,
  };
};

const seed = (): Conversation[] => [
  conv("c1", "Nilai etika AI nasional", 0, "09.14", [
    [clientSender, suggestedQuestions[0]!],
    [aiSender, "Surat Edaran Menkominfo No. 9 Tahun 2023 memuat sembilan nilai etika: inklusivitas, kemanusiaan, keamanan, aksesibilitas, transparansi, kredibilitas dan akuntabilitas, pelindungan data pribadi, pembangunan dan lingkungan berkelanjutan, serta kekayaan intelektual.", ["SE Menkominfo No. 9 Tahun 2023"]],
  ]),
  conv("c2", "Mitigasi prompt injection", 0, "08.02", [
    [clientSender, "Bagaimana cara mengatasi prompt injection?"],
    [aiSender, "Pisahkan instruksi sistem dari input pengguna, validasi keluaran model, dan lakukan pengujian red teaming berkala.", ["Hasil Red Teaming (Simulasi)"]],
    [clientSender, "Saya ingin berdiskusi langsung dengan tim GRAZU soal temuan ini."],
    [systemSender, csJoinedNotice("Ayulia Ningsih")],
    [csSender("cs-ayulia"), "Halo Ibu Anisa, saya Ayulia dari tim GRAZU. Saya sudah melihat temuan prompt injection pada produk Anda. Boleh dijelaskan kapan temuan ini pertama kali muncul?"],
  ], { status: "HUMAN_ACTIVE", assignedCsId: "cs-ayulia" }),
  conv("c3", "Temuan secret scanning", 1, "16.40", [
    [clientSender, "Apa itu secret scanning?"],
    [aiSender, "Secret scanning mendeteksi kredensial seperti kunci API yang tertanam di kode sumber agar dapat dihapus dan dirotasi.", ["Laporan DevSecOps (Simulasi)"]],
  ]),
  conv("c4", "Kontrol pelindungan data", 4, "10.05", [
    [clientSender, "Bukti apa yang dibutuhkan untuk kontrol pelindungan data?"],
    [aiSender, "Contoh bukti: kebijakan privasi, catatan pemrosesan data, dan hasil penilaian dampak. Seluruh hasil simulasi wajib diverifikasi peninjau manusia.", ["UU No. 27 Tahun 2022"]],
    [systemSender, csJoinedNotice("Rina Pratama")],
    [csSender("cs-rina"), "Dokumen yang Ibu kirimkan sudah lengkap. Percakapan ini saya tutup, silakan hubungi kami kembali bila ada pertanyaan."],
  ], { status: "CLOSED", assignedCsId: "cs-rina" }),
  conv("c5", "Pendaftaran produk baru", 5, "13.22", [
    [clientSender, "Bagaimana cara mendaftarkan use case AI?"],
    [aiSender, "Buka Registri Use Case, pilih Daftarkan Use Case, lalu lengkapi identitas produk, data, dampak, dan pengawasan manusia."],
  ]),
];

export type NotificationType = "new" | "assigned" | "reply" | "handoff" | "handback" | "closed";
export const notificationLabels: Record<NotificationType, string> = {
  new: "Percakapan baru", assigned: "Penugasan", reply: "Balasan klien", handoff: "Diambil alih CS", handback: "Kembali ke AI", closed: "Percakapan ditutup",
};
/** Demo CS notifications; `targetCsId` limits visibility to that CS, otherwise visible to all CS staff. */
export interface CsNotification { id: string; conversationId: string; createdAt: string; read: boolean; type?: NotificationType; text?: string; targetCsId?: string | undefined }
export type CsAvailability = "Tersedia" | "Sibuk" | "Offline";
export const availabilityOptions: CsAvailability[] = ["Tersedia", "Sibuk", "Offline"];
interface State { guestId: string | null; guestCount: number; conversations: Conversation[]; activeId: string | null; productId: string | null; pending: string | null; notifications: CsNotification[]; generation: Record<string, number>; actingCsId: string; availability: Record<string, CsAvailability> }
/** Notifications relevant to a demo role; clients never see CS notifications. */
export function visibleNotifications(s: Pick<State, "notifications" | "actingCsId">, role: string): CsNotification[] {
  if (role === "client") return [];
  return s.notifications.filter((n) => !n.targetCsId || n.targetCsId === s.actingCsId);
}
let nSeq = 0;
const note = (conversationId: string, type: NotificationType, text: string, targetCsId?: string): CsNotification =>
  ({ id: `n-${type}-${conversationId}-${++nSeq}`, conversationId, createdAt: new Date().toISOString(), read: false, type, text, targetCsId });
const initial: State = {
  actingCsId: "cs-ayulia", availability: { "cs-ayulia": "Tersedia", "cs-rina": "Tersedia", "cs-dimas": "Sibuk" },
  guestId: null, guestCount: 0,
  conversations: seed(), activeId: null, productId: null, pending: null, generation: {},
  notifications: [
    { id: "n-c1", conversationId: "c1", createdAt: at(0, "09.14"), read: false, type: "new", text: "Anisa Putri memulai percakapan “Nilai etika AI nasional”." },
    { id: "n-c4-closed", conversationId: "c4", createdAt: at(4, "10.05"), read: true, type: "closed", text: "Percakapan “Kontrol pelindungan data” ditutup.", targetCsId: "cs-rina" },
  ],
};
/** The CS identity used when an admin/superadmin acts in the demo inbox. */
export const currentDemoCs = demoCs[0];
export const takeoverNotice = (name: string) => `Percakapan kini ditangani oleh CS ${name}.`;
export const returnToAiNotice = "Sesi bantuan CS selesai. Percakapan kembali ditangani GRAZU - AI Bot.";
export const getAssistantState = () => state;
export const resetAssistantState = () => { state = { ...initial, guestId: null, guestCount: 0, conversations: seed(), generation: {}, availability: { ...initial.availability } }; listeners.forEach((l) => l()); };
let state = initial;
const listeners = new Set<() => void>();
const set = (patch: Partial<State> | ((s: State) => Partial<State>)) => {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
};
export const useAssistant = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => state, () => initial);

export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const append = (cid: string, message: ChatMsg) => (s: State) => ({
  conversations: s.conversations.map((c) => (c.id === cid ? { ...c, messages: [...c.messages, message], updatedAt: message.timestamp } : c)),
});

export const guestDisclaimer = "Demo: percakapan tamu bersifat sementara, tidak disimpan, dan tidak memerlukan data pribadi.";
/** Deterministic scripted replies for public visitors — never uses product or organization data. */
export function guestRespond(text: string): string {
  const t = text.toLowerCase();
  if (/(daftar|akun|login|masuk)/.test(t)) return "Untuk mendaftarkan use case AI, instansi Anda perlu masuk ke platform GRAZU AI. Sebagai tamu, Anda dapat menjelajahi halaman publik terlebih dahulu.";
  if (/(etika|nilai|prinsip)/.test(t)) return "Tata kelola AI di Indonesia mengacu pada nilai etika seperti transparansi, akuntabilitas, keamanan, dan pelindungan data pribadi (SE Menkominfo No. 9 Tahun 2023).";
  if (/(risiko|risk|keamanan|aman)/.test(t)) return "GRAZU AI membantu instansi menilai risiko, menguji keamanan, dan memantau kepatuhan sistem AI secara terpadu.";
  if (/(cs|manusia|petugas|admin|bantuan)/.test(t)) return "Permintaan Anda telah dicatat. Petugas layanan GRAZU dapat bergabung ke percakapan ini.";
  return "Terima kasih. GRAZU AI Assistant dapat menjelaskan tata kelola AI, penilaian risiko, dan layanan platform. Silakan ajukan pertanyaan umum.";
}

export const assistantActions = {
  /** Public guest chat: creates a temporary in-memory conversation on the first message. */
  guestSend(text: string) {
    const t = text.trim();
    if (!t) return;
    let cid = state.guestId;
    let c = state.conversations.find((x) => x.id === cid);
    if (c && (c.status === "CLOSED" || state.pending === c.id)) return;
    const ts = new Date().toISOString();
    if (!c) {
      const n = state.guestCount + 1;
      const gid = `Guest-${String(n).padStart(3, "0")}`;
      cid = `g-${n}-${Date.now()}`;
      const first = msg(cid, { senderType: "guest", senderId: gid, senderName: gid }, t, ts);
      c = { id: cid, title: conversationTitle(t), participantId: gid, participantType: "guest", productId: null, status: "AI_ACTIVE", messages: [first], createdAt: ts, updatedAt: ts, events: [{ id: `ev-${++evSeq}`, type: "created", at: ts, by: gid }] };
      const created = c;
      set((s) => ({ guestId: created.id, guestCount: n, conversations: [created, ...s.conversations],
        notifications: [{ id: `n-${created.id}`, conversationId: created.id, createdAt: ts, read: false, type: "new", text: `${gid} memulai percakapan sebagai tamu.` }, ...s.notifications] }));
    } else {
      set(append(c.id, msg(c.id, { senderType: "guest", senderId: c.participantId, senderName: c.participantId }, t, ts)));
      if (c.status === "HUMAN_ACTIVE") set((s) => ({ notifications: [note(c!.id, "reply", `${c!.participantId}: ${t.slice(0, 80)}`, c!.assignedCsId), ...s.notifications] }));
    }
    const id = cid!;
    if (c.status === "HUMAN_ACTIVE") return;
    set({ pending: id });
    const gen = state.generation[id] ?? 0;
    const reply = guestRespond(t);
    setTimeout(() => {
      const cur = state.conversations.find((x) => x.id === id);
      if (!cur || cur.status !== "AI_ACTIVE" || (state.generation[id] ?? 0) !== gen) { if (state.pending === id) set({ pending: null }); return; }
      set((s) => ({ pending: null, ...append(id, msg(id, aiSender, reply, new Date().toISOString()))(s) }));
    }, 700);
  },

  // Switching sessions restores that session's product context.
  select: (id: string) => set((s) => ({ activeId: id, productId: s.conversations.find((c) => c.id === id)?.productId ?? null })),
  newConversation: () => set({ activeId: null, productId: null }),
  /** Updates the draft product, or the active session's product (callers confirm first). */
  setProduct: (productId: string | null) => set((s) => ({
    productId,
    conversations: s.conversations.map((c) => (c.id === s.activeId ? { ...c, productId } : c)),
  })),
  rename: (id: string, title: string) => set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c)) })),
  remove: (id: string) => set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id), activeId: s.activeId === id ? null : s.activeId })),
  markNotificationRead: (id: string) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: (ids: string[]) => set((s) => ({ notifications: s.notifications.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)) })),
  setActingCs: (csId: string) => set({ actingCsId: csId }),
  /** Availability affects only who may receive new assignments; never transfers or changes handlers. */
  setAvailability: (csId: string, a: CsAvailability) => set((s) => ({ availability: { ...s.availability, [csId]: a } })),
  markRead: (cid: string) => set((s) => ({ notifications: s.notifications.map((n) => (n.conversationId === cid ? { ...n, read: true } : n)) })),
  /** Assign (or reassign) a CS to the queue item; handler status is unchanged. */
  assign(cid: string, csId: string) {
    const c = state.conversations.find((x) => x.id === cid);
    if (!c || c.status === "CLOSED" || c.assignedCsId === csId || !demoCs.some((p) => p.id === csId)) return false;
    if ((state.availability[csId] ?? "Tersedia") !== "Tersedia") return false;
    // Reassigning an active human session moves the handler to the new CS.
    set((s) => ({
      conversations: s.conversations.map((x) => (x.id === cid ? { ...x, assignedCsId: csId } : x)),
      notifications: [note(cid, "assigned", `Percakapan “${c.title}” ditugaskan kepada Anda.`, csId), ...s.notifications],
    }));
    logEvent(cid, "assigned", demoCs.find((p) => p.id === csId)!.name);
    return true;
  },
  setPriority: (cid: string, priority: ConversationPriority) => set((s) => ({ conversations: s.conversations.map((x) => (x.id === cid ? { ...x, priority } : x)) })),
  close(cid: string, by = "Admin") {
    const c = state.conversations.find((x) => x.id === cid);
    if (!c || c.status === "CLOSED") return;
    const ts = new Date().toISOString();
    set((s) => ({
      pending: s.pending === cid ? null : s.pending,
      generation: { ...s.generation, [cid]: (s.generation[cid] ?? 0) + 1 },
      conversations: s.conversations.map((x) => (x.id === cid ? { ...x, status: "CLOSED", updatedAt: ts, messages: [...x.messages, msg(cid, systemSender, closedNotice, ts)] } : x)),
      notifications: [note(cid, "closed", `Percakapan “${c.title}” ditutup.`), ...s.notifications],
    }));
    logEvent(cid, "closed", by);
  },
  /** Reopens a closed session to AI_ACTIVE; keeps history, adds one system notice, never triggers an AI reply. */
  reopen(cid: string, by = "Admin") {
    const c = state.conversations.find((x) => x.id === cid);
    if (!c || c.status !== "CLOSED") return false;
    const ts = new Date().toISOString();
    set((s) => ({
      pending: s.pending === cid ? null : s.pending,
      generation: { ...s.generation, [cid]: (s.generation[cid] ?? 0) + 1 },
      conversations: s.conversations.map((x) => (x.id === cid ? { ...x, status: "AI_ACTIVE", updatedAt: ts, messages: [...x.messages, msg(cid, systemSender, reopenNotice, ts)] } : x)),
    }));
    logEvent(cid, "reopened", by);
    return true;
  },
  takeOver(cid: string, csIdArg?: string) {
    const c = state.conversations.find((x) => x.id === cid);
    if (!c || c.status !== "AI_ACTIVE") return;
    const csId = csIdArg ?? c.assignedCsId ?? currentDemoCs.id;
    const cs = csSender(csId);
    const ts = new Date().toISOString();
    set((s) => ({
      pending: s.pending === cid ? null : s.pending,
      generation: { ...s.generation, [cid]: (s.generation[cid] ?? 0) + 1 },
      conversations: s.conversations.map((x) => (x.id === cid ? { ...x, status: "HUMAN_ACTIVE", assignedCsId: csId, updatedAt: ts, messages: [...x.messages, msg(cid, systemSender, takeoverNotice(cs.senderName), ts)] } : x)),
      notifications: [note(cid, "handoff", `CS ${cs.senderName} mengambil alih “${c.title}”.`), ...s.notifications],
    }));
    logEvent(cid, "takeover", cs.senderName);
  },
  endCs(cid: string, csId: string = currentDemoCs.id) {
    const c = state.conversations.find((x) => x.id === cid);
    if (!c || c.status !== "HUMAN_ACTIVE" || c.assignedCsId !== csId) return;
    const ts = new Date().toISOString();
    set((s) => ({
      generation: { ...s.generation, [cid]: (s.generation[cid] ?? 0) + 1 },
      conversations: s.conversations.map((x) => (x.id === cid ? { ...x, status: "AI_ACTIVE", updatedAt: ts, messages: [...x.messages, msg(cid, systemSender, returnToAiNotice, ts)] } : x)),
      notifications: [note(cid, "handback", `“${c.title}” kembali ditangani AI Bot.`), ...s.notifications],
    }));
    logEvent(cid, "handback", csSender(csId).senderName);
  },
  csSend(cid: string, text: string, csId: string = currentDemoCs.id) {
    const t = text.trim();
    const c = state.conversations.find((x) => x.id === cid);
    // Only the assigned CS may reply, and only while HUMAN_ACTIVE.
    if (!t || !c || c.status !== "HUMAN_ACTIVE" || c.assignedCsId !== csId) return;
    set(append(cid, msg(cid, csSender(csId), t, new Date().toISOString())));
    logEvent(cid, "cs_reply", csSender(csId).senderName);
  },
  send(text: string, ctx: AssistantContext) {
    const t = text.trim();
    if (!t || state.pending) return;
    const existing = state.conversations.find((c) => c.id === state.activeId);
    if (existing?.status === "CLOSED") return;
    const ts = new Date().toISOString();
    const cid = existing?.id ?? `c-${Date.now()}`;
    const user = msg(cid, clientSender, t, ts);
    if (!existing) {
      const created: Conversation = {
        id: cid, title: conversationTitle(t), participantId: demoParticipant.id, participantType: "client",
        productId: state.productId, status: "AI_ACTIVE", messages: [user], createdAt: ts, updatedAt: ts,
        events: [{ id: `ev-${++evSeq}`, type: "created", at: ts, by: demoParticipant.name }],
      };
      set((s) => ({
        conversations: [created, ...s.conversations], activeId: cid,
        // One CS notification per new conversation, never per reply.
        notifications: [{ id: `n-${cid}`, conversationId: cid, createdAt: ts, read: false, type: "new", text: `${demoParticipant.name} memulai percakapan “${created.title}”.` }, ...s.notifications],
      }));
    } else {
      set(append(cid, user));
      if (existing.status === "HUMAN_ACTIVE") set((s) => ({ notifications: [note(cid, "reply", `${demoParticipant.name}: ${t.slice(0, 80)}`, existing.assignedCsId), ...s.notifications] }));
    }
    // A human CS handles HUMAN_ACTIVE sessions: no scripted AI reply.
    if (existing?.status === "HUMAN_ACTIVE") return;
    set({ pending: cid });
    const reply = respond(t, ctx);
    const gen = state.generation[cid] ?? 0;
    setTimeout(() => {
      const current = state.conversations.find((c) => c.id === cid);
      // Generation guard: a takeover/handoff since sending invalidates this reply.
      if (!current || current.status !== "AI_ACTIVE" || (state.generation[cid] ?? 0) !== gen) {
        if (state.pending === cid) set({ pending: null });
        return;
      }
      set((s) => ({ pending: null, ...append(cid, msg(cid, aiSender, reply.text, new Date().toISOString(), reply.refs.length ? reply.refs : undefined))(s) }));
    }, 700);
  },
};
