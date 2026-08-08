#!/usr/bin/env node
const os = require('node:os');
const path = require('node:path');
const sqlite3 = require('sqlite3');

const home = os.homedir();
const archiveRoot =
  process.env.ARCHIVE_ROOT ||
  path.join(home, 'Library', 'Application Support', 'FerdiumDev', 'ai-hub');
const dbPath = process.env.ARCHIVE_DB || path.join(archiveRoot, 'archive.db');

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

async function main() {
  const db = new sqlite3.Database(dbPath);

  try {
    await run(
      db,
      `CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
        message_id UNINDEXED,
        conversation_id UNINDEXED,
        account_id UNINDEXED,
        vendor UNINDEXED,
        conversation_title,
        content_text,
        content_md
      )`,
    );
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

    const row = await get(db, 'SELECT COUNT(*) AS count FROM messages_fts');

    process.stdout.write(
      `${JSON.stringify(
        {
          tag: '[AI-HUB] rebuilt FTS index',
          dbPath,
          indexedMessages: row?.count || 0,
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
  process.stderr.write('[AI-HUB] failed to rebuild FTS index\n');
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
