import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  headline: {
    id: 'settings.supportferdium.headline',
    defaultMessage: 'About ferdium',
  },
  aboutIntro: {
    id: 'settings.supportferdium.aboutIntro',
    defaultMessage: 'Special thanks goes to these awesome people:',
  },
  about: {
    id: 'settings.supportferdium.about',
    defaultMessage: 'The development of ferdium is done by contributors. People who use ferdium like you. They maintain, fix, and improve ferdium in their spare time.',
  }
});

const SupportferdiumDashboard = () => {
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
              href="https://twitter.com/getferdium/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="Twitter Follow"
                src="https://img.shields.io/twitter/follow/getferdium?label=Follow&style=social"
              />
            </a>
            <a
              href="https://github.com/getferdium/ferdium"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="GitHub Stars"
                src="https://img.shields.io/github/stars/getferdium/ferdium?style=social"
              />
            </a>
            <a target="_blank" href="https://crowdin.com/project/getferdium">
              <img src="https://badges.crowdin.net/getferdium/localized.svg" alt="Crowdin"/>
            </a>
            <a
              href="https://opencollective.com/getferdium#section-contributors"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="Open Collective backers"
                src="https://img.shields.io/opencollective/backers/getferdium?logo=open-collective"
              />
            </a>
          </p>
          <p>{intl.formatMessage(messages.aboutIntro)}</p>
          <p>
            <a
              href="https://github.com/getferdium/ferdium#contributors-"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="GitHub contributors (non-exhaustive)"
                width="100%"
                src="https://opencollective.com/getferdium/contributors.svg?width=600&avatarHeight=42&button=off"
              />
            </a>
          </p>
          <p className="settings__message">{intl.formatMessage(messages.about)}</p>
        </div>
      </div>
    </div>
  );
};

export default SupportferdiumDashboard;
