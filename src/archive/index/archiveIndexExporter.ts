import { all, archivePaths, writeIndexMarkdown } from '../db';
import { getConversationMarkdownRelativePath } from '../markdownExporter';
import type { ArchiveConversationIndexItem } from '../search/searchTypes';

type ArchiveIndexRow = {
  conversationId: string;
  conversationKey: string | null;
  title: string | null;
  updatedAt: string;
  accountId: string;
  vendor: string;
  accountLabel: string;
  messageCount: number;
};

function groupKey(item: ArchiveConversationIndexItem) {
  return `${item.vendor} / ${item.accountLabel}`;
}

function toMarkdown(items: ArchiveConversationIndexItem[]) {
  const lines = [
    '# AI Hub Archive Index',
    '',
    `Updated at: ${new Date().toISOString()}`,
    '',
  ];
  const grouped = new Map<string, ArchiveConversationIndexItem[]>();

  for (const item of items) {
    const key = groupKey(item);
    const existing = grouped.get(key) || [];
    existing.push(item);
    grouped.set(key, existing);
  }

  for (const [group, groupItems] of grouped.entries()) {
    lines.push(`## ${group}`);

    for (const item of groupItems) {
      const title = item.title || '(untitled)';
      const conversationKey = item.conversationKey || item.conversationId;
      const markdownPath = item.markdownPath || '(missing)';

      lines.push(
        `- ${title}`,
        `  - conversation: ${conversationKey}`,
        `  - updated: ${item.updatedAt}`,
        `  - messages: ${item.messageCount}`,
        `  - markdown: ${markdownPath}`,
      );
    }

    lines.push('');
  }

  return `${lines.join('\n').trim()}\n`;
}

export async function listArchiveIndexItems(
  db: any,
): Promise<ArchiveConversationIndexItem[]> {
  const rows = await all<ArchiveIndexRow>(
    db,
    `SELECT
      c.id AS conversationId,
      COALESCE(c.vendor_conversation_id, c.id) AS conversationKey,
      c.title AS title,
      c.updated_at AS updatedAt,
      a.id AS accountId,
      a.vendor AS vendor,
      a.account_label AS accountLabel,
      COUNT(m.id) AS messageCount
     FROM conversations c
     JOIN accounts a ON a.id = c.account_id
     LEFT JOIN messages m ON m.conversation_id = c.id
     GROUP BY c.id, c.vendor_conversation_id, c.title, c.updated_at, a.id, a.vendor, a.account_label
     ORDER BY a.vendor ASC, a.account_label ASC, c.updated_at DESC`,
  );

  return rows.map(row => ({
    ...row,
    markdownPath: getConversationMarkdownRelativePath({
      conversationFileKey: row.conversationKey || row.conversationId,
      title: row.title || 'Conversation',
    }),
  }));
}

export async function exportArchiveIndex(db: any) {
  const items = await listArchiveIndexItems(db);
  const markdown = toMarkdown(items);
  writeIndexMarkdown(markdown);

  return {
    itemCount: items.length,
    indexMarkdownPath: archivePaths.indexMarkdownPath,
  };
}
