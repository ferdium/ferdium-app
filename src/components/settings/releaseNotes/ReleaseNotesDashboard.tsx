import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import Markdown from 'markdown-to-jsx';
import { openExternalUrl } from '../../../helpers/url-helpers';
import { ferdiumVersion } from '../../../environment-remote';
import {
  getFerdiumVersion,
  getUpdateInfoFromGH,
} from '../../../helpers/update-helpers';

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

interface IProps {
  intl: any;
}

class ReleaseNotesDashboard extends Component<IProps> {
  static propTypes = {};

  state = {
    data: '',
  };

  constructor(props) {
    super(props);

    this.state = { data: '' };
  }

  async componentDidMount() {
    const { intl } = this.props;

    const data = await getUpdateInfoFromGH(
      window.location.href,
      ferdiumVersion,
      intl,
    );

    this.setState({
      data,
    });

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
            Ferdium {getFerdiumVersion(window.location.href, ferdiumVersion)}{' '}
            {' | '}
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
