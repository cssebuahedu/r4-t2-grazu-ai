import { createContext, useContext, useState, type ReactNode } from "react";
import { navigationItems } from "./grazu-navigation";

// Presentation permissions only: never use these rules as real authorization.
export const demoRoles = {
  superadmin: { label: "Administrator Utama", initials: "AU" },
  admin: { label: "Operator Layanan", initials: "OL" },
  client: { label: "Perwakilan Organisasi", initials: "PO" },
} as const;
export type DemoRole = keyof typeof demoRoles;
export const demoRoleIds: DemoRole[] = ["superadmin", "admin", "client"];

const clientModules = new Set([
  "/app", "/app/use-cases", "/app/risk", "/app/ethics",
  "/app/red-teaming", "/app/devsecops", "/app/compliance",
  "/app/analytics/adoption", "/app/assistant", "/app/reports", "/app/organization",
]);

export function isDemoRole(value: string): value is DemoRole {
  return demoRoleIds.some((role) => role === value);
}

export function canAccessDemoRoute(role: DemoRole, pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path !== "/app" && !path.startsWith("/app/")) return true;
  if (path === "/app/ai-consultation") return true; // Compatibility redirect.
  // Client-only onboarding and organization pages (organization data belongs to the client role).
  if (path === "/app/onboarding" || path === "/app/organization") return role === "client";
  const module = [...navigationItems]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => path === item.path || (item.path !== "/app" && path.startsWith(item.path + "/")));
  if (!module) return false;
  if (role === "superadmin") return true;
  if (role === "admin") return module.path !== "/app/settings";
  return clientModules.has(module.path);
}

const DemoRoleContext = createContext<{
  role: DemoRole;
  setRole: (role: DemoRole) => void;
} | null>(null);

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<DemoRole>("superadmin");
  return <DemoRoleContext.Provider value={{ role, setRole }}>{children}</DemoRoleContext.Provider>;
}

export function useDemoRole() {
  const context = useContext(DemoRoleContext);
  if (!context) throw new Error("Pilihan peran demo tidak tersedia.");
  return context;
}