import { describe, expect, it } from "vitest";
import { canAccessDemoRoute, demoRoleIds } from "@/lib/demo-roles";
import { navigationItems } from "@/lib/grazu-navigation";

describe("demo role permissions", () => {
  it("provides the three requested roles", () => {
    expect(demoRoleIds).toEqual(["superadmin", "admin", "client"]);
  });
  it.each(navigationItems.filter((i) => i.path !== "/app/organization"))("allows superadmin access to $path", ({ path }) => {
    expect(canAccessDemoRoute("superadmin", path)).toBe(true);
  });
  it("restricts critical settings to superadmin, including nested paths", () => {
    for (const path of ["/app/settings", "/app/settings/critical", "/app/settings/"]) {
      expect(canAccessDemoRoute("superadmin", path)).toBe(true);
      expect(canAccessDemoRoute("admin", path)).toBe(false);
      expect(canAccessDemoRoute("client", path)).toBe(false);
    }
  });
  it("limits Customer Service inbox to admin and superadmin", () => {
    expect(canAccessDemoRoute("superadmin", "/app/support/inbox")).toBe(true);
    expect(canAccessDemoRoute("admin", "/app/support/inbox")).toBe(true);
    expect(canAccessDemoRoute("client", "/app/support/inbox")).toBe(false);
    expect(canAccessDemoRoute("client", "/app/support/inbox/conversation-1")).toBe(false);
  });
  it.each(["/app", "/app/reviews", "/app/reports", "/app/risk", "/app/compliance", "/app/assistant"])("allows operator workflow %s", (path) => {
    expect(canAccessDemoRoute("admin", path)).toBe(true);
  });
  it.each(["/app/use-cases/new", "/app/use-cases/UC-001", "/app/risk", "/app/ethics", "/app/red-teaming/runs/run-1", "/app/devsecops/repositories/repo-001", "/app/compliance/assessments/assessment-1", "/app/analytics/adoption", "/app/assistant", "/app/reports"])("allows client workflow %s", (path) => {
    expect(canAccessDemoRoute("client", path)).toBe(true);
  });
  it.each(["/app/reviews", "/app/policy", "/app/analytics/geospatial", "/app/analytics/forecast"])("hides platform-wide module %s from clients", (path) => {
    expect(canAccessDemoRoute("client", path)).toBe(false);
  });
  it("keeps guest pages separate from role simulation", () => {
    for (const role of demoRoleIds) {
      for (const path of ["/", "/explore", "/knowledge", "/signin", "/signup"]) {
        expect(canAccessDemoRoute(role, path)).toBe(true);
      }
    }
  });
  it("does not grant unknown app modules access", () => {
    for (const role of demoRoleIds) expect(canAccessDemoRoute(role, "/app/unknown")).toBe(false);
  });
});