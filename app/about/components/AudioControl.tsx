import * as m from "motion/react-m";
import { Volume2, VolumeX } from "lucide-react";

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
      className="group absolute bottom-8 left-8 z-50 flex cursor-pointer items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15 }}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      <span className="text-sm font-medium">M</span>
    </m.button>
  );
};

export default AudioControl;
