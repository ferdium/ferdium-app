import { ipcRenderer } from 'electron';
import { type IReactionDisposer, reaction } from 'mobx';
import { Component, type ChangeEvent } from 'react';
import type ServiceModel from '../../models/Service';
import ZaloArchiveSection from '../zaloArchive/ZaloArchiveSection';
import type {
  BackofficeProfile,
  Contact,
  ContactInput,
} from './ContactRepository';
import { BackofficeLookupGuard } from './BackofficeLookupGuard';
import {
  backofficeMonitorKey,
  evaluateBackofficeTransition,
  pendingBackofficeTargets,
  type BackofficeTarget,
  type BackofficeStatus,
} from './backofficeMonitoring';
import {
  conversationKeyFromComposerSignals,
  conversationKeyFromTelegramSignals,
  conversationKeyFromZaloTitle,
  defaultBackofficeAccounts,
  displayNameForConversation,
} from './conversation';

interface Props {
  service: ServiceModel;
}

interface CheckResult {
  ok: boolean;
  stream: 'BSPORT' | 'VSPORT';
  phoneBound?: boolean;
  bankCardBound?: boolean;
  vipLevel?: string;
  depositAmount?: number;
  totalValidBet?: number;
  weeklyRevenue?: number | null;
  weeklyError?: string;
  weeklyRange?: { startDate: string; endDate: string };
  message?: string;
}

interface DepositRecord {
  time?: string;
  title?: string;
  orderNo?: string;
  amount?: number | string;
  status?: string;
  note?: string;
  provider?: string;
}

interface DepositHistory {
  rows: DepositRecord[];
  total: number;
}

interface State extends ContactInput {
  loading: boolean;
  saved: boolean;
  profileSaved: boolean;
  bsportAccount: string;
  vsportAccount: string;
  activeStream: 'BSPORT' | 'VSPORT';
  checkResult: CheckResult | null;
  depositHistory: DepositHistory | null;
  depositHistoryError: string;
  depositHistoryLoading: boolean;
  depositHistoryOpen: boolean;
}

const emptyContact = (serviceId: string): State => ({
  serviceId,
  conversationKey: '',
  name: '',
  phone: '',
  email: '',
  notes: '',
  tags: [],
  loading: false,
  saved: false,
  profileSaved: false,
  bsportAccount: '',
  vsportAccount: '',
  activeStream: 'BSPORT',
  checkResult: null,
  depositHistory: null,
  depositHistoryError: '',
  depositHistoryLoading: false,
  depositHistoryOpen: false,
});

const formatBet = (value: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value);

const formatDepositAmount = (value: number | string | undefined) => {
  if (typeof value === 'number') return `${formatBet(value)} đ`;
  const number = Number(String(value || '').replace(/[^\d-]/g, ''));
  return Number.isFinite(number)
    ? `${formatBet(number)} đ`
    : String(value || '—');
};

const formatDepositTime = (value?: string) => {
  if (!value) return 'Không rõ thời gian';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date)
    : value;
};

const getErrorMessage = (error: unknown) => {
  const fallback = 'Không thể kết nối Hậu đài BUFA';
  if (!(error instanceof Error)) return fallback;
  return (
    error.message.replace(
      /^Error invoking remote method '[^']+': Error: /,
      '',
    ) || fallback
  );
};

export default class LocalCrmPanel extends Component<Props, State> {
  private static readonly backofficeSnapshots = new Map<
    string,
    BackofficeStatus & { completed: boolean }
  >();

  private static backgroundScanRunning = false;

  state = emptyContact(this.props.service.id);

  private titleReaction: IReactionDisposer | undefined;

  private conversationPoll: ReturnType<typeof setInterval> | undefined;

  private backofficeRefresh: ReturnType<typeof setInterval> | undefined;

  private profileSaveTimer: ReturnType<typeof setTimeout> | undefined;

  private contactSaveTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly lookupGuard = new BackofficeLookupGuard();

  private hasComposerSignal = false;

  componentDidMount() {
    this.titleReaction = reaction(
      () => this.props.service.pageTitle,
      title => {
        if (this.props.service.recipe.id === 'zalo' && !this.hasComposerSignal)
          void this.changeConversation(title);
      },
      { fireImmediately: true },
    );
    this.conversationPoll = setInterval(
      () => void this.pollConversation(),
      750,
    );
    this.backofficeRefresh = setInterval(() => {
      if (!this.props.service.isActive) return;
      void this.scanPendingBackofficeAccounts();
    }, 15_000);
    void this.pollConversation();
  }

