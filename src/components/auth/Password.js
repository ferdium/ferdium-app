import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';

import Form from '../../lib/Form';
import { required, email } from '../../helpers/validation-helpers';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Link from '../ui/Link';
import Infobox from '../ui/Infobox';
import globalMessages from '../../i18n/globalMessages';

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

class Password extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    signupRoute: PropTypes.string.isRequired,
    loginRoute: PropTypes.string.isRequired,
    status: MobxPropTypes.arrayOrObservableArray.isRequired,
  };

  form = new Form(
    {
      fields: {
        email: {
          label: this.props.intl.formatMessage(messages.emailLabel),
          value: '',
          validators: [required, email],
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
    const { isSubmitting, signupRoute, loginRoute, status } = this.props;

    return (
      <div className="auth__container">
        <form className="franz-form auth__form" onSubmit={e => this.submit(e)}>
          <Link to='/auth/welcome'><img src="./assets/images/logo.svg" className="auth__logo" alt="" /></Link>
          <h1>{intl.formatMessage(messages.headline)}</h1>
          {status.length > 0 && status.includes('sent') && (
            <Infobox type="success" icon="checkbox-marked-circle-outline">
              {intl.formatMessage(messages.successInfo)}
            </Infobox>
          )}
          <Input field={form.$('email')} focus />
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
              disabled
            />
          ) : (
            <Button
              type="submit"
              className="auth__button"
              label={intl.formatMessage(globalMessages.submit)}
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

export default injectIntl(observer(Password));
