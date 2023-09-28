import { Component, FormEvent, ReactElement } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { mdiArrowLeftCircle } from '@mdi/js';
import { noop } from 'lodash';
import Icon from '../ui/icon';
import { LIVE_FRANZ_API } from '../../config';
import { API_VERSION } from '../../environment-remote';
import { serverBase } from '../../api/apiBase'; // TODO: Remove this line after fixing password recovery in-app
import Form from '../../lib/Form';
import { required, email } from '../../helpers/validation-helpers';
import Input from '../ui/input/index';
import Button from '../ui/button';
import Link from '../ui/Link';
import { H1 } from '../ui/headline';
import { GlobalError } from '../../@types/ferdium-components.types';

const messages = defineMessages({
  headline: {
    id: 'login.headline',
    defaultMessage: 'Sign in',
  },
  emailLabel: {
    id: 'login.email.label',
    defaultMessage: 'Email address',
  },
  passwordLabel: {
    id: 'login.password.label',
    defaultMessage: 'Password',
  },
  submitButtonLabel: {
    id: 'login.submit.label',
    defaultMessage: 'Sign in',
  },
  invalidCredentials: {
    id: 'login.invalidCredentials',
    defaultMessage: 'Email or password not valid',
  },
  customServerQuestion: {
    id: 'login.customServerQuestion',
    defaultMessage: 'Using a custom Ferdium server?',
  },
  customServerSuggestion: {
    id: 'login.customServerSuggestion',
    defaultMessage: 'Try importing your Franz account',
  },
  tokenExpired: {
    id: 'login.tokenExpired',
    defaultMessage: 'Your session expired, please login again.',
  },
  serverLogout: {
    id: 'login.serverLogout',
    defaultMessage: 'Your session expired, please login again.',
  },
  signupLink: {
    id: 'login.link.signup',
    defaultMessage: 'Create a free account',
  },
  passwordLink: {
    id: 'login.link.password',
    defaultMessage: 'Reset password',
  },
});

interface IProps extends WrappedComponentProps {
  onSubmit: (...args: any[]) => void;
  isSubmitting: boolean;
  isTokenExpired: boolean;
  isServerLogout: boolean;
  signupRoute: string;
  passwordRoute: string; // TODO: Uncomment this line after fixing password recovery in-app
  error: GlobalError;
}

@observer
class Login extends Component<IProps> {
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
        password: {
          label: this.props.intl.formatMessage(messages.passwordLabel),
          value: '',
          validators: [required],
          type: 'password',
        },
      },
    });
  }

  submit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    this.form.submit({
      onSuccess: (form: Form) => {
        this.props.onSubmit(form.values());
      },
      onError: noop,
    });
  }

  render(): ReactElement {
    const { form } = this;
    const {
      isSubmitting,
      isTokenExpired,
      isServerLogout,
      signupRoute,
      error,
      intl,
      // passwordRoute, // TODO: Uncomment this line after fixing password recovery in-app
    } = this.props;

    return (
      <div className="auth__container">
        <form className="franz-form auth__form" onSubmit={e => this.submit(e)}>
          <Link to="/auth/welcome">
            <img src="./assets/images/logo.svg" className="auth__logo" alt="" />
          </Link>
          <H1>{intl.formatMessage(messages.headline)}</H1>
          {isTokenExpired && (
            <p className="error-message center">
              {intl.formatMessage(messages.tokenExpired)}
            </p>
          )}
          {isServerLogout && (
            <p className="error-message center">
              {intl.formatMessage(messages.serverLogout)}
            </p>
          )}
          <Input {...form.$('email').bind()} focus />
          <Input {...form.$('password').bind()} showPasswordToggle />
          {error.code === 'invalid-credentials' && (
            <>
              <h2 className="error-message center">
                {intl.formatMessage(messages.invalidCredentials)}
              </h2>
              {window['ferdium'].stores.settings.all.app.server !==
                LIVE_FRANZ_API && (
                <>
                  <p className="error-message center">
                    {intl.formatMessage(messages.customServerQuestion)}{' '}
                  </p>
                  <p className="error-message center">
                    <Link
                      to={`${window[
                        'ferdium'
                      ].stores.settings.all.app.server.replace(
                        API_VERSION,
                        '',
                      )}/import`}
                      target="_blank"
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {intl.formatMessage(messages.customServerSuggestion)}
                    </Link>
                  </p>
                </>
              )}
            </>
          )}
          {isSubmitting ? (
            <Button
              className="auth__button is-loading"
              buttonType="secondary"
              label={`${intl.formatMessage(messages.submitButtonLabel)} ...`}
              loaded={false}
              disabled
              onClick={noop}
            />
          ) : (
            <Button
              type="submit"
              className="auth__button"
              label={intl.formatMessage(messages.submitButtonLabel)}
              onClick={noop}
            />
          )}
        </form>
        <div className="auth__links">
          <Link to={signupRoute}>
            {intl.formatMessage(messages.signupLink)}
          </Link>
          <Link
            // to={passwordRoute} // TODO: Uncomment this line after fixing password recovery in-app
            to={`${serverBase()}/user/forgot`} // TODO: Remove this line after fixing password recovery in-app
            target="_blank" // TODO: Remove this line after fixing password recovery in-app
          >
            {intl.formatMessage(messages.passwordLink)}
          </Link>
        </div>
        <div className="auth__help">
          <Link to="/auth/welcome">
            <Icon icon={mdiArrowLeftCircle} size={1.5} />
          </Link>
        </div>
      </div>
    );
  }
}

export default injectIntl(Login);
