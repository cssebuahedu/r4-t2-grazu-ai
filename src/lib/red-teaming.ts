import { useSyncExternalStore } from "react";

export type Env = "Development" | "Staging" | "Production";
export type AuthType = "None" | "Bearer Token" | "API Key Header";
export type ApiType = "OpenAI-Compatible" | "Custom REST API";
export const responseFormats = ["Teks", "JSON", "Markdown"] as const;
export type Severity = "Kritis" | "Tinggi" | "Sedang" | "Rendah";
export type ResultStatus = "Lulus" | "Gagal" | "Tidak Diuji";

export interface Endpoint {
  id: string;
  name: string;
  productId: string;
  url: string;
  method: "POST" | "GET";
  authType: AuthType;
  hasCredential: boolean;
  bodyTemplate: string;
  responsePath: string;
  env: Env;
  apiType: ApiType;
  contentType: string;
  sessionField: string;
  responseFormat: (typeof responseFormats)[number];
  errorPath: string;
}

export const openAiExample = {
  contentType: "application/json",
  bodyTemplate: '{\n  "model": "nama-model",\n  "messages": [\n    { "role": "user", "content": "{{prompt}}" }\n  ]\n}',
  responsePath: "$.choices[0].message.content",
  errorPath: "$.error.message",
};

export type EndpointConfigInput = Pick<Endpoint, "name" | "productId" | "url" | "bodyTemplate" | "responsePath" | "errorPath" | "contentType" | "authType"> & { credentialProvided: boolean };
const pathRe = /^\$(\.[A-Za-z_][\w-]*|\[\d+\])+$/;
/** Structural checks only — never contacts the endpoint. */
export function validateEndpointConfig(c: EndpointConfigInput): Record<string, string> {
  const er: Record<string, string> = {};
  if (!c.name.trim()) er["name"] = "Nama endpoint wajib diisi.";
  if (!c.productId) er["productId"] = "Pilih produk AI.";
  try { const u = new URL(c.url); if (!/^https?:$/.test(u.protocol)) throw new Error(); } catch { er["url"] = "URL harus valid dan diawali http:// atau https://."; }
  if (!c.contentType.trim()) er["contentType"] = "Content-Type wajib diisi.";
  try { JSON.parse(c.bodyTemplate); } catch { er["bodyTemplate"] = "Template harus berupa JSON yang valid."; }
  if (!er["bodyTemplate"] && !c.bodyTemplate.includes("{{prompt}}")) er["bodyTemplate"] = "Template wajib memuat placeholder {{prompt}}.";
  if (!pathRe.test(c.responsePath.trim())) er["responsePath"] = "Format path tidak valid (contoh: $.choices[0].message.content).";
  if (c.errorPath.trim() && !pathRe.test(c.errorPath.trim())) er["errorPath"] = "Format path error tidak valid (contoh: $.error.message).";
  if (c.authType !== "None" && !c.credentialProvided) er["credential"] = "Kredensial diperlukan untuk tipe autentikasi ini.";
  return er;
}

export interface RedTest {
  id: string;
  name: string;
  category: string;
  description: string;
  severity: Severity;
}

export interface TestResult {
  testId: string;
  status: ResultStatus;
}

export interface Run {
  id: string;
  endpointId: string;
  date: string;
  results: TestResult[];
}

export const redTests: RedTest[] = [
  { id: "RT-01", name: "Direct Prompt Injection", category: "Injeksi Prompt", severity: "Kritis", description: "Instruksi pengguna yang mencoba mengabaikan aturan sistem." },
  { id: "RT-02", name: "Indirect Prompt Injection", category: "Injeksi Prompt", severity: "Tinggi", description: "Instruksi tersembunyi di dokumen atau konten eksternal." },
  { id: "RT-03", name: "System Prompt Leakage", category: "Kebocoran Informasi", severity: "Tinggi", description: "Upaya memancing model membuka instruksi sistem." },
  { id: "RT-04", name: "Sensitive Data Disclosure", category: "Kebocoran Informasi", severity: "Kritis", description: "Keluaran yang memuat data pribadi atau rahasia." },
  { id: "RT-05", name: "Jailbreak Resistance", category: "Keselamatan Konten", severity: "Tinggi", description: "Ketahanan terhadap skenario permainan peran untuk melewati batasan." },
  { id: "RT-06", name: "Unauthorized Tool Invocation", category: "Kontrol Akses", severity: "Kritis", description: "Pemanggilan fungsi atau alat tanpa otorisasi pengguna." },
  { id: "RT-07", name: "RAG Access Control", category: "Kontrol Akses", severity: "Tinggi", description: "Pengambilan dokumen di luar hak akses pengguna." },
  { id: "RT-08", name: "Cross-User Data Isolation", category: "Kontrol Akses", severity: "Kritis", description: "Kebocoran percakapan atau data antar pengguna." },
  { id: "RT-09", name: "Insecure Output Handling", category: "Keamanan Keluaran", severity: "Sedang", description: "Keluaran berisi skrip atau markup yang tidak disanitasi." },
  { id: "RT-10", name: "Harmful Content Handling", category: "Keselamatan Konten", severity: "Tinggi", description: "Penanganan permintaan konten berbahaya atau ilegal." },
  { id: "RT-11", name: "Excessive Agency", category: "Kontrol Akses", severity: "Sedang", description: "Tindakan otomatis melampaui wewenang yang ditetapkan." },
  { id: "RT-12", name: "Resource Abuse Protection", category: "Ketersediaan", severity: "Rendah", description: "Perlindungan terhadap permintaan berlebih dan input sangat panjang." },
];

const all = redTests.map((t) => t.id);

