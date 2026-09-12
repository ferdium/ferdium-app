export type ZaloMessageCompleteness = 'preview' | 'full';
export type ZaloMessageKind =
  | 'text'
  | 'image'
  | 'sticker'
  | 'contact'
  | 'file'
  | 'unknown';
export type ZaloMessageSender = 'me' | 'them' | 'system' | 'unknown';
export type ZaloLoginState =
  | 'available'
  | 'signed-out'
  | 'locked'
  | 'unknown';

export interface ZaloConversationCapture {
  conversationKey: string;
  displayName: string;
  previewText: string;
  unreadCount: number;
  observedAt: string;
}

export interface ZaloMessageCapture {
  conversationKey: string;
  remoteId?: string;
  sender: ZaloMessageSender;
  kind: ZaloMessageKind;
  text: string;
  occurredAt: string;
  completeness: ZaloMessageCompleteness;
}

export interface ZaloArchiveBatch {
  recipeId: 'zalo';
  conversations: ZaloConversationCapture[];
  messages: ZaloMessageCapture[];
  observedAt: string;
  loginState?: ZaloLoginState;
}

export interface ZaloArchiveSummary {
  conversationCount: number;
  messageCount: number;
  lastSyncedAt: string | null;
  loginState: ZaloLoginState;
}

export interface StoredZaloConversation extends ZaloConversationCapture {
  serviceId: string;
}

export interface StoredZaloMessage extends ZaloMessageCapture {
  serviceId: string;
  dedupeKey: string;
}
