export type VariantKey = "a" | "b" | "c";

export interface VariantConfig {
  name: string;
  headline: string;
  ctaLabel: string;
  ctaStyle: string;
  layout: "list" | "cards" | "table";
}

export const variants: Record<VariantKey, VariantConfig> = {
  a: {
    name: "Control",
    headline: "Research Sessions",
    ctaLabel: "Fire test event",
    ctaStyle: "bg-orange-700 hover:bg-orange-800",
    layout: "list",
  },
  b: {
    name: "Comfortable",
    headline: "Your recent sessions",
    ctaLabel: "Start testing",
    ctaStyle: "bg-emerald-700 hover:bg-emerald-800",
    layout: "cards",
  },
  c: {
    name: "Dense",
    headline: "Sessions",
    ctaLabel: "Do it",
    ctaStyle: "bg-indigo-700 hover:bg-indigo-800",
    layout: "table",
  },
};

export function resolveVariant(param: string | null): VariantKey {
  return param === "b" || param === "c" ? param : "a";
}