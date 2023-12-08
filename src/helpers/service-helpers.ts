import { readdirSync, removeSync } from 'fs-extra';
import { userDataPath } from '../environment-remote';

export function getServicePartitionsDirectory(...segments) {
  return userDataPath('Partitions', ...[segments].flat());
}

export function removeServicePartitionDirectory(
  id = '',
  addServicePrefix = false,
) {
  const servicePartition = getServicePartitionsDirectory(
    `${addServicePrefix ? 'service-' : ''}${id}`,
  );
  removeSync(servicePartition);
}

export async function getServiceIdsFromPartitions() {
  const files = readdirSync(getServicePartitionsDirectory());
  return files.filter(n => n !== '__chrome_extension');
}
