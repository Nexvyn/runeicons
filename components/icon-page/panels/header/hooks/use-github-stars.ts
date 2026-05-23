"use client";
import { useEffect, useState } from "react";
import { animate } from "motion/react";
export function useGitHubStars() {
  const [displayCount, setDisplayCount] = useState<string>("0");
  useEffect(() => {
    let controls: any;
    const fetchStars = async () => {
      try {
        const response = await fetch("https://api.github.com/repos/rune-icon/runeicons");
        if (response.ok) {
          const data = await response.json();
          const stars = data.stargazers_count;
          controls = animate(0, stars, {
            duration: 2,
            ease: "easeOut",
            onUpdate(value) {
              const current = Math.floor(value);
              if (current >= 1000) {
                setDisplayCount((current / 1000).toFixed(1) + "K");
              } else {
                setDisplayCount(current.toString());
              }
            },
          });
        }
      } catch (error) {
        console.error("Error fetching stars:", error);
      }
    };
    fetchStars();
    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, []);
  return displayCount;
}
