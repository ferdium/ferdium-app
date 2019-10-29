import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { H1 } from '@meetfranz/ui';
import injectSheet from 'react-jss';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { state as ModalState } from '.';
import AppStore from '../../stores/AppStore';
import { DEBUG_API } from '../../config';
import { sendAuthRequest } from '../../api/utils/auth';

const messages = defineMessages({
  title: {
    id: 'feature.publishDebugInfo.title',
    defaultMessage: '!!!Publish debug information',
  },
  info: {
    id: 'feature.publishDebugInfo.info',
    defaultMessage: '!!!Publishing your debug information helps us find issues and errors in Ferdi. By publishing your debug information you accept Ferdi Debugger\'s privacy policy and terms of service',
  },
  privacy: {
    id: 'feature.publishDebugInfo.privacy',
    defaultMessage: '!!!Privacy policy',
  },
  terms: {
    id: 'feature.publishDebugInfo.terms',
    defaultMessage: '!!!Terms of service',
  },
  publish: {
    id: 'feature.publishDebugInfo.publish',
    defaultMessage: '!!!Accept and publish',
  },
  published: {
    id: 'feature.publishDebugInfo.published',
    defaultMessage: '!!!Your debug log was published and is now availible at',
  },
});

const styles = theme => ({
  info: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  link: {
    color: theme.styleTypes.primary.accent + ' !important',
    padding: 10,
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    marginTop: 10,
    cursor: 'pointer',
  },
  url: {
    marginTop: 20,

    '& > div': {
      fontFamily: 'SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace',
    },
  },
});

export default @injectSheet(styles) @inject('stores') @observer class PublishDebugLogModal extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  static contextTypes = {
    intl: intlShape,
  };

  state = {
    log: null,
    isSendingLog: false,
  }

  // Close this modal
  close() {
    ModalState.isModalVisible = false;
  }

  async publishDebugInfo() {
    this.setState({
      isSendingLog: true,
    })

    const debugInfo = JSON.stringify(this.props.stores.app.debugInfo);
    
    const request = await sendAuthRequest(`${DEBUG_API}/create`, {
      method: 'POST',
      body: JSON.stringify({
        log: debugInfo
      }),
    }, false);
    const response = await request.json();
    console.log(response);
    if (response.id) {
      this.setState({
        log: response.id,
      })
    } else {
      // TODO: Show error message
      this.close();
    }
  }

  render() {
    const { isModalVisible } = ModalState;

    const {
      classes,
    } = this.props;

    const {
      log
    } = this.state;

    const { intl } = this.context;

    return (
      <Modal
        isOpen={isModalVisible}
        shouldCloseOnOverlayClick
        close={this.close.bind(this)}
      >
        <H1>
          {intl.formatMessage(messages.title)}
        </H1>
        { log ? (
          <>
            <p className={classes.info}>{intl.formatMessage(messages.published)}</p>
              <Input
                className={classes.url}
                showLabel={false}
                field={{
                  type: 'url',
                  value: DEBUG_API + '/' + log,
                  disabled: true,
                }}
                readonly
              />
          </>
        ) : (
          <>
            <p className={classes.info}>{intl.formatMessage(messages.info)}</p>

            <a href={ DEBUG_API + '/privacy.html' } target="_blank" className={classes.link}>
              {intl.formatMessage(messages.privacy)}
            </a>
            <a href={ DEBUG_API + '/terms.html' } target="_blank" className={classes.link}>
              {intl.formatMessage(messages.terms)}
            </a>

            <Button
              type="button"
              label={intl.formatMessage(messages.publish)}
              className={classes.button}
              onClick={this.publishDebugInfo.bind(this)}
              disabled={this.state.isSendingLog}
            />
          </>
        ) }
      </Modal>
    );
  }
}

PublishDebugLogModal.wrappedComponent.propTypes = {
  stores: PropTypes.shape({
    app: PropTypes.instanceOf(AppStore).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    service: PropTypes.shape({
      setActive: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};
