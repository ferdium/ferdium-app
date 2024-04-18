import { inject, observer } from 'mobx-react';
import { Component } from 'react';

import { mdiArrowLeftCircle } from '@mdi/js';
import Markdown from 'markdown-to-jsx';
import { type IntlShape, defineMessages, injectIntl } from 'react-intl';
import Icon from '../../components/ui/icon';
import { ferdiumVersion } from '../../environment-remote';
import {
  getFerdiumVersion,
  getUpdateInfoFromGH,
} from '../../helpers/update-helpers';
import { openExternalUrl } from '../../helpers/url-helpers';

const messages = defineMessages({
  headline: {
    id: 'settings.releasenotes.headline',
    defaultMessage: 'Release Notes',
  },
});

interface IProps {
  intl: IntlShape;
}

interface IState {
  data: string;
}

class AuthReleaseNotesScreen extends Component<IProps, IState> {
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

    // eslint-disable-next-line @eslint-react/no-set-state-in-component-did-mount
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
      <div className="auth__container auth__container--releasenotes">
        <div className="auth__main--releasenotes">
          <div className="auth__header">
            <span className="auth__header-item">
              Ferdium {getFerdiumVersion(window.location.href, ferdiumVersion)}{' '}
              {' | '}
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

export default injectIntl<'intl', IProps>(
  inject('stores', 'actions')(observer(AuthReleaseNotesScreen)),
);
