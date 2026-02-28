import { DashboardData, ContentItem } from "@/types/dashboard";
import { categories as mockCategories, videos as mockVideos, initialContents as mockContents } from "@/data/mockData";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "@/utils/youtube";
import { getPreviewImageForFileUrl } from "@/utils/drive";

export type ZoneData = DashboardData & { contents?: ContentItem[] };

const FOLDER_STRUCTURE_PATH = `${import.meta.env.BASE_URL}folder-structure.json`;

const getMockFallback = (): ZoneData => ({
  categories: mockCategories,
  videos: mockVideos,
  contents: mockContents,
});

const getFilePreview = (fileType: "pdf" | "doc" | "zip") => {
  if (fileType === "pdf") {
    return {
      description: "PDF document",
      duration: "PDF",
      thumbnail: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
    };
  }
  if (fileType === "doc") {
    return {
      description: "Document file",
      duration: "DOC",
      thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    };
  }
  return {
    description: "ZIP archive",
    duration: "ZIP",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  };
};

const resolveFolderIcon = (name: string) => {
  const value = name.toLowerCase();
  if (value.includes("lecture")) return "Video";
  if (value.includes("text") || value.includes("book")) return "BookOpen";
  if (value.includes("note")) return "FileText";
  if (value.includes("class")) return "GraduationCap";
  return "Folder";
};

const buildCategoryTree = (contents: ContentItem[], parentId: string | null) => {
  const folders = contents.filter(
    (item) => item.type === "folder" && item.parentId === parentId
  );

  return folders.map((folder) => {
    const children = buildCategoryTree(contents, folder.id);
    return {
      id: folder.id,
      name: folder.name,
      icon: resolveFolderIcon(folder.name),
      parentId: folder.parentId || undefined,
      children: children.length > 0 ? children : undefined,
    };
  });
};

const mapContentsToVideos = (contents: ContentItem[]) =>
  contents
    .filter(
      (item) =>
        item.type === "video" ||
        item.type === "pdf" ||
        item.type === "doc" ||
        item.type === "zip"
    )
    .map((item) => {
      const isFile =
        item.type === "pdf" || item.type === "doc" || item.type === "zip";
      const youtubeId = extractYouTubeVideoId(item.videoUrl || "");
      const filePreview =
        item.type === "pdf" || item.type === "doc" || item.type === "zip"
          ? getFilePreview(item.type)
          : null;
      const fileUrl = item.pdfUrl || "";
      const fileThumbnailFromUrl = fileUrl
        ? getPreviewImageForFileUrl(fileUrl)
        : null;
      return {
        id: item.id,
        title: item.name,
        description: item.description || filePreview?.description || "",
        thumbnail:
          item.thumbnail ||
          (isFile
            ? fileThumbnailFromUrl || filePreview?.thumbnail
            : youtubeId
              ? getYouTubeThumbnail(youtubeId)
              : "https://via.placeholder.com/640x360"),
        videoUrl: isFile ? fileUrl : item.videoUrl || "",
        duration: isFile ? filePreview?.duration || "FILE" : item.duration || "00:00",
        categoryId: item.parentId || "",
        watched: false,
        createdAt: item.createdAt,
        resourceType: isFile ? item.type : "video",
      };
    });

const normalizeZoneData = (payload: unknown): ZoneData => {
  const source =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: unknown }).data
      : payload;

  if (!source || typeof source !== "object") {
    return getMockFallback();
  }

  const data = source as Partial<ZoneData> & { contents?: ContentItem[] };
  const contents = Array.isArray(data.contents) ? data.contents : undefined;
  const categories = Array.isArray(data.categories) ? data.categories : undefined;
  const videos = Array.isArray(data.videos) ? data.videos : undefined;

  if (contents) {
    return {
      categories: categories || buildCategoryTree(contents, null),
      videos: videos || mapContentsToVideos(contents),
      contents,
    };
  }

  if (categories && videos) {
    return { categories, videos, contents: mockContents };
  }

  return getMockFallback();
};

export const fetchZoneData = async (_key?: string): Promise<ZoneData> => {
  try {
    const response = await fetch(FOLDER_STRUCTURE_PATH, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Could not load folder-structure.json, using local mock data");
      return getMockFallback();
    }

    const payload = await response.json();
    return normalizeZoneData(payload);
  } catch (error) {
    console.warn("Failed to load folder-structure.json, using local mock data", error);
    return getMockFallback();
  }
};

export const saveZoneData = async (
  data: ZoneData,
  _key?: string
): Promise<{ ok: boolean; error?: string }> => {
  if (!Array.isArray(data.contents)) {
    return { ok: false, error: "No contents available to export" };
  }

  return {
    ok: false,
    error: "Cloud sync is disabled. Use the download button to export folder-structure.json.",
  };
};

export const downloadFolderStructure = (
  data: ZoneData
): { ok: boolean; error?: string } => {
  if (!Array.isArray(data.contents)) {
    return { ok: false, error: "No contents available to download" };
  }

  try {
    const payload = JSON.stringify({ contents: data.contents }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "folder-structure.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { ok: true };
  } catch (error) {
    console.error("Failed to download folder structure", error);
    return { ok: false, error: "Download failed" };
  }
};
