import { useState, useRef, useEffect } from "react";
import { Settings, Moon, Sun, Bell, BellOff, Database, X, CloudUpload, CloudDownload } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentAdminPanel } from "./ContentAdminPanel";
import { Category, Video, ContentItem } from "@/types/dashboard";
import { fetchZoneData, saveZoneData } from "@/utils/zoneApi";
import { getSyncKey } from "@/utils/syncKey";
import { toast } from "sonner";

interface SettingsPanelProps {
  isAdmin: boolean;
  categories: Category[];
  videos: Video[];
  contents: ContentItem[];
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateVideos: (videos: Video[]) => void;
  onUpdateContents: (contents: ContentItem[]) => void;
}

export function SettingsPanel({
  isAdmin,
  categories,
  videos,
  contents,
  onUpdateCategories,
  onUpdateVideos,
  onUpdateContents,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  // Sync to cloud (Supabase via backend)
  const handleSyncToCloud = async () => {
    const key = getSyncKey()?.trim() || undefined;
    const result = await saveZoneData({ categories, videos, contents }, key);
    if (result.ok) {
      toast.success("Data synced to cloud!");
    } else {
      toast.error(result.error || "Failed to sync data");
    }
  };

  // Load from cloud
  const handleLoadFromCloud = async () => {
    setIsSyncing(true);
    try {
      const key = getSyncKey()?.trim() || undefined;
      const data = await fetchZoneData(key);
      if (data) {
        if (Array.isArray(data.categories)) onUpdateCategories(data.categories);
        if (Array.isArray(data.videos)) onUpdateVideos(data.videos);
        if (Array.isArray(data.contents)) onUpdateContents(data.contents);
        toast.success("Data loaded from cloud!");
      } else {
        toast.error("No saved data found in cloud.");
      }
    } catch (error) {
      toast.error("Error loading data");
    }
    setIsSyncing(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
        className="p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <Settings className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-90")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-72 bg-card border border-border rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Settings</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Customize your experience
            </p>
          </div>

          <div className="p-3 space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm text-foreground">
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
              <div
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  isDarkMode ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform",
                    isDarkMode ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </div>
            </button>

            {/* Admin Only: Developer Tools */}
            {isAdmin && (
              <>
                <div className="border-t border-border my-2" />
                <div className="px-3 py-1">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Developer Tools
                  </p>
                </div>
                
                {/* Sync to Cloud */}
                <button
                  onClick={handleSyncToCloud}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <CloudUpload className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">Sync to Cloud</span>
                </button>

                {/* Load from Cloud */}
                <button
                  onClick={handleLoadFromCloud}
                  disabled={isSyncing}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <CloudDownload className={cn("w-4 h-4 text-primary", isSyncing && "animate-pulse")} />
                  <span className="text-sm text-foreground">
                    {isSyncing ? "Loading..." : "Load from Cloud"}
                  </span>
                </button>

                {/* Manage Content */}
                <button
                  onClick={() => {
                    setShowAdminPanel(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">Manage Content</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Admin Panel Modal - Properly Centered */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 md:p-10">
          <div className="relative w-full max-w-5xl h-fit max-h-[90vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-20">
              <h2 className="text-xl font-bold text-foreground">Content Management</h2>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <ContentAdminPanel
                contents={contents}
                categories={categories}
                videos={videos}
                onUpdateContents={onUpdateContents}
                onUpdateCategories={onUpdateCategories}
                onUpdateVideos={onUpdateVideos}
                onClose={() => setShowAdminPanel(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
