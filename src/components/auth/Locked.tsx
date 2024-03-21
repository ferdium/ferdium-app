import { systemPreferences } from '@electron/remote';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { isMac } from '../../environment';
import Form from '../../lib/Form';
import Button from '../ui/button';
import { H1 } from '../ui/headline';
import Input from '../ui/input/index';

const messages = defineMessages({
  headline: {
    id: 'locked.headline',
    defaultMessage: 'Locked',
  },
  touchId: {
    id: 'locked.touchId',
    defaultMessage: 'Unlock with Touch ID',
  },
  passwordLabel: {
    id: 'locked.password.label',
    defaultMessage: 'Password',
  },
  submitButtonLabel: {
    id: 'locked.submit.label',
    defaultMessage: 'Unlock',
  },
  unlockWithPassword: {
    id: 'locked.unlockWithPassword',
    defaultMessage: 'Unlock with Password',
  },
  invalidCredentials: {
    id: 'locked.invalidCredentials',
    defaultMessage: 'Password invalid',
  },
});

interface IProps extends WrappedComponentProps {
  onSubmit: (...args: any[]) => void;
  unlock: () => void;
  isSubmitting: boolean;
  useTouchIdToUnlock: boolean;
  error: boolean;
}

@observer
class Locked extends Component<IProps> {
  form: Form;

  constructor(props: IProps) {
    super(props);

    this.form = new Form({
      fields: {
        password: {
          label: this.props.intl.formatMessage(messages.passwordLabel),
          value: '',
          type: 'password',
        },
      },
    });
  }

  submit(e) {
    e.preventDefault();
    this.form.submit({
      onSuccess: form => {
        this.props.onSubmit(form.values());
      },
      onError: noop,
    });
  }

  touchIdUnlock() {
    const { intl } = this.props;

    systemPreferences
      .promptTouchID(intl.formatMessage(messages.touchId))
      .then(() => {
        this.props.unlock();
      });
  }

  render() {
    const { form } = this;
    const { isSubmitting, error, useTouchIdToUnlock, intl } = this.props;

    const touchIdEnabled = isMac
      ? useTouchIdToUnlock && systemPreferences.canPromptTouchID()
      : false;
    const submitButtonLabel = touchIdEnabled
      ? intl.formatMessage(messages.unlockWithPassword)
      : intl.formatMessage(messages.submitButtonLabel);

    return (
      <div className="auth__container">
        <form className="franz-form auth__form" onSubmit={e => this.submit(e)}>
          <img src="./assets/images/logo.svg" className="auth__logo" alt="" />
          <H1>{intl.formatMessage(messages.headline)}</H1>

          {touchIdEnabled && (
            <>
              <Button
                className="auth__button touchid__button"
                label={intl.formatMessage(messages.touchId)}
                onClick={() => this.touchIdUnlock()}
                type="button"
              />
              <hr className="locked__or_line" />
            </>
          )}

          <Input {...form.$('password').bind()} showPasswordToggle focus />
          {error && (
            <p className="error-message center">
              {intl.formatMessage(messages.invalidCredentials)}
            </p>
          )}
          {isSubmitting ? (
            <Button
              className="auth__button is-loading"
              buttonType="secondary"
              label={`${submitButtonLabel} ...`}
              loaded={false}
              onClick={noop}
              disabled
            />
          ) : (
            <Button
              type="submit"
              className="auth__button"
              label={submitButtonLabel}
              onClick={noop}
            />
          )}
        </form>
      </div>
    );
  }
}

export default injectIntl(Locked);
