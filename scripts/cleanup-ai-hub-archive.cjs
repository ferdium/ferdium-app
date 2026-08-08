#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sqlite3 = require('sqlite3');

const home = os.homedir();
const archiveRoot = path.join(
  home,
  'Library',
  'Application Support',
  'FerdiumDev',
  'ai-hub',
);
const dbPath = process.env.ARCHIVE_DB || path.join(archiveRoot, 'archive.db');

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

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, error => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function extractConversationId(value) {
  if (!value) {
    return null;
  }

  const match = String(value).match(/\/c\/([^#/?]+)/);
  if (match?.[1]) {
    return match[1];
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

function isPlaceholderTitle(title) {
  return !title || title === 'Conversation';
}

function compareConversations(left, right) {
  if (left.message_count !== right.message_count) {
    return right.message_count - left.message_count;
  }

  if (isPlaceholderTitle(left.title) !== isPlaceholderTitle(right.title)) {
    return Number(isPlaceholderTitle(left.title)) - Number(isPlaceholderTitle(right.title));
  }

  return Date.parse(right.updated_at || 0) - Date.parse(left.updated_at || 0);
}

function mergeMessages(rows) {
  const merged = new Map();

  for (const row of rows) {
    const key = `${row.seq}|${row.role}|${row.content_text}`;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, row);
      continue;
    }

    const existingMd = existing.content_md || '';
    const nextMd = row.content_md || '';
    if (nextMd.length > existingMd.length) {
      merged.set(key, row);
    }
  }

  return [...merged.values()].sort((a, b) => a.seq - b.seq);
}

async function main() {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Archive DB not found: ${dbPath}`);
  }

  const backupPath = `${dbPath}.${new Date().toISOString().replaceAll(':', '-')}.bak`;
  fs.copyFileSync(dbPath, backupPath);

  const db = new sqlite3.Database(dbPath);

  try {
    const conversations = await queryAll(
      db,
      `SELECT c.id, c.account_id, c.vendor_conversation_id, c.title, c.source_url, c.created_at, c.updated_at,
              (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
       FROM conversations c`,
    );

    const grouped = new Map();
    for (const conversation of conversations) {
      const key = `${conversation.account_id}|${getCanonicalConversationKey(conversation)}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(conversation);
    }

    const duplicateGroups = [...grouped.values()].filter(group => group.length > 1);

    await run(db, 'BEGIN TRANSACTION');

    let removedConversations = 0;
    let movedMessages = 0;

    for (const group of duplicateGroups) {
      const sorted = [...group].sort(compareConversations);
      const winner = sorted[0];
      const losers = sorted.slice(1);

      const allMessages = [];
      for (const conversation of sorted) {
        const rows = await queryAll(
          db,
          `SELECT role, sender_label, content_text, content_md, seq, created_at, hash
           FROM messages
           WHERE conversation_id = ?
           ORDER BY seq ASC, created_at ASC`,
          [conversation.id],
        );
        allMessages.push(...rows);
      }

      const mergedMessages = mergeMessages(allMessages);
      movedMessages += mergedMessages.length;

      const preferredTitle = sorted.find(row => !isPlaceholderTitle(row.title))?.title || winner.title;
      const preferredVendorConversationId = sorted.find(row => extractConversationId(row.vendor_conversation_id))?.vendor_conversation_id || winner.vendor_conversation_id;
      const preferredSourceUrl = sorted.find(row => extractConversationId(row.source_url))?.source_url || sorted.find(row => row.source_url)?.source_url || winner.source_url;
      const latestUpdatedAt = sorted.reduce(
        (latest, row) => (Date.parse(row.updated_at || 0) > Date.parse(latest || 0) ? row.updated_at : latest),
        winner.updated_at,
      );

      await run(db, 'DELETE FROM messages WHERE conversation_id = ?', [winner.id]);

      for (const [index, message] of mergedMessages.entries()) {
        await run(
          db,
          `INSERT INTO messages (id, conversation_id, role, sender_label, content_text, content_md, seq, created_at, hash)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `cleanup-${winner.id}-${index + 1}`,
            winner.id,
            message.role,
            message.sender_label,
            message.content_text,
            message.content_md,
            message.seq,
            message.created_at,
            message.hash,
          ],
        );
      }

      await run(
        db,
        `UPDATE conversations
         SET title = ?, vendor_conversation_id = ?, source_url = ?, updated_at = ?
         WHERE id = ?`,
        [
          preferredTitle,
          preferredVendorConversationId,
          preferredSourceUrl,
          latestUpdatedAt,
          winner.id,
        ],
      );

      for (const loser of losers) {
        await run(db, 'DELETE FROM messages WHERE conversation_id = ?', [loser.id]);
        await run(db, 'DELETE FROM conversations WHERE id = ?', [loser.id]);
        removedConversations += 1;
      }
    }

    await run(db, 'COMMIT');

    const remaining = await get(db, 'SELECT COUNT(*) AS count FROM conversations');
    console.log(`Backup: ${backupPath}`);
    console.log(`Duplicate groups cleaned: ${duplicateGroups.length}`);
    console.log(`Conversations removed: ${removedConversations}`);
    console.log(`Conversation rows remaining: ${remaining.count}`);
    console.log(`Merged message rows written: ${movedMessages}`);
  } catch (error) {
    await run(db, 'ROLLBACK');
    throw error;
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
