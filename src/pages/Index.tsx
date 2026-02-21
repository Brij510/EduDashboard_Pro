import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { VideoGrid } from "@/components/dashboard/VideoGrid";
import { VideoModal } from "@/components/dashboard/VideoModal";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { FolderExplorer } from "@/components/dashboard/FolderExplorer";
import { categories as initialCategories, videos as initialVideos, initialContents } from "@/data/mockData";
import { Video, Category, ContentItem } from "@/types/dashboard";
import { Menu, Bell, LogOut, Folder, Video as VideoIcon, Database } from "lucide-react";
import { fetchZoneData } from "@/utils/zoneApi";
import { getSyncKey } from "@/utils/syncKey";

interface IndexProps {
  isAdmin: boolean;
  onLogout: () => void;
}

const Index = ({ isAdmin, onLogout }: IndexProps) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [contents, setContents] = useState<ContentItem[]>(initialContents);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedContentVideo, setSelectedContentVideo] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Visitors default to legacy (categories), admins default to folders
  const [viewMode, setViewMode] = useState<"folders" | "legacy">(isAdmin ? "folders" : "legacy");

  useEffect(() => {
    let isMounted = true;
    const loadZoneData = async () => {
      const key = getSyncKey()?.trim() || undefined;
      const data = await fetchZoneData(key);
      if (!isMounted) return;

      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      if (Array.isArray(data.videos)) {
        setVideos(data.videos);
      }
      if (Array.isArray(data.contents)) {
        setContents(data.contents);
      }
    };

    loadZoneData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter videos based on category and search (legacy mode)
  const filteredVideos = useMemo(() => {
    let result = videos;

    // Filter by category
    if (selectedCategory) {
      result = result.filter((video) => {
        // Check if video belongs to selected category or its children
        const category = categories.find((c) => c.id === selectedCategory);
        if (category) {
          if (video.categoryId === selectedCategory) return true;
          if (category.children?.some((child) => child.id === video.categoryId))
            return true;
        }
        // Check if selected category is a child category
        return video.categoryId === selectedCategory;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [videos, categories, selectedCategory, searchQuery]);

  // Filter contents based on search
  const filteredContents = useMemo(() => {
    if (!searchQuery) return contents;
    const query = searchQuery.toLowerCase();
    return contents.filter(item => item.name.toLowerCase().includes(query));
  }, [contents, searchQuery]);

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setSelectedContentVideo(null);
    setIsModalOpen(true);
  };

  const handlePlayContentVideo = (item: ContentItem) => {
    setSelectedContentVideo(item);
    setSelectedVideo(null);
    setIsModalOpen(true);
  };

  const handleMarkWatched = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, watched: true } : v))
    );
    if (selectedVideo?.id === videoId) {
      setSelectedVideo({ ...selectedVideo, watched: true });
    }
  };

  const getCategoryName = () => {
    if (!selectedCategory) return "All Content";
    for (const cat of categories) {
      if (cat.id === selectedCategory) return cat.name;
      if (cat.children) {
        const child = cat.children.find((c) => c.id === selectedCategory);
        if (child) return child.name;
      }
    }
    return "Content";
  };

  // Convert ContentItem to Video for modal display
  const getVideoFromContentItem = (): Video | null => {
    if (!selectedContentVideo || selectedContentVideo.type !== 'video') return null;
    return {
      id: selectedContentVideo.id,
      title: selectedContentVideo.name,
      description: selectedContentVideo.description || '',
      thumbnail: selectedContentVideo.thumbnail || '',
      videoUrl: selectedContentVideo.videoUrl || '',
      duration: selectedContentVideo.duration || '00:00',
      categoryId: '',
      watched: false,
      createdAt: selectedContentVideo.createdAt,
    };
  };

  const handleUpdateContents = (newContents: ContentItem[]) => {
    setContents(newContents);
    
    // Recursive function to build category tree from folders
    const buildCategoryTree = (parentId: string | null): Category[] => {
      const folders = newContents.filter(item => item.type === 'folder' && item.parentId === parentId);
      return folders.map(folder => {
        const children = buildCategoryTree(folder.id);
        return {
          id: folder.id,
          name: folder.name,
          icon: folder.name.toLowerCase().includes('lecture') ? 'Video' : 
                folder.name.toLowerCase().includes('text') ? 'BookOpen' :
                folder.name.toLowerCase().includes('note') ? 'FileText' :
                folder.name.toLowerCase().includes('class') ? 'GraduationCap' : 'Folder',
          children: children.length > 0 ? children : undefined,
          parentId: folder.parentId || undefined
        };
      });
    };

    const newCategories = buildCategoryTree(null);
    setCategories(newCategories);

    // Sync to legacy videos for compatibility
    const allVideos = newContents.filter(item => item.type === 'video');
    const syncedVideos: Video[] = allVideos.map(item => ({
      id: item.id,
      title: item.name,
      description: item.description || '',
      thumbnail: item.thumbnail || `https://img.youtube.com/vi/${item.videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1] || ''}/maxresdefault.jpg`,
      videoUrl: item.videoUrl || '',
      duration: item.duration || '00:00',
      categoryId: item.parentId || '',
      watched: false,
      createdAt: item.createdAt,
    }));
    
    setVideos(prev => {
      return syncedVideos.map(nv => {
        const existing = prev.find(pv => pv.id === nv.id);
        return existing ? { ...nv, watched: existing.watched } : nv;
      });
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={(id) => {
            setSelectedCategory(id);
            setViewMode("legacy");
          }}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={(id) => {
                setSelectedCategory(id);
                setViewMode("legacy");
                setIsMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-panel border-b border-border/30 px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search content..."
              />
            </div>

            {/* Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {isAdmin && (
                <div className="flex items-center gap-2 mr-4">
                  <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                    Admin
                  </span>
                </div>
              )}
              <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>
              
              {/* Settings Panel */}
              <SettingsPanel
                isAdmin={isAdmin}
                categories={categories}
                videos={videos}
                contents={contents}
                onUpdateCategories={setCategories}
                onUpdateVideos={setVideos}
                onUpdateContents={handleUpdateContents}
              />
              
              <button
                onClick={onLogout}
                className="p-2 hover:bg-destructive/20 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                {isAdmin ? "AD" : "VS"}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* View Mode Toggle - Only show to admins */}
          {isAdmin && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => { setViewMode("folders"); setSelectedCategory(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "folders" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  Folders
                </button>
                <button
                  onClick={() => setViewMode("legacy")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "legacy" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <VideoIcon className="w-4 h-4" />
                  Categories
                </button>
              </div>
            </div>
          )}

          {viewMode === "folders" && isAdmin ? (
            <>
              {/* Folder Explorer - Admin Only */}
              <FolderExplorer
                contents={searchQuery ? filteredContents : contents}
                currentFolderId={searchQuery ? null : currentFolderId}
                onNavigate={setCurrentFolderId}
                onPlayVideo={handlePlayContentVideo}
                isAdmin={isAdmin}
                onUpdateContents={handleUpdateContents}
                categories={categories}
                videos={videos}
                onUpdateCategories={setCategories}
                onUpdateVideos={setVideos}
              />
            </>
          ) : (
            <>
              {/* Legacy Category View */}
              <Breadcrumb
                categories={categories}
                selectedCategory={selectedCategory}
                onNavigate={setSelectedCategory}
              />

              <StatsBar videos={filteredVideos} />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {getCategoryName()}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {filteredVideos.length} video
                    {filteredVideos.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </div>

              <VideoGrid videos={filteredVideos} onPlayVideo={handlePlayVideo} />
            </>
          )}
        </div>
      </main>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo || getVideoFromContentItem()}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVideo(null);
          setSelectedContentVideo(null);
        }}
        onMarkWatched={handleMarkWatched}
      />
    </div>
  );
};

export default Index;
