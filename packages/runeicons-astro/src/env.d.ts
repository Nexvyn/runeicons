declare module "*.astro" {
  const component: import("astro/runtime/server").AstroComponentFactory;
  export default component;
}
