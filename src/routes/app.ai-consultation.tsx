import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/ai-consultation")({
  beforeLoad: () => { throw redirect({ to: "/app/assistant", replace: true }); },
});
