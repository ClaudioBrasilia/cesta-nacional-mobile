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
};

const initialState: CareerState = {
  credits: 1240,
  ownedIds: players.map((player) => player.id),
  starterIds: players.filter((player) => player.starter).map((player) => player.id),
  wins: 12,
  losses: 6,
  trainingDone: false,
  lastResult: null,
};

type CareerContextValue = CareerState & {
  hydrated: boolean;
  roster: typeof players;
  toggleStarter: (playerId: string) => void;
  buyPlayer: (playerId: string, cost: number) => boolean;
  train: () => void;
  playGame: (strategy: string) => { homeScore: number; awayScore: number };
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
      setState((current) => ({ ...current, lastResult: result, wins: current.wins + (result.homeScore > result.awayScore ? 1 : 0), losses: current.losses + (result.homeScore <= result.awayScore ? 1 : 0), credits: current.credits + (result.homeScore > result.awayScore ? 120 : 35), trainingDone: false }));
      return result;
    },
    resetCareer: () => setState(initialState),
  }), [state, hydrated]);

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error("useCareer must be used inside CareerProvider");
  return context;
}
