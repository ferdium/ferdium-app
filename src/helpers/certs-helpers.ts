import { X509Certificate } from 'node:crypto';
import { join } from 'node:path';
import { ensureDirSync, readFileSync, readdirSync } from 'fs-extra';
import { userDataCertsPath } from '../environment-remote';
import { removeNewLines } from '../jsUtils';

export const checkIfCertIsPresent = (clientCert): boolean => {
  const certsFolder = userDataCertsPath();

  ensureDirSync(certsFolder);

  const certs: string[] = [];

  for (const file of readdirSync(certsFolder)) {
    const cert = readFileSync(join(certsFolder, file), {
      encoding: 'utf8',
      flag: 'r',
    });
    try {
      const caCert = new X509Certificate(cert);
      if (caCert.ca) {
        const certToVerify = new X509Certificate(clientCert.issuerCert.data);
        if (certToVerify.verify(caCert.publicKey)) {
          return true;
        }
      }
    } catch (error) {
      console.error('Certificate verification error:', error);
    }
    certs.push(removeNewLines(cert));
  }

  return certs.length > 0 && certs.includes(removeNewLines(clientCert.data));
};
