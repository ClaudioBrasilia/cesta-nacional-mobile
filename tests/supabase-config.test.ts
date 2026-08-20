import { describe, expect, it } from "vitest";

describe("configuração Supabase", () => {
  it("aceita URL e chave anon configuradas e alcança a API", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    expect(url).toMatch(/^https:\/\/[^\s]+$/);
    expect(anonKey).toBeTruthy();

    const response = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: anonKey as string, Authorization: `Bearer ${anonKey}` },
    });
    expect([200, 401, 404]).toContain(response.status);
  }, 15000);
});
