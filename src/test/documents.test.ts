import { beforeEach, describe, expect, it } from "vitest";
import { docPermissions, documentActions, getDocuments, resetDocuments, validateFile } from "@/lib/documents";

describe("proposal documents", () => {
  beforeEach(() => resetDocuments());
  it("accepts only PDF, DOCX, TXT up to 10 MB", () => {
    expect(validateFile("a.pdf", 1000)).toBeNull();
    expect(validateFile("a.DOCX", 10 * 1024 * 1024)).toBeNull();
    expect(validateFile("a.png", 1000)).not.toBeNull();
    expect(validateFile("a.txt", 10 * 1024 * 1024 + 1)).not.toBeNull();
  });
  it("keeps documents linked to their product through add, edit, delete", () => {
    const d = documentActions.add("UC-005", { title: "Proposal", description: "", category: "Proposal utama", fileName: "p.pdf", format: "PDF", size: 10 }, "Tester");
    expect(d.status).toBe("Diajukan");
    documentActions.update(d.id, { title: "Baru", description: "x", category: "Kebijakan privasi" });
    const u = getDocuments().find((x) => x.id === d.id)!;
    expect([u.productId, u.title, u.category]).toEqual(["UC-005", "Baru", "Kebijakan privasi"]);
    documentActions.remove(d.id);
    expect(getDocuments().some((x) => x.id === d.id)).toBe(false);
  });
  it("records review status changes with notes in the timeline", () => {
    documentActions.setStatus("DOC-001", "Perlu Perbaikan", "Admin", "Tambah lampiran");
    const d = getDocuments().find((x) => x.id === "DOC-001")!;
    expect(d.status).toBe("Perlu Perbaikan");
    expect(d.timeline.at(-1)).toMatchObject({ status: "Perlu Perbaikan", note: "Tambah lampiran" });
  });
  it("client manages only own org products; admin reviews but cannot manage", () => {
    expect(docPermissions("client", "Org A", "Org A")).toEqual({ view: true, manage: true, review: false });
    expect(docPermissions("client", "Org B", "Org A").view).toBe(false);
    expect(docPermissions("admin", "Org B", "Org A")).toEqual({ view: true, manage: false, review: true });
    expect(docPermissions("superadmin", "Org B", "Org A")).toEqual({ view: true, manage: true, review: true });
  });
});
