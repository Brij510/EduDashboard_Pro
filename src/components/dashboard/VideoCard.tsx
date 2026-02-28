import { Play, Check, Clock, FileText, File, FileArchive, ExternalLink, MoreVertical } from "lucide-react";
import { Video } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  index: number;
}

export function VideoCard({ video, onPlay, index }: VideoCardProps) {
  const isFile = video.resourceType === "pdf" || video.resourceType === "doc" || video.resourceType === "zip";

  if (isFile) {
    const fileType = (video.resourceType || "pdf").toUpperCase();
    return (
      <div
        className="glass-card group cursor-pointer overflow-hidden animate-fade-in hover:border-primary/50 transition-all relative"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => onPlay(video)}
      >
        <div className="aspect-square relative flex items-center justify-center bg-muted/30">
          {video.resourceType === "pdf" ? (
            <FileText className="w-16 h-16 text-red-500" />
          ) : video.resourceType === "doc" ? (
            <File className="w-16 h-16 text-blue-500" />
          ) : (
            <FileArchive className="w-16 h-16 text-emerald-500" />
          )}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-snug text-foreground line-clamp-2">
              {video.title}
            </h3>
            <MoreVertical className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
          <p className="text-xs text-red-500 mt-1.5">
            {fileType} - Opens in new tab
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card group cursor-pointer overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onPlay(video)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Play/Open Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform shadow-lg shadow-primary/30">
            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-xs font-mono text-foreground">
          <Clock className="w-3 h-3" />
          {video.duration}
        </div>

        {/* Watched Badge */}
        {video.watched && !isFile && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary/90 backdrop-blur-sm rounded-md text-xs font-medium text-primary-foreground">
            <Check className="w-3 h-3" />
            Watched
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={cn(
          "font-semibold text-sm leading-snug mb-2 line-clamp-2 transition-colors",
          video.watched ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
        )}>
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {video.description}
        </p>
      </div>

      {/* Progress Bar (if watched) */}
      {video.watched && !isFile && (
        <div className="h-1 bg-primary/20">
          <div className="h-full w-full bg-gradient-to-r from-primary to-accent" />
        </div>
      )}
    </div>
  );
}
