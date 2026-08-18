import { describe, expect, it } from "vitest";
import { players, simulateMatch, teams } from "../lib/game-data";

describe("Cesta Nacional game data", () => {
  it("contains a complete fictional starting rotation", () => {
    expect(teams.length).toBeGreaterThanOrEqual(6);
    expect(players.filter((player) => player.starter)).toHaveLength(5);
    expect(players.every((player) => player.overall >= 1 && player.overall <= 99)).toBe(true);
  });

  it("simulates a valid basketball score", () => {
    const result = simulateMatch(78, 84, "defense");
    expect(result.homeScore).toBeGreaterThan(0);
    expect(result.awayScore).toBeGreaterThanOrEqual(58);
    expect(Number.isInteger(result.homeScore)).toBe(true);
    expect(Number.isInteger(result.awayScore)).toBe(true);
  });
});
