import {
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  Scale,
  ScanLine,
  GitBranch,
  FileCheck,
  BarChart3,
  MapPin,
  TrendingUp,
  Landmark,
  MessagesSquare,
  ClipboardCheck,
  Files,
  Settings,
  Headset,
  Building2,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Utama",
    items: [
      {
        title: "Dashboard",
        path: "/app",
        icon: LayoutDashboard,
        description: "Ringkasan tata kelola dan pemantauan kecerdasan artifisial.",
      },
      {
        title: "Organisasi Saya",
        path: "/app/organization",
        icon: Building2,
        description: "Profil, anggota, dan use case AI organisasi Anda.",
      },
      {
        title: "Registrasi Use Case",
        path: "/app/use-cases",
        icon: ClipboardList,
        description: "Inventarisasi penerapan kecerdasan artifisial di organisasi.",
      },
    ],
  },
  {
    label: "Assessment & Security",
    items: [
      {
        title: "Penilaian Risiko",
        path: "/app/risk",
        icon: ShieldCheck,
        description: "Penilaian dan pemantauan risiko penerapan kecerdasan artifisial.",
      },
      {
        title: "Etika AI",
        path: "/app/ethics",
        icon: Scale,
        description: "Tinjauan prinsip etika dan tanggung jawab dalam penerapan AI.",
      },
      {
        title: "AI Red Teaming",
        path: "/app/red-teaming",
        icon: ScanLine,
        description: "Evaluasi ketahanan dan keamanan sistem kecerdasan artifisial.",
      },
      {
        title: "AI DevSecOps",
        path: "/app/devsecops",
        icon: GitBranch,
        description: "Pemantauan keamanan dalam siklus pengembangan sistem AI.",
      },
      {
        title: "Kepatuhan Regulasi",
        path: "/app/compliance",
        icon: FileCheck,
        description: "Tinjauan kesesuaian penerapan AI dengan regulasi yang berlaku.",
      },
    ],
  },
  {
    label: "Analitik & Kebijakan",
    items: [
      {
        title: "Analitik Adopsi",
        path: "/app/analytics/adoption",
        icon: BarChart3,
        description: "Gambaran adopsi kecerdasan artifisial lintas sektor di Indonesia.",
      },
      {
        title: "Peta Geospasial",
        path: "/app/analytics/geospatial",
        icon: MapPin,
        description: "Distribusi penerapan kecerdasan artifisial di wilayah Indonesia.",
      },
      {
        title: "Prediksi Adopsi",
        path: "/app/analytics/forecast",
        icon: TrendingUp,
        description: "Proyeksi tren adopsi kecerdasan artifisial nasional.",
      },
      {
        title: "Rekomendasi Kebijakan",
        path: "/app/policy",
        icon: Landmark,
        description: "Kajian kebijakan untuk ekosistem AI yang bertanggung jawab.",
      },
    ],
  },
  {
    label: "Layanan",
    items: [
      {
        title: "GRAZU AI Assistant",
        path: "/app/assistant",
        icon: MessagesSquare,
        description: "Pendamping tata kelola kecerdasan artifisial organisasi.",
      },
      {
        title: "Layanan Pelanggan",
        path: "/app/support/inbox",
        icon: Headset,
        description: "Kelola percakapan pengguna dan bantuan langsung oleh Customer Service.",
      },
      {
        title: "Review & Audit",
        path: "/app/reviews",
        icon: ClipboardCheck,
        description: "Tinjauan dan audit penerapan kecerdasan artifisial.",
      },
      {
        title: "Laporan",
        path: "/app/reports",
        icon: Files,
        description: "Ringkasan pelaporan tata kelola dan pemantauan AI.",
      },
      {
        title: "Pengaturan",
        path: "/app/settings",
        icon: Settings,
        description: "Pengaturan platform dan preferensi organisasi.",
      },
    ],
  },
] as const;
export const navigationItems = navigationGroups.flatMap((group) => [...group.items]);
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | GRAZU-AI` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | GRAZU-AI` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
