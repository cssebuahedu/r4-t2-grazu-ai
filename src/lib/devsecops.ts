import { useSyncExternalStore } from "react";

export type ScanProfile = "Basic" | "Standard" | "Comprehensive";
export type ScanStatus = "Berhasil" | "Gagal" | "Berjalan" | "Belum dipindai";
export type FindingSeverity = "Critical" | "High" | "Medium" | "Low";
export type PipelineStatus = "Success" | "Failed" | "Running";

export const scanCategories = [
  "Secret Scanning",
  "Static Application Security Testing (SAST)",
  "Software Composition Analysis (SCA)",
  "Infrastructure as Code (IaC)",
  "AI Prompt Security",
  "Container Security",
] as const;
export type ScanCategory = (typeof scanCategories)[number];

export const scanners = [
  { id: "gitleaks", label: "Secret Scanning (Gitleaks)", description: "Mendeteksi kredensial, token, atau kunci API yang tertanam di kode." },
  { id: "semgrep", label: "Static Code Analysis (Semgrep)", description: "Menganalisis pola kode tidak aman tanpa menjalankan aplikasi." },
  { id: "trivy", label: "Dependency Scanning (Trivy)", description: "Memeriksa dependensi pihak ketiga terhadap kerentanan yang diketahui." },
  { id: "checkov", label: "Infrastructure as Code (Checkov)", description: "Memeriksa konfigurasi Terraform, Kubernetes, dan IaC lainnya." },
  { id: "prompt", label: "AI Prompt Security", description: "Aturan khusus untuk pola prompt injection dan instruksi sistem yang rentan." },
  { id: "container", label: "Container Security", description: "Memeriksa image container dan Dockerfile terhadap konfigurasi berisiko." },
] as const;

export interface Repository {
  id: string;
  name: string;
  url: string;
  org: string;
  productId: string;
  branch: string;
  profile: ScanProfile;
  lastScan: string;
  scanStatus: ScanStatus;
  scanners: string[];
  owner?: string;
  visibility?: "Public" | "Private";
}

/** Splits https://github.com/owner/name into parts (demo parsing only). */
export function parseRepoUrl(url: string): { owner: string; name: string } | null {
  const m = /^https:\/\/[\w.-]+\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(url.trim());
  return m ? { owner: m[1]!, name: m[2]! } : null;
}
export const repoOwner = (r: Repository) => r.owner || parseRepoUrl(r.url)?.owner || "—";
export type IntegrationStatus = "Belum Dikonfigurasi" | "Konfigurasi Demo Lengkap" | "Menunggu Integrasi Backend";
/** Demo configuration completeness only — never implies a real connection. */
export function integrationStatus(r: Repository): IntegrationStatus {
  return r.url && r.branch && r.productId && r.scanners.length > 0 ? "Konfigurasi Demo Lengkap" : "Belum Dikonfigurasi";
}

export interface Finding {
  id: string;
  repoId: string;
  category: ScanCategory;
  severity: FindingSeverity;
  file: string;
  line: number;
  tool: string;
  status: "Terbuka" | "Ditinjau" | "Diperbaiki";
  title: string;
  description: string;
  remediation: string;
  evidence: string;
}

export interface PipelineRun {
  id: string;
  workflow: string;
  repoId: string;
  branch: string;
  sha: string;
  trigger: string;
  status: PipelineStatus;
  time: string;
}

const allScanners = scanners.map((s) => s.id);

const initialRepos: Repository[] = [
  { id: "repo-001", name: "layanan-publik-assistant", url: "https://github.com/contoh-org/layanan-publik-assistant", org: "Kementerian Pelayanan Publik", productId: "UC-001", branch: "main", profile: "Comprehensive", lastScan: "10 Okt 2026 · 09.12 WIB", scanStatus: "Berhasil", scanners: allScanners },
  { id: "repo-002", name: "fraud-anomaly-engine", url: "https://github.com/contoh-org/fraud-anomaly-engine", org: "Bank Nusantara", productId: "UC-002", branch: "main", profile: "Comprehensive", lastScan: "10 Okt 2026 · 08.40 WIB", scanStatus: "Gagal", scanners: allScanners },
  { id: "repo-003", name: "medical-imaging-cv", url: "https://github.com/contoh-org/medical-imaging-cv", org: "RS Sehat Indonesia", productId: "UC-003", branch: "develop", profile: "Standard", lastScan: "09 Okt 2026 · 16.05 WIB", scanStatus: "Berhasil", scanners: ["gitleaks", "semgrep", "trivy"] },
  { id: "repo-004", name: "learning-recommender", url: "https://github.com/contoh-org/learning-recommender", org: "Universitas Cendekia", productId: "UC-004", branch: "main", profile: "Basic", lastScan: "08 Okt 2026 · 11.20 WIB", scanStatus: "Berjalan", scanners: ["gitleaks", "semgrep"] },
];

