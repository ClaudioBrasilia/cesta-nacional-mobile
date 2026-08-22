import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-store";
import { useCareer } from "@/lib/career-store";
import {
  createOnlineLeague,
  getOnlineLeagueDashboard,
  joinOnlineLeague,
  listOnlineLeagues,
  resolveOnlineRound,
  submitOnlineRound,
  type OnlineLeagueSummary,
} from "@/lib/online-league";

const strategies = [
  { id: "control" as const, label: "Controle" },
  { id: "three" as const, label: "Bola de 3" },
  { id: "defense" as const, label: "Defesa forte" },
];

export default function OnlineLeagueScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { roster } = useCareer();
  const [leagues, setLeagues] = useState<OnlineLeagueSummary[]>([]);
  const [selected, setSelected] = useState<OnlineLeagueSummary | null>(null);
  const [dashboard, setDashboard] = useState<Awaited<
    ReturnType<typeof getOnlineLeagueDashboard>
  > | null>(null);
  const [leagueName, setLeagueName] = useState("Liga dos Técnicos");
  const [clubName, setClubName] = useState("Brasília Estrelas");
  const [code, setCode] = useState("");
  const [strategy, setStrategy] =
    useState<(typeof strategies)[number]["id"]>("control");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(
    async (leagueId?: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const nextLeagues = await listOnlineLeagues();
        setLeagues(nextLeagues);
        const nextSelected =
          nextLeagues.find((item) => item.league.id === leagueId) ??
          selected ??
          nextLeagues[0] ??
          null;
        setSelected(nextSelected);
        setDashboard(
          nextSelected
            ? await getOnlineLeagueDashboard(nextSelected.league.id)
            : null,
        );
        setNotice("");
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as ligas.",
        );
      } finally {
        setLoading(false);
      }
    },
    [selected, user],
  );

  useEffect(() => {
    refresh();
  }, [user?.id]);

  const mySubmission = useMemo(
    () =>
      dashboard?.submissions.find(
        (item) =>
          item.user_id === user?.id &&
          item.round === dashboard.league.current_round,
      ),
    [dashboard, user?.id],
  );
  const submittedCount =
    dashboard?.submissions.filter(
      (item) => item.round === dashboard.league.current_round,
    ).length ?? 0;
  const deadlineLabel = dashboard
    ? new Date(dashboard.league.round_deadline).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  async function handleCreate() {
    setLoading(true);
    try {
      const result = await createOnlineLeague(
        leagueName,
        clubName,
        Math.round(
          roster.reduce((sum, player) => sum + player.overall, 0) /
            Math.max(roster.length, 1),
        ),
      );
      await refresh(result.league.id);
      setNotice(`Liga criada. Compartilhe o código ${result.league.code}.`);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a liga.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setLoading(true);
    try {
      const result = await joinOnlineLeague(
        code,
        clubName,
        Math.round(
          roster.reduce((sum, player) => sum + player.overall, 0) /
            Math.max(roster.length, 1),
        ),
      );
      await refresh(result.league.id);
      setCode("");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar na liga.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    if (!dashboard) return;
    setLoading(true);
    try {
      const result = await resolveOnlineRound(
        dashboard.league.id,
        dashboard.league.current_round,
      );
      await refresh(dashboard.league.id);
      setNotice(
        result.status === "waiting"
          ? `Ainda faltam ${Math.max(0, (result.total ?? 0) - (result.submitted ?? 0))} confirmação(ões).`
          : "Rodada processada. A classificação foi atualizada.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível processar a rodada.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!dashboard) return;
    setLoading(true);
    try {
      await submitOnlineRound(
        dashboard.league.id,
        dashboard.league.current_round,
        strategy,
        roster.filter((player) => player.starter).map((player) => player.id),
      );
      await refresh(dashboard.league.id);
      setNotice(
        "Escalação enviada. A rodada será processada quando os técnicos confirmarem.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a rodada.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!user)
    return (
      <ScreenContainer className="px-5" containerClassName="bg-background">
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Liga Nacional Online
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Entre com sua conta para criar ou participar de uma liga assíncrona.
          </Text>
          <Pressable
            onPress={() => router.push("/auth")}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.buttonText}>Entrar com e-mail</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.primary }]}>‹ Voltar</Text>
        </Pressable>
        <Text style={[styles.eyebrow, { color: colors.muted }]}>
          MULTIPLAYER ASSÍNCRONO
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Liga Nacional Online
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Uma temporada de técnicos, com rodadas confirmadas no seu ritmo.
        </Text>
        {notice ? (
          <View style={[styles.notice, { backgroundColor: "#103A32" }]}>
            <Text style={[styles.noticeText, { color: colors.success }]}>
              {notice}
            </Text>
          </View>
        ) : null}
        {!dashboard ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Criar nova liga
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={leagueName}
                onChangeText={setLeagueName}
                placeholder="Nome da liga"
                placeholderTextColor={colors.muted}
                style={[
                  styles.input,
                  { color: colors.foreground, borderColor: colors.border },
                ]}
              />
              <TextInput
                value={clubName}
                onChangeText={setClubName}
                placeholder="Nome do seu clube"
                placeholderTextColor={colors.muted}
                style={[
                  styles.input,
                  { color: colors.foreground, borderColor: colors.border },
                ]}
              />
              <Pressable
                disabled={loading}
                onPress={handleCreate}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Criando..." : "Criar liga"}
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Entrar com código
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={code}
                onChangeText={(value) => setCode(value.toUpperCase())}
                autoCapitalize="characters"
                placeholder="Ex.: BR6K2P"
                placeholderTextColor={colors.muted}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    borderColor: colors.border,
                    letterSpacing: 3,
                  },
                ]}
              />
              <Pressable
                disabled={loading || code.length !== 6}
                onPress={handleJoin}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      code.length === 6 ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={styles.buttonText}>Entrar na liga</Text>
              </Pressable>
            </View>
            {leagues.length ? (
              <>
                <Text
                  style={[styles.sectionTitle, { color: colors.foreground }]}
                >
                  Minhas ligas
                </Text>
                {leagues.map((item) => (
                  <Pressable
                    key={item.league.id}
                    onPress={() => {
                      setSelected(item);
                      setDashboard(null);
                      refresh(item.league.id);
                    }}
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.cardTitle, { color: colors.foreground }]}
                    >
                      {item.league.name}
                    </Text>
                    <Text style={[styles.cardCopy, { color: colors.muted }]}>
                      Código {item.league.code} • Rodada{" "}
                      {item.league.current_round}
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : null}
          </>
        ) : (
          <>
            <View style={[styles.hero, { backgroundColor: colors.primary }]}>
              <Text style={styles.heroKicker}>CÓDIGO PARA CONVIDAR</Text>
              <Text style={styles.heroCode}>{dashboard.league.code}</Text>
              <Text style={styles.heroCopy}>
                {dashboard.league.name} • {dashboard.members.length}/
                {dashboard.league.max_teams} técnicos • prazo {deadlineLabel}
              </Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Rodada {dashboard.league.current_round}
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {mySubmission
                  ? "Escalação confirmada"
                  : "Confirme sua estratégia"}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {submittedCount} técnico(s) já enviaram a rodada. Você pode
                alterar antes do processamento.
              </Text>
              <View style={styles.strategyRow}>
                {strategies.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setStrategy(item.id)}
                    style={[
                      styles.strategy,
                      {
                        backgroundColor:
                          strategy === item.id
                            ? colors.primary
                            : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.strategyText,
                        {
                          color:
                            strategy === item.id
                              ? "#FFFFFF"
                              : colors.foreground,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                disabled={loading}
                onPress={handleSubmit}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.buttonText}>
                  {loading
                    ? "Enviando..."
                    : mySubmission
                      ? "Atualizar escalação"
                      : "Confirmar rodada"}
                </Text>
              </Pressable>
              {dashboard.league.owner_id === user.id ? (
                <Pressable
                  disabled={loading}
                  onPress={handleResolve}
                  style={[
                    styles.resolveButton,
                    { borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.resolveText, { color: colors.primary }]}>
                    Processar rodada ({submittedCount}/
                    {dashboard.members.length})
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Classificação online
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {dashboard.members.map((member, index) => (
                <View key={member.user_id} style={styles.tableRow}>
                  <Text style={[styles.position, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.cardTitle, { color: colors.foreground }]}
                    >
                      {member.club_name}
                    </Text>
                    <Text style={[styles.cardCopy, { color: colors.muted }]}>
                      {member.team_power} força • saldo{" "}
                      {member.points_for - member.points_against}
                    </Text>
                  </View>
                  <Text style={[styles.record, { color: colors.foreground }]}>
                    {member.wins}-{member.losses}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Histórico de confrontos
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {dashboard.matches.length ? (
                dashboard.matches.slice(0, 6).map((match) => {
                  const home =
                    dashboard.members.find(
                      (member) => member.user_id === match.home_user_id,
                    )?.club_name ?? "Casa";
                  const away =
                    dashboard.members.find(
                      (member) => member.user_id === match.away_user_id,
                    )?.club_name ?? "Visitante";
                  return (
                    <View key={match.id} style={styles.matchRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.cardTitle,
                            { color: colors.foreground },
                          ]}
                        >
                          Rodada {match.round}
                        </Text>
                        <Text
                          style={[styles.cardCopy, { color: colors.muted }]}
                        >
                          {home} x {away}
                        </Text>
                      </View>
                      <Text
                        style={[styles.matchScore, { color: colors.primary }]}
                      >
                        {match.home_score}–{match.away_score}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={[styles.cardCopy, { color: colors.muted }]}>
                  Nenhum confronto processado ainda.
                </Text>
              )}
            </View>
            {dashboard.notifications.length ? (
              <>
                <Text
                  style={[styles.sectionTitle, { color: colors.foreground }]}
                >
                  Notificações
                </Text>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {dashboard.notifications.slice(0, 4).map((notification) => (
                    <View key={notification.id} style={styles.notificationRow}>
                      <Text
                        style={[styles.cardTitle, { color: colors.foreground }]}
                      >
                        {notification.title}
                      </Text>
                      <Text style={[styles.cardCopy, { color: colors.muted }]}>
                        {notification.body}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
            <Pressable
              onPress={() => {
                setDashboard(null);
                setSelected(null);
                refresh();
              }}
            >
              <Text style={[styles.change, { color: colors.primary }]}>
                Trocar de liga
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", padding: 24 },
  back: { fontSize: 14, fontWeight: "800", marginBottom: 18 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { fontSize: 30, fontWeight: "900", marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 18,
    marginBottom: 9,
  },
  card: { borderWidth: 1, borderRadius: 17, padding: 13, marginBottom: 9 },
  input: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 9,
    fontSize: 13,
  },
  primaryButton: {
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  notice: { borderRadius: 13, padding: 11, marginBottom: 10 },
  noticeText: { fontSize: 11, fontWeight: "800", lineHeight: 16 },
  hero: { borderRadius: 20, padding: 18, marginBottom: 4 },
  heroKicker: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroCode: {
    color: "#FFFFFF",
    fontSize: 33,
    fontWeight: "900",
    letterSpacing: 6,
    marginTop: 5,
  },
  heroCopy: { color: "rgba(255,255,255,0.86)", fontSize: 11, marginTop: 5 },
  cardTitle: { fontSize: 13, fontWeight: "900" },
  cardCopy: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  strategyRow: { flexDirection: "row", gap: 7, marginVertical: 12 },
  strategy: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  strategyText: { fontSize: 10, fontWeight: "900" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#29465A",
    gap: 10,
  },
  position: { width: 20, fontSize: 14, fontWeight: "900" },
  record: { fontSize: 13, fontWeight: "900" },
  change: { textAlign: "center", fontWeight: "900", marginTop: 8 },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#29465A",
  },
  matchScore: { fontSize: 16, fontWeight: "900" },
  notificationRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#29465A",
  },
  resolveButton: {
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  resolveText: { fontSize: 11, fontWeight: "900" },
});
