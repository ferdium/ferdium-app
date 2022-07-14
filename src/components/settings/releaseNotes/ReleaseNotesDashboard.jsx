import { Component } from 'react';
import { observer } from 'mobx-react';
import { Octokit } from '@octokit/core';
import { defineMessages, injectIntl } from 'react-intl';
import Markdown from 'markdown-to-jsx';
import { ferdiumVersion } from '../../../environment-remote';
import { openExternalUrl } from '../../../helpers/url-helpers';

const debug = require('../../../preload-safe-debug')(
  'Ferdium:ReleaseNotesDashboard',
);

const messages = defineMessages({
  headline: {
    id: 'settings.releasenotes.headline',
    defaultMessage: 'Release Notes',
  },
  connectionError: {
    id: 'settings.releasenotes.connectionError',
    defaultMessage:
      'An error occured when connecting to Github, please try again later.',
  },
});

const ferdiumVersionParse = `v${ferdiumVersion}`;

class ReleaseNotesDashboard extends Component {
  static propTypes = {};

  constructor(props) {
    super(props);

    this.state = { data: '' };
  }

  async componentDidMount() {
    const { intl } = this.props;

    const octokit = new Octokit();
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/releases/tags/{tag}',
      {
        owner: 'ferdium',
        repo: 'ferdium-app',
        tag: ferdiumVersionParse,
      },
    );

    debug('GH Connection Status', response.status);
    if (response.status === 200) {
      const json = await response.data.body;
      this.setState({ data: json });
    } else {
      this.setState({
        data: `## ${intl.formatMessage(messages.connectionError)}`,
      });
    }

    for (const link of document.querySelectorAll('.releasenotes__body a')) {
      link.addEventListener('click', this.handleClick.bind(this), false);
    }
  }

  handleClick(e) {
    e.preventDefault();
    openExternalUrl(e.target.href);
  }

  componentWillUnmount() {
    document.removeEventListener(
      'click',
      // eslint-disable-next-line unicorn/no-invalid-remove-event-listener
      this.handleClick.bind(this),
      false,
    );
  }

  render() {
    const { intl } = this.props;

    const { data } = this.state;
    return (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            Ferdium {ferdiumVersionParse} {' | '}
          </span>
          <span className="settings__header-item__secondary">
            {intl.formatMessage(messages.headline)}
          </span>
        </div>
        <div className="settings__body releasenotes__body">
          <Markdown options={{ wrapper: 'article' }}>{data}</Markdown>
        </div>
      </div>
    );
  }
}

export default injectIntl(observer(ReleaseNotesDashboard));
