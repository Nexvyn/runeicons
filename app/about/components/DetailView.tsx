"use client";
import {
  ChevronLeft,
  ChevronRight,
  Disc as Discord,
  Globe,
  X,
} from "lucide-react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import XIcon from "./icons/XIcon";

const SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};
const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const SWIFT = [0.19, 1, 0.22, 1] as const;
const TIMING = {
  panelOpacity: 0.22,
  nav: 0.2,
  navDelay: 0.1,
  info: 0.28,
  drawer: 0.3,
};
const INFO_BLUR_PX = 8;
const DRAWER_DISMISS_DISTANCE = 120;
const DRAWER_DISMISS_VELOCITY = 600;

interface DetailViewProps {
  user: {
    id: number;
    name: string;
    img: string;
    description?: string;
    industry?: string;
    status?: string;
    socials?: { type: string; url: string }[];
  };
  direction: 1 | -1;
  isMobile?: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const DetailView = ({
  user,
  isMobile = false,
  onClose,
  onNext,
  onPrev,
}: DetailViewProps) => {
  const reduceMotion = useReducedMotion();

  if (isMobile) {
    return (
      <m.div
        data-detail-keep
        className="fixed right-0 bottom-0 left-0 z-50 flex h-[60vh] flex-col rounded-t-3xl border-t border-border bg-background/95 backdrop-blur-xl"
        initial={{ y: reduceMotion ? 0 : "100%" }}
        animate={{ y: 0 }}
        exit={{ y: reduceMotion ? 0 : "100%" }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: TIMING.drawer, ease: SWIFT }
        }
        drag={reduceMotion ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (
            info.offset.y > DRAWER_DISMISS_DISTANCE ||
            info.velocity.y > DRAWER_DISMISS_VELOCITY
          ) {
            onClose();
          }
        }}
      >
        <div className="mx-auto mt-3 mb-2 h-1 w-12 shrink-0 rounded-full bg-muted-foreground/20" />

        <div className="flex shrink-0 items-center justify-between px-6 pt-1 pb-2">
          <button
            onClick={onClose}
            aria-label="Close detail view"
            className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-1 rounded-full p-1">
            <button
              onClick={onPrev}
              aria-label="Previous member"
              className="cursor-pointer rounded-full p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={onNext}
              aria-label="Next member"
              className="cursor-pointer rounded-full p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-8">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={`info-mobile-${user.id}`}
              initial={{
                opacity: 0,
                y: reduceMotion ? 0 : 4,
                filter: reduceMotion ? "blur(0px)" : `blur(${INFO_BLUR_PX}px)`,
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: reduceMotion ? 0 : -4,
                filter: reduceMotion ? "blur(0px)" : `blur(${INFO_BLUR_PX}px)`,
              }}
              transition={{ duration: TIMING.info, ease: EASE_OUT }}
            >
              <h2 className="mb-4 font-['Syne'] text-3xl font-bold text-foreground">
                {user.name}
              </h2>
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">
                {user.description}
              </p>

              <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">
                    Industry
                  </span>
                  <span className="text-foreground">{user.industry}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">
                    Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${user.status === "Active" ? "bg-[#D4FF00]" : "bg-gray-500"}`}
                    ></span>
                    <span className="text-foreground">{user.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user.socials?.map((social) => (
                  <a
                    key={social.url}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full p-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social.type === "globe" && <Globe size={20} />}
                    {social.type === "twitter" && <XIcon size={20} />}
                    {social.type === "discord" && <Discord size={20} />}
                  </a>
                ))}
              </div>
            </m.div>
          </AnimatePresence>
        </div>
      </m.div>
    );
  }

  const rightPanelTransition = reduceMotion
    ? { duration: TIMING.panelOpacity, ease: EASE_OUT }
    : {
        x: SPRING,
        opacity: { duration: TIMING.panelOpacity, ease: EASE_OUT },
      };

  return (
    <>
      <m.button
        data-detail-keep
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: TIMING.panelOpacity, ease: EASE_OUT }}
        className="fixed top-8 right-8 z-60 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Close detail view"
      >
        <X size={24} />
      </m.button>

      <m.div
        data-detail-keep
        className="fixed bottom-4 left-[35%] z-60 flex items-center gap-2 rounded-md px-2 py-2"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        transition={{
          duration: TIMING.nav,
          delay: TIMING.navDelay,
          ease: EASE_OUT,
        }}
      >
        <button
          onClick={onPrev}
          aria-label="Previous member"
          className="group cursor-pointer rounded-full p-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={onNext}
          aria-label="Next member"
          className="cursor-pointer rounded-full p-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </m.div>

      <m.div
        data-detail-keep
        initial={{ x: reduceMotion ? 0 : 24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: reduceMotion ? 0 : 24, opacity: 0 }}
        transition={rightPanelTransition}
        className="fixed top-0 right-0 bottom-0 z-50 flex w-[30%] flex-col justify-center border-l border-border bg-background/55 p-12 backdrop-blur-xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={`info-${user.id}`}
            initial={{
              opacity: 0,
              y: reduceMotion ? 0 : 4,
              filter: reduceMotion ? "blur(0px)" : `blur(${INFO_BLUR_PX}px)`,
            }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              y: reduceMotion ? 0 : -4,
              filter: reduceMotion ? "blur(0px)" : `blur(${INFO_BLUR_PX}px)`,
            }}
            transition={{ duration: TIMING.info, ease: EASE_OUT }}
          >
            <h2 className="mb-6 font-['Syne'] text-4xl font-bold text-foreground">
              {user.name}
            </h2>

            <p className="mb-8 text-base leading-relaxed text-muted-foreground">
              {user.description}
            </p>

            <div className="mb-10 grid grid-cols-1 gap-y-6 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">
                  Industry
                </span>
                <span className="text-foreground">{user.industry}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${user.status === "Active" ? "bg-[#D4FF00]" : "bg-gray-500"}`}
                  ></span>
                  <span className="text-foreground">{user.status}</span>
                </div>
              </div>
            </div>

            <div className="mb-20 flex items-center gap-4">
              {user.socials?.map((social) => (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full p-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {social.type === "globe" && <Globe size={20} />}
                  {social.type === "twitter" && <XIcon size={20} />}
                  {social.type === "discord" && <Discord size={20} />}
                </a>
              ))}
            </div>
          </m.div>
        </AnimatePresence>
      </m.div>
    </>
  );
};

export default DetailView;
