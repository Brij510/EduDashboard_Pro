import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationPanelProps {
  isAdmin: boolean;
  totalVideos: number;
  watchedVideos: number;
  hasSearchQuery: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
}

const getStorageKey = (isAdmin: boolean) =>
  isAdmin
    ? "edudashboard-read-notifications-admin"
    : "edudashboard-read-notifications-visitor";

export function NotificationPanel({
  isAdmin,
  totalVideos,
  watchedVideos,
  hasSearchQuery,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo<NotificationItem[]>(() => {
    const pending = Math.max(totalVideos - watchedVideos, 0);
    const base: NotificationItem[] = [
      {
        id: "tip-search",
        title: "Search shortcuts",
        body: "Use the search bar to jump directly to matching content folders.",
        time: "Just now",
      },
      {
        id: "tip-progress",
        title: "Progress update",
        body: `${watchedVideos} completed, ${pending} in progress.`,
        time: "Today",
      },
    ];

    if (hasSearchQuery) {
      base.unshift({
        id: "search-active",
        title: "Search is active",
        body: "Select a result from dropdown to open the exact folder quickly.",
        time: "Now",
      });
    }

    if (isAdmin) {
      base.unshift({
        id: "admin-export",
        title: "Remember to export",
        body: "After content edits, download folder-structure.json and commit it.",
        time: "Important",
      });
      base.unshift({
        id: "admin-status",
        title: "Developer mode enabled",
        body: `${totalVideos} resources currently available in the dashboard.`,
        time: "Session",
      });
    } else {
      base.unshift({
        id: "visitor-welcome",
        title: "Welcome back",
        body: "Use folders in the main area and Exit Folder to navigate faster.",
        time: "Session",
      });
    }

    return base;
  }, [hasSearchQuery, isAdmin, totalVideos, watchedVideos]);

  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(isAdmin));
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setReadIds(parsed.filter((value) => typeof value === "string"));
      }
    } catch {
      setReadIds([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(isAdmin), JSON.stringify(readIds));
  }, [isAdmin, readIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const markAllRead = () => {
    setReadIds(notifications.map((item) => item.id));
  };

  const resetNotifications = () => {
    setReadIds([]);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="p-2 hover:bg-muted rounded-lg transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[320px] max-w-[92vw] bg-card border border-border rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount} unread
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllRead}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={resetNotifications}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Reset notifications"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {notifications.map((item) => {
              const isRead = readIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-lg px-3 py-2.5 mb-1 border transition-colors",
                    isRead
                      ? "bg-muted/25 border-border"
                      : "bg-primary/5 border-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
