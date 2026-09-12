const timeOrStatus =
  /^(?:vài giây|hôm qua|hôm nay|đã nhận|đã gửi|bạn:?|(?:\d+\s*)?(?:phút|giờ|ngày|tuần|tháng))$/iu;
const reactionMarkup = /\/(?:-strong|-heart)|:-?\(\(|:>|:-h/iu;

export const isZaloUiNoise = (value: string) => {
  const text = value.normalize('NFC').replace(/\s+/gu, ' ').trim();
  return !text || timeOrStatus.test(text) || reactionMarkup.test(text);
};

export const isInvalidZaloConversationName = (value: string) => {
  const text = value.normalize('NFC').replace(/\s+/gu, ' ').trim();
  return isZaloUiNoise(text) || text.endsWith(':');
};
