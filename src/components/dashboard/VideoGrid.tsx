import { Video } from "@/types/dashboard";
import { VideoCard } from "./VideoCard";
import { PlayCircle } from "lucide-react";

interface VideoGridProps {
  videos: Video[];
  onPlayVideo: (video: Video) => void;
}

export function VideoGrid({ videos, onPlayVideo }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <PlayCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No videos found</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Try adjusting your search or selecting a different category to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          onPlay={onPlayVideo}
          index={index}
        />
      ))}
    </div>
  );
}
