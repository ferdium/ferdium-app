import { Component, FormEvent, ReactElement } from 'react';
import injectSheet, { WithStylesProps } from 'react-jss';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import classnames from 'classnames';
import { noop } from 'lodash';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/input/index';
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

interface IProps
  extends WithStylesProps<typeof styles>,
    WrappedComponentProps {}

@observer
class BasicAuthModal extends Component<IProps> {
  submit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const values = Form.values();
    sendCredentials(values.user, values.password);
    resetState();
  }

  cancel(): void {
    cancelLogin();
    this.close();
  }

  close(): void {
    resetState();
    state.isModalVisible = false;
  }

  render(): ReactElement | null {
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
          <Input {...Form.$('user').bind()} showLabel={false} />
          <Input
            {...Form.$('password').bind()}
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
            <Button
              type="submit"
              label={intl.formatMessage(messages.signIn)}
              onClick={noop}
            />
          </div>
        </form>
      </Modal>
    );
  }
}
export default injectIntl(
  injectSheet(styles, { injectTheme: true })(BasicAuthModal),
);
