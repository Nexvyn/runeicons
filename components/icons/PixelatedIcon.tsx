import { cn } from "@/lib/utils";

export function PixelatedIcon({ className, style, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 30 30"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      overflow="visible"
      className={cn(
        "will-change-transform group-hover/icon-type:animate-[pixelatedHammer_0.55s_cubic-bezier(0.4,0,0.2,1)_1] motion-reduce:animate-none",
        className,
      )}
      style={{
        transform: "rotate(var(--hi-r))",
        transition: "--hi-r 0.35s cubic-bezier(0.4,0,0.2,1)",
        transformOrigin: "bottom center",
        transformBox: "view-box",
        ...style,
      }}
      {...props}
    >
      <g fill="none">
        <path d="M3 7H3.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M3 11H3.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M3 15H3.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M3 19H3.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M3 23H3.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M3 27H3.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M7 11H7.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0.25"></path>
        <path d="M7 7H7.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0.25"></path>
        <path d="M7 15H7.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M7 23H7.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M7 27H7.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M11 7H11.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M11 3H11.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M11 11H11.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0.25"></path>
        <path d="M14.99 11H15" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M11 15H11.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M7 19H7.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M11 19H11.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M11 27H11.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M15 7H15.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M18.99 7H19" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M15 15H15.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M15 23H15.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0.25"></path>
        <path d="M11 23H11.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M15 19H15.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M15 27H15.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M19 11H19.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M19 19H19.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M19 15H19.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M19 23H19.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M19 27H19.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M23 7H23.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M7 3H7.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M3 3H3.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M15 3H15.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M19 3H19.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M23 3H23.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M27 3H27.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M23 15H23.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M23 11H23.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M23 19H23.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M23 23H23.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M27 27H27.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M23 27H23.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M27 7H27.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M27 11H27.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M27 15H27.01" strokeWidth="4" strokeLinecap="square"></path>
        <path d="M27 19H27.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
        <path d="M27 23H27.01" strokeWidth="4" strokeLinecap="square" strokeOpacity="0"></path>
      </g>
    </svg>
  );
}
