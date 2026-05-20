"use client";
import { useMemo } from "react";

import { Hand } from "lucide-react";

import { useGitHubStars } from "@/components/icon-page/panels/header/hooks/use-github-stars";
import { NORMAL_ICONS_MANIFEST } from "@/lib/icons/manifest.generated";

const ICON_COUNT = NORMAL_ICONS_MANIFEST.length;
const ICON_COUNT_LABEL =
  ICON_COUNT >= 1000 ? `${(ICON_COUNT / 1000).toFixed(1)}k+` : `${ICON_COUNT}+`;

interface Testimonial {
  quote: string;
  name: string;
  handle: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_PALETTE = [
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-orange-500/15 text-orange-700 dark:text-orange-300",
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Rune Icons completely transformed our design workflow. The consistency across every single icon is unmatched. We replaced three different icon packs with just Rune and haven't looked back since.",
    name: "Sarah Chen",
    handle: "@sarahchendev",
  },
  {
    quote:
      "The attention to detail in Rune Icons is incredible. Every icon feels like it was hand-crafted for our product.\n\nThe customization options are a huge bonus too.",
    name: "Alex Rivera",
    handle: "@alexrivera_ui",
  },
  {
    quote:
      "Switched our entire component library to Rune Icons. The SVG optimization is top-notch and bundle size dropped significantly. ❤️ to the Rune team.",
    name: "Priya Sharma",
    handle: "@priyabuilds",
  },
  {
    quote:
      "Rune Icons is the gold standard for icon libraries. Pixel-perfect at every size, tree-shakeable, and the naming convention just makes sense.",
    name: "Marcus Johnson",
    handle: "@marcusj_dev",
  },
  {
    quote:
      "Every time I think I need a custom icon, I search Rune first — and it's always there. The coverage is insane.",
    name: "Emma Liu",
    handle: "@emmaliu_design",
  },
  {
    quote:
      "Rune Icons is gonna become the default icon set for every modern web app. Mark my words.",
    name: "Daniel Kowalski",
    handle: "@dkowalski",
  },
  {
    quote:
      "The DX of Rune Icons is unreal. Copy, paste, ship. No config needed, no weird imports. It just works.",
    name: "Lina Park",
    handle: "@linapark_dev",
  },
  {
    quote:
      "Rune Icons elevated our product's entire visual identity. Can't imagine building without it now.",
    name: "James Carter",
    handle: "@jamescarter",
  },
  {
    quote: "1000+ icons and every single one is beautiful. Rune Icons is... wow. Just wow 🤩🤩�",
    name: "Nina Petrova",
    handle: "@ninapetrova",
  },
  {
    quote:
      "Rune Icons has been a game changer for our design system. Consistency across 50+ screens, finally.",
    name: "Tom Walsh",
    handle: "@tomwalsh_ui",
  },
  {
    quote:
      "The best icon library I've ever used. Period. Clean, scalable, and ridiculously well-organized.",
    name: "Aisha Okafor",
    handle: "@aishaokafor",
  },
];

// Split testimonials into 3 columns (masonry-style)
const column1 = [testimonials[0], testimonials[3], testimonials[6]];
const column2 = [testimonials[1], testimonials[4], testimonials[7]];
const column3 = [testimonials[2], testimonials[5], testimonials[8]];

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const initials = useMemo(() => getInitials(testimonial.name), [testimonial.name]);
  const avatarClass = useMemo(
    () => AVATAR_PALETTE[hashString(testimonial.handle) % AVATAR_PALETTE.length],
    [testimonial.handle],
  );

  return (
    <div className="group relative cursor-pointer rounded-xl">
      {/* Rainbow gradient border - visible on hover */}
      <div className="animate-rainbow absolute inset-0 rounded-xl bg-[linear-gradient(45deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {/* Inner card */}
      <div className="relative m-[1.5px] flex flex-col gap-4 rounded-[12px] bg-card p-6 transition-all duration-300">
        <p className="text-sm leading-relaxed whitespace-pre-line text-card-foreground">
          {testimonial.quote}
        </p>
        <div className="mt-auto flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarClass}`}
            aria-label={testimonial.name}
            role="img"
          >
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm leading-tight font-medium text-card-foreground">
              {testimonial.name}
            </span>
            <span className="text-xs leading-tight text-muted-foreground">
              {testimonial.handle}
            </span>
          </div>
        </div>
      </div>
      {/* Default border (visible when not hovered) */}
      <div className="pointer-events-none absolute inset-0 rounded-xl border border-border transition-opacity duration-500 group-hover:opacity-0" />
    </div>
  );
};

const Testimonials = () => {
  const stars = useGitHubStars();

  return (
    <section className="mt-8 w-full">
      {/* Header */}
      <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl font-medium tracking-tight text-foreground">
            Loved by the <span className="text-blue-700">community</span>
          </h2>
          <p className="max-w-md text-base text-muted-foreground">
            Don&apos;t take our word for it listen to what developers using Rune Icons have to say.
          </p>
        </div>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:gap-10">
          <div className="flex flex-col items-start">
            <span className="text-4xl tracking-tight text-foreground">{ICON_COUNT_LABEL}</span>
            <div className="mt-1 flex items-center gap-1.5">
              <Hand className="text-muted-foreground" size={16} />{" "}
              <span className="text-base text-muted-foreground">Hand-crafted Icons</span>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-4xl tracking-tight text-foreground">{stars}</span>
            <div className="mt-1 flex items-center gap-1.5">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 text-muted-foreground"
              >
                <path
                  fillRule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
              <span className="text-base text-muted-foreground">Github Stars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Masonry Grid - 3 Columns */}
      <div className="grid grid-cols-1 gap-4 mask-b-from-80% md:grid-cols-2 lg:grid-cols-3">
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          {column1.map((testimonial) => (
            <TestimonialCard key={testimonial.handle} testimonial={testimonial} />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4">
          {column2.map((testimonial) => (
            <TestimonialCard key={testimonial.handle} testimonial={testimonial} />
          ))}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-4">
          {column3.map((testimonial) => (
            <TestimonialCard key={testimonial.handle} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
