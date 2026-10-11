import { beforeEach, describe, expect, it } from "vitest";
import { assistantActions, getAssistantState, resetAssistantState, visibleNotifications } from "@/lib/assistant";

const assigned = (cid: string) => getAssistantState().notifications.filter((n) => n.type === "assigned" && n.conversationId === cid);

describe("CS availability and assignment notifications", () => {
  beforeEach(() => resetAssistantState());

  it("rejects new assignment to a busy or offline CS", () => {
    assistantActions.setAvailability("cs-rina", "Offline");
    expect(assistantActions.assign("c1", "cs-rina")).toBe(false);
    expect(assistantActions.assign("c1", "cs-dimas")).toBe(false); // Sibuk by default
  });

  it("keeps existing assignment and status when availability changes", () => {
    assistantActions.assign("c1", "cs-rina");
    const before = getAssistantState().conversations.find((c) => c.id === "c1")!;
    assistantActions.setAvailability("cs-rina", "Offline");
    const after = getAssistantState().conversations.find((c) => c.id === "c1")!;
    expect(after.assignedCsId).toBe("cs-rina");
    expect(after.status).toBe(before.status);
  });

  it("creates one assignment notification per assignment event", () => {
    assistantActions.assign("c1", "cs-rina");
    assistantActions.assign("c1", "cs-rina");
    expect(assigned("c1")).toHaveLength(1);
    expect(assigned("c1")[0]!.targetCsId).toBe("cs-rina");
  });

  it("shows targeted notifications only to that CS and none to clients", () => {
    assistantActions.assign("c1", "cs-rina");
    const s = getAssistantState();
    expect(visibleNotifications({ ...s, actingCsId: "cs-ayulia" }, "admin").some((n) => n.type === "assigned")).toBe(false);
    expect(visibleNotifications({ ...s, actingCsId: "cs-rina" }, "admin").some((n) => n.type === "assigned")).toBe(true);
    expect(visibleNotifications(s, "client")).toHaveLength(0);
  });
});
