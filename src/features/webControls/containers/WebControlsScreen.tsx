import { Component, ReactElement } from 'react';
import { observer, inject } from 'mobx-react';
import {
  autorun,
  action,
  makeObservable,
  observable,
  IReactionDisposer,
} from 'mobx';
import ElectronWebView from 'react-electron-web-view';
import WebControls from '../components/WebControls';
import Service from '../../../models/Service';
import { SEARCH_ENGINE_URLS } from '../../../config';
import { StoresProps } from '../../../@types/ferdium-components.types';

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

  autorunDisposer: IReactionDisposer | null = null;

  constructor(props) {
    super(props);

    makeObservable(this);
  }

  componentDidMount(): void {
    const { service } = this.props;

    this.autorunDisposer = autorun(() => {
      if (service.isAttached) {
        this.webview = service.webview;
        this._setUrl(this.webview.getURL());

        for (const event of URL_EVENTS) {
          this.webview.addEventListener(event, e => {
            if (!e.isMainFrame) {
              return;
            }
            this._setUrlAndHistory(e.url);
          });
        }
      }
    });
  }

  componentWillUnmount(): void {
    if (this.autorunDisposer) {
      this.autorunDisposer();
    }
  }

  @action
  _setUrl(value): void {
    this.url = value;
  }

  @action
  _setUrlAndHistory(value): void {
    this._setUrl(value);
    this.canGoBack = this.webview.canGoBack();
    this.canGoForward = this.webview.canGoForward();
  }

  goHome(): void {
    if (!this.webview) {
      return;
    }
    this.webview.goToIndex(0);
  }

  reload(): void {
    if (!this.webview) {
      return;
    }

    this.webview.reload();
  }

  goBack(): void {
    if (!this.webview) {
      return;
    }

    this.webview.goBack();
  }

  goForward(): void {
    if (!this.webview) {
      return;
    }

    this.webview.goForward();
  }

  navigate(url: string): void {
    if (!this.webview) {
      return;
    }

    try {
      url = new URL(url).toString();
    } catch {
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
  }

  openInBrowser(): void {
    const { openExternalUrl } = this.props.actions!.app;
    if (!this.webview) {
      return;
    }

    openExternalUrl({ url: this.url });
  }

  render(): ReactElement {
    return (
      <WebControls
        goHome={() => this.goHome()}
        reload={() => this.reload()}
        openInBrowser={() => this.openInBrowser()}
        canGoBack={this.canGoBack}
        goBack={() => this.goBack()}
        canGoForward={this.canGoForward}
        goForward={() => this.goForward()}
        navigate={url => this.navigate(url)}
        url={this.url}
      />
    );
  }
}

export default WebControlsScreen;
