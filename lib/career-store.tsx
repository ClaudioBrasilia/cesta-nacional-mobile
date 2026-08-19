import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { players, simulateMatch } from "@/lib/game-data";

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
};

type CareerContextValue = CareerState & {
  hydrated: boolean;
  roster: typeof players;
  toggleStarter: (playerId: string) => void;
  buyPlayer: (playerId: string, cost: number) => boolean;
  train: () => void;
  playGame: (strategy: string) => { homeScore: number; awayScore: number };
  chooseDirectorDecision: (choice: string) => void;
  startNextSeason: () => void;
  resetCareer: () => void;
};

const CareerContext = createContext<CareerContextValue | null>(null);

export function CareerProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<CareerState>(initialState);
  const [hydrated, setHydrated] = useState(false);

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

  const value = useMemo<CareerContextValue>(() => ({
    ...state,
    hydrated,
    roster: players.filter((player) => state.ownedIds.includes(player.id)).map((player) => ({ ...player, starter: state.starterIds.includes(player.id) })),
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
        return { ...current, credits: current.credits - cost, ownedIds: [...current.ownedIds, playerId] };
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
        return { ...current, lastResult: nextResult, wins: nextWins, losses: nextLosses, round: current.round + 1, credits: current.credits + (won ? 120 : 35) + (completed.length - current.completedChallenges.length) * 180, trainingDone: false, directorMessage: won ? "Boa resposta. A diretoria liberou verba extra para o próximo desafio." : "A diretoria pede reação imediata no próximo jogo.", challengeProgress: { defense: defenseProgress, three: threeProgress }, completedChallenges: completed, seasonEnded, seasonAward, seasonHistory };
      });
      return nextResult;
    },
    chooseDirectorDecision: (choice) => setState((current) => ({ ...current, directorChoice: choice, credits: current.credits + (choice === "base" ? 40 : 25), directorMessage: choice === "base" ? "A base recebeu investimento e um novo talento será observado." : "A torcida ganhou prioridade e o ginásio terá clima especial." })),
    startNextSeason: () => setState((current) => ({ ...current, season: current.season + 1, round: 1, wins: 0, losses: 0, credits: current.credits + 300, difficulty: current.season % 2 === 0 ? "Normal" : "Desafio", trainingDone: false, lastResult: null, directorChoice: null, directorMessage: "Nova temporada, novas metas. A diretoria espera evolução.", challengeProgress: { defense: 0, three: 0 }, completedChallenges: [], seasonEnded: false, seasonAward: null })),
    resetCareer: () => setState(initialState),
  }), [state, hydrated]);

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error("useCareer must be used inside CareerProvider");
  return context;
}
