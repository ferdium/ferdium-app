import { remote } from "electron";
import { ContextMenuBuilder, ContextMenuListener } from "electron-spellchecker";

const webContents = remote.getCurrentWebContents();

export default async function setupContextMenu(handler) {
  const processMenu = (menu, menuInfo) => {
    if (
      menuInfo.editFlags.canPaste &&
      !menuInfo.linkText &&
      !menuInfo.hasImageContents
    ) {
      menu.insert(
        3,
        new remote.MenuItem({
          label: "Paste as plain text",
          accelerator: "CommandOrControl+Shift+V",
          click: () => webContents.pasteAndMatchStyle()
        })
      );
    }
    return menu;
  };

  const contextMenuBuilder = new ContextMenuBuilder(
    handler,
    null,
    true,
    processMenu
  );
  // eslint-disable-next-line no-new
  new ContextMenuListener(info => {
    contextMenuBuilder.showPopupMenu(info);
  });
}
