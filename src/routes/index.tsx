import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/grazu/brand";
import { pageHead } from "@/lib/grazu-navigation";
import { GuestChat } from "@/components/grazu/guest-chat";
import jakarta from "@/assets/jakarta.jpg";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Tata Kelola AI Indonesia",
      "Platform terpadu untuk pemantauan adopsi, evaluasi risiko, keamanan, dan kepatuhan kecerdasan artifisial di Indonesia.",
    ),
  component: Index,
});
function Index() {
  return (
    <div className="bg-card">
      <header className="border-b">
        <nav
          aria-label="Navigasi beranda"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12"
        >
          <Brand />
          <div className="flex items-center gap-6 text-sm md:gap-10">
            <Link to="/" className="hidden font-medium text-primary sm:block">
              Beranda
            </Link>
            <a href="#tentang" className="hidden text-muted-foreground hover:text-primary sm:block">
              Tentang Platform
            </a>
            <Link to="/explore" className="hidden text-muted-foreground hover:text-primary md:block">
              Eksplorasi
            </Link>
            <Link to="/knowledge" className="hidden text-muted-foreground hover:text-primary md:block">
              Pusat Pengetahuan
            </Link>
            <Button asChild variant="outline" className="border-primary/30 bg-card text-primary">
              <Link to="/signin">Masuk</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main>
        <section className="hero">
          <img
            src={jakarta}
            width={1536}
            height={1024}
            alt="Monumen Nasional dan panorama kota Jakarta"
            className="hero-photo"
          />
          <div className="hero-veil" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-24">
            <div className="mb-7 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Tata Kelola AI untuk Indonesia
            </div>
            <h1 className="hero-heading max-w-[650px]">
              Tata Kelola Kecerdasan Artifisial yang{" "}
              <span className="text-primary">Bertanggung Jawab</span>
            </h1>
            <p className="mt-6 max-w-[540px] text-base leading-7 text-muted-foreground">
              Platform terpadu untuk pemantauan adopsi, evaluasi risiko, keamanan, dan kepatuhan
              kecerdasan artifisial di Indonesia.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Button asChild size="lg" className="h-12 px-6">
                <Link to="/app">
                  Buka Dashboard <span aria-hidden="true">↗</span>
                </Link>
              </Button>
              <a href="#tentang" className="text-sm font-medium text-foreground hover:text-primary">
                Tentang Platform{" "}
                <span className="ml-2" aria-hidden="true">
                  ↓
                </span>
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Transparan. Aman. Bertanggung jawab.
            </p>
          </div>
        </section>
        <section id="tentang" className="scroll-mt-8 border-b">
          <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  Fondasi Kepercayaan Digital
                </p>
                <h2 className="text-2xl font-semibold">Satu platform, tiga pilar utama.</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Mendukung ekosistem kecerdasan artifisial Indonesia yang tepercaya dan
                berkelanjutan.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Tata Kelola AI",
                  text: "Penerapan AI yang transparan dan akuntabel melalui pengelolaan use case, penilaian risiko, serta kepatuhan regulasi.",
                },
                {
                  n: "02",
                  title: "Keamanan AI",
                  text: "Memperkuat ketahanan sistem AI dengan pendekatan keamanan, prinsip etika, dan pemantauan yang berkelanjutan.",
                },
                {
                  n: "03",
                  title: "Analitik Nasional",
                  text: "Gambaran menyeluruh adopsi AI di Indonesia sebagai landasan pengambilan keputusan dan perumusan kebijakan.",
                },
              ].map((item) => (
                <article key={item.n} className="border-t pt-6">
                  <span className="text-xs font-medium text-link">{item.n}</span>
                  <h3 className="mb-3 mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-7 lg:px-12">
        <Brand />
        <p className="text-xs text-muted-foreground">
          © 2026 GRAZU-AI. Seluruh hak cipta dilindungi.
        </p>
        <span className="text-xs text-muted-foreground">Dibangun untuk Indonesia.</span>
      </footer>
      <GuestChat />
    </div>
  );
}
