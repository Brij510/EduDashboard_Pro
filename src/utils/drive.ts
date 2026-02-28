const IMAGE_URL_PATTERN = /\.(png|jpe?g|gif|webp|bmp|svg|avif)(?:[?#].*)?$/i;

export const extractGoogleDriveFileId = (url: string): string | null => {
  if (!url) return null;

  const directMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (directMatch?.[1]) {
    return directMatch[1];
  }

  try {
    const parsed = new URL(url);
    const idParam = parsed.searchParams.get("id");
    if (idParam) {
      return idParam;
    }
  } catch {
    return null;
  }

  return null;
};

export const getGoogleDriveThumbnailUrl = (url: string): string | null => {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
};

export const getPreviewImageForFileUrl = (url: string): string | null => {
  if (!url) return null;

  if (IMAGE_URL_PATTERN.test(url)) {
    return url;
  }

  return getGoogleDriveThumbnailUrl(url);
};
