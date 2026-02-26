/**
 * Extract YouTube video ID from various URL formats or iframe embed code
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;

  // Check if it's an iframe embed code
  const iframeMatch = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (iframeMatch) {
    return iframeMatch[1];
  }

  // Check for standard YouTube URL formats
  const urlPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of urlPatterns) {
    const match = input.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate YouTube embed URL with autoplay and modestbranding
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'maxres'): string {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export interface PlaylistVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
}

export interface PlaylistData {
  title: string;
  videos: PlaylistVideo[];
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

const padTwo = (value: number) => String(value).padStart(2, "0");

const parseDurationToClock = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "00:00";

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${padTwo(minutes)}:${padTwo(seconds)}`;
  }

  return `${padTwo(minutes)}:${padTwo(seconds)}`;
};

const resolveThumbnailFromSnippet = (
  videoId: string,
  thumbnails?: {
    maxres?: { url?: string };
    high?: { url?: string };
    medium?: { url?: string };
    standard?: { url?: string };
    default?: { url?: string };
  }
) =>
  thumbnails?.maxres?.url ||
  thumbnails?.high?.url ||
  thumbnails?.medium?.url ||
  thumbnails?.standard?.url ||
  thumbnails?.default?.url ||
  getYouTubeThumbnail(videoId);

const fetchYouTubeJson = async (url: string): Promise<any> => {
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      typeof payload.error?.message === "string"
        ? payload.error.message
        : "YouTube API request failed";
    throw new Error(message);
  }

  return payload;
};

export function extractYouTubePlaylistId(input: string): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Accept direct playlist IDs like PL..., UU..., LL...
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes("http")) {
    return trimmed;
  }

  const listMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (listMatch) return listMatch[1];

  try {
    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(normalized);
    const fromQuery = url.searchParams.get("list");
    if (fromQuery) return fromQuery;
  } catch {
    return null;
  }

  return null;
}

const fetchVideoDurations = async (videoIds: string[], apiKey: string) => {
  const durationByVideoId = new Map<string, string>();

  for (let index = 0; index < videoIds.length; index += 50) {
    const chunk = videoIds.slice(index, index + 50);
    if (!chunk.length) continue;

    const params = new URLSearchParams({
      part: "contentDetails",
      id: chunk.join(","),
      key: apiKey,
      maxResults: "50",
    });

    const payload = await fetchYouTubeJson(
      `${YOUTUBE_API_BASE}/videos?${params.toString()}`
    );

    const items = Array.isArray(payload?.items) ? payload.items : [];
    for (const item of items) {
      const videoId =
        item && typeof item === "object" && typeof item.id === "string"
          ? item.id
          : "";
      const isoDuration =
        item &&
        typeof item === "object" &&
        typeof item.contentDetails?.duration === "string"
          ? item.contentDetails.duration
          : "";

      if (!videoId || !isoDuration) continue;
      durationByVideoId.set(videoId, parseDurationToClock(isoDuration));
    }
  }

  return durationByVideoId;
};

export async function fetchYouTubePlaylistData(
  playlistUrl: string,
  apiKey: string,
  maxItems = 200
): Promise<PlaylistData> {
  if (!apiKey?.trim()) {
    throw new Error("Missing YouTube API key");
  }

  const playlistId = extractYouTubePlaylistId(playlistUrl);
  if (!playlistId) {
    throw new Error("Invalid YouTube playlist URL");
  }

  const playlistMetaParams = new URLSearchParams({
    part: "snippet",
    id: playlistId,
    key: apiKey,
    maxResults: "1",
  });

  const playlistMeta = await fetchYouTubeJson(
    `${YOUTUBE_API_BASE}/playlists?${playlistMetaParams.toString()}`
  );
  const playlistTitle =
    playlistMeta?.items?.[0]?.snippet?.title || "Imported Playlist";

  const playlistVideos: Array<Omit<PlaylistVideo, "duration">> = [];
  let nextPageToken = "";

  while (playlistVideos.length < maxItems) {
    const params = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId,
      key: apiKey,
      maxResults: "50",
    });
    if (nextPageToken) params.set("pageToken", nextPageToken);

    const payload = await fetchYouTubeJson(
      `${YOUTUBE_API_BASE}/playlistItems?${params.toString()}`
    );

    const items = Array.isArray(payload?.items) ? payload.items : [];
    for (const item of items) {
      const videoId =
        item?.contentDetails?.videoId || item?.snippet?.resourceId?.videoId;
      if (!videoId) continue;

      const title =
        typeof item?.snippet?.title === "string"
          ? item.snippet.title
          : "Untitled Video";

      if (title === "Private video" || title === "Deleted video") {
        continue;
      }

      playlistVideos.push({
        videoId,
        title,
        description:
          typeof item?.snippet?.description === "string"
            ? item.snippet.description
            : "",
        thumbnail: resolveThumbnailFromSnippet(videoId, item?.snippet?.thumbnails),
        publishedAt:
          typeof item?.contentDetails?.videoPublishedAt === "string"
            ? item.contentDetails.videoPublishedAt
            : new Date().toISOString(),
      });

      if (playlistVideos.length >= maxItems) break;
    }

    nextPageToken =
      typeof payload?.nextPageToken === "string" ? payload.nextPageToken : "";
    if (!nextPageToken) break;
  }

  if (!playlistVideos.length) {
    throw new Error("No public videos found in this playlist");
  }

  const durations = await fetchVideoDurations(
    playlistVideos.map((video) => video.videoId),
    apiKey
  );

  return {
    title: playlistTitle,
    videos: playlistVideos.map((video) => ({
      ...video,
      duration: durations.get(video.videoId) || "00:00",
    })),
  };
}
