import { ContextMenuBuilder, ContextMenuListener } from "electron-spellchecker";

export default async function setupContextMenu(handler) {
  let contextMenuBuilder = new ContextMenuBuilder(handler);
  // eslint-disable-next-line no-new
  new ContextMenuListener(info => {
    contextMenuBuilder.showPopupMenu(info);
  });
}
