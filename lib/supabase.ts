import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import { Platform } from "react-native";
import Constants from "expo-constants";

type ExpoManifest = { extra?: { supabaseUrl?: string; supabaseAnonKey?: string } };
const constants = Constants as typeof Constants & { manifest2?: ExpoManifest; manifest?: ExpoManifest };
const manifest = constants.expoConfig ?? constants.manifest2 ?? constants.manifest;
const extra = manifest?.extra;

// No cliente (Metro) só chega o que tem prefixo EXPO_PUBLIC_; scripts/load-env.js
// copia as VITE_* da plataforma para lá. O campo extra cobre builds Expo já configurados.
// O fallback VITE_* mantém funcionando o que roda em Node (servidor/Vercel).
const supabaseUrl =
  extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
}

const webStorage: SupportedStorage = {
  getItem: async (key) => (typeof window === "undefined" ? null : window.localStorage.getItem(key)),
  setItem: async (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  },
};

const sessionStorage = Platform.OS === "web" ? webStorage : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
