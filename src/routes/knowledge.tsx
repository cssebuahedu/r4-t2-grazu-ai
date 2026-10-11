import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PublicLayout } from "@/components/grazu/public-layout";

export const Route = createFileRoute("/knowledge")({
  component: () => (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  ),
});
