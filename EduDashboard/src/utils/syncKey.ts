const SYNC_KEY_STORAGE = "dashboard_gist_url";

export const saveSyncKey = (key: string) => {
  localStorage.setItem(SYNC_KEY_STORAGE, key);
};

export const getSyncKey = (): string | null => {
  return localStorage.getItem(SYNC_KEY_STORAGE);
};

export const clearSyncKey = () => {
  localStorage.removeItem(SYNC_KEY_STORAGE);
};
