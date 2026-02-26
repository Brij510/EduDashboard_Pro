const rawBaseUrl =
  import.meta.env.DEV || import.meta.env.VITE_USE_EXTERNAL_API === "true"
    ? import.meta.env.VITE_API_BASE_URL || ""
    : "";
const baseUrl = rawBaseUrl.trim().replace(/\/+$/, "");

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const apiUrl = (path: string) => {
  const normalized = normalizePath(path);
  return baseUrl ? `${baseUrl}${normalized}` : normalized;
};
