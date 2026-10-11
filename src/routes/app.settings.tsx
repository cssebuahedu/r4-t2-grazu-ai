import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/grazu/placeholder-page";
import { pageHead } from "@/lib/grazu-navigation";
export const Route = createFileRoute("/app/settings")({
  head: () => pageHead("Pengaturan", "Pengaturan platform dan preferensi organisasi."),
  component: () => (
    <PlaceholderPage
      title="Pengaturan"
      description="Pengaturan platform dan preferensi organisasi."
    />
  ),
});
