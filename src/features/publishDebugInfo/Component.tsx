import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import type { StoresProps } from '../../@types/ferdium-components.types';
import { sendAuthRequest } from '../../api/utils/auth';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/button';
import { H1 } from '../../components/ui/headline';
import Input from '../../components/ui/input/index';
import { DEBUG_API } from '../../config';
import { state as ModalState } from './store';

const debug = require('../../preload-safe-debug')(
  'Ferdium:feature:publishDebugInfo',
);

const messages = defineMessages({
  title: {
    id: 'feature.publishDebugInfo.title',
    defaultMessage: 'Publish debug information',
  },
  info: {
    id: 'feature.publishDebugInfo.info',
    defaultMessage:
      "Publishing your debug information helps us find issues and errors in Ferdium. By publishing your debug information you accept Ferdium Debugger's privacy policy and terms of service",
  },
  error: {
    id: 'feature.publishDebugInfo.error',
    defaultMessage:
      'There was an error while trying to publish the debug information. Please try again later or view the console for more information.',
  },
  privacy: {
    id: 'feature.publishDebugInfo.privacy',
    defaultMessage: 'Privacy policy',
  },
  terms: {
    id: 'feature.publishDebugInfo.terms',
    defaultMessage: 'Terms of service',
  },
  publish: {
    id: 'feature.publishDebugInfo.publish',
    defaultMessage: 'Accept and publish',
  },
  published: {
    id: 'feature.publishDebugInfo.published',
    defaultMessage: 'Your debug log was published and is now available at',
  },
});

const styles = theme => ({
  modal: {
    width: '80%',
    maxWidth: 600,
    background: theme.styleTypes.primary.contrast,
    paddingTop: 30,
  },
  headline: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: -27,
  },
  info: {
    paddingBottom: 20,
  },
  link: {
    color: `${theme.styleTypes.primary.accent} !important`,
    padding: 10,
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    marginTop: 10,
    cursor: 'pointer',
  },
});

interface IProps
  extends Partial<StoresProps>,
    WithStylesProps<typeof styles>,
    WrappedComponentProps {}

interface IState {
  log: null;
  error: boolean;
  isSendingLogs: boolean;
}

@inject('stores', 'actions')
@observer
class PublishDebugLogModal extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      log: null,
      error: false,
      isSendingLogs: false,
    };
  }

  // Close this modal
  close(): void {
    ModalState.isModalVisible = false;
    this.setState({
      log: null,
      error: false,
      isSendingLogs: false,
    });
  }

  async publishDebugInfo(): Promise<void> {
    debug('debugInfo: starting publish');
    this.setState({
      isSendingLogs: true,
    });

    const debugInfo = JSON.stringify(this.props.stores?.app?.debugInfo);

    const request = await sendAuthRequest(
      `${DEBUG_API}/create`,
      {
        method: 'POST',
        body: JSON.stringify({
          log: debugInfo,
        }),
      },
      false,
    );

    debug(`debugInfo: publishing status: ${request.status}`);
    if (request.status === 200) {
      const response = await request.json();
      if (response.id) {
        this.setState({ log: response.id });
      } else {
        this.setState({ error: true });
      }
    } else {
      this.setState({ error: true });
    }

    debug('debugInfo: finished publishing');
  }

  render(): ReactElement {
    const { isModalVisible } = ModalState;
    const { classes, intl } = this.props;
    const { log, error, isSendingLogs } = this.state;

    return (
      <Modal
        isOpen={isModalVisible}
        shouldCloseOnOverlayClick
        className={`${classes.modal} publish-debug`}
        close={() => this.close()}
      >
        <H1 className={classes.headline}>
          {intl.formatMessage(messages.title)}
        </H1>
        {log && (
          <>
            <p className={classes.info}>
              {intl.formatMessage(messages.published)}
            </p>
            <Input showLabel={false} value={`${DEBUG_API}/${log}`} readOnly />
          </>
        )}
        {error && (
          <p className={classes.info}>{intl.formatMessage(messages.error)}</p>
        )}
        {!log && !error && (
          <>
            <p className={classes.info}>{intl.formatMessage(messages.info)}</p>
            <a
              href={`${DEBUG_API}/privacy.html`}
              target="_blank"
              className={classes.link}
              rel="noreferrer"
            >
              {intl.formatMessage(messages.privacy)}
            </a>
            <a
              href={`${DEBUG_API}/terms.html`}
              target="_blank"
              className={classes.link}
              rel="noreferrer"
            >
              {intl.formatMessage(messages.terms)}
            </a>
            <Button
              type="button"
              label={intl.formatMessage(messages.publish)}
              className={classes.button}
              onClick={() => this.publishDebugInfo()}
              disabled={isSendingLogs}
            />
          </>
        )}
      </Modal>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(PublishDebugLogModal),
);
