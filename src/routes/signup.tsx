import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/grazu/auth-page";
import { pageHead } from "@/lib/grazu-navigation";

export const Route = createFileRoute("/signup")({
  head: () => pageHead("Daftar", "Halaman simulasi pendaftaran profil GRAZU-AI dengan nama, email, dan pilihan Google."),
  component: SignupPage,
});

function SignupPage() {
  return <AuthPage mode="signup" />;
}