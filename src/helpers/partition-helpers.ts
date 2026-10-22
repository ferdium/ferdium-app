export interface SandboxLike {
  id: string;
  services: string[];
}

export const SERVICE_PARTITION_PREFIX = 'persist:service-';
export const SANDBOX_PARTITION_PREFIX = 'persist:sandbox-';

// Storages that only hold data rebuilt on demand. Clearing them reclaims disk
// without dropping cookies, localStorage or IndexedDB (i.e. without logging the
// user out of the service or discarding its message database).
export const REGENERABLE_CACHE_STORAGES = [
  'cachestorage',
  'serviceworkers',
  'shadercache',
] as const;

const PERSIST_PARTITION_PATTERN = /^persist:[\w.-]+$/;

export const isValidPersistPartition = (
  partition: unknown,
): partition is string =>
  typeof partition === 'string' &&
  PERSIST_PARTITION_PATTERN.test(partition) &&
  !partition.includes('..');

export const findSandboxForService = (
  sandboxes: SandboxLike[],
  serviceId: string,
): SandboxLike | undefined =>
  sandboxes.find(
    sandbox =>
      Array.isArray(sandbox.services) && sandbox.services.includes(serviceId),
  );

/**
 * A service lives in its sandbox partition when it belongs to a sandbox group,
 * otherwise in its own partition. Must stay in sync with ServiceWebview.tsx.
 */
export const getServicePartition = ({
  sandboxes,
  serviceId,
  fallbackPartition,
  useSandboxes = true,
}: {
  sandboxes: SandboxLike[];
  serviceId: string;
  fallbackPartition?: string;
  useSandboxes?: boolean;
}): string => {
  if (useSandboxes) {
    const sandbox = findSandboxForService(sandboxes, serviceId);
    if (sandbox) {
      return `${SANDBOX_PARTITION_PREFIX}${sandbox.id}`;
    }
  }

  return fallbackPartition || `${SERVICE_PARTITION_PREFIX}${serviceId}`;
};

/**
 * Partition directories under `Partitions/` that no longer belong to any
 * service or sandbox. They are left behind when a service is deleted while its
 * session is locked, or when a sandbox is dropped.
 */
export const findOrphanPartitionDirectories = (
  directories: string[],
  { serviceIds, sandboxIds }: { serviceIds: string[]; sandboxIds: string[] },
): string[] => {
  const known = new Set<string>([
    ...serviceIds.map(id => `service-${id}`),
    ...sandboxIds.map(id => `sandbox-${id}`),
  ]);

  return directories.filter(
    directory =>
      (directory.startsWith('service-') || directory.startsWith('sandbox-')) &&
      !known.has(directory),
  );
};
