import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { contractDefaults, players, simulateMatch, type Player } from "@/lib/game-data";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "cesta-nacional-career-v1";

export type CareerState = {
  credits: number;
  ownedIds: string[];
  starterIds: string[];
  wins: number;
  losses: number;
  trainingDone: boolean;
  lastResult: { homeScore: number; awayScore: number } | null;
  directorChoice: string | null;
  directorMessage: string;
  challengeProgress: Record<string, number>;
  completedChallenges: string[];
  seasonEnded: boolean;
  seasonAward: string | null;
  season: number;
  round: number;
  difficulty: "Normal" | "Desafio";
  seasonHistory: Array<{ season: number; wins: number; losses: number; award: string }>;
  playerProgress: Record<string, number>;
  retiredIds: string[];
  seasonBudget: number;
  seasonObjective: string;
  contracts: Record<string, { salary: number; yearsRemaining: number }>;
};

const initialState: CareerState = {
  credits: 1240,
  ownedIds: players.map((player) => player.id),
  starterIds: players.filter((player) => player.starter).map((player) => player.id),
  wins: 12,
  losses: 6,
  trainingDone: false,
  lastResult: null,
  directorChoice: null,
  directorMessage: "A diretoria espera uma campanha competitiva.",
  challengeProgress: { defense: 0, three: 0 },
  completedChallenges: [],
  seasonEnded: false,
  seasonAward: null,
  season: 1,
  round: 19,
  difficulty: "Normal",
  seasonHistory: [],
  playerProgress: Object.fromEntries(players.map((player) => [player.id, 0])),
  retiredIds: [],
  seasonBudget: 1240,
  seasonObjective: "Campanha competitiva",
  contracts: Object.fromEntries(Object.entries(contractDefaults).map(([id, contract]) => [id, { salary: contract.salary, yearsRemaining: contract.years }])),
};

type CareerContextValue = CareerState & {
  hydrated: boolean;
  roster: Array<Player & { salary: number; contractYears: number }> ;
  toggleStarter: (playerId: string) => void;
  buyPlayer: (playerId: string, cost: number) => boolean;
  train: () => void;
  playGame: (strategy: string) => { homeScore: number; awayScore: number };
  chooseDirectorDecision: (choice: string) => void;
  startNextSeason: (budgetBonus?: number, difficulty?: "Normal" | "Desafio", objective?: string) => void;
  renewContract: (playerId: string, years?: number) => boolean;
  resetCareer: () => void;
};

const CareerContext = createContext<CareerContextValue | null>(null);

