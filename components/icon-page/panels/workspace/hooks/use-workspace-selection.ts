"use client";

import { useCallback, useEffect, useState } from "react";
import { IconCategory, IconData, CustomizationState } from "@/lib/types";
import { DEFAULT_TRAY_ICONS } from "@/constants/workspace";
import { getIconDataById, type IconType } from "@/lib/icons";

function customIconToData(customIcon: { id: string; name: string; url: string }): IconData {
  return {
    id: customIcon.id,
    name: customIcon.name,
    url: customIcon.url,
    category: "custom",
    tags: ["custom", "upload"],
    iconType: "normal",
  };
}

type StoredSlot = { id: string; iconType?: IconType };

function parseTrayStorage(raw: string | null): StoredSlot[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed
      .map((entry): StoredSlot | null => {
        if (typeof entry === "string") return { id: entry };
        if (entry && typeof entry === "object" && typeof entry.id === "string") {
          return { id: entry.id, iconType: entry.iconType };
        }
        return null;
      })
      .filter((slot): slot is StoredSlot => slot !== null);
  } catch {
    return null;
  }
}

function parseSelectedStorage(raw: string | null): StoredSlot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.id === "string") {
      return { id: parsed.id, iconType: parsed.iconType };
    }
  } catch {
    return raw.length > 0 ? { id: raw } : null;
  }
  return raw.length > 0 ? { id: raw } : null;
}

export function useWorkspaceSelection(
  customIcons: CustomizationState["customIcons"] = [],
  iconType: IconType,
  isStorageReady = true,
) {
  const [activeCategory, setActiveCategory] = useState<IconCategory>("all");
  const [selectedIcon, setSelectedIcon] = useState<IconData | null>(null);
  const [trayIcons, setTrayIcons] = useState<IconData[]>(DEFAULT_TRAY_ICONS);
  const [hasLoaded, setHasLoaded] = useState(false);

  const resolveSlot = useCallback(
    (slot: StoredSlot): IconData | null => {
      const slotType = slot.iconType ?? iconType;
      const custom = customIcons.find((icon) => icon.id === slot.id);
      if (custom) return customIconToData(custom);
      const data = getIconDataById(slot.id, slotType);
      return data ? { ...data, iconType: slotType } : null;
    },
    [customIcons, iconType],
  );

  useEffect(() => {
    if (!isStorageReady || hasLoaded) return;

    try {
      const savedSelected = parseSelectedStorage(
        localStorage.getItem("rune_selected_icon_id"),
      );
      const savedTray = parseTrayStorage(
        localStorage.getItem("rune_tray_icon_ids"),
      );

      if (savedSelected) {
        const icon = resolveSlot(savedSelected);
        if (icon) setSelectedIcon(icon);
      }

      if (savedTray && savedTray.length > 0) {
        const icons = savedTray
          .map(resolveSlot)
          .filter((icon): icon is IconData => icon !== null);
        if (icons.length > 0) setTrayIcons(icons);
      }
    } catch (error) {
      console.error("Failed to load selection from storage:", error);
    } finally {
      setHasLoaded(true);
    }
  }, [hasLoaded, isStorageReady, resolveSlot]);

  useEffect(() => {
    if (!hasLoaded) return;

    try {
      if (selectedIcon) {
        localStorage.setItem(
          "rune_selected_icon_id",
          JSON.stringify({
            id: selectedIcon.id,
            iconType: selectedIcon.iconType,
          }),
        );
      } else {
        localStorage.removeItem("rune_selected_icon_id");
      }
      localStorage.setItem(
        "rune_tray_icon_ids",
        JSON.stringify(
          trayIcons.map((icon) => ({
            id: icon.id,
            iconType: icon.iconType,
          })),
        ),
      );
    } catch (error) {
      console.error("Failed to save selection to storage:", error);
    }
  }, [hasLoaded, selectedIcon, trayIcons]);

  const handleIconSelect = useCallback(
    (icon: IconData) => {
      const stamped: IconData = {
        ...icon,
        iconType: icon.iconType ?? iconType,
      };
      setSelectedIcon(stamped);
      setTrayIcons((previous) => {
        const existingIndex = previous.findIndex(
          (trayIcon) => trayIcon.id === stamped.id,
        );
        if (existingIndex >= 0) {
          const next = [...previous];
          next[existingIndex] = stamped;
          return next;
        }
        if (previous.length >= 8) return [stamped, ...previous.slice(0, 7)];
        return [stamped, ...previous];
      });
    },
    [iconType],
  );

  const handleRemoveFromTray = useCallback((iconId: string) => {
    setTrayIcons((previous) =>
      previous.filter((icon) => icon.id !== iconId),
    );
  }, []);

  const handleRemoveById = useCallback((id: string) => {
    setTrayIcons((previous) => previous.filter((icon) => icon.id !== id));
    setSelectedIcon((previous) => (previous?.id === id ? null : previous));
  }, []);

  return {
    activeCategory,
    setActiveCategory,
    selectedIcon,
    setSelectedIcon,
    trayIcons,
    handleIconSelect,
    handleRemoveFromTray,
    handleRemoveById,
  };
}
