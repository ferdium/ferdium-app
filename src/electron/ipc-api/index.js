import autoUpdate from './autoUpdate';
import settings from './settings';
import appIndicator from './appIndicator';
import download from './download';
import processManager from './processManager';
import localServer from './localServer';

export default (params) => {
  settings(params);
  autoUpdate(params);
  appIndicator(params);
  download(params);
  processManager(params);
  localServer(params);
};
