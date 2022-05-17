import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import injectSheet from 'react-jss';
import { state as ModalState } from './store';

import { H1 } from '../../components/ui/headline';
import { sendAuthRequest } from '../../api/utils/auth';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/input/index';
import Modal from '../../components/ui/Modal';
import { DEBUG_API } from '../../config';
import AppStore from '../../stores/AppStore';
import ServicesStore from '../../stores/ServicesStore';

const debug = require('../../preload-safe-debug')('Ferdium:feature:publishDebugInfo');

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
    defaultMessage: 'Your debug log was published and is now availible at',
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

class PublishDebugLogModal extends Component {
  state = {
    log: null,
    error: false,
    isSendingLog: false,
  };

  // Close this modal
  close() {
    ModalState.isModalVisible = false;
    this.setState({
      log: null,
      error: false,
      isSendingLog: false
    });
  }

  async publishDebugInfo() {
    debug('debugInfo: starting publish');
    this.setState({
      isSendingLog: true,
    });

    const debugInfo = JSON.stringify(this.props.stores.app.debugInfo);

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
        this.setState({
          log: response.id,
        });
      } else {
        this.setState({
          error: true,
        });
      }
    } else {
      this.setState({
        error: true,
      });
    }

    debug('debugInfo: finished publishing');
  }

  render() {
    const { isModalVisible } = ModalState;

    const { classes } = this.props;

    const { log, error, isSendingLog } = this.state;

    const { intl } = this.props;

    return (
      <Modal
        isOpen={isModalVisible}
        shouldCloseOnOverlayClick
        className={`${classes.modal} publish-debug`}
        close={() => this.close()}
      >
        <H1 className={classes.headline}>{intl.formatMessage(messages.title)}</H1>
        {log && (
          <>
            <p className={classes.info}>
              {intl.formatMessage(messages.published)}
            </p>
            <Input
              showLabel={false}
              value={`${DEBUG_API}/${log}`}
              readonly
            />
          </>
        )}

        {error && (
          <p className={classes.info}>{intl.formatMessage(messages.error)}</p>
        )}

        {!log && !error && (
          <>
            <p className={classes.info}>
              {intl.formatMessage(messages.info)}
            </p>

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
              disabled={isSendingLog}
            />
          </>
        )}
      </Modal>
    );
  }
}

PublishDebugLogModal.propTypes = {
  stores: PropTypes.shape({
    app: PropTypes.instanceOf(AppStore).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    service: PropTypes.instanceOf(ServicesStore).isRequired,
  }).isRequired,
  classes: PropTypes.object.isRequired,
};

export default injectIntl(
  injectSheet(styles, { injectTheme: true })(
    inject('stores', 'actions')(observer(PublishDebugLogModal)),
  ),
);
