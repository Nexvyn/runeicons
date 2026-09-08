import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { IconCategory, IconData } from "@/lib/types";
import { getIconsForType, type IconType } from "@/lib/icons";
export function useIconLibrary(
  selectedCategory: IconCategory,
  iconType: IconType,
  onIconSelect?: (icon: IconData) => void,
  customIcons: Array<{ id: string; name: string; url: string }> = []
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 120);
    return () => clearTimeout(id);
  }, [searchQuery]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const allIcons = useMemo(() => [
    ...getIconsForType(iconType),
    ...customIcons.map((ci) => ({
      id: ci.id,
      name: ci.name,
      url: ci.url,
      category: "custom" as const,
      iconType: "normal" as const,
      tags: ["custom", "upload"],
    })),
  ], [iconType, customIcons]);
  const filteredIcons = useMemo(() => {
    let icons = allIcons;
    if (selectedCategory !== "all") {
      icons = icons.filter((icon) => icon.category === selectedCategory);
    }
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      icons = icons.filter(
        (icon) =>
          icon.name.toLowerCase().includes(query) ||
          icon.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }
    return icons;
  }, [allIcons, debouncedQuery, selectedCategory]);
  const handleIconClick = useCallback(
    (icon: IconData) => {
      onIconSelect?.(icon);
    },
    [onIconSelect],
  );
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);
  return {
    searchQuery,
    setSearchQuery,
    filteredIcons,
    handleIconClick,
    clearSearch,
    searchInputRef,
  };
}