  componentWillUnmount() {
    this.titleReaction?.();
    clearInterval(this.conversationPoll);
    clearInterval(this.backofficeRefresh);
    clearTimeout(this.profileSaveTimer);
    clearTimeout(this.contactSaveTimer);
    this.lookupGuard.invalidate();
  }

  async pollConversation() {
    const { service } = this.props;
    if (!service.isActive || !service.webview) return;
    try {
      const isTelegram = service.recipe.id.startsWith('telegram');
      const signals = (await service.webview.executeJavaScript(`(() => {
        const nodes = document.querySelectorAll(${JSON.stringify(
          isTelegram
            ? '#MiddleColumn header [dir="auto"], #column-center header [dir="auto"], .middle-column-header [dir="auto"], .chat-info [dir="auto"], .peer-title, [class*="ChatInfo"] [dir="auto"]'
            : 'textarea, input, [contenteditable], [aria-label], [data-placeholder]',
        )});
        const signals = [];
        for (const node of nodes) {
          signals.push(...[
            node.getAttribute('placeholder'),
            node.getAttribute('aria-label'),
            node.getAttribute('data-placeholder'),
            node.textContent
          ].filter(Boolean));
        }
        return signals;
      })()`)) as string[];
      const conversationKey = isTelegram
        ? conversationKeyFromTelegramSignals(signals)
        : conversationKeyFromComposerSignals(signals);
      if (conversationKey) {
        this.hasComposerSignal = true;
        if (conversationKey !== this.state.conversationKey) {
          void this.changeConversation(`Zalo - ${conversationKey}`);
        }
      }
    } catch {
      // Webview may be navigating or not attached yet; the next poll retries.
    }
  }

  async changeConversation(title: string) {
    const observedName = conversationKeyFromZaloTitle(title);
    const conversationKey = observedName
      ? ((await ipcRenderer.invoke('local-crm:resolve-conversation-key', {
          serviceId: this.props.service.id,
          observedName,
        })) as string)
      : '';
    if (conversationKey === this.state.conversationKey) return;
    this.lookupGuard.invalidate();
    const activeStream = this.state.activeStream;
    this.setState(
      {
        ...emptyContact(this.props.service.id),
        conversationKey,
        activeStream,
      },
      () => {
        if (!conversationKey) return;
        void this.load();
        void this.loadBackofficeProfile(conversationKey);
      },
    );
  }

  async loadBackofficeProfile(conversationKey = this.state.conversationKey) {
    const profile = (await ipcRenderer.invoke(
      'local-crm:get-backoffice-profile',
      { serviceId: this.props.service.id, conversationKey },
    )) as BackofficeProfile | null;
    if (this.state.conversationKey !== conversationKey) return;
    const defaults = defaultBackofficeAccounts(conversationKey);
    this.setState(
      {
        bsportAccount: profile?.bsportAccount || defaults.bsportAccount,
        vsportAccount: profile?.vsportAccount || defaults.vsportAccount,
        activeStream: profile?.activeStream || 'BSPORT',
        profileSaved: false,
      },
      () => {
        void this.refreshOpenedBackofficeAccounts();
      },
    );
  }

  async load() {
    const { serviceId, conversationKey } = this.state;
    if (!conversationKey.trim()) return;

    this.setState({ loading: true, saved: false });
    const contact = (await ipcRenderer.invoke('local-crm:get-contact', {
      serviceId,
      conversationKey,
    })) as Contact | null;
    if (this.state.conversationKey !== conversationKey) return;
    this.setState(previous =>
      contact
        ? { ...previous, ...contact, loading: false, saved: false }
        : {
            ...previous,
            name: '',
            phone: '',
            email: '',
            notes: '',
            tags: [],
            loading: false,
          },
    );
  }

  update =
    (field: keyof ContactInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      this.setState(
        previous => ({
          ...previous,
          [field]:
            field === 'tags'
              ? value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(Boolean)
              : value,
          saved: false,
        }),
        () => {
          clearTimeout(this.contactSaveTimer);
          this.contactSaveTimer = setTimeout(() => void this.save(), 700);
        },
      );
    };

