import classnames from 'classnames';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component, type FormEvent, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import injectSheet, { type WithStylesProps } from 'react-jss';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/button';
import { H1 } from '../../components/ui/headline';
import Input from '../../components/ui/input/index';
import globalMessages from '../../i18n/globalMessages';
import Form from './Form';
import { cancelLogin, resetState, sendCredentials, state } from './store';
import styles from './styles';

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
        // eslint-disable-next-line react/jsx-no-bind
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
              // eslint-disable-next-line react/jsx-no-bind
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
