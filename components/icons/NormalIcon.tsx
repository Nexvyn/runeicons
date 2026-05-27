import { cn } from "@/lib/utils";

export function NormalIcon({ className, style, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      overflow="visible"
      className={cn(
        "group-hover/icon-type:animate-[iconWiggle_0.6s_ease-in-out_1] motion-reduce:animate-none",
        className,
      )}
      style={{
        transform: "rotate(var(--hi-r))",
        transition: "--hi-r 0.35s cubic-bezier(0.4,0,0.2,1)",
        transformOrigin: "center",
        transformBox: "view-box",
        ...style,
      }}
      {...props}
    >
      <path d="M9.533 5.43699L6.20199 2.10599C5.81099 1.71499 5.17799 1.71499 4.78799 2.10599L2.10599 4.788C1.71499 5.179 1.71499 5.812 2.10599 6.202L5.43699 9.533" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      <path d="M8.46698 12.563L11.798 15.894C12.189 16.285 12.822 16.285 13.212 15.894L15.894 13.212C16.285 12.821 16.285 12.188 15.894 11.798L14.685 10.589" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      <path d="M3.41602 7.513L5.18402 5.745" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      <path d="M10.487 14.584L12.255 12.816" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      <path d="M2.25 15.75C2.25 15.75 5.84901 15.182 6.79601 14.235C7.74301 13.288 15.373 5.65802 15.373 5.65802C16.21 4.82102 16.21 3.46399 15.373 2.62799C14.536 1.79099 13.179 1.79099 12.343 2.62799C12.343 2.62799 4.71301 10.258 3.76601 11.205C2.81901 12.152 2.25101 15.751 2.25101 15.751L2.25 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      <path d="M11.121 3.84802L14.152 6.87903" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
    </svg>
  );
}
