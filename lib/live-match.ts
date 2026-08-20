export type LiveStrategy = "control" | "three" | "defense" | "pace";

export type LiveEvent = {
  quarter: number;
  clock: string;
  text: string;
  tone: "neutral" | "positive" | "warning";
};

const strategyLabels: Record<LiveStrategy, string> = {
  control: "Controle",
  three: "Bola de 3",
  defense: "Defesa forte",
  pace: "Jogo rápido",
};

const quarterMoments = ["08:42", "05:18", "02:06", "00:31"];

export function getStrategyLabel(strategy: LiveStrategy) {
  return strategyLabels[strategy];
}

export function createQuarterEvent(quarter: number, strategy: LiveStrategy, opponent: string): LiveEvent {
  const clock = quarterMoments[(quarter - 1) % quarterMoments.length];
  if (strategy === "three") {
    return { quarter, clock, text: `Davi Moura encontra espaço e converte uma bola de três contra ${opponent}.`, tone: "positive" };
  }
  if (strategy === "defense") {
    return { quarter, clock, text: "A defesa fecha o garrafão e força um erro na posse adversária.", tone: "positive" };
  }
  if (strategy === "pace") {
    return { quarter, clock, text: "Transição rápida: Caio acelera e acha Lucas livre no contra-ataque.", tone: "positive" };
  }
  return { quarter, clock, text: quarter === 1 ? "A equipe começa controlando a posse e lendo a defesa." : "O time trabalha a bola até encontrar o arremesso de maior segurança.", tone: "neutral" };
}

export function createQuarterWarning(quarter: number): LiveEvent {
  return { quarter, clock: quarterMoments[(quarter + 1) % quarterMoments.length], text: quarter === 3 ? "Rafaão chega à terceira falta e precisa de atenção na defesa." : "O adversário encaixa uma sequência curta e o banco pede concentração.", tone: "warning" };
}

export function getQuarterScore(quarter: number, strategy: LiveStrategy) {
  const base = 17 + quarter;
  const bonus = strategy === "three" ? 2 : strategy === "pace" ? 1 : 0;
  const opponent = strategy === "defense" ? 15 + Math.max(0, quarter - 2) : 17;
  return { home: base + bonus, away: opponent };
}

export function getSubstitutionEvent(quarter: number): LiveEvent {
  return { quarter, clock: quarterMoments[(quarter + 2) % quarterMoments.length], text: "Vitor entra para dar energia ao perímetro e o quinteto ganha fôlego.", tone: "neutral" };
}
