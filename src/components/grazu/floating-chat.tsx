import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { demoCs, useAssistant } from "@/lib/assistant";
import { ChatArea, ProductSwitcher, SessionSelector } from "./assistant";

/** Single floating launcher for the app shell; opens the shared assistant drawer. */
export function AssistantLauncher() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const onAssistantPage = useRouterState({ select: (s) => s.location.pathname.startsWith("/app/assistant") });
  const { conversations, activeId } = useAssistant();
  const conv = conversations.find((c) => c.id === activeId);
  const cs = conv?.status === "HUMAN_ACTIVE" ? demoCs.find((c) => c.id === conv.assignedCsId) : undefined;
  if (onAssistantPage) return null; // The full page already hosts the chat.
  return (
    <>
      {!open && (
        <Button
          size="icon" aria-label="Buka GRAZU AI Assistant" title="Buka GRAZU AI Assistant" onClick={() => setOpen(true)}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 size-12 rounded-full shadow-md md:bottom-6 md:right-6"
        >
          <MessageCircle size={20} />
        </Button>
      )}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex h-[100dvh] w-full max-w-full flex-col gap-0 overflow-x-hidden bg-card p-0 sm:max-w-md">
          <div className="shrink-0 space-y-2 border-b p-4 pr-10">
            <SheetTitle className="text-sm">GRAZU AI Assistant</SheetTitle>
            <SheetDescription className="text-[11px]">MODE DEMO — Respons chatbot merupakan simulasi.</SheetDescription>
            <ProductSwitcher id="drawer-product" />
            <SessionSelector id="drawer-session" />
            <Button size="sm" variant="secondary" className="w-full text-xs" onClick={() => { setOpen(false); void navigate({ to: "/app/assistant" }); }}>Buka Assistant Lengkap</Button>
            <div className="rounded-md border bg-muted px-2.5 py-1.5 text-[11px]">
              <span className="text-muted-foreground">Penanganan: </span>
              <span className="font-semibold">{cs ? `GRAZU - CS ${cs.name}` : conv?.status === "CLOSED" ? "Percakapan Ditutup" : "GRAZU - AI Bot"}</span>
              {cs && <p className="mt-0.5 text-primary">Sedang ditangani Customer Service</p>}
            </div>
          </div>
          <ChatArea compact />
        </SheetContent>
      </Sheet>
    </>
  );
}
