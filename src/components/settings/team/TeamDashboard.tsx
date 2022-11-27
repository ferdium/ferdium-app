import { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import withStyles, { WithStylesProps } from 'react-jss';
import classnames from 'classnames';
import Loader from '../../ui/Loader';
import Button from '../../ui/button';
import Infobox from '../../ui/Infobox';
import { H1 } from '../../ui/headline';
import { LIVE_FRANZ_API } from '../../../config';

const messages = defineMessages({
  headline: {
    id: 'settings.team.headline',
    defaultMessage: 'Team',
  },
  contentHeadline: {
    id: 'settings.team.contentHeadline',
    defaultMessage: 'Franz Team Management',
  },
  intro: {
    id: 'settings.team.intro',
    defaultMessage:
      'You are currently using Franz Servers, which is why you have access to Team Management.',
  },
  copy: {
    id: 'settings.team.copy',
    defaultMessage:
      "Franz's Team Management allows you to manage Franz Subscriptions for multiple users. Please keep in mind that having a Franz Premium subscription will give you no advantages in using Ferdium: The only reason you still have access to Team Management is so you can manage your legacy Franz Teams and so that you don't loose any functionality in managing your account.",
  },
  manageButton: {
    id: 'settings.team.manageAction',
    defaultMessage: 'Manage your Team on meetfranz.com',
  },
  teamsUnavailable: {
    id: 'settings.team.teamsUnavailable',
    defaultMessage: 'Teams are unavailable',
  },
  teamsUnavailableInfo: {
    id: 'settings.team.teamsUnavailableInfo',
    defaultMessage:
      'Teams are currently only available when using the Franz Server and after paying for Franz Professional. Please change your server to https://api.franzinfra.com to use teams.',
  },
  tryReloadUserInfoRequest: {
    id: 'settings.team.tryReloadUserInfoRequest',
    defaultMessage: 'Try reloading',
  },
  userInfoRequestFailed: {
    id: 'settings.team.userInfoRequestFailed',
    defaultMessage: 'User Info request failed',
  },
});

const styles = {
  cta: {
    margin: [40, 'auto'],
    height: 'auto',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',

    '@media(min-width: 800px)': {
      flexDirection: 'row',
    },
  },
  content: {
    height: 'auto',
    order: 1,

    '@media(min-width: 800px)': {
      order: 0,
    },
  },
  image: {
    display: 'block',
    height: 150,
    order: 0,
    margin: [0, 'auto', 40, 'auto'],

    '@media(min-width: 800px)': {
      marginLeft: 40,
      order: 1,
    },
  },
  headline: {
    marginBottom: 0,
  },
  headlineWithSpacing: {
    marginBottom: 'inherit',
  },
  buttonContainer: {
    display: 'flex',
    height: 'auto',
  },
};

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  isLoading: boolean;
  userInfoRequestFailed: boolean;
  retryUserInfoRequest: () => void;
  openTeamManagement: () => void;
  server: string;
}

@observer
class TeamDashboard extends Component<IProps> {
  render(): ReactElement {
    const {
      isLoading,
      userInfoRequestFailed,
      retryUserInfoRequest,
      openTeamManagement,
      classes,
      server,
      intl,
    } = this.props;

    return server === LIVE_FRANZ_API ? (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            {intl.formatMessage(messages.headline)}
          </span>
        </div>
        <div className="settings__body">
          {isLoading && <Loader />}

          {!isLoading && userInfoRequestFailed && (
            <Infobox
              icon="alert"
              type="danger"
              ctaLabel={intl.formatMessage(messages.tryReloadUserInfoRequest)}
              ctaLoading={isLoading}
              ctaOnClick={retryUserInfoRequest}
            >
              {intl.formatMessage(messages.userInfoRequestFailed)}
            </Infobox>
          )}

          {!userInfoRequestFailed && !isLoading && (
            <>
              <H1
                className={classnames({
                  [classes.headline]: true,
                  [classes.headlineWithSpacing]: true,
                })}
              >
                {intl.formatMessage(messages.contentHeadline)}
              </H1>
              <div className={classes.container}>
                <div className={classes.content}>
                  <p>{intl.formatMessage(messages.intro)}</p>
                  <p>{intl.formatMessage(messages.copy)}</p>
                </div>
                <img
                  className={classes.image}
                  src="https://cdn.franzinfra.com/announcements/assets/teams.png"
                  alt="Ferdium for Teams"
                />
              </div>
              <div className={classes.buttonContainer}>
                <Button
                  label={intl.formatMessage(messages.manageButton)}
                  onClick={openTeamManagement}
                  className={classes.cta}
                />
              </div>
            </>
          )}
        </div>
        <ReactTooltip place="right" type="dark" effect="solid" />
      </div>
    ) : (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            {intl.formatMessage(messages.headline)}
          </span>
        </div>
        <div className="settings__body">
          <H1 className={classes.headline}>
            {intl.formatMessage(messages.teamsUnavailable)}
          </H1>
          <p
            className="settings__message"
            style={{
              borderTop: 0,
              marginTop: 0,
            }}
          >
            {intl.formatMessage(messages.teamsUnavailableInfo)}
          </p>
        </div>
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(TeamDashboard),
);
