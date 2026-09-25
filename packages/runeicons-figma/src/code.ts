figma.showUI(__html__, { width: 360, height: 480, themeColors: true });

figma.ui.onmessage = (msg: { type: string; name: string; svg: string }) => {
  if (msg.type !== "insert") return;
  const node = figma.createNodeFromSvg(msg.svg);
  node.name = msg.name;
  figma.currentPage.appendChild(node);
  figma.viewport.scrollAndZoomIntoView([node]);
};
