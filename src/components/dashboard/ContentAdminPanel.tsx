import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  X, 
  Save, 
  CloudDownload, 
  Copy, 
  Check, 
  FolderPlus,
  Video,
  FileText,
  Edit3,
  Trash2,
  Folder,
  Database,
  CloudUpload
} from "lucide-react";
import { ContentItem, Category, Video as VideoType } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";
import { fetchZoneData, saveZoneData } from "@/utils/zoneApi";
import { getSyncKey, saveSyncKey } from "@/utils/syncKey";

interface ContentAdminPanelProps {
  contents: ContentItem[];
  categories: Category[];
  videos: VideoType[];
  onUpdateContents: (contents: ContentItem[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateVideos: (videos: VideoType[]) => void;
  onClose: () => void;
  isInline?: boolean;
  currentFolderId?: string | null;
}

export function ContentAdminPanel({
  contents,
  categories,
  videos,
  onUpdateContents,
  onUpdateCategories,
  onUpdateVideos,
  onClose,
  isInline = false,
  currentFolderId = null,
}: ContentAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"add" | "sync">("add");
  const [gistUrl, setGistUrl] = useState(getSyncKey() || "");
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Form states
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddPdf, setShowAddPdf] = useState(false);
  
  const [newFolder, setNewFolder] = useState({ name: "" });
  const [newVideo, setNewVideo] = useState({ id: "", name: "", videoUrl: "", duration: "", description: "" });
  const [newPdf, setNewPdf] = useState({ name: "", pdfUrl: "" });
  const [isEditing, setIsEditing] = useState(false);

  const currentFolder = contents.find(c => c.id === currentFolderId);
  const currentFolderName = currentFolderId ? currentFolder?.name : "Root";
  const currentFolderItems = contents.filter(c => c.parentId === currentFolderId);

  const handleAddFolder = () => {
    if (!newFolder.name.trim()) {
      toast({ title: "Enter folder name", variant: "destructive" });
      return;
    }

    const folder: ContentItem = {
      id: `folder-${Date.now()}`,
      name: newFolder.name.trim(),
      type: 'folder',
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
    };

    onUpdateContents([...contents, folder]);
    setNewFolder({ name: "" });
    setShowAddFolder(false);
    toast({ title: "Folder created", description: folder.name });
  };

  const handleAddVideo = () => {
    if (!newVideo.name.trim() || !newVideo.videoUrl.trim()) {
      toast({ title: "Enter video name and URL", variant: "destructive" });
      return;
    }

    if (isEditing) {
      onUpdateContents(contents.map(c => c.id === newVideo.id ? {
        ...c,
        name: newVideo.name.trim(),
        videoUrl: newVideo.videoUrl.trim(),
        duration: newVideo.duration || undefined,
        description: newVideo.description || undefined,
      } : c));
      setIsEditing(false);
      toast({ title: "Video updated", description: newVideo.name });
    } else {
      const video: ContentItem = {
        id: `video-${Date.now()}`,
        name: newVideo.name.trim(),
        type: 'video',
        parentId: currentFolderId,
        createdAt: new Date().toISOString(),
        videoUrl: newVideo.videoUrl.trim(),
        duration: newVideo.duration || undefined,
        description: newVideo.description || undefined,
      };
      onUpdateContents([...contents, video]);
      toast({ title: "Video added", description: video.name });
    }

    setNewVideo({ id: "", name: "", videoUrl: "", duration: "", description: "" });
    setShowAddVideo(false);
  };

  const handleEditVideo = (item: ContentItem) => {
    setNewVideo({
      id: item.id,
      name: item.name,
      videoUrl: item.videoUrl || "",
      duration: item.duration || "",
      description: item.description || "",
    });
    setIsEditing(true);
    setShowAddVideo(true);
    setShowAddFolder(false);
    setShowAddPdf(false);
  };

  const handleAddPdf = () => {
    if (!newPdf.name.trim() || !newPdf.pdfUrl.trim()) {
      toast({ title: "Enter PDF name and Google Drive URL", variant: "destructive" });
      return;
    }

    const pdf: ContentItem = {
      id: `pdf-${Date.now()}`,
      name: newPdf.name.trim(),
      type: 'pdf',
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
      pdfUrl: newPdf.pdfUrl.trim(),
    };

    onUpdateContents([...contents, pdf]);
    setNewPdf({ name: "", pdfUrl: "" });
    setShowAddPdf(false);
    toast({ title: "PDF added", description: pdf.name });
  };

  const handleDeleteItem = (itemId: string) => {
    const itemsToDelete = new Set<string>([itemId]);
    
    const addChildren = (parentId: string) => {
      contents.filter(c => c.parentId === parentId).forEach(child => {
        itemsToDelete.add(child.id);
        if (child.type === 'folder') {
          addChildren(child.id);
        }
      });
    };
    
    const item = contents.find(c => c.id === itemId);
    if (item?.type === 'folder') {
      addChildren(itemId);
    }

    onUpdateContents(contents.filter(c => !itemsToDelete.has(c.id)));
    toast({ title: "Deleted", description: `${itemsToDelete.size} item(s) removed` });
  };

  const handleSaveGistUrl = () => {
    saveSyncKey(gistUrl.trim());
    toast({ title: "Gist URL Saved" });
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    const key = getSyncKey()?.trim() || undefined;
    const result = await saveZoneData({ categories, videos, contents }, key);
    setIsSyncing(false);
    if (result.ok) {
      toast({ title: "Data synced to cloud and local file!" });
    } else {
      toast({ title: "Failed to sync data", description: result.error, variant: "destructive" });
    }
  };

  const getItemIcon = (item: ContentItem) => {
    switch (item.type) {
      case 'folder': return <Folder className="w-4 h-4 text-amber-500" />;
      case 'video': return <Video className="w-4 h-4 text-primary" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className={cn("p-6 overflow-y-auto h-full")}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Content Management</h2>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border">
        {["add", "sync"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "add" ? "Folders & Content" : "Sync"}
          </button>
        ))}
      </div>

      {activeTab === "add" && (
        <div className="space-y-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Active Folder</p>
            <p className="text-sm font-bold text-foreground truncate">{currentFolderName}</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setShowAddFolder(true); setShowAddVideo(false); setShowAddPdf(false); }}
              className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 text-amber-600 rounded-xl hover:bg-amber-500/20 transition-colors border border-amber-500/20"
            >
              <FolderPlus className="w-5 h-5" /> 
              <span className="font-semibold">Add Folder</span>
            </button>
            <button
              onClick={() => { setShowAddVideo(true); setShowAddFolder(false); setShowAddPdf(false); }}
              className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors border border-primary/20"
            >
              <Video className="w-5 h-5" /> 
              <span className="font-semibold">Add Video (YouTube)</span>
            </button>
            <button
              onClick={() => { setShowAddPdf(true); setShowAddFolder(false); setShowAddVideo(false); }}
              className="flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              <FileText className="w-5 h-5" /> 
              <span className="font-semibold">Add PDF (Google Drive)</span>
            </button>
          </div>

          {showAddFolder && (
            <div className="p-4 border border-amber-500/30 rounded-xl bg-amber-500/5 space-y-3 animate-in fade-in slide-in-from-top-2">
              <h4 className="font-medium text-foreground text-sm">New Folder</h4>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ name: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleAddFolder} className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium">Create</button>
                <button onClick={() => setShowAddFolder(false)} className="px-4 py-2 bg-muted rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          {showAddVideo && (
            <div className="p-4 border border-primary/30 rounded-xl bg-primary/5 space-y-3 animate-in fade-in slide-in-from-top-2">
              <h4 className="font-medium text-foreground text-sm">{isEditing ? "Edit Video" : "New Video (YouTube)"}</h4>
              <input
                type="text"
                placeholder="Video title"
                value={newVideo.name}
                onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="YouTube URL"
                value={newVideo.videoUrl}
                onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleAddVideo} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                  {isEditing ? "Update" : "Add Video"}
                </button>
                <button onClick={() => setShowAddVideo(false)} className="px-4 py-2 bg-muted rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          {showAddPdf && (
            <div className="p-4 border border-red-500/30 rounded-xl bg-red-500/5 space-y-3 animate-in fade-in slide-in-from-top-2">
              <h4 className="font-medium text-foreground text-sm">New PDF</h4>
              <input
                type="text"
                placeholder="PDF title"
                value={newPdf.name}
                onChange={(e) => setNewPdf({ ...newPdf, name: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Google Drive link"
                value={newPdf.pdfUrl}
                onChange={(e) => setNewPdf({ ...newPdf, pdfUrl: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleAddPdf} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">Add PDF</button>
                <button onClick={() => setShowAddPdf(false)} className="px-4 py-2 bg-muted rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Items in this folder ({currentFolderItems.length})
            </h4>
            {currentFolderItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-4 text-center border border-dashed border-border rounded-lg">
                No items in this folder.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {currentFolderItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10 group hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getItemIcon(item)}
                      <span className="text-sm font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === 'video' && (
                        <button
                          onClick={() => handleEditVideo(item)}
                          className="p-1.5 hover:bg-primary/20 rounded-md text-muted-foreground hover:text-primary"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 hover:bg-destructive/20 rounded-md text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "sync" && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-border/50 space-y-4">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Database className="w-5 h-5" />
              <h3 className="font-semibold">Cloud Sync</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Sync your folder structure and content directly to Supabase. This will also update the local <code>folder-structure.json</code> file.
            </p>
            <button 
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all disabled:opacity-50"
            >
              <CloudUpload className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Sync to Cloud & Local File"}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <h4 className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wider">Note:</h4>
            <p className="text-xs text-muted-foreground">
              This will save your current structure to the database. When visitors open the site, they will automatically see the latest synced version.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
