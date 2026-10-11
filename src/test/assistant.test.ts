import { describe, expect, it } from "vitest";
import { noAssessmentReply, respond, unsupportedReply, type AssistantContext } from "@/lib/assistant";
import { useUseCases } from "@/lib/use-cases";
import { findings } from "@/lib/devsecops";
import { renderHook } from "@testing-library/react";
const product = renderHook(() => useUseCases()).result.current[0]!;
const ctx: AssistantContext = { product, findings: findings.filter((f) => f.repoId === "repo-001") };
describe("scripted assistant", () => {
  it("answers unsupported questions with the demo notice", () => expect(respond("cuaca hari ini?", ctx).text).toBe(unsupportedReply));
  it("says no assessment exists when none is available", () => expect(respond("Apa saja kontrol kepatuhan yang perlu diperbaiki?", ctx).text).toBe(noAssessmentReply));
  it("mentions the product's prompt injection finding", () => expect(respond("Bagaimana cara mengatasi prompt injection?", ctx).text).toContain("F-1001"));
  it("is deterministic", () => expect(respond("Apa saja sembilan nilai etika AI di Indonesia?", ctx)).toEqual(respond("Apa saja sembilan nilai etika AI di Indonesia?", ctx)));
});
import { assistantActions, conversationTitle, senderLabel, sessionStatus, useAssistant } from "@/lib/assistant";
describe("unified chat foundation", () => {
  it("derives a title of at most six words", () => expect(conversationTitle("  Bagaimana cara  mendaftarkan use case AI baru saya? ")).toBe("Bagaimana cara mendaftarkan use case AI"));
  it("labels AI and CS senders distinctly", () => {
    const base = { id: "x", conversationId: "c", senderId: "s", content: "", timestamp: "" };
    expect(senderLabel({ ...base, senderType: "ai", senderName: "AI Bot" })).toBe("GRAZU - AI Bot");
    expect(senderLabel({ ...base, senderType: "cs", senderName: "Ayulia Ningsih" })).toBe("GRAZU - CS Ayulia Ningsih");
    expect(senderLabel({ ...base, senderType: "client", senderName: "Anisa Putri" }, "cs")).toBe("Anisa Putri");
  });
  it("suppresses AI replies while a human CS is active", () => {
    assistantActions.select("c2");
    const store = renderHook(() => useAssistant());
    const before = store.result.current.conversations.find((c) => c.id === "c2")!;
    expect(sessionStatus(before)).toBe("Ditangani CS — Ayulia Ningsih");
    assistantActions.send("Halo", ctx);
    store.rerender();
    const after = store.result.current.conversations.find((c) => c.id === "c2")!;
    expect(after.messages.length).toBe(before.messages.length + 1);
    expect(store.result.current.pending).toBeNull();
  });
});
