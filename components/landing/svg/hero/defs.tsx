const HeroDefs = () => (
  <defs>
    <mask id="pipeRevealMask" maskUnits="userSpaceOnUse">
      <rect className="pipeRevealRect" x="336" y="395" width="0" height="110" fill="white" />
    </mask>
    <clipPath id="rocketFlameClip" clipPathUnits="userSpaceOnUse">
      <rect x="-200" y="-1000" width="1164" height="1490" />
    </clipPath>
    <pattern
      id="hazardStripesPattern"
      patternUnits="userSpaceOnUse"
      width="8"
      height="8"
      patternTransform="rotate(45)"
    >
      <rect width="8" height="8" className="hazardStripeYellow" />
      <rect width="4" height="8" className="hazardStripeDark" />
    </pattern>
    <filter id="cloudBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    <linearGradient id="rocketCoreGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" style={{ stopColor: "var(--scene-flame-1)" }} stopOpacity="0.95" />
      <stop offset="30%" style={{ stopColor: "var(--scene-flame-2)" }} stopOpacity="0.85" />
      <stop offset="70%" style={{ stopColor: "var(--scene-flame-3)" }} stopOpacity="0.55" />
      <stop offset="100%" style={{ stopColor: "var(--scene-flame-3)" }} stopOpacity="0" />
    </linearGradient>
    <linearGradient id="rocketPlumeGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" style={{ stopColor: "var(--scene-flame-3)" }} stopOpacity="0.8" />
      <stop offset="45%" style={{ stopColor: "var(--scene-flame-4)" }} stopOpacity="0.55" />
      <stop offset="85%" style={{ stopColor: "var(--scene-beam-3)" }} stopOpacity="0.18" />
      <stop offset="100%" style={{ stopColor: "var(--scene-beam-3)" }} stopOpacity="0" />
    </linearGradient>
    <linearGradient id="rocketHaloGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" style={{ stopColor: "var(--scene-flame-3)" }} stopOpacity="0.35" />
      <stop offset="50%" style={{ stopColor: "var(--scene-beam-3)" }} stopOpacity="0.25" />
      <stop offset="100%" style={{ stopColor: "var(--scene-beam-3)" }} stopOpacity="0" />
    </linearGradient>
    <linearGradient
      id="beamPipeFlow"
      x1="340"
      y1="395"
      x2="610"
      y2="500"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" style={{ stopColor: "var(--scene-beam-1)" }} stopOpacity="0.55" />
      <stop offset="35%" style={{ stopColor: "var(--scene-beam-2)" }} stopOpacity="0.75" />
      <stop offset="70%" style={{ stopColor: "var(--scene-beam-3)" }} stopOpacity="0.6" />
      <stop offset="100%" style={{ stopColor: "var(--scene-beam-1)" }} stopOpacity="0.35" />
    </linearGradient>
    <filter id="rocketHaloBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
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
);

export default HeroDefs;
