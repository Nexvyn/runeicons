#!/usr/bin/env node
// runeicons-mcp — MCP server exposing the Rune Icons library to AI agents.
//
// Runs over stdio. Registered tools:
//   search_icons    — find icons by query, category, and style
//   get_icon        — resolve metadata + ready-to-use SVG source for one icon
//   list_categories — category overview with per-style counts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  findIcon,
  type GeneratedIcon,
  getRelatedStyles,
  getSvgSource,
  getViewBox,
  ICON_COUNTS,
  listCategories,
  searchIcons,
} from "./icons.js";

const STYLES = ["normal", "duotone", "fill", "pixelated", "glass"] as const;

function iconToResult(icon: GeneratedIcon, opts: { svg: boolean; related: boolean }) {
  const related = opts.related ? getRelatedStyles(icon) : [];
  return {
    id: icon.id,
    name: icon.name,
    style: icon.style,
    category: icon.category,
    tags: icon.tags,
    viewBox: getViewBox(icon),
    svg: opts.svg ? getSvgSource(icon) : undefined,
    relatedStyles: related.length > 0 ? related : undefined,
    credit: "Rune Icons (https://runeicons.com) — Apache-2.0",
  };
}

function formatCategories(): string {
  const rows = listCategories();
  const width = Math.max(...rows.map((r) => r.category.length), "category".length);
  const lines = [
    `Rune Icons ${ICON_COUNTS.total} icons across ${rows.length} categories`,
    "",
    `${"category".padEnd(width)}  total  normal  duotone  fill  pixelated  glass`,
    "-".repeat(width + 48),
  ];
  for (const row of rows) {
    lines.push(
      `${row.category.padEnd(width)}  ${String(row.total).padStart(5)}  ${String(row.byStyle.normal).padStart(6)}  ${String(row.byStyle.duotone).padStart(6)}  ${String(row.byStyle.fill).padStart(4)}  ${String(row.byStyle.pixelated).padStart(9)}  ${String(row.byStyle.glass).padStart(5)}`,
    );
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const server = new McpServer({
    name: "runeicons-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "search_icons",
    {
      title: "Search Rune Icons",
      description:
        "Search the Rune Icons library (900+ icons). Returns matching icons with id, name, style, category, and tags. " +
        "Styles: normal (outline), duotone, fill, pixelated, glass. Combine `query` with `style`/`category` to narrow results.",
      inputSchema: {
        query: z
          .string()
          .max(100)
          .optional()
          .describe("Search text matched against icon name, id, and tags"),
        category: z
          .string()
          .max(50)
          .optional()
          .describe("Filter by category (get valid values from list_categories)"),
        style: z.enum(STYLES).optional().describe("Only return icons in this style"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("Maximum results to return (default 50)"),
      },
    },
    async ({ query, category, style, limit }) => {
      const results = searchIcons({ query, category, style, limit });
      const text =
        results.length === 0
          ? "No icons matched. Try a shorter query, or call list_categories to browse."
          : [
              `${results.length} result${results.length === 1 ? "" : "s"}${query ? ` for \"${query}\"` : ""}:`,
              "",
              ...results.map(
                (icon) =>
                  `- ${icon.id} — \"${icon.name}\" (style: ${icon.style}, category: ${icon.category})`,
              ),
              "",
              "Use get_icon with an id to fetch SVG source.",
            ].join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "get_icon",
    {
      title: "Get a Rune Icon",
      description:
        'Get full metadata and ready-to-use SVG source for a Rune Icon by id (e.g. "arrows-arrow-down-left", "glass-archive"). ' +
        "SVGs use currentColor so you can recolor them inline. Use search_icons first if you don't know the id.",
      inputSchema: {
        id: z
          .string()
          .min(1)
          .max(120)
          .describe("Icon id from search_icons, e.g. arrows-arrow-down-left"),
        includeSvg: z.boolean().optional().describe("Include the full SVG source (default true)"),
        includeRelated: z
          .boolean()
          .optional()
          .describe("List variants of the same glyph in other styles (default true)"),
      },
    },
    async ({ id, includeSvg = true, includeRelated = true }) => {
      const icon = findIcon(id);
      if (!icon) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Unknown icon id \"${id}\". Call search_icons with a query first to discover valid ids.`,
            },
          ],
        };
      }
      const result = iconToResult(icon, { svg: includeSvg, related: includeRelated });
      const lines = [
        `id: ${result.id}`,
        `name: ${result.name}`,
        `style: ${result.style}`,
        `category: ${result.category}`,
        `tags: ${result.tags.join(", ")}`,
        `viewBox: ${result.viewBox}`,
      ];
      if (result.relatedStyles) {
        lines.push(
          `other styles: ${result.relatedStyles.map((r) => `${r.style} (${r.id})`).join(", ")}`,
        );
      }
      lines.push("", result.svg ?? "(svg omitted — pass includeSvg: true to include it)");
      return { content: [{ type: "text", text: lines.join("\n") }] };
    },
  );

  server.registerTool(
    "list_categories",
    {
      title: "List Rune Icon Categories",
      description:
        "List every Rune Icons category with total and per-style counts. Use a category name to filter search_icons results.",
      inputSchema: {},
    },
    async () => {
      return { content: [{ type: "text", text: formatCategories() }] };
    },
  );

  await server.connect(new StdioServerTransport());
  // Keep the process alive; stdio transport reads until the client disconnects.
  await new Promise<never>(() => {});
}

main().catch((error) => {
  console.error("runeicons-mcp failed to start:", error);
  process.exit(1);
});
