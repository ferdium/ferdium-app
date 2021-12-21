import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  headline: {
    id: 'settings.supportFerdi.headline',
    defaultMessage: 'About Ferdi',
  },
  aboutIntro: {
    id: 'settings.supportFerdi.aboutIntro',
    defaultMessage: 'Special thanks goes to these awesome people:',
  },
  about: {
    id: 'settings.supportFerdi.about',
    defaultMessage: 'The development of Ferdi is done by contributors. People who use Ferdi like you. They maintain, fix, and improve Ferdi in their spare time.',
  }
});

const SupportFerdiDashboard = () => {
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
              href="https://twitter.com/getferdi/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="Twitter Follow"
                src="https://img.shields.io/twitter/follow/getferdi?label=Follow&style=social"
              />
            </a>
            <a
              href="https://github.com/getferdi/ferdi"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="GitHub Stars"
                src="https://img.shields.io/github/stars/getferdi/ferdi?style=social"
              />
            </a>
            <a target="_blank" href="https://crowdin.com/project/getferdi">
              <img src="https://badges.crowdin.net/getferdi/localized.svg" alt="Crowdin"/>
            </a>
            <a
              href="https://opencollective.com/getferdi#section-contributors"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="Open Collective backers"
                src="https://img.shields.io/opencollective/backers/getferdi?logo=open-collective"
              />
            </a>
          </p>
          <p>{intl.formatMessage(messages.aboutIntro)}</p>
          <p>
            <a
              href="https://github.com/getferdi/ferdi#contributors-"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="GitHub contributors (non-exhaustive)"
                width="100%"
                src="https://opencollective.com/getferdi/contributors.svg?width=600&avatarHeight=42&button=off"
              />
            </a>
          </p>
          <p className="settings__message">{intl.formatMessage(messages.about)}</p>
        </div>
      </div>
    </div>
  );
};

export default SupportFerdiDashboard;
