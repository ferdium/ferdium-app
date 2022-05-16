import { Component } from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import classnames from 'classnames';

import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/button';

import { state, resetState, sendCredentials, cancelLogin } from './store';
import Form from './Form';

import styles from './styles';
import globalMessages from '../../i18n/globalMessages';
import { H1 } from '../../components/ui/headline';

const messages = defineMessages({
  signIn: {
    id: 'feature.basicAuth.signIn',
    defaultMessage: 'Sign In',
  },
});

class BasicAuthModal extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  submit(e) {
    e.preventDefault();

    const values = Form.values();

    sendCredentials(values.user, values.password);
    resetState();
  }

  cancel() {
    cancelLogin();
    this.close();
  }

  close() {
    resetState();
    state.isModalVisible = false;
  }

  render() {
    const { classes } = this.props;

    const { isModalVisible, authInfo } = state;

    if (!authInfo) {
      return null;
    }

    const { intl } = this.props;

    return (
      <Modal
        isOpen={isModalVisible}
        className={classes.modal}
        close={this.cancel.bind(this)}
        showClose={false}
      >
        <H1>{intl.formatMessage(messages.signIn)}</H1>
        <p>
          http
          {authInfo.port === 443 && 's'}
          ://
          {authInfo.host}
        </p>
        <form
          onSubmit={this.submit.bind(this)}
          className={classnames('franz-form', classes.form)}
        >
          <Input field={Form.$('user')} showLabel={false} />
          <Input
            field={Form.$('password')}
            showLabel={false}
            showPasswordToggle
          />
          <div className={classes.buttons}>
            <Button
              type="button"
              label={intl.formatMessage(globalMessages.cancel)}
              buttonType="secondary"
              onClick={this.cancel.bind(this)}
            />
            <Button type="submit" label={intl.formatMessage(messages.signIn)} />
          </div>
        </form>
      </Modal>
    );
  }
}
export default injectIntl(
  injectSheet(styles, { injectTheme: true })(observer(BasicAuthModal)),
);
