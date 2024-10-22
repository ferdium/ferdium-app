import { join } from 'node:path';
import { action, makeObservable, observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import ElectronWebView from 'react-electron-web-view';
import type ServiceModel from '../../../models/Service';
import type { RealStores } from '../../../stores';

const debug = require('../../../preload-safe-debug')('Ferdium:Services');

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

  constructor(props: IProps) {
    super(props);

    this.refocusWebview = this.refocusWebview.bind(this);
    this._setWebview = this._setWebview.bind(this);

    makeObservable(this);

    reaction(
      () => this.webview,
      () => {
        if (this.webview?.view) {
          this.webview.view.addEventListener('console-message', e => {
            debug('Service logged a message:', e.message);
          });
          this.webview.view.addEventListener('did-navigate', () => {
            if (this.props.service._webview) {
              document.title = `Ferdium - ${this.props.service.name} ${
                this.props.service.dialogTitle
                  ? ` - ${this.props.service.dialogTitle}`
                  : ''
              } ${`- ${this.props.service._webview.getTitle()}`}`;
            }
          });
        }
      },
    );
  }

  componentWillUnmount(): void {
    const { service, detachService } = this.props;
    detachService({ service });
  }

  refocusWebview(): void {
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
  }

  @action _setWebview(webview): void {
    this.webview = webview;
  }

  render(): ReactElement {
    const { service, setWebviewReference, isSpellcheckerEnabled, stores } =
      this.props;

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
        ref={webview => {
          this._setWebview(webview);
          if (webview?.view) {
            webview.view.addEventListener(
              'did-stop-loading',
              this.refocusWebview,
            );
          }
        }}
        autosize
        src={service.url}
        preload={preloadScript}
        partition={
          sandboxServices ? checkForSandbox() : 'persist:general-session'
        }
        onDidAttach={() => {
          // Force the event handler to run in a new task.
          // This resolves a race condition when the `did-attach` is called,
          // but the webview is not attached to the DOM yet:
          // https://github.com/electron/electron/issues/31918
          // This prevents us from immediately attaching listeners such as `did-stop-load`:
          // https://github.com/ferdium/ferdium-app/issues/157
          setTimeout(() => {
            setWebviewReference({
              serviceId: service.id,
              webview: this.webview.view,
            });
          }, 0);
        }}
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
