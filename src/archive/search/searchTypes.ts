export type ArchiveSearchFilters = {
  vendor?: string;
  accountId?: string;
  conversationId?: string;
  limit?: number;
};

export type ArchiveSearchMessageResult = {
  messageId: string;
  conversationId: string;
  accountId: string;
  vendor: string;
  conversationTitle: string | null;
  snippet: string;
  contentText: string;
  rank: number;
};

export type ArchiveConversationIndexItem = {
  conversationId: string;
  conversationKey: string | null;
  title: string | null;
  vendor: string;
  accountId: string;
  accountLabel: string;
  updatedAt: string;
  messageCount: number;
  markdownPath: string | null;
};
