import { beforeEach, describe, expect, it } from "vitest";
import { getOrganizationState, organizationActions, resetOrganization, validateAccount, validateOrg } from "@/lib/organization";
import { demoClientOrg } from "@/lib/assistant";
import { canAccessDemoRoute } from "@/lib/demo-roles";

const org = { name: "Dinas Digital", type: "Pemerintah Daerah", sector: "Pemerintahan", province: "Jawa Barat", city: "Bandung", website: "", description: "Dinas yang mengelola layanan digital daerah." };
describe("organization", () => {
  beforeEach(() => resetOrganization());
  it("rejects invalid account data", () => {
    const e = validateAccount({ name: "A", email: "x", phone: "123", position: "" });
    expect(Object.keys(e).sort()).toEqual(["email", "name", "phone", "position"]);
  });
  it("allows empty optional website but rejects malformed one", () => {
    expect(validateOrg(org)).toEqual({});
    expect(validateOrg({ ...org, website: "abc" }).website).toBeDefined();
  });
  it("renaming keeps products linked to the same organization key", () => {
    organizationActions.updateOrg(org);
    expect(getOrganizationState().org.key).toBe(demoClientOrg);
    expect(getOrganizationState().org.name).toBe("Dinas Digital");
  });
  it("organization and onboarding pages are client-only", () => {
    expect(canAccessDemoRoute("client", "/app/organization")).toBe(true);
    expect(canAccessDemoRoute("admin", "/app/organization")).toBe(false);
    expect(canAccessDemoRoute("superadmin", "/app/onboarding")).toBe(false);
  });
});
