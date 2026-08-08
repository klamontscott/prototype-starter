"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import posthog from "posthog-js";
import { variants, resolveVariant, type VariantKey } from "./variants";

export function useVariant() {
  const searchParams = useSearchParams();
  const key: VariantKey = resolveVariant(searchParams.get("variant"));

  useEffect(() => {
    posthog.register({ variant: key });
  }, [key]);

  return { key, config: variants[key] };
}