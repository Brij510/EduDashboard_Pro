import { getRuntimeConfig } from "./_lib/config.js";
import { setSessionCookie, signSession } from "./_lib/auth.js";

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

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = getRuntimeConfig();
  const body = getBody(req);
  const username =
    typeof body?.username === "string" ? body.username.trim() : "";
  const password =
    typeof body?.password === "string" ? body.password.trim() : "";

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Missing credentials" });
  }

  if (!config.credentials.length) {
    return res
      .status(503)
      .json({ ok: false, error: "Developer credentials are not configured" });
  }

  const match = config.credentials.find(
    (entry) => entry.username === username && entry.password === password
  );

  if (!match) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  const token = signSession(username);
  setSessionCookie(res, token);
  return res.status(200).json({ ok: true, admin: true });
}