  updateBackofficeAccount =
    (field: 'bsportAccount' | 'vsportAccount') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      this.setState(
        {
          [field]: event.target.value,
          profileSaved: false,
        } as Pick<State, 'bsportAccount' | 'vsportAccount' | 'profileSaved'>,
        () => {
          clearTimeout(this.profileSaveTimer);
          const profile = {
            serviceId: this.props.service.id,
            conversationKey: this.state.conversationKey,
            bsportAccount: this.state.bsportAccount,
            vsportAccount: this.state.vsportAccount,
            activeStream: this.state.activeStream,
          };
          this.profileSaveTimer = setTimeout(
            () => void this.saveBackofficeProfile(profile),
            800,
          );
        },
      );
    };

  saveBackofficeProfile = async (
    profileInput = {
      serviceId: this.props.service.id,
      conversationKey: this.state.conversationKey,
      bsportAccount: this.state.bsportAccount,
      vsportAccount: this.state.vsportAccount,
      activeStream: this.state.activeStream,
    },
  ) => {
    if (!profileInput.conversationKey) return;
    const { conversationKey } = profileInput;
    await ipcRenderer.invoke('local-crm:save-backoffice-profile', profileInput);
    if (this.state.conversationKey !== conversationKey) return;
    this.setState({ profileSaved: true });
  };

  save = async () => {
    if (!this.state.conversationKey.trim()) return;
    const {
      loading,
      saved,
      profileSaved,
      bsportAccount,
      vsportAccount,
      activeStream,
      checkResult,
      depositHistory,
      depositHistoryError,
      depositHistoryLoading,
      depositHistoryOpen,
      ...contact
    } = this.state;
    const savedContact = (await ipcRenderer.invoke(
      'local-crm:save-contact',
      contact,
    )) as Contact;
    this.setState({
      ...savedContact,
      loading: false,
      saved: true,
      profileSaved,
      bsportAccount,
      vsportAccount,
      activeStream,
      checkResult,
      depositHistory,
      depositHistoryError,
      depositHistoryLoading,
      depositHistoryOpen,
    });
  };

  check = async (stream: 'BSPORT' | 'VSPORT') => {
    if (!this.state.conversationKey) {
      this.setState({
        activeStream: stream,
        checkResult: {
          ok: false,
          stream,
          message: 'Hãy chọn một cuộc chat Zalo trước',
        },
      });
      return;
    }
    const account = (
      stream === 'BSPORT' ? this.state.bsportAccount : this.state.vsportAccount
    ).trim();
    if (!account) {
      this.setState({
        activeStream: stream,
        checkResult: {
          ok: false,
          stream,
          message: `Hãy nhập tài khoản ${stream} cho Zalo này`,
        },
      });
      return;
    }
    const { serviceId, conversationKey, bsportAccount, vsportAccount } =
      this.state;
    const lookup = this.lookupGuard.begin(
      serviceId,
      conversationKey,
      stream,
      account,
    );
    try {
      this.setState({ loading: true, activeStream: stream, checkResult: null });
      await ipcRenderer.invoke('local-crm:save-backoffice-profile', {
        serviceId,
        conversationKey,
        bsportAccount,
        vsportAccount,
        activeStream: stream,
      });
      const result = (await ipcRenderer.invoke('local-crm:check-bufa', {
        stream,
        account,
        includeDepositHistory: true,
      })) as Omit<CheckResult, 'ok' | 'stream'>;
      if (!this.lookupGuard.isCurrent(lookup)) return;
      this.handleBackofficeStatus(stream, account, {
        phoneBound: Boolean(result.phoneBound),
        bankCardBound: Boolean(result.bankCardBound),
        vipLevel: result.vipLevel || '0',
      });
      this.setState({
        loading: false,
        profileSaved: true,
        checkResult: {
          ok: true,
          stream,
          ...result,
        },
      });
    } catch (error) {
      if (!this.lookupGuard.isCurrent(lookup)) return;
      this.setState({
        loading: false,
        checkResult: { ok: false, stream, message: getErrorMessage(error) },
      });
    }
  };

  private monitorKey(stream: 'BSPORT' | 'VSPORT', account: string) {
    return backofficeMonitorKey({ stream, account });
  }

  private handleBackofficeStatus(
    stream: 'BSPORT' | 'VSPORT',
    account: string,
    current: BackofficeStatus,
  ) {
    const key = this.monitorKey(stream, account);
    const previous = LocalCrmPanel.backofficeSnapshots.get(key);
    const transition = evaluateBackofficeTransition(previous, current);
    LocalCrmPanel.backofficeSnapshots.set(key, {
      ...current,
      completed: transition.completed,
    });

    if (transition.messages.length > 0) {
      new window.Notification(`${stream} · ${account}`, {
        body: transition.messages.join(' · '),
        silent: false,
      });
    }
  }

  private checkBackofficeInBackground = async ({
    stream,
    account,
  }: BackofficeTarget) => {
    try {
      const result = (await ipcRenderer.invoke('local-crm:check-bufa', {
        stream,
        account,
        includeDepositHistory: false,
      })) as Omit<CheckResult, 'ok' | 'stream'>;
      this.handleBackofficeStatus(stream, account, {
        phoneBound: Boolean(result.phoneBound),
        bankCardBound: Boolean(result.bankCardBound),
        vipLevel: result.vipLevel || '0',
      });
      const currentAccount = (
        stream === 'BSPORT'
          ? this.state.bsportAccount
          : this.state.vsportAccount
      ).trim();
      if (
        this.props.service.isActive &&
        this.state.activeStream === stream &&
        currentAccount.toLocaleLowerCase() === account.toLocaleLowerCase()
      ) {
        this.setState({ checkResult: { ok: true, stream, ...result } });
      }
    } catch {
      // A later 15-second cycle retries VIP 0 and temporarily unavailable accounts.
    }
  };

  private refreshOpenedBackofficeAccounts = async () => {
    const { activeStream, bsportAccount, vsportAccount } = this.state;
    const activeAccount = (
      activeStream === 'BSPORT' ? bsportAccount : vsportAccount
    ).trim();
    if (activeAccount) await this.check(activeStream);

    const otherStream = activeStream === 'BSPORT' ? 'VSPORT' : 'BSPORT';
    const otherAccount = (
      otherStream === 'BSPORT' ? bsportAccount : vsportAccount
    ).trim();
    if (otherAccount) {
      await this.checkBackofficeInBackground({
        stream: otherStream,
        account: otherAccount,
      });
    }
  };

  private scanPendingBackofficeAccounts = async () => {
    if (LocalCrmPanel.backgroundScanRunning) return;
    LocalCrmPanel.backgroundScanRunning = true;
    try {
      const profiles = (await ipcRenderer.invoke(
        'local-crm:list-backoffice-profiles',
      )) as BackofficeProfile[];
      const targets = pendingBackofficeTargets(
        profiles,
        LocalCrmPanel.backofficeSnapshots,
      );
      await Promise.allSettled(
        targets.map(target => this.checkBackofficeInBackground(target)),
      );
    } finally {
      LocalCrmPanel.backgroundScanRunning = false;
    }
  };

  selectStream = (stream: 'BSPORT' | 'VSPORT') => {
    this.lookupGuard.invalidate();
    this.setState(
      { activeStream: stream, checkResult: null, loading: false },
      () => {
        void this.saveBackofficeProfile();
        const account =
          stream === 'BSPORT'
            ? this.state.bsportAccount
            : this.state.vsportAccount;
        if (account.trim()) void this.check(stream);
      },
    );
  };

  openDepositHistory = async () => {
    const { activeStream, conversationKey } = this.state;
    const account = (
      activeStream === 'BSPORT'
        ? this.state.bsportAccount
        : this.state.vsportAccount
    ).trim();
    if (!account) return;
    this.setState({
      depositHistoryOpen: true,
      depositHistoryLoading: true,
      depositHistoryError: '',
      depositHistory: null,
    });
    try {
      const history = (await ipcRenderer.invoke('local-crm:get-bufa-deposits', {
        stream: activeStream,
        account,
      })) as DepositHistory;
      if (
        this.state.conversationKey !== conversationKey ||
        this.state.activeStream !== activeStream
      )
        return;
      this.setState({ depositHistory: history, depositHistoryLoading: false });
    } catch (error) {
      if (this.state.conversationKey !== conversationKey) return;
      this.setState({
        depositHistoryError: getErrorMessage(error),
        depositHistoryLoading: false,
      });
    }
  };

  render() {
    const {
      conversationKey,
      name,
      phone,
      email,
      notes,
      tags,
      loading,
      saved,
      profileSaved,
      bsportAccount,
      vsportAccount,
      activeStream,
      checkResult,
      depositHistory,
      depositHistoryError,
      depositHistoryLoading,
      depositHistoryOpen,
    } = this.state;
    const canSave = !loading && Boolean(conversationKey.trim());
    const activeAccount =
      activeStream === 'BSPORT' ? bsportAccount : vsportAccount;
    const resultAvailable = Boolean(checkResult?.ok);
    const customerInitial =
      conversationKey.trim().charAt(0).toUpperCase() || 'Z';
    const phoneStatus = checkResult?.phoneBound
      ? 'SĐT đã liên kết'
      : 'SĐT chưa liên kết';
    const bankStatus = checkResult?.bankCardBound
      ? 'STK đã liên kết'
      : 'STK chưa liên kết';

    return (
      <aside className="local-crm-panel" aria-label="CRM cục bộ">
        <header className="local-crm-panel__app-header">
          <span className="local-crm-panel__brand-mark" aria-hidden="true" />
          <strong>CRM cục bộ</strong>
          <button type="button" aria-label="Tuỳ chọn CRM">
            <span className="local-crm-panel__more-dots" aria-hidden="true" />
          </button>
        </header>
        <section className="local-crm-panel__customer-summary">
          <span className="local-crm-panel__avatar" aria-hidden="true">
            {customerInitial}
            <i />
          </span>
          <span className="local-crm-panel__customer-summary-content">
            <span className="local-crm-panel__display-name-row">
              <input
                className="local-crm-panel__display-name"
                value={displayNameForConversation(name, conversationKey)}
                readOnly
                disabled={!conversationKey}
                aria-label="Tên hiển thị khách hàng"
                placeholder="Chưa chọn cuộc chat"
              />
            </span>
            <small>Cuộc chat hiện tại</small>
          </span>
        </section>
        <h2>Thông tin hậu đài</h2>
        <div className="local-crm-panel__checker">
          <button
            className={activeStream === 'BSPORT' ? 'is-active' : ''}
            type="button"
            onClick={() => this.selectStream('BSPORT')}
            disabled={loading}
          >
            BSPORT
          </button>
          <button
            className={activeStream === 'VSPORT' ? 'is-active' : ''}
            type="button"
            onClick={() => this.selectStream('VSPORT')}
            disabled={loading}
          >
            VSPORT
          </button>
        </div>
        <label className="local-crm-panel__account-label">
          Tài khoản {activeStream}
          <span className="local-crm-panel__account-search">
            <input
              value={activeAccount}
              onChange={this.updateBackofficeAccount(
                activeStream === 'BSPORT' ? 'bsportAccount' : 'vsportAccount',
              )}
              onBlur={() => void this.saveBackofficeProfile()}
              onKeyDown={event => {
                if (event.key === 'Enter') void this.check(activeStream);
              }}
              placeholder={`Nhập tài khoản để kiểm tra trên ${activeStream}`}
            />
            <button
              type="button"
              onClick={() => void this.check(activeStream)}
              disabled={loading || !activeAccount.trim()}
            >
              Tìm
            </button>
          </span>
        </label>
        {profileSaved && (
          <p className="local-crm-panel__saved">
            <span aria-hidden="true" /> Tự lưu theo cuộc chat này
          </p>
        )}
        {loading && <p className="local-crm-panel__status">Đang xử lý...</p>}
        {checkResult && !checkResult.ok ? (
          <div className="local-crm-panel__error" role="alert">
            {checkResult.message}
          </div>
        ) : (
          <div className="local-crm-panel__results">
            <section className="local-crm-panel__card local-crm-panel__overview-card">
              <header>
                <strong title={activeAccount}>{activeAccount}</strong>
                <span className="local-crm-panel__vip">
                  VIP {resultAvailable ? checkResult?.vipLevel || '0' : '—'}
                </span>
              </header>
              <div className="local-crm-panel__binding-row">
                {[phoneStatus, bankStatus].map((status, index) => {
                  const isBound = index
                    ? checkResult?.bankCardBound
                    : checkResult?.phoneBound;
                  return (
                    <button
                      key={status}
                      className={isBound ? 'is-bound' : ''}
                      type="button"
                      onClick={() => void this.check(activeStream)}
                      disabled={loading || !activeAccount.trim()}
                      title="Bấm để cập nhật trạng thái"
                    >
                      <i aria-hidden="true" />
                      {resultAvailable
                        ? status
                        : index
                          ? 'Liên kết STK'
                          : 'Liên kết SĐT'}
                    </button>
                  );
                })}
              </div>
              <button
                className="local-crm-panel__deposit-row"
                type="button"
                onClick={() => void this.openDepositHistory()}
                disabled={loading || !activeAccount.trim()}
                title="Bấm để xem lịch sử tiền nạp"
              >
                <span
                  className="local-crm-panel__metric-icon"
                  aria-hidden="true"
                />
                <span>
                  <small>Số tiền nạp</small>
                  <strong>
                    {resultAvailable
                      ? `${formatBet(checkResult?.depositAmount ?? 0)} đ`
                      : '—'}
                  </strong>
                </span>
              </button>
            </section>
          </div>
        )}
        <details className="local-crm-panel__customer-details" open>
          <summary>Thông tin khách hàng</summary>
          <div className="local-crm-panel__customer-fields">
            <label>
              Tên khách hàng
              <input
                value={name}
                onChange={this.update('name')}
                placeholder="Nhập tên khách"
              />
            </label>
            <label>
              Số điện thoại
              <input
                value={phone}
                onChange={this.update('phone')}
                placeholder="Nhập số điện thoại"
              />
            </label>
            <label>
              Email
              <input
                value={email}
                onChange={this.update('email')}
                placeholder="Nhập email"
              />
            </label>
            <label>
              Tag hội thoại
              <input
                value={tags.join(', ')}
                onChange={this.update('tags')}
                placeholder="Ví dụ: Khách mới, Ưu tiên"
              />
            </label>
            <label>
              Ghi chú nội bộ
              <textarea
                value={notes}
                onChange={this.update('notes')}
                placeholder="Thông tin chỉ lưu trên máy này"
              />
            </label>
            <button
              type="button"
              onClick={() => void this.save()}
              disabled={!canSave}
            >
              Lưu hồ sơ
            </button>
            {saved && (
              <p className="local-crm-panel__saved">Đã lưu trên máy này</p>
            )}
          </div>
        </details>
        {this.props.service.recipe.id === 'zalo' && (
          <ZaloArchiveSection serviceId={this.props.service.id} />
        )}
        {depositHistoryOpen && (
          <section
            className="local-crm-panel__deposit-history"
            aria-label="Lịch sử tiền nạp"
          >
            <header>
              <span>
                <strong>Lịch sử tiền nạp</strong>
                <small>
                  {activeStream} · {activeAccount}
                </small>
              </span>
              <button
                type="button"
                onClick={() => this.setState({ depositHistoryOpen: false })}
                aria-label="Đóng lịch sử tiền nạp"
              >
                <span
                  className="local-crm-panel__close-mark"
                  aria-hidden="true"
                />
              </button>
            </header>
            {depositHistoryLoading && <p>Đang lấy lịch sử tiền nạp...</p>}
            {depositHistoryError && (
              <div className="local-crm-panel__error" role="alert">
                {depositHistoryError}
              </div>
            )}
            {!depositHistoryLoading && !depositHistoryError && (
              <div className="local-crm-panel__deposit-list">
                {depositHistory?.rows.length ? (
                  depositHistory.rows.map((row, index) => (
                    <article
                      key={`${row.provider}-${row.orderNo}-${row.time}-${index}`}
                    >
                      <div>
                        <strong>{formatDepositAmount(row.amount)}</strong>
                        <span
                          className={`is-${
                            String(row.status || '')
                              .toLowerCase()
                              .includes('thành công')
                              ? 'success'
                              : 'pending'
                          }`}
                        >
                          {row.status || 'Chưa rõ'}
                        </span>
                      </div>
                      <span>{row.title || 'Lệnh nạp'}</span>
                      <small>
                        {formatDepositTime(row.time)}
                        {row.provider ? ` · ${row.provider}` : ''}
                      </small>
                      {row.orderNo && <small>Mã: {row.orderNo}</small>}
                    </article>
                  ))
                ) : (
                  <p>Khách hàng chưa có lịch sử tiền nạp.</p>
                )}
              </div>
            )}
          </section>
        )}
      </aside>
    );
  }
}
