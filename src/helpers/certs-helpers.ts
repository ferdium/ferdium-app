import { X509Certificate } from 'node:crypto';
import { join } from 'node:path';
import type { Certificate } from 'electron';
import { ensureDirSync, readFileSync, readdirSync } from 'fs-extra';
import { userDataCertsPath } from '../environment-remote';
import { removeNewLines } from '../jsUtils';

const debug = require('../preload-safe-debug')('Ferdium:App');

export const checkIfCertIsPresent = (clientCert: Certificate): boolean => {
  const certsFolder = userDataCertsPath();

  ensureDirSync(certsFolder);

  const certs: string[] = [];
  const clientCertHasCA: boolean = clientCert.issuerCert !== undefined;
  let certToVerify: X509Certificate | undefined;

  try {
    if (clientCertHasCA) {
      certToVerify = new X509Certificate(clientCert.issuerCert.data);
    }

    for (const file of readdirSync(certsFolder)) {
      const cert = readFileSync(join(certsFolder, file), {
        encoding: 'utf8',
        flag: 'r',
      });
      if (clientCertHasCA) {
        const caCert = new X509Certificate(cert);
        if (caCert.ca && certToVerify?.verify(caCert.publicKey)) {
          return true;
        }
      }

      certs.push(removeNewLines(cert));
    }
  } catch (error) {
    debug('Error when parsing the certificates:', error);
  }

  return certs.length > 0 && certs.includes(removeNewLines(clientCert.data));
};
