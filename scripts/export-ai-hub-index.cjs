#!/usr/bin/env node
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const sqlite3 = require('sqlite3');
const sanitizeFilename = require('sanitize-filename');

const home = os.homedir();
const archiveRoot =
  process.env.ARCHIVE_ROOT ||
  path.join(home, 'Library', 'Application Support', 'FerdiumDev', 'ai-hub');
const dbPath = process.env.ARCHIVE_DB || path.join(archiveRoot, 'archive.db');
const conversationsDir = path.join(archiveRoot, 'conversations');
const indexMarkdownPath = path.join(archiveRoot, 'index.md');

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows || []);
    });
  });
}

function slugifyTitle(title) {
  const safe = sanitizeFilename(title || 'Conversation')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '');

  return safe || 'Conversation';
}

function getConversationMarkdownRelativePath(conversationKey, title) {
  const filename = `${conversationKey}-${slugifyTitle(title)}.md`;
  const absolutePath = path.join(conversationsDir, filename);
  return `./${path.relative(archiveRoot, absolutePath).replaceAll(path.sep, '/')}`;
}

function toMarkdown(items) {
  const lines = [
    '# AI Hub Archive Index',
    '',
    `Updated at: ${new Date().toISOString()}`,
    '',
  ];
  const grouped = new Map();

  for (const item of items) {
    const key = `${item.vendor} / ${item.accountLabel}`;
    const existing = grouped.get(key) || [];
    existing.push(item);
    grouped.set(key, existing);
  }

  for (const [group, groupItems] of grouped.entries()) {
    lines.push(`## ${group}`);

    for (const item of groupItems) {
      lines.push(
        `- ${item.title || '(untitled)'}`,
        `  - conversation: ${item.conversationKey || item.conversationId}`,
        `  - updated: ${item.updatedAt}`,
        `  - messages: ${item.messageCount}`,
        `  - markdown: ${item.markdownPath || '(missing)'}`,
      );
    }

    lines.push('');
  }

  return `${lines.join('\n').trim()}\n`;
}

async function main() {
  const db = new sqlite3.Database(dbPath);

  try {
    const rows = await all(
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

    const items = rows.map(row => ({
      ...row,
      markdownPath: getConversationMarkdownRelativePath(
        row.conversationKey || row.conversationId,
        row.title || 'Conversation',
      ),
    }));

    fs.mkdirSync(archiveRoot, { recursive: true });
    fs.writeFileSync(indexMarkdownPath, toMarkdown(items), 'utf8');

    process.stdout.write(
      `${JSON.stringify(
        {
          tag: '[AI-HUB] exported archive index',
          itemCount: items.length,
          indexMarkdownPath,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    db.close();
  }
}

main().catch(error => {
  process.stderr.write('[AI-HUB] failed to export archive index\n');
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
