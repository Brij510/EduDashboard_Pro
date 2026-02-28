import { useState, useRef, useEffect } from "react";
import { Settings, Moon, Sun, Database, X, Download, MonitorSmartphone, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentAdminPanel } from "./ContentAdminPanel";
import { Category, Video, ContentItem } from "@/types/dashboard";
import { downloadFolderStructure } from "@/utils/zoneApi";
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
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("edudashboard-theme-mode");
    if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
      setThemeMode(savedTheme);
    } else {
      setThemeMode("system");
    }

    const savedMotion = localStorage.getItem("edudashboard-reduce-motion");
    setReduceMotion(savedMotion === "true");
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolved =
        themeMode === "system"
          ? prefersDark.matches
            ? "dark"
            : "light"
          : themeMode;

      document.documentElement.classList.remove("light", "dark");
      if (resolved === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.add("dark");
      }
    };

    const onMediaChange = () => {
      if (themeMode === "system") {
        applyTheme();
      }
    };

    applyTheme();
    localStorage.setItem("edudashboard-theme-mode", themeMode);
    prefersDark.addEventListener("change", onMediaChange);

    return () => {
      prefersDark.removeEventListener("change", onMediaChange);
    };
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
    localStorage.setItem("edudashboard-reduce-motion", String(reduceMotion));
  }, [reduceMotion]);

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

  const handleDownloadStructure = () => {
    const result = downloadFolderStructure({ categories, videos, contents });
    if (result.ok) {
      toast.success("Downloaded folder-structure.json");
    } else {
      toast.error(result.error || "Failed to download folder structure");
    }
  };

  const resetPreferences = () => {
    setThemeMode("system");
    setReduceMotion(false);
    localStorage.removeItem("edudashboard-theme-mode");
    localStorage.removeItem("edudashboard-reduce-motion");
    toast.success("Preferences reset to default");
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
              {isAdmin ? "Developer preferences and tools" : "Customize your learning workspace"}
            </p>
          </div>

          <div className="p-3 space-y-2">
            <div className="px-3 py-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Appearance
              </p>
            </div>

            {/* Theme Mode */}
            <button
              onClick={() =>
                setThemeMode((current) =>
                  current === "dark" ? "light" : current === "light" ? "system" : "dark"
                )
              }
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {themeMode === "dark" ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : themeMode === "light" ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <MonitorSmartphone className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm text-foreground">
                  Theme: {themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light"}
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => setReduceMotion((current) => !current)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Reduce Motion</span>
              </div>
              <div
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  reduceMotion ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform",
                    reduceMotion ? "translate-x-5" : "translate-x-0.5"
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
                
                {/* Download Folder Structure */}
                <button
                  onClick={handleDownloadStructure}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">Download Folder Structure</span>
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

            {!isAdmin && (
              <>
                <div className="border-t border-border my-2" />
                <div className="px-3 py-1">
                  <p className="text-xs text-muted-foreground">
                    Tip: Use folder buttons and <span className="font-medium text-foreground">Exit Folder</span> for faster navigation.
                  </p>
                </div>
              </>
            )}

            <div className="border-t border-border my-2" />
            <button
              onClick={resetPreferences}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Reset UI Preferences</span>
            </button>
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
