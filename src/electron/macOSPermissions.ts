import { systemPreferences, BrowserWindow, dialog } from 'electron';
import { pathExistsSync, mkdirSync, writeFileSync } from 'fs-extra';
import macosVersion from 'macos-version';
import { dirname } from 'path';
// @ts-ignore
import { askForScreenCaptureAccess } from 'node-mac-permissions';
import { userDataPath } from '../environment-remote';

// TODO: Go back to 'debug' from 'console.log' when https://github.com/electron/electron/issues/31689 is fixed
// const debug = require('debug')('Ferdium:macOSPermissions');

const isExplicitScreenCapturePermissionReqd =
  macosVersion.isGreaterThanOrEqualTo('10.15');
console.log(
  `Should check explicitly for screen-capture permissions: ${isExplicitScreenCapturePermissionReqd}`,
);

const filePath = userDataPath('.has-app-requested-screen-capture-permissions');

function hasPromptedForScreenCapturePermission(): string | boolean {
  if (!isExplicitScreenCapturePermissionReqd) {
    return false;
  }

  console.log('Checking if status file exists');
  return filePath && pathExistsSync(filePath);
}

function hasScreenCapturePermissionAlreadyBeenGranted(): boolean {
  if (!isExplicitScreenCapturePermissionReqd) {
    return true;
  }

  const screenCaptureStatus = systemPreferences.getMediaAccessStatus('screen');
  console.log(`screen-capture permissions status: ${screenCaptureStatus}`);
  return screenCaptureStatus === 'granted';
}

function createStatusFile() {
  try {
    writeFileSync(filePath, '');
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      mkdirSync(dirname(filePath));
      writeFileSync(filePath, '');
    }

    throw error;
  }
}

export const askFormacOSPermissions = async (mainWindow: BrowserWindow) => {
  console.log('Checking camera & microphone permissions');
  systemPreferences.askForMediaAccess('camera');
  systemPreferences.askForMediaAccess('microphone');

  if (hasScreenCapturePermissionAlreadyBeenGranted()) {
    console.log('Already obtained screen-capture permissions - writing status file');
    createStatusFile();
    return;
  }

  if (!hasPromptedForScreenCapturePermission()) {
    console.log('Checking screen capture permissions');

    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      message: 'Enable Screen Sharing',
      detail:
        'To enable screen sharing for some services, Ferdium needs the permission to record your screen.',
      buttons: ['Allow screen sharing', 'No', 'Ask me later'],
      defaultId: 0,
      cancelId: 2,
    });

    if (response === 0) {
      console.log('Asking for access');
      askForScreenCaptureAccess();
      createStatusFile();
    } else if (response === 1) {
      console.log("Don't ask again");
      createStatusFile();
    }
  }
};
