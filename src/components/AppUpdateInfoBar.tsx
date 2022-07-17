import { defineMessages, useIntl } from 'react-intl';

import { mdiInformation } from '@mdi/js';
import InfoBar from './ui/InfoBar';
import Icon from './ui/icon';

const messages = defineMessages({
  updateAvailable: {
    id: 'infobar.updateAvailable',
    defaultMessage: 'A new update for Ferdium is available.',
  },
  changelog: {
    id: 'infobar.buttonChangelog',
    defaultMessage: 'What is new?',
  },
  buttonInstallUpdate: {
    id: 'infobar.buttonInstallUpdate',
    defaultMessage: 'Restart & install update',
  },
});

type Props = {
  onInstallUpdate: () => void;
  onHide: () => void;
  updateVersionParsed: string;
};

const AppUpdateInfoBar = ({
  onInstallUpdate,
  updateVersionParsed,
  onHide,
}: Props) => {
  const intl = useIntl();

  return (
    <InfoBar
      type="primary"
      ctaLabel={intl.formatMessage(messages.buttonInstallUpdate)}
      onClick={onInstallUpdate}
      onHide={onHide}
    >
      <Icon icon={mdiInformation} />
      {intl.formatMessage(messages.updateAvailable)}{' '}
      <button
        className="info-bar__inline-button"
        type="button"
        onClick={() => {
          window.location.href = window.location.href.includes('#/auth')
            ? `#/auth/releasenotes${updateVersionParsed}`
            : `#/releasenotes${updateVersionParsed}`;
        }}
      >
        <u>{intl.formatMessage(messages.changelog)}</u>
      </button>
    </InfoBar>
  );
};

export default AppUpdateInfoBar;
