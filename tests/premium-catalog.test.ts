import { describe, expect, it } from "vitest";
import {
  PREMIUM_ENTITLEMENT_ID,
  PREMIUM_PRODUCT_ID,
  freeLimits,
  hasPremiumFeature,
  premiumFeatures,
  premiumLimits,
  premiumProduct,
} from "../lib/premium-catalog";

describe("Cesta Nacional Pro catalog", () => {
  it("keeps a stable non-consumable product identity", () => {
    expect(PREMIUM_PRODUCT_ID).toBe("cesta_pro_lifetime");
    expect(PREMIUM_ENTITLEMENT_ID).toBe("cesta_pro");
    expect(premiumProduct.type).toBe("non_consumable");
  });

  it("keeps free limits below Pro limits", () => {
    expect(freeLimits.activeCareerSlots).toBe(1);
    expect(premiumLimits.activeCareerSlots).toBe(3);
    expect(freeLimits.activeOnlineLeagues).toBe(1);
    expect(premiumLimits.activeOnlineLeagues).toBe(5);
    expect(freeLimits.unlimitedSeasons).toBe(false);
    expect(premiumLimits.unlimitedSeasons).toBe(true);
  });

  it("does not expose premium features without an entitlement", () => {
    expect(premiumFeatures.length).toBeGreaterThan(0);
    expect(hasPremiumFeature("advanced-scouting", false)).toBe(false);
    expect(hasPremiumFeature("advanced-scouting", true)).toBe(true);
  });
});
