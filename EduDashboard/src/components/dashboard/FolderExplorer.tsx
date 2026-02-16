import { useState, useRef, useEffect } from "react";
import { ContentItem, Category, Video as VideoType } from "@/types/dashboard";
import { ContentAdminPanel } from "./ContentAdminPanel";
import { 
  Folder, 
  FolderOpen, 
  Video, 
  FileText, 
  ChevronRight, 
  Play,
  ExternalLink,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Edit3,
  FolderX,
  FolderPlus,
  Upload,
  Download,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderExplorerProps {
  contents: ContentItem[];
  currentFolderId: string | null;
  onNavigate: (folderId: string | null) => void;
  onPlayVideo: (item: ContentItem) => void;
  isAdmin?: boolean;
  onUpdateContents?: (contents: ContentItem[]) => void;
  categories?: Category[];
  videos?: VideoType[];
  onUpdateCategories?: (categories: Category[]) => void;
  onUpdateVideos?: (videos: VideoType[]) => void;
}

export function FolderExplorer({ 
  contents, 
  currentFolderId, 
  onNavigate, 
  onPlayVideo,
  isAdmin,
  onUpdateContents,
  categories = [],
  videos = [],
  onUpdateCategories = () => {},
  onUpdateVideos = () => {}
}: FolderExplorerProps) {
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showAdminSidebar, setShowAdminSidebar] = useState(true);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get items in current folder
  const currentItems = contents.filter(item => item.parentId === currentFolderId);
  
    // Get breadcrumb path
    const getBreadcrumbPath = () => {
      const path: ContentItem[] = [];
      let current = currentFolderId;
      let depth = 0;
      const MAX_DEPTH = 50; // Support up to 50 levels
      while (current && depth < MAX_DEPTH) {
        const folder = contents.find(c => c.id === current);
        if (folder) {
          path.unshift(folder);
          current = folder.parentId;
          depth++;
        } else {
          break;
        }
      }
      return path;
    };

    const breadcrumbPath = getBreadcrumbPath();
    const isDeepLevel = breadcrumbPath.length > 5;

  const handleItemClick = (item: ContentItem) => {
    if (renameId === item.id) return;
    if (item.type === 'folder') {
      onNavigate(item.id);
    } else if (item.type === 'video') {
      onPlayVideo(item);
    } else if (item.type === 'pdf' && item.pdfUrl) {
      window.open(item.pdfUrl, '_blank');
    }
  };

  const getYoutubeThumbnail = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  // Delete folder/item
  const handleDelete = (id: string) => {
    if (!onUpdateContents) return;
    const newContents = contents.filter(c => c.id !== id && c.parentId !== id);
    onUpdateContents(newContents);
    setContextMenuId(null);
  };

  // Clear folder (delete all children)
  const handleClear = (id: string) => {
    if (!onUpdateContents) return;
    const getAllChildIds = (parentId: string): string[] => {
      const children = contents.filter(c => c.parentId === parentId);
      return children.flatMap(c => [c.id, ...getAllChildIds(c.id)]);
    };
    const childIds = getAllChildIds(id);
    const newContents = contents.filter(c => !childIds.includes(c.id));
    onUpdateContents(newContents);
    setContextMenuId(null);
  };

  // Start rename
  const handleStartRename = (item: ContentItem) => {
    setRenameId(item.id);
    setRenameValue(item.name);
    setContextMenuId(null);
  };

  // Save rename
  const handleSaveRename = () => {
    if (!onUpdateContents || !renameId || !renameValue.trim()) {
      setRenameId(null);
      return;
    }
    const newContents = contents.map(c => 
      c.id === renameId ? { ...c, name: renameValue.trim() } : c
    );
    onUpdateContents(newContents);
    setRenameId(null);
    setRenameValue("");
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (!onUpdateContents || !newFolderName.trim()) {
      setShowNewFolderInput(false);
      return;
    }
    const newFolder: ContentItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      type: 'folder',
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
    };
    onUpdateContents([...contents, newFolder]);
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

  // Handle folder structure upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUpdateContents) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.contents && Array.isArray(data.contents)) {
          // Remap parent IDs to current folder
          const remappedContents = data.contents.map((item: ContentItem) => ({
            ...item,
            id: `imported-${Date.now()}-${item.id}`,
            parentId: item.parentId === null ? currentFolderId : `imported-${Date.now()}-${item.parentId}`,
          }));
          onUpdateContents([...contents, ...remappedContents]);
        }
      } catch (err) {
        alert("Invalid JSON file. Please upload a valid folder structure.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // Download folder structure as JSON
  const handleDownloadStructure = () => {
    const data = { contents };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'folder-structure.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (currentItems.length === 0 && !currentFolderId && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Folder className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Content will appear here once added by an admin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full min-h-[600px]">
      <div className="flex-1 space-y-4">
        {/* Breadcrumb Navigation + Admin Actions (Left side) */}
        <div className="flex items-center gap-2 flex-wrap min-h-[40px]">
          {isAdmin && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={() => setShowAdminSidebar(!showAdminSidebar)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  showAdminSidebar ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary hover:bg-primary/30"
                )}
                title={showAdminSidebar ? "Hide Content Manager" : "Show Content Manager"}
              >
                <Layout className="w-4 h-4" />
                Manager
              </button>
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Structure
              </button>
              <button
                onClick={handleDownloadStructure}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Structure
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap max-w-full overflow-hidden">
          <button
            onClick={() => onNavigate(null)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
              currentFolderId === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
          >
            <Folder className="w-4 h-4" />
            Root
          </button>

          {isDeepLevel && (
            <span className="text-muted-foreground">...</span>
          )}

          {(isDeepLevel ? breadcrumbPath.slice(-4) : breadcrumbPath).map((folder, index, array) => (
            <div key={folder.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <button
                onClick={() => onNavigate(folder.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors truncate max-w-[120px]",
                  index === array.length - 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                )}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex items-center gap-2">
        {currentFolderId && (
          <button
            onClick={() => {
              const parentFolder = contents.find(c => c.id === currentFolderId);
              onNavigate(parentFolder?.parentId || null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>

      {/* New Folder Input */}
      {showNewFolderInput && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <FolderPlus className="w-5 h-5 text-primary" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setShowNewFolderInput(false);
            }}
            placeholder="Folder name..."
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            onClick={handleCreateFolder}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Create
          </button>
          <button
            onClick={() => setShowNewFolderInput(false)}
            className="px-3 py-2 bg-muted-foreground/20 text-foreground rounded-lg text-sm font-medium hover:bg-muted-foreground/30"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {currentItems.map((item, index) => (
          <div
            key={item.id}
            data-folder-id={item.id}
            className="glass-card group cursor-pointer overflow-hidden animate-fade-in hover:border-primary/50 transition-all relative"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Thumbnail/Icon Area */}
            <div 
              onClick={() => handleItemClick(item)}
              className="aspect-square relative flex items-center justify-center bg-muted/30"
            >
              {item.type === 'video' && item.videoUrl ? (
                <>
                  <img
                    src={getYoutubeThumbnail(item.videoUrl) || item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </>
              ) : item.type === 'pdf' ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-16 h-16 text-red-500" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Folder className="w-16 h-16 text-amber-500 group-hover:hidden" />
                  <FolderOpen className="w-16 h-16 text-amber-500 hidden group-hover:block" />
                </div>
              )}
            </div>

            {/* Name + Admin Menu */}
            <div className="p-3">
              <div className="flex items-center justify-between gap-1">
                {renameId === item.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') setRenameId(null);
                    }}
                    onBlur={handleSaveRename}
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p 
                    onClick={() => handleItemClick(item)}
                    className="text-sm font-medium text-foreground line-clamp-2 text-center flex-1 group-hover:text-primary transition-colors"
                  >
                    {item.name}
                  </p>
                )}

                {/* 3 Dots Menu - Admin Only */}
                {isAdmin && !renameId && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextMenuId(contextMenuId === item.id ? null : item.id);
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>

              {item.type === 'video' && item.duration && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {item.duration}
                </p>
              )}
              {item.type === 'pdf' && (
                <p className="text-xs text-red-500 text-center mt-1">
                  PDF - Opens in new tab
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentItems.length === 0 && currentFolderId && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Folder className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Empty folder</h3>
          <p className="text-muted-foreground text-sm">
            {isAdmin 
              ? "Add content to this folder using the buttons above."
              : "No content in this folder yet."
            }
          </p>
        </div>
      )}

      {currentItems.length === 0 && !currentFolderId && isAdmin && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Folder className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Use "New Folder" or "Upload Structure" buttons above to add content.
          </p>
        </div>
      )}

      </div>

      {/* Inline Content Manager Sidebar - Admin Only */}
      {isAdmin && showAdminSidebar && (
        <div className="w-[350px] shrink-0 glass-panel border border-border/30 rounded-xl overflow-hidden hidden xl:block animate-slide-in-right">
          <ContentAdminPanel
            contents={contents}
            categories={categories}
            videos={videos}
            onUpdateContents={onUpdateContents || (() => {})}
            onUpdateCategories={onUpdateCategories}
            onUpdateVideos={onUpdateVideos}
            onClose={() => setShowAdminSidebar(false)}
            isInline={true}
            currentFolderId={currentFolderId}
          />
        </div>
      )}

      {/* Context Menu - Rendered outside card to prevent overflow issues */}
      {contextMenuId && (
        <div 
          ref={contextMenuRef}
          className="fixed w-44 bg-card border border-border rounded-lg shadow-2xl z-[200] overflow-hidden"
          style={{
            top: `${(document.querySelector(`[data-folder-id="${contextMenuId}"]`) as HTMLElement)?.getBoundingClientRect().bottom || 0}px`,
            left: `${Math.min((document.querySelector(`[data-folder-id="${contextMenuId}"]`) as HTMLElement)?.getBoundingClientRect().right - 176 || 0, window.innerWidth - 200)}px`,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              const item = contents.find(c => c.id === contextMenuId);
              if (item) handleStartRename(item);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (contextMenuId) handleClear(contextMenuId);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <FolderX className="w-4 h-4" />
            Clear Folder
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (contextMenuId) handleDelete(contextMenuId);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
