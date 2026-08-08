import { run } from './db';
import type { ConversationIdentity } from './types';

export async function upsertAccount(
  db: any,
  identity: ConversationIdentity,
  now: string,
) {
  await run(
    db,
    `INSERT INTO accounts (id, vendor, account_label, partition_name, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET vendor = excluded.vendor, account_label = excluded.account_label, partition_name = excluded.partition_name`,
    [
      identity.accountId,
      identity.vendor,
      identity.accountLabel,
      identity.service.partition || identity.service.id,
      now,
    ],
  );
}

export async function upsertConversation(
  db: any,
  identity: ConversationIdentity,
  now: string,
) {
  await run(
    db,
    `INSERT INTO conversations (id, account_id, vendor_conversation_id, title, source_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title, source_url = excluded.source_url, updated_at = excluded.updated_at`,
    [
      identity.conversationId,
      identity.accountId,
      identity.vendorConversationId,
      identity.title,
      identity.sourceUrl,
      now,
      now,
    ],
  );
}
