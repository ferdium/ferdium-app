import { all } from '../db';
import { getConversationMarkdownRelativePath } from '../markdownExporter';
import type {
  ArchiveConversationIndexItem,
  ArchiveSearchFilters,
  ArchiveSearchMessageResult,
} from './searchTypes';

type ConversationTitleRow = {
  conversationId: string;
  conversationKey: string | null;
  title: string | null;
  vendor: string;
  accountId: string;
  accountLabel: string;
  updatedAt: string;
  messageCount: number;
};

export async function searchMessages(
  db: any,
  query: string,
  filters: ArchiveSearchFilters = {},
): Promise<ArchiveSearchMessageResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const clauses = ['messages_fts MATCH ?'];
  const params: (string | number)[] = [normalizedQuery];

  if (filters.vendor) {
    clauses.push('vendor = ?');
    params.push(filters.vendor);
  }

  if (filters.accountId) {
    clauses.push('account_id = ?');
    params.push(filters.accountId);
  }

  if (filters.conversationId) {
    clauses.push('conversation_id = ?');
    params.push(filters.conversationId);
  }

  params.push(filters.limit || 20);

  return all<ArchiveSearchMessageResult>(
    db,
    `SELECT
      message_id AS messageId,
      conversation_id AS conversationId,
      account_id AS accountId,
      vendor,
      NULLIF(conversation_title, '') AS conversationTitle,
      content_text AS contentText,
      snippet(messages_fts, 5, '[', ']', ' … ', 12) AS snippet,
      bm25(messages_fts) AS rank
     FROM messages_fts
     WHERE ${clauses.join(' AND ')}
     ORDER BY rank
     LIMIT ?`,
    params,
  );
}

export async function searchConversationsByTitle(
  db: any,
  query: string,
  filters: ArchiveSearchFilters = {},
): Promise<ArchiveConversationIndexItem[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const clauses = ['c.title LIKE ?'];
  const params: (string | number)[] = [`%${normalizedQuery}%`];

  if (filters.vendor) {
    clauses.push('a.vendor = ?');
    params.push(filters.vendor);
  }

  if (filters.accountId) {
    clauses.push('a.id = ?');
    params.push(filters.accountId);
  }

  if (filters.conversationId) {
    clauses.push('c.id = ?');
    params.push(filters.conversationId);
  }

  params.push(filters.limit || 20);

  const rows = await all<ConversationTitleRow>(
    db,
    `SELECT
      c.id AS conversationId,
      COALESCE(c.vendor_conversation_id, c.id) AS conversationKey,
      c.title AS title,
      a.vendor AS vendor,
      a.id AS accountId,
      a.account_label AS accountLabel,
      c.updated_at AS updatedAt,
      COUNT(m.id) AS messageCount
     FROM conversations c
     JOIN accounts a ON a.id = c.account_id
     LEFT JOIN messages m ON m.conversation_id = c.id
     WHERE ${clauses.join(' AND ')}
     GROUP BY c.id, c.vendor_conversation_id, c.title, a.vendor, a.id, a.account_label, c.updated_at
     ORDER BY c.updated_at DESC
     LIMIT ?`,
    params,
  );

  return rows.map(row => ({
    ...row,
    markdownPath: getConversationMarkdownRelativePath({
      conversationFileKey: row.conversationKey || row.conversationId,
      title: row.title || 'Conversation',
    }),
  }));
}
