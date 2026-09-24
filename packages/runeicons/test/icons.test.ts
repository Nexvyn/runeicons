import { expect, test } from "bun:test";

import {
  availableTypes,
  buildSvg,
  getIconById,
  ICON_TYPES,
  ICONS,
  listCategories,
  searchIcons,
} from "../src/index";

test("icon data covers every style", () => {
  const count = (type: (typeof ICON_TYPES)[number]) =>
    ICONS.filter((icon) => icon.variants[type]).length;
  expect(count("normal")).toBeGreaterThanOrEqual(200);
  expect(count("duotone")).toBeGreaterThanOrEqual(200);
  expect(count("fill")).toBeGreaterThanOrEqual(100);
  expect(count("pixelated")).toBeGreaterThanOrEqual(200);
  expect(count("glass")).toBeGreaterThanOrEqual(130);
  expect(ICONS.length).toBeGreaterThanOrEqual(350);
});

test("ids are unique and every icon has metadata", () => {
  expect(new Set(ICONS.map((icon) => icon.id)).size).toBe(ICONS.length);
  for (const icon of ICONS) {
    expect(icon.name.length).toBeGreaterThan(0);
    expect(icon.category.length).toBeGreaterThan(0);
    expect(availableTypes(icon).length).toBeGreaterThan(0);
  }
});

test("icons carry categories and tags from the site manifest", () => {
  const house = getIconById("tools-house")!;
  expect(house.category).not.toBe("misc");
  expect(house.tags).toContain("house");
  expect(listCategories()).toContain(house.category);
});

test("lookup and availability", () => {
  const house = getIconById("tools-house")!;
  expect(availableTypes(house)).toEqual(["normal", "duotone", "fill", "pixelated"]);
  expect(getIconById("glass-back-2")?.variants.glass).toBeDefined();
  expect(getIconById("does-not-exist")).toBeUndefined();
});

test("search matches ids, names and tags, with filters", () => {
  expect(searchIcons("Battery Medium").some((icon) => icon.id === "gadgets-battery-medium-2")).toBe(
    true,
  );
  expect(searchIcons("", 10)).toHaveLength(10);
  expect(searchIcons("", { type: "glass" }).every((icon) => icon.variants.glass)).toBe(true);
  const category = getIconById("tools-house")!.category;
  expect(searchIcons("", { category }).every((icon) => icon.category === category)).toBe(true);
});

test("buildSvg renders inline svg", () => {
  const svg = buildSvg("tools-house")!;
  expect(svg.startsWith("<svg")).toBe(true);
  expect(svg).toContain('viewBox="0 0 24 24"');
  expect(svg).toContain('stroke="currentColor"');
  expect(svg).toContain('aria-hidden="true"');
  expect(buildSvg("tools-house", "normal", 32)).toContain('width="32"');
  const titled = buildSvg("tools-house", "fill", { title: "Home & <b>", className: "icon" })!;
  expect(titled).toContain('role="img"');
  expect(titled).toContain("<title>Home &amp; &lt;b></title>");
  expect(titled).toContain('class="icon"');
  expect(buildSvg("tools-house", "glass")).toBeNull();
  expect(buildSvg("does-not-exist")).toBeNull();
});

test("glass gradients get icon-scoped ids", () => {
  expect(buildSvg("glass-back-2", "glass")).toContain("url(#glass-back-2--");
});
