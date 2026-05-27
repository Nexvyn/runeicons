"use client";

import { useMemo, useState } from "react";

import { getIconsForType, type IconType } from "@/lib/icons";
import type { IconData } from "@/lib/types";

export function useLandingSearch(iconType: IconType, limit = 25) {
  const [query, setQuery] = useState("");

  const allIcons = useMemo<IconData[]>(() => getIconsForType(iconType), [iconType]);

  const results = useMemo<IconData[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allIcons.slice(0, limit);

    const matches: IconData[] = [];
    for (const icon of allIcons) {
      if (
        icon.name.toLowerCase().includes(trimmed) ||
        icon.tags.some((tag) => tag.toLowerCase().includes(trimmed))
      ) {
        matches.push(icon);
        if (matches.length >= limit) break;
      }
    }
    return matches;
  }, [allIcons, query, limit]);

  return { query, setQuery, results };
}
