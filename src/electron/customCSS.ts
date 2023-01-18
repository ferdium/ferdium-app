import { pathExistsSync, readFileSync } from 'fs-extra';
import { userDataPath } from '../environment-remote';

export default function loadCustomCSS() {
  const path = userDataPath('config', 'custom.css');
  return pathExistsSync(path) ? readFileSync(path).toString() : '';
}
