export const PREMIUM_PRODUCT_ID = "cesta_pro_lifetime" as const;
export const PREMIUM_ENTITLEMENT_ID = "cesta_pro" as const;

export const premiumProduct = {
  id: PREMIUM_PRODUCT_ID,
  entitlement: PREMIUM_ENTITLEMENT_ID,
  name: "Cesta Nacional Pro",
  type: "non_consumable",
} as const;

export const freeLimits = {
  activeCareerSlots: 1,
  activeOnlineLeagues: 1,
  unlimitedSeasons: false,
} as const;

export const premiumLimits = {
  activeCareerSlots: 3,
  activeOnlineLeagues: 5,
  unlimitedSeasons: true,
} as const;

export const premiumFeatures = [
  "career-slots",
  "unlimited-seasons",
  "advanced-scouting",
  "specialized-training",
  "challenge-history",
  "league-history",
  "cross-device-sync",
] as const;

export type PremiumFeature = (typeof premiumFeatures)[number];

export function hasPremiumFeature(feature: PremiumFeature, isPremium: boolean) {
  return isPremium && premiumFeatures.includes(feature);
}
