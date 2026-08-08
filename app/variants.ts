export type VariantKey = "a" | "b" | "c";

export interface VariantConfig {
  name: string;
  headline: string;
  ctaLabel: string;
  ctaStyle: string;
}

export const variants: Record<VariantKey, VariantConfig> = {
  a: {
    name: "Control",
    headline: "To get started, edit the page.tsx file.",
    ctaLabel: "Fire test event",
    ctaStyle: "bg-orange-700 hover:bg-orange-800",
  },
  b: {
    name: "Direct",
    headline: "Test your prototype in minutes.",
    ctaLabel: "Start testing",
    ctaStyle: "bg-emerald-700 hover:bg-emerald-800",
  },
  c: {
    name: "Playful",
    headline: "Go ahead. Click the button. You know you want to.",
    ctaLabel: "Do it",
    ctaStyle: "bg-indigo-700 hover:bg-indigo-800",
  },
};

export function resolveVariant(param: string | null): VariantKey {
  return param === "b" || param === "c" ? param : "a";
}