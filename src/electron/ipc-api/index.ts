import { BrowserWindow } from 'electron';
import autoUpdate from './autoUpdate';
import settings from './settings';
import sessionStorage from './sessionStorage';
import appIndicator from './appIndicator';
import download from './download';
import processManager from './processManager';
import localServer from './localServer';
import languageDetect from './languageDetect';
import dnd from './dnd';
import focusState from './focusState';
import TrayIcon from '../../lib/Tray';

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
