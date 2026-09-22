import { expect, test } from "bun:test";
import { h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { RuneIcon } from "../src/index";
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

test("RuneIcon renders inline svg server-side", async () => {
  const html = await renderToString(h(RuneIcon, { name: "tools-house" }));
  expect(html).toContain("<svg");
  expect(html).toContain('viewBox="0 0 24 24"');
  expect(html).toContain('stroke="currentColor"');
  expect(html).toContain("</svg>");
});

test("RuneIcon renders glass variant and respects size", async () => {
  const html = await renderToString(h(RuneIcon, { name: "glass-back-2", type: "glass", size: 32 }));
  expect(html).toContain('width="32"');
  expect(html).toContain("url(#glass-back-2--");
});

test("RuneIcon renders nothing for unknown icons", async () => {
  const html = await renderToString(h(RuneIcon, { name: "does-not-exist" }));
  expect(html).not.toContain("<svg");
});

test("helpers work as expected", () => {
  const house = getIconById("tools-house");
  expect(availableTypes(house!)).toEqual(["normal", "duotone", "fill", "pixelated"]);
  expect(searchIcons("Battery Medium").some((i) => i.id === "gadgets-battery-medium-2")).toBe(true);
  expect(buildSvg(house!, "glass")).toBeNull();
});
