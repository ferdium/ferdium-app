import { defineMessages, useIntl } from 'react-intl';

import { mdiInformation } from '@mdi/js';
import InfoBar from './ui/InfoBar';
import { GITHUB_FERDI_URL } from '../config';
import { openExternalUrl } from '../helpers/url-helpers';
import { Icon } from './ui/icon';

const messages = defineMessages({
  updateAvailable: {
    id: 'infobar.updateAvailable',
    defaultMessage: 'A new update for Ferdi is available.',
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
};

const AppUpdateInfoBar = ({ onInstallUpdate, onHide }: Props) => {
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
        onClick={() =>
          openExternalUrl(
            `${GITHUB_FERDI_URL}/ferdi/blob/develop/CHANGELOG.md`,
            true,
          )
        }
      >
        <u>{intl.formatMessage(messages.changelog)}</u>
      </button>
    </InfoBar>
  );
};

export default AppUpdateInfoBar;
