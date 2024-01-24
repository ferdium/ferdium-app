import { readdirSync, readFileSync, ensureDirSync } from 'fs-extra';
import { userDataCertsPath } from '../environment-remote';
import { join } from 'path';

export function readCerts() {
  const certsFolder = userDataCertsPath();

  ensureDirSync(certsFolder);

  const certs: string[] = [];

  readdirSync(certsFolder).forEach(file => {
    const cert = readFileSync(join(certsFolder, file), {
      encoding: 'utf8',
      flag: 'r',
    });
    certs.push(removeNewLines(cert));
  });

  return certs;
}

export function removeNewLines(string: string) {
  return string.replace(/\r?\n|\r/g, '');
}
