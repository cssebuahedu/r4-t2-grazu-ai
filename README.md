# R4 - GRAZU AI Foundation

Build the initial frontend foundation for **GRAZU-AI**, an Indonesian AI Governance and Responsible AI Monitoring platform.

**IMPORTANT: This is PHASE 1 ONLY. Prioritize a working, visually polished application skeleton. Do not build complete features yet. Keep implementation lightweight to minimize Lovable credits.**

### 1. Tech Stack
- React + TypeScript + Tailwind CSS.
- Use shadcn/ui components and React Router if already available.
- Frontend only, no backend, Supabase, database, authentication, API integrations, or AI features.
- Use minimal hardcoded mock data.

### 2. Design System
Create a premium, modern, minimalist enterprise SaaS UI.

Primary colors:
- Teal: `#0F766E` (primary buttons and active navigation)
- Cyan: `#0891B2` (links and highlights)
- Sky: `#0284C7` (subtle informational accents)
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Text: `#0F172A`
- Border: `#E2E8F0`

Design requirements:
- Professional government-grade dashboard aesthetic.
- Clean typography using Inter.
- Minimal icons; use icons only for sidebar navigation and essential controls.
- Avoid excessive gradients, glassmorphism, glowing elements, generic AI illustrations, and decorative cards.
- Use subtle borders, generous whitespace, consistent spacing, and simple data tables.
- Responsive desktop and mobile layouts.
- All UI labels must use Bahasa Indonesia.

### 3. Pages to Build NOW

**A. Landing Page (`/`)**
- Simple top navigation with GRAZU-AI branding, "Beranda", "Tentang Platform", and "Masuk".
- Clean hero section:
  Title: "Tata Kelola Kecerdasan Artifisial yang Bertanggung Jawab"
  Subtitle: "Platform terpadu untuk pemantauan adopsi, evaluasi risiko, keamanan, dan kepatuhan kecerdasan artifisial di Indonesia."
- Primary CTA: "Buka Dashboard" linking to `/app`.
- Three simple text-based feature sections: Tata Kelola AI, Keamanan AI, and Analitik Nasional.
- Minimal footer.

**B. Dashboard (`/app`)**
Build an enterprise dashboard application shell with:
- Fixed left sidebar.
- Topbar with breadcrumb, search placeholder, notification button, and demo user avatar.
- Page title and subtitle.
- Four simple KPI cards with mock values:
  - Total Use Case AI
  - Organisasi Terdaftar
  - Assessment Risiko
  - Temuan Keamanan
- One simple "Use Case Terbaru" table with 5 mock rows.
- One "Aktivitas Terbaru" section.

**C. Placeholder Pages**
All sidebar links must navigate to valid routes. Each placeholder page only needs:
- Page title.
- Short description.
- A simple "Fitur dalam tahap pengembangan" empty state.
- Consistent dashboard layout.

### 4. Sidebar Navigation

Group navigation as follows:

**Utama**
- Dashboard → `/app`
- Registrasi Use Case → `/app/use-cases`

**Assessment & Security**
- Penilaian Risiko → `/app/risk`
- Etika AI → `/app/ethics`
- AI Red Teaming → `/app/red-teaming`
- AI DevSecOps → `/app/devsecops`
- Kepatuhan Regulasi → `/app/compliance`

**Analitik & Kebijakan**
- Analitik Adopsi → `/app/analytics/adoption`
- Peta Geospasial → `/app/analytics/geospatial`
- Prediksi Adopsi → `/app/analytics/forecast`
- Rekomendasi Kebijakan → `/app/policy`

**Layanan**
- GRAZU AI Assistant → `/app/assistant`
- Review & Audit → `/app/reviews`
- Laporan → `/app/reports`
- Pengaturan → `/app/settings`

Use compact navigation groups, subtle active states, and minimal icons. Sidebar must be collapsible on desktop and use a drawer on mobile.

### 5. Interaction Requirements
- Landing page CTA navigates to Dashboard.
- All sidebar links work.
- Active sidebar item is highlighted.
- Sidebar collapse and mobile drawer work.
- Dashboard uses consistent static demo data.
- No real login or authentication.
- Display a small "MODE DEMO" label in the application topbar.
- Do not create complex forms, charts, modals, API calls, or backend services.

### 6. Critical Scope Restriction
DO NOT implement actual risk assessments, red teaming, CI/CD scanning, AI chat, geospatial maps, authentication, database tables, or compliance evaluation in this phase.

Only build the visual foundation, routing, shared layout, dashboard overview, and lightweight placeholder pages.

Keep code modular and easy to extend in later phases.

**SUCCESS CRITERIA:**
1. Landing page looks professional.
2. Dashboard layout is polished and responsive.
3. All 15 sidebar routes work.
4. Colors and typography are consistent.
5. No broken navigation.
6. No unnecessary features or dependencies.
7. Application builds successfully.

Focus on completing this small foundation before implementing anything else.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor]

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
