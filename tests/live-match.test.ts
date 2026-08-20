import { describe, expect, it } from "vitest";
import { createQuarterEvent, getQuarterScore, getSubstitutionEvent } from "../lib/live-match";

describe("partida acompanhada", () => {
  it("gera um evento coerente para cada estratégia", () => {
    expect(createQuarterEvent(1, "three", "Minas Montanha").text).toContain("bola de três");
    expect(createQuarterEvent(2, "defense", "Minas Montanha").text).toContain("defesa");
  });

  it("mantém pontuação positiva e diferencia defesa de ritmo", () => {
    const defensive = getQuarterScore(3, "defense");
    const fast = getQuarterScore(3, "pace");
    expect(defensive.home).toBeGreaterThan(0);
    expect(defensive.away).toBeLessThan(fast.away);
  });

  it("registra substituição no quarto informado", () => {
    expect(getSubstitutionEvent(3).quarter).toBe(3);
    expect(getSubstitutionEvent(3).text).toContain("Vitor");
  });
});
