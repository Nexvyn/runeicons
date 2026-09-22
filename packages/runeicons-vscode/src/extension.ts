import * as vscode from "vscode";
import type { IconEntry } from "./icons.generated";
import { availableTypes, buildSvg, getIconById, searchIcons, type IconType } from "./icons";

const LANGUAGES = [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "html",
  "vue",
  "svelte",
  "astro",
  "json",
];

const WORD_PATTERN = /[a-z0-9-]+/;

function previewMarkdown(icon: IconEntry): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  for (const type of availableTypes(icon)) {
    const svg = buildSvg(icon, type);
    if (!svg) continue;
    const uri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    md.appendMarkdown(`**${type}**&nbsp;&nbsp;![${icon.id}](${uri}|height=24,width=24)\n\n`);
  }
  return md;
}

function inStringContext(document: vscode.TextDocument, position: vscode.Position): boolean {
  const line = document.lineAt(position).text.slice(0, position.character);
  return /["'`]([a-z0-9-]*)$/.test(line);
}

class IconCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.CompletionItem[] | undefined {
    if (!inStringContext(document, position)) return undefined;
    const word = document.getWordRangeAtPosition(position, WORD_PATTERN);
    const prefix = word ? document.getText(word) : "";
    const icons = searchIcons(prefix, 100);
    if (icons.length === 0) return undefined;
    return icons.map((icon) => {
      const item = new vscode.CompletionItem(icon.id, vscode.CompletionItemKind.Value);
      item.detail = icon.name;
      item.documentation = previewMarkdown(icon);
      if (word) item.range = word;
      return item;
    });
  }
}

class IconHoverProvider implements vscode.HoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
    const word = document.getWordRangeAtPosition(position, WORD_PATTERN);
    if (!word) return undefined;
    const icon = getIconById(document.getText(word));
    if (!icon) return undefined;
    return new vscode.Hover(previewMarkdown(icon), word);
  }
}

interface IconPickItem extends vscode.QuickPickItem {
  icon: IconEntry;
}

async function insertIcon(editor: vscode.TextEditor): Promise<void> {
  const iconPick = await vscode.window.showQuickPick<IconPickItem>(
    searchIcons("").map((icon) => ({
      label: icon.name,
      description: icon.id,
      icon,
    })),
    { placeHolder: "Search Rune Icons by name or id" },
  );
  if (!iconPick) return;

  const types = availableTypes(iconPick.icon);
  let type: IconType = types[0];
  if (types.length > 1) {
    const typePick = await vscode.window.showQuickPick(types.map((t) => ({ label: t })), {
      placeHolder: "Pick a style",
    });
    if (!typePick) return;
    type = typePick.label as IconType;
  }

  const svg = buildSvg(iconPick.icon, type);
  if (svg) await editor.insertSnippet(new vscode.SnippetString(svg));
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(LANGUAGES, new IconCompletionProvider(), "-", '"', "'"),
    vscode.languages.registerHoverProvider(LANGUAGES, new IconHoverProvider()),
    vscode.commands.registerCommand("runeicons.insert", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) return insertIcon(editor);
      return undefined;
    }),
  );
}

export function deactivate(): void {}
