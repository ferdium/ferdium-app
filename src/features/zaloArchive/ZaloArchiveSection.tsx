import { ipcRenderer } from 'electron';
import { Component, createRef, type ChangeEvent } from 'react';
import type {
  StoredZaloConversation,
  StoredZaloMessage,
  ZaloArchiveSummary,
} from './types';

interface Props {
  serviceId: string;
}

interface State {
  summary: ZaloArchiveSummary;
  open: boolean;
  loading: boolean;
  query: string;
  conversations: StoredZaloConversation[];
  selected: StoredZaloConversation | null;
  messages: StoredZaloMessage[];
}

const emptySummary: ZaloArchiveSummary = {
  conversationCount: 0,
  messageCount: 0,
  lastSyncedAt: null,
  loginState: 'unknown',
};

const formatTime = (value: string | null) => {
  if (!value) return 'Chưa có dữ liệu';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date)
    : value;
};

export default class ZaloArchiveSection extends Component<Props, State> {
  state: State = {
    summary: emptySummary,
    open: false,
    loading: false,
    query: '',
    conversations: [],
    selected: null,
    messages: [],
  };

  private refreshTimer: ReturnType<typeof setInterval> | undefined;

  private sectionRef = createRef<HTMLElement>();

  componentDidMount() {
    void this.loadSummary();
    this.refreshTimer = setInterval(() => void this.loadSummary(), 5_000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
    this.setArchiveLayout(false);
  }

  setArchiveLayout = (open: boolean) => {
    this.sectionRef.current
      ?.closest('.services__webview-wrapper--with-crm')
      ?.classList.toggle('services__webview-wrapper--archive-open', open);
  };

  loadSummary = async () => {
    const summary = (await ipcRenderer.invoke('zalo-archive:get-summary', {
      serviceId: this.props.serviceId,
    })) as ZaloArchiveSummary;
    this.setState({ summary });
  };

  loadConversations = async (query = this.state.query) => {
    this.setState({ loading: true });
    const conversations = (await ipcRenderer.invoke(
      'zalo-archive:list-conversations',
      { serviceId: this.props.serviceId, query },
    )) as StoredZaloConversation[];
    this.setState({ conversations, loading: false });
  };

  openArchive = async () => {
    await ipcRenderer.invoke('zalo-archive:open-window', {
      serviceId: this.props.serviceId,
    });
  };

  closeArchive = () => {
    this.setArchiveLayout(false);
    this.setState({ open: false });
  };

  updateQuery = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    this.setState({ query });
    void this.loadConversations(query);
  };

  selectConversation = async (selected: StoredZaloConversation) => {
    const messages = (await ipcRenderer.invoke('zalo-archive:get-messages', {
      serviceId: this.props.serviceId,
      conversationKey: selected.conversationKey,
    })) as StoredZaloMessage[];
    this.setState({ selected, messages });
  };

  deleteArchive = async () => {
    if (
      !window.confirm(
        'Xóa toàn bộ lịch sử Zalo đã lưu của profile này? Thao tác này không thể hoàn tác.',
      )
    )
      return;
    await ipcRenderer.invoke('zalo-archive:delete-profile', {
      serviceId: this.props.serviceId,
    });
    this.setArchiveLayout(false);
    this.setState({
      open: false,
      conversations: [],
      selected: null,
      messages: [],
    });
    await this.loadSummary();
  };

  render() {
    const { summary, open, loading, query, conversations, selected, messages } =
      this.state;
    const inaccessible =
      summary.loginState === 'signed-out' || summary.loginState === 'locked';

    return (
      <section
        ref={this.sectionRef}
        className="zalo-archive"
        aria-label="Lịch sử tin nhắn Zalo"
      >
        <header>
          <span>
            <strong>Lịch sử tin nhắn</strong>
            <small>Dữ liệu lưu cục bộ trên máy này</small>
          </span>
          <span className="zalo-archive__count">{summary.messageCount}</span>
        </header>
        {inaccessible && (
          <p className="zalo-archive__warning">
            Tài khoản không còn truy cập được
          </p>
        )}
        <p>
          {summary.messageCount} tin · Cập nhật{' '}
          {formatTime(summary.lastSyncedAt)}
        </p>
        <button type="button" onClick={() => void this.openArchive()}>
          {inaccessible ? 'Mở lịch sử đã lưu' : 'Xem lịch sử đã lưu'}
        </button>
        {summary.messageCount > 0 && (
          <button
            className="zalo-archive__delete"
            type="button"
            onClick={() => void this.deleteArchive()}
          >
            Xóa lịch sử profile này
          </button>
        )}

        {open && (
          <section className="zalo-archive__viewer">
            <header>
              <button
                type="button"
                onClick={this.closeArchive}
                aria-label="Đóng lịch sử"
              >
                ×
              </button>
              <span>
                <strong>Lịch sử tin nhắn Zalo</strong>
                <small>Dữ liệu chỉ đọc · phân theo từng tài khoản</small>
              </span>
            </header>
            <div className="zalo-archive__split-view">
              <aside className="zalo-archive__account-list">
                <input
                  type="search"
                  value={query}
                  onChange={this.updateQuery}
                  placeholder="Tìm theo tên hoặc nội dung"
                />
                <div className="zalo-archive__conversations">
                  {loading && <p>Đang tải lịch sử...</p>}
                  {!loading && conversations.length === 0 && (
                    <p>Chưa có tin nhắn nào được lưu.</p>
                  )}
                  {conversations.map(conversation => (
                    <button
                      key={conversation.conversationKey}
                      className={
                        selected?.conversationKey ===
                        conversation.conversationKey
                          ? 'is-selected'
                          : ''
                      }
                      type="button"
                      onClick={() => void this.selectConversation(conversation)}
                    >
                      <strong>{conversation.displayName}</strong>
                      <span>
                        {conversation.previewText ||
                          'Không có nội dung xem trước'}
                      </span>
                      <small>{formatTime(conversation.observedAt)}</small>
                      {conversation.unreadCount > 0 && (
                        <i>Chưa đọc · {conversation.unreadCount}</i>
                      )}
                    </button>
                  ))}
                </div>
              </aside>
              <main className="zalo-archive__chat-pane">
                {selected ? (
                  <>
                    <header>
                      <strong>{selected.displayName}</strong>
                      <small>
                        {messages.length} tin đã lưu ·{' '}
                        {formatTime(selected.observedAt)}
                      </small>
                    </header>
                    <div className="zalo-archive__messages">
                      {messages.map(message => (
                        <article
                          key={message.dedupeKey}
                          className={`is-${message.sender}`}
                        >
                          <p>{message.text || `[${message.kind}]`}</p>
                          <small>{formatTime(message.occurredAt)}</small>
                          {message.completeness === 'preview' && (
                            <span>Bản xem trước · Chưa đọc</span>
                          )}
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="zalo-archive__empty-chat">
                    <strong>Chọn một tài khoản để xem lịch sử</strong>
                    <small>
                      Mỗi tài khoản được lưu thành một cuộc chat riêng.
                    </small>
                  </div>
                )}
              </main>
            </div>
          </section>
        )}
      </section>
    );
  }
}
