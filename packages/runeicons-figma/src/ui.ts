import { availableTypes, buildSvg, searchIcons, type IconEntry, type IconType } from "./icons";

const input = document.getElementById("search") as HTMLInputElement;
const typeSelect = document.getElementById("type") as HTMLSelectElement;
const results = document.getElementById("results")!;

function pickType(icon: IconEntry): IconType {
  const types = availableTypes(icon);
  const wanted = typeSelect.value as IconType;
  return types.includes(wanted) ? wanted : types[0];
}

function iconCard(icon: IconEntry): HTMLElement {
  const card = document.createElement("button");
  card.className = "icon";
  const type = pickType(icon);
  card.innerHTML = `${buildSvg(icon, type)}<span>${icon.name}</span>`;
  card.title = `${icon.id} (${type})`;
  card.onclick = () => {
    const svg = buildSvg(icon, type);
    if (svg) {
      parent.postMessage({ pluginMessage: { type: "insert", name: `${icon.name} ${type}`, svg } }, "*");
    }
  };
  return card;
}

function render(): void {
  const icons = searchIcons(input.value, 60);
  results.replaceChildren(...icons.map(iconCard));
}

input.addEventListener("input", render);
typeSelect.addEventListener("change", render);
render();
