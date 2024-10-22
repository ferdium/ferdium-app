import { readdirSync, removeSync } from 'fs-extra';
import { userDataPath } from '../environment-remote';

export const getServicePartitionsDirectory = (...segments) => {
  return userDataPath('Partitions', ...[segments].flat());
};

export const removeServicePartitionDirectory = (
  id = '',
  addServicePrefix = false,
): void => {
  const servicePartition = getServicePartitionsDirectory(
    `${addServicePrefix ? 'service-' : ''}${id}`,
  );
  removeSync(servicePartition);
};

export async function getServiceIdsFromPartitions(): Promise<string[]> {
  const files = readdirSync(getServicePartitionsDirectory());
  return files.filter(n => n !== '__chrome_extension');
}
