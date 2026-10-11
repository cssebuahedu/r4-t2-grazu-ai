import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ChatArea, ContextPanel, ConversationList } from "@/components/grazu/assistant";
import { pageHead } from "@/lib/grazu-navigation";

export const Route = createFileRoute("/app/assistant")({
  head: () => pageHead("GRAZU AI Assistant", "Asisten konsultasi tata kelola, keamanan, dan regulasi kecerdasan artifisial."),
  component: AssistantPage,
});

function AssistantPage() {
  const [ctxOpen, setCtxOpen] = useState(true);
  const [history, setHistory] = useState(false);
  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[520px] overflow-hidden rounded-md border bg-card">
      <aside className="hidden w-64 shrink-0 border-r lg:block"><ConversationList /></aside>
      <Sheet open={history} onOpenChange={setHistory}>
        <SheetContent side="left" className="w-[290px] bg-card p-0">
          <SheetTitle className="sr-only">Riwayat percakapan</SheetTitle>
          <SheetDescription className="sr-only">Pilih atau kelola percakapan</SheetDescription>
          <ConversationList onPick={() => setHistory(false)} />
        </SheetContent>
      </Sheet>
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3 md:px-6">
          <div className="min-w-0">
            <h1 className="text-base font-semibold">GRAZU AI Assistant</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">Asisten konsultasi tata kelola, keamanan, dan regulasi kecerdasan artifisial.</p>
            <span className="mt-2 inline-block rounded border border-primary/20 bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">MODE DEMO — Respons chatbot merupakan simulasi.</span>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Riwayat percakapan" onClick={() => setHistory(true)}><History size={17} /></Button>
            <Button variant="ghost" size="icon" aria-label={ctxOpen ? "Tutup konteks akun" : "Buka konteks akun"} onClick={() => setCtxOpen(!ctxOpen)}>{ctxOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}</Button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          <ChatArea />
          {ctxOpen && <aside className="hidden w-60 shrink-0 overflow-y-auto border-l p-4 md:block"><ContextPanel /></aside>}
        </div>
        {ctxOpen && <div className="border-t p-4 md:hidden"><ContextPanel /></div>}
      </section>
    </div>
  );
}
