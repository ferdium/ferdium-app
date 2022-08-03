import { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';

import { autorun, action, makeObservable, observable } from 'mobx';
import WebControls from '../components/WebControls';
import ServicesStore from '../../../stores/ServicesStore';
import Service from '../../../models/Service';
import { SEARCH_ENGINE_URLS } from '../../../config';
import AppStore from '../../../stores/AppStore';

const URL_EVENTS = [
  'load-commit',
  'will-navigate',
  'did-navigate',
  'did-navigate-in-page',
];

class WebControlsScreen extends Component {
  @observable url = '';

  @observable canGoBack = false;

  @observable canGoForward = false;

  webview = null;

  autorunDisposer = null;

  @action _setUrl(value) {
    this.url = value;
  }

  @action _setUrlAndHistory(value) {
    this._setUrl(value);
    this.canGoBack = this.webview.canGoBack();
    this.canGoForward = this.webview.canGoForward();
  }

  constructor(props) {
    super(props);

    makeObservable(this);
  }

  componentDidMount() {
    const { service } = this.props;

    this.autorunDisposer = autorun(() => {
      if (service.isAttached) {
        this.webview = service.webview;
        this._setUrl(this.webview.getURL());

        for (const event of URL_EVENTS) {
          this.webview.addEventListener(event, e => {
            if (!e.isMainFrame) return;

            this._setUrlAndHistory(e.url);
          });
        }
      }
    });
  }

  componentWillUnmount() {
    this.autorunDisposer();
  }

  goHome() {
    if (!this.webview) return;
    this.webview.goToIndex(0);
  }

  reload() {
    if (!this.webview) return;

    this.webview.reload();
  }

  goBack() {
    if (!this.webview) return;

    this.webview.goBack();
  }

  goForward() {
    if (!this.webview) return;

    this.webview.goForward();
  }

  navigate(newUrl) {
    if (!this.webview) return;

    let url = newUrl;

    try {
      url = new URL(url).toString();
    } catch {
      url =
        // eslint-disable-next-line no-useless-escape
        /^((?!-))(xn--)?[\da-z][\d_a-z-]{0,61}[\da-z]{0,1}\.(xn--)?([\da-z\-]{1,61}|[\da-z-]{1,30}\.[a-z]{2,})$/.test(
          url,
        )
          ? `http://${url}`
          : SEARCH_ENGINE_URLS[this.settings.app.searchEngine]({
              searchTerm: url,
            });
    }

    this.webview.loadURL(url);
    this._setUrl(url);
  }

  openInBrowser() {
    const { openExternalUrl } = this.props.actions.app;

    if (!this.webview) return;

    openExternalUrl({ url: this.url });
  }

  render() {
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

export default inject('stores', 'actions')(observer(WebControlsScreen));

WebControlsScreen.propTypes = {
  service: PropTypes.instanceOf(Service).isRequired,
  stores: PropTypes.shape({
    services: PropTypes.instanceOf(ServicesStore).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    app: PropTypes.instanceOf(AppStore).isRequired,
    service: PropTypes.instanceOf(ServicesStore).isRequired,
  }).isRequired,
};
