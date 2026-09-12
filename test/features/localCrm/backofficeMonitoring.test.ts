import {
  evaluateBackofficeTransition,
  pendingBackofficeTargets,
  type BackofficeStatus,
} from '../../../src/features/localCrm/backofficeMonitoring';

const status = (overrides: Partial<BackofficeStatus> = {}): BackofficeStatus => ({
  phoneBound: false,
  bankCardBound: false,
  vipLevel: '0',
  ...overrides,
});

describe('pendingBackofficeTargets', () => {
  it('keeps monitoring only the VIP 0 side of mixed BSPORT/VSPORT accounts', () => {
    const snapshots = new Map([
      [
        'BSPORT:khach-b',
        { ...status({ vipLevel: '0' }), completed: false },
      ],
      [
        'VSPORT:khach-v',
        { ...status({ vipLevel: 'VIP 1' }), completed: true },
      ],
    ]);

    expect(
      pendingBackofficeTargets(
        [
          {
            bsportAccount: 'Khach-B',
            vsportAccount: 'Khach-V',
          },
        ],
        snapshots,
      ),
    ).toEqual([{ stream: 'BSPORT', account: 'Khach-B' }]);
  });

  it('deduplicates the same account saved in more than one conversation', () => {
    const profile = {
      serviceId: 'zalo-a',
      conversationKey: 'khach-a',
      bsportAccount: 'same-account',
      vsportAccount: '',
      activeStream: 'BSPORT' as const,
      updatedAt: '2026-09-12T00:00:00.000Z',
    };

    expect(
      pendingBackofficeTargets(
        [profile, { ...profile, conversationKey: 'khach-b' }],
        new Map(),
      ),
    ).toEqual([{ stream: 'BSPORT', account: 'same-account' }]);
  });
});

describe('evaluateBackofficeTransition', () => {
  it('uses the first result as a baseline without notifying', () => {
    expect(evaluateBackofficeTransition(undefined, status())).toEqual({
      messages: [],
      completed: false,
    });
  });

  it('notifies when SĐT and STK become linked', () => {
    expect(
      evaluateBackofficeTransition(
        status(),
        status({ phoneBound: true, bankCardBound: true }),
      ),
    ).toEqual({
      messages: ['SĐT đã liên kết', 'STK đã liên kết'],
      completed: false,
    });
  });

  it('notifies on VIP 0 to VIP 1 and completes monitoring', () => {
    expect(
      evaluateBackofficeTransition(status(), status({ vipLevel: '1' })),
    ).toEqual({
      messages: ['Đã đạt VIP 1'],
      completed: true,
    });
  });

  it('does not notify or continue monitoring an account already at VIP 1+', () => {
    expect(
      evaluateBackofficeTransition(undefined, status({ vipLevel: 'VIP 2' })),
    ).toEqual({ messages: [], completed: true });
  });
});
