import { useState } from "react";
import { Plus, Trash2, Edit, Save, CloudUpload, CloudDownload, Link, Copy, Check } from "lucide-react";
import { Category, Video } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";
import { fetchZoneData, saveZoneData } from "@/utils/zoneApi";
import { getSyncKey, saveSyncKey } from "@/utils/syncKey";

interface AdminPanelProps {
  categories: Category[];
  videos: Video[];
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateVideos: (videos: Video[]) => void;
  onClose: () => void;
}

export function AdminPanel({
  categories,
  videos,
  onUpdateCategories,
  onUpdateVideos,
  onClose,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"videos" | "categories" | "sync">("videos");
  const [gistUrl, setGistUrl] = useState(getSyncKey() || "");
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Video form state
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    categoryId: "",
  });

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.videoUrl || !newVideo.categoryId) {
      toast({
        title: "Missing Fields",
        description: "Please fill in title, video URL, and select a category.",
        variant: "destructive",
      });
      return;
    }

    const videoId = `video-${Date.now()}`;
    const thumbnail = newVideo.videoUrl.includes("youtube.com")
      ? `https://img.youtube.com/vi/${newVideo.videoUrl.split("v=")[1]?.split("&")[0]}/maxresdefault.jpg`
      : "https://via.placeholder.com/640x360";

    const video: Video = {
      id: videoId,
      title: newVideo.title,
      description: newVideo.description,
      thumbnail,
      videoUrl: newVideo.videoUrl,
      duration: newVideo.duration || "00:00",
      categoryId: newVideo.categoryId,
      watched: false,
      createdAt: new Date().toISOString().split("T")[0],
    };

    onUpdateVideos([...videos, video]);
    setNewVideo({ title: "", description: "", videoUrl: "", duration: "", categoryId: "" });
    toast({
      title: "Video Added",
      description: `"${video.title}" has been added successfully.`,
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    onUpdateVideos(videos.filter((v) => v.id !== videoId));
    toast({
      title: "Video Deleted",
      description: "The video has been removed.",
    });
  };

  const handleSaveGistUrl = () => {
    saveSyncKey(gistUrl.trim());
    toast({
      title: "Gist URL Saved",
      description: "Your GitHub Gist URL has been saved locally.",
    });
  };

  const handleSyncFromCloud = async () => {
    if (!gistUrl) {
      toast({
        title: "No Gist URL",
        description: "Please enter a GitHub Gist raw URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    const data = await fetchZoneData(gistUrl.trim());
    setIsSyncing(false);

    if (data) {
      if (Array.isArray(data.categories)) onUpdateCategories(data.categories);
      if (Array.isArray(data.videos)) onUpdateVideos(data.videos);
      toast({
        title: "Sync Complete",
        description: "Content has been synced from your Gist.",
      });
    } else {
      toast({
        title: "Sync Failed",
        description: "Could not fetch data from the Gist URL.",
        variant: "destructive",
      });
    }
  };

  const handleCopyForGist = async () => {
    const content = JSON.stringify({ categories, videos }, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to Clipboard",
      description: "Paste this content into your GitHub Gist file.",
    });
    const key = gistUrl.trim() || getSyncKey()?.trim() || undefined;
    const result = await saveZoneData({ categories, videos }, key);
    if (!result.ok) {
      toast({
        title: "Sync Failed",
        description: result.error || "Failed to sync to cloud.",
        variant: "destructive",
      });
    }
  };

  const allSubcategories = categories.flatMap((cat) =>
    cat.children?.map((child) => ({
      id: child.id,
      name: `${cat.name} > ${child.name}`,
    })) || []
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Content Management</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {["videos", "categories", "sync"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Videos Tab */}
      {activeTab === "videos" && (
        <div className="space-y-6">
          {/* Add Video Form */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Video
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Video Title"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Video URL (YouTube)"
                value={newVideo.videoUrl}
                onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Duration (e.g., 45:30)"
                value={newVideo.duration}
                onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={newVideo.categoryId}
                onChange={(e) => setNewVideo({ ...newVideo, categoryId: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Category</option>
                {allSubcategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                className="w-full md:col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
              />
            </div>
            <button
              onClick={handleAddVideo}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Video
            </button>
          </div>

          {/* Video List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Current Videos ({videos.length})</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.categoryId}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-2 hover:bg-destructive/20 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Categories are pre-configured. To modify categories, update the Gist file and sync.
          </p>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 rounded-lg border border-border">
                <p className="font-medium text-foreground">{cat.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cat.children?.map((child) => (
                    <span
                      key={child.id}
                      className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground"
                    >
                      {child.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Tab */}
      {activeTab === "sync" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Link className="w-4 h-4" /> GitHub Gist URL
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Create a Gist at gist.github.com, add a file named{" "}
              <code className="bg-muted px-1 rounded">dashboard-data.json</code>, then paste the{" "}
              <strong>Raw URL</strong> below.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://gist.githubusercontent.com/..."
                value={gistUrl}
                onChange={(e) => setGistUrl(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSaveGistUrl}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSyncFromCloud}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors disabled:opacity-50"
            >
              <CloudDownload className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">
                {isSyncing ? "Syncing..." : "Sync from Gist"}
              </span>
            </button>
            <button
              onClick={handleCopyForGist}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-primary" />
              )}
              <span className="font-medium text-foreground">
                {copied ? "Copied!" : "Copy for Gist"}
              </span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <h4 className="font-semibold text-foreground mb-2">How to use GitHub Gist:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to <span className="text-primary">gist.github.com</span></li>
              <li>Create a new Gist with a file named <code className="bg-muted px-1 rounded">dashboard-data.json</code></li>
              <li>Click "Copy for Gist" above to get your current content</li>
              <li>Paste it into the Gist file and save</li>
              <li>Click "Raw" button on the Gist file to get the raw URL</li>
              <li>Paste that URL above and click "Save"</li>
              <li>Use "Sync from Gist" to load content anytime</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
