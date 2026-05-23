import { IconData, IconCategory, CustomizationState } from "@/lib/types";
import type { IconType } from "@/lib/icons";
export interface IconLibraryPanelProps {
  onIconSelect?: (icon: IconData) => void;
  selectedIconId?: string | null;
  selectedCategory: IconCategory;
  onCategoryChange: (category: IconCategory) => void;
  customIcons?: Array<{ id: string; name: string; url: string }>;
  iconType: IconType;
  customizationState?: CustomizationState;
}
