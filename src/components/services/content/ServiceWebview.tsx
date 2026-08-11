import { join } from 'node:path';
import {
  type IReactionDisposer,
  action,
  makeObservable,
  observable,
  reaction,
} from 'mobx';
import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import ElectronWebView from 'react-electron-web-view';
import type ServiceModel from '../../../models/Service';
import type { RealStores } from '../../../stores';

const debug = require('../../../preload-safe-debug')('Ferdium:Services');

type WebviewElement = ElectronWebView['view'];

interface IProps {
  service: ServiceModel;
  setWebviewReference: (options: {
    serviceId: string;
    webview: ElectronWebView | null;
  }) => void;
  detachService: (options: { service: ServiceModel }) => void;
  isSpellcheckerEnabled: boolean;
  stores?: RealStores;
}

@observer
class ServiceWebview extends Component<IProps> {
  @observable webview: ElectronWebView | null = null;

  private webviewReactionDisposer: IReactionDisposer;

  private didAttachTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: IProps) {
    super(props);

    this._setWebview = this._setWebview.bind(this);

    makeObservable(this);

    this.webviewReactionDisposer = reaction(
      () => this.webview?.view ?? null,
      (webview, previousWebview) => {
        this.removeWebviewEventListeners(previousWebview);
        this.addWebviewEventListeners(webview);
      },
    );
  }

  componentWillUnmount(): void {
    const { service, detachService } = this.props;
    this.webviewReactionDisposer();
    this.removeWebviewEventListeners(this.webview?.view ?? null);
    if (this.didAttachTimeout) {
      clearTimeout(this.didAttachTimeout);
      this.didAttachTimeout = null;
    }
    detachService({ service });
  }

  handleConsoleMessage = (e): void => {
    debug('Service logged a message:', e.message);
  };

  handleDidNavigate = (): void => {
    if (this.props.service._webview) {
      document.title = `Ferdium - ${this.props.service.name} ${
        this.props.service.dialogTitle
          ? ` - ${this.props.service.dialogTitle}`
          : ''
      } ${`- ${this.props.service._webview.getTitle()}`}`;
    }
  };

  handleWebviewRef = (webview: ElectronWebView | null): void => {
    this._setWebview(webview);
  };

  handleDidAttach = (): void => {
    const { service, setWebviewReference } = this.props;

    // Force the event handler to run in a new task.
    // This resolves a race condition when the `did-attach` is called,
    // but the webview is not attached to the DOM yet:
    // https://github.com/electron/electron/issues/31918
    // This prevents us from immediately attaching listeners such as `did-stop-load`:
    // https://github.com/ferdium/ferdium-app/issues/157
    this.didAttachTimeout = setTimeout(() => {
      setWebviewReference({
        serviceId: service.id,
        webview: this.webview?.view ?? null,
      });
      this.didAttachTimeout = null;
    }, 0);
  };

  refocusWebview = (): void => {
    const { webview } = this;
    debug('Refocus Webview is called', this.props.service);
    if (!webview) {
      return;
    }

    if (this.props.service.isActive) {
      webview.view.blur();
      webview.view.focus();
      window.setTimeout(() => {
        document.title = `Ferdium - ${this.props.service.name} ${
          this.props.service.dialogTitle
            ? ` - ${this.props.service.dialogTitle}`
            : ''
        } ${`- ${this.props.service._webview.getTitle()}`}`;
      }, 100);
    } else {
      debug('Refocus not required - Not active service');
    }
  };

  addWebviewEventListeners(webview: WebviewElement | null): void {
    if (!webview) {
      return;
    }

    webview.addEventListener('console-message', this.handleConsoleMessage);
    webview.addEventListener('did-navigate', this.handleDidNavigate);
    webview.addEventListener('did-stop-loading', this.refocusWebview);
  }

  removeWebviewEventListeners(webview: WebviewElement | null): void {
    if (!webview) {
      return;
    }

    webview.removeEventListener('console-message', this.handleConsoleMessage);
    webview.removeEventListener('did-navigate', this.handleDidNavigate);
    webview.removeEventListener('did-stop-loading', this.refocusWebview);
  }

  @action _setWebview(webview: ElectronWebView | null): void {
    this.webview = webview;
  }

  render(): ReactElement {
    const { service, isSpellcheckerEnabled, stores } = this.props;

    const { sandboxServices } = stores!.settings.app;

    const { sandboxServices: sandboxes } = stores!.app;

    const checkForSandbox = () => {
      const sandbox = sandboxes.find(s => s.services.includes(service.id));

      if (sandbox) {
        return `persist:sandbox-${sandbox.id}`;
      }

      return service.partition;
    };

    const preloadScript = join(
      __dirname,
      '..',
      '..',
      '..',
      'webview',
      'recipe.js',
    );

    return (
      <ElectronWebView
        ref={this.handleWebviewRef}
        autosize
        src={service.url}
        preload={preloadScript}
        partition={
          sandboxServices ? checkForSandbox() : 'persist:general-session'
        }
        onDidAttach={this.handleDidAttach}
        // onUpdateTargetUrl={this.updateTargetUrl} // TODO: [TS DEBT] need to check where its from
        useragent={service.userAgent}
        disablewebsecurity={
          service.recipe.disablewebsecurity ? true : undefined
        }
        allowpopups
        nodeintegration
        webpreferences={`spellcheck=${
          isSpellcheckerEnabled ? 1 : 0
        }, contextIsolation=1`}
      />
    );
  }
}

export default ServiceWebview;