export function CareerProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<CareerState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();
  const remoteHydratedFor = useRef<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try { setState({ ...initialState, ...JSON.parse(stored) }); } catch { setState(initialState); }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated || !user) {
      remoteHydratedFor.current = null;
      return;
    }
    let cancelled = false;
    remoteHydratedFor.current = null;
    supabase.from("career_snapshots").select("state").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (cancelled) return;
      if (data?.state) setState({ ...initialState, ...(data.state as Partial<CareerState>) });
      remoteHydratedFor.current = user.id;
    }, () => {
      remoteHydratedFor.current = user.id;
    });
    return () => { cancelled = true; };
  }, [hydrated, user?.id]);

  useEffect(() => {
    if (!hydrated || !user || remoteHydratedFor.current !== user.id) return;
    supabase.from("career_snapshots").upsert({ user_id: user.id, state, updated_at: new Date().toISOString() }).then(({ error }) => {
      if (error) console.warn("[Supabase] Falha ao sincronizar carreira:", error.message);
    });
  }, [hydrated, state, user?.id]);

  const value = useMemo<CareerContextValue>(() => ({
    ...state,
    hydrated,
    roster: players.filter((player) => state.ownedIds.includes(player.id) && !state.retiredIds.includes(player.id)).map((player) => { const age = player.age + state.season - 1; const agePenalty = age >= 30 ? Math.min(6, Math.floor((age - 29) / 2)) : 0; const contract = state.contracts[player.id] ?? { salary: 100, yearsRemaining: 1 }; return { ...player, age, overall: Math.max(60, player.overall + (state.playerProgress[player.id] ?? 0) - agePenalty), salary: contract.salary, contractYears: contract.yearsRemaining, starter: state.starterIds.includes(player.id) }; }),
    toggleStarter: (playerId) => setState((current) => {
      const isStarter = current.starterIds.includes(playerId);
      if (isStarter) return { ...current, starterIds: current.starterIds.filter((id) => id !== playerId) };
      if (current.starterIds.length >= 5) return current;
      return { ...current, starterIds: [...current.starterIds, playerId] };
    }),
    buyPlayer: (playerId, cost) => {
      let success = false;
      setState((current) => {
        if (current.ownedIds.includes(playerId) || current.credits < cost) return current;
        success = true;
        return { ...current, credits: current.credits - cost, ownedIds: [...current.ownedIds, playerId], contracts: { ...current.contracts, [playerId]: { salary: Math.max(85, Math.round(cost * 0.28)), yearsRemaining: 2 } } };
      });
      return success;
    },
    train: () => setState((current) => ({ ...current, trainingDone: true })),
    playGame: (strategy) => {
      const result = simulateMatch(78, 84, strategy);
      const won = result.homeScore > result.awayScore;
      let nextResult: { homeScore: number; awayScore: number } = result;
      setState((current) => {
        const nextWins = current.wins + (won ? 1 : 0);
        const defenseProgress = result.awayScore < 72 ? current.challengeProgress.defense + 1 : current.challengeProgress.defense;
        const threeProgress = strategy === "three" && result.homeScore > 80 ? current.challengeProgress.three + 1 : current.challengeProgress.three;
        const completed = [...current.completedChallenges];
        if (defenseProgress >= 1 && !completed.includes("defense")) completed.push("defense");
        if (threeProgress >= 1 && !completed.includes("three")) completed.push("three");
        const nextLosses = current.losses + (won ? 0 : 1);
        const seasonEnded = nextWins >= 18;
        const seasonAward = seasonEnded ? (nextWins >= 20 ? "Campeão da Conferência" : "Campanha de destaque") : current.seasonAward;
        const seasonHistory = seasonEnded && !current.seasonEnded ? [...current.seasonHistory, { season: current.season, wins: nextWins, losses: nextLosses, award: seasonAward ?? "Campanha concluída" }] : current.seasonHistory;
        const payroll = current.ownedIds.reduce((total, id) => total + (current.contracts[id]?.salary ?? 100), 0);
        return { ...current, lastResult: nextResult, wins: nextWins, losses: nextLosses, round: current.round + 1, credits: Math.max(0, current.credits + (won ? 120 : 35) + (completed.length - current.completedChallenges.length) * 180 - payroll), trainingDone: false, directorMessage: won ? "Boa resposta. A diretoria liberou verba extra para o próximo desafio." : "A diretoria pede reação imediata no próximo jogo.", challengeProgress: { defense: defenseProgress, three: threeProgress }, completedChallenges: completed, seasonEnded, seasonAward, seasonHistory };
      });
      return nextResult;
    },
    chooseDirectorDecision: (choice) => setState((current) => ({ ...current, directorChoice: choice, credits: current.credits + (choice === "base" ? 40 : 25), directorMessage: choice === "base" ? "A base recebeu investimento e um novo talento será observado." : "A torcida ganhou prioridade e o ginásio terá clima especial." })),
    renewContract: (playerId, years = 2) => {
      let success = false;
      setState((current) => {
        const contract = current.contracts[playerId] ?? { salary: 100, yearsRemaining: 0 };
        const fee = contract.salary * years;
        if (!current.ownedIds.includes(playerId) || current.credits < fee) return current;
        success = true;
        return { ...current, credits: current.credits - fee, contracts: { ...current.contracts, [playerId]: { ...contract, yearsRemaining: contract.yearsRemaining + years } } };
      });
      return success;
    },
    startNextSeason: (budgetBonus = 300, difficultyOption, objective) => setState((current) => {
      const playerProgress = { ...current.playerProgress };
      const retiredIds = [...current.retiredIds];
      current.ownedIds.forEach((id) => {
        const player = players.find((item) => item.id === id);
        if (!player) return;
        const nextAge = player.age + current.season;
        if (nextAge >= 35 && !retiredIds.includes(id)) retiredIds.push(id);
        const gain = player.potential === "Elite" || player.potential === "Muito alto" ? 2 : player.potential === "Alto" ? 1 : 0;
        playerProgress[id] = (playerProgress[id] ?? 0) + gain;
      });
      const nextDifficulty: "Normal" | "Desafio" = difficultyOption ?? (current.season % 2 === 0 ? "Normal" : "Desafio");
      return { ...current, season: current.season + 1, round: 1, wins: 0, losses: 0, credits: current.credits + budgetBonus, seasonBudget: current.credits + budgetBonus, difficulty: nextDifficulty, seasonObjective: objective ?? (nextDifficulty === "Desafio" ? "Campanha de elite" : "Campanha competitiva"), trainingDone: false, lastResult: null, directorChoice: null, directorMessage: retiredIds.length > current.retiredIds.length ? "A temporada começa com uma despedida no elenco. A diretoria espera reação." : "Nova temporada, novas metas. A diretoria espera evolução.", challengeProgress: { defense: 0, three: 0 }, completedChallenges: [], seasonEnded: false, seasonAward: null, playerProgress, retiredIds, starterIds: current.starterIds.filter((id) => !retiredIds.includes(id)), contracts: Object.fromEntries(Object.entries(current.contracts).map(([id, contract]) => [id, { ...contract, yearsRemaining: Math.max(0, contract.yearsRemaining - 1) }])) };
    }),
    resetCareer: () => setState(initialState),
  }), [state, hydrated]);

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error("useCareer must be used inside CareerProvider");
  return context;
}
