import * as m from "motion/react-m";

import { Kbd } from "@/components/ui/kbd";

interface AudioControlProps {
  isMuted: boolean;
  onToggle: () => void;
}

const AudioControl = ({ isMuted, onToggle }: AudioControlProps) => {
  return (
    <m.button
      data-detail-keep
      onClick={onToggle}
      aria-label={isMuted ? "Unmute (M)" : "Mute (M)"}
      aria-pressed={isMuted}
      title={isMuted ? "Unmute (M)" : "Mute (M)"}
      className="group absolute top-8 left-20 z-50 flex cursor-pointer items-center justify-center rounded-md p-1 text-[#595959] transition-colors hover:text-white"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15 }}
    >
      <span className="relative inline-flex">
        <Kbd className="h-7 min-w-7 px-2 font-mono text-sm font-semibold">
          M
        </Kbd>
        {isMuted && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-[-3px] h-[1.5px] w-[calc(100%+6px)] origin-center bg-current"
            style={{ transform: "translateY(-50%) rotate(-18deg)" }}
          />
        )}
      </span>
    </m.button>
  );
};

export default AudioControl;
