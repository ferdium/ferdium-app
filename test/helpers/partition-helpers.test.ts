import {
  REGENERABLE_CACHE_STORAGES,
  findOrphanPartitionDirectories,
  findSandboxForService,
  getServicePartition,
  isValidPersistPartition,
} from '../../src/helpers/partition-helpers';

describe('getServicePartition', () => {
  const sandboxes = [{ id: 'sb-1', services: ['svc-a', 'svc-b'] }];

  it('returns the sandbox partition for a sandboxed service', () => {
    expect(getServicePartition({ sandboxes, serviceId: 'svc-a' })).toBe(
      'persist:sandbox-sb-1',
    );
  });

  it('falls back to the service partition when the service has no sandbox', () => {
    expect(getServicePartition({ sandboxes, serviceId: 'svc-c' })).toBe(
      'persist:service-svc-c',
    );
  });

  it('honours a recipe partition when no sandbox applies', () => {
    expect(
      getServicePartition({
        sandboxes,
        serviceId: 'svc-c',
        fallbackPartition: 'persist:custom-partition',
      }),
    ).toBe('persist:custom-partition');
  });

  it('ignores sandboxes when the sandbox feature is disabled', () => {
    expect(
      getServicePartition({
        sandboxes,
        serviceId: 'svc-a',
        useSandboxes: false,
      }),
    ).toBe('persist:service-svc-a');
  });

  it('tolerates malformed sandbox entries', () => {
    expect(
      getServicePartition({
        sandboxes: [{ id: 'broken' } as any],
        serviceId: 'svc-a',
      }),
    ).toBe('persist:service-svc-a');
  });
});

describe('isValidPersistPartition', () => {
  it.each(['persist:service-123', 'persist:sandbox-abc', 'persist:todos'])(
    'accepts %s',
    partition => {
      expect(isValidPersistPartition(partition)).toBe(true);
    },
  );

  it.each([
    undefined,
    '',
    'service-123',
    'persist:../etc',
    'persist:service 123',
    'persist:service/../../x',
  ])('rejects %p', partition => {
    expect(isValidPersistPartition(partition)).toBe(false);
  });
});

describe('findOrphanPartitionDirectories', () => {
  it('returns only partitions without an owner', () => {
    expect(
      findOrphanPartitionDirectories(
        [
          'service-svc-a',
          'service-svc-gone',
          'sandbox-sb-1',
          'sandbox-sb-gone',
          '__chrome_extension',
        ],
        { serviceIds: ['svc-a'], sandboxIds: ['sb-1'] },
      ),
    ).toStrictEqual(['service-svc-gone', 'sandbox-sb-gone']);
  });

  it('ignores directories that are not service partitions', () => {
    expect(
      findOrphanPartitionDirectories(['Cache', 'GPUCache'], {
        serviceIds: ['svc-a'],
        sandboxIds: [],
      }),
    ).toStrictEqual([]);
  });

  it('treats every partition as orphan when nothing is known', () => {
    expect(
      findOrphanPartitionDirectories(['service-svc-a', 'sandbox-sb-1'], {
        serviceIds: [],
        sandboxIds: [],
      }),
    ).toStrictEqual(['service-svc-a', 'sandbox-sb-1']);
  });
});

describe('REGENERABLE_CACHE_STORAGES', () => {
  it('never includes storages that hold credentials or message data', () => {
    expect(REGENERABLE_CACHE_STORAGES).not.toContain('cookies');
    expect(REGENERABLE_CACHE_STORAGES).not.toContain('indexdb');
    expect(REGENERABLE_CACHE_STORAGES).not.toContain('localstorage');
  });
});

describe('findSandboxForService', () => {
  it('matches by exact service id', () => {
    const sandboxes = [{ id: 'sb-1', services: ['svc-a'] }];
    expect(findSandboxForService(sandboxes, 'svc-a')?.id).toBe('sb-1');
    expect(findSandboxForService(sandboxes, 'svc')).toBeUndefined();
  });
});
