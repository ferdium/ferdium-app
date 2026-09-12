import type {
  ZaloArchiveBatch,
  ZaloConversationCapture,
  ZaloLoginState,
  ZaloMessageCapture,
  ZaloMessageKind,
  ZaloMessageSender,
} from '../features/zaloArchive/types';
import {
  isInvalidZaloConversationName,
  isZaloUiNoise,
} from '../features/zaloArchive/noise';

const CONVERSATION_ROWS =
  '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]';
const CONVERSATION_NAME =
  '[data-translate-inner], [class*="name"], [class*="title"]';
const CONVERSATION_PREVIEW =
  '[class*="preview"], [class*="subtitle"], [class*="last-msg"]';
const UNREAD_BADGE = '[class*="unread"], [class*="badge"]';
const MESSAGE_ROWS =
  '[data-id][class*="message"], [data-msg-id], [class*="message-item"], [data-qid][class*="contact-message"]';
const ACTIVE_NAME =
  'header [class*="name"], header [class*="title"], [class*="chat-info"] [class*="name"]';

const clean = (value: string | null | undefined) =>
  (value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim();

const attribute = (node: Element, names: string[]) => {
  for (const name of names) {
    const value = clean(node.getAttribute(name));
    if (value) return value;
  }
  return '';
};

const conversationKey = (node: Element, displayName: string) =>
  attribute(node, ['data-conversation-id', 'data-id', 'href']) || displayName;

const unreadCount = (node: Element) => {
  const badge = node.querySelector(UNREAD_BADGE);
  if (!badge) return 0;
  const match = clean(badge.textContent).match(/^(\d+)\+?$/u);
  return match ? Number(match[1]) : 0;
};

const detectKind = (node: Element): ZaloMessageKind => {
  if (
    attribute(node, ['class']).includes('contact-message__container') ||
    node.querySelector('[class*="contact-card__container"]')
  )
    return 'contact';
  if (node.querySelector('img'))
    return node.querySelector('[class*="sticker"]') ? 'sticker' : 'image';
  if (node.querySelector('[class*="file"], [data-file-name]')) return 'file';
  return clean(node.textContent) ? 'text' : 'unknown';
};

const messageText = (node: Element, kind: ZaloMessageKind) => {
  if (kind !== 'contact') return clean(node.textContent);
  const name = clean(
    node.querySelector('[class*="contact-card__name-wrapper"]')?.textContent,
  );
  const description = clean(
    node.querySelector('[class*="contact-card__description-wrapper"]')
      ?.textContent,
  );
  return `Danh thiếp: ${[name, description].filter(Boolean).join(' · ')}`;
};

const detectSender = (node: Element): ZaloMessageSender => {
  const marker = `${attribute(node, ['data-sender', 'data-from'])} ${
    node.getAttribute('class') ?? ''
  }`.toLowerCase();
  if (/\b(me|self|sent|outgoing)\b/u.test(marker)) return 'me';
  if (/\b(system)\b/u.test(marker)) return 'system';
  if (/\b(them|received|incoming)\b/u.test(marker)) return 'them';
  return 'unknown';
};

const detectLoginState = (root: Document): ZaloLoginState => {
  const text = clean(root.documentElement?.textContent).toLowerCase();
  if (/tài khoản.{0,30}(bị khóa|khóa tạm thời)/u.test(text)) return 'locked';
  if (/đăng nhập.{0,30}(zalo|mã qr)/u.test(text)) return 'signed-out';
  return root.querySelector(CONVERSATION_ROWS) ? 'available' : 'unknown';
};

export const collectZaloArchiveSnapshot = (
  root: Document,
  observedAt: string,
): Omit<ZaloArchiveBatch, 'recipeId' | 'observedAt'> => {
  const conversations: ZaloConversationCapture[] = [];
  const messages: ZaloMessageCapture[] = [];

  for (const row of Array.from(root.querySelectorAll(CONVERSATION_ROWS))) {
    const displayName = clean(
      row.querySelector(CONVERSATION_NAME)?.textContent,
    );
    const rawPreview = clean(
      row.querySelector(CONVERSATION_PREVIEW)?.textContent,
    );
    const previewText = isZaloUiNoise(rawPreview) ? '' : rawPreview;
    const key = conversationKey(row, displayName);
    if (!key || isInvalidZaloConversationName(displayName)) continue;
    const unread = unreadCount(row);
    conversations.push({
      conversationKey: key,
      displayName,
      previewText,
      unreadCount: unread,
      observedAt,
    });
    if (previewText && unread > 0) {
      messages.push({
        conversationKey: key,
        sender: 'them',
        kind: 'text',
        text: previewText,
        occurredAt: observedAt,
        completeness: 'preview',
      });
    }
  }

  const activeName = clean(root.querySelector(ACTIVE_NAME)?.textContent);
  const normalizedActiveName = activeName.toLocaleLowerCase();
  const activeKey =
    [...conversations]
      .sort((left, right) => right.displayName.length - left.displayName.length)
      .find(conversation => {
        const displayName = clean(
          conversation.displayName,
        ).toLocaleLowerCase();
        return (
          displayName === normalizedActiveName ||
          normalizedActiveName.startsWith(displayName)
        );
      })?.conversationKey ?? activeName;
  if (activeKey) {
    for (const row of Array.from(root.querySelectorAll(MESSAGE_ROWS))) {
      const kind = detectKind(row);
      const text = messageText(row, kind);
      if (
        (kind === 'text' && isZaloUiNoise(text)) ||
        (!text && kind === 'unknown')
      )
        continue;
      messages.push({
        conversationKey: activeKey,
        remoteId:
          attribute(row, [
            'data-msg-id',
            'data-message-id',
            'data-id',
            'data-qid',
          ]) ||
          undefined,
        sender: detectSender(row),
        kind,
        text,
        occurredAt:
          attribute(row, ['data-time', 'data-timestamp', 'datetime']) ||
          observedAt,
        completeness: 'full',
      });
    }
  }

  return { conversations, messages, loginState: detectLoginState(root) };
};

interface ObserverLike {
  observe(target: Node, options: MutationObserverInit): void;
  disconnect(): void;
}

interface CollectorOptions {
  document: Document;
  hostname: string;
  send: (channel: string, batch: ZaloArchiveBatch) => void;
  now?: () => Date;
  createObserver?: (callback: MutationCallback) => ObserverLike;
  setTimer?: (
    callback: () => void,
    milliseconds: number,
  ) => ReturnType<typeof setTimeout>;
  clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
}

export const startZaloArchiveCollector = ({
  document: root,
  hostname,
  send,
  now = () => new Date(),
  createObserver = callback => new MutationObserver(callback),
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}: CollectorOptions): (() => void) => {
  if (hostname !== 'chat.zalo.me') return () => undefined;

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flush = () => {
    if (stopped) return;
    const observedAt = now().toISOString();
    const snapshot = collectZaloArchiveSnapshot(root, observedAt);
    const combined = [...snapshot.conversations, ...snapshot.messages].slice(
      0,
      100,
    );
    const conversationCount = Math.min(
      snapshot.conversations.length,
      combined.length,
    );
    send('zalo-archive:capture', {
      recipeId: 'zalo',
      conversations: snapshot.conversations.slice(0, conversationCount),
      messages: snapshot.messages.slice(0, 100 - conversationCount),
      observedAt,
      loginState: snapshot.loginState,
    });
  };
  const schedule = () => {
    if (timer !== undefined) clearTimer(timer);
    timer = setTimer(flush, 400);
  };
  const observer = createObserver(schedule);
  observer.observe(root.documentElement ?? (root as unknown as Node), {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });
  schedule();

  return () => {
    stopped = true;
    observer.disconnect();
    if (timer !== undefined) clearTimer(timer);
  };
};
