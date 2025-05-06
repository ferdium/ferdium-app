import { X509Certificate } from 'node:crypto';
import { join } from 'node:path';
import type { Certificate } from 'electron';
import { ensureDirSync, readFileSync, readdirSync } from 'fs-extra';
import { userDataCertsPath } from '../environment-remote';
import { removeNewLines } from '../jsUtils';

export const checkIfCertIsPresent = (clientCert: Certificate): boolean => {
  const certsFolder = userDataCertsPath();

  ensureDirSync(certsFolder);

  const certs: string[] = [];

  try {
    const certToVerify = new X509Certificate(clientCert.issuerCert.data);

    for (const file of readdirSync(certsFolder)) {
      const cert = readFileSync(join(certsFolder, file), {
        encoding: 'utf8',
        flag: 'r',
      });
      const caCert = new X509Certificate(cert);
      if (caCert.ca && certToVerify.verify(caCert.publicKey)) {
        return true;
      }
      certs.push(removeNewLines(cert));
    }
  } catch (error) {
    console.error(error);
  }

  return certs.length > 0 && certs.includes(removeNewLines(clientCert.data));
};