/** Deterministic outcome derived from endpoint + test id (no randomness). */
export function simulateStatus(endpointId: string, testId: string): ResultStatus {
  const sum = [...(endpointId + testId)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return sum % 4 === 0 ? "Gagal" : "Lulus";
}
export function simulate(endpointId: string, ids: string[]): TestResult[] {
  return redTests.map((t) => ({
    testId: t.id,
    status: ids.includes(t.id) ? simulateStatus(endpointId, t.id) : "Tidak Diuji",
  }));
}

const withDefaults = (e: Omit<Endpoint, "apiType" | "contentType" | "sessionField" | "responseFormat" | "errorPath">): Endpoint => ({ apiType: "Custom REST API", contentType: "application/json", sessionField: "", responseFormat: "Teks", errorPath: "", ...e });
const initialEndpoints: Endpoint[] = [
  withDefaults({ id: "EP-001", name: "Chatbot Layanan Publik API", productId: "UC-001", url: "https://api.layanan.example.go.id/v1/chat", method: "POST", authType: "Bearer Token", hasCredential: true, bodyTemplate: '{\n  "message": "{{prompt}}"\n}', responsePath: "$.reply", env: "Production" }),
  withDefaults({ id: "EP-002", name: "Asisten Staging", productId: "UC-001", url: "https://staging.layanan.example.go.id/v1/chat", method: "POST", authType: "API Key Header", hasCredential: true, bodyTemplate: '{\n  "input": "{{prompt}}"\n}', responsePath: "$.output.text", env: "Staging" }),
  withDefaults({ id: "EP-003", name: "Fraud Explainer", productId: "UC-002", url: "https://ai.banknusantara.example.co.id/explain", method: "POST", authType: "Bearer Token", hasCredential: true, bodyTemplate: '{\n  "query": "{{prompt}}"\n}', responsePath: "$.data.answer", env: "Development" }),
  withDefaults({ id: "EP-004", name: "Rekomendasi Belajar API", productId: "UC-004", url: "https://ml.cendekia.example.ac.id/recommend", method: "GET", authType: "None", hasCredential: false, bodyTemplate: "{}", responsePath: "$.items", env: "Staging" }),
];

const mkRun = (id: string, endpointId: string, date: string, ids: string[]): Run => ({ id, endpointId, date, results: simulate(endpointId, ids) });
const initialRuns: Run[] = [
  mkRun("RUN-005", "EP-001", "09 Okt 2026", all),
  mkRun("RUN-004", "EP-003", "08 Okt 2026", all.slice(0, 8)),
  mkRun("RUN-003", "EP-002", "07 Okt 2026", all),
  mkRun("RUN-002", "EP-004", "05 Okt 2026", all.slice(4, 12)),
  mkRun("RUN-001", "EP-001", "02 Okt 2026", all.slice(0, 6)),
];

let state = { endpoints: initialEndpoints, runs: initialRuns };
const initialState = state;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
const set = (s: typeof state) => ((state = s), listeners.forEach((l) => l()));

export function useRedTeam() {
  return useSyncExternalStore(subscribe, () => state, () => initialState);
}

export function saveEndpoint(ep: Omit<Endpoint, "id"> & { id?: string | undefined }) {
  if (ep.id) {
    set({ ...state, endpoints: state.endpoints.map((e) => (e.id === ep.id ? (ep as Endpoint) : e)) });
    return ep.id;
  }
  const n = Math.max(0, ...state.endpoints.map((e) => +e.id.slice(3))) + 1;
  const id = `EP-${String(n).padStart(3, "0")}`;
  set({ ...state, endpoints: [...state.endpoints, { ...ep, id }] });
  return id;
}
export function deleteEndpoint(id: string) {
  set({ ...state, endpoints: state.endpoints.filter((e) => e.id !== id) });
}
export function addRun(endpointId: string, ids: string[]) {
  const n = Math.max(0, ...state.runs.map((r) => +r.id.slice(4))) + 1;
  const id = `RUN-${String(n).padStart(3, "0")}`;
  const date = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  set({ ...state, runs: [mkRun(id, endpointId, date, ids), ...state.runs] });
  return id;
}

export const counts = (r: TestResult[]) => ({
  passed: r.filter((x) => x.status === "Lulus").length,
  failed: r.filter((x) => x.status === "Gagal").length,
  skipped: r.filter((x) => x.status === "Tidak Diuji").length,
});
export const severityClass = (s: Severity) =>
  s === "Kritis" || s === "Tinggi" ? "status-danger" : s === "Sedang" ? "status-warning" : "status-info";
export const resultClass = (s: ResultStatus) =>
  s === "Lulus" ? "status-success" : s === "Gagal" ? "status-danger" : "status-info";

export function detailFor(t: RedTest, status: ResultStatus) {
  return {
    scenario: `Skenario simulasi untuk kategori ${t.category}: ${t.description}`,
    request: `{\n  "message": "[contoh skenario ${t.id} — teks uji disamarkan]"\n}`,
    response:
      status === "Gagal"
        ? `{\n  "reply": "[contoh respons yang tidak sesuai kebijakan — disamarkan]"\n}`
        : `{\n  "reply": "Maaf, permintaan tersebut tidak dapat saya proses."\n}`,
    finding:
      status === "Gagal"
        ? `Dalam simulasi, sistem tidak menunjukkan perlindungan yang memadai terhadap skenario ${t.name}.`
        : status === "Lulus"
          ? `Dalam simulasi, sistem menolak atau menangani skenario ${t.name} dengan tepat.`
          : "Pengujian ini tidak dipilih pada run ini.",
    remediation:
      "Perkuat pemisahan instruksi sistem dan input pengguna, terapkan validasi keluaran, batasi hak akses alat dan data, serta lakukan pengujian ulang secara berkala.",
  };
}
