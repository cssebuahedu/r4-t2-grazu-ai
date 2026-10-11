import { Link } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { badgeClass, demoDisclaimer, type Evidence } from "@/lib/compliance";

export const tableHead = "border-b bg-muted text-xs text-muted-foreground";
export const th = "px-4 py-3 text-left font-medium";
export const td = "px-4 py-3 text-left align-top";
export function StatusBadge({ status }: { status: string }) {
  return <span className={`status ${badgeClass(status)}`}>{status}</span>;
}
export function DemoNotice() {
  return <p className="my-5 border-l-2 border-warning bg-warning-soft px-4 py-3 text-xs leading-5 text-warning">{demoDisclaimer}</p>;
}
export function Choice({ label, value, onChange, options, all }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; all?: string }) {
  return <Select value={value || "__all"} onValueChange={(v) => onChange(v === "__all" ? "" : v)}><SelectTrigger aria-label={label} className="w-full bg-card sm:w-56"><SelectValue placeholder={label} /></SelectTrigger><SelectContent>{all && <SelectItem value="__all">{all}</SelectItem>}{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>;
}
export function Metrics({ items }: { items: [string, number][] }) {
  return <dl className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{items.map(([label, value]) => <div key={label} className="border-l-2 border-border bg-card px-4 py-4"><dt className="text-xs leading-5 text-muted-foreground">{label}</dt><dd className="mt-2 text-2xl font-semibold">{value}</dd></div>)}</dl>;
}
export function EvidenceLink({ evidence }: { evidence: Evidence }) {
  const cls = "break-words text-primary hover:underline";
  if (evidence.source === "risk") return <Link className={cls} to="/app/risk" search={{ product: evidence.productId }}>{evidence.id}</Link>;
  if (evidence.source === "ethics") return <Link className={cls} to="/app/ethics" search={{ product: evidence.productId }}>{evidence.id}</Link>;
  if (evidence.runId) return <Link className={cls} to="/app/red-teaming/runs/$id" params={{ id: evidence.runId }}>{evidence.id}</Link>;
  if (evidence.repoId) return <Link className={cls} to="/app/devsecops/repositories/$id" params={{ id: evidence.repoId }}>{evidence.id}</Link>;
  return <Link className={cls} to="/app/use-cases/$id" params={{ id: evidence.productId }}>{evidence.id}</Link>;
}
export function EvidenceTable({ evidence }: { evidence: Evidence[] }) {
  return <div className="overflow-x-auto border-y"><table className="w-full min-w-[720px] text-xs"><thead className={tableHead}><tr>{["Referensi Bukti", "Sumber", "Tanggal Simulasi", "Status", "Deskripsi"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>{evidence.map((e) => <tr key={e.id} className="border-b last:border-0"><td className={td}><EvidenceLink evidence={e} /></td><td className={td}>{e.sourceLabel}</td><td className={td}>{e.date}</td><td className={td}><StatusBadge status={e.status} /></td><td className={`${td} max-w-sm leading-5`}>{e.description}</td></tr>)}{!evidence.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada bukti simulasi terkait.</td></tr>}</tbody></table></div>;
}