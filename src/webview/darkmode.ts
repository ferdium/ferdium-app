import { join } from 'node:path';
import { pathExistsSync, readFileSync } from 'fs-extra';

const debug = require('../preload-safe-debug')('Ferdium:DarkMode');

const chars = [...'abcdefghijklmnopqrstuvwxyz'];

const ID = Array.from({ length: 20 })
  .map(() => chars[Math.trunc(Math.random() * chars.length)])
  .join('');

const darkModeFilePath = (recipePath: string) => {
  return join(recipePath, 'darkmode.css');
};

export const darkModeStyleExists = (recipePath: string) => {
  return pathExistsSync(darkModeFilePath(recipePath));
};

export const injectDarkModeStyle = (recipePath: string) => {
  if (darkModeStyleExists(recipePath)) {
    const darkmodeCss = darkModeFilePath(recipePath);
    const data = readFileSync(darkmodeCss);
    const styles = document.createElement('style');
    styles.id = ID;
    styles.innerHTML = data.toString();
    debug('Loaded darkmode.css from: ', darkmodeCss);

    document.querySelector('head')?.append(styles);

    debug('Injected Dark Mode style with ID', ID);
  }
};

export const removeDarkModeStyle = () => {
  const style = document.querySelector(`#${ID}`);

  if (style) {
    style.remove();

    debug('Removed Dark Mode Style with ID', ID);
  }
};

export const isDarkModeStyleInjected = () => {
  return !!document.querySelector(`#${ID}`);
};
