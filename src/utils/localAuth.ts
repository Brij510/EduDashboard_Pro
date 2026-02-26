const ADMIN_SESSION_STORAGE = "edudash_admin_session";

const FALLBACK_DEV_CREDENTIALS = [
  { username: "Brij Bhushan", password: "10368" },
  { username: "Moulik Garg", password: "10730" },
  { username: "Rehan", password: "10820" },
];

const stripQuotes = (value: string) => value.replace(/^["']|["']$/g, "");

const normalizeCredential = (entry: { username?: string; password?: string }) => ({
  username:
    typeof entry.username === "string"
      ? stripQuotes(entry.username.trim())
      : "",
  password:
    typeof entry.password === "string"
      ? stripQuotes(entry.password.trim())
      : "",
});

const getConfiguredCredentials = () => {
  const envCredentials = [
    {
      username: import.meta.env.VITE_DEV_USER_1 as string | undefined,
      password: import.meta.env.VITE_DEV_PASS_1 as string | undefined,
    },
    {
      username: import.meta.env.VITE_DEV_USER_2 as string | undefined,
      password: import.meta.env.VITE_DEV_PASS_2 as string | undefined,
    },
    {
      username: import.meta.env.VITE_DEV_USER_3 as string | undefined,
      password: import.meta.env.VITE_DEV_PASS_3 as string | undefined,
    },
  ]
    .map(normalizeCredential)
    .filter((entry) => entry.username && entry.password);

  return envCredentials.length > 0 ? envCredentials : FALLBACK_DEV_CREDENTIALS;
};

const isBrowser = typeof window !== "undefined";

export const hasAdminSession = () => {
  if (!isBrowser) return false;
  return window.localStorage.getItem(ADMIN_SESSION_STORAGE) === "true";
};

export const setAdminSession = () => {
  if (!isBrowser) return;
  window.localStorage.setItem(ADMIN_SESSION_STORAGE, "true");
};

export const clearAdminSession = () => {
  if (!isBrowser) return;
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE);
};

export const authenticateDeveloper = (username: string, password: string) => {
  const normalizedUsername = username.trim();
  const normalizedPassword = password.trim();

  if (!normalizedUsername || !normalizedPassword) {
    return { ok: false, error: "Missing credentials" };
  }

  const credentials = getConfiguredCredentials();
  const match = credentials.find(
    (entry) =>
      entry.username === normalizedUsername &&
      entry.password === normalizedPassword
  );

  if (!match) {
    return { ok: false, error: "Invalid credentials" };
  }

  return { ok: true };
};
