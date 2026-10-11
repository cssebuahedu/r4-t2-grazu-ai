import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/grazu/brand";

const link = "hidden text-muted-foreground hover:text-primary sm:block";
const active = { className: "font-medium text-primary" };

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-card">
      <header className="border-b">
        <nav aria-label="Navigasi publik" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Brand />
          <div className="flex items-center gap-5 text-sm md:gap-8">
            <Link to="/" className={link} activeOptions={{ exact: true }} activeProps={active}>Beranda</Link>
            <Link to="/explore" className={link} activeProps={active}>Eksplorasi</Link>
            <Link to="/knowledge" className={link} activeProps={active}>Pusat Pengetahuan</Link>
            <Button asChild variant="outline" className="border-primary/30 bg-card text-primary"><Link to="/signin">Masuk</Link></Button>
          </div>
        </nav>
        <div className="flex gap-5 border-t px-6 py-2 text-xs sm:hidden">
          <Link to="/explore" activeProps={active}>Eksplorasi</Link>
          <Link to="/knowledge" activeProps={active}>Pusat Pengetahuan</Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">{children}</main>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 border-t px-6 py-7 lg:px-12">
        <Brand />
        <p className="text-xs text-muted-foreground">© 2026 GRAZU-AI. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
