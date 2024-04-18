import type { BrowserWindow } from 'electron';
import type TrayIcon from '../../lib/Tray';
import appIndicator from './appIndicator';
// eslint-disable-next-line import/no-cycle
import autoUpdate from './autoUpdate';
import dnd from './dnd';
import download from './download';
import focusState from './focusState';
import languageDetect from './languageDetect';
import localServer from './localServer';
import processManager from './processManager';
import sessionStorage from './sessionStorage';
import settings from './settings';

export default (params: {
  mainWindow: BrowserWindow;
  settings: any;
  trayIcon: TrayIcon;
}) => {
  settings(params);
  sessionStorage();
  autoUpdate(params);
  appIndicator(params);
  download(params);
  processManager();
  localServer(params);
  languageDetect();
  dnd();
  focusState(params);
};
