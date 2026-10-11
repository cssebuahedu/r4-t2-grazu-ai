import { describe, expect, it } from "vitest";
import { integrationStatus, parseRepoUrl, useRepos } from "@/lib/devsecops";
import { demoWorkflowYaml } from "@/components/grazu/github-integration";
import type { Repository } from "@/lib/devsecops";

const repo: Repository = { id: "repo-x", name: "app", url: "https://github.com/acme/app", org: "O", productId: "UC-001", branch: "main", profile: "Basic", lastScan: "—", scanStatus: "Belum dipindai", scanners: ["gitleaks"] };
describe("github integration demo", () => {
  it("parses owner and name from a repository URL", () => expect(parseRepoUrl("https://github.com/acme/app.git")).toEqual({ owner: "acme", name: "app" }));
  it("reports configuration completeness, never a connection", () => {
    expect(integrationStatus(repo)).toBe("Konfigurasi Demo Lengkap");
    expect(integrationStatus({ ...repo, scanners: [] })).toBe("Belum Dikonfigurasi");
  });
  it("demo YAML is labeled nonfunctional and contains no URLs or secrets", () => {
    const y = demoWorkflowYaml(repo);
    expect(y).toContain("Template demonstrasi — belum dapat dijalankan.");
    expect(y).not.toMatch(/https?:\/\//);
    expect(y).not.toMatch(/\$\{\{\s*secrets/);
  });
});
void useRepos;
