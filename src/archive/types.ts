import type Service from '../models/Service';

export type ArchiveMessageRole = 'user' | 'assistant' | 'system';

export type ArchiveScanMessage = {
  seq: number;
  role: ArchiveMessageRole;
  text: string;
  markdown?: string;
  html?: string;
  id?: string;
  messageKey?: string;
};

export type ArchiveScanPayload = {
  platform?: string;
  title?: string;
  model?: string;
  currentUrl?: string;
  messageCount?: number;
  messages?: ArchiveScanMessage[];
};

export type ArchiveIncrementalMode =
  | 'bootstrap'
  | 'append'
  | 'update-tail'
  | 'rescan';

export type ArchiveIncrementalPayload = {
  vendor?: string;
  conversationKey?: string;
  sourceUrl?: string;
  currentUrl?: string;
  title?: string;
  model?: string;
  mode: ArchiveIncrementalMode;
  messages?: ArchiveScanMessage[];
  updatedTail?: ArchiveScanMessage | null;
  scannedAt?: string;
};

export type ArchiveConversationInput =
  | ArchiveScanPayload
  | ArchiveIncrementalPayload;

export type ConversationIdentity = {
  accountId: string;
  accountLabel: string;
  vendor: string;
  sourceUrl: string | null;
  vendorConversationId: string | null;
  conversationId: string;
  conversationFileKey: string;
  title: string;
  service: Service;
};

export type PersistedMessageRow = {
  id: string;
  seq: number;
  role: string;
  sender_label: string | null;
  content_md: string;
  content_text: string;
  message_key: string | null;
  created_at: string;
  updated_at: string | null;
};
