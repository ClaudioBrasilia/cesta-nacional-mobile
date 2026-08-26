import { useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { seasonSchedule, teams } from "@/lib/game-data";
import { useColors } from "@/hooks/use-colors";
import { useCareer } from "@/lib/career-store";

const club = teams[0];
const defaultOpponent = teams[1];

export default function HomeScreen() {
  const colors = useColors();
  const [strategy, setStrategy] = useState("control");
  const { credits, wins, losses, roster, lastResult: result, playGame, challengeProgress, completedChallenges, seasonEnded, seasonAward, season, round, difficulty } = useCareer();
  const scheduleGame = seasonSchedule[(round - 19) % seasonSchedule.length] ?? seasonSchedule[0];
  const opponent = teams.find((team) => team.name === scheduleGame.opponent) ?? defaultOpponent;
  const starters = roster.filter((player) => player.starter);


  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.muted }]}>CAMPANHA • TEMPORADA {season}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Cesta Nacional</Text>
          </View>
          <View style={[styles.creditPill, { backgroundColor: colors.surface }]}>
            <IconSymbol name="star.fill" size={16} color="#FFD166" />
            <Text style={[styles.creditText, { color: colors.foreground }]}>{credits}</Text>
          </View>
        </View>

        <Pressable onPress={() => router.push("/guide")} style={({ pressed }) => [styles.guideCard, { backgroundColor: colors.primarySoft, borderColor: colors.border }, pressed && { opacity: 0.82, transform: [{ scale: 0.99 }] }]}>
          <View style={[styles.guideIcon, { backgroundColor: colors.surface }]}><IconSymbol name="flag" size={18} color={colors.primary} /></View>
          <View style={{ flex: 1 }}><Text style={[styles.guideTitle, { color: colors.foreground }]}>Novo por aqui?</Text><Text style={[styles.guideCopy, { color: colors.muted }]}>Aprenda o básico em 60 segundos</Text></View>
          <Text style={[styles.guideArrow, { color: colors.primary }]}>→</Text>
        </Pressable>

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.sectionLabel, { color: colors.muted }]}>SEU CLUBE</Text>
              <Text style={[styles.clubName, { color: colors.foreground }]}>{club.name}</Text>
              <Text style={[styles.clubMeta, { color: colors.muted }]}>{club.city}  •  {wins}V / {losses}D</Text>
            </View>
            <View style={[styles.clubBadge, { backgroundColor: club.color }]}><IconSymbol name="basketball.fill" size={30} color="#071A2B" /></View>
          </View>
          <View style={styles.powerRow}>
            <View><Text style={[styles.smallLabel, { color: colors.muted }]}>FORÇA DO TIME</Text><Text style={[styles.power, { color: colors.foreground }]}>{club.power}</Text></View>
            <View style={styles.formDots}><View style={[styles.formDot, { backgroundColor: colors.success }]} /><View style={[styles.formDot, { backgroundColor: colors.success }]} /><View style={[styles.formDot, { backgroundColor: colors.warning }]} /><View style={[styles.formDot, { backgroundColor: colors.success }]} /><Text style={[styles.formText, { color: colors.success }]}>Boa forma</Text></View>
          </View>
        </View>

        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Próximo desafio</Text><Text style={[styles.roundText, { color: colors.primary }]}>Rodada {round} • {difficulty}</Text></View>
        <View style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.teamBlock}><View style={[styles.miniBadge, { backgroundColor: club.color }]}><IconSymbol name="basketball.fill" size={18} color="#071A2B" /></View><Text style={[styles.teamName, { color: colors.foreground }]}>{club.name}</Text><Text style={[styles.teamTag, { color: colors.success }]}>CASA</Text></View>
          <View style={styles.vsBlock}><Text style={[styles.vs, { color: colors.foreground }]}>VS</Text><Text style={[styles.gameTime, { color: colors.muted }]}>{scheduleGame.date}</Text></View>
          <View style={styles.teamBlock}><View style={[styles.miniBadge, { backgroundColor: opponent.color }]}><IconSymbol name="basketball.fill" size={18} color="#071A2B" /></View><Text style={[styles.teamName, { color: colors.foreground }]}>{opponent.name}</Text><Text style={[styles.teamTag, { color: colors.muted }]}>FORA</Text></View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 22 }]}>Plano de jogo</Text>
        <View style={styles.strategyGrid}>
          {[{ id: "control", label: "Controle", icon: "tune" as const }, { id: "three", label: "Bola de 3", icon: "my-location" as const }, { id: "defense", label: "Defesa forte", icon: "shield" as const }, { id: "pace", label: "Jogo rápido", icon: "bolt" as const }].map((item) => {
            const active = strategy === item.id;
            return <Pressable key={item.id} onPress={() => setStrategy(item.id)} style={[styles.strategyCard, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}><IconSymbol name={item.icon as any} size={20} color={active ? "#FFFFFF" : colors.muted} /><Text style={[styles.strategyText, { color: active ? "#FFFFFF" : colors.foreground }]}>{item.label}</Text></Pressable>;
          })}
        </View>

        {result && <View style={[styles.resultCard, { backgroundColor: result.homeScore > result.awayScore ? "#103A32" : "#42282B", borderColor: result.homeScore > result.awayScore ? colors.success : colors.error }]}><Text style={[styles.resultKicker, { color: result.homeScore > result.awayScore ? colors.success : colors.error }]}>{result.homeScore > result.awayScore ? "VITÓRIA NO GINÁSIO" : "DERROTA NO DETALHE"}</Text><Text style={[styles.resultScore, { color: colors.foreground }]}>{result.homeScore} <Text style={{ color: colors.muted }}>—</Text> {result.awayScore}</Text><Text style={[styles.resultCopy, { color: colors.muted }]}>{result.homeScore > result.awayScore ? "Seu plano funcionou. O elenco ganhou confiança e 120 créditos." : "A equipe lutou até o fim. Ajuste o treino e tente novamente."}</Text></View>}

        <View style={[styles.challengeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.challengeHeader}><Text style={[styles.challengeTitle, { color: colors.foreground }]}>Desafios da rodada</Text><Text style={[styles.challengeCount, { color: colors.success }]}>{completedChallenges.length}/2 concluídos</Text></View><Text style={[styles.challengeText, { color: colors.muted }]}>Defesa: {challengeProgress.defense}/1 • Mão quente: {challengeProgress.three}/1</Text>{seasonEnded && <Text style={[styles.challengeText, { color: colors.warning, fontWeight: "900", marginTop: 6 }]}>Temporada encerrada: {seasonAward}</Text>}</View>

        <Pressable onPress={() => router.push("/match")} style={({ pressed }) => [styles.playButton, { backgroundColor: colors.primary }, pressed && { opacity: 0.86, transform: [{ scale: 0.98 }] }]}><IconSymbol name="play.fill" size={22} color="#FFFFFF" /><Text style={styles.playText}>Partida acompanhada</Text><IconSymbol name="chevron.right" size={22} color="#FFFFFF" /></Pressable><Pressable onPress={() => playGame(strategy)} style={({ pressed }) => [styles.quickPlayButton, { borderColor: colors.border }, pressed && { opacity: 0.75 }]}><IconSymbol name="bolt" size={19} color={colors.primary} /><Text style={[styles.quickPlayText, { color: colors.foreground }]}>Jogo rápido</Text><Text style={[styles.quickPlayHint, { color: colors.muted }]}>resultado imediato</Text></Pressable>

        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Destaques do elenco</Text><Text style={[styles.roundText, { color: colors.primary }]}>Ver elenco</Text></View>
        <View style={styles.playerStrip}>{starters.slice(0, 3).map((player) => <View key={player.id} style={[styles.playerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.avatar, { backgroundColor: player.position === "PIVÔ" ? colors.warning : colors.primary }]}><Text style={styles.avatarText}>{player.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</Text></View><Text numberOfLines={1} style={[styles.playerName, { color: colors.foreground }]}>{player.name}</Text><Text style={[styles.playerRole, { color: colors.muted }]}>{player.position} • {player.overall} OVR</Text></View>)}</View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingTop: 16, paddingBottom: 36 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }, guideCard: { borderWidth: 1, borderRadius: 16, padding: 11, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }, guideIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" }, guideTitle: { fontSize: 12, fontWeight: "900" }, guideCopy: { fontSize: 10, marginTop: 3 }, guideArrow: { fontSize: 21, fontWeight: "700", marginRight: 3 }, eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4 }, title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 4 }, creditPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18 }, creditText: { fontWeight: "800", fontSize: 13 }, heroCard: { borderWidth: 1, borderRadius: 22, padding: 18, marginBottom: 22 }, heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, clubName: { fontSize: 23, fontWeight: "900", marginTop: 5 }, clubMeta: { fontSize: 12, marginTop: 4 }, clubBadge: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center" }, powerRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 20 }, smallLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 }, power: { fontSize: 30, fontWeight: "900", marginTop: 2 }, formDots: { flexDirection: "row", alignItems: "center", gap: 5, paddingBottom: 5 }, formDot: { width: 8, height: 8, borderRadius: 4 }, formText: { fontSize: 11, fontWeight: "800", marginLeft: 3 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, sectionTitle: { fontSize: 18, fontWeight: "900" }, roundText: { fontSize: 12, fontWeight: "700" }, matchCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 20, padding: 14 }, teamBlock: { alignItems: "center", width: "34%" }, miniBadge: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 7 }, teamName: { fontSize: 11, fontWeight: "800", textAlign: "center", lineHeight: 15 }, teamTag: { fontSize: 9, fontWeight: "900", marginTop: 4, letterSpacing: 1 }, vsBlock: { alignItems: "center" }, vs: { fontSize: 15, fontWeight: "900" }, gameTime: { fontSize: 10, marginTop: 5 }, strategyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 12 }, strategyCard: { width: "48%", minHeight: 58, borderWidth: 1, borderRadius: 15, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 9 }, strategyText: { fontSize: 12, fontWeight: "800" }, resultCard: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 18 }, challengeCard: { borderWidth: 1, borderRadius: 17, padding: 14, marginTop: 14 }, challengeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, challengeTitle: { fontSize: 13, fontWeight: "900" }, challengeCount: { fontSize: 10, fontWeight: "900" }, challengeText: { fontSize: 11, lineHeight: 16, marginTop: 6 }, resultKicker: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, resultScore: { fontSize: 32, fontWeight: "900", marginTop: 5 }, resultCopy: { fontSize: 12, lineHeight: 18, marginTop: 3 }, playButton: { height: 58, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }, playText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", flex: 1 }, quickPlayButton: { height: 48, borderWidth: 1, borderRadius: 15, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 15, marginTop: 9 }, quickPlayText: { fontSize: 12, fontWeight: "900" }, quickPlayHint: { fontSize: 10, marginLeft: "auto" }, playerStrip: { flexDirection: "row", gap: 10 }, playerCard: { width: "31.8%", borderWidth: 1, borderRadius: 15, padding: 10 }, avatar: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 9 }, avatarText: { color: "#071A2B", fontWeight: "900", fontSize: 12 }, playerName: { fontSize: 11, fontWeight: "800" }, playerRole: { fontSize: 9, marginTop: 4 }, });
