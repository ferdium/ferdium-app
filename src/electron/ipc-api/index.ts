import { BrowserWindow, Tray } from 'electron';
import autoUpdate from './autoUpdate';
import settings from './settings';
import sessionStorage from './sessionStorage';
import appIndicator from './appIndicator';
import download from './download';
import localServer from './localServer';
import languageDetect from './languageDetect';
import dnd from './dnd';
import focusState from './focusState';

export default (params: {
  mainWindow: BrowserWindow;
  settings: any;
  trayIcon: Tray;
}) => {
  settings(params);
  sessionStorage();
  autoUpdate(params);
  appIndicator(params);
  download(params);
  localServer(params);
  languageDetect();
  dnd();
  focusState(params);
};
