import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/grazu/analytics-ui";
import { pageHead } from "@/lib/grazu-navigation";
import { articles, kindClass } from "@/lib/knowledge";

export const Route = createFileRoute("/knowledge/")({
  head: () => pageHead("Pusat Pengetahuan", "Pustaka edukasi tata kelola, etika, risiko, keamanan, dan regulasi kecerdasan artifisial."),
  component: Knowledge,
});

function Knowledge() {
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const list = articles.filter((a) => !s || `${a.title} ${a.category} ${a.summary}`.toLowerCase().includes(s));
  return (
    <>
      <h1 className="text-3xl font-semibold">Pusat Pengetahuan</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Pustaka edukasi tata kelola, etika, risiko, keamanan, dan regulasi kecerdasan artifisial.</p>
      <Input aria-label="Cari artikel" placeholder="Cari artikel…" className="mt-6 max-w-md" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 ? <Empty text="Tidak ada artikel yang sesuai." /> : (
        <ul className="mt-8 divide-y border-y">{list.map((a) => (
          <li key={a.slug} className="grid gap-3 py-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{a.category}</p>
              <h2 className="mt-1 text-base font-semibold">{a.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">Sumber: {a.source} <span className={`status ml-2 ${kindClass(a.sourceKind)}`}>{a.sourceKind}</span></p>
            </div>
            <Link to="/knowledge/$slug" params={{ slug: a.slug }} className="text-sm font-medium text-link hover:underline">Baca artikel</Link>
          </li>))}</ul>)}
    </>
  );
}
