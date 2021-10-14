// Enhanced from: https://github.com/dertieran/electron-util/blob/replace-remote/source/api.js

import * as electron from 'electron';
import { initialize } from '@electron/remote/main';

export const initializeRemote = () => {
  if (process.type !== 'browser') {
    throw new Error(
      'The remote api must be initialized from the main process.',
    );
  }

  initialize();
};

export const remote = new Proxy(
  {},
  {
    get: (_target, property) => {
      // eslint-disable-next-line global-require
      const remote = require('@electron/remote');
      return remote[property];
    },
  },
);

export const api = new Proxy(electron, {
  get: (target, property) => {
    if (target[property]) {
      return target[property];
    }

    return remote[property];
  },
});
