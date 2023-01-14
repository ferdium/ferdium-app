import { readFileSync } from 'fs';
import { pathExistsSync } from 'fs-extra';
import { userDataPath } from '../environment-remote';

export default function loadCustomCSS() {
  const path = userDataPath('config', 'custom.css');

  let style = '';
  if (pathExistsSync(path)) {
    style = readFileSync(path).toString();
  }

  return style;
}
