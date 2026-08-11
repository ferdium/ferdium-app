import {
  type IReactionDisposer,
  action,
  makeObservable,
  observable,
  reaction,
} from 'mobx';
import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import type ElectronWebView from 'react-electron-web-view';
import type { StoresProps } from '../../../@types/ferdium-components.types';
import { SEARCH_ENGINE_URLS } from '../../../config';
import type Service from '../../../models/Service';
import WebControls from '../components/WebControls';

const URL_EVENTS = [
  'load-commit',
  'will-navigate',
  'did-navigate',
  'did-navigate-in-page',
];

interface IProps extends Partial<StoresProps> {
  service: Service;
}

@inject('stores', 'actions')
@observer
class WebControlsScreen extends Component<IProps> {
  @observable url = '';

  @observable canGoBack = false;

  @observable canGoForward = false;

  webview: ElectronWebView | null = null;

  webviewReactionDisposer: IReactionDisposer | null = null;

  constructor(props: IProps) {
    super(props);

    makeObservable(this);
  }

  componentDidMount(): void {
    const { service } = this.props;

    this.webviewReactionDisposer = reaction(
      () => (service.isAttached ? service.webview : null),
      webview => this.setWebview(webview),
      { fireImmediately: true },
    );
  }

  componentWillUnmount(): void {
    if (this.webviewReactionDisposer) {
      this.webviewReactionDisposer();
    }

    this.setWebview(null);
  }

  addWebviewEventListeners(webview: ElectronWebView): void {
    for (const event of URL_EVENTS) {
      webview.addEventListener(event, this.handleWebviewEvent);
    }
  }

  removeWebviewEventListeners(webview: ElectronWebView | null): void {
    if (!webview) {
      return;
    }

    for (const event of URL_EVENTS) {
      webview.removeEventListener(event, this.handleWebviewEvent);
    }
  }

  setWebview(webview: ElectronWebView | null): void {
    if (this.webview === webview) {
      return;
    }

    this.removeWebviewEventListeners(this.webview);
    this.webview = webview;

    if (!webview) {
      return;
    }

    this._setUrlAndHistory(webview.getURL());
    this.addWebviewEventListeners(webview);
  }

  handleWebviewEvent = (e: any): void => {
    if (!e.isMainFrame) {
      return;
    }
    this._setUrlAndHistory(e.url);
  };

  @action
  _setUrl(value): void {
    this.url = value;
  }

  @action
  _setUrlAndHistory(value): void {
    this._setUrl(value);
    if (!this.webview) {
      this.canGoBack = false;
      this.canGoForward = false;
      return;
    }
    this.canGoBack = this.webview.canGoBack();
    this.canGoForward = this.webview.canGoForward();
  }

  goHome = (): void => {
    if (!this.webview) {
      return;
    }
    this.webview.goToIndex(0);
  };

  reload = (): void => {
    if (!this.webview) {
      return;
    }

    this.webview.reload();
  };

  goBack = (): void => {
    if (!this.webview) {
      return;
    }

    this.webview.goBack();
  };

  goForward = (): void => {
    if (!this.webview) {
      return;
    }

    this.webview.goForward();
  };

  navigate = (url: string): void => {
    if (!this.webview) {
      return;
    }

    try {
      // eslint-disable-next-line no-param-reassign
      url = new URL(url).toString();
    } catch {
      // eslint-disable-next-line no-param-reassign
      url =
        /^((?!-))(xn--)?[\da-z][\d_a-z-]{0,61}[\da-z]{0,1}\.(xn--)?([\da-z-]{1,61}|[\da-z-]{1,30}\.[a-z]{2,})$/.test(
          url,
        )
          ? `http://${url}`
          : SEARCH_ENGINE_URLS[this.props.stores!.settings.app.searchEngine]({
              searchTerm: url,
            });
    }

    this.webview.loadURL(url);
    this._setUrl(url);
  };

  openInBrowser = (): void => {
    const { openExternalUrl } = this.props.actions!.app;
    if (!this.webview) {
      return;
    }

    openExternalUrl({ url: this.url });
  };

  render(): ReactElement {
    return (
      <WebControls
        goHome={this.goHome}
        reload={this.reload}
        openInBrowser={this.openInBrowser}
        canGoBack={this.canGoBack}
        goBack={this.goBack}
        canGoForward={this.canGoForward}
        goForward={this.goForward}
        navigate={this.navigate}
        url={this.url}
      />
    );
  }
}

export default WebControlsScreen;
