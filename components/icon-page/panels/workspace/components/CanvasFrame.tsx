import { ReactNode } from "react";

import { AnimatePresence, motion } from "motion/react";

import { WorkspaceGround } from "./WorkspaceGround";

interface CanvasFrameProps {
  children: ReactNode;
  trayNode: ReactNode;
  showGrid: boolean;
}

export function CanvasFrame({ children, trayNode, showGrid }: CanvasFrameProps) {
  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <WorkspaceGround />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 flex flex-1 flex-col min-h-0 h-full cursor-default">
        {children}
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center -translate-y-10">
          <svg
            width="1100"
            height="800"
            viewBox="0 0 1100 800"
            preserveAspectRatio="xMidYMid meet"
            className="max-w-full max-h-full w-auto h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <foreignObject x={150} y={650} width={800} height={100}>
              <div className="w-full h-full pointer-events-auto">
                {trayNode}
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>
    </div>
  );
}
