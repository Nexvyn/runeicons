"use client";
import { useRouter } from "next/navigation";

import * as m from "motion/react-m";

const BackButton = () => {
  const router = useRouter();

  return (
    <m.button
      data-detail-keep
      onClick={() => router.push("/")}
      aria-label="Go to home"
      className="group absolute top-8 left-8 z-50 flex size-9 cursor-pointer items-center justify-center rounded-md text-[#595959] transition-colors hover:text-white"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </m.button>
  );
};

export default BackButton;
