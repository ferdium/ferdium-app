jest.mock('fs-extra', () => ({
  pathExistsSync: jest.fn(),
  readJsonSync: jest.fn(),
  readdirSync: jest.fn(),
  removeSync: jest.fn(),
  writeJsonSync: jest.fn(),
}));

jest.mock('../../src/environment-remote', () => ({
  userDataPath: jest.fn((...segments: string[]) => segments.join('/')),
}));

const mockPreloadSafeDebug = () => jest.fn();

jest.mock('../../src/preload-safe-debug', () => mockPreloadSafeDebug);

const fsExtra = jest.requireMock('fs-extra') as typeof import('fs-extra');
const {
  cleanupPendingServicePartitionDirectories,
  getServicePartitionsDirectory,
  removeServicePartitionDirectory,
} = jest.requireActual(
  '../../src/helpers/service-helpers',
) as typeof import('../../src/helpers/service-helpers');

const mockedPathExistsSync = jest.mocked(fsExtra.pathExistsSync);
const mockedReadJsonSync = jest.mocked(fsExtra.readJsonSync);
const mockedRemoveSync = jest.mocked(fsExtra.removeSync);
const mockedWriteJsonSync = jest.mocked(fsExtra.writeJsonSync);

const pendingRemovalsFile = 'pending-service-partition-removals.json';

describe('service_helpers', () => {
  beforeEach(() => {
    mockedPathExistsSync.mockReset();
    mockedReadJsonSync.mockReset();
    mockedRemoveSync.mockReset();
    mockedWriteJsonSync.mockReset();
    mockedPathExistsSync.mockReturnValue(false);
  });

  it('builds paths inside the Partitions directory', () => {
    expect(getServicePartitionsDirectory('service-id', 'Cache')).toBe(
      'Partitions/service-id/Cache',
    );
  });

  it('removes a service partition immediately when it is not locked', () => {
    removeServicePartitionDirectory('abc123', true);

    expect(mockedRemoveSync).toHaveBeenCalledWith('Partitions/service-abc123');
    expect(mockedWriteJsonSync).not.toHaveBeenCalled();
  });

  it('defers removal when Chromium still has files in use', () => {
    const lockedError = Object.assign(new Error('Partition is locked'), {
      code: 'EBUSY',
    });
    mockedRemoveSync.mockImplementationOnce(() => {
      throw lockedError;
    });

    removeServicePartitionDirectory('abc123', true);

    expect(mockedRemoveSync).toHaveBeenCalledWith('Partitions/service-abc123');
    expect(mockedWriteJsonSync).toHaveBeenCalledWith(pendingRemovalsFile, [
      'service-abc123',
    ]);
  });

  it('preserves existing deferred removals when another partition is locked', () => {
    const lockedError = Object.assign(new Error('Partition is locked'), {
      code: 'EPERM',
    });
    mockedPathExistsSync.mockReturnValue(true);
    mockedReadJsonSync.mockReturnValue(['service-existing']);
    mockedRemoveSync.mockImplementationOnce(() => {
      throw lockedError;
    });

    removeServicePartitionDirectory('abc123', true);

    expect(mockedWriteJsonSync).toHaveBeenCalledWith(pendingRemovalsFile, [
      'service-existing',
      'service-abc123',
    ]);
  });

  it('does not defer errors unrelated to file locks', () => {
    const invalidPathError = Object.assign(new Error('Invalid path'), {
      code: 'EINVAL',
    });
    mockedRemoveSync.mockImplementationOnce(() => {
      throw invalidPathError;
    });

    removeServicePartitionDirectory('abc123', true);

    expect(mockedWriteJsonSync).not.toHaveBeenCalled();
  });

  it('removes deferred partitions on the next startup', () => {
    mockedPathExistsSync.mockReturnValue(true);
    mockedReadJsonSync.mockReturnValue(['service-abc123']);

    cleanupPendingServicePartitionDirectories();

    expect(mockedRemoveSync).toHaveBeenNthCalledWith(
      1,
      'Partitions/service-abc123',
    );
    expect(mockedRemoveSync).toHaveBeenNthCalledWith(2, pendingRemovalsFile);
    expect(mockedWriteJsonSync).not.toHaveBeenCalled();
  });

  it('keeps a deferred partition queued if startup cleanup still cannot remove it', () => {
    const lockedError = Object.assign(new Error('Partition is still locked'), {
      code: 'EBUSY',
    });
    mockedPathExistsSync.mockReturnValue(true);
    mockedReadJsonSync.mockReturnValue(['service-abc123']);
    mockedRemoveSync.mockImplementationOnce(() => {
      throw lockedError;
    });

    cleanupPendingServicePartitionDirectories();

    expect(mockedWriteJsonSync).toHaveBeenCalledWith(pendingRemovalsFile, [
      'service-abc123',
    ]);
  });
});
