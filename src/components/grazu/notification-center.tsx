import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { assistantActions, formatTime, notificationLabels, useAssistant, visibleNotifications } from "@/lib/assistant";
import { useDemoRole } from "@/lib/demo-roles";

/** Demo notification center reading the shared assistant notification state; no real push service. */
export function NotificationCenter() {
  const { role } = useDemoRole();
  const s = useAssistant();
  if (role === "client") {
    return <Button variant="ghost" size="icon" title="Tidak ada notifikasi baru" aria-label="Notifikasi — tidak ada notifikasi baru"><Bell size={18} /></Button>;
  }
  const list = [...visibleNotifications(s, role)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
  const unread = list.filter((n) => !n.read);
  const title = (cid: string) => s.conversations.find((c) => c.id === cid)?.title ?? cid;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifikasi CS — ${unread.length} belum dibaca`}>
          <Bell size={18} />
          {unread.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{unread.length}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(360px,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">Notifikasi <span className="font-normal text-muted-foreground">· Demo</span></p>
          <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={!unread.length} onClick={() => assistantActions.markAllRead(unread.map((n) => n.id))}>Tandai semua dibaca</Button>
        </div>
        <ul className="max-h-96 divide-y overflow-y-auto">
          {!list.length && <li className="p-6 text-center text-xs text-muted-foreground">Belum ada notifikasi.</li>}
          {list.map((n) => (
            <li key={n.id} className={`px-3 py-2.5 text-xs ${n.read ? "" : "bg-accent/50"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-primary">{notificationLabels[n.type ?? "new"]}</span>
                <span className="text-[10px] text-muted-foreground">{formatTime(n.createdAt)} · {n.read ? "Dibaca" : "Belum dibaca"}</span>
              </div>
              <p className="mt-1 text-foreground">{n.text ?? `Percakapan “${title(n.conversationId)}”.`}</p>
              <div className="mt-1.5 flex gap-3">
                <Link to="/app/support/inbox" search={{ c: n.conversationId }} className="text-primary hover:underline" onClick={() => assistantActions.markNotificationRead(n.id)}>Buka percakapan</Link>
                {!n.read && <button type="button" className="text-muted-foreground hover:text-primary" onClick={() => assistantActions.markNotificationRead(n.id)}>Tandai dibaca</button>}
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
