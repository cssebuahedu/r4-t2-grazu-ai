import { beforeEach, describe, expect, it, vi } from "vitest";
import { assistantActions, getAssistantState, resetAssistantState } from "@/lib/assistant";

describe("guest chat", () => {
  beforeEach(() => { vi.useFakeTimers(); resetAssistantState(); });
  it("creates Guest-001 as guest, AI_ACTIVE, with one notification", () => {
    assistantActions.guestSend("Halo");
    assistantActions.guestSend("Lagi");
    const s = getAssistantState();
    const c = s.conversations.find((x) => x.id === s.guestId)!;
    expect(c.participantId).toBe("Guest-001");
    expect(c.participantType).toBe("guest");
    expect(c.status).toBe("AI_ACTIVE");
    expect(s.notifications.filter((n) => n.conversationId === c.id && n.type === "new")).toHaveLength(1);
  });
  it("AI stays silent while HUMAN_ACTIVE and resumes after handback", () => {
    assistantActions.guestSend("Halo"); vi.runAllTimers();
    const id = getAssistantState().guestId!;
    assistantActions.takeOver(id);
    assistantActions.guestSend("Tolong"); vi.runAllTimers();
    const c = () => getAssistantState().conversations.find((x) => x.id === id)!;
    expect(c().messages.at(-1)!.senderType).toBe("guest");
    assistantActions.endCs(id);
    assistantActions.guestSend("Lagi"); vi.runAllTimers();
    expect(c().messages.at(-1)!.senderType).toBe("ai");
  });
});
