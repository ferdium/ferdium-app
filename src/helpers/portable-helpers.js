import { app } from 'electron';
import path from 'path';

// Set app directory before loading user modules
export function portable() {
  if (process.env.FERDI_APPDATA_DIR != null) {
    app.setPath('appData', process.env.FERDI_APPDATA_DIR);
    app.setPath('userData', path.join(app.getPath('appData')));
  } else if (process.env.PORTABLE_EXECUTABLE_DIR != null) {
    app.setPath('appData', process.env.PORTABLE_EXECUTABLE_DIR, `${app.getName()}AppData`);
    app.setPath('userData', path.join(app.getPath('appData'), `${app.getName()}AppData`));
  } else if (process.platform === 'win32') {
    app.setPath('appData', process.env.APPDATA);
    app.setPath('userData', path.join(app.getPath('appData'), app.getName()));
  }
}
