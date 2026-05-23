export interface Texture {
  id: string;
  name: string;
  path?: string;
}

export const TEXTURES: Texture[] = [
  { id: "none", name: "None" },
  { id: "paper", name: "Paper", path: "/textures/paper.png" },
  { id: "fabric", name: "Fabric", path: "/textures/fabric.png" },
  { id: "concrete", name: "Concrete", path: "/textures/concrete.png" },
  { id: "wood", name: "Wood", path: "/textures/wood.png" },
  { id: "metal", name: "Metal", path: "/textures/metal.png" },
];

export const NOISE_STYLES = `
  .noise-track-custom {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E") !important;
    background-size: 200px 200px !important;
  }
`;
