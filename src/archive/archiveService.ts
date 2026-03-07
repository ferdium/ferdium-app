import { join } from 'node:path';
import { pathExistsSync, readdirSync, removeSync } from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';
import type Service from '../models/Service';
import {
  all,
  archivePaths,
  getArchiveDb,
  run,
  stableHash,
  writeConversationMarkdown,
  writeLatestMarkdown,
} from './db';

type ScanMessage = {
  seq: number;
  role: 'user' | 'assistant' | 'system';
  text: string;
  markdown?: string;
  html?: string;
  id?: string;
};

type ScanPayload = {
  platform?: string;
  title?: string;
  model?: string;
  currentUrl?: string;
  messageCount?: number;
  messages?: ScanMessage[];
};

type ArchiveMessageRow = {
  seq: number;
  role: string;
  sender_label: string | null;
  content_md: string;
  content_text: string;
};

function getAccountId(service: Service): string {
  return stableHash(`account|${service.partition || service.id}`);
}

function getVendorConversationId(payload: ScanPayload): string | null {
  if (!payload.currentUrl) {
    return null;
  }

  const match = payload.currentUrl.match(/\/c\/([^#/?]+)/);
  return match?.[1] || null;
}

function getConversationId(service: Service, payload: ScanPayload): string {
  const vendorConversationId = getVendorConversationId(payload);

  if (vendorConversationId) {
    return stableHash(
      `conversation|${getAccountId(service)}|${vendorConversationId}`,
    );
  }

  return stableHash(
    `conversation|${getAccountId(service)}|${payload.currentUrl || 'unknown-url'}`,
  );
}

function getAccountLabel(service: Service): string {
  return service.name || service.recipe?.name || 'unknown';
}

function slugifyTitle(title: string): string {
  const safe = sanitizeFilename(title || 'Conversation')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '');

  return safe || 'Conversation';
}

function getConversationFileKey(
  service: Service,
  payload: ScanPayload,
): string {
  return (
    getVendorConversationId(payload) || getConversationId(service, payload)
  );
}

function getConversationFilename(
  service: Service,
  payload: ScanPayload,
): string {
  return `${getConversationFileKey(service, payload)}-${slugifyTitle(
    payload.title || service.name || 'Conversation',
  )}.md`;
}

function removeStaleConversationMarkdowns(
  fileKey: string,
  nextFilename: string,
) {
  if (!pathExistsSync(archivePaths.conversationsDir)) {
    return;
  }

  const filenames = readdirSync(archivePaths.conversationsDir);

  filenames
    .filter(
      filename =>
        filename.startsWith(`${fileKey}-`) && filename !== nextFilename,
    )
    .forEach(filename => {
      removeSync(join(archivePaths.conversationsDir, filename));
    });
}

function toSenderLabel(message: ScanMessage): string {
  if (message.role === 'user') {
    return 'You';
  }

  if (message.role === 'assistant') {
    return 'Assistant';
  }

  return 'System';
}

function toMarkdown(
  messages: ArchiveMessageRow[],
  title: string,
  sourceUrl?: string,
) {
  const lines = [`# ${title || 'Conversation'}`, ''];

  if (sourceUrl) {
    lines.push(`Source: ${sourceUrl}`, '');
  }

  for (const message of messages) {
    lines.push(
      `## ${message.seq}. ${message.sender_label || message.role}`,
      '',
      message.content_md || message.content_text || '',
      '',
    );
  }

  return `${lines.join('\n').trim()}\n`;
}

export async function archiveConversationScan({
  service,
  payload,
}: {
  service: Service;
  payload: ScanPayload;
}) {
  const db = await getArchiveDb();
  const now = new Date().toISOString();
  const accountId = getAccountId(service);
  const conversationId = getConversationId(service, payload);
  const conversationFileKey = getConversationFileKey(service, payload);
  const messages = (payload.messages || []).filter(message =>
    message?.text?.trim(),
  );

  await run(db, 'BEGIN TRANSACTION');

  try {
    await run(
      db,
      `INSERT INTO accounts (id, vendor, account_label, partition_name, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET vendor = excluded.vendor, account_label = excluded.account_label, partition_name = excluded.partition_name`,
      [
        accountId,
        payload.platform || service.recipe?.id || 'unknown',
        getAccountLabel(service),
        service.partition || service.id,
        now,
      ],
    );

    await run(
      db,
      `INSERT INTO conversations (id, account_id, vendor_conversation_id, title, source_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, source_url = excluded.source_url, updated_at = excluded.updated_at`,
      [
        conversationId,
        accountId,
        getVendorConversationId(payload),
        payload.title || service.name,
        payload.currentUrl || null,
        now,
        now,
      ],
    );

    await run(db, 'DELETE FROM messages WHERE conversation_id = ?', [
      conversationId,
    ]);

    await Promise.all(
      messages.map(message => {
        const contentMd = message.markdown || message.text;
        const contentText = message.text;
        const messageId = stableHash(
          `message|${conversationId}|${message.seq}|${message.role}|${contentText}`,
        );

        return run(
          db,
          `INSERT INTO messages (id, conversation_id, role, sender_label, content_text, content_md, seq, created_at, hash)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            messageId,
            conversationId,
            message.role,
            toSenderLabel(message),
            contentText,
            contentMd,
            message.seq,
            now,
            stableHash(`${message.role}|${contentText}`),
          ],
        );
      }),
    );

    await run(db, 'COMMIT');
  } catch (error) {
    await run(db, 'ROLLBACK');
    throw error;
  }

  const persistedMessages = await all<ArchiveMessageRow>(
    db,
    'SELECT seq, role, sender_label, content_md, content_text FROM messages WHERE conversation_id = ? ORDER BY seq ASC',
    [conversationId],
  );

  const markdown = toMarkdown(
    persistedMessages,
    payload.title || service.name,
    payload.currentUrl,
  );

  writeLatestMarkdown(markdown);

  const conversationFilename = getConversationFilename(service, payload);

  removeStaleConversationMarkdowns(conversationFileKey, conversationFilename);
  writeConversationMarkdown(conversationFilename, markdown);

  return {
    accountId,
    conversationId,
    messageCount: persistedMessages.length,
    dbPath: archivePaths.dbPath,
    markdownPath: archivePaths.latestMarkdownPath,
    conversationMarkdownPath: `${archivePaths.conversationsDir}/${conversationFilename}`,
  };
}
