export const conversationKeyFromZaloTitle = (title: string): string => {
  const value = title
    .trim()
    .replace(/^(?:Zalo\s*[-–—]\s*)+/i, '')
    .trim();
  return !value || /^Zalo$/i.test(value) ? '' : value;
};

export const conversationKeyFromComposerLabel = (label: string): string => {
  const match = label.trim().match(/tin nhắn tới\s+(.+)$/i);
  return match?.[1]?.trim() || '';
};

export const conversationKeyFromComposerSignals = (signals: string[]) => {
  for (const signal of signals) {
    const conversationKey = conversationKeyFromComposerLabel(signal);
    if (conversationKey) return conversationKey;
  }
  return '';
};

const telegramIgnoredSignals = [
  /^telegram(?: web)?$/i,
  /^online$/i,
  /^offline$/i,
  /^last seen/i,
  /^typing/i,
  /^search$/i,
  /^saved messages$/i,
];

export const conversationKeyFromTelegramSignals = (signals: string[]) => {
  for (const signal of signals) {
    const value = signal?.trim();
    if (
      value &&
      value.length <= 120 &&
      !telegramIgnoredSignals.some(pattern => pattern.test(value))
    )
      return value;
  }
  return '';
};

export const supportsLocalCrm = (recipeId: string) =>
  recipeId === 'zalo' || recipeId.startsWith('telegram');

export const defaultBackofficeAccounts = (_conversationKey: string) => ({
  bsportAccount: '',
  vsportAccount: '',
});

export const displayNameForConversation = (
  name: string,
  conversationKey: string,
) => name.trim() || conversationKey;
