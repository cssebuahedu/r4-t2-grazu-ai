import { beforeEach, describe, expect, it, vi } from "vitest";
import { assistantActions, getAssistantState, guestRespond, reopenNotice, resetAssistantState } from "@/lib/assistant";

const ctx = { findings: [] };
const cur = () => getAssistantState().conversations.find((c) => c.id === getAssistantState().activeId)!;
const count = (t: string) => cur().messages.filter((m) => m.senderType === t).length;

describe("end-to-end demo chat lifecycle", () => {
  beforeEach(() => { vi.useFakeTimers(); resetAssistantState(); assistantActions.newConversation(); });

  it("runs client → AI → CS → AI → close → reopen without duplicate replies", () => {
    const before = getAssistantState().conversations.length;
    assistantActions.send("Apa saja sembilan nilai etika AI di Indonesia?", ctx);
    vi.advanceTimersByTime(800);
    const id = cur().id;
    expect(getAssistantState().conversations.length).toBe(before + 1);
    expect(count("ai")).toBe(1);
    expect(getAssistantState().notifications.filter((n) => n.conversationId === id && n.type === "new")).toHaveLength(1);

    expect(assistantActions.assign(id, "cs-ayulia")).toBe(true);
    assistantActions.takeOver(id, "cs-ayulia");
    expect(cur().status).toBe("HUMAN_ACTIVE");

    assistantActions.send("Saya butuh bantuan petugas", ctx);
    vi.advanceTimersByTime(800);
    expect(count("ai")).toBe(1);

    assistantActions.csSend(id, "Bukan CS yang ditugaskan", "cs-rina");
    assistantActions.csSend(id, "Halo, saya bantu", "cs-ayulia");
    expect(count("cs")).toBe(1);

    assistantActions.endCs(id, "cs-ayulia");
    expect(cur().status).toBe("AI_ACTIVE");
    assistantActions.send("Bagaimana cara mendaftarkan use case AI?", ctx);
    vi.advanceTimersByTime(800);
    expect(count("ai")).toBe(2);

    assistantActions.close(id);
    assistantActions.send("Masih ada?", ctx);
    expect(cur().messages.at(-1)!.senderType).toBe("system");

    const msgs = cur().messages.length;
    expect(assistantActions.reopen(id)).toBe(true);
    expect(assistantActions.reopen(id)).toBe(false);
    vi.advanceTimersByTime(2000);
    expect(cur().status).toBe("AI_ACTIVE");
    expect(cur().messages.length).toBe(msgs + 1);
    expect(cur().messages.at(-1)!.content).toBe(reopenNotice);

    expect(cur().events!.map((e) => e.type)).toEqual(["created", "assigned", "takeover", "cs_reply", "handback", "closed", "reopened"]);
  });

  it("takeover suppresses a pending AI reply", () => {
    assistantActions.send("Apa saja sembilan nilai etika AI di Indonesia?", ctx);
    const id = cur().id;
    assistantActions.takeOver(id, "cs-ayulia");
    vi.advanceTimersByTime(800);
    expect(count("ai")).toBe(0);
  });

  it("guest replies never mention client organization data", () => {
    expect(guestRespond("risiko produk saya")).not.toMatch(/Kementerian|UC-\d/);
  });
});
