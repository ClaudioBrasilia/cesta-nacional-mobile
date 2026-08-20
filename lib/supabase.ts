import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import { Platform } from "react-native";

// No cliente (Metro) só chega o que tem prefixo EXPO_PUBLIC_; scripts/load-env.js
// copia as VITE_* da plataforma para lá. O fallback mantém funcionando o que roda
// em Node (servidor/Vercel), onde as VITE_* existem direto no process.env.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

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
