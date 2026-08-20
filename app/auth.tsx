import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-store";

export default function AuthScreen() {
  const colors = useColors();
  const { signIn, signUp, resetPassword, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={styles.center}><Text style={[styles.title, { color: colors.foreground }]}>Conta conectada</Text><Text style={[styles.copy, { color: colors.muted }]}>Sua carreira está pronta para sincronizar com o Supabase.</Text><Pressable onPress={() => router.replace("/(tabs)")} style={[styles.button, { backgroundColor: colors.primary }]}><Text style={styles.buttonText}>Voltar ao jogo</Text></Pressable></View></ScreenContainer>;
  }

  async function submit() {
    setNotice("");
    if (!email.includes("@") || password.length < 6) {
      setNotice("Informe um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    if (mode === "login") {
      const result = await signIn(email, password);
      setBusy(false);
      if (result.error) {
        setNotice(result.error);
        return;
      }
    } else {
      const result = await signUp(email, password);
      setBusy(false);
      if (result.error) {
        setNotice(result.error);
        return;
      }
      if (result.confirmationRequired) {
        setNotice("Cadastro criado. Verifique seu e-mail para confirmar a conta.");
        return;
      }
    }
    router.replace("/(tabs)");
  }

  async function recover() {
    setNotice("");
    if (!email.includes("@")) {
      setNotice("Digite seu e-mail para receber o link de recuperação.");
      return;
    }
    setBusy(true);
    const result = await resetPassword(email);
    setBusy(false);
    setNotice(result.error ?? "Link de recuperação enviado. Verifique sua caixa de entrada.");
  }

  return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={styles.content}><Text style={[styles.eyebrow, { color: colors.primary }]}>CESTA NACIONAL</Text><Text style={[styles.title, { color: colors.foreground }]}>{mode === "login" ? "Entrar na carreira" : "Criar conta"}</Text><Text style={[styles.copy, { color: colors.muted }]}>Sincronize seu progresso entre aparelhos e continue a temporada de onde parou.</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} /><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Senha" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} /><Pressable disabled={busy || loading} onPress={submit} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary }, pressed && { opacity: 0.82 }]}><Text style={styles.buttonText}>{busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}</Text></Pressable>{mode === "login" && <Pressable onPress={recover} style={styles.linkButton}><Text style={[styles.link, { color: colors.primary }]}>Esqueci minha senha</Text></Pressable>}{notice ? <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.noticeText, { color: colors.foreground }]}>{notice}</Text></View> : null}<Pressable onPress={() => { setMode(mode === "login" ? "signup" : "login"); setNotice(""); }} style={styles.linkButton}><Text style={[styles.link, { color: colors.muted }]}>{mode === "login" ? "Ainda não tenho conta" : "Já tenho uma conta"}</Text></Pressable><Text style={[styles.offline, { color: colors.muted }]}>O modo offline continua disponível; a conta serve para salvar e recuperar sua carreira.</Text></View></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { flex: 1, justifyContent: "center", paddingBottom: 40 }, center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }, eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5 }, title: { fontSize: 30, fontWeight: "900", marginTop: 6 }, copy: { fontSize: 13, lineHeight: 19, marginTop: 9, marginBottom: 24 }, input: { width: "100%", minHeight: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, marginBottom: 10, fontSize: 14 }, button: { width: "100%", minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 6 }, buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" }, linkButton: { alignItems: "center", paddingVertical: 12 }, link: { fontSize: 12, fontWeight: "800" }, notice: { width: "100%", borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 14 }, noticeText: { fontSize: 12, lineHeight: 17, textAlign: "center" }, offline: { fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 22 } });
