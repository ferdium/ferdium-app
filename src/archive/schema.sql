CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL,
  account_label TEXT NOT NULL,
  partition_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  vendor_conversation_id TEXT,
  title TEXT,
  source_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  sender_label TEXT,
  content_text TEXT NOT NULL,
  content_md TEXT NOT NULL,
  seq INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  hash TEXT NOT NULL
);
