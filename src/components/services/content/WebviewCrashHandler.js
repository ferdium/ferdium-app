import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import ms from 'ms';

import Button from '../../ui/Button';
import { H1 } from '../../ui/headline';

const messages = defineMessages({
  headline: {
    id: 'service.crashHandler.headline',
    defaultMessage: 'Oh no!',
  },
  text: {
    id: 'service.crashHandler.text',
    defaultMessage: '{name} has caused an error.',
  },
  action: {
    id: 'service.crashHandler.action',
    defaultMessage: 'Reload {name}',
  },
  autoReload: {
    id: 'service.crashHandler.autoReload',
    defaultMessage:
      'Trying to automatically restore {name} in {seconds} seconds',
  },
});

class WebviewCrashHandler extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    reload: PropTypes.func.isRequired,
  };

  state = {
    countdown: ms('10s'),
  };

  countdownInterval = null;

  countdownIntervalTimeout = ms('1s');

  componentDidMount() {
    const { reload } = this.props;

    this.countdownInterval = setInterval(() => {
      this.setState(prevState => ({
        countdown: prevState.countdown - this.countdownIntervalTimeout,
      }));

      if (this.state.countdown <= 0) {
        reload();
        clearInterval(this.countdownInterval);
      }
    }, this.countdownIntervalTimeout);
  }

  render() {
    const { name, reload } = this.props;
    const { intl } = this.props;

    return (
      <div className="services__info-layer">
        <H1>{intl.formatMessage(messages.headline)}</H1>
        <p>{intl.formatMessage(messages.text, { name })}</p>
        <Button
          // label={`Reload ${name}`}
          label={intl.formatMessage(messages.action, { name })}
          buttonType="inverted"
          onClick={() => reload()}
        />
        <p className="footnote">
          {intl.formatMessage(messages.autoReload, {
            name,
            seconds: this.state.countdown / ms('1s'),
          })}
        </p>
      </div>
    );
  }
}

export default injectIntl(observer(WebviewCrashHandler));
