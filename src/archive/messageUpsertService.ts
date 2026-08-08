import { get, run, stableHash } from './db';
import {
  replaceConversationDocuments,
  syncMessageDocuments,
} from './search/ftsService';
import type { ArchiveScanMessage } from './types';

function toSenderLabel(message: ArchiveScanMessage): string {
  if (message.role === 'user') {
    return 'You';
  }

  if (message.role === 'assistant') {
    return 'Assistant';
  }

  return 'System';
}

function getMessageKey(
  message: ArchiveScanMessage,
  conversationId: string,
): string {
  return (
    message.messageKey ||
    stableHash(
      `message-key|${conversationId}|${message.seq}|${message.role}|${message.text}`,
    )
  );
}

function getMessageId(messageKey: string, conversationId: string): string {
  return stableHash(`message|${conversationId}|${messageKey}`);
}

export async function replaceConversationMessagesForFullScan(
  db: any,
  conversationId: string,
  messages: ArchiveScanMessage[],
  now: string,
) {
  await run(db, 'DELETE FROM messages WHERE conversation_id = ?', [
    conversationId,
  ]);

  const messageIds = await Promise.all(
    messages.map(async message => {
      const messageKey = getMessageKey(message, conversationId);
      const contentText = message.text;
      const contentMd = message.markdown || contentText;
      const messageId = getMessageId(messageKey, conversationId);

      await run(
        db,
        `INSERT INTO messages (id, conversation_id, role, sender_label, content_text, content_md, seq, message_key, created_at, updated_at, hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          messageId,
          conversationId,
          message.role,
          toSenderLabel(message),
          contentText,
          contentMd,
          message.seq,
          messageKey,
          now,
          now,
          stableHash(`${message.role}|${contentText}`),
        ],
      );

      return messageId;
    }),
  );

  await replaceConversationDocuments(db, conversationId);

  return messageIds;
}

export async function upsertIncrementalMessages(
  db: any,
  conversationId: string,
  messages: ArchiveScanMessage[],
  now: string,
) {
  const messageIds = await Promise.all(
    messages.map(async message => {
      const messageKey = getMessageKey(message, conversationId);
      const messageId = getMessageId(messageKey, conversationId);
      const existingMessage = await get<{ id: string }>(
        db,
        'SELECT id FROM messages WHERE conversation_id = ? AND message_key = ? LIMIT 1',
        [conversationId, messageKey],
      );
      const contentText = message.text;
      const contentMd = message.markdown || contentText;

      const operation = existingMessage?.id
        ? run(
            db,
            `UPDATE messages
             SET role = ?, sender_label = ?, content_text = ?, content_md = ?, seq = ?, updated_at = ?, hash = ?
             WHERE id = ?`,
            [
              message.role,
              toSenderLabel(message),
              contentText,
              contentMd,
              message.seq,
              now,
              stableHash(`${message.role}|${contentText}`),
              existingMessage.id,
            ],
          )
        : run(
            db,
            `INSERT INTO messages (id, conversation_id, role, sender_label, content_text, content_md, seq, message_key, created_at, updated_at, hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              messageId,
              conversationId,
              message.role,
              toSenderLabel(message),
              contentText,
              contentMd,
              message.seq,
              messageKey,
              now,
              now,
              stableHash(`${message.role}|${contentText}`),
            ],
          );

      await operation;
      return existingMessage?.id || messageId;
    }),
  );

  await syncMessageDocuments(db, messageIds);

  return messageIds;
}

export async function updateLastAssistantMessage(
  db: any,
  conversationId: string,
  message: ArchiveScanMessage,
  now: string,
) {
  const lastAssistantMessage = await get<{ id: string }>(
    db,
    `SELECT id
     FROM messages
     WHERE conversation_id = ? AND role = 'assistant'
     ORDER BY seq DESC, COALESCE(updated_at, created_at) DESC
     LIMIT 1`,
    [conversationId],
  );

  if (!lastAssistantMessage?.id) {
    const insertedIds = await upsertIncrementalMessages(
      db,
      conversationId,
      [message],
      now,
    );
    return insertedIds[0] || null;
  }

  const contentText = message.text;
  const contentMd = message.markdown || contentText;
  const messageKey = getMessageKey(message, conversationId);

  await run(
    db,
    `UPDATE messages
     SET role = ?, sender_label = ?, content_text = ?, content_md = ?, seq = ?, message_key = ?, updated_at = ?, hash = ?
     WHERE id = ?`,
    [
      message.role,
      toSenderLabel(message),
      contentText,
      contentMd,
      message.seq,
      messageKey,
      now,
      stableHash(`${message.role}|${contentText}`),
      lastAssistantMessage.id,
    ],
  );

  await syncMessageDocuments(db, [lastAssistantMessage.id]);

  return lastAssistantMessage.id;
}
