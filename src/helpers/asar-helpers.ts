import { join } from 'path';

export function asarPath(dir: string = '') {
  return dir.replace('app.asar', 'app.asar.unpacked');
}

// Replacing app.asar is not beautiful but unfortunately necessary
export function asarRecipesPath(...segments: string[]) {
  return join(asarPath(join(__dirname, '..', 'recipes')), ...[segments].flat());
}
