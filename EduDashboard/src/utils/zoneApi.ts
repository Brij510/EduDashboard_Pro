import { DashboardData, ContentItem } from "@/types/dashboard";
import { apiUrl } from "@/lib/api";

export type ZoneData = DashboardData & { contents?: ContentItem[] };

const buildZoneUrl = (key?: string) => {
  if (!key) return apiUrl("/api/zone");
  const params = new URLSearchParams({ key });
  return apiUrl(`/api/zone?${params.toString()}`);
};

export const fetchZoneData = async (key?: string): Promise<ZoneData | null> => {
  try {
    const response = await fetch(buildZoneUrl(key), {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: ZoneData | null };
    return payload?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch zone data", error);
    return null;
  }
};

export const saveZoneData = async (
  data: ZoneData,
  key?: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const response = await fetch(apiUrl("/api/zone"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, data }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      return { ok: false, error: payload?.error || "Failed to save" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Failed to save zone data", error);
    return { ok: false, error: "Network error" };
  }
};
