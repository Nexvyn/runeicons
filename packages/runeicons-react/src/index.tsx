import { getIconById, type IconType } from "./icons";

export interface RuneIconProps {
  name: string;
  type?: IconType;
  size?: number;
}

export function RuneIcon({ name, type = "normal", size = 24 }: RuneIconProps) {
  const variant = getIconById(name)?.variants[type];
  if (!variant) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={variant.viewBox}
      dangerouslySetInnerHTML={{ __html: variant.markup }}
    />
  );
}

export {
  ICON_TYPES,
  availableTypes,
  buildSvg,
  getIconById,
  searchIcons,
  type IconEntry,
  type IconType,
} from "./icons";
