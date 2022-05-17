import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import Form from '../../lib/Form';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Link from '../ui/Link';
import Infobox from '../ui/Infobox';
import { url, required } from '../../helpers/validation-helpers';
import { LIVE_FERDIUM_API, LIVE_FRANZ_API, LIVE_FERDI_API } from '../../config';
import globalMessages from '../../i18n/globalMessages';
import { H1 } from '../ui/headline';

const messages = defineMessages({
  headline: {
    id: 'changeserver.headline',
    defaultMessage: 'Change server',
  },
  label: {
    id: 'changeserver.label',
    defaultMessage: 'Server',
  },
  warning: {
    id: 'changeserver.warning',
    defaultMessage: 'Extra settings offered by Ferdium will not be saved',
  },
  customServerLabel: {
    id: 'changeserver.customServerLabel',
    defaultMessage: 'Custom server',
  },
  urlError: {
    id: 'changeserver.urlError',
    defaultMessage: 'Enter a valid URL',
  },
});

class ChangeServer extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    server: PropTypes.string.isRequired,
  };

  ferdiumServer = LIVE_FERDIUM_API;

  ferdiServer = LIVE_FERDI_API;

  franzServer = LIVE_FRANZ_API;

  defaultServers = [this.ferdiumServer, this.franzServer, this.ferdiServer];

  form = (() => {
    const { intl } = this.props;
    return new Form({
      fields: {
        server: {
          label: intl.formatMessage(messages.label),
          value: this.props.server,
          options: [
            { value: this.ferdiumServer, label: 'Ferdium (Default)' },
            { value: this.franzServer, label: 'Franz' },
            { value: this.ferdiServer, label: 'Ferdi' },
            {
              value: this.defaultServers.includes(this.props.server)
                ? ''
                : this.props.server,
              label: 'Custom',
            },
          ],
        },
        customServer: {
          label: intl.formatMessage(messages.customServerLabel),
          value: '',
          validators: [url, required],
        },
      },
    },
    intl,
  );
  })();

  componentDidMount() {
    if (this.defaultServers.includes(this.props.server)) {
      this.form.$('server').value = this.props.server;
    } else {
      this.form.$('server').value = '';
      this.form.$('customServer').value = this.props.server;
    }
  }

  submit(e) {
    e.preventDefault();
    this.form.submit({
      onSuccess: form => {
        if (!this.defaultServers.includes(form.values().server)) {
          form.$('server').onChange(form.values().customServer);
        }
        this.props.onSubmit(form.values());
      },
      onError: form => {
        if (this.defaultServers.includes(form.values().server)) {
          this.props.onSubmit(form.values());
        }
      },
    });
  }

  render() {
    const { form } = this;
    const { intl } = this.props;
    return (
      <div className="auth__container">
        <form className="franz-form auth__form" onSubmit={e => this.submit(e)}>
          <Link to='/auth/welcome'><img src="./assets/images/logo.svg" className="auth__logo" alt="" /></Link>
          <H1>{intl.formatMessage(messages.headline)}</H1>
          {(form.$('server').value === this.franzServer || form.$('server').value === this.ferdiServer) && (
            <Infobox type="warning">
              {intl.formatMessage(messages.warning)}
            </Infobox>
          )}
          <Select field={form.$('server')} />
          {!this.defaultServers.includes(form.$('server').value) && (
            <Input
              placeholder="Custom Server"
              onChange={e => {
                this.form.$('customServer').value = this.form.$('customServer').value.replace(/\/$/, "");
                this.submit(e)
              }}
              field={form.$('customServer')}
            />
          )}
          <Button
            type="submit"
            className="auth__button"
            label={intl.formatMessage(globalMessages.submit)}
          />
        </form>
      </div>
    );
  }
}

export default injectIntl(observer(ChangeServer));
