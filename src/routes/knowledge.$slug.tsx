import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { pageHead } from "@/lib/grazu-navigation";
import { articleBySlug, articles, kindClass } from "@/lib/knowledge";

export const Route = createFileRoute("/knowledge/$slug")({
  loader: ({ params }) => {
    const article = articleBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) =>
    loaderData ? pageHead(loaderData.article.title, loaderData.article.summary) : { meta: [{ title: "Artikel tidak ditemukan | GRAZU-AI" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: ArticleNotFound,
  component: ArticlePage,
});

function ArticleNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-semibold">Artikel tidak ditemukan</h1>
      <Link to="/knowledge" className="mt-4 inline-block text-sm text-link hover:underline">Kembali ke Pusat Pengetahuan</Link>
    </div>
  );
}

function ArticlePage() {
  const { article: a } = Route.useLoaderData();
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
      <article className="max-w-2xl">
        <Link to="/knowledge" className="text-sm text-link hover:underline">← Kembali ke Pusat Pengetahuan</Link>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-primary">{a.category}</p>
        <h1 className="mt-2 text-3xl font-semibold">{a.title}</h1>
        <p className="mt-3 text-xs text-muted-foreground">Diperbarui {a.updated} · <span className={`status ${kindClass(a.sourceKind)}`}>{a.sourceKind}</span></p>
        <div className="mt-8 grid gap-5 text-[15px] leading-7">{a.body.map((p) => <p key={p}>{p}</p>)}</div>
        <p className="mt-8 border-t pt-4 text-xs text-muted-foreground">Sumber: {a.source}. Konten ini merupakan materi edukasi GRAZU-AI, bukan nasihat hukum atau kutipan resmi. Dokumen berstatus draf belum mengikat secara hukum.</p>
      </article>
      <aside>
        <h2 className="text-sm font-semibold">Artikel terkait</h2>
        <ul className="mt-3 divide-y border-y">{related.map((r) => (
          <li key={r.slug} className="py-3"><Link to="/knowledge/$slug" params={{ slug: r.slug }} className="text-sm hover:text-primary">{r.title}</Link><p className="text-xs text-muted-foreground">{r.category}</p></li>))}</ul>
      </aside>
    </div>
  );
}
