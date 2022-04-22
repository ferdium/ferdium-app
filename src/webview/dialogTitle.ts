import { ipcRenderer } from 'electron';

// TODO: Go back to 'debug' from 'console.log' when https://github.com/electron/electron/issues/31689 is fixed
// const debug = require('debug')('Ferdium:Plugin:DialogTitleHandler');

export class DialogTitleHandler {
  titleCache: { title: string };

  constructor() {
    this.titleCache = {
      title: '',
    };
  }

  safeGetTitle(title: string | undefined | null) {
    if (!title) {
      return '';
    }

    return title;
  }

  setDialogTitle(title: string | undefined | null) {
    const newTitle = this.safeGetTitle(title);
    if (this.titleCache.title === newTitle) {
      return;
    }

    console.log('Sending active dialog title to host %s', newTitle);
    ipcRenderer.sendToHost('active-dialog-title', newTitle);

    this.titleCache.title = newTitle;
  }
}
