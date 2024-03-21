import { observer } from 'mobx-react';
import ms from 'ms';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import Button from '../../ui/button';
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

interface IProps extends WrappedComponentProps {
  name: string;
  reload: () => void;
}

interface IState {
  countdown: number;
}

@observer
class WebviewCrashHandler extends Component<IProps, IState> {
  countdownInterval: NodeJS.Timeout | undefined;

  countdownIntervalTimeout = ms('1s');

  constructor(props: IProps) {
    super(props);

    this.state = {
      countdown: ms('10s'),
    };
  }

  componentDidMount(): void {
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

  render(): ReactElement {
    const { name, reload, intl } = this.props;

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

export default injectIntl(WebviewCrashHandler);