const f = (id: string, repoId: string, category: ScanCategory, severity: FindingSeverity, file: string, line: number, tool: string, status: Finding["status"], title: string, description: string, remediation: string, evidence: string): Finding => ({ id, repoId, category, severity, file, line, tool, status, title, description, remediation, evidence });

export const findings: Finding[] = [
  f("F-1001", "repo-001", "AI Prompt Security", "High", "src/prompts/system.ts", 14, "Custom AI Prompt Rules", "Terbuka", "Instruksi sistem dapat ditimpa", "Prompt sistem menggabungkan input pengguna tanpa pembatas, sehingga rentan terhadap prompt injection.", "Pisahkan input pengguna dari instruksi sistem dan terapkan validasi keluaran.", 'const prompt = SYSTEM + userInput; // tanpa pembatas'),
  f("F-1002", "repo-001", "Software Composition Analysis (SCA)", "Medium", "package.json", 22, "Trivy", "Ditinjau", "Dependensi dengan kerentanan diketahui", "Versi pustaka HTTP yang digunakan memiliki kerentanan yang telah dipublikasikan.", "Perbarui dependensi ke versi yang telah ditambal.", '"http-client-lib": "1.2.0"  // contoh'),
  f("F-2001", "repo-002", "Secret Scanning", "Critical", "config/settings.py", 8, "Gitleaks", "Terbuka", "Kredensial tertanam di kode", "Pola menyerupai kunci API ditemukan tersimpan langsung di berkas konfigurasi.", "Hapus kredensial dari kode, rotasi kunci, dan gunakan secret manager.", 'API_KEY = "CONTOH-XXXX-XXXX-REDACTED"'),
  f("F-2002", "repo-002", "Static Application Security Testing (SAST)", "High", "src/api/query.py", 41, "Semgrep", "Terbuka", "Potensi SQL injection", "Query dibangun dengan penggabungan string dari parameter permintaan.", "Gunakan parameterized query atau ORM.", 'cursor.execute("SELECT * FROM tx WHERE id=" + req_id)'),
  f("F-2003", "repo-002", "Infrastructure as Code (IaC)", "Medium", "infra/storage.tf", 17, "Checkov", "Terbuka", "Bucket penyimpanan tanpa enkripsi", "Sumber daya penyimpanan didefinisikan tanpa enkripsi saat diam.", "Aktifkan enkripsi sisi server pada definisi sumber daya.", 'resource "storage_bucket" "logs" { encryption = false }'),
  f("F-2004", "repo-002", "Container Security", "Low", "Dockerfile", 1, "Trivy", "Ditinjau", "Image dasar usang", "Image dasar kontainer belum diperbarui dan memuat paket usang.", "Gunakan image dasar minimal versi terbaru.", "FROM python:3.8"),
  f("F-3001", "repo-003", "Container Security", "High", "Dockerfile", 12, "Trivy", "Terbuka", "Kontainer berjalan sebagai root", "Kontainer tidak menetapkan pengguna non-root.", "Tambahkan instruksi USER dengan pengguna non-root.", "# tidak ada instruksi USER"),
  f("F-3002", "repo-003", "Static Application Security Testing (SAST)", "Low", "src/utils/io.py", 33, "Semgrep", "Diperbaiki", "Penggunaan berkas sementara tidak aman", "Berkas sementara dibuat dengan nama yang dapat ditebak.", "Gunakan fungsi pembuatan berkas sementara yang aman.", 'open("/tmp/output.dcm", "w")'),
  f("F-4001", "repo-004", "Secret Scanning", "Medium", ".env.example", 3, "Gitleaks", "Ditinjau", "Contoh nilai menyerupai token", "Berkas contoh memuat nilai yang menyerupai token akses.", "Ganti dengan placeholder yang jelas bukan kredensial.", "TOKEN=contoh-token-redacted"),
];

const initialRuns: PipelineRun[] = [
  { id: "run-108", workflow: "grazu-security-scan", repoId: "repo-002", branch: "main", sha: "a3f9c21", trigger: "push", status: "Failed", time: "10 Okt 2026 · 08.40 WIB" },
  { id: "run-107", workflow: "grazu-security-scan", repoId: "repo-001", branch: "main", sha: "7be014d", trigger: "pull_request", status: "Success", time: "10 Okt 2026 · 09.12 WIB" },
  { id: "run-106", workflow: "build-and-test", repoId: "repo-004", branch: "main", sha: "c41d8e0", trigger: "push", status: "Running", time: "08 Okt 2026 · 11.20 WIB" },
  { id: "run-105", workflow: "grazu-security-scan", repoId: "repo-003", branch: "develop", sha: "19ac7f3", trigger: "schedule", status: "Success", time: "09 Okt 2026 · 16.05 WIB" },
  { id: "run-104", workflow: "build-and-test", repoId: "repo-002", branch: "feature/model-v2", sha: "e6b2a90", trigger: "pull_request", status: "Failed", time: "09 Okt 2026 · 13.48 WIB" },
  { id: "run-103", workflow: "build-and-test", repoId: "repo-001", branch: "main", sha: "5d0f3b7", trigger: "push", status: "Success", time: "08 Okt 2026 · 10.02 WIB" },
];

