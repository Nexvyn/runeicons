import { expect, test } from "bun:test";
import { availableTypes, buildSvg, getIconById, searchIcons } from "../src/icons";
import { ICONS } from "../src/icons.generated";

test("icon data covers the core set", () => {
  const count = (type: string) => ICONS.filter((i) => i.variants[type as keyof typeof i.variants]).length;
  expect(count("normal")).toBeGreaterThanOrEqual(200);
  expect(count("duotone")).toBeGreaterThanOrEqual(200);
  expect(count("fill")).toBeGreaterThanOrEqual(100);
  expect(count("pixelated")).toBeGreaterThanOrEqual(200);
  expect(count("glass")).toBeGreaterThanOrEqual(130);
  expect(ICONS.length).toBeGreaterThanOrEqual(350);
});

test("known icons resolve with expected variants", () => {
  const house = getIconById("tools-house");
  expect(house).toBeDefined();
  expect(availableTypes(house!)).toEqual(["normal", "duotone", "fill", "pixelated"]);

  expect(getIconById("glass-back-2")).toBeDefined();
  expect(getIconById("gadgets-battery-medium-2")?.variants.duotone).toBeDefined();
  expect(getIconById("gadgets-battery-medium-3")?.variants.fill).toBeDefined();
  expect(getIconById("does-not-exist")).toBeUndefined();
});

test("searchIcons matches ids and names", () => {
  const byId = searchIcons("tools-house");
  expect(byId.some((i) => i.id === "tools-house")).toBe(true);

  const byName = searchIcons("Battery Medium");
  expect(byName.some((i) => i.id === "gadgets-battery-medium-2")).toBe(true);

  expect(searchIcons("", 10).length).toBe(10);
});

test("buildSvg renders inline svg", () => {
  const house = getIconById("tools-house")!;
  const svg = buildSvg(house, "normal")!;
  expect(svg.startsWith("<svg")).toBe(true);
  expect(svg).toContain('viewBox="0 0 24 24"');
  expect(svg).toContain('stroke="currentColor"');
  expect(svg.endsWith("</svg>")).toBe(true);
  expect(svg).not.toContain('stroke="black"');

  expect(buildSvg(house, "glass")).toBeNull();

  const pixel = getIconById("identity-lock");
  expect(pixel?.variants.pixelated).toBeDefined();
  const pixelSvg = pixel ? buildSvg(pixel, "pixelated") : null;
  expect(pixelSvg).toContain('viewBox="0 0 40 40"');
});
