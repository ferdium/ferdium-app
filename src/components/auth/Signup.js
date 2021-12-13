/* eslint jsx-a11y/anchor-is-valid: 0 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';

import Form from '../../lib/Form';
import { required, email, minLength } from '../../helpers/validation-helpers';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Link from '../ui/Link';

import { globalError as globalErrorPropType } from '../../prop-types';
import { termsBase } from '../../api/apiBase';

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
  // companyLabel: {
  //   id: 'signup.company.label',
  //   defaultMessage: 'Company',
  // },
  passwordLabel: {
    id: 'signup.password.label',
    defaultMessage: 'Password',
  },
  legalInfo: {
    id: 'signup.legal.info',
    defaultMessage: 'By creating a Ferdi account you accept the',
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

class Signup extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    loginRoute: PropTypes.string.isRequired,
    error: globalErrorPropType.isRequired,
  };

  form = new Form(
    {
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
    },
    this.props.intl,
  );

  submit(e) {
    e.preventDefault();
    this.form.submit({
      onSuccess: form => {
        this.props.onSubmit(form.values());
      },
      onError: () => {},
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
            <Link to='/auth/welcome'><img src="./assets/images/logo.svg" className="auth__logo" alt="" /></Link>
            <h1>{intl.formatMessage(messages.headline)}</h1>
            <div className="grid__row">
              <Input field={form.$('firstname')} focus />
              <Input field={form.$('lastname')} />
            </div>
            <Input field={form.$('email')} />
            <Input
              field={form.$('password')}
              showPasswordToggle
              scorePassword
            />
            {error.code === 'email-duplicate' && (
              <p className="error-message center">
                {intl.formatMessage(messages.emailDuplicate)}
              </p>
            )}
            {isSubmitting ? (
              <Button
                className="auth__button is-loading"
                label={`${intl.formatMessage(messages.submitButtonLabel)} ...`}
                loaded={false}
                disabled
              />
            ) : (
              <Button
                type="submit"
                className="auth__button"
                label={intl.formatMessage(messages.submitButtonLabel)}
              />
            )}
            <p className="legal">
              {intl.formatMessage(messages.legalInfo)}
              <br />
              <Link
                to={`${termsBase()}/terms`}
                target="_blank"
                className="link"
              >
                {intl.formatMessage(messages.terms)}
              </Link>
              &nbsp;&amp;&nbsp;
              <Link
                to={`${termsBase()}/privacy`}
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
        </div>
      </div>
    );
  }
}

export default injectIntl(inject('actions')(observer(Signup)));
