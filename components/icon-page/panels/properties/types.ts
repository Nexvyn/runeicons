import { CustomizationState, IconData } from "@/lib/types";

export interface PropertiesPanelProps {
  state: CustomizationState;
  selectedIcon?: IconData | null;
  onIconSelect?: (icon: IconData) => void;
  onDeleteIcon?: (id: string) => void;
  onChange: (updates: Partial<CustomizationState>) => void;
  onReset: () => void;
}

export interface CustomizationSectionProps {
  state: CustomizationState;
  onChange: (updates: Partial<CustomizationState>) => void;
  pathCount?: number;
}
