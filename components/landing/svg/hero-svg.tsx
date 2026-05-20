"use client";
import { useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { toast } from "sonner";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

const HeroSvg = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showReset, setShowReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [animationRun, setAnimationRun] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          fullMotion: "(prefers-reduced-motion: no-preference)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const conditions = ctx.conditions as {
            fullMotion: boolean;
            reduceMotion: boolean;
          };
          const fullMotion = !!conditions.fullMotion;
          const reduceMotion = !!conditions.reduceMotion;

          setShowReset(false);
          setIsResetting(false);

          // --- Beam setup: hidden until button is clicked ---
          const beams = gsap.utils.toArray<SVGPathElement>(".Beam");
          beams.forEach((beam) => {
            const length = beam.getTotalLength();
            gsap.set(beam, {
              strokeDasharray: length,
              strokeDashoffset: length,
              opacity: 0,
            });
          });

          function fireBeams() {
            beams.forEach((beam, i) => {
              const length = (beam as SVGPathElement).getTotalLength();
              gsap.fromTo(
                beam,
                { strokeDashoffset: length, opacity: 1 },
                {
                  strokeDashoffset: 0,
                  duration: 1.0,
                  ease: "power2.out",
                  delay: i * 0.22,
                },
              );
            });

            // Rocket launch: 1s after the last beam finishes drawing
            const rocketEl = svgRef.current?.querySelector<SVGGElement>(".rocket");
            if (rocketEl) {
              const beamEndTime = 1.0 + (beams.length - 1) * 0.22;
              const trailEl =
                rocketEl.querySelector<SVGPathElement>(".rocketTrail");

              // Reset/cleanup in case launch is triggered again.
              gsap.killTweensOf(rocketEl);
              if (trailEl) gsap.killTweensOf(trailEl);
              gsap.set(rocketEl, {
                transformOrigin: "50% 100%",
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 1,
              });
              if (trailEl) {
                gsap.set(trailEl, {
                  opacity: 0,
                  scaleY: 1,
                  transformOrigin: "50% 0%",
                });
              }
              rocketEl.style.willChange = "transform, opacity";

              let flickerTl: gsap.core.Timeline | null = null;

              const rocketTl = gsap.timeline({
                delay: beamEndTime + 1,
                onComplete: () => {
                  setShowReset(true);
                  rocketEl.style.willChange = "";

                  // Animate the in-scene Relaunch pill in.
                  const relaunchEl =
                    svgRef.current?.querySelector<SVGGElement>(
                      ".RelaunchButton",
                    );
                  if (relaunchEl) {
                    if (reduceMotion) {
                      gsap.set(relaunchEl, {
                        opacity: 1,
                        scale: 1,
                        pointerEvents: "auto",
                        transformOrigin: "50% 50%",
                      });
                    } else {
                      gsap.set(relaunchEl, {
                        pointerEvents: "auto",
                        transformOrigin: "50% 50%",
                      });
                      gsap.fromTo(
                        relaunchEl,
                        { opacity: 0, scale: 0.95 },
                        {
                          opacity: 1,
                          scale: 1,
                          duration: 0.25,
                          ease: "power2.out",
                        },
                      );
                    }
                  }
                },
              });

              // Trail fade-in. Peaks at 0.88 so the flicker can oscillate
              // continuously between 0.88 and 0.72 without a visible jump.
              if (trailEl) {
                rocketTl.to(
                  trailEl,
                  {
                    opacity: 0.88,
                    duration: 0.35,
                    ease: "power2.out",
                  },
                  0,
                );

                if (fullMotion) {
                  // Trail stretches downward as the rocket accelerates.
                  // On-screen movement -> ease-in-out (skill flowchart).
                  rocketTl.to(
                    trailEl,
                    {
                      scaleY: 1.6,
                      duration: 1.4,
                      ease: "power1.inOut",
                    },
                    0.2,
                  );

                  // Flicker timeline: subtle opacity oscillation while the
                  // rocket ascends. Yoyos between the post-fade-in value and
                  // 0.72 to read as live exhaust without jumping.
                  flickerTl = gsap.timeline({
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                  });
                  flickerTl.to(trailEl, {
                    opacity: 0.72,
                    duration: 0.22,
                    ease: "sine.inOut",
                  });
                  rocketTl.call(
                    () => {
                      flickerTl?.play();
                    },
                    [],
                    0.4,
                  );
                }

                // Trail dies mid-liftoff so it stops streaking through the
                // viewport after the rocket's head exits. Finishes at
                // t=2.25, before the rocket group fade-out at t=2.5.
                rocketTl.to(
                  trailEl,
                  {
                    opacity: 0,
                    duration: 0.55,
                    ease: "power2.out",
                    overwrite: "auto",
                    onStart: () => {
                      flickerTl?.kill();
                    },
                  },
                  1.7,
                );
              }

              // Liftoff: ease-out so the rocket pops off the pad with strong
              // initial velocity and decelerates as it leaves the viewport.
              rocketTl.to(
                rocketEl,
                {
                  y: -760,
                  duration: 2.4,
                  ease: "power2.out",
                },
                0,
              );

              // Subtle, continuous vibration during ascent — full motion only.
              let vibration: gsap.core.Timeline | null = null;
              if (fullMotion) {
                vibration = gsap.timeline({ repeat: -1, yoyo: true });
                vibration.to(rocketEl, {
                  x: 0.7,
                  rotation: 0.25,
                  duration: 0.055,
                  ease: "none",
                });
                vibration.to(rocketEl, {
                  x: -0.7,
                  rotation: -0.25,
                  duration: 0.055,
                  ease: "none",
                });
              }

              // Stop vibration and fade out near the end
              rocketTl.to(
                rocketEl,
                {
                  opacity: 0,
                  duration: 0.42,
                  ease: "power1.out",
                  onStart: function () {
                    vibration?.kill();
                  },
                },
                "+=0.1",
              );
            }
          }

          // Under reduce-motion: jump the intro to its final pose
          // (layer4 visible) and unlock the launch button immediately so the
          // click payoff still works.
          if (reduceMotion) {
            const layers = gsap.utils.toArray<SVGGElement>(
              ".layer1, .layer2, .layer3, .layer4",
            );
            layers.forEach((l) => {
              (l as SVGGElement).style.visibility = "visible";
            });
            gsap.set([".layer1", ".layer2", ".layer3"], { opacity: 0 });
            gsap.set(".layer4", {
              opacity: 1,
              y: 54,
              filter: "blur(0px)",
            });
          }

          // --- Pulse animation (full-motion only — ambient loop) ---
          const pulse = fullMotion
            ? svgRef.current?.querySelector<SVGPathElement>(".Pluse")
            : null;
          if (pulse) {
        const len = pulse.getTotalLength();
        gsap.set(pulse, {
          strokeDasharray: len,
          strokeDashoffset: len,
          stroke: "#5B78F2",
          opacity: 0,
        });

        const pulseTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1.9 });

        // Draw-in: slower reveal and smoother opacity ramp.
        pulseTimeline
          .to(pulse, {
            strokeDashoffset: 0,
            duration: 2.6,
            ease: "sine.out",
          })
          .to(
            pulse,
            {
              opacity: 0.62,
              duration: 2.6,
              ease: "sine.out",
            },
            "<",
          );

        // Subtle glow pulse at peak visibility.
        pulseTimeline.to(pulse, {
          stroke: "#7E97FA",
          opacity: 0.68,
          duration: 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        });

        // Erase path first while keeping opacity visible, then fade near the end.
        pulseTimeline
          .to(pulse, {
            strokeDashoffset: -len,
            duration: 2.2,
            ease: "power1.inOut",
          })
          .to(
            pulse,
            {
              opacity: 0.58,
              duration: 1.5,
              ease: "none",
            },
            "<",
          )
          .to(pulse, {
            opacity: 0,
            duration: 0.75,
            ease: "power1.in",
          });
      }

      // --- Piston animation (full-motion only — on-screen back-and-forth) ---
      if (fullMotion) {
        const pistons = gsap.utils.toArray<SVGPathElement>(".piston");
        pistons.forEach((piston, i) => {
          const box = piston.getBBox();
          const moveOnY = box.height >= box.width;
          const travel = gsap.utils.clamp(2, 6, (moveOnY ? box.height : box.width) * 0.03);

          gsap.set(piston, { transformOrigin: "50% 50%" });

          gsap
            .timeline({
              repeat: -1,
              delay: i * 0.2,
              defaults: { duration: 0.42, ease: "sine.inOut" },
            })
            .to(piston, moveOnY ? { y: -travel } : { x: -travel })
            .to(piston, moveOnY ? { y: travel } : { x: travel })
            .to(piston, moveOnY ? { y: 0 } : { x: 0 });
        });
      }

      // --- Layer stack reveal (1 -> 4) — full-motion only ---
      let layerSequenceDuration = 0;
      if (fullMotion) {
        const layers = gsap.utils.toArray<SVGGElement>(".layer1, .layer2, .layer3, .layer4");
        if (layers.length) {
          // Custom per-layer drop distances (px): layer1, layer2, layer3, layer4...
          const layerDropValues = [10, 24, 38, 54];

          gsap.set(layers, {
            opacity: 0,
            y: 0,
            filter: "blur(4px)",
          });

          const LAYER_STAGGER = 0.38;
          const LAYER_REVEAL_DURATION = 0.85;
          const LAST_LAYER_FADE_DELAY = 0.15;
          const LAST_LAYER_FADE_DURATION = 0.45;

          const layerTl = gsap.timeline({ defaults: { ease: "power3.out" } });
          layers.forEach((layer, i) => {
            const drop = layerDropValues[i] ?? layerDropValues[layerDropValues.length - 1] ?? 10;

            if (i > 0) {
              layerTl.to(
                layers.slice(0, i),
                {
                  opacity: 0,
                  filter: "blur(3px)",
                  duration: 0.32,
                  // Exit motion — ease-out keeps it from feeling sluggish.
                  ease: "power2.out",
                  overwrite: "auto",
                },
                i * LAYER_STAGGER,
              );
            }

            layerTl.to(
              layer,
              {
                opacity: 1,
                y: drop,
                filter: "blur(0px)",
                duration: LAYER_REVEAL_DURATION,
                // On the very first reveal, flip visibility so the JSX-level
                // `visibility: hidden` no longer holds the layer dark and
                // we get no flash-of-unanimated-content before GSAP runs.
                onStart:
                  i === 0
                    ? () => {
                        layers.forEach((l) => {
                          (l as SVGGElement).style.visibility = "visible";
                        });
                      }
                    : undefined,
              },
              i * LAYER_STAGGER,
            );
          });

          // Measure duration after all reveal tweens, then append last-layer fade-out
          const revealDuration = layerTl.duration();
          gsap.to(layers[layers.length - 1], {
            opacity: 0,
            filter: "blur(3px)",
            duration: LAST_LAYER_FADE_DURATION,
            // Exit motion — ease-out family stays paired with reveals.
            ease: "power2.out",
            delay: revealDuration + LAST_LAYER_FADE_DELAY,
            overwrite: "auto",
          });

          layerSequenceDuration = revealDuration + LAST_LAYER_FADE_DELAY + LAST_LAYER_FADE_DURATION;
        }
      }

      const path1StartDelay = layerSequenceDuration + 0.1;
      const path1Duration = 4.8;
      const path2ExtraDelay = 1.6;
      const path2StartDelay = path1StartDelay + path1Duration + path2ExtraDelay;
      const path2Duration = 4.8;
      const introCompleteAt = path2StartDelay + path2Duration;

      // Under reduce-motion the intro is skipped, so the launch click payoff
      // is available immediately.
      let launchUnlocked = reduceMotion;
      let launchTriggered = false;
      let lastBlockedToastAt = -Infinity;
      if (fullMotion) {
        gsap.delayedCall(introCompleteAt, () => {
          launchUnlocked = true;
        });
      }

      // --- Move path1svg1 along path1 (full-motion only) ---
      if (fullMotion) {
        const mover = svgRef.current?.querySelector<SVGGElement>(".path1svg1");
        const guideLine = svgRef.current?.querySelector<SVGLineElement>(".path1");
        if (mover && guideLine) {
          const x1 = Number(guideLine.getAttribute("x1") ?? 0);
          const y1 = Number(guideLine.getAttribute("y1") ?? 0);
          const x2 = Number(guideLine.getAttribute("x2") ?? 0);
          const y2 = Number(guideLine.getAttribute("y2") ?? 0);

          const box = mover.getBBox();
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;

          gsap.set(mover, {
            transformOrigin: "50% 50%",
            x: x1 - centerX,
            y: y1 - centerY,
            opacity: 0,
          });
          mover.style.willChange = "transform, opacity";

          gsap.to(mover, {
            opacity: 1,
            duration: 0.2,
            ease: "power1.out",
            delay: path1StartDelay,
          });

          gsap.to(mover, {
            duration: path1Duration,
            // Organic acceleration/deceleration along the line beats raw
            // linear motion for narrative travel.
            ease: "power1.inOut",
            delay: path1StartDelay,
            x: x2 - centerX,
            y: y2 - centerY,
            onComplete: () => {
              mover.style.willChange = "";
            },
          });
        }
      }

      // --- Move path2svg2 along path2 (full-motion only) ---
      if (fullMotion) {
        const mover2 = svgRef.current?.querySelector<SVGGElement>(".path2svg2");
        const guideLine2 = svgRef.current?.querySelector<SVGLineElement>(".path2");
        if (mover2 && guideLine2) {
          const x1 = Number(guideLine2.getAttribute("x1") ?? 0);
          const y1 = Number(guideLine2.getAttribute("y1") ?? 0);
          const x2 = Number(guideLine2.getAttribute("x2") ?? 0);
          const y2 = Number(guideLine2.getAttribute("y2") ?? 0);
          const path2YOffset = -6;

          const box = mover2.getBBox();
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;

          gsap.set(mover2, {
            transformOrigin: "50% 50%",
            x: x1 - centerX,
            y: y1 - centerY + path2YOffset,
            opacity: 0,
          });
          mover2.style.willChange = "transform, opacity";

          gsap.to(mover2, {
            opacity: 1,
            duration: 0.2,
            ease: "power1.out",
            delay: path2StartDelay,
          });

          gsap.to(mover2, {
            duration: path2Duration,
            ease: "power1.inOut",
            delay: path2StartDelay,
            x: x2 - centerX,
            y: y2 - centerY + path2YOffset,
            onComplete: () => {
              mover2.style.willChange = "";
            },
          });
        }
      }

      // --- LaunchButton interactions ---
      const btn = svgRef.current?.querySelector<SVGGElement>(".LaunchButton");
      if (!btn) return;

      btn.style.cursor = "pointer";

      btn.addEventListener("mouseenter", () => {
        if (launchTriggered) return;
        if (fullMotion) {
          gsap.to(btn, { y: 4, duration: 0.18, ease: "power2.out" });
        }
      });

      btn.addEventListener("mouseleave", () => {
        if (launchTriggered) return;
        if (fullMotion) {
          gsap.to(btn, { y: 0, duration: 0.22, ease: "power2.out" });
        }
      });

      btn.addEventListener("mousedown", () => {
        if (launchTriggered) return;
        if (fullMotion) {
          // Snap into the pressed position (ease-out, not ease-in) so the
          // click feedback is instantaneous, not mushy.
          gsap.to(btn, { y: 8, duration: 0.1, ease: "power2.out" });
        }
      });

      btn.addEventListener("mouseup", () => {
        if (launchTriggered) {
          return;
        }

        if (fullMotion) {
          gsap.to(btn, { y: 4, duration: 0.18, ease: "power2.out" });
        }

        if (!launchUnlocked) {
          const now = performance.now();
          if (now - lastBlockedToastAt > 1200) {
            lastBlockedToastAt = now;
            toast.error("Launch sequence still syncing", {
              description: "Coolant rings are still locking in. Give it a sec before ignition.",
            });
          }
          return;
        }

        launchTriggered = true;
        btn.style.cursor = "not-allowed";
        btn.style.pointerEvents = "none";

        fireBeams();
      });
        },
      );

      return () => mm.revert();
    },
    { scope: svgRef, dependencies: [animationRun], revertOnUpdate: true },
  );

  const handleRelaunch = () => {
    if (isResetting) return;

    const rocketEl = svgRef.current?.querySelector<SVGGElement>(".rocket");
    if (!rocketEl) {
      setShowReset(false);
      setAnimationRun((v) => v + 1);
      return;
    }

    setIsResetting(true);

    // Reset the trail so a relaunch starts from a clean scale + opacity, and
    // make sure any lingering flicker yoyo is killed.
    const trailEl = rocketEl.querySelector<SVGPathElement>(".rocketTrail");
    if (trailEl) {
      gsap.killTweensOf(trailEl);
      gsap.set(trailEl, {
        opacity: 0,
        scaleY: 1,
        transformOrigin: "50% 0%",
      });
    }

    // Fade the in-scene Relaunch pill out in parallel with the descent.
    const relaunchEl =
      svgRef.current?.querySelector<SVGGElement>(".RelaunchButton");
    if (relaunchEl) {
      gsap.killTweensOf(relaunchEl);
      gsap.to(relaunchEl, {
        opacity: 0,
        scale: 0.95,
        duration: 0.18,
        ease: "power2.out",
        transformOrigin: "50% 50%",
        onComplete: () => {
          gsap.set(relaunchEl, { pointerEvents: "none" });
        },
      });
    }

    gsap.killTweensOf(rocketEl);

    gsap
      .timeline({
        onComplete: () => {
          setIsResetting(false);
          setShowReset(false);
          setAnimationRun((v) => v + 1);
        },
      })
      .set(rocketEl, {
        transformOrigin: "50% 100%",
        x: 0,
        rotation: 0,
        opacity: 1,
      })
      .to(rocketEl, {
        y: 0,
        duration: 2.1,
        ease: "power3.out",
      })
      .to(rocketEl, {
        y: 8,
        duration: 0.2,
        // Paired ease-out across all three reset legs makes the
        // return-overshoot-settle feel like one continuous motion.
        ease: "power2.out",
      })
      .to(rocketEl, {
        y: 0,
        duration: 0.26,
        ease: "power2.out",
      });
  };

  return (
    <div className="relative h-full w-full">
      <svg
        key={animationRun}
        className="h-full w-full dark:invert"
        ref={svgRef}
        viewBox="0 0 764 584"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="100"
          height="93.2218"
          transform="matrix(0.866025 0.5 0 1 0.865234 93.2266)"
          fill="url(#paint0_linear_4_2)"
          stroke="url(#paint1_linear_4_2)"
        />
        <rect
          width="100"
          height="90.222"
          transform="matrix(0.866025 -0.5 0 1 87.4678 143.227)"
          fill="url(#paint2_linear_4_2)"
          stroke="url(#paint3_linear_4_2)"
        />
        <path
          className="Beam"
          d="M342.225 403.808C363.292 447.008 413.643 521.361 527.365 463.818C538.857 455.945 562.861 436.07 566.947 427.218"
          stroke="#1346E7"
          strokeWidth="4"
        />
        <path
          className="Beam"
          d="M339.032 421.685C360.1 464.886 424.154 539.153 560.349 480.206"
          stroke="#1346E7"
          strokeWidth="4"
        />
        <rect
          width="210"
          height="210"
          transform="matrix(0.866025 0.5 -0.866025 0.5 352.899 164.696)"
          fill="white"
          stroke="black"
        />
        <rect
          width="210"
          height="167.4"
          transform="matrix(0.866025 0.5 0 1 171.034 269.696)"
          fill="url(#paint4_linear_4_2)"
          stroke="url(#paint5_linear_4_2)"
        />
        <rect
          width="210"
          height="168.177"
          transform="matrix(0.866025 -0.5 0 1 352.9 374.696)"
          fill="url(#paint6_linear_4_2)"
          stroke="url(#paint7_linear_4_2)"
        />
        <rect
          width="170"
          height="170"
          transform="matrix(0.866025 0.5 -0.866025 0.5 352.9 175.68)"
          fill="#EDEDED"
          stroke="black"
        />
        <rect
          width="170"
          height="15"
          transform="matrix(0.866025 0.5 0 1 205.676 260.68)"
          fill="white"
          stroke="black"
        />
        <rect
          width="170"
          height="15"
          transform="matrix(0.866025 -0.5 0 1 352.9 345.68)"
          fill="white"
          stroke="black"
        />
        <circle
          cx="47"
          cy="47"
          r="47"
          transform="matrix(0.866025 0.5 -0.866025 0.5 682.39 419.754)"
          fill="white"
          stroke="black"
        />
        <path
          d="M624.827 466.754C624.827 475.931 631.27 484.24 641.687 490.254V569.254C631.27 563.24 624.827 554.931 624.827 545.754V466.754Z"
          fill="url(#paint8_linear_4_2)"
          stroke="url(#paint9_linear_4_2)"
        />
        <path
          d="M641.687 490.254C664.166 503.233 700.613 503.233 723.093 490.254V569.254C700.613 582.233 664.166 582.233 641.687 569.254V490.254Z"
          fill="url(#paint10_linear_4_2)"
          stroke="url(#paint11_linear_4_2)"
        />
        <path
          d="M739.953 466.754C739.953 475.931 733.51 484.24 723.093 490.254V569.254C733.51 563.24 739.953 554.931 739.953 545.754V466.754Z"
          fill="url(#paint12_linear_4_2)"
          stroke="url(#paint13_linear_4_2)"
        />
        <path
          d="M653.563 411.58L617.798 433.115L611.207 429.143L605.071 425.354L597.726 421.019L592.715 418L586.903 414.497L580.961 410.917L574.658 407.118L569.391 403.944L562.779 399.96L556.609 396.241L550.649 392.649L543.778 388.509L537.751 384.877L532.098 381.47L526.165 377.895L520.137 374.263L514.244 370.711L507.896 366.886L501.855 363.245L495.239 359.258L489.627 355.876L483.895 352.422L478.096 348.927L471.465 344.931L465.33 341.234L459.746 337.869L453.665 334.204L446.901 330.128L441.142 326.658L435.23 323.095L428.975 319.326L423.062 315.762L417.148 312.198L411.018 308.505L404.791 304.752L399.217 301.393L435.277 280.573L440.863 283.926L447.103 287.671L453.246 291.357L459.172 294.914L465.097 298.47L471.365 302.232L477.29 305.788L483.061 309.251L489.839 313.319L495.933 316.976L501.529 320.335L506.942 323.583L514.321 328.012L520.132 331.5L525.876 334.947L531.5 338.323L538.131 342.302L544.184 345.935L550.545 349.753L556.451 353.297L562.491 356.922L568.437 360.49L574.101 363.89L580.141 367.515L587.026 371.647L592.999 375.232L599.182 378.942L605.807 382.919L611.086 386.087L617.402 389.877L623.356 393.451L629.181 396.946L634.202 399.96L641.485 404.331L647.711 408.068L653.563 411.58Z"
          fill="white"
        />
        <path
          d="M653.563 411.58L617.798 433.115L611.207 429.143L605.071 425.354L597.726 421.019L592.715 418L586.903 414.497L580.961 410.917L574.658 407.118L569.391 403.944L562.779 399.96L556.609 396.241L550.649 392.649L543.778 388.509L537.751 384.877L532.098 381.47L526.165 377.895L520.137 374.263L514.244 370.711L507.896 366.886L501.855 363.245L495.239 359.258L489.627 355.876L483.895 352.422L478.096 348.927L471.465 344.931L465.33 341.234L459.746 337.869L453.665 334.204L446.901 330.128L441.142 326.658L435.23 323.095L428.975 319.326L423.062 315.762L417.148 312.198L411.018 308.505L404.791 304.752L399.217 301.393L435.277 280.573L440.863 283.926L447.103 287.671L453.246 291.357L459.172 294.914L465.097 298.47L471.365 302.232L477.29 305.788L483.061 309.251L489.839 313.319L495.933 316.976L501.529 320.335L506.942 323.583L514.321 328.012L520.132 331.5L525.876 334.947L531.5 338.323L538.131 342.302L544.184 345.935L550.545 349.753L556.451 353.297L562.491 356.922L568.437 360.49L574.101 363.89L580.141 367.515L587.026 371.647L592.999 375.232L599.182 378.942L605.807 382.919L611.086 386.087L617.402 389.877L623.356 393.451L629.181 396.946L634.202 399.96L641.485 404.331L647.711 408.068L653.563 411.58Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M653.563 411.58L617.798 433.115L611.207 429.143L605.071 425.354L597.726 421.019L592.715 418L586.903 414.497L580.961 410.917L574.658 407.118L569.391 403.944L562.779 399.96L556.609 396.241L550.649 392.649L543.778 388.509L537.751 384.877L532.098 381.47L526.165 377.895L520.137 374.263L514.244 370.711L507.896 366.886L501.855 363.245L495.239 359.258L489.627 355.876L483.895 352.422L478.096 348.927L471.465 344.931L465.33 341.234L459.746 337.869L453.665 334.204L446.901 330.128L441.142 326.658L435.23 323.095L428.975 319.326L423.062 315.762L417.148 312.198L411.018 308.505L404.791 304.752L399.217 301.393L435.277 280.573L440.863 283.926L447.103 287.671L453.246 291.357L459.172 294.914L465.097 298.47L471.365 302.232L477.29 305.788L483.061 309.251L489.839 313.319L495.933 316.976L501.529 320.335L506.942 323.583L514.321 328.012L520.132 331.5L525.876 334.947L531.5 338.323L538.131 342.302L544.184 345.935L550.545 349.753L556.451 353.297L562.491 356.922L568.437 360.49L574.101 363.89L580.141 367.515L587.026 371.647L592.999 375.232L599.182 378.942L605.807 382.919L611.086 386.087L617.402 389.877L623.356 393.451L629.181 396.946L634.202 399.96L641.485 404.331L647.711 408.068L653.563 411.58Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M653.563 411.58L617.798 433.115L611.207 429.143L605.071 425.354L597.726 421.019L592.715 418L586.903 414.497L580.961 410.917L574.658 407.118L569.391 403.944L562.779 399.96L556.609 396.241L550.649 392.649L543.778 388.509L537.751 384.877L532.098 381.47L526.165 377.895L520.137 374.263L514.244 370.711L507.896 366.886L501.855 363.245L495.239 359.258L489.627 355.876L483.895 352.422L478.096 348.927L471.465 344.931L465.33 341.234L459.746 337.869L453.665 334.204L446.901 330.128L441.142 326.658L435.23 323.095L428.975 319.326L423.062 315.762L417.148 312.198L411.018 308.505L404.791 304.752L399.217 301.393L435.277 280.573L440.863 283.926L447.103 287.671L453.246 291.357L459.172 294.914L465.097 298.47L471.365 302.232L477.29 305.788L483.061 309.251L489.839 313.319L495.933 316.976L501.529 320.335L506.942 323.583L514.321 328.012L520.132 331.5L525.876 334.947L531.5 338.323L538.131 342.302L544.184 345.935L550.545 349.753L556.451 353.297L562.491 356.922L568.437 360.49L574.101 363.89L580.141 367.515L587.026 371.647L592.999 375.232L599.182 378.942L605.807 382.919L611.086 386.087L617.402 389.877L623.356 393.451L629.181 396.946L634.202 399.96L641.485 404.331L647.711 408.068L653.563 411.58Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M611.207 429.143L617.798 433.115L653.563 411.58L647.711 408.068M611.207 429.143L647.711 408.068M611.207 429.143L605.071 425.354M647.711 408.068L641.485 404.331M605.071 425.354L597.726 421.019M605.071 425.354L641.485 404.331M597.726 421.019L634.202 399.96M597.726 421.019L592.715 418M634.202 399.96L629.181 396.946M634.202 399.96L641.485 404.331M592.715 418L629.181 396.946M592.715 418L586.903 414.497M629.181 396.946L623.356 393.451M586.903 414.497L623.356 393.451M586.903 414.497L580.961 410.917M623.356 393.451L617.402 389.877M580.961 410.917L617.402 389.877M580.961 410.917L574.658 407.118M617.402 389.877L611.086 386.087M574.658 407.118L611.086 386.087M574.658 407.118L569.391 403.944M611.086 386.087L605.807 382.919M569.391 403.944L605.807 382.919M569.391 403.944L562.779 399.96M605.807 382.919L599.182 378.942M562.779 399.96L599.182 378.942M562.779 399.96L556.609 396.241M599.182 378.942L592.999 375.232M556.609 396.241L592.999 375.232M556.609 396.241L550.649 392.649M592.999 375.232L587.026 371.647M550.649 392.649L587.026 371.647M550.649 392.649L543.778 388.509M587.026 371.647L580.141 367.515M543.778 388.509L580.141 367.515M543.778 388.509L537.751 384.877M580.141 367.515L574.101 363.89M537.751 384.877L574.101 363.89M537.751 384.877L532.098 381.47M574.101 363.89L568.437 360.49M532.098 381.47L568.437 360.49M532.098 381.47L526.165 377.895M568.437 360.49L562.491 356.922M526.165 377.895L562.491 356.922M526.165 377.895L520.137 374.263M562.491 356.922L556.451 353.297M520.137 374.263L556.451 353.297M520.137 374.263L514.244 370.711M556.451 353.297L550.545 349.753M514.244 370.711L550.545 349.753M514.244 370.711L507.896 366.886M550.545 349.753L544.184 345.935M507.896 366.886L544.184 345.935M507.896 366.886L501.855 363.245M544.184 345.935L538.131 342.302M501.855 363.245L538.131 342.302M501.855 363.245L495.239 359.258M538.131 342.302L531.5 338.323M495.239 359.258L531.5 338.323M495.239 359.258L489.627 355.876M531.5 338.323L525.876 334.947M489.627 355.876L525.876 334.947M489.627 355.876L483.895 352.422M525.876 334.947L520.132 331.5M483.895 352.422L520.132 331.5M483.895 352.422L478.096 348.927M520.132 331.5L514.321 328.012M478.096 348.927L514.321 328.012M478.096 348.927L471.465 344.931M514.321 328.012L506.942 323.583M471.465 344.931L506.942 323.583M471.465 344.931L465.33 341.234M506.942 323.583L501.529 320.335M465.33 341.234L501.529 320.335M465.33 341.234L459.746 337.869M501.529 320.335L495.933 316.976M459.746 337.869L495.933 316.976M459.746 337.869L453.665 334.204M495.933 316.976L489.839 313.319M453.665 334.204L489.839 313.319M453.665 334.204L446.901 330.128M489.839 313.319L483.061 309.251M446.901 330.128L483.061 309.251M446.901 330.128L441.142 326.658M483.061 309.251L477.29 305.788M441.142 326.658L477.29 305.788M441.142 326.658L435.23 323.095M477.29 305.788L471.365 302.232M435.23 323.095L471.365 302.232M435.23 323.095L428.975 319.326M471.365 302.232L465.097 298.47M428.975 319.326L465.097 298.47M428.975 319.326L423.062 315.762M465.097 298.47L459.172 294.914M423.062 315.762L459.172 294.914M423.062 315.762L417.148 312.198M459.172 294.914L453.246 291.357M417.148 312.198L453.246 291.357M417.148 312.198L411.018 308.505M453.246 291.357L447.103 287.671M411.018 308.505L447.103 287.671M411.018 308.505L404.791 304.752M447.103 287.671L440.863 283.926M404.791 304.752L440.863 283.926M404.791 304.752L399.217 301.393L435.277 280.573L440.863 283.926"
          stroke="black"
        />
        <g className="rocket">
          <path
            className="rocketTrail"
            d="M658 487 Q683 540 672 730 L708 730 Q697 540 722 487 Z"
            fill="url(#rocketTrailGradient)"
            style={{ opacity: 0 }}
          />
          <path
            d="M661.605 262.632V247.135C663.194 248.879 665.407 250.775 668.104 252.421C668.896 252.904 669.731 253.366 670.603 253.796C677.357 257.126 686.403 258.554 696.098 253.358C697.092 252.826 698.092 252.224 699.098 251.547C701.247 250.101 703.419 248.313 705.596 246.136V260.633V267.631C708.43 269.692 709.618 272.417 710.016 274.63C710.236 275.852 710.214 276.918 710.095 277.629C710.075 277.712 710.054 277.793 710.033 277.874L710.143 299.125L710.359 340.617L710.437 355.614L710.46 360.113L710.486 365.112L710.541 375.61L710.568 380.859L710.595 386.108L723.093 411.603V470.092C721.26 472.591 716.494 476.99 712.095 474.591V480.59C704.856 486.22 697.962 485.874 693.099 483.98C690.708 483.048 688.808 481.743 687.6 480.59C684.4 482.189 681.268 481.256 680.101 480.59C673.303 486.988 663.938 485.922 660.105 484.589C656.773 483.422 650.807 479.79 653.607 474.591C647.208 473.791 644.608 471.258 644.108 470.092V411.603L657.391 385.108V380.859V376.61V372.111V366.112V361.113V355.614V340.617V299.125V275.63C657.331 270.739 659.592 268.001 661.605 266.132V262.632Z"
            fill="white"
          />
          <path
            d="M661.605 236.138V247.135M661.605 236.138C663.883 237.495 663.804 237.814 667.604 239.091M661.605 236.138C659.689 235.283 655.978 232.962 656.458 230.51C656.8 228.757 656.876 220.068 660.35 204.448M661.605 247.135V262.632M661.605 247.135C663.194 248.879 665.407 250.775 668.104 252.421M661.605 262.632V266.132M661.605 262.632C662.607 264.252 664.823 266.513 668.104 268.427M705.596 260.633V246.136M705.596 260.633V267.631M705.596 260.633C703.893 264.039 701.51 266.439 698.831 268.131M705.596 246.136V235.341M705.596 246.136C703.419 248.313 701.247 250.101 699.098 251.547M705.596 235.341C702.743 237.654 698.098 239.57 696.598 239.57M705.596 235.341C708.52 233.478 709.134 231.344 709.075 230.51C707.929 221.632 706.237 212.957 704.262 204.752M661.605 266.132V274.63C661.936 277.5 664.286 282.229 670.603 284.977M661.605 266.132C659.592 268.001 657.331 270.739 657.391 275.63M710.033 277.874C709.027 281.72 707.323 283.927 699.098 288.627C690.699 293.426 677.602 291.96 672.103 290.627C667.604 288.627 658.375 283.129 657.606 278.129C657.469 277.238 657.4 276.407 657.391 275.63M710.033 277.874C710.054 277.793 710.075 277.712 710.095 277.629C710.214 276.918 710.236 275.852 710.016 274.63M710.033 277.874L710.143 299.125M710.033 277.874L710.016 274.63M705.596 267.631V274.63C705.293 277.059 703.293 280.999 698.098 283.809M705.596 267.631C708.43 269.692 709.618 272.417 710.016 274.63M657.391 275.63V299.125M657.391 385.108C665.961 393.773 688.6 406.104 710.595 386.108M657.391 385.108V380.859M657.391 385.108L644.108 411.603M657.391 385.108L656.106 416.602M710.595 386.108L710.568 380.859M710.595 386.108L723.093 411.603M710.595 386.108L710.382 416.602M657.391 299.125C670.603 311.123 689.786 315.922 710.143 299.125M657.391 299.125V340.617M710.143 299.125L710.359 340.617M657.391 340.617C665.637 348.282 687.774 359.013 710.359 340.617M657.391 340.617V355.614M710.359 340.617L710.437 355.614M657.391 355.614C666.355 362.946 689.514 373.211 710.437 355.614M657.391 355.614V361.113M710.437 355.614L710.46 360.113M657.391 361.113C666.371 368.278 689.556 378.11 710.46 360.113M657.391 361.113V366.112M710.46 360.113L710.486 365.112M657.391 366.112C665.388 373.111 687.203 382.709 710.486 365.112M657.391 366.112V372.111M710.486 365.112L710.541 375.61M657.391 372.111C665.803 378.443 688.174 387.008 710.359 370.611M657.391 372.111V376.61M657.391 376.61C665.924 383.275 688.501 392.407 710.541 375.61M657.391 376.61V380.859M710.541 375.61L710.568 380.859M657.391 380.859C666.942 388.274 690.95 398.656 710.568 380.859M670.603 253.796C670.77 251.076 671.003 245.536 670.603 245.136C670.103 244.636 667.604 244.136 667.604 243.136V239.091M670.603 253.796C669.731 253.366 668.896 252.904 668.104 252.421M670.603 253.796C677.357 257.126 686.403 258.554 696.098 253.358M667.604 239.091C679.204 241.485 684.869 241.644 696.598 239.57M696.598 239.57C696.431 241.403 696.198 244.336 696.598 245.136C697.098 246.136 699.098 244.636 699.098 246.136V251.547M699.098 251.547C698.092 252.224 697.092 252.826 696.098 253.358M668.104 252.421C667.937 254.158 667.704 257.833 668.104 258.633C668.604 259.633 670.603 259.133 670.603 261.133V269.71M670.603 269.71C674.094 271.277 678.466 272.344 683.601 272.131C687.212 271.98 691.676 271.479 695.81 269.71M670.603 269.71C669.712 269.311 668.878 268.878 668.104 268.427M696.098 253.358C695.932 255.283 695.698 259.333 696.098 260.133C696.598 261.133 699.098 260.133 699.098 260.633C699.098 261.033 698.92 265.798 698.831 268.131M698.831 268.131C697.857 268.747 696.843 269.268 695.81 269.71M668.104 268.427C667.937 269.661 667.704 272.43 668.104 273.63C668.604 275.13 670.603 274.63 670.603 275.63V284.977M670.603 284.977C673.821 286.377 678.067 287.263 683.601 287.128C690.04 286.97 694.738 285.626 698.098 283.809M695.81 269.71C695.713 271.158 695.579 274.268 695.81 275.13C696.098 276.207 697.782 275.273 698.098 276.451C698.35 277.394 698.203 281.749 698.098 283.809M644.108 411.603C645.608 413.936 650.107 418.202 656.106 416.602M644.108 411.603V470.092C644.608 471.258 647.208 473.791 653.607 474.591M656.106 416.602V419.774M653.607 474.591V424.601M653.607 474.591C650.807 479.79 656.773 483.422 660.105 484.589M653.607 424.601C654.806 427 658.439 426.6 660.105 426.1M653.607 424.601L656.106 419.774M668.104 396.606L680.101 423.601M668.104 396.606L660.105 426.1M668.104 396.606L656.106 419.774M680.101 423.601C676.435 426.1 667.304 430.1 660.105 426.1M680.101 423.601V480.59M660.105 426.1V484.589M660.105 484.589C663.938 485.922 673.303 486.988 680.101 480.59M680.101 480.59C681.268 481.256 684.4 482.189 687.6 480.59M687.6 423.601L699.597 396.606M687.6 423.601C687.6 424.401 690.266 425.6 691.599 426.1C692.107 426.3 692.607 426.482 693.099 426.647M687.6 423.601V480.59M699.597 396.606L693.099 426.647M699.597 396.606L710.359 419.851M712.095 423.601C710.027 426.146 703.434 430.118 693.099 426.647M712.095 423.601L710.359 419.851M712.095 423.601V474.591M693.099 426.647V483.98M687.6 480.59C688.808 481.743 690.708 483.048 693.099 483.98M693.099 483.98C697.962 485.874 704.856 486.22 712.095 480.59V474.591M710.359 419.851L710.382 416.602M723.093 411.603C721.117 413.936 715.81 418.202 710.382 416.602M723.093 411.603V470.092C721.26 472.591 716.494 476.99 712.095 474.591M660.35 204.448C668.39 209.463 688.429 216.545 704.262 204.752M660.35 204.448C660.977 201.628 661.714 198.583 662.584 195.311M704.262 204.752C703.485 201.527 702.665 198.375 701.817 195.311M662.584 195.311C669.73 199.707 687.579 205.86 701.817 195.311M662.584 195.311C663.699 191.12 665.031 186.559 666.625 181.627M701.817 195.311C700.489 190.512 699.091 185.929 697.687 181.627M666.625 181.627C672.47 184.835 686.864 189.327 697.687 181.627M666.625 181.627C667.396 179.24 668.229 176.767 669.128 174.207M697.687 181.627C696.845 179.049 696.001 176.571 695.167 174.207M669.128 174.207C670.934 169.067 673.009 163.577 675.393 157.737L680.812 145.988C681.351 144.958 682.696 143.516 683.756 145.988C684.432 147.566 689.564 158.321 695.167 174.207M669.128 174.207C674.146 176.202 686.379 178.995 695.167 174.207M662.605 318.122C664.438 319.121 668.104 321.321 668.104 322.121C668.104 323.121 668.604 333.618 668.104 334.118C667.604 334.618 661.605 331.619 661.605 331.119C661.605 330.619 661.105 317.622 662.605 318.122ZM679.102 323.62C681.268 323.454 685.8 323.221 686.6 323.62C687.6 324.12 687.6 336.618 687.1 337.118C686.6 337.618 679.102 338.118 679.102 337.118C679.102 336.118 678.408 323.67 679.102 323.62ZM698.098 322.121C699.764 320.621 703.297 317.722 704.097 318.122C705.096 318.621 705.096 329.619 704.597 330.119C704.097 330.619 699.098 335.118 698.598 334.618C698.098 334.118 697.598 322.563 698.098 322.121Z"
            stroke="black"
          />
          <path
            d="M705.115 351.13C704.965 351.122 704.752 351.213 704.542 351.519C704.337 351.818 704.183 352.266 704.157 352.792C704.13 353.318 704.239 353.779 704.413 354.097C704.591 354.422 704.794 354.534 704.945 354.542C705.095 354.549 705.308 354.458 705.518 354.152C705.723 353.853 705.877 353.405 705.903 352.879L706.352 352.902L706.345 353.012C706.256 354.113 705.669 354.969 704.99 354.991L704.922 354.991C704.192 354.954 703.648 353.959 703.708 352.769L703.715 352.658C703.807 351.522 704.43 350.645 705.138 350.681L705.206 350.687C705.902 350.779 706.41 351.749 706.352 352.902L705.903 352.879C705.93 352.353 705.821 351.892 705.647 351.574C705.469 351.249 705.266 351.137 705.115 351.13Z"
            fill="black"
          />
          <path
            d="M705.113 292.142C704.963 292.135 704.75 292.226 704.54 292.532C704.335 292.831 704.181 293.279 704.155 293.804C704.128 294.33 704.237 294.792 704.411 295.11C704.589 295.435 704.792 295.547 704.943 295.554C705.093 295.562 705.306 295.471 705.516 295.165C705.721 294.866 705.875 294.418 705.902 293.892L706.351 293.914L706.343 294.025C706.254 295.125 705.667 295.982 704.988 296.004L704.92 296.003C704.19 295.967 703.646 294.972 703.706 293.782L703.713 293.671C703.805 292.534 704.428 291.658 705.136 291.693L705.204 291.699C705.9 291.792 706.408 292.761 706.351 293.914L705.902 293.892C705.928 293.366 705.819 292.905 705.645 292.587C705.467 292.261 705.264 292.15 705.113 292.142Z"
            fill="black"
          />
          <path
            d="M702.165 257.155C702.17 256.817 702.081 256.53 701.959 256.341C701.834 256.148 701.707 256.098 701.628 256.097C701.549 256.096 701.422 256.143 701.293 256.332C701.165 256.518 701.069 256.803 701.065 257.14C701.06 257.478 701.149 257.764 701.271 257.954C701.396 258.146 701.522 258.196 701.601 258.198L701.595 258.647C701.043 258.64 700.604 257.963 700.615 257.134C700.626 256.306 701.082 255.641 701.634 255.648C702.187 255.655 702.626 256.332 702.615 257.161L702.608 257.314C702.546 258.069 702.113 258.654 701.595 258.647L701.601 258.198C701.68 258.199 701.808 258.152 701.937 257.963C702.065 257.776 702.161 257.492 702.165 257.155Z"
            fill="black"
          />
          <path
            d="M702.165 242.157C702.17 241.819 702.081 241.533 701.959 241.343C701.834 241.151 701.707 241.101 701.628 241.1C701.549 241.099 701.422 241.145 701.293 241.335C701.165 241.521 701.069 241.805 701.065 242.143C701.06 242.48 701.149 242.767 701.271 242.956C701.396 243.149 701.522 243.199 701.601 243.2L701.595 243.649C701.043 243.642 700.604 242.965 700.615 242.137C700.626 241.309 701.082 240.643 701.634 240.65C702.187 240.657 702.626 241.335 702.615 242.163L702.608 242.316C702.546 243.072 702.113 243.656 701.595 243.649L701.601 243.2C701.68 243.201 701.808 243.154 701.937 242.965C702.065 242.779 702.161 242.495 702.165 242.157Z"
            fill="black"
          />
          <path
            d="M702.165 272.15C702.17 271.812 702.081 271.526 701.959 271.336C701.834 271.143 701.707 271.094 701.628 271.092C701.549 271.092 701.422 271.138 701.293 271.327C701.165 271.514 701.069 271.798 701.065 272.135C701.06 272.473 701.149 272.76 701.271 272.949C701.396 273.142 701.522 273.192 701.601 273.193L701.595 273.642C701.043 273.635 700.604 272.958 700.615 272.129C700.626 271.301 701.082 270.636 701.634 270.643C702.187 270.65 702.626 271.327 702.615 272.156L702.608 272.309C702.546 273.064 702.113 273.649 701.595 273.642L701.601 273.193C701.68 273.194 701.808 273.147 701.937 272.958C702.065 272.772 702.161 272.487 702.165 272.15Z"
            fill="black"
          />
          <path
            d="M661.523 350.43C661.317 350.447 661.092 350.588 660.913 350.899C660.735 351.208 660.631 351.649 660.672 352.145C660.712 352.641 660.886 353.059 661.112 353.335C661.339 353.614 661.584 353.715 661.79 353.698C661.996 353.682 662.222 353.541 662.401 353.23C662.578 352.921 662.682 352.48 662.642 351.984L663.09 351.948C663.181 353.061 662.653 354.02 661.9 354.138L661.827 354.147C661.035 354.211 660.317 353.332 660.223 352.182C660.13 351.032 660.695 350.047 661.487 349.982L661.561 349.979C662.323 349.973 662.999 350.833 663.09 351.948L662.642 351.984C662.601 351.488 662.427 351.07 662.202 350.794C661.974 350.516 661.729 350.413 661.523 350.43Z"
            fill="black"
          />
          <path
            d="M662.077 292.19C661.871 292.207 661.646 292.348 661.467 292.659C661.289 292.969 661.185 293.409 661.225 293.905C661.266 294.401 661.44 294.819 661.666 295.096C661.893 295.374 662.138 295.476 662.344 295.459C662.55 295.442 662.775 295.302 662.954 294.99C663.132 294.681 663.236 294.24 663.196 293.744L663.644 293.708C663.735 294.822 663.207 295.781 662.454 295.898L662.381 295.907C661.589 295.971 660.871 295.092 660.777 293.942C660.683 292.792 661.249 291.807 662.041 291.742L662.114 291.739C662.876 291.733 663.553 292.594 663.644 293.708L663.196 293.744C663.155 293.248 662.981 292.831 662.755 292.554C662.528 292.276 662.283 292.174 662.077 292.19Z"
            fill="black"
          />
          <path
            d="M666.175 246.155C666.179 245.817 666.091 245.53 665.968 245.341C665.843 245.148 665.717 245.098 665.638 245.097C665.559 245.096 665.432 245.143 665.302 245.332C665.175 245.518 665.079 245.803 665.074 246.14C665.07 246.478 665.158 246.764 665.281 246.954C665.406 247.146 665.532 247.196 665.611 247.198L665.605 247.647C665.053 247.64 664.614 246.963 664.625 246.134C664.636 245.306 665.092 244.641 665.644 244.648C666.196 244.655 666.635 245.332 666.625 246.161L666.617 246.314C666.556 247.069 666.123 247.654 665.605 247.647L665.611 247.198C665.69 247.199 665.817 247.152 665.947 246.963C666.075 246.776 666.171 246.492 666.175 246.155Z"
            fill="black"
          />
          <path
            d="M666.175 261.154C666.179 260.816 666.091 260.529 665.968 260.34C665.843 260.147 665.717 260.097 665.638 260.096C665.559 260.095 665.432 260.142 665.302 260.331C665.175 260.518 665.079 260.802 665.074 261.139C665.07 261.477 665.158 261.763 665.281 261.953C665.406 262.145 665.532 262.195 665.611 262.197L665.605 262.646C665.053 262.639 664.614 261.962 664.625 261.133C664.636 260.305 665.092 259.64 665.644 259.647C666.196 259.654 666.635 260.331 666.625 261.16L666.617 261.313C666.556 262.068 666.123 262.653 665.605 262.646L665.611 262.197C665.69 262.198 665.817 262.151 665.947 261.962C666.075 261.775 666.171 261.491 666.175 261.154Z"
            fill="black"
          />
          <path
            d="M666.175 276.149C666.179 275.812 666.091 275.525 665.968 275.336C665.843 275.143 665.717 275.093 665.638 275.092C665.559 275.091 665.432 275.138 665.302 275.327C665.175 275.513 665.079 275.797 665.074 276.135C665.07 276.473 665.158 276.759 665.281 276.949C665.406 277.141 665.532 277.191 665.611 277.192L665.605 277.642C665.053 277.634 664.614 276.957 664.625 276.129C664.636 275.301 665.092 274.635 665.644 274.642C666.196 274.65 666.635 275.327 666.625 276.155L666.617 276.308C666.556 277.064 666.123 277.648 665.605 277.642L665.611 277.192C665.69 277.193 665.817 277.147 665.947 276.957C666.075 276.771 666.171 276.487 666.175 276.149Z"
            fill="black"
          />
        </g>
        <rect
          width="100"
          height="100"
          transform="matrix(0.866025 0.5 -0.866025 0.5 87.4688 43.2266)"
          fill="white"
          stroke="black"
        />
        <path
          d="M295.338 195.136L258.948 216.146L252.988 212.554L246.117 208.413L240.09 204.781L234.437 201.375L228.504 197.799L222.476 194.167L216.583 190.615L210.235 186.79L204.194 183.149L197.578 179.162L191.966 175.78L186.234 172.326L180.435 168.831L173.804 164.835L167.669 161.139L162.085 157.773L156.004 154.109L149.24 150.032L143.481 146.562L137.569 142.999L131.314 139.23L125.401 135.667L119.487 132.103L113.357 128.409L149.442 107.575L155.585 111.262L161.511 114.818L167.436 118.374L173.704 122.136L179.629 125.692L185.4 129.155L192.178 133.223L198.272 136.881L203.868 140.239L209.281 143.488L216.66 147.917L222.471 151.404L228.215 154.852L233.839 158.227L240.47 162.206L246.523 165.839L252.884 169.657L258.79 173.201L264.83 176.826L270.776 180.395L276.44 183.794L282.48 187.419L289.365 191.551L295.338 195.136Z"
          fill="white"
        />
        <path
          d="M295.338 195.136L258.948 216.146L252.988 212.554L246.117 208.413L240.09 204.781L234.437 201.375L228.504 197.799L222.476 194.167L216.583 190.615L210.235 186.79L204.194 183.149L197.578 179.162L191.966 175.78L186.234 172.326L180.435 168.831L173.804 164.835L167.669 161.139L162.085 157.773L156.004 154.109L149.24 150.032L143.481 146.562L137.569 142.999L131.314 139.23L125.401 135.667L119.487 132.103L113.357 128.409L149.442 107.575L155.585 111.262L161.511 114.818L167.436 118.374L173.704 122.136L179.629 125.692L185.4 129.155L192.178 133.223L198.272 136.881L203.868 140.239L209.281 143.488L216.66 147.917L222.471 151.404L228.215 154.852L233.839 158.227L240.47 162.206L246.523 165.839L252.884 169.657L258.79 173.201L264.83 176.826L270.776 180.395L276.44 183.794L282.48 187.419L289.365 191.551L295.338 195.136Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M295.338 195.136L258.948 216.146L252.988 212.554L246.117 208.413L240.09 204.781L234.437 201.375L228.504 197.799L222.476 194.167L216.583 190.615L210.235 186.79L204.194 183.149L197.578 179.162L191.966 175.78L186.234 172.326L180.435 168.831L173.804 164.835L167.669 161.139L162.085 157.773L156.004 154.109L149.24 150.032L143.481 146.562L137.569 142.999L131.314 139.23L125.401 135.667L119.487 132.103L113.357 128.409L149.442 107.575L155.585 111.262L161.511 114.818L167.436 118.374L173.704 122.136L179.629 125.692L185.4 129.155L192.178 133.223L198.272 136.881L203.868 140.239L209.281 143.488L216.66 147.917L222.471 151.404L228.215 154.852L233.839 158.227L240.47 162.206L246.523 165.839L252.884 169.657L258.79 173.201L264.83 176.826L270.776 180.395L276.44 183.794L282.48 187.419L289.365 191.551L295.338 195.136Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M295.338 195.136L258.948 216.146L252.988 212.554L246.117 208.413L240.09 204.781L234.437 201.375L228.504 197.799L222.476 194.167L216.583 190.615L210.235 186.79L204.194 183.149L197.578 179.162L191.966 175.78L186.234 172.326L180.435 168.831L173.804 164.835L167.669 161.139L162.085 157.773L156.004 154.109L149.24 150.032L143.481 146.562L137.569 142.999L131.314 139.23L125.401 135.667L119.487 132.103L113.357 128.409L149.442 107.575L155.585 111.262L161.511 114.818L167.436 118.374L173.704 122.136L179.629 125.692L185.4 129.155L192.178 133.223L198.272 136.881L203.868 140.239L209.281 143.488L216.66 147.917L222.471 151.404L228.215 154.852L233.839 158.227L240.47 162.206L246.523 165.839L252.884 169.657L258.79 173.201L264.83 176.826L270.776 180.395L276.44 183.794L282.48 187.419L289.365 191.551L295.338 195.136Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M252.988 212.554L258.948 216.146L295.338 195.136L289.365 191.551M252.988 212.554L289.365 191.551M252.988 212.554L246.117 208.413M289.365 191.551L282.48 187.419M246.117 208.413L282.48 187.419M246.117 208.413L240.09 204.781M282.48 187.419L276.44 183.794M240.09 204.781L276.44 183.794M240.09 204.781L234.437 201.375M276.44 183.794L270.776 180.395M234.437 201.375L270.776 180.395M234.437 201.375L228.504 197.799M270.776 180.395L264.83 176.826M228.504 197.799L264.83 176.826M228.504 197.799L222.476 194.167M264.83 176.826L258.79 173.201M222.476 194.167L258.79 173.201M222.476 194.167L216.583 190.615M258.79 173.201L252.884 169.657M216.583 190.615L252.884 169.657M216.583 190.615L210.235 186.79M252.884 169.657L246.523 165.839M210.235 186.79L246.523 165.839M210.235 186.79L204.194 183.149M246.523 165.839L240.47 162.206M204.194 183.149L240.47 162.206M204.194 183.149L197.578 179.162M240.47 162.206L233.839 158.227M197.578 179.162L233.839 158.227M197.578 179.162L191.966 175.78M233.839 158.227L228.215 154.852M191.966 175.78L228.215 154.852M191.966 175.78L186.234 172.326M228.215 154.852L222.471 151.404M186.234 172.326L222.471 151.404M186.234 172.326L180.435 168.831M222.471 151.404L216.66 147.917M180.435 168.831L216.66 147.917M180.435 168.831L173.804 164.835M216.66 147.917L209.281 143.488M173.804 164.835L209.281 143.488M173.804 164.835L167.669 161.139M209.281 143.488L203.868 140.239M167.669 161.139L203.868 140.239M167.669 161.139L162.085 157.773M203.868 140.239L198.272 136.881M162.085 157.773L198.272 136.881M162.085 157.773L156.004 154.109M198.272 136.881L192.178 133.223M156.004 154.109L192.178 133.223M156.004 154.109L149.24 150.032M192.178 133.223L185.4 129.155M149.24 150.032L185.4 129.155M149.24 150.032L143.481 146.562M185.4 129.155L179.629 125.692M143.481 146.562L179.629 125.692M143.481 146.562L137.569 142.999M179.629 125.692L173.704 122.136M137.569 142.999L173.704 122.136M137.569 142.999L131.314 139.23M173.704 122.136L167.436 118.374M131.314 139.23L167.436 118.374M131.314 139.23L125.401 135.667M167.436 118.374L161.511 114.818M125.401 135.667L161.511 114.818M125.401 135.667L119.487 132.103M161.511 114.818L155.585 111.262M119.487 132.103L155.585 111.262M119.487 132.103L113.357 128.409L149.442 107.575L155.585 111.262"
          stroke="black"
        />
        <rect
          width="73.1803"
          height="73.1803"
          transform="matrix(0.866025 0.5 -0.866025 0.5 87.4688 56.3809)"
          fill="white"
          stroke="black"
        />
        <path
          d="M458.491 268.27V219.27L429.574 235.825V257.667L436.205 253.469V280.799L458.491 268.27Z"
          fill="white"
        />
        <path
          d="M429.456 257.365L436.205 253.469V280.798L458.491 268.269V219.269L429.456 235.659"
          stroke="black"
        />
        <g className="path1svg1">
          <rect
            width="30"
            height="30"
            transform="matrix(0.866025 0.5 -0.866025 0.5 148.089 112.242)"
            fill="white"
            stroke="black"
          />
          <path
            d="M160.368 123.726L156.141 126.166C155.647 126.452 155.369 126.838 155.369 127.242C155.369 127.645 155.647 128.032 156.141 128.317L160.368 130.758"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M135.971 125.274L137.517 126.166C138.257 126.594 139.262 126.834 140.31 126.834C141.358 126.834 142.363 126.594 143.104 126.166C143.598 125.881 144.268 125.721 144.966 125.721C145.665 125.721 146.335 125.881 146.829 126.166C147.853 126.758 149.529 126.758 150.554 126.166C151.047 125.881 151.325 125.494 151.325 125.091C151.325 124.688 151.047 124.301 150.554 124.016C149.529 123.424 149.529 122.457 150.554 121.865L153.506 120.161"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M157.026 133.129L153.348 131.005C152.854 130.72 152.184 130.56 151.486 130.56C150.787 130.56 150.117 130.72 149.623 131.005C149.129 131.29 148.459 131.451 147.761 131.451C147.062 131.451 146.392 131.29 145.898 131.005L144.967 130.468C144.473 130.182 143.803 130.022 143.105 130.022C142.406 130.022 141.736 130.182 141.242 130.468L138.495 132.054"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M157.986 132.628C163.139 129.665 163.155 124.85 158.022 121.876C152.888 118.901 144.55 118.891 139.397 121.855C134.245 124.819 134.229 129.633 139.362 132.608C144.495 135.583 152.833 135.592 157.986 132.628Z"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <line className="path1" x1="132.996" y1="117.184" x2="315.978" y2="225.675" stroke="#" />
        <g className="path2svg2">
          <rect
            width="30"
            height="30"
            transform="matrix(0.866025 0.5 -0.866025 0.5 394.783 247.538)"
            fill="white"
            stroke="black"
          />
          <rect
            width="30"
            height="10"
            transform="matrix(0.866025 0.5 0 1 368.802 262.538)"
            fill="white"
            stroke="black"
          />
          <rect
            width="30"
            height="10"
            transform="matrix(0.866025 -0.5 0 1 394.783 277.538)"
            fill="white"
            stroke="black"
          />
          <path
            d="M407.061 259.022L402.833 261.463C402.339 261.748 402.062 262.135 402.062 262.538C402.062 262.941 402.339 263.328 402.833 263.613L407.061 266.054"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M382.663 260.57L384.209 261.463C384.95 261.891 385.955 262.131 387.003 262.131C388.05 262.131 389.055 261.891 389.796 261.463C390.29 261.178 390.96 261.017 391.659 261.017C392.357 261.017 393.027 261.178 393.521 261.463C394.545 262.054 396.222 262.054 397.246 261.463C397.74 261.178 398.017 260.791 398.017 260.388C398.017 259.984 397.74 259.597 397.246 259.312C396.222 258.721 396.222 257.753 397.246 257.162L400.198 255.457"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M403.719 268.425L400.04 266.302C399.546 266.017 398.877 265.856 398.178 265.856C397.479 265.856 396.809 266.017 396.316 266.302C395.822 266.587 395.152 266.747 394.453 266.747C393.755 266.747 393.085 266.587 392.591 266.302L391.659 265.764C391.166 265.479 390.496 265.319 389.797 265.319C389.098 265.319 388.429 265.479 387.935 265.764L385.188 267.35"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M404.678 267.925C409.831 264.961 409.847 260.147 404.714 257.172C399.581 254.197 391.242 254.188 386.09 257.151C380.937 260.115 380.921 264.929 386.054 267.904C391.187 270.879 399.526 270.888 404.678 267.925Z"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M359.828 276.225V325.225L398.542 302.428V276.225L429.737 257.379V235.537L359.828 276.225Z"
          fill="white"
        />
        <path
          d="M429.737 257.313L398.542 276.224V302.428L359.828 325.224V276.224L429.737 235.491"
          stroke="black"
        />
        <circle
          cx="2.6373"
          cy="2.6373"
          r="2.1373"
          transform="matrix(0.866025 -0.5 0.866025 0.5 82.9004 134.985)"
          fill="white"
          stroke="black"
        />
        <circle
          cx="2.6373"
          cy="2.6373"
          r="2.1373"
          transform="matrix(0.866025 -0.5 0.866025 0.5 8.81152 93.5547)"
          fill="white"
          stroke="black"
        />
        <circle
          cx="2.6373"
          cy="2.6373"
          r="2.1373"
          transform="matrix(0.866025 -0.5 0.866025 0.5 82.9004 50.5586)"
          fill="white"
          stroke="black"
        />
        <circle
          cx="2.6373"
          cy="2.6373"
          r="2.1373"
          transform="matrix(0.866025 -0.5 0.866025 0.5 158.812 93.5547)"
          fill="white"
          stroke="black"
        />

        <g className="layer1" style={{ visibility: "hidden" }}>
          <rect
            width="73.1803"
            height="73.1803"
            transform="matrix(0.866025 0.5 -0.866025 0.5 87.4678 45.0469)"
            fill="white"
            stroke="black"
          />
          <path
            d="M89.3104 112.362C88.8623 112.621 88.3612 112.793 87.8069 112.878C87.2573 112.961 86.6915 112.949 86.1095 112.842C85.5322 112.733 84.9756 112.524 84.4398 112.214C83.9179 111.913 83.5599 111.597 83.366 111.266C83.1673 110.933 83.1373 110.604 83.2759 110.278C83.4145 109.953 83.7193 109.654 84.1904 109.382C84.8324 109.012 85.4906 108.816 86.1649 108.794C86.8393 108.768 87.5206 108.894 88.2088 109.174L87.1557 109.83C86.7908 109.684 86.4305 109.614 86.0749 109.622C85.7146 109.628 85.3821 109.718 85.0772 109.894C84.8139 110.046 84.6592 110.216 84.613 110.402C84.5668 110.589 84.6223 110.784 84.7793 110.986C84.9363 111.189 85.1858 111.389 85.5276 111.586C85.874 111.786 86.2227 111.932 86.5737 112.022C86.9247 112.108 87.2596 112.136 87.5783 112.106C87.897 112.077 88.1834 111.989 88.4374 111.842C88.77 111.65 88.9339 111.449 88.9293 111.238C88.9247 111.022 88.7792 110.805 88.4928 110.586L89.636 109.974C89.9732 110.244 90.1879 110.514 90.2803 110.786C90.3727 111.058 90.3403 111.328 90.1833 111.594C90.0309 111.858 89.7399 112.114 89.3104 112.362ZM91.618 110.902L88.4726 107.038L89.7197 106.318L96.4123 108.134L95.3176 108.766L93.9112 108.37L92.0198 109.462L92.7057 110.274L91.618 110.902ZM91.4517 108.79L92.7542 108.038L90.2046 107.318L91.4517 108.79ZM96.884 107.862L91.9649 105.022L93.1289 104.35L98.4774 105.182L95.0826 103.222L96.1357 102.614L101.055 105.454L99.8769 106.134L94.66 105.362L97.937 107.254L96.884 107.862ZM103.297 104.159L96.6041 102.343L97.6919 101.715L102.736 103.115L100.311 100.203L101.398 99.5753L104.537 103.443L103.297 104.159ZM105.786 102.722L102.64 98.8583L103.887 98.1383L110.58 99.9543L109.485 100.586L108.079 100.19L106.187 101.282L106.873 102.094L105.786 102.722ZM105.619 100.61L106.922 99.8583L104.372 99.1383L105.619 100.61ZM112.994 98.6884C112.569 98.9338 112.133 99.1031 111.685 99.1964C111.237 99.2898 110.798 99.3111 110.368 99.2604C109.939 99.2098 109.537 99.0898 109.163 98.9004L110.174 98.2604C110.396 98.3564 110.618 98.4204 110.84 98.4524C111.061 98.4791 111.278 98.4711 111.491 98.4284C111.708 98.3831 111.923 98.2991 112.135 98.1764C112.311 98.0751 112.438 97.9778 112.516 97.8844C112.599 97.7884 112.632 97.6978 112.613 97.6124C112.59 97.5244 112.516 97.4444 112.391 97.3724C112.276 97.3058 112.149 97.2644 112.01 97.2484C111.867 97.2298 111.683 97.2458 111.456 97.2964C111.225 97.3444 110.923 97.4364 110.549 97.5724C110.031 97.7591 109.583 97.8924 109.205 97.9724C108.83 98.0498 108.496 98.0698 108.2 98.0324C107.9 97.9924 107.611 97.8924 107.334 97.7324C107.038 97.5618 106.851 97.3711 106.773 97.1604C106.699 96.9471 106.738 96.7244 106.891 96.4924C107.043 96.2604 107.311 96.0338 107.694 95.8124C108.101 95.5778 108.516 95.4204 108.941 95.3404C109.366 95.2604 109.782 95.2471 110.188 95.3004C110.599 95.3511 110.983 95.4604 111.338 95.6284L110.341 96.2684C110.156 96.1778 109.962 96.1191 109.759 96.0924C109.551 96.0631 109.345 96.0671 109.142 96.1044C108.939 96.1418 108.743 96.2151 108.553 96.3244C108.313 96.4631 108.177 96.6031 108.145 96.7444C108.117 96.8831 108.188 97.0018 108.359 97.1004C108.479 97.1698 108.611 97.2111 108.754 97.2244C108.897 97.2324 109.071 97.2124 109.274 97.1644C109.482 97.1138 109.747 97.0271 110.071 96.9044C110.62 96.6938 111.098 96.5538 111.505 96.4844C111.911 96.4098 112.267 96.3964 112.572 96.4444C112.876 96.4924 113.154 96.5884 113.403 96.7324C113.708 96.9084 113.895 97.1071 113.964 97.3284C114.033 97.5444 113.985 97.7698 113.819 98.0044C113.657 98.2364 113.382 98.4644 112.994 98.6884Z"
            fill="black"
          />
        </g>
        <path
          d="M246.285 212.054L284.106 218.844L310.702 223.515V236.842L326.826 246.603L327.99 208.797L417.335 216.315L460.809 216.428C461.287 213.537 458.856 211.393 457.581 210.683C428.86 194.276 369.596 160.293 362.307 155.621C355.018 150.95 347.729 153.303 344.996 155.064L246.285 212.054Z"
          fill="white"
        />
        <path
          d="M461.363 216.428C461.84 213.537 459.41 211.393 458.135 210.683C429.414 194.276 370.15 160.293 362.86 155.621C355.571 150.95 348.282 153.303 345.549 155.064L246.839 212.054C245.404 212.874 243.078 215.115 245.255 217.52"
          stroke="black"
        />
        <path
          d="M361.383 160.867C363.118 160.724 368.804 160.78 371.184 162.154L409.109 184.05C415.46 188.938 417.068 195.377 416.601 200.823L416.601 223.119C416.232 226.888 414.427 230.376 413.571 231.649C397.221 248.394 378.996 249.913 371.928 248.579C361.109 247.596 358.001 245.368 357.799 244.377V223.119L361.383 160.867Z"
          fill="white"
        />
        <path
          className="piston"
          d="M413.571 209.81C409.109 216.679 389.031 229.13 371.928 226.983M413.571 209.81L413.571 231.649M413.571 209.81C414.983 207.83 416.28 204.56 416.601 200.823M371.928 226.983C358.245 225.266 358.79 223.405 357.799 223.119M371.928 226.983V248.579M357.799 223.119L361.383 160.867C363.118 160.724 368.804 160.78 371.184 162.154C373.564 163.527 396.963 177.037 409.109 184.05C415.46 188.938 417.068 195.377 416.601 200.823M357.799 223.119V244.377C358.001 245.368 361.109 247.596 371.928 248.579M371.928 248.579C378.996 249.913 397.221 248.394 413.571 231.649M413.571 231.649C414.427 230.376 416.232 226.888 416.601 223.119L416.601 200.823"
          stroke="black"
        />
        <path
          d="M288.64 196.07L311.692 182.761L312.186 204.501L310.205 239.325L290.127 228.074C286.094 225.814 284.967 223.504 284.907 222.632L284.907 200.711C284.903 200.622 284.903 200.534 284.907 200.446C284.977 198.898 286.268 197.439 288.64 196.07Z"
          fill="white"
        />
        <path
          className="piston"
          d="M311.692 182.761L288.64 196.07C286.268 197.439 284.977 198.898 284.907 200.446M311.692 182.761L310.205 217.966M311.692 182.761L312.186 204.501L310.205 239.325M290.127 206.374C297.266 210.496 306.487 215.819 310.205 217.966M290.127 206.374V228.074M290.127 206.374C289.588 206.063 289.093 205.755 288.64 205.449C286.031 203.689 284.836 202.021 284.907 200.446M310.205 217.966V239.325M310.205 239.325L290.127 228.074M290.127 228.074C286.094 225.814 284.967 223.504 284.907 222.632L284.907 200.446"
          stroke="black"
          strokeLinejoin="round"
        />
        <path
          d="M331.028 170.74L352.593 158.289C355.262 156.748 359.654 156.502 361.517 156.572C361.517 170.734 360.331 191.054 359.081 208.069L357.896 244.931L356.311 260.987C355.565 264.282 349.556 262.36 346.644 260.987L327.31 249.315V227.841L331.028 170.74Z"
          fill="white"
        />

        <path
          className="piston"
          d="M327.31 227.841L331.028 170.74L352.593 158.289C355.262 156.748 359.654 156.502 361.517 156.572C361.517 170.734 360.331 191.054 359.081 208.069M327.31 227.841L346.644 239.004M327.31 227.841V249.315L346.644 260.987M346.644 239.004C348.131 239.863 355.901 242.038 356.311 239.433M346.644 239.004V260.987M356.311 239.433V260.987M356.311 239.433C356.671 237.145 357.905 224.068 359.081 208.069M356.311 260.987C355.565 264.282 349.556 262.36 346.644 260.987M356.311 260.987L357.896 244.931L359.081 208.069"
          stroke="black"
        />
        <path
          d="M247.445 212.235L284.381 218.162C284.381 219.267 284.165 221.686 289.038 224.61C293.911 227.534 310.216 236.829 310.634 236.829L326.804 246.445L346.39 257.878C349.076 259.221 354.936 261.345 356.886 259.096L358.745 242.87C360.951 243.788 366.166 245.267 371.649 245.855C378.342 246.573 395.489 247.067 413.831 229.199C415.136 227.53 417.71 222.235 417.194 215.97L460.991 215.501C461.148 215.875 460.691 217.478 457.832 219.125C454.973 220.773 392.47 256.419 359.364 275.89C357.688 277.034 352.638 279.163 346.119 276.415L247.308 219.116C245.716 218.135 242.642 214.583 247.445 212.235Z"
          fill="white"
        />
        <path
          d="M284.791 218.063C284.791 219.168 284.212 221.423 289.085 224.346C293.958 227.27 310.451 236.396 310.87 236.396M326.804 246.005L346.39 257.878C349.076 259.221 354.745 260.762 356.694 258.513L358.421 242.297C360.627 243.214 367.249 245.061 372.621 245.442C379.335 245.919 392.767 246.646 413.455 229.114C417.169 225.114 416.76 223.005 416.76 216.298"
          stroke="black"
        />
        <path
          d="M345.972 276.227C349.798 278.436 356.002 278.436 359.828 276.227V325.227C356.002 327.436 349.798 327.436 345.972 325.227V276.227Z"
          fill="white"
          stroke="black"
        />
        <rect
          width="114"
          height="49"
          transform="matrix(0.866025 0.5 0 1 247.244 219.227)"
          fill="white"
          stroke="black"
        />
        <path
          d="M244.375 215.227C244.375 216.789 245.472 218.203 247.245 219.227V268.227C245.472 267.203 244.375 265.789 244.375 264.227V215.227Z"
          fill="white"
          stroke="black"
        />
        <path
          d="M461.424 215.227C461.424 216.789 460.328 218.203 458.555 219.227V268.227C460.328 267.203 461.424 265.789 461.424 264.227V215.227Z"
          fill="white"
          stroke="black"
        />
        <g className="layer2" style={{ visibility: "hidden" }}>
          <rect
            width="73.1803"
            height="73.1803"
            transform="matrix(0.866025 0.5 -0.866025 0.5 88.959 31.1172)"
            fill="white"
            stroke="black"
          />
          <path
            d="M152.334 67.7077L25.5824 67.7077M88.9593 31.1174L88.9593 104.297M120.646 49.4126L57.2709 86.0026M110.084 43.3143L46.7083 79.9042M131.209 55.511L67.8335 92.1009M57.2712 49.4121L120.647 86.0021M46.7086 55.5105L110.084 92.1004M67.8338 43.3138L131.209 79.9037M115.365 82.9534C100.781 91.3734 77.1361 91.3734 62.5522 82.9534C47.9683 74.5334 47.9683 60.8818 62.5522 52.4618C77.1361 44.0418 100.781 44.0418 115.365 52.4618C129.949 60.8818 129.949 74.5334 115.365 82.9534ZM75.7557 75.3302C68.4637 71.1202 68.4637 64.2944 75.7557 60.0843C83.0477 55.8743 94.8703 55.8743 102.162 60.0843C109.454 64.2944 109.454 71.1202 102.162 75.3302C94.8703 79.5402 83.0477 79.5402 75.7557 75.3302ZM54.1024 75.0254L76.2837 87.8317C80.7204 90.3933 82.9388 91.6741 85.4969 92.154C87.7471 92.5761 90.1709 92.5761 92.4211 92.154C94.9791 91.6741 97.1975 90.3933 101.634 87.8317L123.816 75.0254C128.252 72.4638 130.471 71.183 131.302 69.7061C132.033 68.407 132.033 67.0076 131.302 65.7084C130.471 64.2315 128.252 62.9508 123.816 60.3892L101.634 47.5828C97.1975 45.0212 94.9791 43.7404 92.4211 43.2606C90.1709 42.8385 87.7471 42.8385 85.4969 43.2606C82.9388 43.7404 80.7204 45.0212 76.2837 47.5828L54.1024 60.3892C49.6656 62.9508 47.4472 64.2315 46.616 65.7084C45.8849 67.0076 45.8849 68.407 46.6161 69.7061C47.4472 71.183 49.6656 72.4638 54.1024 75.0254ZM81.565 47.5828L54.1024 63.4383C49.6656 65.9999 47.4472 67.2807 46.6161 68.7576C45.8849 70.0567 45.8849 71.4562 46.616 72.7553C47.4472 74.2322 49.6656 75.513 54.1024 78.0745L71.0023 87.8317C75.4391 90.3933 77.6575 91.6741 80.2156 92.154C82.4657 92.5761 84.8896 92.5761 87.1397 92.154C89.6978 91.6741 91.9162 90.3933 96.353 87.8317L123.816 71.9762C128.252 69.4146 130.471 68.1338 131.302 66.6569C132.033 65.3578 132.033 63.9584 131.302 62.6593C130.471 61.1824 128.252 59.9016 123.816 57.34L106.916 47.5828C102.479 45.0212 100.26 43.7404 97.7024 43.2606C95.4522 42.8385 93.0284 42.8385 90.7782 43.2606C88.2202 43.7404 86.0018 45.0212 81.565 47.5828ZM123.816 63.4383L96.353 47.5828C91.9162 45.0212 89.6978 43.7404 87.1397 43.2606C84.8896 42.8385 82.4658 42.8385 80.2156 43.2606C77.6575 43.7404 75.4391 45.0212 71.0023 47.5828L54.1024 57.34C49.6656 59.9016 47.4472 61.1824 46.6161 62.6593C45.8849 63.9584 45.8849 65.3578 46.6161 66.6569C47.4472 68.1338 49.6656 69.4146 54.1024 71.9762L81.565 87.8317C86.0018 90.3933 88.2202 91.6741 90.7782 92.154C93.0284 92.5761 95.4522 92.5761 97.7024 92.154C100.26 91.6741 102.479 90.3933 106.916 87.8317L123.816 78.0746C128.252 75.513 130.471 74.2322 131.302 72.7553C132.033 71.4562 132.033 70.0567 131.302 68.7576C130.471 67.2807 128.252 65.9999 123.816 63.4383Z"
            stroke="#CACACA"
            strokeWidth="0.5"
          />
          <path
            d="M90.7669 98.4527C90.2912 98.7273 89.7762 98.8993 89.2219 98.9687C88.6677 99.038 88.1065 99.0153 87.5384 98.9007C86.9703 98.7807 86.4345 98.5753 85.931 98.2847C85.4368 97.9993 85.0881 97.6913 84.8849 97.3607C84.6817 97.03 84.6424 96.7007 84.7671 96.3727C84.8918 96.0393 85.199 95.7313 85.6886 95.4487C86.1135 95.2033 86.543 95.038 86.9772 94.9527C87.4114 94.862 87.8455 94.8407 88.2797 94.8887C88.7139 94.9367 89.1411 95.042 89.5614 95.2047L88.5222 95.8607C88.1989 95.7327 87.8756 95.6713 87.5522 95.6767C87.2289 95.6767 86.9056 95.77 86.5823 95.9567C86.3005 96.1193 86.1389 96.298 86.0973 96.4927C86.0604 96.6847 86.1227 96.8807 86.2844 97.0807C86.4507 97.278 86.6954 97.47 87.0188 97.6567C87.3467 97.846 87.6816 97.9887 88.0234 98.0847C88.3651 98.1753 88.7 98.2087 89.0279 98.1847C89.3605 98.158 89.6746 98.0593 89.9702 97.8887C90.1873 97.7633 90.3304 97.63 90.3997 97.4887C90.4736 97.3447 90.4782 97.2033 90.4136 97.0647C90.3535 96.9233 90.2358 96.7913 90.0602 96.6687L88.9379 97.3167L88.1688 96.8727L90.3235 95.6287L92.88 97.1047L92.2288 97.4807L91.1203 96.9047L91.3004 96.8647C91.4713 97.0167 91.5614 97.186 91.5706 97.3727C91.5798 97.5593 91.5175 97.7473 91.3835 97.9367C91.2496 98.1207 91.0441 98.2927 90.7669 98.4527ZM93.7203 96.6195L88.8013 93.7795L90.9559 92.5355C91.3162 92.3275 91.688 92.1822 92.0714 92.0995C92.4594 92.0142 92.8358 91.9942 93.2007 92.0395C93.5609 92.0822 93.8912 92.1902 94.1914 92.3635C94.4177 92.4942 94.5701 92.6382 94.6487 92.7955C94.7318 92.9502 94.7457 93.1075 94.6902 93.2675C94.6394 93.4249 94.5216 93.5729 94.3369 93.7115L94.2538 93.6875C94.5817 93.4982 94.9027 93.3955 95.2168 93.3795C95.5262 93.3609 95.838 93.4289 96.1521 93.5835L97.6901 94.3275L96.6163 94.9475L95.2791 94.2795C95.0759 94.1782 94.8773 94.1329 94.6833 94.1435C94.4893 94.1489 94.2676 94.2235 94.0182 94.3675L92.972 94.9715L94.7734 96.0115L93.7203 96.6195ZM92.0922 94.4635L93.076 93.8955C93.33 93.7489 93.4686 93.6022 93.4917 93.4555C93.5147 93.3035 93.4178 93.1649 93.2007 93.0395C92.979 92.9115 92.7411 92.8569 92.4871 92.8755C92.2284 92.8915 91.9628 92.9782 91.6903 93.1355L90.7412 93.6835L92.0922 94.4635ZM98.5511 93.8305L93.6321 90.9905L94.6851 90.3825L99.6042 93.2225L98.5511 93.8305ZM100.533 92.6859L95.6144 89.8459L97.3119 88.8659C98.1109 88.4046 98.94 88.1739 99.7991 88.1739C100.654 88.1713 101.476 88.3979 102.266 88.8539C103.051 89.3073 103.443 89.7793 103.443 90.2699C103.448 90.7579 103.058 91.2286 102.272 91.6819L100.533 92.6859ZM100.7 91.5659L101.344 91.1939C101.82 90.9193 102.044 90.6433 102.016 90.3659C101.988 90.0833 101.707 89.7873 101.171 89.4779C100.635 89.1686 100.125 89.0073 99.6397 88.9939C99.1548 88.9753 98.6744 89.1033 98.1987 89.3779L97.5543 89.7499L100.7 91.5659Z"
            fill="black"
          />
        </g>

        <g className="layer3" style={{ visibility: "hidden" }}>
          <rect
            width="73.1803"
            height="73.1803"
            transform="matrix(0.866025 0.5 -0.866025 0.5 88.96 16.6064)"
            fill="white"
            stroke="black"
          />
          <path
            d="M88.6063 85.0619L83.6873 82.2219L85.3847 81.2419C86.1837 80.7806 87.0128 80.5499 87.8719 80.5499C88.7264 80.5472 89.5485 80.7739 90.3384 81.2299C91.1235 81.6832 91.5161 82.1552 91.5161 82.6459C91.5208 83.1339 91.1305 83.6046 90.3453 84.0579L88.6063 85.0619ZM88.7726 83.9419L89.4169 83.5699C89.8926 83.2952 90.1166 83.0192 90.0889 82.7419C90.0612 82.4592 89.7795 82.1632 89.2437 81.8539C88.7079 81.5446 88.1975 81.3832 87.7126 81.3699C87.2276 81.3512 86.7472 81.4792 86.2715 81.7539L85.6272 82.1259L88.7726 83.9419ZM93.4845 82.2455L88.5654 79.4055L91.988 77.4295L92.8748 77.9415L90.5053 79.3095L91.6346 79.9615L93.9209 78.6415L94.7939 79.1455L92.5076 80.4655L93.6507 81.1255L96.0756 79.7255L96.9624 80.2375L93.4845 82.2455ZM99.852 78.6972C99.427 78.9426 98.9906 79.1119 98.5425 79.2052C98.0945 79.2986 97.6557 79.3199 97.2262 79.2692C96.7966 79.2186 96.3948 79.0986 96.0207 78.9092L97.0322 78.2692C97.2539 78.3652 97.4756 78.4292 97.6973 78.4612C97.919 78.4879 98.1361 78.4799 98.3485 78.4372C98.5656 78.3919 98.7804 78.3079 98.9929 78.1852C99.1684 78.0839 99.2954 77.9866 99.3739 77.8932C99.4571 77.7972 99.4894 77.7066 99.4709 77.6212C99.4478 77.5332 99.3739 77.4532 99.2492 77.3812C99.1337 77.3146 99.0067 77.2732 98.8682 77.2572C98.725 77.2386 98.5402 77.2546 98.3139 77.3052C98.083 77.3532 97.7804 77.4452 97.4063 77.5812C96.889 77.7679 96.441 77.9012 96.0622 77.9812C95.6881 78.0586 95.3533 78.0786 95.0576 78.0412C94.7574 78.0012 94.4688 77.9012 94.1916 77.7412C93.896 77.5706 93.709 77.3799 93.6304 77.1692C93.5565 76.9559 93.5958 76.7332 93.7482 76.5012C93.9006 76.2692 94.1685 76.0426 94.5519 75.8212C94.9583 75.5866 95.374 75.4292 95.799 75.3492C96.2239 75.2692 96.6396 75.2559 97.046 75.3092C97.4571 75.3599 97.8405 75.4692 98.1961 75.6372L97.1985 76.2772C97.0137 76.1866 96.8197 76.1279 96.6165 76.1012C96.4086 76.0719 96.2031 76.0759 95.9999 76.1132C95.7967 76.1506 95.6004 76.2239 95.411 76.3332C95.1708 76.4719 95.0346 76.6119 95.0022 76.7532C94.9745 76.8919 95.0461 77.0106 95.217 77.1092C95.3371 77.1786 95.4687 77.2199 95.6119 77.2332C95.7551 77.2412 95.9283 77.2212 96.1315 77.1732C96.3394 77.1226 96.6049 77.0359 96.9283 76.9132C97.4779 76.7026 97.9559 76.5626 98.3624 76.4932C98.7689 76.4186 99.1245 76.4052 99.4293 76.4532C99.7342 76.5012 100.011 76.5972 100.261 76.7412C100.566 76.9172 100.753 77.1159 100.822 77.3372C100.891 77.5532 100.843 77.7786 100.676 78.0132C100.515 78.2452 100.24 78.4732 99.852 78.6972ZM102.402 77.0971L97.4828 74.2571L98.5359 73.6491L103.455 76.4891L102.402 77.0971ZM106.532 74.8403C106.057 75.115 105.542 75.287 104.987 75.3563C104.433 75.4257 103.872 75.403 103.304 75.2883C102.736 75.1683 102.2 74.963 101.696 74.6723C101.202 74.387 100.853 74.079 100.65 73.7483C100.447 73.4177 100.408 73.0883 100.532 72.7603C100.657 72.427 100.964 72.119 101.454 71.8363C101.879 71.591 102.308 71.4257 102.743 71.3403C103.177 71.2497 103.611 71.2283 104.045 71.2763C104.479 71.3243 104.906 71.4297 105.327 71.5923L104.288 72.2483C103.964 72.1203 103.641 72.059 103.318 72.0643C102.994 72.0643 102.671 72.1577 102.348 72.3443C102.066 72.507 101.904 72.6857 101.863 72.8803C101.826 73.0723 101.888 73.2683 102.05 73.4683C102.216 73.6657 102.461 73.8577 102.784 74.0443C103.112 74.2337 103.447 74.3763 103.789 74.4723C104.13 74.563 104.465 74.5963 104.793 74.5723C105.126 74.5457 105.44 74.447 105.736 74.2763C105.953 74.151 106.096 74.0177 106.165 73.8763C106.239 73.7323 106.244 73.591 106.179 73.4523C106.119 73.311 106.001 73.179 105.826 73.0563L104.703 73.7043L103.934 73.2603L106.089 72.0163L108.645 73.4923L107.994 73.8683L106.886 73.2923L107.066 73.2523C107.237 73.4043 107.327 73.5737 107.336 73.7603C107.345 73.947 107.283 74.135 107.149 74.3243C107.015 74.5083 106.809 74.6803 106.532 74.8403ZM109.486 73.0072L104.567 70.1672L105.731 69.4952L111.079 70.3272L107.684 68.3672L108.737 67.7592L113.656 70.5992L112.479 71.2792L107.262 70.5072L110.539 72.3992L109.486 73.0072Z"
            fill="black"
          />
          <path
            d="M114.687 45.3896L105.348 50.7818C104.257 51.4118 103.644 52.2663 103.644 53.1572C103.644 54.0482 104.257 54.9027 105.348 55.5327L114.687 60.9249"
            stroke="#CDCDCD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M60.7891 48.8096L64.204 50.7812C65.8408 51.7262 68.0608 52.2571 70.3756 52.2571C72.6903 52.2571 74.9103 51.7262 76.5471 50.7812C77.6383 50.1512 79.1183 49.7972 80.6615 49.7972C82.2047 49.7972 83.6847 50.1512 84.7759 50.7812C87.0388 52.0877 90.7417 52.0877 93.0046 50.7812C94.0958 50.1512 94.7088 49.2967 94.7088 48.4057C94.7088 47.5148 94.0958 46.6603 93.0046 46.0303C90.7417 44.7238 90.7417 42.5859 93.0046 41.2794L99.5259 37.5144"
            stroke="#CDCDCD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M107.303 66.1625L99.1774 61.4711C98.0862 60.8411 96.6062 60.4871 95.063 60.4871C93.5198 60.4871 92.0398 60.8411 90.9486 61.4711C89.8574 62.1011 88.3774 62.455 86.8342 62.455C85.291 62.455 83.8111 62.1011 82.7199 61.4711L80.6627 60.2833C79.5715 59.6533 78.0915 59.2994 76.5483 59.2994C75.0051 59.2994 73.5251 59.6533 72.4339 60.2833L66.3652 63.7871"
            stroke="#CDCDCD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M109.422 65.0568C120.806 58.5097 120.841 47.8745 109.501 41.3025C98.1608 34.7304 79.7402 34.7102 68.3571 41.2573C56.9739 47.8044 56.9389 58.4395 68.2788 65.0116C79.6186 71.5836 98.0393 71.6039 109.422 65.0568Z"
            stroke="#CDCDCD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g className="layer4" style={{ visibility: "hidden" }}>
          <rect
            width="73.1803"
            height="73.1803"
            transform="matrix(0.866025 0.5 -0.866025 0.5 88.8896 0.5)"
            fill="white"
            stroke="black"
          />
          <path
            d="M90.5946 67.8955C90.1697 68.1408 89.7332 68.3101 89.2852 68.4035C88.8372 68.4968 88.3984 68.5181 87.9689 68.4675C87.5393 68.4168 87.1375 68.2968 86.7633 68.1075L87.7749 67.4675C87.9966 67.5635 88.2183 67.6275 88.44 67.6595C88.6617 67.6861 88.8788 67.6781 89.0912 67.6355C89.3083 67.5901 89.5231 67.5061 89.7355 67.3835C89.9111 67.2821 90.0381 67.1848 90.1166 67.0915C90.1997 66.9955 90.2321 66.9048 90.2136 66.8195C90.1905 66.7315 90.1166 66.6515 89.9919 66.5795C89.8764 66.5128 89.7494 66.4715 89.6108 66.4555C89.4677 66.4368 89.2829 66.4528 89.0566 66.5035C88.8256 66.5515 88.5231 66.6435 88.149 66.7795C87.6317 66.9661 87.1837 67.0995 86.8049 67.1795C86.4308 67.2568 86.0959 67.2768 85.8003 67.2395C85.5001 67.1995 85.2114 67.0995 84.9343 66.9395C84.6387 66.7688 84.4516 66.5781 84.3731 66.3675C84.2992 66.1541 84.3385 65.9315 84.4909 65.6995C84.6433 65.4675 84.9112 65.2408 85.2946 65.0195C85.701 64.7848 86.1167 64.6275 86.5416 64.5475C86.9666 64.4675 87.3823 64.4541 87.7887 64.5075C88.1998 64.5581 88.5832 64.6675 88.9388 64.8355L87.9411 65.4755C87.7564 65.3848 87.5624 65.3261 87.3592 65.2995C87.1513 65.2701 86.9458 65.2741 86.7426 65.3115C86.5393 65.3488 86.343 65.4221 86.1537 65.5315C85.9135 65.6701 85.7772 65.8101 85.7449 65.9515C85.7172 66.0901 85.7888 66.2088 85.9597 66.3075C86.0798 66.3768 86.2114 66.4181 86.3546 66.4315C86.4978 66.4395 86.671 66.4195 86.8742 66.3715C87.082 66.3208 87.3476 66.2341 87.6709 66.1115C88.2206 65.9008 88.6986 65.7608 89.1051 65.6915C89.5115 65.6168 89.8672 65.6035 90.172 65.6515C90.4769 65.6995 90.754 65.7955 91.0034 65.9395C91.3082 66.1155 91.4953 66.3141 91.5646 66.5355C91.6339 66.7515 91.5854 66.9768 91.4191 67.2115C91.2574 67.4435 90.9826 67.6715 90.5946 67.8955ZM94.0076 65.797L89.9754 63.469L88.5067 64.317L87.6198 63.805L91.6243 61.493L92.5112 62.005L91.0354 62.857L95.0677 65.185L94.0076 65.797ZM98.3338 63.2993L96.4216 62.1953L91.7035 61.4473L92.8674 60.7753L95.9228 61.2993L95.0082 59.5393L96.1722 58.8673L97.4747 61.5873L99.3869 62.6913L98.3338 63.2993ZM101.554 61.4398L96.6354 58.5998L97.6885 57.9918L102.323 60.6678L101.139 60.6558L103.986 59.0118L104.873 59.5238L101.554 61.4398ZM105.411 59.2133L100.492 56.3733L101.545 55.7653L106.464 58.6053L105.411 59.2133ZM107.393 58.0687L102.474 55.2287L103.638 54.5567L108.987 55.3887L105.592 53.4287L106.645 52.8207L111.564 55.6607L110.386 56.3407L105.169 55.5687L108.446 57.4607L107.393 58.0687ZM114.643 54.0112C114.167 54.2859 113.652 54.4579 113.098 54.5272C112.544 54.5966 111.982 54.5739 111.414 54.4592C110.846 54.3392 110.31 54.1339 109.807 53.8432C109.313 53.5579 108.964 53.2499 108.761 52.9192C108.558 52.5886 108.518 52.2592 108.643 51.9312C108.768 51.5979 109.075 51.2899 109.564 51.0072C109.989 50.7619 110.419 50.5966 110.853 50.5112C111.287 50.4206 111.721 50.3992 112.156 50.4472C112.59 50.4952 113.017 50.6006 113.437 50.7632L112.398 51.4192C112.075 51.2912 111.751 51.2299 111.428 51.2352C111.105 51.2352 110.781 51.3286 110.458 51.5152C110.176 51.6779 110.015 51.8566 109.973 52.0512C109.936 52.2432 109.999 52.4392 110.16 52.6392C110.327 52.8366 110.571 53.0286 110.895 53.2152C111.223 53.4046 111.557 53.5472 111.899 53.6432C112.241 53.7339 112.576 53.7672 112.904 53.7432C113.236 53.7166 113.55 53.6179 113.846 53.4472C114.063 53.3219 114.206 53.1886 114.276 53.0472C114.35 52.9032 114.354 52.7619 114.289 52.6232C114.229 52.4819 114.112 52.3499 113.936 52.2272L112.814 52.8752L112.045 52.4312L114.199 51.1872L116.756 52.6632L116.105 53.0392L114.996 52.4632L115.176 52.4232C115.347 52.5752 115.437 52.7446 115.446 52.9312C115.456 53.1179 115.393 53.3059 115.259 53.4952C115.125 53.6792 114.92 53.8512 114.643 54.0112Z"
            fill="black"
          />
          <path
            d="M114.687 29.3232L105.348 34.7154C104.257 35.3454 103.644 36.1999 103.644 37.0908C103.644 37.9818 104.257 38.8362 105.348 39.4663L114.687 44.8585"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M60.7891 32.7432L64.204 34.7148C65.8408 35.6598 68.0608 36.1907 70.3756 36.1907C72.6903 36.1907 74.9103 35.6598 76.5471 34.7148C77.6383 34.0848 79.1183 33.7308 80.6615 33.7308C82.2047 33.7308 83.6847 34.0848 84.7759 34.7148C87.0388 36.0213 90.7417 36.0213 93.0046 34.7148C94.0958 34.0848 94.7088 33.2303 94.7088 32.3393C94.7088 31.4484 94.0958 30.5939 93.0046 29.9639C90.7417 28.6574 90.7417 26.5195 93.0046 25.213L99.5259 21.448"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M107.303 50.0961L99.1774 45.4047C98.0862 44.7747 96.6062 44.4207 95.063 44.4207C93.5198 44.4207 92.0398 44.7747 90.9486 45.4047C89.8574 46.0347 88.3774 46.3886 86.8342 46.3886C85.291 46.3886 83.8111 46.0347 82.7199 45.4047L80.6627 44.2169C79.5715 43.5869 78.0915 43.233 76.5483 43.233C75.0051 43.233 73.5251 43.5869 72.4339 44.2169L66.3652 47.7207"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M109.422 48.9904C120.806 42.4433 120.841 31.8081 109.501 25.2361C98.1608 18.664 79.7402 18.6438 68.3571 25.1909C56.9739 31.7379 56.9389 42.3731 68.2788 48.9452C79.6186 55.5172 98.0393 55.5375 109.422 48.9904Z"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <rect
          width="169"
          height="40"
          transform="matrix(0.866025 0.5 -0.866025 0.5 168.413 271.044)"
          fill="white"
          stroke="black"
        />
        <rect
          width="169"
          height="186"
          transform="matrix(0.866025 0.5 0 1 133.771 291.044)"
          fill="url(#paint14_linear_4_2)"
          stroke="url(#paint15_linear_4_2)"
        />
        <rect
          width="40"
          height="186"
          transform="matrix(0.866025 -0.5 0 1 280.13 375.544)"
          fill="url(#paint16_linear_4_2)"
          stroke="url(#paint17_linear_4_2)"
        />
        <path d="M350.673 376.364L315.84 356.252L281.199 376.252" stroke="black" />
        <path
          d="M281.738 376.235L315.827 356.327L350.326 376.546L346.143 376.546C346.143 376.053 345.595 375.796 345.51 375.729C336.656 370.565 318.76 360.09 317.619 359.408C316.822 358.932 315.753 358.808 314.733 359.121L285.886 376.02L281.738 376.235Z"
          fill="white"
        />
        <path
          d="M168.581 263.222L198.892 280.722L168.581 305.061L138.27 287.545L168.581 263.222Z"
          fill="white"
          stroke="black"
        />
        <path
          d="M168.581 265.639L195.167 280.988L168.314 302.49L141.729 287.126L168.581 265.639Z"
          fill="white"
          stroke="black"
        />
        <rect
          width="35"
          height="3.18346"
          transform="matrix(0.866025 0.5 0 1 138.27 287.538)"
          fill="white"
          stroke="black"
        />
        <path
          d="M168.582 305.049L198.892 280.722V290.722L168.581 308.222L168.582 305.049Z"
          fill="white"
          stroke="black"
        />
        <path
          d="M154.8 278.19L158.157 275.568L159.482 276.333C159.925 276.589 160.187 276.838 160.267 277.082C160.347 277.325 160.23 277.57 159.915 277.816C159.773 277.927 159.615 278.005 159.442 278.051C159.269 278.096 159.087 278.107 158.896 278.082C158.711 278.057 158.531 277.996 158.355 277.898L158.368 277.88C158.677 278.067 158.843 278.27 158.865 278.488C158.893 278.706 158.786 278.909 158.543 279.099C158.238 279.338 157.895 279.453 157.515 279.443C157.136 279.434 156.738 279.309 156.322 279.069L154.8 278.19ZM155.82 278.156L156.765 278.702C156.997 278.836 157.22 278.907 157.433 278.914C157.653 278.921 157.847 278.86 158.014 278.729C158.178 278.601 158.24 278.463 158.199 278.316C158.163 278.17 158.028 278.031 157.796 277.897L156.85 277.351L155.82 278.156ZM157.285 277.011L158.039 277.446C158.285 277.588 158.518 277.665 158.738 277.676C158.958 277.688 159.146 277.633 159.3 277.512C159.464 277.384 159.519 277.252 159.467 277.114C159.42 276.976 159.269 276.833 159.013 276.685L158.259 276.25L157.285 277.011ZM159.658 281.098C159.367 280.93 159.163 280.743 159.045 280.539C158.934 280.333 158.915 280.123 158.986 279.907C159.061 279.693 159.228 279.485 159.486 279.284L161.661 277.584L162.222 277.908L160.047 279.608C159.792 279.807 159.671 280.005 159.685 280.201C159.702 280.395 159.849 280.572 160.126 280.732C160.403 280.892 160.686 280.963 160.973 280.945C161.265 280.925 161.538 280.815 161.793 280.616L163.968 278.916L164.529 279.24L162.354 280.94C162.096 281.141 161.813 281.282 161.506 281.362C161.203 281.444 160.892 281.463 160.573 281.421C160.257 281.375 159.952 281.268 159.658 281.098ZM162.061 282.383L165.418 279.76L165.979 280.084L162.622 282.707L162.061 282.383ZM163.518 283.224L166.874 280.601L167.436 280.925L164.268 283.4L164.251 283.011L166.345 284.22L165.877 284.586L163.518 283.224ZM166.319 284.841L169.676 282.218L170.86 282.902C171.439 283.236 171.737 283.607 171.756 284.017C171.778 284.423 171.519 284.837 170.98 285.258C170.444 285.677 169.877 285.91 169.279 285.959C168.684 286.009 168.103 285.871 167.534 285.543L166.319 284.841ZM167.348 284.799L167.971 285.159C168.38 285.395 168.784 285.493 169.184 285.454C169.59 285.415 169.995 285.237 170.398 284.922C170.808 284.602 171.01 284.305 171.004 284.032C171.005 283.758 170.801 283.504 170.392 283.268L169.769 282.908L167.348 284.799ZM169.906 286.912L173.263 284.289L173.824 284.613L170.467 287.236L169.906 286.912ZM171.271 287.7L174.628 285.077L175.34 285.488L174.307 288.611L177.044 286.472L177.606 286.796L174.249 289.419L173.511 288.993L174.508 285.933L171.832 288.024L171.271 287.7ZM176.441 290.788C176.091 290.586 175.865 290.355 175.764 290.095C175.666 289.833 175.682 289.561 175.812 289.281C175.945 288.998 176.182 288.724 176.522 288.458C176.86 288.194 177.226 287.997 177.623 287.866C178.023 287.737 178.425 287.687 178.829 287.715C179.236 287.74 179.617 287.855 179.97 288.059C180.271 288.233 180.477 288.418 180.587 288.614C180.701 288.813 180.733 289.013 180.684 289.216C180.639 289.421 180.531 289.623 180.362 289.821L179.747 289.504C179.91 289.32 179.982 289.136 179.963 288.954C179.946 288.769 179.793 288.592 179.502 288.424C179.245 288.276 178.978 288.201 178.698 288.198C178.419 288.195 178.141 288.247 177.866 288.354C177.595 288.462 177.341 288.609 177.104 288.794C176.858 288.986 176.677 289.179 176.561 289.373C176.449 289.57 176.417 289.759 176.466 289.942C176.522 290.124 176.679 290.289 176.935 290.437C177.136 290.553 177.348 290.622 177.573 290.645C177.797 290.667 178.017 290.648 178.232 290.588C178.451 290.53 178.645 290.439 178.816 290.315L177.829 289.745L178.259 289.409L179.782 290.288L178.07 291.625L177.686 291.403L178.406 290.791L178.422 290.878C178.232 290.974 178.02 291.034 177.786 291.057C177.552 291.08 177.317 291.068 177.081 291.022C176.848 290.978 176.635 290.9 176.441 290.788Z"
          fill="black"
        />
        <path
          d="M202.02 282.639L310.273 345.139L279.962 369.422L171.709 306.99L202.02 282.639Z"
          fill="white"
          stroke="black"
        />
        <path
          d="M202.269 284.739L306.664 345.011L279.524 367.222L175.132 307.013L202.269 284.739Z"
          fill="white"
          stroke="black"
        />
        <rect
          width="125"
          height="3.17605"
          transform="matrix(0.866025 0.5 0 1 171.708 306.962)"
          fill="white"
          stroke="black"
        />
        <path
          d="M279.962 369.47L310.273 345.139V355.139L279.962 372.639V369.47Z"
          fill="white"
          stroke="black"
        />
        <g className="LaunchButton">
          <path
            d="M315.211 347.992C315.689 347.716 316.465 347.716 316.943 347.992L345.522 364.492C346 364.768 346 365.216 345.522 365.492L316.943 381.992C316.465 382.268 315.689 382.268 315.211 381.992L286.632 365.492C286.154 365.216 286.154 364.768 286.632 364.492L315.211 347.992Z"
            fill="#84A2FF"
            stroke="black"
          />
          <rect
            width="33"
            height="20"
            transform="matrix(0.866025 0.5 0 1 286.632 365.492)"
            fill="#84A2FF"
            stroke="black"
          />
          <rect
            width="33"
            height="20"
            transform="matrix(0.866025 -0.5 0 1 316.942 381.992)"
            fill="#84A2FF"
            stroke="black"
          />
          <path
            d="M286.273 364.992C286.273 365.187 286.411 365.364 286.632 365.492V385.492C286.411 385.364 286.273 385.187 286.273 384.992V364.992Z"
            fill="#84A2FF"
            stroke="black"
          />
          <path
            d="M315.211 381.992C315.689 382.268 316.465 382.268 316.943 381.992V401.992C316.465 402.268 315.689 402.268 315.211 401.992V381.992Z"
            fill="#84A2FF"
            stroke="black"
          />
          <path
            d="M345.881 364.992C345.881 365.187 345.744 365.364 345.522 365.492V385.492C345.744 385.364 345.881 385.187 345.881 384.992V364.992Z"
            fill="#84A2FF"
            stroke="black"
          />
          <path
            d="M303.394 360.25L307.083 358.12L307.645 358.444L304.163 360.454L304.174 360.106L306.268 361.315L305.753 361.612L303.394 360.25ZM305.979 361.743L310.999 360.381L311.71 360.792L309.351 363.69L308.754 363.345L309.377 362.595L307.87 361.725L306.577 362.088L305.979 361.743ZM308.556 361.533L309.715 362.202L310.817 360.894L308.556 361.533ZM311.091 364.79C310.8 364.622 310.601 364.443 310.494 364.253C310.393 364.063 310.388 363.874 310.478 363.686C310.572 363.5 310.76 363.325 311.045 363.161L313.435 361.781L313.996 362.105L311.606 363.485C311.325 363.647 311.185 363.816 311.185 363.992C311.188 364.166 311.329 364.333 311.606 364.493C311.883 364.653 312.172 364.734 312.473 364.736C312.778 364.736 313.071 364.655 313.352 364.493L315.742 363.113L316.303 363.437L313.913 364.817C313.629 364.981 313.324 365.089 312.998 365.141C312.676 365.195 312.35 365.193 312.021 365.135C311.696 365.075 311.386 364.96 311.091 364.79ZM313.502 366.086L317.191 363.956L317.903 364.367L316.599 367.088L319.608 365.351L320.169 365.675L316.48 367.805L315.742 367.379L317.004 364.712L314.063 366.41L313.502 366.086ZM318.68 369.172C318.347 368.98 318.131 368.767 318.031 368.533C317.934 368.297 317.958 368.055 318.103 367.807C318.249 367.559 318.521 367.32 318.919 367.09C319.314 366.862 319.724 366.705 320.151 366.619C320.584 366.533 321.004 366.518 321.413 366.574C321.825 366.628 322.201 366.753 322.541 366.949C322.998 367.213 323.239 367.484 323.263 367.762C323.287 368.04 323.135 368.318 322.806 368.596L322.187 368.275C322.392 368.101 322.485 367.927 322.468 367.753C322.454 367.577 322.307 367.408 322.026 367.246C321.801 367.116 321.548 367.036 321.268 367.006C320.991 366.978 320.7 366.998 320.395 367.066C320.093 367.136 319.795 367.256 319.501 367.426C319.207 367.596 318.999 367.768 318.877 367.942C318.76 368.118 318.729 368.286 318.784 368.446C318.839 368.606 318.976 368.749 319.194 368.875C319.492 369.047 319.801 369.135 320.119 369.139C320.445 369.143 320.767 369.077 321.086 368.941L321.642 369.298C321.316 369.434 320.984 369.522 320.644 369.562C320.305 369.602 319.967 369.591 319.631 369.529C319.298 369.465 318.981 369.346 318.68 369.172ZM320.987 370.407L324.676 368.277L325.237 368.601L323.46 369.627L323.388 369.357L325.632 370.653L325.165 370.611L326.942 369.585L327.503 369.909L323.814 372.039L323.252 371.715L325.05 370.677L325.123 370.947L322.878 369.651L323.346 369.693L321.548 370.731L320.987 370.407Z"
            fill="black"
          />
        </g>
        <g
          className="RelaunchButton"
          style={{
            opacity: 0,
            pointerEvents: "none",
            cursor: "pointer",
            transformOrigin: "50% 50%",
          }}
          aria-hidden={!showReset}
          onClick={handleRelaunch}
          onMouseEnter={(e) => {
            if (isResetting) return;
            if (
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
              return;
            gsap.to(e.currentTarget, {
              scale: 1.04,
              duration: 0.15,
              ease: "power2.out",
              transformOrigin: "50% 50%",
            });
          }}
          onMouseLeave={(e) => {
            if (isResetting) return;
            if (
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
              return;
            gsap.to(e.currentTarget, {
              scale: 1,
              duration: 0.18,
              ease: "power2.out",
              transformOrigin: "50% 50%",
            });
          }}
          onMouseDown={(e) => {
            if (isResetting) return;
            if (
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
              return;
            gsap.to(e.currentTarget, {
              scale: 0.97,
              duration: 0.1,
              ease: "power2.out",
              transformOrigin: "50% 50%",
            });
          }}
          onMouseUp={(e) => {
            if (isResetting) return;
            if (
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
              return;
            gsap.to(e.currentTarget, {
              scale: 1.04,
              duration: 0.15,
              ease: "power2.out",
              transformOrigin: "50% 50%",
            });
          }}
          role="button"
          aria-label="Relaunch"
        >
          <rect
            x="270"
            y="314"
            width="92"
            height="26"
            rx="13"
            fill="white"
            stroke="black"
          />
          {/* Refresh glyph: a small arc with an arrow head */}
          <path
            d="M283 332 A5 5 0 1 0 282 322 L286 322 M282 322 L284 320 M282 322 L284 324"
            stroke="black"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="320"
            y="332"
            textAnchor="middle"
            fontSize="10"
            fontFamily="inherit"
            fontWeight="600"
            fill="black"
            letterSpacing="0.6"
          >
            RELAUNCH
          </text>
        </g>
        <path
          d="M346.004 376.59L317.02 393.324C316.542 393.6 315.767 393.6 315.288 393.324L286.229 376.547"
          stroke="black"
          strokeLinecap="round"
        />
        <path
          d="M350.326 376.455L316.238 396.363L281.738 376.144L285.922 376.144C285.922 376.637 286.469 376.894 286.554 376.961C295.409 382.125 313.305 392.6 314.445 393.281C315.243 393.758 316.312 393.882 317.331 393.569L346.179 376.67L350.326 376.455Z"
          fill="white"
        />
        <path
          d="M350.326 376.7L316.285 396.354L281.662 376.364"
          stroke="black"
          strokeLinecap="round"
        />
        <rect
          width="40"
          height="185.45"
          transform="matrix(0.866025 -0.5 0 1 316.03 396.915)"
          fill="url(#paint18_linear_4_2)"
          stroke="url(#paint19_linear_4_2)"
        />
        <rect
          width="40"
          height="185.612"
          transform="matrix(0.866025 0.5 0 1 281.389 376.751)"
          fill="url(#paint20_linear_4_2)"
          stroke="url(#paint21_linear_4_2)"
        />
        <path
          className="Pluse"
          d="M188.591 296.229L200.793 303.302C201.023 303.436 201.297 303.472 201.554 303.403L213.073 300.304C213.816 300.104 214.497 300.784 214.299 301.528L209.911 317.967C209.713 318.711 210.394 319.391 211.137 319.191L225.11 315.431C225.367 315.362 225.641 315.398 225.872 315.532L245.89 327.136C246.12 327.27 246.394 327.306 246.651 327.237L257.493 324.32C258.237 324.12 258.918 324.8 258.719 325.544L253.634 344.6C253.435 345.343 254.116 346.023 254.86 345.823L265.72 342.901L273.637 340.771C274.272 340.6 274.896 341.079 274.896 341.737V348.572C274.896 348.929 275.086 349.258 275.395 349.437L290.534 358.213"
          stroke="black"
        />
        <foreignObject x="336.094" y="391.609" width="241.075" height="101.726">
          <div
            style={{
              backdropFilter: "blur(2px)",
              clipPath: "url(#bgblur_0_4_2_clip_path)",
              height: "100%",
              width: "100%",
            }}
          ></div>
        </foreignObject>
        <g filter="url(#filter0_ii_4_2)" data-figma-bg-blur-radius="4">
          <path
            d="M512.232 467.826C412.654 509.509 359.092 441.774 343.505 400.085C343.164 399.173 341.844 399.225 341.565 400.158L340.635 403.278C340.576 403.476 340.581 403.692 340.647 403.888C368.614 486.21 450.308 505.384 514.659 475.657C565.88 451.996 574.485 416.844 572.385 401.932C572.358 401.743 572.277 401.576 572.151 401.432L567.786 396.451C567.124 395.695 565.831 396.289 565.919 397.29C568.935 431.93 531.805 458.598 512.232 467.826Z"
            fill="#E2E1FF"
            fillOpacity="0.1"
          />
          <path
            d="M512.232 467.826C412.654 509.509 359.092 441.774 343.505 400.085C343.164 399.173 341.844 399.225 341.565 400.158L340.635 403.278C340.576 403.476 340.581 403.692 340.647 403.888C368.614 486.21 450.308 505.384 514.659 475.657C565.88 451.996 574.485 416.844 572.385 401.932C572.358 401.743 572.277 401.576 572.151 401.432L567.786 396.451C567.124 395.695 565.831 396.289 565.919 397.29C568.935 431.93 531.805 458.598 512.232 467.826Z"
            stroke="url(#paint22_linear_4_2)"
          />
          <path
            d="M512.232 467.826C412.654 509.509 359.092 441.774 343.505 400.085C343.164 399.173 341.844 399.225 341.565 400.158L340.635 403.278C340.576 403.476 340.581 403.692 340.647 403.888C368.614 486.21 450.308 505.384 514.659 475.657C565.88 451.996 574.485 416.844 572.385 401.932C572.358 401.743 572.277 401.576 572.151 401.432L567.786 396.451C567.124 395.695 565.831 396.289 565.919 397.29C568.935 431.93 531.805 458.598 512.232 467.826Z"
            stroke="black"
          />
        </g>

        <foreignObject x="331.681" y="408.46" width="282.649" height="102.087">
          <div
            style={{
              backdropFilter: "blur(2px)",
              clipPath: "url(#bgblur_1_4_2_clip_path)",
              height: "100%",
              width: "100%",
            }}
          ></div>
        </foreignObject>
        <g filter="url(#filter1_ii_4_2)" data-figma-bg-blur-radius="4">
          <path
            d="M538.563 485.041C420.667 526.893 357.473 458.439 339.383 416.795C339.016 415.949 337.797 416.009 337.491 416.879L336.237 420.445C336.156 420.673 336.163 420.926 336.253 421.15C369.249 503.432 465.558 522.594 541.425 492.873C601.785 469.226 611.958 434.104 609.499 419.176C609.465 418.969 609.365 418.789 609.214 418.643L603.634 413.242C602.932 412.562 601.726 413.203 601.834 414.174C605.706 448.976 561.717 475.784 538.563 485.041Z"
            fill="#E2E1FF"
            fillOpacity="0.1"
          />
          <path
            d="M538.563 485.041C420.667 526.893 357.473 458.439 339.383 416.795C339.016 415.949 337.797 416.009 337.491 416.879L336.237 420.445C336.156 420.673 336.163 420.926 336.253 421.15C369.249 503.432 465.558 522.594 541.425 492.873C601.785 469.226 611.958 434.104 609.499 419.176C609.465 418.969 609.365 418.789 609.214 418.643L603.634 413.242C602.932 412.562 601.726 413.203 601.834 414.174C605.706 448.976 561.717 475.784 538.563 485.041Z"
            stroke="url(#paint23_linear_4_2)"
          />
          <path
            d="M538.563 485.041C420.667 526.893 357.473 458.439 339.383 416.795C339.016 415.949 337.797 416.009 337.491 416.879L336.237 420.445C336.156 420.673 336.163 420.926 336.253 421.15C369.249 503.432 465.558 522.594 541.425 492.873C601.785 469.226 611.958 434.104 609.499 419.176C609.465 418.969 609.365 418.789 609.214 418.643L603.634 413.242C602.932 412.562 601.726 413.203 601.834 414.174C605.706 448.976 561.717 475.784 538.563 485.041Z"
            stroke="black"
          />
        </g>
        <line
          x1="132.996"
          y1="117.184"
          x2="315.978"
          y2="225.675"
          stroke="white"
          strokeOpacity="0.1"
        />
        <line className="path2" x1="413.406" y1="287.442" x2="596.388" y2="395.934" stroke="#" />
        <path
          d="M644.528 497.203V539.282L618.127 552.09L588.347 568.528L559.39 552.09V509.973V468.137V426.3V385.629L591.053 323.859V292.593V265.497V238.789V238.401V211.118L618.127 149.163L644.528 164.406V211.693V238.789V260.499L658.794 252.263L668.531 257.885L644.528 271.743V292.982V323.859V337.935L658.794 329.699L668.531 335.321L644.528 349.179V366.437V408.274V450.11V491.947V497.203Z"
          fill="url(#paint24_linear_4_2)"
        />
        <path
          d="M644.528 164.406L618.127 149.163M644.528 164.406L618.19 226.786M644.528 164.406V211.693M644.528 164.406L591.053 211.118M618.127 226.936L618.19 226.786M618.127 226.936L644.528 211.693M618.127 226.936V149.163M618.127 226.936V254.032M618.127 226.936L644.528 238.789M618.127 226.936L591.053 238.789M618.127 552.09L644.528 539.282M618.127 552.09L588.347 568.528M618.127 552.09V507.189M618.127 552.09L588.347 526.692M618.127 552.09L644.528 491.947M644.528 539.282V497.203V491.947M644.528 539.282L618.127 507.189M618.127 339.31L591.053 323.859M618.127 339.31L588.347 402.198M618.127 339.31L644.528 323.859M618.127 339.31V381.68M618.127 339.31V308.224M618.127 339.31L644.528 292.982M618.127 339.31L559.39 385.629M618.127 339.31L591.053 292.593M618.127 339.31L644.528 366.437M588.347 402.198L559.39 385.629M588.347 402.198L618.127 381.68M588.347 402.198L591.053 323.859M588.347 402.198V443.019M588.347 402.198L618.127 423.517M588.347 402.198L559.39 426.3M588.347 568.528L559.39 552.09M588.347 568.528V526.692M588.347 568.528L618.127 507.189M588.347 568.528L559.39 509.973M644.528 349.179L668.531 335.321L658.794 329.699L644.528 337.935M644.528 349.179V337.935M644.528 349.179V366.437M644.528 337.935V323.859M644.528 271.743L668.531 257.885L658.794 252.263L644.528 260.499M644.528 271.743V265.885M644.528 271.743V292.982M644.528 260.499V265.885M644.528 260.499V238.789M618.127 149.163L591.053 211.118M591.053 211.118L618.19 226.786M591.053 211.118V238.401M591.053 211.118L618.127 254.032M591.053 323.859L559.39 385.629M591.053 323.859V292.593M591.053 323.859L618.127 308.224M559.39 385.629V426.3M559.39 385.629L588.347 443.019M559.39 552.09V509.973M559.39 552.09L588.347 526.692M644.528 211.693V238.789M644.528 211.693L618.127 254.032M644.528 323.859V292.982M644.528 323.859L618.127 308.224M644.528 323.859L618.127 381.68M618.127 381.68V411.87V423.517M618.127 381.68L588.347 443.019M618.127 381.68L644.528 366.437M618.127 381.68L644.528 408.274M618.127 281.128L644.528 265.885M618.127 281.128V254.032M618.127 281.128V308.224M618.127 281.128L644.528 292.982M618.127 281.128L644.528 238.789M618.127 281.128L591.053 265.497M618.127 281.128L591.053 238.789M618.127 281.128L591.053 292.593M644.528 265.885L618.127 254.032M644.528 265.885L618.127 308.224M618.127 254.032L644.528 238.789M618.127 254.032L591.053 238.401M618.127 254.032L591.053 265.497M618.127 308.224L644.528 292.982M618.127 308.224L591.053 292.593M618.127 308.224L591.053 265.497M591.053 238.401V238.789M591.053 265.497V292.593M591.053 265.497V238.789M588.347 484.855V443.019M588.347 484.855V526.692M588.347 484.855L618.127 423.517M588.347 484.855L618.127 507.189M588.347 484.855L559.39 468.137M588.347 484.855L559.39 426.3M588.347 484.855L559.39 509.973M588.347 484.855L601.237 475.104L618.127 465.353M618.127 465.353V423.517M618.127 465.353V507.189M618.127 465.353L588.347 443.019M618.127 465.353L588.347 526.692M618.127 465.353L644.528 450.11M618.127 465.353L644.528 491.947M618.127 465.353L644.528 408.274M588.347 443.019L618.127 423.517M588.347 443.019L559.39 426.3M588.347 443.019L559.39 468.137M618.127 423.517L644.528 408.274M618.127 423.517L644.528 450.11M618.127 423.517L644.528 366.437M588.347 526.692L618.127 507.189M588.347 526.692L559.39 509.973M588.347 526.692L559.39 468.137M618.127 507.189L644.528 491.947M618.127 507.189L644.528 450.11M644.528 366.437V408.274M644.528 408.274V450.11M644.528 450.11V491.947M559.39 509.973V468.137M559.39 468.137V426.3"
          stroke="url(#paint25_linear_4_2)"
        />
        <defs>
          <linearGradient
            id="rocketTrailGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#5B78F2" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#5B78F2" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5B78F2" stopOpacity="0" />
          </linearGradient>
          <filter
            id="filter0_ii_4_2"
            x="336.094"
            y="391.609"
            width="241.075"
            height="101.726"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="4" dy="8" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 0.984314 0 0 0 0 0.933333 0 0 0 0.6 0"
            />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4_2" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="-2" />
            <feGaussianBlur stdDeviation="4" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.215382 0 0 0 0 0.208333 0 0 0 0 0.520833 0 0 0 0.2 0"
            />
            <feBlend mode="normal" in2="effect1_innerShadow_4_2" result="effect2_innerShadow_4_2" />
          </filter>
          <clipPath id="bgblur_0_4_2_clip_path" transform="translate(-336.094 -391.609)">
            <path d="M512.232 467.826C412.654 509.509 359.092 441.774 343.505 400.085C343.164 399.173 341.844 399.225 341.565 400.158L340.635 403.278C340.576 403.476 340.581 403.692 340.647 403.888C368.614 486.21 450.308 505.384 514.659 475.657C565.88 451.996 574.485 416.844 572.385 401.932C572.358 401.743 572.277 401.576 572.151 401.432L567.786 396.451C567.124 395.695 565.831 396.289 565.919 397.29C568.935 431.93 531.805 458.598 512.232 467.826Z" />
          </clipPath>
          <filter
            id="filter1_ii_4_2"
            x="331.681"
            y="408.46"
            width="282.649"
            height="102.087"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="4" dy="8" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 0.984314 0 0 0 0 0.933333 0 0 0 0.6 0"
            />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4_2" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="-2" />
            <feGaussianBlur stdDeviation="4" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.215382 0 0 0 0 0.208333 0 0 0 0 0.520833 0 0 0 0.2 0"
            />
            <feBlend mode="normal" in2="effect1_innerShadow_4_2" result="effect2_innerShadow_4_2" />
          </filter>
          <clipPath id="bgblur_1_4_2_clip_path" transform="translate(-331.681 -408.46)">
            <path d="M538.563 485.041C420.667 526.893 357.473 458.439 339.383 416.795C339.016 415.949 337.797 416.009 337.491 416.879L336.237 420.445C336.156 420.673 336.163 420.926 336.253 421.15C369.249 503.432 465.558 522.594 541.425 492.873C601.785 469.226 611.958 434.104 609.499 419.176C609.465 418.969 609.365 418.789 609.214 418.643L603.634 413.242C602.932 412.562 601.726 413.203 601.834 414.174C605.706 448.976 561.717 475.784 538.563 485.041Z" />
          </clipPath>
          <linearGradient
            id="paint0_linear_4_2"
            x1="50"
            y1="83.1921"
            x2="50"
            y2="-7.21073"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_4_2"
            x1="50"
            y1="0"
            x2="50"
            y2="93.2218"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_4_2"
            x1="50"
            y1="80.515"
            x2="50"
            y2="-6.9787"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_4_2"
            x1="50"
            y1="0"
            x2="50"
            y2="90.222"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_4_2"
            x1="105"
            y1="149.39"
            x2="105"
            y2="-12.9484"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_4_2"
            x1="105"
            y1="0"
            x2="105"
            y2="167.4"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_4_2"
            x1="105"
            y1="150.083"
            x2="105"
            y2="-13.0085"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint7_linear_4_2"
            x1="105"
            y1="0"
            x2="105"
            y2="168.177"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint8_linear_4_2"
            x1="633.257"
            y1="558.226"
            x2="633.257"
            y2="458.826"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint9_linear_4_2"
            x1="633.257"
            y1="466.754"
            x2="633.257"
            y2="548.489"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint10_linear_4_2"
            x1="682.39"
            y1="569.441"
            x2="682.39"
            y2="483.39"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint11_linear_4_2"
            x1="682.39"
            y1="490.254"
            x2="682.39"
            y2="578.988"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="0.794342" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint12_linear_4_2"
            x1="731.523"
            y1="558.226"
            x2="731.523"
            y2="458.826"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint13_linear_4_2"
            x1="731.523"
            y1="466.754"
            x2="731.523"
            y2="569.254"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="0.723228" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint14_linear_4_2"
            x1="84.5"
            y1="165.988"
            x2="84.5"
            y2="-14.3871"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint15_linear_4_2"
            x1="84.5"
            y1="0"
            x2="84.5"
            y2="186"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint16_linear_4_2"
            x1="20"
            y1="165.988"
            x2="20.0001"
            y2="-14.3871"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint17_linear_4_2"
            x1="20"
            y1="0"
            x2="20"
            y2="186"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint18_linear_4_2"
            x1="20"
            y1="165.497"
            x2="20.0001"
            y2="-14.3446"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint19_linear_4_2"
            x1="20"
            y1="0"
            x2="20"
            y2="185.45"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint20_linear_4_2"
            x1="20"
            y1="165.642"
            x2="20.0001"
            y2="-14.3571"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#DDDDDD" />
          </linearGradient>
          <linearGradient
            id="paint21_linear_4_2"
            x1="20"
            y1="0"
            x2="20"
            y2="185.612"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint22_linear_4_2"
            x1="433.156"
            y1="429.364"
            x2="424.874"
            y2="447.97"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0.3" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint23_linear_4_2"
            x1="445.318"
            y1="446.58"
            x2="437.952"
            y2="466.091"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0.3" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint24_linear_4_2"
            x1="611.96"
            y1="523.409"
            x2="611.961"
            y2="116.725"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="0.0830524" stopColor="white" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient
            id="paint25_linear_4_2"
            x1="611.96"
            y1="149.163"
            x2="611.96"
            y2="568.528"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="0.827612" />
            <stop offset="0.934325" stopColor="#666666" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default HeroSvg;
