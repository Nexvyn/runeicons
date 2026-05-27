export function DuotoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" overflow="visible" {...props}>
      <path fill="currentColor" d="M 12 13 C 14.396 13 16.575 13.693999999999999 18.178 14.671 C 18.978 15.161 19.662 15.736 20.156 16.361 C 20.642 16.977 21 17.713 21 18.5 C 21 19.345 20.589 20.011 19.997 20.486 C 19.437 20.936 18.698 21.234 17.913 21.442 C 16.335 21.859 14.229 22 12 22 C 9.771 22 7.665 21.86 6.087 21.442 C 5.302 21.234 4.563 20.936 4.003 20.486 C 3.41 20.01 3 19.345 3 18.5 C 3 17.713 3.358 16.977 3.8440000000000003 16.361 C 4.338 15.736 5.021 15.161 5.822 14.671 C 7.425 13.693999999999999 9.605 13 12 13 Z"></path>
      <path
        fill="currentColor"
        d="M 12 2 C 15.849 2 18.255 6.167 16.33 9.5 C 15.437 11.047 13.786 12 12 12 C 8.151 12 5.745 7.833 7.67 4.5 C 8.563 2.9530000000000003 10.214 2 12 2 Z"
        opacity=".3"
        className="group-hover/icon-type:animate-[duotoneHeadToss_0.7s_ease-out_1] motion-reduce:animate-none"
        style={{
          transform: "translateY(var(--hi-y))",
          transition: "--hi-y 0.35s cubic-bezier(0.4,0,0.2,1)",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      ></path>
    </svg>
  );
}
