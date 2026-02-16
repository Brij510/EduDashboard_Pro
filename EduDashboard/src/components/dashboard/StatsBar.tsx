import { Video, BookOpen, Clock, Trophy } from "lucide-react";
import { Video as VideoType } from "@/types/dashboard";

interface StatsBarProps {
  videos: VideoType[];
}

export function StatsBar({ videos }: StatsBarProps) {
  const totalVideos = videos.length;
  const watchedVideos = videos.filter(v => v.watched).length;
  const totalDuration = videos.reduce((acc, v) => {
    const parts = v.duration.split(':').map(Number);
    if (parts.length === 3) {
      return acc + parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return acc + parts[0] * 60 + (parts[1] || 0);
  }, 0);
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const stats = [
    {
      label: "Total Videos",
      value: totalVideos,
      icon: Video,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Completed",
      value: watchedVideos,
      icon: Trophy,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "In Progress",
      value: totalVideos - watchedVideos,
      icon: BookOpen,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Total Duration",
      value: formatDuration(totalDuration),
      icon: Clock,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-card p-4 flex items-center gap-3 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
