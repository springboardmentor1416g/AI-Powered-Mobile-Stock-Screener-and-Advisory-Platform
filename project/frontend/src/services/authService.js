import { Platform } from "react-native";

let memToken = null;
let memUser = null;

let storagePromise = null;
function getStorage() {
  // Web: no AsyncStorage
  if (Platform.OS === "web") return Promise.resolve(null);

  if (!storagePromise) {
    storagePromise = import("@react-native-async-storage/async-storage")
      .then((m) => m.default)
      .catch(() => null);
  }
  return storagePromise;
}

const TOKEN_KEY = "stock_screener_token";
const USER_KEY = "stock_screener_user";

export const authService = {
  async setSession({ token, user }) {
    memToken = token ?? null;
    memUser = user ?? null;

    const storage = await getStorage();
    if (!storage) return;

    if (token == null) await storage.removeItem(TOKEN_KEY);
    else await storage.setItem(TOKEN_KEY, token);

    if (user == null) await storage.removeItem(USER_KEY);
    else await storage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getToken() {
    if (memToken) return memToken;

    const storage = await getStorage();
    if (!storage) return null;

    memToken = await storage.getItem(TOKEN_KEY);
    return memToken;
  },

  async getUser() {
    if (memUser) return memUser;

    const storage = await getStorage();
    if (!storage) return null;

    const raw = await storage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      memUser = JSON.parse(raw);
      return memUser;
    } catch {
      return null;
    }
  },

  async clearSession() {
    memToken = null;
    memUser = null;

    const storage = await getStorage();
    if (!storage) return;

    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
  },
};
