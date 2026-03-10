import {
  all,
  ensureFtsSchema as ensureFtsSchemaInDb,
  run,
  stableHash,
} from '../db';

export type MessageFtsDocument = {
  messageId: string;
  conversationId: string;
  accountId: string;
  vendor: string;
  conversationTitle: string | null;
  contentText: string;
  contentMd: string;
};

type MessageFtsRow = {
  messageId: string;
  conversationId: string;
  accountId: string;
  vendor: string;
  conversationTitle: string | null;
  contentText: string;
  contentMd: string;
};

export async function ensureFtsSchema(db: any) {
  await ensureFtsSchemaInDb(db);
}

export async function deleteMessageDocument(db: any, messageId: string) {
  await ensureFtsSchema(db);
  await run(db, 'DELETE FROM messages_fts WHERE message_id = ?', [messageId]);
}

export async function upsertMessageDocument(
  db: any,
  input: MessageFtsDocument,
) {
  await ensureFtsSchema(db);
  await deleteMessageDocument(db, input.messageId);
  await run(
    db,
    `INSERT INTO messages_fts (
      message_id,
      conversation_id,
      account_id,
      vendor,
      conversation_title,
      content_text,
      content_md
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.messageId,
      input.conversationId,
      input.accountId,
      input.vendor,
      input.conversationTitle || '',
      input.contentText,
      input.contentMd,
    ],
  );
}

export async function rebuildFtsIndex(db: any) {
  await ensureFtsSchemaInDb(db);
  await run(db, 'DELETE FROM messages_fts');
  await run(
    db,
    `INSERT INTO messages_fts (
      message_id,
      conversation_id,
      account_id,
      vendor,
      conversation_title,
      content_text,
      content_md
    )
    SELECT
      m.id,
      m.conversation_id,
      c.account_id,
      a.vendor,
      COALESCE(c.title, ''),
      m.content_text,
      m.content_md
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN accounts a ON a.id = c.account_id`,
  );
}

export async function replaceConversationDocuments(
  db: any,
  conversationId: string,
) {
  await ensureFtsSchema(db);
  await run(db, 'DELETE FROM messages_fts WHERE conversation_id = ?', [
    conversationId,
  ]);

  const rows = await all<MessageFtsRow>(
    db,
    `SELECT
      m.id AS messageId,
      m.conversation_id AS conversationId,
      c.account_id AS accountId,
      a.vendor AS vendor,
      c.title AS conversationTitle,
      m.content_text AS contentText,
      m.content_md AS contentMd
     FROM messages m
     JOIN conversations c ON c.id = m.conversation_id
     JOIN accounts a ON a.id = c.account_id
     WHERE m.conversation_id = ?
     ORDER BY m.seq ASC`,
    [conversationId],
  );

  await Promise.all(rows.map(row => upsertMessageDocument(db, row)));
}

export async function syncMessageDocuments(db: any, messageIds: string[]) {
  const uniqueMessageIds = [...new Set(messageIds.filter(Boolean))];

  if (uniqueMessageIds.length === 0) {
    return;
  }

  await ensureFtsSchema(db);

  const placeholders = uniqueMessageIds.map(() => '?').join(', ');
  const rows = await all<MessageFtsRow>(
    db,
    `SELECT
      m.id AS messageId,
      m.conversation_id AS conversationId,
      c.account_id AS accountId,
      a.vendor AS vendor,
      c.title AS conversationTitle,
      m.content_text AS contentText,
      m.content_md AS contentMd
     FROM messages m
     JOIN conversations c ON c.id = m.conversation_id
     JOIN accounts a ON a.id = c.account_id
     WHERE m.id IN (${placeholders})`,
    uniqueMessageIds,
  );

  await Promise.all(
    uniqueMessageIds.map(messageId => deleteMessageDocument(db, messageId)),
  );
  await Promise.all(rows.map(row => upsertMessageDocument(db, row)));
}

export function createFallbackMessageKey(input: {
  conversationId: string;
  seq: number;
  role: string;
  text: string;
}) {
  return stableHash(
    `message-key|${input.conversationId}|${input.seq}|${input.role}|${input.text}`,
  );
}
