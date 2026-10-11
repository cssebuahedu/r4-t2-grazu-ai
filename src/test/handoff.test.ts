import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { assistantActions, getAssistantState, resetAssistantState, returnToAiNotice, takeoverNotice, type AssistantContext } from "@/lib/assistant";
import { useUseCases } from "@/lib/use-cases";

const product = renderHook(() => useUseCases()).result.current[0]!;
const ctx: AssistantContext = { product, findings: [] };
const conv = (id: string) => getAssistantState().conversations.find((c) => c.id === id)!;

describe("AI-to-human handoff", () => {
  beforeEach(() => { vi.useFakeTimers(); resetAssistantState(); });
  afterEach(() => vi.useRealTimers());

  it("runs the full demo flow", () => {
    assistantActions.newConversation();
    assistantActions.send("Apa saja sembilan nilai etika AI?", ctx);
    const id = getAssistantState().activeId!;
    vi.advanceTimersByTime(800);
    expect(conv(id).messages.at(-1)!.senderType).toBe("ai");
    expect(getAssistantState().notifications.filter((n) => n.conversationId === id && !n.read)).toHaveLength(1);

    assistantActions.markRead(id);
    assistantActions.takeOver(id);
    expect(conv(id).status).toBe("HUMAN_ACTIVE");
    expect(conv(id).messages.at(-1)!.content).toBe(takeoverNotice("Ayulia Ningsih"));

    assistantActions.send("Halo CS", ctx);
    vi.advanceTimersByTime(800);
    expect(conv(id).messages.at(-1)!.senderType).toBe("client");
    assistantActions.csSend(id, "Halo, saya bantu", "cs-rizky"); // not assigned
    assistantActions.csSend(id, "Halo, saya bantu");
    expect(conv(id).messages.filter((m) => m.senderType === "cs")).toHaveLength(1);
    expect(getAssistantState().notifications.filter((n) => n.conversationId === id && n.type === "new")).toHaveLength(1);

    assistantActions.endCs(id);
    expect(conv(id).status).toBe("AI_ACTIVE");
    expect(conv(id).assignedCsId).toBe("cs-ayulia");
    expect(conv(id).messages.at(-1)!.content).toBe(returnToAiNotice);

    assistantActions.send("Apa itu risiko?", ctx);
    vi.advanceTimersByTime(800);
    expect(conv(id).messages.at(-1)!.senderType).toBe("ai");
  });

  it("drops a pending AI reply when CS takes over", () => {
    assistantActions.select("c1");
    assistantActions.send("Apa itu risiko?", ctx);
    assistantActions.takeOver("c1");
    vi.advanceTimersByTime(800);
    expect(conv("c1").messages.filter((m) => m.senderType === "ai")).toHaveLength(1);
    expect(getAssistantState().pending).toBeNull();
  });
});
