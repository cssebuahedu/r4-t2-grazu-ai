import { useUseCases, type UseCase } from "@/lib/use-cases";

export function ProductSelector({ value, onChange }: { value: string | undefined; onChange: (id: string) => void }) {
  const list = useUseCases();
  const uc = list.find((u) => u.id === value);
  return (
    <section className="mb-6 rounded-md border bg-card p-5">
      <label htmlFor="product" className="block text-xs font-medium">Produk AI dari Registri Use Case</label>
      <select
        id="product"
        className="mt-2 h-10 w-full max-w-md rounded-md border bg-card px-3 text-sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Pilih produk AI…</option>
        {list.map((u) => (
          <option key={u.id} value={u.id}>{u.id} · {u.name}</option>
        ))}
      </select>
      {value && !uc && <p className="mt-3 text-xs text-destructive">Produk {value} tidak ditemukan di registri.</p>}
      {uc && <ProductInfo uc={uc} />}
    </section>
  );
}

function ProductInfo({ uc }: { uc: UseCase }) {
  return (
    <dl className="mt-5 grid gap-4 border-t pt-5 text-xs sm:grid-cols-3">
      <div><dt className="text-muted-foreground">Nama produk</dt><dd className="mt-1 font-medium">{uc.name}</dd></div>
      <div><dt className="text-muted-foreground">Organisasi</dt><dd className="mt-1">{uc.org}</dd></div>
      <div><dt className="text-muted-foreground">Sektor</dt><dd className="mt-1">{uc.sector}</dd></div>
      <div className="sm:col-span-3"><dt className="text-muted-foreground">Deskripsi</dt><dd className="mt-1 leading-5">{uc.description}</dd></div>
    </dl>
  );
}
