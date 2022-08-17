import { getCurrentWebContents } from '@electron/remote';
import { ContextMenuBuilder } from './contextMenuBuilder';

const webContents = getCurrentWebContents();

export default async function setupContextMenu(
  isSpellcheckEnabled: () => void,
  getDefaultSpellcheckerLanguage: () => void,
  getSpellcheckerLanguage: () => void,
  getSearchEngine: () => void,
  getClipboardNotifications: () => void,
  getEnableTranslator: () => void,
  getTranslatorEngine: () => void,
  getTranslatorLanguage: () => void,
) {
  const contextMenuBuilder = new ContextMenuBuilder(webContents);

  webContents.on('context-menu', (_e, props) => {
    // TODO?: e.preventDefault();
    contextMenuBuilder.showPopupMenu(
      {
        ...props,
        searchEngine: getSearchEngine(),
        clipboardNotifications: getClipboardNotifications(),
        enableTranslator: getEnableTranslator(),
        translatorEngine: getTranslatorEngine(),
        translatorLanguage: getTranslatorLanguage(),
      },
      // @ts-expect-error Expected 1 arguments, but got 4.
      isSpellcheckEnabled(),
      getDefaultSpellcheckerLanguage(),
      getSpellcheckerLanguage(),
    );
  });
}
