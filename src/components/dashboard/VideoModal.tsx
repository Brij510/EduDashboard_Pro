import { X, Check, ExternalLink } from "lucide-react";
import { Video } from "@/types/dashboard";
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from "@/utils/youtube";
import { useEffect, useCallback } from "react";

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkWatched: (videoId: string) => void;
}

export function VideoModal({ video, isOpen, onClose, onMarkWatched }: VideoModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !video) return null;

  const videoId = extractYouTubeVideoId(video.videoUrl);
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-5xl mx-4 glass-panel overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">{video.title}</h2>
            <p className="text-sm text-muted-foreground truncate">{video.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {!video.watched && (
              <button
                onClick={() => onMarkWatched(video.id)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark as Watched
              </button>
            )}
            {video.watched && (
              <span className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary/20 text-primary rounded-lg">
                <Check className="w-4 h-4" />
                Completed
              </span>
            )}
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Open in YouTube"
            >
              <ExternalLink className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-background">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <p>Unable to load video. Please check the URL.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
