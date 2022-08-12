export default interface IContextMenuParams extends Electron.ContextMenuParams {
  enableTranslator: boolean;
  clipboardNotifications: boolean;
  searchEngine: string;
  translatorEngine: string;
  translatorLanguage: string;
}
