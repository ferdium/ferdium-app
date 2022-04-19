import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { observable, reaction } from 'mobx';
import ElectronWebView from 'react-electron-web-view';
import { join } from 'path';

import ServiceModel from '../../../models/Service';

const debug = require('debug')('Ferdium:Services');

class ServiceWebview extends Component {
  static propTypes = {
    service: PropTypes.instanceOf(ServiceModel).isRequired,
    setWebviewReference: PropTypes.func.isRequired,
    detachService: PropTypes.func.isRequired,
    isSpellcheckerEnabled: PropTypes.bool.isRequired,
  };

  @observable webview = null;

  constructor(props) {
    super(props);

    reaction(
      () => this.webview,
      () => {
        if (this.webview && this.webview.view) {
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

  componentWillUnmount() {
    const { service, detachService } = this.props;
    detachService({ service });
  }

  refocusWebview = () => {
    const { webview } = this;
    debug('Refocus Webview is called', this.props.service);
    if (!webview) return;
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

  render() {
    const { service, setWebviewReference, isSpellcheckerEnabled } = this.props;

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
          this.webview = webview;
          if (webview && webview.view) {
            webview.view.addEventListener(
              'did-stop-loading',
              this.refocusWebview,
            );
          }
        }}
        autosize
        src={service.url}
        preload={preloadScript}
        partition={service.partition}
        onDidAttach={() => {
          setWebviewReference({
            serviceId: service.id,
            webview: this.webview.view,
          });
        }}
        onUpdateTargetUrl={this.updateTargetUrl}
        useragent={service.userAgent}
        disablewebsecurity={
          service.recipe.disablewebsecurity ? true : undefined
        }
        allowpopups
        nodeintegration
        webpreferences={`spellcheck=${
          isSpellcheckerEnabled ? 1 : 0
        }, contextIsolation=1, nativeWindowOpen=1`}
      />
    );
  }
}

export default observer(ServiceWebview);
