"use client";

import { useEffect, useRef } from "react";

import { useAnimation, useReducedMotion } from "motion/react";
import { motion as m } from "motion/react";

const blinkTransition = {
  duration: 3.4,
  times: [0, 0.94, 0.97, 1],
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const REACT_UP = {
  scale: [1, 0.93, 1.09, 1],
  rotate: [0, -2.5, 2, 0],
};

const REACT_DOWN = {
  scale: [1, 0.96, 1],
  rotate: [0, 1.5, 0],
};

const heartFloat = (i: number) => ({
  duration: 2.2 + i * 0.25,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut" as const,
  delay: i * 0.12,
});

const mouthSpring = {
  type: "spring" as const,
  stiffness: 360,
  damping: 18,
  mass: 0.7,
};

const blushSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 13,
  mass: 0.7,
};

const heartSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 16,
  mass: 0.6,
};

const HEARTS: { clipId: string; d: string }[] = [
  {
    clipId: "clip0_536_2",
    d: "M4.2724 82.8809C3.8676 82.4266 3.61013 81.8602 3.534 81.2565C3.45787 80.6528 3.56666 80.0401 3.846 79.4995C4.12535 78.959 4.5621 78.5158 5.09858 78.2287C5.63506 77.9415 6.24603 77.8238 6.85079 77.8912C6.89255 77.895 6.93465 77.8902 6.97448 77.877C7.01431 77.8639 7.05102 77.8427 7.08233 77.8148C7.11364 77.7869 7.13889 77.7529 7.1565 77.7149C7.17412 77.6768 7.18373 77.6355 7.18474 77.5936C7.18438 76.9838 7.36976 76.3883 7.7162 75.8864C8.06265 75.3845 8.55373 75 9.12408 74.7842C9.69443 74.5683 10.317 74.5312 10.9089 74.6779C11.5009 74.8246 12.0341 75.1481 12.4376 75.6054C13.2707 76.5403 13.2803 77.7841 13.2136 78.9421L12.9042 83.1091C12.906 83.2643 12.8747 83.418 12.8125 83.5602C12.7503 83.7023 12.6585 83.8296 12.5433 83.9335C12.4282 84.0375 12.2922 84.1158 12.1444 84.1631C11.9966 84.2105 11.8405 84.2258 11.6863 84.2082L7.49796 84.035C6.33991 83.9683 5.10909 83.8199 4.2724 82.8809Z",
  },
  {
    clipId: "clip1_536_2",
    d: "M55.9643 13.2367C55.7793 12.4659 55.8325 11.6572 56.1169 10.9173C56.4012 10.1774 56.9033 9.54117 57.5568 9.09261C58.2103 8.64406 58.9845 8.40429 59.7772 8.40498C60.5698 8.40566 61.3436 8.64677 61.9964 9.09646C62.042 9.12655 62.0933 9.14696 62.1471 9.15641C62.2009 9.16586 62.256 9.16416 62.3092 9.15141C62.3623 9.13867 62.4122 9.11514 62.4559 9.0823C62.4995 9.04946 62.536 9.00801 62.5629 8.9605C62.938 8.26023 63.5175 7.6908 64.2242 7.328C64.9309 6.9652 65.7314 6.82624 66.519 6.92961C67.3066 7.03298 68.0441 7.37378 68.6333 7.90665C69.2224 8.43952 69.6353 9.13919 69.817 9.91253C70.1976 11.4987 69.4429 12.9324 68.6533 14.2207L65.7324 18.8135C65.6389 18.9927 65.5083 19.1499 65.3494 19.2748C65.1904 19.3997 65.0067 19.4893 64.8105 19.5377C64.6143 19.5861 64.41 19.5922 64.2112 19.5556C64.0124 19.5189 63.8237 19.4404 63.6576 19.3253L58.9563 16.5476C57.6681 15.758 56.3465 14.8298 55.9643 13.2367Z",
  },
  {
    clipId: "clip2_536_2",
    d: "M170.6 15.2812C170.813 14.8246 171.16 14.4434 171.594 14.1879C172.029 13.9325 172.530 13.8149 173.033 13.8506C173.536 13.8863 174.016 14.0737 174.410 14.388C174.804 14.7023 175.093 15.1287 175.240 15.6109C175.251 15.6439 175.268 15.6744 175.291 15.7004C175.314 15.7264 175.342 15.7474 175.374 15.7621C175.405 15.7768 175.440 15.7849 175.474 15.7858C175.509 15.7868 175.543 15.7806 175.576 15.7677C176.040 15.5679 176.553 15.5142 177.049 15.6136C177.544 15.7130 177.997 15.9609 178.348 16.3243C178.699 16.6877 178.931 17.1493 179.013 17.6477C179.095 18.1461 179.023 18.6577 178.807 19.1144C178.368 20.0541 177.425 20.4683 176.522 20.7964L173.250 21.9241C173.132 21.9762 173.005 22.0027 172.877 22.0019C172.748 22.0010 172.621 21.9728 172.504 21.9192C172.388 21.8655 172.284 21.7877 172.199 21.6907C172.115 21.5938 172.052 21.480 172.015 21.3569L170.777 18.1132C170.449 17.2102 170.159 16.2251 170.600 15.2812Z",
  },
  {
    clipId: "clip3_536_2",
    d: "M187.766 6.14723C188.199 5.51824 188.812 5.03525 189.524 4.76204C190.237 4.48883 191.016 4.43825 191.758 4.617C192.500 4.79574 193.171 5.19539 193.681 5.76317C194.191 6.33094 194.517 7.04013 194.616 7.79706C194.624 7.84908 194.642 7.89894 194.670 7.94354C194.698 7.98814 194.735 8.02654 194.778 8.05635C194.822 8.08615 194.871 8.10674 194.922 8.11683C194.974 8.12691 195.027 8.12629 195.078 8.11499C195.821 7.93226 196.602 7.98011 197.317 8.25218C198.032 8.52424 198.647 9.00762 199.081 9.63797C199.514 10.2683 199.746 11.0158 199.744 11.7808C199.742 12.5458 199.507 13.2921 199.071 13.9204C198.181 15.2148 196.668 15.5984 195.237 15.8633L190.068 16.7318C189.880 16.7804 189.683 16.7883 189.491 16.7550C189.300 16.7216 189.117 16.6479 188.956 16.5386C188.795 16.4294 188.659 16.2871 188.557 16.1212C188.455 15.9553 188.390 15.7697 188.365 15.5766L187.324 10.4220C187.059 8.99117 186.872 7.44728 187.766 6.14723Z",
  },
];

