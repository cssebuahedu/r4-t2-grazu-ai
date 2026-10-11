export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <section className="flex min-h-96 flex-col items-center justify-center border-y border-dashed px-5 text-center">
        <span className="mb-5 rounded-md bg-accent px-3 py-1 text-xs font-medium text-primary">
          SEGERA HADIR
        </span>
        <h2 className="text-lg font-semibold">Fitur dalam tahap pengembangan</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Modul {title} akan tersedia pada tahap pengembangan berikutnya.
        </p>
      </section>
    </>
  );
}
