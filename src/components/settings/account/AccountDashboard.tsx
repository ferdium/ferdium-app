import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { H1, H2 } from '../../ui/headline';

import Loader from '../../ui/loader';
import Button from '../../ui/button';
import Infobox from '../../ui/infobox/index';
import {
  DEFAULT_LOADER_COLOR,
  LOCAL_SERVER,
  LIVE_FRANZ_API,
} from '../../../config';
import User from '../../../models/User';

const messages = defineMessages({
  headline: {
    id: 'settings.account.headline',
    defaultMessage: 'Account',
  },
  headlineDangerZone: {
    id: 'settings.account.headlineDangerZone',
    defaultMessage: 'Danger Zone',
  },
  accountEditButton: {
    id: 'settings.account.account.editButton',
    defaultMessage: 'Edit account',
  },
  invoicesButton: {
    id: 'settings.account.headlineInvoices',
    defaultMessage: 'Invoices',
  },
  userInfoRequestFailed: {
    id: 'settings.account.userInfoRequestFailed',
    defaultMessage: 'Could not load user information',
  },
  tryReloadUserInfoRequest: {
    id: 'settings.account.tryReloadUserInfoRequest',
    defaultMessage: 'Try again',
  },
  deleteAccount: {
    id: 'settings.account.deleteAccount',
    defaultMessage: 'Delete account',
  },
  deleteInfo: {
    id: 'settings.account.deleteInfo',
    defaultMessage:
      "If you don't need your Ferdium account any longer, you can delete your account and all related data here.",
  },
  deleteEmailSent: {
    id: 'settings.account.deleteEmailSent',
    defaultMessage:
      'You have received an email with a link to confirm your account deletion. Your account and data cannot be restored!',
  },
  yourLicense: {
    id: 'settings.account.yourLicense',
    defaultMessage: 'Your Ferdium License:',
  },
  accountUnavailable: {
    id: 'settings.account.accountUnavailable',
    defaultMessage: 'Account is unavailable',
  },
  accountUnavailableInfo: {
    id: 'settings.account.accountUnavailableInfo',
    defaultMessage:
      'You are using Ferdium without an account. If you want to use Ferdium with an account and keep your services synchronized across installations, please select a server in the Settings tab then login.',
  },
});

interface IProp extends WrappedComponentProps {
  user: User;
  isLoading: boolean;
  userInfoRequestFailed: boolean;
  isLoadingDeleteAccount: boolean;
  isDeleteAccountSuccessful: boolean;
  server: string;
  retryUserInfoRequest: () => void;
  deleteAccount: () => void;
  openEditAccount: () => void;
  openInvoices: () => void;
}

@observer
class AccountDashboard extends Component<IProp> {
  render() {
    const {
      user,
      isLoading,
      userInfoRequestFailed,
      retryUserInfoRequest,
      deleteAccount,
      isLoadingDeleteAccount,
      isDeleteAccountSuccessful,
      openEditAccount,
      openInvoices,
      server,
    } = this.props;
    const { intl } = this.props;

    const isUsingWithoutAccount = server === LOCAL_SERVER;
    const isUsingFranzServer = server === LIVE_FRANZ_API;

    return (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            {intl.formatMessage(messages.headline)}
          </span>
        </div>
        <div className="settings__body">
          {isUsingWithoutAccount && (
            <>
              <H1 className=".no-bottom-margin">
                {intl.formatMessage(messages.accountUnavailable)}
              </H1>
              <p
                className="settings__message"
                style={{
                  borderTop: 0,
                  marginTop: 0,
                }}
              >
                {intl.formatMessage(messages.accountUnavailableInfo)}
              </p>
            </>
          )}
          {!isUsingWithoutAccount && (
            <>
              {isLoading && <Loader color={DEFAULT_LOADER_COLOR} />}

              {!isLoading && userInfoRequestFailed && (
                <Infobox
                  icon="alert"
                  type="danger"
                  ctaLabel={intl.formatMessage(
                    messages.tryReloadUserInfoRequest,
                  )}
                  ctaOnClick={retryUserInfoRequest}
                >
                  {intl.formatMessage(messages.userInfoRequestFailed)}
                </Infobox>
              )}

              {!userInfoRequestFailed && (
                <>
                  {!isLoading && (
                    <>
                      <div className="account">
                        <div className="account__box account__box--flex">
                          <div className="account__avatar">
                            <img src="./assets/images/logo.svg" alt="" />
                          </div>
                          <div className="account__info">
                            <H1>
                              <span className="username">{`${user.firstname} ${user.lastname}`}</span>
                            </H1>
                            <p>
                              {user.organization && `${user.organization}, `}
                              {user.email}
                            </p>
                            <div className="manage-user-links">
                              <Button
                                label={intl.formatMessage(
                                  messages.accountEditButton,
                                )}
                                className="franz-form__button--inverted"
                                onClick={openEditAccount}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {user.isSubscriptionOwner && isUsingFranzServer && (
                        <div className="account">
                          <div className="account__box">
                            <H2>{intl.formatMessage(messages.yourLicense)}</H2>
                            <p>Franz</p>
                            <div className="manage-user-links">
                              <Button
                                label={intl.formatMessage(
                                  messages.invoicesButton,
                                )}
                                className="franz-form__button--inverted"
                                onClick={openInvoices}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {isUsingFranzServer && (
                    <div className="account franz-form">
                      <div className="account__box">
                        <H2>
                          {intl.formatMessage(messages.headlineDangerZone)}
                        </H2>
                        {!isDeleteAccountSuccessful && (
                          <div className="account__subscription">
                            <p>{intl.formatMessage(messages.deleteInfo)}</p>
                            <Button
                              label={intl.formatMessage(messages.deleteAccount)}
                              buttonType="danger"
                              onClick={() => deleteAccount()}
                              loaded={!isLoadingDeleteAccount}
                            />
                          </div>
                        )}
                        {isDeleteAccountSuccessful && (
                          <p>{intl.formatMessage(messages.deleteEmailSent)}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
        <ReactTooltip
          place="right"
          variant="dark"
          float
          style={{ height: 'auto' }}
        />
      </div>
    );
  }
}

export default injectIntl(AccountDashboard);
