import {
  conversationKeyFromComposerLabel,
  conversationKeyFromComposerSignals,
  conversationKeyFromTelegramSignals,
  conversationKeyFromZaloTitle,
  supportsLocalCrm,
  defaultBackofficeAccounts,
  displayNameForConversation,
} from '../../../src/features/localCrm/conversation';

describe('supportsLocalCrm', () => {
  it.each([
    ['zalo', true],
    ['telegram', true],
    ['telegram-beta', true],
    ['whatsapp', false],
  ])('trả về %s cho dịch vụ %s', (recipeId, expected) => {
    expect(supportsLocalCrm(recipeId)).toBe(expected);
  });
});

describe('conversationKeyFromZaloTitle', () => {
  it.each([
    ['Zalo - Nguyễn Minh Anh', 'Nguyễn Minh Anh'],
    ['Zalo - Zalo - Khách B', 'Khách B'],
    ['Zalo', ''],
    ['', ''],
  ])('đọc cuộc chat từ tiêu đề %s', (title, expected) => {
    expect(conversationKeyFromZaloTitle(title)).toBe(expected);
  });
});

describe('conversationKeyFromComposerLabel', () => {
  it('đọc đúng khách từ ô soạn tin Zalo', () => {
    expect(
      conversationKeyFromComposerLabel('Nhập @, tin nhắn tới kazawua92-B'),
    ).toBe('kazawua92-B');
  });
});

describe('conversationKeyFromComposerSignals', () => {
  it('reads the recipient from visible composer text when Zalo has no placeholder attribute', () => {
    expect(
      conversationKeyFromComposerSignals(['', 'Nhập @, tin nhắn tới Liem92-V']),
    ).toBe('Liem92-V');
  });
});

describe('conversationKeyFromTelegramSignals', () => {
  it('ưu tiên tên cuộc chat trong phần đầu Telegram', () => {
    expect(
      conversationKeyFromTelegramSignals([
        'Telegram',
        'Ntc006-BSC',
        'last seen recently',
      ]),
    ).toBe('Ntc006-BSC');
  });

  it('không nhận trạng thái hoặc tên ứng dụng là cuộc chat', () => {
    expect(
      conversationKeyFromTelegramSignals([
        'Telegram',
        'online',
        'last seen recently',
      ]),
    ).toBe('');
  });
});

describe('defaultBackofficeAccounts', () => {
  it('leaves both accounts empty for a conversation that has not been linked', () => {
    expect(defaultBackofficeAccounts('Tienyeu88-V')).toEqual({
      bsportAccount: '',
      vsportAccount: '',
    });
  });
});

describe('displayNameForConversation', () => {
  it('uses the saved customer name without changing the conversation key', () => {
    expect(displayNameForConversation('Anh Minh', 'thinh1ti-V')).toBe(
      'Anh Minh',
    );
    expect(displayNameForConversation('   ', 'thinh1ti-V')).toBe('thinh1ti-V');
  });
});
