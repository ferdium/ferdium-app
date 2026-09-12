export interface BackofficeStatus {
  phoneBound: boolean;
  bankCardBound: boolean;
  vipLevel: string;
}

export interface BackofficeTarget {
  stream: 'BSPORT' | 'VSPORT';
  account: string;
}

interface SavedBackofficeProfile {
  bsportAccount: string;
  vsportAccount: string;
}

interface MonitoringSnapshot extends BackofficeStatus {
  completed: boolean;
}

interface TransitionResult {
  messages: string[];
  completed: boolean;
}

const vipNumber = (value: string) =>
  Number.parseInt(value.match(/\d+/)?.[0] || '0', 10);

export const backofficeMonitorKey = ({ stream, account }: BackofficeTarget) =>
  `${stream}:${account.trim().toLocaleLowerCase()}`;

export const pendingBackofficeTargets = (
  profiles: SavedBackofficeProfile[],
  snapshots: Map<string, MonitoringSnapshot>,
): BackofficeTarget[] => {
  const targets = new Map<string, BackofficeTarget>();
  for (const profile of profiles) {
    for (const target of [
      { stream: 'BSPORT' as const, account: profile.bsportAccount.trim() },
      { stream: 'VSPORT' as const, account: profile.vsportAccount.trim() },
    ]) {
      if (!target.account) continue;
      const key = backofficeMonitorKey(target);
      if (!snapshots.get(key)?.completed) targets.set(key, target);
    }
  }
  return [...targets.values()];
};

export const evaluateBackofficeTransition = (
  previous: BackofficeStatus | undefined,
  current: BackofficeStatus,
): TransitionResult => {
  const currentVip = vipNumber(current.vipLevel);
  const completed = currentVip >= 1;
  if (!previous) return { messages: [], completed };

  const messages: string[] = [];
  if (!previous.phoneBound && current.phoneBound)
    messages.push('SĐT đã liên kết');
  if (!previous.bankCardBound && current.bankCardBound)
    messages.push('STK đã liên kết');
  if (vipNumber(previous.vipLevel) < 1 && completed)
    messages.push(`Đã đạt VIP ${currentVip}`);

  return { messages, completed };
};
