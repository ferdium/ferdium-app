// Enhanced from: https://github.com/dertieran/electron-util/blob/replace-remote/source/enforce-macos-app-location.js

import { isMac } from './environment';
import { isDevMode } from './environment-remote';
import { api } from './electron-util';

export function enforceMacOSAppLocation() {
  if (isDevMode || !isMac || api.app.isInApplicationsFolder()) {
    return;
  }

  const clickedButtonIndex = api.dialog.showMessageBoxSync({
    type: 'error',
    message: 'Move to Applications folder?',
    detail:
      'Ferdi must live in the Applications folder to be able to run correctly.',
    buttons: ['Move to Applications folder', 'Quit Ferdi'],
    defaultId: 0,
    cancelId: 1,
  });

  if (clickedButtonIndex === 1) {
    api.app.quit();
    return;
  }

  api.app.moveToApplicationsFolder({
    conflictHandler: conflict => {
      if (conflict === 'existsAndRunning') {
        // Can't replace the active version of the app
        api.dialog.showMessageBoxSync({
          type: 'error',
          message:
            'Another version of Ferdi is currently running. Quit it, then launch this version of the app again.',
          buttons: ['OK'],
        });

        api.app.quit();
      }

      return true;
    },
  });
}
