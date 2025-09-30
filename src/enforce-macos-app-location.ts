// Enhanced from: https://github.com/dertieran/electron-util/blob/replace-remote/source/enforce-macos-app-location.js

import { api } from './electron-util';
import { isMac } from './environment';
import { isDevMode } from './environment-remote';
import { getTranslatedText } from './helpers/i18n-helpers';
import Settings from './electron/Settings';
import { DEFAULT_APP_SETTINGS } from './config';

export default function enforceMacOSAppLocation(): void {
  if (isDevMode || !isMac || api.app.isInApplicationsFolder()) {
    return;
  }

  // Get current locale from settings
  const settings = new Settings('app', DEFAULT_APP_SETTINGS);
  const locale = settings.get('locale') || 'en-US';

  const clickedButtonIndex = api.dialog.showMessageBoxSync({
    type: 'error',
    message: getTranslatedText(
      locale,
      'enforceMacOSAppLocation.message',
      'Move to Applications folder?',
    ),
    detail: getTranslatedText(
      locale,
      'enforceMacOSAppLocation.detail',
      'Ferdium must live in the Applications folder to be able to run correctly.',
    ),
    buttons: [
      getTranslatedText(
        locale,
        'enforceMacOSAppLocation.moveButton',
        'Move to Applications folder',
      ),
      getTranslatedText(
        locale,
        'enforceMacOSAppLocation.quitButton',
        'Quit Ferdium',
      ),
    ],
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
          message: getTranslatedText(
            locale,
            'enforceMacOSAppLocation.conflictMessage',
            'Another version of Ferdium is currently running. Quit it, then launch this version of the app again.',
          ),
          buttons: [
            getTranslatedText(locale, 'enforceMacOSAppLocation.okButton', 'OK'),
          ],
        });

        api.app.quit();
      }

      return true;
    },
  });
}
