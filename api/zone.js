import {
  getLocalFallbackData,
  getRuntimeConfig,
  isValidZonePayload,
  resolveZoneKey,
} from "./_lib/config.js";
import { requireAdmin } from "./_lib/auth.js";

const getBody = (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
};

const getQueryKey = (req) => {
  const value = req.query?.key;
  if (Array.isArray(value)) return value[0];
  return value;
};

const loadFromSupabase = async (config, key) => {
  if (!config.supabase) return null;

  const { data, error } = await config.supabase
    .from(config.supabaseTable)
    .select("data")
    .eq("id", key)
    .maybeSingle();

  if (error) {
    console.error("Supabase load error:", error);
    return null;
  }

  return data?.data ?? null;
};

const saveToSupabase = async (config, key, payload) => {
  if (!config.supabase) {
    return {
      ok: false,
      status: 503,
      error: "Supabase is not configured for writes",
    };
  }

  const { error } = await config.supabase
    .from(config.supabaseTable)
    .upsert({ id: key, data: payload }, { onConflict: "id" });

  if (error) {
    console.error("Supabase save error:", error);
    return { ok: false, status: 500, error: "Failed to save to Supabase" };
  }

  return { ok: true };
};

export default async function handler(req, res) {
  const config = getRuntimeConfig();
  const defaultZoneId = config.defaultZoneId || "default";
  const allowCustomZoneKey = process.env.ALLOW_CUSTOM_ZONE_KEY === "true";
  const resolveRequestZoneKey = (value) =>
    allowCustomZoneKey ? resolveZoneKey(value, defaultZoneId) : defaultZoneId;

  if (req.method === "GET") {
    const key = resolveRequestZoneKey(getQueryKey(req));

    const cloudData = await loadFromSupabase(config, key);
    if (cloudData) {
      return res.status(200).json({ data: cloudData });
    }

    const localData = await getLocalFallbackData();
    return res.status(200).json({ data: localData });
  }

  if (req.method === "POST") {
    const session = requireAdmin(req, res);
    if (!session) return;

    const body = getBody(req);
    const key = resolveRequestZoneKey(body?.key);
    const payload = body?.data;

    if (!isValidZonePayload(payload)) {
      return res.status(400).json({ error: "Invalid zone payload" });
    }

    const saveResult = await saveToSupabase(config, key, payload);
    if (!saveResult.ok) {
      return res.status(saveResult.status || 500).json({ error: saveResult.error });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
