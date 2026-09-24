import { defineComponent, h, type PropType } from "vue";

import { getIconById, type IconType } from "./icons";

export const RuneIcon = defineComponent({
  name: "RuneIcon",
  props: {
    name: { type: String, required: true },
    type: { type: String as PropType<IconType>, default: "normal" },
    size: { type: Number, default: 24 },
  },
  setup(props) {
    return () => {
      const variant = getIconById(props.name)?.variants[props.type];
      if (!variant) return null;
      return h("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: props.size,
        height: props.size,
        viewBox: variant.viewBox,
        innerHTML: variant.markup,
      });
    };
  },
});

export {
  ICON_TYPES,
  availableTypes,
  buildSvg,
  getIconById,
  searchIcons,
  type IconEntry,
  type IconType,
} from "./icons";
