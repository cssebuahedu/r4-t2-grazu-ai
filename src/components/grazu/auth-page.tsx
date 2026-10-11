import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Brand } from "@/components/grazu/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import governance from "@/assets/auth-governance.jpg";

const emailSchema = z.string().trim().email("Masukkan alamat email yang valid.").max(255);
const formSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Kata sandi minimal 8 karakter.").max(128),
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
});

export function AuthPage({ mode }: { mode: "signin" | "signup" }) {
  const signup = mode === "signup";
  const [visible, setVisible] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "");
    const result = forgot
      ? z.object({ email: emailSchema }).safeParse({ email })
      : formSchema.safeParse({ email, password: values.get("password"), name: signup ? values.get("name") : "Demo" });
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      setMessage("");
      return;
    }
    if (signup && values.get("confirmPassword") !== values.get("password")) {
      setErrors({ confirmPassword: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    setErrors({});
    setCompleted(!forgot);
    setMessage(forgot
      ? "Simulasi permintaan reset berhasil. Tidak ada email yang dikirim."
      : signup
        ? "Simulasi pendaftaran berhasil. Tidak ada akun atau data profil yang disimpan."
        : "Simulasi masuk berhasil. Tidak ada autentikasi atau data yang disimpan.");
    event.currentTarget.reset();
  }

  function googleSimulation() {
    setErrors({});
    setCompleted(true);
    setMessage("Simulasi masuk dengan Google berhasil. Akun Gmail Anda tidak terhubung dan tidak ada data yang diakses.");
  }

  const fieldClass = "h-12 border-input bg-card px-4 shadow-none";
  function error(field: string) {
    return errors[field] ? <p id={`${field}-error`} className="mt-1.5 text-xs text-destructive">{errors[field]}</p> : null;
  }

  return (
    <main className="min-h-screen bg-card text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-2">
        <section className="flex flex-col px-6 py-7 sm:px-12 lg:px-16 lg:py-10">
          <div className="flex items-center justify-between gap-4">
            <Brand />
            <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="size-3.5" />Beranda</Link>
          </div>
          <div className="mx-auto my-auto w-full max-w-[420px] py-12 lg:py-14">
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" />Mode demo</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{forgot ? "Lupa kata sandi?" : signup ? "Buat akun Anda" : "Selamat datang kembali!"}</h1>
            <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">{forgot ? "Masukkan email untuk permintaan reset kata sandi." : signup ? "Mulai langkah menuju tata kelola AI yang bertanggung jawab." : "Masuk ke ruang kerja tata kelola AI Anda."}</p>
            <form onSubmit={submit} noValidate className="space-y-5">
              {signup && !forgot && <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">Nama lengkap</label>
                <Input id="name" name="name" autoComplete="name" maxLength={100} placeholder="Masukkan nama lengkap" className={fieldClass} aria-invalid={Boolean(errors["name"])} aria-describedby={errors["name"] ? "name-error" : undefined} />
                {error("name")}
              </div>}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
                <Input id="email" name="email" type="email" autoComplete="email" maxLength={255} placeholder="nama@organisasi.id" className={fieldClass} aria-invalid={Boolean(errors["email"])} aria-describedby={errors["email"] ? "email-error" : undefined} />
                {error("email")}
              </div>
              {!forgot && <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">Kata sandi</label>
                <div className="relative">
                  <Input id="password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} maxLength={128} placeholder={signup ? "Minimal 8 karakter" : "Masukkan kata sandi"} className={`${fieldClass} pr-12`} aria-invalid={Boolean(errors["password"])} aria-describedby={errors["password"] ? "password-error" : undefined} />
                  <Button type="button" variant="ghost" size="icon" title={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onClick={() => setVisible(!visible)} className="absolute right-1.5 top-1.5 text-muted-foreground">{visible ? <EyeOff /> : <Eye />}</Button>
                </div>
                {error("password")}
              </div>}
              {signup && !forgot && <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">Konfirmasi kata sandi</label>
                <Input id="confirmPassword" name="confirmPassword" type={visible ? "text" : "password"} autoComplete="new-password" maxLength={128} placeholder="Ulangi kata sandi" className={fieldClass} aria-invalid={Boolean(errors["confirmPassword"])} aria-describedby={errors["confirmPassword"] ? "confirmPassword-error" : undefined} />
                {error("confirmPassword")}
              </div>}
              {!signup && !forgot && <div className="flex justify-end"><Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => { setForgot(true); setMessage(""); setErrors({}); setCompleted(false); }}>Lupa kata sandi?</Button></div>}
              <Button type="submit" className="h-12 w-full shadow-none">{forgot ? "Simulasikan reset" : signup ? "Daftar" : "Masuk"}<ArrowRight /></Button>
            </form>
            {forgot ? <Button variant="link" className="mt-5 h-auto p-0" onClick={() => { setForgot(false); setMessage(""); setErrors({}); }}>Kembali ke halaman masuk</Button> : <>
              <div className="my-6 flex items-center gap-4"><span className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">atau lanjutkan dengan</span><span className="h-px flex-1 bg-border" /></div>
              <Button variant="outline" className="h-12 w-full bg-card shadow-none" onClick={googleSimulation}><span aria-hidden="true" className="text-xl font-bold text-info">G</span>{signup ? "Daftar dengan Google" : "Masuk dengan Google"}</Button>
              <p className="mt-6 text-center text-sm text-muted-foreground">{signup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}<Link to={signup ? "/signin" : "/signup"} className="font-medium text-primary hover:underline">{signup ? "Masuk" : "Daftar sekarang"}</Link></p>
            </>}
            {message && <div role="status" className="mt-6 border-l-2 border-primary bg-accent p-4 text-sm leading-6 text-accent-foreground"><p>{message}</p>{completed && <Button asChild variant="link" className="mt-2 h-auto p-0"><Link to="/app">Buka dashboard demo<ArrowRight /></Link></Button>}</div>}
            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">Hanya simulasi. Email, kata sandi, dan profil tidak disimpan.</p>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 GRAZU-AI</p>
        </section>
        <aside className="hidden p-5 lg:flex" aria-label="Tata kelola AI yang bertanggung jawab">
          <div className="flex w-full flex-col items-center justify-center rounded-lg bg-accent px-8 py-12">
            <p className="text-xs font-semibold text-primary">TRANSPARAN · AMAN · BERTANGGUNG JAWAB</p>
            <img src={governance} alt="Tim profesional meninjau checklist keamanan dan tata kelola AI" width={1024} height={1024} className="my-8 aspect-square w-full max-w-[480px] rounded-lg object-contain" />
            <div className="max-w-sm text-center"><h2 className="text-2xl font-semibold leading-snug">Kepercayaan dimulai dari tata kelola yang baik.</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">Bersama membangun ekosistem kecerdasan artifisial Indonesia yang tepercaya dan berkelanjutan.</p></div>
            <div className="mt-8 h-1 w-8 rounded-full bg-primary" aria-hidden="true" />
          </div>
        </aside>
      </div>
    </main>
  );
}