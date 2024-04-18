import { defineMessages, useIntl } from 'react-intl';
import { FERDIUM_TRANSLATION } from '../../../config';

const messages = defineMessages({
  headline: {
    id: 'settings.supportFerdium.headline',
    defaultMessage: 'About Ferdium',
  },
  aboutIntro: {
    id: 'settings.supportFerdium.aboutIntro',
    defaultMessage: 'Special thanks goes to these awesome people:',
  },
  about: {
    id: 'settings.supportFerdium.about',
    defaultMessage:
      'The development of Ferdium is done by contributors. People who use Ferdium like you. They maintain, fix, and improve Ferdium in their spare time.',
  },
});

const SupportFerdiumDashboard = () => {
  const intl = useIntl();

  return (
    <div className="settings__main">
      <div className="settings__header">
        <span className="settings__header-item">
          {intl.formatMessage(messages.headline)}
        </span>
      </div>
      <div className="settings__body">
        <div>
          <p className="settings__support-badges">
            <a
              href="https://twitter.com/ferdiumteam/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                alt="Twitter Follow"
                src="https://img.shields.io/twitter/follow/ferdiumteam?label=Follow&style=social"
              />
            </a>
            <a
              href="https://github.com/ferdium/ferdium-app"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                alt="GitHub Stars"
                src="https://img.shields.io/github/stars/ferdium/ferdium-app?style=social"
              />
            </a>
            <a
              target="_blank"
              href={FERDIUM_TRANSLATION}
              rel="noreferrer noopener"
            >
              <img
                src="https://badges.crowdin.net/ferdium-app/localized.svg"
                alt="Crowdin"
              />
            </a>
            <a
              href="https://opencollective.com/ferdium#section-contributors"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                alt="Open Collective backers"
                src="https://img.shields.io/opencollective/backers/ferdium?logo=open-collective"
              />
            </a>
          </p>
          <p>{intl.formatMessage(messages.aboutIntro)}</p>
          <p>
            <a
              href="https://github.com/ferdium/ferdium-app#contributors-"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                alt="GitHub contributors (non-exhaustive)"
                width="100%"
                src="https://opencollective.com/ferdium/contributors.svg?width=600&avatarHeight=42&button=off"
              />
            </a>
          </p>
          <p className="settings__message">
            {intl.formatMessage(messages.about)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportFerdiumDashboard;
