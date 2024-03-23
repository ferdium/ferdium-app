import { join } from 'node:path';
import { ensureDirSync, readFileSync, readdirSync } from 'fs-extra';
import { userDataCertsPath } from '../environment-remote';
import { removeNewLines } from '../jsUtils';

export function checkIfCertIsPresent(certData: string): boolean {
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

  return certs.length > 0 && certs.includes(removeNewLines(certData));
}
