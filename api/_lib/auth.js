import jwt from "jsonwebtoken";
import { getRuntimeConfig } from "./config.js";

const parseCookies = (header = "") => {
  const output = {};
  if (!header) return output;

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    output[key] = decodeURIComponent(value);
  }

  return output;
};

const buildCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }
  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.secure) {
    parts.push("Secure");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
};

export const signSession = (username) => {
  const config = getRuntimeConfig();
  return jwt.sign({ sub: username, role: "admin" }, config.jwtSecret, {
    expiresIn: "12h",
  });
};

export const readSession = (req) => {
  const config = getRuntimeConfig();
  const cookies = parseCookies(req.headers?.cookie || "");
  const token = cookies[config.cookieName];
  if (!token) return null;

  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
};

export const setSessionCookie = (res, token) => {
  const config = getRuntimeConfig();
  const cookie = buildCookie(config.cookieName, token, {
    ...config.cookieOptions,
    maxAge: 12 * 60 * 60,
  });
  res.setHeader("Set-Cookie", cookie);
};

export const clearSessionCookie = (res) => {
  const config = getRuntimeConfig();
  const cookie = buildCookie(config.cookieName, "", {
    ...config.cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  res.setHeader("Set-Cookie", cookie);
};

export const requireAdmin = (req, res) => {
  const session = readSession(req);
  if (!session || session.role !== "admin") {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return session;
};
