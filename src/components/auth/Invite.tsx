import classnames from 'classnames';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { Link } from 'react-router-dom';
import { email, required } from '../../helpers/validation-helpers';
import Form from '../../lib/Form';
import Infobox from '../ui/Infobox';
import Button from '../ui/button';
import Appear from '../ui/effects/Appear';
import { H1 } from '../ui/headline';
import Input from '../ui/input/index';

const messages = defineMessages({
  settingsHeadline: {
    id: 'settings.invite.headline',
    defaultMessage: 'Invite Friends',
  },
  headline: {
    id: 'invite.headline.friends',
    defaultMessage: 'Invite 3 of your friends or colleagues',
  },
  nameLabel: {
    id: 'invite.name.label',
    defaultMessage: 'Name',
  },
  emailLabel: {
    id: 'invite.email.label',
    defaultMessage: 'Email address',
  },
  submitButtonLabel: {
    id: 'invite.submit.label',
    defaultMessage: 'Send invites',
  },
  skipButtonLabel: {
    id: 'invite.skip.label',
    defaultMessage: 'I want to do this later',
  },
  inviteSuccessInfo: {
    id: 'invite.successInfo',
    defaultMessage: 'Invitations sent successfully',
  },
});

interface IProps extends WrappedComponentProps {
  onSubmit: (...args: any[]) => void;
  embed?: boolean;
  isInviteSuccessful?: boolean;
  isLoadingInvite?: boolean;
}

interface IState {
  showSuccessInfo: boolean;
}

@observer
class Invite extends Component<IProps, IState> {
  form: Form;

  constructor(props: IProps) {
    super(props);

    this.state = { showSuccessInfo: false };
    this.form = new Form({
      fields: {
        invite: [
          ...Array.from({ length: 3 }).fill({
            fields: {
              name: {
                label: this.props.intl.formatMessage(messages.nameLabel),
                placeholder: this.props.intl.formatMessage(messages.nameLabel),
                onChange: () => {
                  this.setState({ showSuccessInfo: false });
                },
                validators: [required],
                // related: ['invite.0.email'], // path accepted but does not work
              },
              email: {
                label: this.props.intl.formatMessage(messages.emailLabel),
                placeholder: this.props.intl.formatMessage(messages.emailLabel),
                onChange: () => {
                  this.setState({ showSuccessInfo: false });
                },
                validators: [email],
              },
            },
          }),
        ],
      },
    });
  }

  componentDidMount() {
    const selector: HTMLElement | null =
      document.querySelector('input:first-child');
    if (selector) {
      selector.focus();
    }
  }

  submit(e) {
    e.preventDefault();

    this.form?.submit({
      onSuccess: form => {
        this.props.onSubmit({ invites: form.values().invite });
        this.form?.clear();
        // this.form.$('invite.0.name').focus(); // path accepted but does not focus ;(

        const selector: HTMLElement | null =
          document.querySelector('input:first-child');
        if (selector) {
          selector.focus();
        }

        this.setState({ showSuccessInfo: true });
      },
      onError: noop,
    });
  }

  render() {
    const { form } = this;
    const { intl } = this.props;
    const {
      embed = false,
      isInviteSuccessful = false,
      isLoadingInvite = false,
    } = this.props;

    const atLeastOneEmailAddress = form
      .$('invite')
      .map(invite => invite.$('email').value)
      .some(emailValue => emailValue.trim() !== '');

    const sendButtonClassName = classnames({
      auth__button: true,
      'invite__embed--button': embed,
    });

    const renderForm = (
      <>
        {this.state.showSuccessInfo && isInviteSuccessful && (
          <Appear>
            <Infobox
              type="success"
              icon="checkbox-marked-circle-outline"
              dismissible
            >
              {intl.formatMessage(messages.inviteSuccessInfo)}
            </Infobox>
          </Appear>
        )}

        <form className="franz-form auth__form" onSubmit={e => this.submit(e)}>
          {!embed && (
            <img src="./assets/images/logo.svg" className="auth__logo" alt="" />
          )}
          <H1 className={embed ? 'invite__embed' : ''}>
            {intl.formatMessage(messages.headline)}
          </H1>
          {form.$('invite').map(invite => (
            <div className="grid" key={invite.key}>
              <div className="grid__row">
                <Input {...invite.$('name').bind()} showLabel={false} />
                <Input {...invite.$('email').bind()} showLabel={false} />
              </div>
            </div>
          ))}
          <Button
            type="submit"
            className={sendButtonClassName}
            disabled={!atLeastOneEmailAddress}
            label={intl.formatMessage(messages.submitButtonLabel)}
            loaded={!isLoadingInvite}
            onClick={noop}
          />
          {!embed && (
            <Link
              to="/"
              className="franz-form__button franz-form__button--secondary auth__button auth__button--skip"
            >
              {intl.formatMessage(messages.skipButtonLabel)}
            </Link>
          )}
        </form>
      </>
    );

    return (
      <div
        className={
          embed ? 'settings__main' : 'auth__container auth__container--signup'
        }
      >
        {embed && (
          <div className="settings__header">
            <H1>{intl.formatMessage(messages.settingsHeadline)}</H1>
          </div>
        )}
        {embed ? (
          <div className="settings__body invite__form">{renderForm}</div>
        ) : (
          <div>{renderForm}</div>
        )}
      </div>
    );
  }
}

export default injectIntl(Invite);
