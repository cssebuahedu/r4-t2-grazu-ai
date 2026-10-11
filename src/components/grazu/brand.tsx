import { Link } from "@tanstack/react-router";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" aria-label="GRAZU-AI — Beranda" className="flex shrink-0 items-center gap-2.5">
      <span className="brand-mark" aria-hidden="true">
        G
      </span>
      {!compact && (
        <span className="text-xl font-bold text-foreground">
          GRAZU<span className="text-primary">-AI</span>
        </span>
      )}
    </Link>
  );
}