interface MascotProps {
  stage?: 1 | 2 | 3 | 4;
}

const Mascot = ({ stage = 1 }: MascotProps) => {
  const showMouth = stage >= 2;
  const showBlush = stage >= 3;
  const showHearts = stage >= 4;

  const shouldReduceMotion = useReducedMotion();
  const bodyControls = useAnimation();
  const breathControls = useAnimation();
  const previousStage = useRef(stage);
  const eyeRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    breathControls.start({
      scaleY: [1, 1.015, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    });
  }, [breathControls, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 8;
      ty = (e.clientY / window.innerHeight - 0.5) * 8;
    };
    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      const t = `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(1.08)`;
      eyeRefs.current.forEach((el) => el?.setAttribute("transform", t));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    const from = previousStage.current;
    if (from === stage) return;
    previousStage.current = stage;
    if (shouldReduceMotion) return;

    const goingUp = stage > from;
    bodyControls.start(goingUp ? REACT_UP : REACT_DOWN, {
      duration: goingUp ? 0.52 : 0.26,
      ease: [0.23, 1, 0.32, 1],
    });
  }, [stage, bodyControls, shouldReduceMotion]);

  return (
    <>
      <m.svg
        viewBox="0 0 248 195"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={breathControls}
        style={{ transformOrigin: "center bottom" }}
      >
        <m.g
          animate={bodyControls}
          style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
        >
          <path
            d="M197.087 19.2749C202.59 15.5089 209.123 13.227 215.81 15.2612L215.851 15.2739L215.894 15.2788C221.16 15.9353 228.783 18.5286 234.513 24.1518C240.218 29.7506 244.088 38.3909 241.83 51.2602L241.829 51.2681L241.828 51.2749C241.128 56.0993 236.898 66.9162 225.638 71.4214L225.13 71.6245L225.377 72.1118C237.52 96.0495 246.146 133.086 221.596 163.931C206.085 183.419 177.517 191.267 147.957 193.101C118.425 194.932 88.0517 190.751 69.1104 186.328C47.1499 181.201 15.2042 164.696 12.8144 122.079C11.7389 102.899 17.2682 85.9467 25.0977 72.1323L25.3184 71.7417L24.9551 71.48C10.8459 61.3032 7.43249 50.6926 8.7666 41.6069C10.1066 32.4822 16.2526 24.7613 21.5488 20.436C33.1746 13.8081 42.7345 14.3576 49.9648 17.6753C57.233 21.0104 62.206 27.1718 64.5508 31.8266L64.7812 32.2837L65.2334 32.0425C112.312 6.8543 154.898 15.9946 184.171 32.0395L184.578 32.2632L184.83 31.8735C187.189 28.2397 191.586 23.0395 197.087 19.2749Z"
            fill="white"
            stroke="black"
          />
          <path
            d="M221.596 163.931C246.146 133.086 237.52 96.0489 225.377 72.1112C218.383 63.146 200.64 42.0727 184.578 32.2626L184.171 32.0389C154.898 15.994 112.312 6.85371 65.2334 32.0419L64.7812 32.2831C43.8061 46.1096 29.733 64.3495 25.3184 71.7411L25.0977 72.1317C17.2682 85.9461 11.7389 102.899 12.8144 122.079C15.2042 164.696 47.1499 181.201 69.1104 186.328C88.0517 190.751 118.425 194.932 147.957 193.101C177.517 191.267 206.085 183.419 221.596 163.931Z"
            fill="white"
          />
          <path
            d="M225.377 72.1112L225.13 71.6239M225.377 72.1112C237.52 96.0489 246.146 133.086 221.596 163.931C206.085 183.419 177.517 191.267 147.957 193.101C118.425 194.932 88.0517 190.751 69.1104 186.328C47.1499 181.201 15.2042 164.696 12.8144 122.079C11.7389 102.899 17.2682 85.9461 25.0977 72.1317L25.3184 71.7411M225.377 72.1112C218.383 63.146 200.64 42.0727 184.578 32.2626M25.3184 71.7411L24.9551 71.4794M25.3184 71.7411C29.733 64.3495 43.8061 46.1096 64.7812 32.2831M64.5508 31.826L64.7812 32.2831M64.7812 32.2831L65.2334 32.0419C112.312 6.85371 154.898 15.994 184.171 32.0389L184.578 32.2626M184.578 32.2626L184.83 31.8729"
            stroke="black"
            strokeWidth="2"
          />
          <path
            d="M184 32.5C197.748 40.0353 197.826 41.7111 205.5 49C214.147 57.2128 221.767 66.126 225 72.5C236.482 67.9063 241.607 56.2798 242.323 51.3476C246.893 25.2953 226.649 16.1164 215.955 14.7835C202.174 10.591 188.773 25.1468 184 32.5Z"
            fill="black"
          />
          <path
            d="M21.5496 20.4364C33.1668 13.8142 42.8478 14.5806 50.2078 18.121C57.3762 21.5693 62.3876 27.673 64.8259 32.2841C61.7092 33.9174 56.4503 37.366 51.6912 41.1063C45.4295 46.0276 41.1811 49.5514 37.2927 53.9833C33.4788 58.3304 30.0253 63.5357 25.3425 71.7645C11.6058 61.6841 8.06816 51.0478 9.18726 41.9013C10.3225 32.6224 16.2635 24.7545 21.5496 20.4364Z"
            fill="black"
            stroke="black"
          />
          <m.path
            d="M140 155.5C138.5 172.5 110.5 169 112 155.5C118 158 125.5 149 125.5 149C128 152.5 134 158.5 140 155.5Z"
            fill="#FBBEBD"
            stroke="black"
            strokeWidth="4"
            strokeLinejoin="round"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center top",
            }}
            initial={false}
            animate={{
              scaleY: showMouth ? 1 : 0,
              opacity: showMouth ? 1 : 0,
            }}
            transition={{
              scaleY: mouthSpring,
              opacity: { duration: showMouth ? 0.18 : 0.14, ease: "easeOut" },
            }}
          />
          <g
            ref={(el) => {
              eyeRefs.current[0] = el;
            }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <path
              d="M45.1879 125.333C46.0751 100.048 61.4301 91.5083 68.9966 90.3993C80.8623 87.5688 90.8523 96.7202 92.9266 105.358C95.6953 125.847 84.3897 136.507 78.3908 139.275C50.7036 150.429 44.7192 134.628 45.1879 125.333Z"
              fill="black"
            />
            <circle cx="62" cy="112" r="2.6" fill="white" opacity="0.95" />
          </g>
          <g
            ref={(el) => {
              eyeRefs.current[1] = el;
            }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <path
              d="M160.103 128.833C150.383 109.124 158.078 97.6719 163.14 94.4095C166.178 91.6573 184.411 81.2473 199.589 105.354C211.732 124.639 202.849 137.142 196.889 140.983C188.677 145.146 169.823 148.545 160.103 128.833Z"
              fill="black"
            />
            <circle cx="178" cy="113" r="2.6" fill="white" opacity="0.95" />
          </g>
          <path
            d="M122.77 141.709C117.776 141.587 112.945 135.306 113.407 132.117C113.981 128.156 120.785 128.156 125.358 128.156C129.931 128.156 136.711 128.919 136.929 133.031C137.148 137.142 131.307 140.529 128.359 141.709C127.629 144.598 128.359 147.176 128.814 148.104C135.945 157.632 143.038 149.586 143.858 148.104C144.515 146.918 145.955 146.747 146.594 146.81C150.751 147.652 148.934 151.271 147.505 152.976C138.898 162.763 129.155 157.053 125.358 152.976C115.919 161.989 107.216 157.289 104.044 153.813C102.877 152.696 100.74 149.992 101.532 148.104C102.324 146.216 104.197 146.454 105.034 146.81C116.848 158.564 123.027 149.05 122.77 141.709Z"
            fill="black"
          />
          <m.path
            d="M75.5724 122.446C77.7791 123.631 80.8784 122.152 82.4948 119.143C84.1113 116.133 83.6329 112.733 81.4262 111.548C79.2195 110.362 76.1203 111.841 74.5038 114.851C72.8873 117.860 73.3658 121.261 75.5724 122.446Z"
            fill="white"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
            animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [1, 1, 0.1, 1] }}
            transition={shouldReduceMotion ? { duration: 0 } : blinkTransition}
          />
          <m.path
            d="M171.634 123.42C174.053 122.772 175.298 119.571 174.414 116.272C173.530 112.972 170.852 110.823 168.432 111.471C166.013 112.119 164.768 115.320 165.652 118.619C166.536 121.919 169.215 124.069 171.634 123.420Z"
            fill="white"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
            animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [1, 1, 0.1, 1] }}
            transition={shouldReduceMotion ? { duration: 0 } : blinkTransition}
          />
          <m.ellipse
            cx="58"
            cy="155"
            rx="13"
            ry="6"
            fill="#FCBFC1"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
            initial={false}
            animate={{
              opacity: showBlush ? 1 : 0,
              scale: showBlush ? 1 : 0.4,
            }}
            transition={blushSpring}
          />
          <m.ellipse
            cx="205.5"
            cy="152"
            rx="12.5"
            ry="6"
            fill="#FCBFC1"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
            initial={false}
            animate={{
              opacity: showBlush ? 1 : 0,
              scale: showBlush ? 1 : 0.4,
            }}
            transition={blushSpring}
          />
          {HEARTS.map((heart, i) => (
            <m.g
              key={heart.clipId}
              clipPath={`url(#${heart.clipId})`}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
              }}
              initial={false}
              animate={{
                opacity: showHearts ? 1 : 0,
                scale: showHearts ? 1 : 0.3,
                y: showHearts && !shouldReduceMotion ? [0, -5, 0] : showHearts ? 0 : 14,
              }}
              transition={{
                opacity: { ...heartSpring, delay: showHearts ? i * 0.07 : 0 },
                scale: { ...heartSpring, delay: showHearts ? i * 0.07 : 0 },
                y:
                  showHearts && !shouldReduceMotion
                    ? heartFloat(i)
                    : { ...heartSpring, delay: showHearts ? i * 0.07 : 0 },
              }}
            >
              <path
                d={heart.d}
                fill="black"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </m.g>
          ))}
          <defs>
            <clipPath id="clip0_536_2">
              <rect
                width="13.1237"
                height="13.1237"
                fill="white"
                transform="translate(0 79.7305) rotate(-41.7024)"
              />
            </clipPath>
            <clipPath id="clip1_536_2">
              <rect
                width="17.0952"
                height="17.0952"
                fill="white"
                transform="translate(53 6.98828) rotate(-13.4939)"
              />
            </clipPath>
            <clipPath id="clip2_536_2">
              <rect
                width="10.87"
                height="10.87"
                fill="white"
                transform="translate(171.6 11) rotate(25.0345)"
              />
            </clipPath>
            <clipPath id="clip3_536_2">
              <rect
                width="16.4632"
                height="16.4632"
                fill="white"
                transform="translate(190.328 0) rotate(34.5126)"
              />
            </clipPath>
          </defs>
        </m.g>
      </m.svg>
    </>
  );
};

export default Mascot;
