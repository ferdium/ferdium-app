import { join } from 'path';
import { pathExistsSync, readFileSync } from 'fs-extra';

const debug = require('debug')('Ferdi:DarkMode');

const chars = [...'abcdefghijklmnopqrstuvwxyz'];

const ID = [...Array.from({ length: 20 })]
  .map(() => chars[Math.trunc(Math.random() * chars.length)])
  .join('');

function darkModeFilePath(recipePath: string) {
  return join(recipePath, 'darkmode.css');
}

export function darkModeStyleExists(recipePath: string) {
  return pathExistsSync(darkModeFilePath(recipePath));
}

export function injectDarkModeStyle(recipePath: string) {
  if (darkModeStyleExists(recipePath)) {
    const data = readFileSync(darkModeFilePath(recipePath));
    const styles = document.createElement('style');
    styles.id = ID;
    styles.innerHTML = data.toString();

    document.querySelector('head')?.appendChild(styles);

    debug('Injected Dark Mode style with ID', ID);
  }
}

export function removeDarkModeStyle() {
  const style = document.querySelector(`#${ID}`);

  if (style) {
    style.remove();

    debug('Removed Dark Mode Style with ID', ID);
  }
}

export function isDarkModeStyleInjected() {
  return !!document.querySelector(`#${ID}`);
}
