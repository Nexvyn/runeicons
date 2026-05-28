"use client";
import { useEffect, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

import {
  CLOUDS,
  CLOUDS_CFG,
  COUNTDOWN_TICKS,
  EASING,
  EMBERS,
  LANDING_DUST,
  LAUNCH,
  ROCKET_DETAILS,
  STATE_TRANSITION,
} from "./constants";
import HeroDefs from "./defs";
import SceneAnimatedLayers from "./scene-animated-layers";
import SceneCargoAndRocket from "./scene-cargo-and-rocket";
import SceneConveyor from "./scene-conveyor";
import SceneCubes from "./scene-cubes";
import ScenePipesAndPulse from "./scene-pipes-and-pulse";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

const HeroSvg = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [animationRun, setAnimationRun] = useState(0);
  const [labelText, setLabelText] = useState("BUILD");
  const [launchButtonState, setLaunchButtonState] = useState<
    "launch" | "relaunch"
  >("launch");
  const launchButtonStateRef = useRef<"launch" | "relaunch">("launch");
  const isResettingRef = useRef(false);
  useEffect(() => {
    launchButtonStateRef.current = launchButtonState;
  }, [launchButtonState]);
  useEffect(() => {
    isResettingRef.current = isResetting;
  }, [isResetting]);

  useEffect(() => {
    const root = svgRef.current;
    if (!root) return;
    const isRelaunch = launchButtonState === "relaunch";

    const fills = root.querySelectorAll<SVGElement>(
      ".LaunchButton path, .LaunchButton rect",
    );
    const target = isRelaunch ? "#06B6D4" : "#84A2FF";
    fills.forEach((el) => {
      if (el.getAttribute("fill") === "black") return;
      gsap.to(el, { fill: target, ...STATE_TRANSITION.cubeColor });
    });

    const outgoing = root.querySelector<SVGTextElement>(
      isRelaunch ? ".launchLiveGlyph_launch" : ".launchLiveGlyph_relaunch",
    );
    const incoming = root.querySelector<SVGTextElement>(
      isRelaunch ? ".launchLiveGlyph_relaunch" : ".launchLiveGlyph_launch",
    );
    if (outgoing) {
      gsap.killTweensOf(outgoing);
      gsap.to(outgoing, { opacity: 0, ...STATE_TRANSITION.textOut });
    }
    if (incoming) {
      gsap.killTweensOf(incoming);
      gsap.fromTo(
        incoming,
        { opacity: 0 },
        {
          opacity: 1,
          ...STATE_TRANSITION.textIn,
          delay: STATE_TRANSITION.textOut.duration,
        },
      );
    }

    const arrow = root.querySelector<SVGGElement>(".relaunchArrow");
    if (arrow) {
      gsap.killTweensOf(arrow, "opacity");
      gsap.to(arrow, {
        opacity: isRelaunch ? 1 : 0,
        duration: STATE_TRANSITION.arrow.duration,
        ease: STATE_TRANSITION.arrow.ease,
        delay: isRelaunch ? STATE_TRANSITION.arrow.delay : 0,
      });
    }
  }, [launchButtonState]);

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

          setIsResetting(false);
          setLaunchButtonState("launch");

          const beams = gsap.utils.toArray<SVGPathElement>(".Beam");
          beams.forEach((beam) => {
            const length = beam.getTotalLength();
            gsap.set(beam, {
              strokeDasharray: length,
              strokeDashoffset: length,
              opacity: 0,
            });
          });

          gsap.set(".pipeRevealRect", { attr: { x: 336, width: 0 } });
          gsap.set(".beamPipeFill", { opacity: 1 });

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

            gsap.set(".pipeRevealRect", { attr: { x: 336, width: 0 } });
            gsap.to(".pipeRevealRect", {
              attr: { width: 274 },
              duration: 0.7,
              ease: "power2.out",
              delay: 0.1,
            });

            const rocketEl = svgRef.current?.querySelector<SVGGElement>(".rocket");
            if (rocketEl) {
              const beamEndTime = 1.0 + (beams.length - 1) * 0.22;
              const rocketLaunchDelay = beamEndTime + 1;
              const haloEl =
                rocketEl.querySelector<SVGPathElement>(".rocketTrail-halo");
              const plumeEl =
                rocketEl.querySelector<SVGPathElement>(".rocketTrail-plume");
              const coreEls = gsap.utils.toArray<SVGPathElement>(
                rocketEl.querySelectorAll(".rocketTrail-core"),
              );
              const flameEls = [haloEl, plumeEl, ...coreEls].filter(
                (el): el is SVGPathElement => el !== null,
              );

              gsap.killTweensOf(rocketEl);
              flameEls.forEach((el) => gsap.killTweensOf(el));
              gsap.set(rocketEl, {
                transformOrigin: "50% 100%",
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 1,
              });
              if (flameEls.length) {
                gsap.set(flameEls, {
                  opacity: 0,
                  scaleY: 1,
                  scale: 1,
                  transformOrigin: "50% 0%",
                });
              }
              rocketEl.style.willChange = "transform, opacity";

              let coreFlickerTl: gsap.core.Timeline | null = null;
              let plumeFlickerTl: gsap.core.Timeline | null = null;
              let haloFlickerTl: gsap.core.Timeline | null = null;
              const cloudPuffTweens: gsap.core.Tween[] = [];

              const rocketTl = gsap.timeline({
                delay: rocketLaunchDelay,
                onStart: () => {
                  const details =
                    svgRef.current?.querySelector<SVGGElement>(".rocketDetails");
                  if (details) details.classList.add("is-launching");
                  if (fullMotion) {
                    const shakeEls = ".rocketRivet, .rocketPorthole";
                    const cycles = ROCKET_DETAILS.ignition.cycles;
                    const stepDuration =
                      ROCKET_DETAILS.ignition.duration / cycles;
                    const shakeTl = gsap.timeline({
                      onComplete: () => {
                        gsap.set(shakeEls, { x: 0, y: 0 });
                        if (details) {
                          details.classList.remove("is-launching");
                          details.classList.add("is-pulsing");
                        }
                      },
                    });
                    for (let i = 0; i < cycles; i++) {
                      shakeTl.to(shakeEls, {
                        x: gsap.utils.random(
                          -ROCKET_DETAILS.ignition.amplitude,
                          ROCKET_DETAILS.ignition.amplitude,
                        ),
                        y: gsap.utils.random(
                          -ROCKET_DETAILS.ignition.amplitude,
                          ROCKET_DETAILS.ignition.amplitude,
                        ),
                        duration: stepDuration,
                        ease: ROCKET_DETAILS.ignition.ease,
                      });
                    }
                  } else if (details) {
                    details.classList.remove("is-launching");
                    details.classList.add("is-pulsing");
                  }
                },
                onComplete: () => {
                  rocketEl.style.willChange = "";
                  setLaunchButtonState("relaunch");
                  launchTriggered = false;
                  const details =
                    svgRef.current?.querySelector<SVGGElement>(".rocketDetails");
                  if (details) {
                    details.classList.remove("is-launching");
                    details.classList.remove("is-pulsing");
                  }
                  cloudPuffTweens.forEach((tw) => tw.kill());
                  cloudPuffTweens.length = 0;
                  if (btnHit) {
                    btnHit.style.cursor = "pointer";
                    btnHit.style.pointerEvents = "auto";
                  }
                  if (btn) {
                    gsap.to(btn, {
                      y: 0,
                      duration: 0.28,
                      ease: "power2.out",
                    });
                  }
                },
              });

              if (coreEls.length) {
                rocketTl.fromTo(
                  coreEls,
                  { opacity: 0, scale: fullMotion ? 0.6 : 1 },
                  {
                    opacity: 0.7,
                    scale: 1,
                    duration: 0.18,
                    ease: EASING.enter,
                    transformOrigin: "50% 0%",
                  },
                  LAUNCH.ignition,
                );
              }
              if (haloEl) {
                rocketTl.fromTo(
                  haloEl,
                  { opacity: 0, scaleY: 1 },
                  {
                    keyframes: [
                      {
                        opacity: 0.6,
                        scaleY: 1.5,
                        duration: 0.18,
                        ease: "power2.out",
                      },
                      {
                        opacity: 0.35,
                        scaleY: 1,
                        duration: 0.22,
                        ease: "power2.inOut",
                      },
                    ],
                  },
                  LAUNCH.ignition,
                );
              }

              if (plumeEl) {
                rocketTl.to(
                  plumeEl,
                  {
                    opacity: 0.55,
                    duration: 0.32,
                    ease: EASING.enter,
                  },
                  LAUNCH.plumeIn,
                );
              }

              if (fullMotion) {
                if (plumeEl) {
                  rocketTl.to(
                    plumeEl,
                    {
                      scaleY: 1.6,
                      duration: 1.4,
                      ease: EASING.stretch,
                    },
                    LAUNCH.stretchStart,
                  );
                }
                if (haloEl) {
                  rocketTl.to(
                    haloEl,
                    {
                      scaleY: 1.75,
                      duration: 1.4,
                      ease: EASING.stretch,
                    },
                    LAUNCH.stretchStart,
                  );
                }
                if (coreEls.length) {
                  rocketTl.to(
                    coreEls,
                    {
                      scaleY: 1.6,
                      duration: 1.4,
                      ease: EASING.stretch,
                    },
                    LAUNCH.stretchStart,
                  );
                }
              }

              if (fullMotion) {
                if (coreEls.length) {
                  coreFlickerTl = gsap.timeline({
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                  });
                  coreFlickerTl.to(coreEls, {
                    opacity: 0.5,
                    duration: 0.09,
                    ease: EASING.flicker,
                  });
                }
                if (plumeEl) {
                  plumeFlickerTl = gsap.timeline({
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                  });
                  plumeFlickerTl.to(plumeEl, {
                    opacity: 0.4,
                    duration: 0.22,
                    ease: EASING.flicker,
                  });
                }
                if (haloEl) {
                  haloFlickerTl = gsap.timeline({
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                  });
                  haloFlickerTl.to(haloEl, {
                    opacity: 0.25,
                    duration: 0.42,
                    ease: EASING.flicker,
                  });
                }
                rocketTl.call(
                  () => {
                    coreFlickerTl?.play();
                    plumeFlickerTl?.play();
                    haloFlickerTl?.play();
                  },
                  [],
                  LAUNCH.flickerStart,
                );
              }

              const emberEls =
                svgRef.current?.querySelectorAll<SVGCircleElement>(
                  ".rocketEmber",
                );
              const emberTweens: gsap.core.Tween[] = [];
              if (emberEls && emberEls.length) {
                gsap.killTweensOf(emberEls);
                gsap.set(emberEls, { opacity: 0, x: 0, y: 0 });
                if (fullMotion) {
                  rocketTl.call(
                    () => {
                      EMBERS.forEach((e, i) => {
                        const el = emberEls[i];
                        if (!el) return;
                        const tw = gsap.to(el, {
                          keyframes: [
                            {
                              opacity: 0.75,
                              duration: 0.12,
                              ease: "power2.out",
                            },
                            {
                              x: e.driftX,
                              y: e.driftY,
                              opacity: 0,
                              duration: e.cycle,
                              ease: "sine.inOut",
                            },
                          ],
                          delay: e.delay,
                          repeat: -1,
                          repeatDelay: e.repeatDelay,
                        });
                        emberTweens.push(tw);
                      });
                    },
                    [],
                    LAUNCH.ignition,
                  );
                } else {
                  rocketTl.set(
                    emberEls,
                    { opacity: 0.25, x: 0, y: 0 },
                    LAUNCH.ignition,
                  );
                }
              }

              const cloudPuffEls =
                svgRef.current?.querySelectorAll<SVGCircleElement>(
                  ".cloudPuff",
                );
              const cloudSilhouetteEls =
                svgRef.current?.querySelectorAll<SVGPathElement>(
                  ".cloudSilhouette",
                );

              if (cloudPuffEls && cloudPuffEls.length) {
                gsap.killTweensOf(cloudPuffEls);
                gsap.set(cloudPuffEls, {
                  opacity: 0,
                  x: 0,
                  y: 0,
                  scale: 0.4,
                  transformOrigin: "50% 50%",
                });
              }
              if (cloudSilhouetteEls && cloudSilhouetteEls.length) {
                gsap.killTweensOf(cloudSilhouetteEls);
                gsap.set(cloudSilhouetteEls, {
                  opacity: 0,
                  scale: 0.5,
                  transformOrigin: "50% 50%",
                });

                rocketTl.to(
                  cloudSilhouetteEls,
                  {
                    keyframes: [
                      {
                        opacity: 0.4,
                        scale: 1.2,
                        duration: 0.5,
                        ease: "power2.out",
                      },
                      {
                        opacity: 0,
                        duration: 1.2,
                        ease: "power2.in",
                      },
                    ],
                    stagger: 0.1,
                  },
                  LAUNCH.ignition,
                );
              }

              if (fullMotion && cloudPuffEls && cloudPuffEls.length) {
                rocketTl.call(
                  () => {
                    CLOUDS.forEach((c, i) => {
                      const el = cloudPuffEls[i];
                      if (!el) return;
                      cloudPuffTweens.push(
                        gsap.to(el, {
                          keyframes: [
                            {
                              opacity: CLOUDS_CFG.peakOpacity,
                              scale: CLOUDS_CFG.peakScale,
                              duration: 0.4,
                              ease: "power2.out",
                            },
                            {
                              x: c.driftX,
                              y: c.driftY,
                              opacity: 0,
                              scale: CLOUDS_CFG.peakScale * 1.2,
                              duration: c.cycle,
                              ease: "power2.in",
                            },
                          ],
                          delay: c.delay,
                        }),
                      );
                    });
                  },
                  [],
                  LAUNCH.ignition,
                );
              }

              if (flameEls.length) {
                rocketTl.to(
                  flameEls,
                  {
                    opacity: 0,
                    duration: 0.55,
                    ease: EASING.exit,
                    overwrite: "auto",
                    onStart: () => {
                      coreFlickerTl?.kill();
                      plumeFlickerTl?.kill();
                      haloFlickerTl?.kill();
                    },
                  },
                  LAUNCH.trailOut,
                );

                if (emberEls && emberEls.length) {
                  rocketTl.to(
                    emberEls,
                    {
                      opacity: 0,
                      duration: 0.35,
                      ease: EASING.exit,
                      overwrite: "auto",
                      onStart: () => {
                        emberTweens.forEach((tw) => tw.kill());
                      },
                    },
                    LAUNCH.trailOut,
                  );
                }
              }

              rocketTl.to(
                rocketEl,
                {
                  y: -760,
                  duration: LAUNCH.rocketDuration,
                  ease: "power2.out",
                },
                LAUNCH.hold,
              );

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

        pulseTimeline.to(pulse, {
          stroke: "#7E97FA",
          opacity: 0.68,
          duration: 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        });

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

      let layerSequenceDuration = 0;
      if (fullMotion) {
        const layers = gsap.utils.toArray<SVGGElement>(".layer1, .layer2, .layer3, .layer4");
        if (layers.length) {
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

          const revealDuration = layerTl.duration();
          gsap.to(layers[layers.length - 1], {
            opacity: 0,
            filter: "blur(3px)",
            duration: LAST_LAYER_FADE_DURATION,
            ease: "power2.out",
            delay: revealDuration + LAST_LAYER_FADE_DELAY,
            overwrite: "auto",
          });

          layerSequenceDuration = revealDuration + LAST_LAYER_FADE_DELAY + LAST_LAYER_FADE_DURATION;
        }
      }

      const path1StartDelay = layerSequenceDuration + 0.1;
      const path1Duration = 2.0;
      const path2ExtraDelay = 0.5;
      const path2StartDelay = path1StartDelay + path1Duration + path2ExtraDelay;
      const path2Duration = 2.5;
      const introCompleteAt = path2StartDelay + path2Duration;

      let launchUnlocked = reduceMotion;
      let launchTriggered = false;
      let lastBlockedToastAt = -Infinity;
      if (fullMotion) {
        gsap.delayedCall(introCompleteAt, () => {
          launchUnlocked = true;
        });
      }

      gsap.set(".buildingVectorLabel", { opacity: 0 });
      gsap.set(".buildingLiveLabel", { opacity: 1 });
      if (fullMotion) {
        const conveyorWindow = introCompleteAt - path1StartDelay;
        const tickInterval = conveyorWindow / COUNTDOWN_TICKS.length;
        COUNTDOWN_TICKS.forEach((n, i) =>
          gsap.delayedCall(path1StartDelay + i * tickInterval, () =>
            setLabelText(String(n)),
          ),
        );
        gsap.delayedCall(introCompleteAt, () => {
          setLabelText("READY");
          const isDark = document.documentElement.classList.contains("dark");
          const greenSource = isDark ? "#DD3AA1" : "#22C55E";
          gsap.to(".buildingCubeFace", {
            fill: greenSource,
            duration: 0.45,
            ease: "power2.out",
          });
          gsap.utils
            .toArray<SVGPathElement>(".rocketPorthole")
            .forEach((el, i) => {
              gsap.delayedCall(i * ROCKET_DETAILS.ready.stagger, () =>
                el.classList.add("is-ready"),
              );
            });
        });
      } else {
        setLabelText("READY");
        const isDark = document.documentElement.classList.contains("dark");
        const greenSource = isDark ? "#DD3AA1" : "#22C55E";
        gsap.set(".buildingCubeFace", { fill: greenSource });
        gsap.utils
          .toArray<SVGPathElement>(".rocketPorthole")
          .forEach((el) => el.classList.add("is-ready"));
      }

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

      const btn = svgRef.current?.querySelector<SVGGElement>(".LaunchButton");
      const btnHit = svgRef.current?.querySelector<SVGGElement>(".LaunchButtonHit");
      if (!btn || !btnHit) return;

      gsap.set(btn, { y: 0 });
      btnHit.style.cursor = "pointer";

      btnHit.addEventListener("mouseenter", () => {
        if (launchTriggered) return;
        if (fullMotion) {
          gsap.to(btn, { y: 4, duration: 0.18, ease: "power2.out" });
        }
      });

      btnHit.addEventListener("mouseleave", () => {
        if (launchTriggered) return;
        if (fullMotion) {
          gsap.to(btn, { y: 0, duration: 0.22, ease: "power2.out" });
        }
      });

      btnHit.addEventListener("mousedown", () => {
        if (launchTriggered) return;
        if (fullMotion) {
          gsap.to(btn, { y: 8, duration: 0.1, ease: "power2.out" });
        }
      });

      btnHit.addEventListener("mouseup", () => {
        if (launchTriggered) return;
        if (isResettingRef.current) return;

        if (fullMotion) {
          gsap.to(btn, { y: 4, duration: 0.18, ease: "power2.out" });
        }

        if (launchButtonStateRef.current === "relaunch") {
          handleRelaunch();
          return;
        }

        if (!launchUnlocked) {
          const now = performance.now();
          if (now - lastBlockedToastAt > 1200) {
            lastBlockedToastAt = now;
            gsap.killTweensOf(".hazardStripes");
            gsap.to(".hazardStripes", {
              keyframes: [
                { opacity: 0.9, duration: 0.18, ease: "power2.out" },
                { opacity: 0.4, duration: 0.22, ease: "sine.inOut" },
                { opacity: 0.9, duration: 0.22, ease: "sine.inOut" },
                { opacity: 0.4, duration: 0.22, ease: "sine.inOut" },
                { opacity: 0.9, duration: 0.22, ease: "sine.inOut" },
                { opacity: 0, duration: 0.2, ease: "power2.out" },
              ],
            });
          }
          return;
        }

        launchTriggered = true;
        btnHit.style.cursor = "not-allowed";
        btnHit.style.pointerEvents = "none";

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

    const btn = svgRef.current?.querySelector<SVGGElement>(".LaunchButton");
    if (btn) {
      gsap.to(btn, { y: 0, duration: 0.22, ease: "power2.out" });
    }

    setLaunchButtonState("launch");

    const rocketEl = svgRef.current?.querySelector<SVGGElement>(".rocket");
    if (!rocketEl) {
      setAnimationRun((v) => v + 1);
      return;
    }

    setIsResetting(true);

    const coreEls = gsap.utils.toArray<SVGPathElement>(
      rocketEl.querySelectorAll(".rocketTrail-core"),
    );
    const plumeEl =
      rocketEl.querySelector<SVGPathElement>(".rocketTrail-plume");
    const haloEl = rocketEl.querySelector<SVGPathElement>(".rocketTrail-halo");
    const flameEls = [...coreEls, plumeEl, haloEl].filter(
      (el): el is SVGPathElement => el != null,
    );
    if (flameEls.length) {
      flameEls.forEach((el) => gsap.killTweensOf(el));
      gsap.set(flameEls, {
        opacity: 0,
        scaleY: 1,
        scale: 1,
        transformOrigin: "50% 0%",
      });
    }

    const emberEls =
      svgRef.current?.querySelectorAll<SVGCircleElement>(".rocketEmber");
    if (emberEls && emberEls.length) {
      gsap.killTweensOf(".rocketEmber");
      gsap.set(".rocketEmber", { opacity: 0, x: 0, y: 0 });
    }

    const fullMotion = !window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const descentEmberTweens: gsap.core.Tween[] = [];

    gsap.killTweensOf(".pipeRevealRect");
    gsap.to(".pipeRevealRect", {
      attr: { width: 0 },
      duration: 0.7,
      ease: "power2.inOut",
    });

    gsap.killTweensOf(".Beam");
    gsap.to(".Beam", {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    gsap.killTweensOf(".buildingLiveLabel");
    gsap.killTweensOf(".buildingVectorLabel");
    gsap.set(".buildingLiveLabel", { opacity: 0 });
    gsap.set(".buildingVectorLabel", { opacity: 1 });
    setLabelText("BUILD");

    gsap.killTweensOf(".buildingCubeFace");
    gsap.to(".buildingCubeFace", {
      fill: "#FFFFFF",
      duration: 0.3,
      ease: "power2.in",
    });

    gsap.killTweensOf(rocketEl);

    const detailsForDescent =
      svgRef.current?.querySelector<SVGGElement>(".rocketDetails");
    if (detailsForDescent) detailsForDescent.classList.add("is-pulsing");

    gsap
      .timeline({
        onComplete: () => {
          descentEmberTweens.forEach((tw) => tw.kill());
          if (emberEls && emberEls.length) {
            gsap.set(emberEls, { opacity: 0, x: 0, y: 0 });
          }
          if (flameEls.length) {
            gsap.set(flameEls, { opacity: 0, scaleY: 1, scale: 1 });
          }
          const dustEls =
            svgRef.current?.querySelectorAll<SVGCircleElement>(".dustPuff");
          if (dustEls && dustEls.length) {
            gsap.killTweensOf(dustEls);
            gsap.set(dustEls, {
              opacity: 0,
              x: 0,
              y: 0,
              scale: 0.3,
            });
          }
          gsap.set(".rocketRivet, .rocketPorthole", {
            x: 0,
            y: 0,
            clearProps: "opacity",
          });
          const details =
            svgRef.current?.querySelector<SVGGElement>(".rocketDetails");
          if (details) {
            details.classList.remove("is-launching");
            details.classList.remove("is-pulsing");
            details.classList.remove("is-settling");
          }
          setIsResetting(false);
          setAnimationRun((v) => v + 1);
        },
      })
      .set(rocketEl, {
        transformOrigin: "50% 100%",
        x: 0,
        rotation: 0,
        opacity: 1,
      })
      .to(
        coreEls,
        {
          opacity: 0.45,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        },
        0,
      )
      .to(
        plumeEl,
        {
          opacity: 0.3,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        },
        0,
      )
      .to(
        haloEl,
        {
          opacity: 0.2,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        },
        0,
      )
      .to(
        ".rocketPorthole",
        {
          opacity: ROCKET_DETAILS.descent.dimOpacity,
          duration: ROCKET_DETAILS.descent.duration,
          ease: ROCKET_DETAILS.descent.ease,
          overwrite: "auto",
        },
        0,
      )
      .call(
        () => {
          if (!emberEls || !emberEls.length) return;
          if (!fullMotion) {
            gsap.set(emberEls, { opacity: 0.18, x: 0, y: 0 });
            return;
          }
          EMBERS.forEach((e, i) => {
            const el = emberEls[i];
            if (!el) return;
            descentEmberTweens.push(
              gsap.to(el, {
                keyframes: [
                  {
                    opacity: 0.55,
                    duration: 0.18,
                    ease: "power2.out",
                  },
                  {
                    x: e.driftX,
                    y: e.driftY,
                    opacity: 0,
                    duration: e.cycle,
                    ease: "sine.inOut",
                  },
                ],
                delay: e.delay,
                repeat: -1,
                repeatDelay: e.repeatDelay,
              }),
            );
          });
        },
        [],
        0,
      )
      .to(
        rocketEl,
        {
          y: 0,
          duration: 2.1,
          ease: "power3.out",
        },
        0,
      )
      .to(
        flameEls,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          overwrite: "auto",
        },
        1.7,
      )
      .to(
        ".rocketEmber",
        {
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
          overwrite: "auto",
          onStart: () => {
            descentEmberTweens.forEach((tw) => tw.kill());
          },
        },
        1.75,
      )
      .call(
        () => {
          const dustEls =
            svgRef.current?.querySelectorAll<SVGCircleElement>(".dustPuff");
          if (!dustEls || !dustEls.length) return;
          gsap.killTweensOf(dustEls);
          gsap.set(dustEls, {
            opacity: 0,
            x: 0,
            y: 0,
            scale: 0.3,
            transformOrigin: "50% 50%",
          });
          if (!fullMotion) return;
          LANDING_DUST.forEach((d, i) => {
            const el = dustEls[i];
            if (!el) return;
            gsap.to(el, {
              keyframes: [
                {
                  opacity: 0.4,
                  scale: 1.0,
                  duration: 0.18,
                  ease: "power2.out",
                },
                {
                  x: d.driftX,
                  y: d.driftY,
                  opacity: 0,
                  scale: 1.3,
                  duration: 0.35,
                  ease: "power2.in",
                },
              ],
              delay: d.delay,
            });
          });
        },
        [],
        ROCKET_DETAILS.settle.startAt - 0.1,
      )
      .call(
        () => {
          const detailsEl =
            svgRef.current?.querySelector<SVGGElement>(".rocketDetails");
          if (!detailsEl) return;
          const settleEls = gsap.utils.toArray<SVGElement>(
            ".rocketRivet, .rocketPorthole",
          );
          settleEls.forEach((el) => {
            const current = parseFloat(
              window.getComputedStyle(el).opacity || "1",
            );
            el.style.opacity = String(current);
          });
          detailsEl.classList.remove("is-pulsing");
          detailsEl.classList.add("is-settling");
          gsap.utils
            .toArray<SVGPathElement>(".rocketPorthole")
            .forEach((el) => el.classList.remove("is-ready"));
        },
        [],
        ROCKET_DETAILS.settle.startAt,
      )
      .to(
        ".rocketRivet, .rocketPorthole",
        {
          opacity: ROCKET_DETAILS.settle.targetOpacity,
          duration: ROCKET_DETAILS.settle.duration,
          ease: ROCKET_DETAILS.settle.ease,
          overwrite: "auto",
        },
        ROCKET_DETAILS.settle.startAt,
      )
      .to(rocketEl, {
        y: 8,
        duration: 0.2,
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
        <SceneCargoAndRocket />
        <SceneConveyor />

        <SceneAnimatedLayers />
        <SceneCubes
          labelText={labelText}
          launchButtonState={launchButtonState}
        />
        <ScenePipesAndPulse />
        <HeroDefs />
      </svg>
    </div>
  );
};

export default HeroSvg;
