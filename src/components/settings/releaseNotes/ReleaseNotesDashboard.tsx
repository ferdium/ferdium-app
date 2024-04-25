import Markdown from 'markdown-to-jsx';
import { observer } from 'mobx-react';
import { Component } from 'react';
import { type IntlShape, defineMessages, injectIntl } from 'react-intl';
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
      'An error occurred when connecting to Github, please try again later.',
  },
  connectionErrorPageMissing: {
    id: 'settings.releasenotes.connectionErrorPageMissing',
    defaultMessage:
      'An error occurred when connecting to Github, the page you are looking for is missing.',
  },
});

interface IProps {
  intl: IntlShape;
}

interface IState {
  data: string;
}

class ReleaseNotesDashboard extends Component<IProps, IState> {
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
  }

  overrideAnchor = props => (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a {...props} target="_blank" rel="noopener noreferrer" />
  );

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
          <Markdown
            options={{
              wrapper: 'article',
              overrides: { a: this.overrideAnchor },
            }}
          >
            {data}
          </Markdown>
        </div>
      </div>
    );
  }
}

export default injectIntl(observer(ReleaseNotesDashboard));
