import { readdirSync, readFileSync, ensureDirSync } from 'fs-extra';
import { join } from 'node:path';
import { userDataCertsPath } from '../environment-remote';

export function removeNewLines(string: string) {
  return string.replaceAll(/\r?\n|\r/g, '');
}

export function readCerts() {
  const certsFolder = userDataCertsPath();

  ensureDirSync(certsFolder);

  const certs: string[] = [];

  for (const file of readdirSync(certsFolder)) {
    const cert = readFileSync(join(certsFolder, file), {
      encoding: 'utf8',
      flag: 'r',
    });
    certs.push(removeNewLines(cert));
  }

  return certs;
}
