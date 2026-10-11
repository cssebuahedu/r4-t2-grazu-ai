import type { ReactNode } from "react";

export const selectCls = "h-9 w-full rounded-md border bg-card px-3 text-xs text-foreground";

export function PageHeader({ title, subtitle, label }: { title: string; subtitle: string; label: string }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>
      <span className="status status-warning">{label}</span>
    </header>
  );
}

export function Filter({ label, value, onChange, options, all = "Semua" }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; all?: string | null }) {
  return (
    <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">
      {label}
      <select aria-label={label} className={selectCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {all !== null && <option value="">{all}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-6 grid gap-3 rounded-md border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">{children}</div>;
}

export function Metric({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {note && <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

export function Panel({ title, note, children, className = "" }: { title: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-md border bg-card ${className}`}>
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {note && <p className="mt-0.5 text-[11px] text-muted-foreground">{note}</p>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Empty({ text = "Tidak ada data yang sesuai dengan filter." }: { text?: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>;
}

export const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" };
export const tooltipStyle = { fontSize: 12, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)" };
