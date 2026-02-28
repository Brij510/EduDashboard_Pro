import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const FALLBACK_DEV_CREDENTIALS = [
  { username: "Brij Bhushan", password: "10368" },
  { username: "Moulik Garg", password: "10730" },
  { username: "Rehan", password: "10820" },
];

let cachedConfig = null;

const parseBoolean = (value) => value === "true" || value === "1";

const normalizeSameSite = (value) => {
  if (typeof value !== "string") return "lax";
  const normalized = value.trim().toLowerCase();
  if (normalized === "strict" || normalized === "none") return normalized;
  return "lax";
};

const toCookieSameSite = (value) => {
  if (value === "strict") return "Strict";
  if (value === "none") return "None";
  return "Lax";
};

const stripQuotes = (value) => value.replace(/^["']|["']$/g, "");

const normalizeCredential = (entry) => ({
  username:
    typeof entry.username === "string"
      ? stripQuotes(entry.username.trim())
      : "",
  password:
    typeof entry.password === "string"
      ? stripQuotes(entry.password.trim())
      : "",
});

const loadCredentials = () => {
  const envCredentials = [
    { username: process.env.DEV_USER_1, password: process.env.DEV_PASS_1 },
    { username: process.env.DEV_USER_2, password: process.env.DEV_PASS_2 },
    { username: process.env.DEV_USER_3, password: process.env.DEV_PASS_3 },
  ]
    .map(normalizeCredential)
    .filter((entry) => entry.username && entry.password);

  if (envCredentials.length > 0) {
    return envCredentials;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "No DEV_USER/DEV_PASS credentials configured. Using fallback local credentials."
    );
    return FALLBACK_DEV_CREDENTIALS;
  }

  return [];
};

const loadLocalFallbackData = async () => {
  try {
    const filePath = path.resolve(process.cwd(), "folder-structure.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileData);
  } catch {
    return null;
  }
};

export const getRuntimeConfig = () => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_TABLE = "dashboard_data",
    SUPABASE_ZONE_ID = "default",
    JWT_SECRET,
    COOKIE_SAMESITE,
    COOKIE_SECURE,
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Cloud save/load will be disabled."
    );
  }

  const sameSite = normalizeSameSite(COOKIE_SAMESITE);
  let secure =
    typeof COOKIE_SECURE === "string"
      ? parseBoolean(COOKIE_SECURE)
      : process.env.NODE_ENV === "production" || sameSite === "none";

  if (sameSite === "none" && !secure) {
    console.warn("COOKIE_SAMESITE=none requires secure cookies. Enabling secure.");
    secure = true;
  }

  cachedConfig = {
    supabase:
      SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
        ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
          })
        : null,
    supabaseTable: SUPABASE_TABLE,
    defaultZoneId: SUPABASE_ZONE_ID,
    credentials: loadCredentials(),
    jwtSecret: JWT_SECRET || "dev-secret-change-me",
    cookieName: "edudash_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: toCookieSameSite(sameSite),
      secure,
      path: "/",
    },
  };

  return cachedConfig;
};

export const resolveZoneKey = (value, fallback) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

export const isValidZonePayload = (payload) =>
  payload &&
  typeof payload === "object" &&
  Array.isArray(payload.categories) &&
  Array.isArray(payload.videos) &&
  (payload.contents === undefined || Array.isArray(payload.contents));

export const getLocalFallbackData = loadLocalFallbackData;
