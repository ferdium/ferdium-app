import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape } from 'react-intl';

import Button from '../../ui/Button';

const messages = defineMessages({
  headline: {
    id: 'settings.supportFerdi.headline',
    defaultMessage: '!!!Support Ferdi',
  },
  title: {
    id: 'settings.supportFerdi.title',
    defaultMessage: '!!!Do you like Ferdi? Spread the love!',
  },
  github: {
    id: 'settings.supportFerdi.github',
    defaultMessage: '!!!Star on GitHub',
  },
  share: {
    id: 'settings.supportFerdi.share',
    defaultMessage: '!!!Tell your Friends',
  },
  openCollective: {
    id: 'settings.supportFerdi.openCollective',
    defaultMessage: '!!!Support our Open Collective',
  },
});

class SupportFerdiDashboard extends Component {
  static contextTypes = {
    intl: intlShape,
  };

  static propTypes = {
    openLink: PropTypes.func.isRequired,
  };

  render() {
    const { openLink } = this.props;
    const { intl } = this.context;

    return (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            {intl.formatMessage(messages.headline)}
          </span>
        </div>
        <div className="settings__body">
          <h1>{intl.formatMessage(messages.title)}</h1>
          <Button
            label={intl.formatMessage(messages.github)}
            className="franz-form__button--inverted franz-form__button--large"
            onClick={() => openLink('https://github.com/getferdi/ferdi')}
          />
          <Button
            label={intl.formatMessage(messages.share)}
            className="franz-form__button--inverted franz-form__button--large"
            onClick={() => openLink('https://twitter.com/intent/tweet?text=Ferdi%3A%20A%20messaging%20browser%20that%20allows%20you%20to%20combine%20your%20favourite%20messaging%20services%20into%20one%20application.%0A%0ACheck%20out%20Ferdi%20at%20https%3A//getferdi.com')}
          />
          <Button
            label={intl.formatMessage(messages.openCollective)}
            className="franz-form__button--inverted franz-form__button--large"
            onClick={() => openLink('https://opencollective.com/getferdi')}
          />
        </div>
      </div>
    );
  }
}

export default SupportFerdiDashboard;
