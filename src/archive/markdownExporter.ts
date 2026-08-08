import { join, relative } from 'node:path';
import { pathExistsSync, readdirSync, removeSync } from 'fs-extra';
import { getConversationFilenameForKey } from './conversationKeyResolver';
import {
  all,
  archivePaths,
  get,
  writeConversationMarkdown,
  writeLatestMarkdown,
} from './db';
import type { ConversationIdentity, PersistedMessageRow } from './types';

function toMarkdown(
  messages: PersistedMessageRow[],
  title: string,
  sourceUrl?: string | null,
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

export function getConversationMarkdownFilename(input: {
  conversationFileKey: string;
  title: string;
}) {
  return getConversationFilenameForKey(input.conversationFileKey, input.title);
}

export function getConversationMarkdownAbsolutePath(input: {
  conversationFileKey: string;
  title: string;
}) {
  return join(
    archivePaths.conversationsDir,
    getConversationMarkdownFilename(input),
  );
}

export function getConversationMarkdownRelativePath(input: {
  conversationFileKey: string;
  title: string;
}) {
  const relativePath = relative(
    archivePaths.rootDir,
    getConversationMarkdownAbsolutePath(input),
  );

  return `./${relativePath.replaceAll('\\', '/')}`;
}

export async function exportConversationMarkdown(
  db: any,
  identity: ConversationIdentity,
) {
  const conversation = await get<{
    title: string | null;
    source_url: string | null;
  }>(db, 'SELECT title, source_url FROM conversations WHERE id = ? LIMIT 1', [
    identity.conversationId,
  ]);
  const messages = await all<PersistedMessageRow>(
    db,
    `SELECT id, seq, role, sender_label, content_md, content_text, message_key, created_at, updated_at
     FROM messages
     WHERE conversation_id = ?
     ORDER BY seq ASC`,
    [identity.conversationId],
  );
  const title = conversation?.title || identity.title;
  const sourceUrl = conversation?.source_url || identity.sourceUrl;
  const markdown = toMarkdown(messages, title, sourceUrl);

  writeLatestMarkdown(markdown);

  const nextFilename = getConversationMarkdownFilename({
    conversationFileKey: identity.conversationFileKey,
    title,
  });

  removeStaleConversationMarkdowns(identity.conversationFileKey, nextFilename);
  writeConversationMarkdown(nextFilename, markdown);

  return {
    markdown,
    conversationMarkdownPath: getConversationMarkdownAbsolutePath({
      conversationFileKey: identity.conversationFileKey,
      title,
    }),
  };
}
