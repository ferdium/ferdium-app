import { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Octokit } from '@octokit/core';
import { defineMessages, injectIntl } from 'react-intl';
import Markdown from 'markdown-to-jsx';
import { mdiArrowLeftCircle } from '@mdi/js';
import { openExternalUrl } from '../../helpers/url-helpers';
import Icon from '../../components/ui/icon';
import { ferdiumVersion } from '../../environment-remote';
import { getFerdiumVersion } from '../../helpers/update-helpers'

const debug = require('../../preload-safe-debug')(
  'Ferdium:AuthReleaseNotesDashboard',
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
  connectionErrorPageMissing: {
    id: 'settings.releasenotes.connectionErrorPageMissing',
    defaultMessage:
      'An error occured when connecting to Github, the page you are looking for is missing.',
  },
});

class AuthReleaseNotesScreen extends Component {
  static propTypes = {};

  constructor(props) {
    super(props);

    this.state = { data: '' };
  }

  async componentDidMount() {
    const { intl } = this.props;

    const octokit = new Octokit();
    try {
      const response = await octokit.request(
        'GET /repos/{owner}/{repo}/releases/tags/{tag}',
        {
          owner: 'ferdium',
          repo: 'ferdium-app',
          tag: getFerdiumVersion(window.location.href, ferdiumVersion),
        },
      );

      debug('GH Connection Status', response.status);
      if (response.status === 200) {
        const json = await response.data.body;
        this.setState({ data: json });
      } else {
        this.setState({
          data: `### ${intl.formatMessage(messages.connectionError)}`,
        });
      }

      for (const link of document.querySelectorAll('.releasenotes__body a')) {
        link.addEventListener('click', this.handleClick.bind(this), false);
      }
    } catch (error) {
      debug('GH Connection Error Status', error);
      this.setState({
        data: `### ${intl.formatMessage(messages.connectionErrorPageMissing)}`,
      });
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
      <div className="auth__container auth__container--releasenotes">
        <div className="auth__main--releasenotes">
          <div className="auth__header">
            <span className="auth__header-item">
              Ferdium {getFerdiumVersion(window.location.href, ferdiumVersion)} {' | '}
            </span>
            <span className="auth__header-item__secondary">
              {intl.formatMessage(messages.headline)}
            </span>
          </div>
          <div className="auth__body releasenotes__body">
            <Markdown options={{ wrapper: 'article' }}>{data}</Markdown>
          </div>
          <div className="auth__help">
            <button
              type="button"
              onClick={() => {
                // For some reason <Link> doesn't work here. So we hard code the path to take us to the Welcome Screen
                window.location.href = '#/auth/welcome';
              }}
            >
              <Icon icon={mdiArrowLeftCircle} size={1.5} />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(
  inject('stores', 'actions')(observer(AuthReleaseNotesScreen)),
);
