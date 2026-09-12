import { createHash } from 'node:crypto';
import type {
  ZaloArchiveBatch,
  ZaloConversationCapture,
  ZaloMessageCapture,
} from './types';

const MAX_ITEMS = 100;
const MAX_TEXT_LENGTH = 10_000;
const MAX_BATCH_BYTES = 512 * 1024;
const senders = new Set(['me', 'them', 'system', 'unknown']);
const kinds = new Set(['text', 'image', 'sticker', 'file', 'unknown']);
const completenessValues = new Set(['preview', 'full']);
const loginStates = new Set(['available', 'signed-out', 'locked', 'unknown']);

export type ArchiveValidationResult =
  | { ok: true; value: ZaloArchiveBatch }
  | { ok: false; reason: string };

export const normalizeText = (value: string) =>
  value.normalize('NFC').replace(/\s+/gu, ' ').trim();

const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export const messageDedupeKey = (message: ZaloMessageCapture) =>
  message.remoteId
    ? `remote:${normalizeText(message.remoteId)}`
    : `fallback:${hash(
        [
          normalizeText(message.conversationKey),
          message.sender,
          message.kind,
          normalizeText(message.text),
          message.occurredAt,
        ].join('\u001f'),
      )}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown, allowEmpty = true): value is string =>
  typeof value === 'string' &&
  value.length <= MAX_TEXT_LENGTH &&
  (allowEmpty || normalizeText(value).length > 0);

const isDate = (value: unknown): value is string =>
  isText(value, false) && Number.isFinite(Date.parse(value));

const isConversation = (value: unknown): value is ZaloConversationCapture =>
  isRecord(value) &&
  isText(value.conversationKey, false) &&
  isText(value.displayName) &&
  isText(value.previewText) &&
  Number.isSafeInteger(value.unreadCount) &&
  Number(value.unreadCount) >= 0 &&
  isDate(value.observedAt);

const isMessage = (value: unknown): value is ZaloMessageCapture =>
  isRecord(value) &&
  isText(value.conversationKey, false) &&
  (value.remoteId === undefined || isText(value.remoteId, false)) &&
  senders.has(String(value.sender)) &&
  kinds.has(String(value.kind)) &&
  isText(value.text) &&
  isDate(value.occurredAt) &&
  completenessValues.has(String(value.completeness));

export const validateArchiveBatch = (
  value: unknown,
): ArchiveValidationResult => {
  if (!isRecord(value) || value.recipeId !== 'zalo')
    return { ok: false, reason: 'Chỉ hỗ trợ dữ liệu Zalo' };

  let serializedBytes: number;
  try {
    serializedBytes = Buffer.byteLength(JSON.stringify(value), 'utf8');
  } catch {
    return { ok: false, reason: 'Dữ liệu không thể tuần tự hóa' };
  }
  if (serializedBytes > MAX_BATCH_BYTES)
    return { ok: false, reason: 'Batch vượt quá 512 KiB' };
  if (!Array.isArray(value.conversations) || !Array.isArray(value.messages))
    return { ok: false, reason: 'Danh sách lưu trữ không hợp lệ' };
  if (value.conversations.length + value.messages.length > MAX_ITEMS)
    return { ok: false, reason: 'Batch vượt quá 100 mục' };
  if (!isDate(value.observedAt))
    return { ok: false, reason: 'Thời điểm quan sát không hợp lệ' };
  if (
    value.loginState !== undefined &&
    !loginStates.has(String(value.loginState))
  )
    return { ok: false, reason: 'Trạng thái đăng nhập không hợp lệ' };
  if (!value.conversations.every(isConversation))
    return { ok: false, reason: 'Cuộc trò chuyện không hợp lệ' };
  if (!value.messages.every(isMessage))
    return { ok: false, reason: 'Tin nhắn không hợp lệ' };

  return { ok: true, value: value as unknown as ZaloArchiveBatch };
};
