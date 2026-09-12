import { BackofficeLookupGuard } from '../../../src/features/localCrm/BackofficeLookupGuard';

describe('BackofficeLookupGuard', () => {
  it('rejects a lookup result after the active Zalo conversation changes', () => {
    const guard = new BackofficeLookupGuard();
    const first = guard.begin('zalo-sales', 'khach-a', 'BSPORT', 'account-a');

    guard.begin('zalo-sales', 'khach-b', 'BSPORT', 'account-b');

    expect(guard.isCurrent(first)).toBe(false);
  });

  it('accepts only the newest lookup for the same conversation and provider', () => {
    const guard = new BackofficeLookupGuard();
    const first = guard.begin('zalo-sales', 'khach-a', 'VSPORT', 'account-a');
    const newest = guard.begin('zalo-sales', 'khach-a', 'VSPORT', 'account-a');

    expect(guard.isCurrent(first)).toBe(false);
    expect(guard.isCurrent(newest)).toBe(true);
  });
});
