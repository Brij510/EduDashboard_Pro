import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = Number(process.env.PORT) || 8080;

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_TABLE = "dashboard_data",
  SUPABASE_ZONE_ID = "default",
  JWT_SECRET,
  CORS_ORIGIN,
  COOKIE_SAMESITE,
  COOKIE_SECURE,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Supabase features will be unavailable.");
}
if (!JWT_SECRET) {
  console.warn("Warning: Missing JWT_SECRET. Using a default for development only.");
}

const resolvedJwtSecret = JWT_SECRET || "dev-secret-change-me";

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

const parseBoolean = (value) => value === "true" || value === "1";
const normalizeSameSite = (value) => {
  if (typeof value !== "string") return "lax";
  const normalized = value.trim().toLowerCase();
  if (normalized === "strict" || normalized === "none") return normalized;
  return "lax";
};

const COOKIE_NAME = "edudash_session";
const resolvedSameSite = normalizeSameSite(COOKIE_SAMESITE);
let resolvedSecure =
  typeof COOKIE_SECURE === "string"
    ? parseBoolean(COOKIE_SECURE)
    : process.env.NODE_ENV === "production" || resolvedSameSite === "none";

if (resolvedSameSite === "none" && !resolvedSecure) {
  console.warn("COOKIE_SAMESITE=none requires COOKIE_SECURE=true. Forcing secure cookies.");
  resolvedSecure = true;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: resolvedSameSite,
  secure: resolvedSecure,
  path: "/",
};

const FALLBACK_DEV_CREDENTIALS = [
  { username: "Brij Bhushan", password: "10368" },
  { username: "Moulik Garg", password: "10730" },
  { username: "Rehan", password: "10820" },
];

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

  if (envCredentials.length) {
    return envCredentials;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Warning: No developer credentials configured in .env. Using fallback dev credentials."
    );
    return FALLBACK_DEV_CREDENTIALS;
  }

  console.warn("Warning: No developer credentials configured in .env");
  return [];
};

const credentials = loadCredentials();
if (process.env.NODE_ENV !== "production") {
  const usernames = credentials.map((entry) => entry.username).filter(Boolean);
  console.log("Loaded developer usernames:", usernames.length ? usernames : "(none)");
}

const signSession = (username) =>
  jwt.sign({ sub: username, role: "admin" }, resolvedJwtSecret, { expiresIn: "12h" });

const readSession = (req) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, resolvedJwtSecret);
  } catch {
    return null;
  }
};

const requireAdmin = (req, res, next) => {
  const session = readSession(req);
  if (!session || session.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = session;
  return next();
};

const resolveZoneKey = (value) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return SUPABASE_ZONE_ID || "default";
};

app.post("/api/login", (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password.trim() : "";

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Missing credentials" });
  }

  if (!credentials.length) {
    return res
      .status(503)
      .json({ ok: false, error: "Developer credentials are not configured" });
  }

  const match = credentials.find(
    (entry) => entry.username === username && entry.password === password
  );

  if (!match) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  const token = signSession(username);
  res.cookie(COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: 12 * 60 * 60 * 1000 });
  return res.json({ ok: true, admin: true });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  return res.json({ ok: true });
});

app.get("/api/session", (req, res) => {
  const session = readSession(req);
  if (!session) {
    return res.json({ authenticated: false, admin: false });
  }
  return res.json({ authenticated: true, admin: true });
});

app.get("/api/zone", async (req, res) => {
  const key = resolveZoneKey(req.query?.key);
  
  // Try to load from Supabase first
  if (supabase) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select("data")
      .eq("id", key)
      .maybeSingle();

    if (!error && data?.data) {
      return res.json({ data: data.data });
    }
  }

  // Fallback to local file
  try {
    const filePath = path.resolve(__dirname, "../folder-structure.json");
    const fileData = await fs.promises.readFile(filePath, "utf-8");
    return res.json({ data: JSON.parse(fileData) });
  } catch (err) {
    return res.json({ data: null });
  }
});

app.post("/api/zone", requireAdmin, async (req, res) => {
  const key = resolveZoneKey(req.body?.key);
  const payload = req.body?.data;

  const isValidPayload =
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.categories) &&
    Array.isArray(payload.videos) &&
    (payload.contents === undefined || Array.isArray(payload.contents));

  if (!isValidPayload) {
    return res.status(400).json({ error: "Invalid zone payload" });
  }

  // 1. Save to Supabase if configured
  if (supabase) {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert({ id: key, data: payload }, { onConflict: "id" });
    
    if (error) {
      console.error("Supabase save error:", error);
    }
  }

  // 2. Always save to local folder-structure.json
  try {
    const filePath = path.resolve(__dirname, "../folder-structure.json");
    await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error("Local file save error:", err);
    if (!supabase) {
       return res.status(500).json({ error: "Failed to save locally and Supabase not configured" });
    }
  }

  return res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
});
