import { mdiArrowLeftCircle } from '@mdi/js';
import { noop } from 'lodash';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import type { GlobalError } from '../../@types/ferdium-components.types';
import type { Actions } from '../../actions/lib/actions';
import { serverBase } from '../../api/apiBase';
import { email, minLength, required } from '../../helpers/validation-helpers';
import Form from '../../lib/Form';
import Link from '../ui/Link';
import Button from '../ui/button';
import { H1 } from '../ui/headline';
import Icon from '../ui/icon';
import Input from '../ui/input/index';

const messages = defineMessages({
  headline: {
    id: 'signup.headline',
    defaultMessage: 'Sign up',
  },
  firstnameLabel: {
    id: 'signup.firstname.label',
    defaultMessage: 'First Name',
  },
  lastnameLabel: {
    id: 'signup.lastname.label',
    defaultMessage: 'Last Name',
  },
  emailLabel: {
    id: 'signup.email.label',
    defaultMessage: 'Email address',
  },
  companyLabel: {
    id: 'signup.company.label',
    defaultMessage: 'Company',
  },
  passwordLabel: {
    id: 'signup.password.label',
    defaultMessage: 'Password',
  },
  legalInfo: {
    id: 'signup.legal.info',
    defaultMessage: 'By creating a Ferdium account you accept the',
  },
  terms: {
    id: 'signup.legal.terms',
    defaultMessage: 'Terms of service',
  },
  privacy: {
    id: 'signup.legal.privacy',
    defaultMessage: 'Privacy Statement',
  },
  submitButtonLabel: {
    id: 'signup.submit.label',
    defaultMessage: 'Create account',
  },
  loginLink: {
    id: 'signup.link.login',
    defaultMessage: 'Already have an account, sign in?',
  },
  emailDuplicate: {
    id: 'signup.emailDuplicate',
    defaultMessage: 'A user with that email address already exists',
  },
});

interface IProps extends WrappedComponentProps {
  onSubmit: (...args: any[]) => void;
  isSubmitting: boolean;
  loginRoute: string;
  error: GlobalError;
  actions?: Actions;
}

@inject('actions')
@observer
class Signup extends Component<IProps> {
  form: Form;

  constructor(props: IProps) {
    super(props);

    this.form = new Form({
      fields: {
        firstname: {
          label: this.props.intl.formatMessage(messages.firstnameLabel),
          value: '',
          validators: [required],
        },
        lastname: {
          label: this.props.intl.formatMessage(messages.lastnameLabel),
          value: '',
          validators: [required],
        },
        email: {
          label: this.props.intl.formatMessage(messages.emailLabel),
          value: '',
          validators: [required, email],
        },
        password: {
          label: this.props.intl.formatMessage(messages.passwordLabel),
          value: '',
          validators: [required, minLength(6)],
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

  render() {
    const { form } = this;
    const { intl } = this.props;
    const { isSubmitting, loginRoute, error } = this.props;

    return (
      <div className="auth__scroll-container">
        <div className="auth__container auth__container--signup">
          <form
            className="franz-form auth__form"
            onSubmit={e => this.submit(e)}
          >
            <Link to="/auth/welcome">
              <img
                src="./assets/images/logo.svg"
                className="auth__logo"
                alt=""
              />
            </Link>
            <H1>{intl.formatMessage(messages.headline)}</H1>
            <div className="grid__row">
              <Input {...form.$('firstname').bind()} focus />
              <Input {...form.$('lastname').bind()} />
            </div>
            <Input {...form.$('email').bind()} />
            <Input
              {...form.$('password').bind()}
              showPasswordToggle
              scorePassword
            />
            {error.status === 401 && (
              <h2 className="error-message center">
                {intl.formatMessage(messages.emailDuplicate)}
              </h2>
            )}
            {isSubmitting ? (
              <Button
                className="auth__button is-loading"
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
            <p className="legal">
              {intl.formatMessage(messages.legalInfo)}
              <br />
              <Link
                to={`${serverBase()}/terms`}
                target="_blank"
                className="link"
              >
                {intl.formatMessage(messages.terms)}
              </Link>
              &nbsp;&amp;&nbsp;
              <Link
                to={`${serverBase()}/privacy`}
                target="_blank"
                className="link"
              >
                {intl.formatMessage(messages.privacy)}
              </Link>
              .
            </p>
          </form>
          <div className="auth__links">
            <Link to={loginRoute}>
              {intl.formatMessage(messages.loginLink)}
            </Link>
          </div>
          <div className="auth__help">
            <Link to="/auth/welcome">
              <Icon icon={mdiArrowLeftCircle} size={1.5} />
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(Signup);
