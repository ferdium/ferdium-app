import { Component, FormEvent, ReactElement } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { mdiArrowLeftCircle } from '@mdi/js';
import { noop } from 'lodash';
import Form from '../../lib/Form';
import Input from '../ui/input/index';
import Select from '../ui/Select';
import Button from '../ui/button';
import Link from '../ui/Link';
import Infobox from '../ui/Infobox';
import { url, required } from '../../helpers/validation-helpers';
import { LIVE_FERDIUM_API, LIVE_FRANZ_API } from '../../config';
import globalMessages from '../../i18n/globalMessages';
import { H1 } from '../ui/headline';
import Icon from '../ui/icon';

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

interface IProps extends WrappedComponentProps {
  onSubmit: (...args: any[]) => void;
  server: string;
}

@observer
class ChangeServer extends Component<IProps> {
  ferdiumServer: string = LIVE_FERDIUM_API;

  franzServer: string = LIVE_FRANZ_API;

  defaultServers: string[] = [LIVE_FERDIUM_API, LIVE_FRANZ_API];

  form: Form;

  constructor(props: IProps) {
    super(props);

    this.form = new Form({
      fields: {
        server: {
          label: this.props.intl.formatMessage(messages.label),
          value: this.props.server,
          options: [
            { value: this.ferdiumServer, label: 'Ferdium (Default)' },
            { value: this.franzServer, label: 'Franz' },
            {
              value: this.defaultServers.includes(this.props.server)
                ? ''
                : this.props.server,
              label: 'Custom',
            },
          ],
        },
        customServer: {
          label: this.props.intl.formatMessage(messages.customServerLabel),
          placeholder: this.props.intl.formatMessage(
            messages.customServerLabel,
          ),
          value: '',
          validators: [url, required],
        },
      },
    });
  }

  componentDidMount(): void {
    if (this.defaultServers.includes(this.props.server)) {
      this.form.$('server').value = this.props.server;
    } else {
      this.form.$('server').value = '';
      this.form.$('customServer').value = this.props.server;
    }
  }

  submit(e: FormEvent<HTMLElement>): void {
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

  render(): ReactElement {
    const { form } = this;
    const { intl } = this.props;

    return (
      <div className="auth__container">
        <form className="franz-form auth__form" onSubmit={e => this.submit(e)}>
          <Link to="/auth/welcome">
            <img src="./assets/images/logo.svg" className="auth__logo" alt="" />
          </Link>
          <H1>{intl.formatMessage(messages.headline)}</H1>
          {form.$('server').value === this.franzServer && (
            <Infobox type="warning">
              {intl.formatMessage(messages.warning)}
            </Infobox>
          )}
          <Select field={form.$('server')} />
          {!this.defaultServers.includes(form.$('server').value) && (
            <Input
              placeholder="Custom Server"
              {...form.$('customServer').bind()}
            />
          )}
          <Button
            type="submit"
            className="auth__button"
            label={intl.formatMessage(globalMessages.submit)}
            onClick={noop}
          />
        </form>
        <div className="auth__help">
          <Link to="/auth/welcome">
            <Icon icon={mdiArrowLeftCircle} size={1.5} />
          </Link>
        </div>
      </div>
    );
  }
}

export default injectIntl(ChangeServer);
