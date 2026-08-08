#!/usr/bin/env node
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const sqlite3 = require('sqlite3');
const sanitizeFilename = require('sanitize-filename');

const home = os.homedir();
const defaultRoot = path.join(
  home,
  'Library',
  'Application Support',
  'FerdiumDev',
  'ai-hub',
);
const archiveRoot = process.env.ARCHIVE_ROOT || defaultRoot;
const dbPath = process.env.ARCHIVE_DB || path.join(archiveRoot, 'archive.db');
const conversationsDir =
  process.env.ARCHIVE_CONVERSATIONS_DIR || path.join(archiveRoot, 'conversations');
const latestMarkdownPath =
  process.env.ARCHIVE_LATEST_MD || path.join(archiveRoot, 'conversation.md');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugifyTitle(title) {
  const safe = sanitizeFilename(title || 'Conversation')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return safe || 'Conversation';
}

function queryAll(db, sql, params = []) {
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

function buildMarkdown(conversation, messages) {
  const lines = [`# ${conversation.title || 'Conversation'}`, ''];

  if (conversation.source_url) {
    lines.push(`Source: ${conversation.source_url}`, '');
  }

  for (const message of messages) {
    const speaker =
      message.sender_label || (message.role === 'user' ? 'You' : message.role);
    lines.push(
      `## ${message.seq}. ${speaker}`,
      '',
      message.content_md || message.content_text || '',
      '',
    );
  }

  return `${lines.join('\n').trim()}\n`;
}

function clearConversationExports(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const filename of fs.readdirSync(dir)) {
    if (filename.endsWith('.md')) {
      fs.rmSync(path.join(dir, filename), { force: true });
    }
  }
}

function extractConversationId(value) {
  if (!value) {
    return null;
  }

  const match = String(value).match(/\/c\/([^#/?]+)/);
  if (match?.[1]) {
    return match[1];
  }

  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(String(value))) {
    return String(value);
  }

  return null;
}

function getCanonicalConversationKey(conversation) {
  return (
    extractConversationId(conversation.vendor_conversation_id) ||
    extractConversationId(conversation.source_url) ||
    conversation.source_url ||
    conversation.vendor_conversation_id ||
    conversation.id
  );
}

function shouldPreferConversation(nextConversation, currentConversation) {
  const nextUpdatedAt = Date.parse(nextConversation.updated_at || 0);
  const currentUpdatedAt = Date.parse(currentConversation.updated_at || 0);

  if (nextConversation.message_count !== currentConversation.message_count) {
    return nextConversation.message_count > currentConversation.message_count;
  }

  if (nextUpdatedAt !== currentUpdatedAt) {
    return nextUpdatedAt > currentUpdatedAt;
  }

  const nextTitle = nextConversation.title || '';
  const currentTitle = currentConversation.title || '';

  if (currentTitle === 'Conversation' && nextTitle !== 'Conversation') {
    return true;
  }

  return nextTitle.length > currentTitle.length;
}


function isOpaqueConversationKey(value) {
  return !extractConversationId(value);
}

function getConversationFilename(conversation) {
  const baseKey = isOpaqueConversationKey(conversation.canonical_key)
    ? `${conversation.account_id}-${conversation.canonical_key}`
    : conversation.canonical_key;
  const safeKey = sanitizeFilename(String(baseKey).replace(/:\/\//g, '-').replace(/\//g, '-'));

  return `${safeKey || 'conversation'}-${slugifyTitle(conversation.title)}.md`;
}

function dedupeConversations(conversations) {
  const deduped = new Map();

  for (const conversation of conversations) {
    const key = `${conversation.account_id}|${getCanonicalConversationKey(conversation)}`;
    const existing = deduped.get(key);

    if (!existing || shouldPreferConversation(conversation, existing)) {
      deduped.set(key, {
        ...conversation,
        canonical_key: getCanonicalConversationKey(conversation),
      });
    }
  }

  return [...deduped.values()].sort(
    (left, right) =>
      Date.parse(right.updated_at || 0) - Date.parse(left.updated_at || 0),
  );
}

async function main() {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Archive DB not found: ${dbPath}`);
  }

  ensureDir(conversationsDir);
  clearConversationExports(conversationsDir);

  const db = new sqlite3.Database(dbPath);
  try {
    const conversations = await queryAll(
      db,
      `SELECT c.id, c.account_id, c.vendor_conversation_id, c.title, c.source_url, c.updated_at,
              (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
       FROM conversations c
       ORDER BY c.updated_at DESC`,
    );
    const dedupedConversations = dedupeConversations(conversations);

    let latestMarkdown = null;
    let latestCount = 0;

    for (const conversation of dedupedConversations) {
      const messages = await queryAll(
        db,
        'SELECT seq, role, sender_label, content_md, content_text FROM messages WHERE conversation_id = ? ORDER BY seq ASC',
        [conversation.id],
      );

      const markdown = buildMarkdown(conversation, messages);
      const filename = getConversationFilename(conversation);
      fs.writeFileSync(path.join(conversationsDir, filename), markdown, 'utf8');

      if (!latestMarkdown) {
        latestMarkdown = markdown;
      }

      latestCount += 1;
    }

    if (latestMarkdown) {
      fs.writeFileSync(latestMarkdownPath, latestMarkdown, 'utf8');
    }

    console.log(`Exported ${latestCount} conversation(s)`);
    console.log(`DB: ${dbPath}`);
    console.log(`Dir: ${conversationsDir}`);
    console.log(`Latest: ${latestMarkdownPath}`);
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
