import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/grazu/auth-page";
import { pageHead } from "@/lib/grazu-navigation";

export const Route = createFileRoute("/signin")({
  head: () => pageHead("Masuk", "Halaman simulasi masuk GRAZU-AI dengan email atau Google untuk tata kelola AI yang bertanggung jawab."),
  component: SigninPage,
});

function SigninPage() {
  return <AuthPage mode="signin" />;
}