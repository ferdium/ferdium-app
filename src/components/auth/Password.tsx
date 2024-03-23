import { observer } from 'mobx-react';
import { Component, type FormEvent } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';

import { noop } from 'lodash';
import { email, required } from '../../helpers/validation-helpers';
import globalMessages from '../../i18n/globalMessages';
import Form from '../../lib/Form';
import Infobox from '../ui/Infobox';
import Link from '../ui/Link';
import Button from '../ui/button';
import { H1 } from '../ui/headline';
import Input from '../ui/input/index';

const messages = defineMessages({
  headline: {
    id: 'password.headline',
    defaultMessage: 'Reset password',
  },
  emailLabel: {
    id: 'password.email.label',
    defaultMessage: 'Email address',
  },
  successInfo: {
    id: 'password.successInfo',
    defaultMessage: 'Your new password was sent to your email address',
  },
  noUser: {
    id: 'password.noUser',
    defaultMessage: 'No user with that email address was found',
  },
  signupLink: {
    id: 'password.link.signup',
    defaultMessage: 'Create a free account',
  },
  loginLink: {
    id: 'password.link.login',
    defaultMessage: 'Sign in to your account',
  },
});

interface IProps extends WrappedComponentProps {
  onSubmit: (...args: any[]) => void;
  isSubmitting: boolean;
  signupRoute: string;
  loginRoute: string;
  status: string[];
}

@observer
class Password extends Component<IProps> {
  form: Form;

  constructor(props: IProps) {
    super(props);

    this.form = new Form({
      fields: {
        email: {
          label: this.props.intl.formatMessage(messages.emailLabel),
          value: '',
          validators: [required, email],
        },
      },
    });
  }

  submit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    this.form.submit({
      onSuccess: form => {
        this.props.onSubmit(form.values());
      },
      onError: noop,
    });
  }

  render() {
    const { form } = this;
    const { isSubmitting, signupRoute, loginRoute, status, intl } = this.props;

    return (
      <div className="auth__container">
        <form className="franz-form auth__form" onSubmit={e => this.submit(e)}>
          <Link to="/auth/welcome">
            <img src="./assets/images/logo.svg" className="auth__logo" alt="" />
          </Link>
          <H1>{intl.formatMessage(messages.headline)}</H1>
          {status.length > 0 && status.includes('sent') && (
            <Infobox type="success" icon="checkbox-marked-circle-outline">
              {intl.formatMessage(messages.successInfo)}
            </Infobox>
          )}
          <Input {...form.$('email').bind()} focus />
          {status.length > 0 && status.includes('no-user') && (
            <p className="error-message center">
              {intl.formatMessage(messages.noUser)}
            </p>
          )}
          {isSubmitting ? (
            <Button
              className="auth__button is-loading"
              buttonType="secondary"
              label={`${intl.formatMessage(globalMessages.submit)} ...`}
              loaded={false}
              onClick={noop}
              disabled
            />
          ) : (
            <Button
              type="submit"
              className="auth__button"
              label={intl.formatMessage(globalMessages.submit)}
              onClick={noop}
            />
          )}
        </form>
        <div className="auth__links">
          <Link to={loginRoute}>{intl.formatMessage(messages.loginLink)}</Link>
          <Link to={signupRoute}>
            {intl.formatMessage(messages.signupLink)}
          </Link>
        </div>
      </div>
    );
  }
}

export default injectIntl(Password);
