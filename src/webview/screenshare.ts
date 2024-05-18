import { ipcRenderer } from 'electron';
import { v4 as uuidV4 } from 'uuid';

const debug = require('../preload-safe-debug')('Ferdium:Screenshare');

export async function getDisplayMediaSelector() {
  return new Promise((resolve, reject) => {
    const trackerId = uuidV4();
    debug('New screenshare request', trackerId);

    ipcRenderer.sendToHost('load-available-displays', {
      trackerId,
    });

    ipcRenderer.once(`selected-media-source:${trackerId}`, (_e, data) => {
      if (data.mediaSourceId === 'desktop-capturer-selection__cancel') {
        return reject(new Error('Cancelled by user'));
      }

      return resolve(data.mediaSourceId);
    });
  });
}

export const screenShareJs = `
window.navigator.mediaDevices.getDisplayMedia = () => new Promise(async (resolve, reject) => {
  try {
    const displayId = await window.ferdium.getDisplayMediaSelector();
    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: displayId,
        },
      },
    });
    resolve(stream);
  } catch (err) {
    reject(err);
  }
});
`;
