import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import { Link } from 'react-router';

import { Input } from '../../ui/input/index';
import Form from '../../../lib/Form';
import Button from '../../ui/Button';
import Radio from '../../ui/Radio';
import Infobox from '../../ui/Infobox';
import { H2 } from '../../ui/headline';

const messages = defineMessages({
  headline: {
    id: 'settings.account.headline',
    defaultMessage: 'Account',
  },
  headlineProfile: {
    id: 'settings.account.headlineProfile',
    defaultMessage: 'Update profile',
  },
  headlineAccount: {
    id: 'settings.account.headlineAccount',
    defaultMessage: 'Account information',
  },
  headlinePassword: {
    id: 'settings.account.headlinePassword',
    defaultMessage: 'Change password',
  },
  successInfo: {
    id: 'settings.account.successInfo',
    defaultMessage: 'Your changes have been saved',
  },
  buttonSave: {
    id: 'settings.account.buttonSave',
    defaultMessage: 'Update profile',
  },
});

class EditUserForm extends Component {
  static propTypes = {
    status: MobxPropTypes.observableArray.isRequired,
    form: PropTypes.instanceOf(Form).isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired,
  };

  submit(e) {
    e.preventDefault();
    this.props.form.submit({
      onSuccess: form => {
        const values = form.values();
        this.props.onSubmit(values);
      },
      onError: () => {},
    });
  }

  render() {
    const {
      // user,
      status,
      form,
      isSaving,
    } = this.props;
    const { intl } = this.props;

    return (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            <Link to="/settings/user">
              {intl.formatMessage(messages.headline)}
            </Link>
          </span>
          <span className="separator" />
          <span className="settings__header-item">
            {intl.formatMessage(messages.headlineProfile)}
          </span>
        </div>
        <div className="settings__body">
          <form onSubmit={e => this.submit(e)} id="form">
            {status.length > 0 && status.includes('data-updated') && (
              <Infobox type="success" icon="checkbox-marked-circle-outline">
                {intl.formatMessage(messages.successInfo)}
              </Infobox>
            )}
            <H2>{intl.formatMessage(messages.headlineAccount)}</H2>
            <div className="grid__row">
              <Input {...form.$('firstname').bind()} focus />
              <Input {...form.$('lastname').bind()} />
            </div>
            <Input {...form.$('email').bind()} />
            <Radio field={form.$('accountType')} />
            {form.$('accountType').value === 'company' && (
              <Input field={form.$('organization')} />
            )}
            <H2>{intl.formatMessage(messages.headlinePassword)}</H2>
            <Input {...form.$('oldPassword').bind()} showPasswordToggle />
            <Input
              {...form.$('newPassword').bind()}
              showPasswordToggle
              scorePassword
            />
          </form>
        </div>
        <div className="settings__controls">
          {/* Save Button */}
          {isSaving ? (
            <Button
              type="submit"
              label={intl.formatMessage(messages.buttonSave)}
              loaded={!isSaving}
              buttonType="secondary"
              disabled
            />
          ) : (
            <Button
              type="submit"
              label={intl.formatMessage(messages.buttonSave)}
              htmlForm="form"
            />
          )}
        </div>
      </div>
    );
  }
}

export default injectIntl(observer(EditUserForm));
