import {
  pathExistsSync,
  readJsonSync,
  readdirSync,
  removeSync,
  writeJsonSync,
} from 'fs-extra';
import { userDataPath } from '../environment-remote';

const RETRYABLE_PARTITION_REMOVAL_ERROR_CODES = new Set([
  'EACCES',
  'EBUSY',
  'ENOTEMPTY',
  'EPERM',
]);
const debug = require('../preload-safe-debug')('Ferdium:ServiceHelpers');

type FileSystemError = Error & { code?: string };

export const getServicePartitionsDirectory = (...segments) => {
  return userDataPath('Partitions', ...[segments].flat());
};

const getPendingPartitionRemovalsFile = () =>
  userDataPath('pending-service-partition-removals.json');

const readPendingPartitionRemovals = (): string[] => {
  const pendingRemovalsFile = getPendingPartitionRemovalsFile();
  if (!pathExistsSync(pendingRemovalsFile)) {
    return [];
  }

  try {
    const pendingRemovals = readJsonSync(pendingRemovalsFile);
    if (!Array.isArray(pendingRemovals)) {
      return [];
    }

    return pendingRemovals.filter(
      partition =>
        typeof partition === 'string' &&
        partition.length > 0 &&
        !partition.includes('..') &&
        !partition.includes('/') &&
        !partition.includes('\\'),
    );
  } catch (error) {
    debug('Unable to read pending service partition removals', error);
    return [];
  }
};

const writePendingPartitionRemovals = (pendingRemovals: string[]): void => {
  const pendingRemovalsFile = getPendingPartitionRemovalsFile();

  try {
    if (pendingRemovals.length === 0) {
      if (pathExistsSync(pendingRemovalsFile)) {
        removeSync(pendingRemovalsFile);
      }
      return;
    }

    writeJsonSync(pendingRemovalsFile, [...new Set(pendingRemovals)]);
  } catch (error) {
    debug('Unable to persist pending service partition removals', error);
  }
};

const deferPartitionRemoval = (partition: string): void => {
  writePendingPartitionRemovals([...readPendingPartitionRemovals(), partition]);
};

export const cleanupPendingServicePartitionDirectories = (): void => {
  const pendingRemovals = readPendingPartitionRemovals();
  if (pendingRemovals.length === 0) {
    return;
  }

  const remainingRemovals: string[] = [];

  for (const partition of pendingRemovals) {
    const servicePartition = getServicePartitionsDirectory(partition);

    try {
      removeSync(servicePartition);
      debug(`Removed deferred service partition "${servicePartition}"`);
    } catch (error) {
      const errorCode = (error as FileSystemError).code;

      if (errorCode !== 'ENOENT') {
        if (
          errorCode !== undefined &&
          RETRYABLE_PARTITION_REMOVAL_ERROR_CODES.has(errorCode)
        ) {
          remainingRemovals.push(partition);
        }

        debug(
          `Unable to remove deferred service partition "${servicePartition}"`,
          error,
        );
      }
    }
  }

  writePendingPartitionRemovals(remainingRemovals);
};

export const removeServicePartitionDirectory = (
  id = '',
  addServicePrefix = false,
): void => {
  const partition = `${addServicePrefix ? 'service-' : ''}${id}`;
  const servicePartition = getServicePartitionsDirectory(partition);

  try {
    removeSync(servicePartition);
  } catch (error) {
    const errorCode = (error as FileSystemError).code;

    if (errorCode === 'ENOENT') {
      return;
    }

    if (
      errorCode !== undefined &&
      RETRYABLE_PARTITION_REMOVAL_ERROR_CODES.has(errorCode)
    ) {
      deferPartitionRemoval(partition);
      debug(
        `Service partition "${servicePartition}" is still in use; deferring removal until next app start`,
        error,
      );
      return;
    }

    debug(`Unable to remove service partition "${servicePartition}"`, error);
  }
};

export async function getServiceIdsFromPartitions(): Promise<string[]> {
  const files = readdirSync(getServicePartitionsDirectory());
  return files.filter(n => n !== '__chrome_extension');
}

// Persistent Electron sessions can keep files open for the lifetime of the app.
// ServerApi imports this helper before service webviews are created, so this is
// the earliest safe point in the renderer startup to remove partitions that
// were locked when their service was deleted during the previous run.
cleanupPendingServicePartitionDirectories();
