import { expect, test } from "bun:test";
import { transform } from "@astrojs/compiler";
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

test("RuneIcon.astro compiles and renders the icon markup", async () => {
  const source = await Bun.file(new URL("../src/RuneIcon.astro", import.meta.url)).text();
  const result = await transform(source);
  expect(result.code).toContain("getIconById");
  expect(result.code).toContain("unescapeHTML(variant.markup)");
  expect(result.code).toContain("viewBox");
});

test("known icons resolve with expected variants", () => {
  const house = getIconById("tools-house");
  expect(house).toBeDefined();
  expect(availableTypes(house!)).toEqual(["normal", "duotone", "fill", "pixelated"]);
  expect(getIconById("glass-back-2")).toBeDefined();
  expect(getIconById("does-not-exist")).toBeUndefined();
});

test("searchIcons matches ids and names", () => {
  expect(searchIcons("tools-house").some((i) => i.id === "tools-house")).toBe(true);
  expect(searchIcons("Battery Medium").some((i) => i.id === "gadgets-battery-medium-2")).toBe(true);
  expect(searchIcons("", 10).length).toBe(10);
});

test("buildSvg renders inline svg", () => {
  const house = getIconById("tools-house")!;
  const svg = buildSvg(house, "normal")!;
  expect(svg.startsWith("<svg")).toBe(true);
  expect(svg).toContain('viewBox="0 0 24 24"');
  expect(svg).toContain('stroke="currentColor"');
  expect(buildSvg(house, "glass")).toBeNull();
});