export const webhookEvents = [
  { id: "EVT-5012", type: "workflow_run.completed", repoId: "repo-002", time: "10 Okt 2026 · 08.41 WIB", status: "Diproses" },
  { id: "EVT-5011", type: "security_report.uploaded", repoId: "repo-001", time: "10 Okt 2026 · 09.13 WIB", status: "Diproses" },
  { id: "EVT-5010", type: "push", repoId: "repo-004", time: "08 Okt 2026 · 11.20 WIB", status: "Menunggu" },
  { id: "EVT-5009", type: "security_report.uploaded", repoId: "repo-003", time: "09 Okt 2026 · 16.06 WIB", status: "Diproses" },
  { id: "EVT-5008", type: "workflow_run.completed", repoId: "repo-002", time: "09 Okt 2026 · 13.49 WIB", status: "Gagal diproses" },
];

/* Deterministic results per category for simulated scans */
export const simulatedResults: Record<ScanCategory, { severity: FindingSeverity; text: string }> = {
  "Secret Scanning": { severity: "High", text: "1 pola menyerupai kredensial di berkas konfigurasi" },
  "Static Application Security Testing (SAST)": { severity: "Medium", text: "2 pola kode tidak aman" },
  "Software Composition Analysis (SCA)": { severity: "Medium", text: "3 dependensi perlu diperbarui" },
  "Infrastructure as Code (IaC)": { severity: "Low", text: "1 konfigurasi infrastruktur kurang ketat" },
  "AI Prompt Security": { severity: "High", text: "1 prompt tanpa pembatas input pengguna" },
  "Container Security": { severity: "Low", text: "1 image dasar usang" },
};

let repos = initialRepos;
let runs = initialRuns;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
const emit = () => listeners.forEach((l) => l());

export const useRepos = () => useSyncExternalStore(subscribe, () => repos, () => initialRepos);
export const useRuns = () => useSyncExternalStore(subscribe, () => runs, () => initialRuns);

export function saveRepo(data: Omit<Repository, "id" | "lastScan" | "scanStatus" | "scanners">, id?: string, scannerIds?: string[]) {
  if (id) repos = repos.map((r) => (r.id === id ? { ...r, ...data, ...(scannerIds ? { scanners: scannerIds } : {}) } : r));
  else {
    const n = Math.max(0, ...repos.map((r) => +r.id.slice(5) || 0)) + 1;
    repos = [{ ...data, id: `repo-${String(n).padStart(3, "0")}`, lastScan: "—", scanStatus: "Belum dipindai", scanners: scannerIds ?? allScanners }, ...repos];
  }
  emit();
}
export function deleteRepo(id: string) {
  repos = repos.filter((r) => r.id !== id);
  emit();
}
export function toggleScanner(repoId: string, scanner: string) {
  repos = repos.map((r) => r.id !== repoId ? r : { ...r, scanners: r.scanners.includes(scanner) ? r.scanners.filter((s) => s !== scanner) : [...r.scanners, scanner] });
  emit();
}
let runCounter = 108;
export function recordSimulatedScan(repoId: string) {
  const repo = repos.find((r) => r.id === repoId);
  if (!repo) return;
  runCounter += 1;
  const time = "10 Okt 2026 · 18.00 WIB";
  runs = [{ id: `run-${runCounter}`, workflow: "grazu-security-scan (simulasi)", repoId, branch: repo.branch, sha: `sim${String(runCounter).padStart(4, "0")}`, trigger: "manual", status: "Success", time }, ...runs];
  repos = repos.map((r) => (r.id === repoId ? { ...r, lastScan: time, scanStatus: "Berhasil" } : r));
  emit();
}

export const severityClass = (s: FindingSeverity) => s === "Critical" || s === "High" ? "status-danger" : s === "Medium" ? "status-warning" : "status-info";
export const scanStatusClass = (s: ScanStatus | PipelineStatus) => s === "Berhasil" || s === "Success" ? "status-success" : s === "Gagal" || s === "Failed" ? "status-danger" : s === "Berjalan" || s === "Running" ? "status-warning" : "status-info";
export const openFindings = (repoId: string) => findings.filter((x) => x.repoId === repoId && x.status !== "Diperbaiki").length;

export const workflowYaml = `# Template demonstrasi — belum terhubung dengan layanan GRAZU-AI
name: grazu-security-scan

on:
  push:
    branches: [main]
  pull_request:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Langkah ilustratif. Pemindai dan pengiriman laporan
      # akan didefinisikan pada fase backend berikutnya.
      - name: Contoh langkah pemindaian
        run: echo "Pemindaian keamanan (ilustrasi)"

      - name: Contoh pengiriman laporan ke GRAZU-AI
        run: echo "Kirim laporan ke <URL-GRAZU-AI-MENDATANG>"
`;
