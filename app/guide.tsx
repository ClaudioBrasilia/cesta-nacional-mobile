import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const steps = [
  {
    number: "01",
    icon: "tune" as const,
    title: "Escolha o plano de jogo",
    copy: "Na tela inicial, selecione Controle, Bola de 3, Defesa forte ou Jogo rápido. A estratégia muda o ritmo da simulação.",
  },
  {
    number: "02",
    icon: "basketball.fill" as const,
    title: "Jogue a partida",
    copy: "Use Partida acompanhada para avançar quarto a quarto e acompanhar o lance a lance. Em Trocar jogador, ajuste a rotação quando precisar.",
  },
  {
    number: "03",
    icon: "bolt.fill" as const,
    title: "Treine e monte o elenco",
    copy: "Na aba Mais, faça o treino semanal. Na aba Elenco, toque em um atleta para definir titulares e pressione por mais tempo para abrir o perfil.",
  },
  {
    number: "04",
    icon: "star.fill" as const,
    title: "Use os créditos com critério",
    copy: "Vitórias, desafios e decisões da diretoria geram créditos. Use-os no mercado e para renovar contratos sem deixar a folha pesar.",
  },
  {
    number: "05",
    icon: "flag" as const,
    title: "Acompanhe a temporada",
    copy: "Na Central da Liga, confira os próximos jogos, objetivos, classificação e desafios. Cada resultado faz a rodada avançar.",
  },
];

export default function GuideScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, { borderColor: colors.border }, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.backMark, { color: colors.foreground }]}>‹</Text>
            <Text style={[styles.backText, { color: colors.muted }]}>Voltar</Text>
          </Pressable>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>CENTRAL DE AJUDA</Text>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primarySoft }]}>
            <IconSymbol name="basketball.fill" size={26} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Como jogar</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Um guia rápido para assumir o banco, vencer partidas e construir uma carreira.</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>O ciclo principal</Text>
        <View style={styles.steps}>
          {steps.map((step) => (
            <View key={step.number} style={[styles.step, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.stepNumberText, { color: colors.primary }]}>{step.number}</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <IconSymbol name={step.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.stepBody}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
                <Text style={[styles.stepCopy, { color: colors.muted }]}>{step.copy}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.tipCard, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
          <View style={styles.tipHeader}>
            <IconSymbol name="trophy.fill" size={19} color={colors.primary} />
            <Text style={[styles.tipTitle, { color: colors.foreground }]}>Dica para começar</Text>
          </View>
          <Text style={[styles.tipCopy, { color: colors.muted }]}>Na primeira partida, experimente Controle e avance com calma. Depois compare o resultado com Bola de 3 ou Defesa forte para descobrir o estilo que combina com seu elenco.</Text>
        </View>

        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [styles.startButton, { backgroundColor: colors.primary }, pressed && { opacity: 0.86, transform: [{ scale: 0.98 }] }]}
        >
          <Text style={styles.startText}>Voltar para a campanha</Text>
          <Text style={styles.startArrow}>→</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 38 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  backMark: { fontSize: 24, lineHeight: 22, marginTop: -2 },
  backText: { fontSize: 11, fontWeight: "800" },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  hero: { borderWidth: 1, borderRadius: 22, padding: 18, alignItems: "center", marginBottom: 24 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { maxWidth: 320, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 10 },
  steps: { gap: 9 },
  step: { borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNumber: { width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  stepNumberText: { fontSize: 11, fontWeight: "900" },
  stepIconWrap: { width: 27, height: 32, alignItems: "center", justifyContent: "center" },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: "900" },
  stepCopy: { fontSize: 11, lineHeight: 17, marginTop: 3 },
  tipCard: { borderWidth: 1, borderRadius: 17, padding: 14, marginTop: 18 },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipTitle: { fontSize: 13, fontWeight: "900" },
  tipCopy: { fontSize: 11, lineHeight: 17, marginTop: 7 },
  startButton: { height: 53, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16 },
  startText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  startArrow: { color: "#FFFFFF", fontSize: 21, fontWeight: "700", marginTop: -2 },
});
