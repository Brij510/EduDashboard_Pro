import { readSession } from "./_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = readSession(req);
  if (!session) {
    return res.status(200).json({ authenticated: false, admin: false });
  }

  return res.status(200).json({ authenticated: true, admin: true });
}
