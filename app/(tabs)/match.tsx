import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useCareer } from "@/lib/career-store";
import { createQuarterEvent, createQuarterWarning, getQuarterScore, getStrategyLabel, getSubstitutionEvent, type LiveEvent, type LiveStrategy } from "@/lib/live-match";
import { seasonSchedule, teams } from "@/lib/game-data";

export default function MatchScreen() {
  const colors = useColors();
  const { playGame, round } = useCareer();
  const [strategy, setStrategy] = useState<LiveStrategy>("control");
  const [quarter, setQuarter] = useState(1);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [finished, setFinished] = useState(false);
  const [substituted, setSubstituted] = useState(false);
  const scheduleGame = seasonSchedule[(round - 19) % seasonSchedule.length] ?? seasonSchedule[0];
  const opponent = teams.find((team) => team.name === scheduleGame.opponent) ?? teams[1];
  const club = teams[0];
  const quarterLabel = finished ? "FINAL" : `${quarter}º QUARTO`;

  const strategies = useMemo(() => [
    ["control", "Controle", "tune"],
    ["three", "Bola de 3", "my-location"],
    ["defense", "Defesa forte", "shield"],
    ["pace", "Jogo rápido", "bolt"],
  ] as const, []);

  function advanceQuarter() {
    if (finished) return;
    const score = getQuarterScore(quarter, strategy);
    const nextEvents = [createQuarterEvent(quarter, strategy, opponent.name)];
    if (quarter === 2 || quarter === 3) nextEvents.push(createQuarterWarning(quarter));
    if (substituted) nextEvents.push(getSubstitutionEvent(quarter));
    setHomeScore((value) => value + score.home);
    setAwayScore((value) => value + score.away);
    setEvents((value) => [...nextEvents, ...value]);
    if (quarter >= 4) {
      const result = playGame(strategy);
      setHomeScore(result.homeScore);
      setAwayScore(result.awayScore);
      setEvents((value) => [{ quarter: 4, clock: "00:00", text: result.homeScore > result.awayScore ? "Fim de jogo: vitória no ginásio. A diretoria aprovou o plano." : "Fim de jogo: derrota apertada. O banco já pensa na próxima rodada.", tone: result.homeScore > result.awayScore ? "positive" : "warning" }, ...value]);
      setFinished(true);
      return;
    }
    setQuarter((value) => value + 1);
  }

  function toggleSubstitution() {
    setSubstituted((value) => !value);
    setEvents((value) => [{ quarter, clock: "09:44", text: !substituted ? "Substituição confirmada: Vitor entra para acelerar a rotação." : "O quinteto titular retorna à quadra.", tone: "neutral" }, ...value]);
  }

  return <ScreenContainer className="px-5" containerClassName="bg-background"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}><View style={styles.topLine}><Pressable onPress={() => router.back()} style={styles.backButton}><IconSymbol name="chevron.left" size={20} color={colors.foreground} /></Pressable><View><Text style={[styles.eyebrow, { color: colors.muted }]}>PARTIDA ACOMPANHADA</Text><Text style={[styles.title, { color: colors.foreground }]}>No calor da quadra</Text></View><View style={{ width: 36 }} /></View><View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.scoreKicker, { color: colors.primary }]}>RODADA {round} • {quarterLabel}</Text><View style={styles.scoreRow}><View style={styles.scoreTeam}><View style={[styles.badge, { backgroundColor: club.color }]}><IconSymbol name="basketball.fill" size={20} color="#071A2B" /></View><Text style={[styles.teamName, { color: colors.foreground }]}>{club.name}</Text><Text style={[styles.homeAway, { color: colors.success }]}>CASA</Text></View><View style={styles.scoreCenter}><Text style={[styles.score, { color: colors.foreground }]}>{homeScore} <Text style={{ color: colors.muted }}>—</Text> {awayScore}</Text><Text style={[styles.clock, { color: colors.muted }]}>{finished ? "APITO FINAL" : "AO VIVO"}</Text></View><View style={styles.scoreTeam}><View style={[styles.badge, { backgroundColor: opponent.color }]}><IconSymbol name="basketball.fill" size={20} color="#071A2B" /></View><Text style={[styles.teamName, { color: colors.foreground }]}>{opponent.name}</Text><Text style={[styles.homeAway, { color: colors.muted }]}>FORA</Text></View></View></View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Plano de jogo</Text><View style={styles.strategyGrid}>{strategies.map(([id, label, icon]) => { const active = strategy === id; return <Pressable key={id} onPress={() => !finished && setStrategy(id)} style={[styles.strategy, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}><IconSymbol name={icon as any} size={18} color={active ? "#FFFFFF" : colors.muted} /><Text style={[styles.strategyText, { color: active ? "#FFFFFF" : colors.foreground }]}>{label}</Text></Pressable>; })}</View><View style={[styles.tacticalBar, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={{ flex: 1 }}><Text style={[styles.tacticalLabel, { color: colors.foreground }]}>Estratégia atual</Text><Text style={[styles.tacticalCopy, { color: colors.muted }]}>{getStrategyLabel(strategy)} • Decisões alteram o ritmo da simulação.</Text></View><Pressable onPress={toggleSubstitution} disabled={finished} style={({ pressed }) => [styles.subButton, { backgroundColor: substituted ? colors.success : "#173042" }, pressed && { opacity: 0.8 }]}><Text style={styles.subButtonText}>{substituted ? "Rotação ativa" : "Trocar jogador"}</Text></Pressable></View><Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 22 }]}>Lance a lance</Text><View style={[styles.feed, { backgroundColor: colors.surface, borderColor: colors.border }]}>{events.length === 0 ? <Text style={[styles.empty, { color: colors.muted }]}>A partida começa quando você avançar o primeiro quarto.</Text> : events.map((event, index) => <View key={`${event.quarter}-${event.clock}-${index}`} style={styles.event}><View style={[styles.eventQuarter, { backgroundColor: event.tone === "positive" ? "#103A32" : event.tone === "warning" ? "#42282B" : "#173042" }]}><Text style={[styles.eventQuarterText, { color: event.tone === "positive" ? colors.success : event.tone === "warning" ? colors.error : colors.muted }]}>{event.quarter}Q</Text></View><View style={{ flex: 1 }}><Text style={[styles.eventClock, { color: colors.muted }]}>{event.clock}</Text><Text style={[styles.eventText, { color: colors.foreground }]}>{event.text}</Text></View></View>)}</View><Pressable onPress={advanceQuarter} disabled={finished} style={({ pressed }) => [styles.advanceButton, { backgroundColor: finished ? colors.border : colors.primary }, pressed && !finished && { opacity: 0.84, transform: [{ scale: 0.98 }] }]}><IconSymbol name={finished ? "checkmark.circle.fill" : "play.fill"} size={21} color="#FFFFFF" /><Text style={styles.advanceText}>{finished ? "Partida encerrada" : quarter >= 4 ? "Encerrar partida" : `Avançar para o ${quarter + 1}º quarto`}</Text></Pressable>{finished && <Pressable onPress={() => router.replace("/")} style={[styles.quickButton, { borderColor: colors.border }]}><Text style={[styles.quickButtonText, { color: colors.foreground }]}>Voltar ao jogo rápido</Text></Pressable>}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 14, paddingBottom: 40 }, topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, backButton: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#173042" }, eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3, textAlign: "center" }, title: { fontSize: 24, fontWeight: "900", marginTop: 3, textAlign: "center" }, scoreCard: { borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 22 }, scoreKicker: { fontSize: 10, fontWeight: "900", letterSpacing: 1, textAlign: "center" }, scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 15 }, scoreTeam: { alignItems: "center", width: "31%" }, badge: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 7 }, teamName: { fontSize: 10, fontWeight: "900", textAlign: "center" }, homeAway: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8, marginTop: 4 }, scoreCenter: { alignItems: "center" }, score: { fontSize: 27, fontWeight: "900" }, clock: { fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 5 }, sectionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 10 }, strategyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, strategy: { width: "48%", borderWidth: 1, borderRadius: 14, minHeight: 51, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8 }, strategyText: { fontSize: 11, fontWeight: "900" }, tacticalBar: { borderWidth: 1, borderRadius: 17, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 }, tacticalLabel: { fontSize: 11, fontWeight: "900" }, tacticalCopy: { fontSize: 9, lineHeight: 13, marginTop: 3 }, subButton: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9 }, subButtonText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" }, feed: { borderWidth: 1, borderRadius: 18, padding: 12, minHeight: 145 }, empty: { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 48 }, event: { flexDirection: "row", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#29465A" }, eventQuarter: { width: 34, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" }, eventQuarterText: { fontSize: 9, fontWeight: "900" }, eventClock: { fontSize: 9, fontWeight: "900" }, eventText: { fontSize: 11, lineHeight: 16, marginTop: 2 }, advanceButton: { height: 56, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 18 }, advanceText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, quickButton: { height: 48, borderWidth: 1, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 10 }, quickButtonText: { fontSize: 12, fontWeight: "900" } });
