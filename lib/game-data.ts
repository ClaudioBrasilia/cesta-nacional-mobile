export type Position = "ARM" | "ALA" | "PIVÔ";

export type Player = {
  id: string;
  name: string;
  number: number;
  position: Position;
  overall: number;
  points: number;
  rebounds: number;
  assists: number;
  defense: number;
  energy: number;
  style: string;
  potential: string;
  starter: boolean;
};

export type Team = {
  id: string;
  name: string;
  city: string;
  color: string;
  wins: number;
  losses: number;
  power: number;
};

export const teams: Team[] = [
  { id: "cerrado", name: "Brasília Estrelas", city: "Distrito Federal", color: "#F47B20", wins: 12, losses: 6, power: 78 },
  { id: "minas", name: "Minas Montanha", city: "Minas Gerais", color: "#FFD166", wins: 14, losses: 4, power: 84 },
  { id: "central", name: "São Paulo Central", city: "São Paulo", color: "#5B8DEF", wins: 13, losses: 5, power: 82 },
  { id: "atlantico", name: "Recife Atlântico", city: "Pernambuco", color: "#3DDC97", wins: 10, losses: 8, power: 75 },
  { id: "farois", name: "Fortaleza Faróis", city: "Ceará", color: "#EE6C4D", wins: 9, losses: 9, power: 73 },
  { id: "fales", name: "Bauru Falcões", city: "São Paulo", color: "#A78BFA", wins: 11, losses: 7, power: 79 },
];

export const players: Player[] = [
  { id: "caio", name: "Caio Nascimento", number: 3, position: "ARM", overall: 84, points: 16.8, rebounds: 3.4, assists: 7.1, defense: 76, energy: 92, style: "Criador de jogadas", potential: "Elite", starter: true },
  { id: "davi", name: "Davi Moura", number: 7, position: "ARM", overall: 81, points: 18.5, rebounds: 3.1, assists: 3.9, defense: 72, energy: 88, style: "Especialista em três", potential: "Alto", starter: true },
  { id: "lucas", name: "Lucas Pacheco", number: 11, position: "ALA", overall: 79, points: 13.2, rebounds: 6.4, assists: 2.8, defense: 80, energy: 95, style: "Ala completo", potential: "Alto", starter: true },
  { id: "bruno", name: "Bruno Tavares", number: 23, position: "PIVÔ", overall: 82, points: 12.4, rebounds: 9.8, assists: 1.7, defense: 86, energy: 86, style: "Âncora defensiva", potential: "Elite", starter: true },
  { id: "rafa", name: "Rafael Duarte", number: 35, position: "PIVÔ", overall: 76, points: 10.1, rebounds: 8.2, assists: 1.1, defense: 82, energy: 79, style: "Força no garrafão", potential: "Médio", starter: false },
  { id: "italo", name: "Ítalo Santos", number: 1, position: "ARM", overall: 73, points: 8.7, rebounds: 2.8, assists: 4.6, defense: 69, energy: 98, style: "Jovem promessa", potential: "Muito alto", starter: false },
  { id: "murilo", name: "Murilo Reis", number: 14, position: "ALA", overall: 74, points: 9.4, rebounds: 4.9, assists: 1.9, defense: 75, energy: 91, style: "Sexto homem", potential: "Alto", starter: true },
];

export const marketPlayers = [
  { id: "vitor", name: "Vítor Almeida", position: "ALA" as Position, overall: 77, points: 11.8, rebounds: 4.7, assists: 2.4, defense: 78, energy: 96, style: "Defensor versátil", potential: "Alto", cost: 420 },
  { id: "joao", name: "João Viana", position: "ARM" as Position, overall: 75, points: 12.1, rebounds: 2.6, assists: 5.2, defense: 70, energy: 93, style: "Passe vertical", potential: "Muito alto", cost: 360 },
  { id: "leonardo", name: "Leonardo Siqueira", position: "PIVÔ" as Position, overall: 79, points: 9.8, rebounds: 8.9, assists: 1.3, defense: 84, energy: 82, style: "Protetor do aro", potential: "Alto", cost: 520 },
];

export const updateNotes = [
  { title: "Forma defensiva em alta", text: "Ajustes leves valorizaram jogadores que combinam rebotes, tocos e bolas recuperadas." },
  { title: "Mercado de jovens", text: "Novos talentos fictícios podem aparecer no mercado após a próxima rodada." },
  { title: "Desafio da rodada", text: "Vença uma partida sofrendo menos de 75 pontos para ganhar 150 créditos." },
];

export function simulateMatch(teamPower: number, opponentPower: number, strategy: string) {
  const strategyBoost = strategy === "three" ? 3 : strategy === "defense" ? 2 : strategy === "pace" ? 1 : 0;
  const homeScore = Math.round(72 + teamPower * 0.22 + strategyBoost * 2 + Math.random() * 12);
  const awayScore = Math.round(70 + opponentPower * 0.2 + Math.random() * 12);
  return { homeScore, awayScore: Math.max(awayScore - strategyBoost, 58) };
}
