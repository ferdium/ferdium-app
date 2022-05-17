import { Component } from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';

import Infobox from '../../ui/Infobox';
import Button from '../../ui/Button';

const messages = defineMessages({
  headline: {
    id: 'settings.service.error.headline',
    defaultMessage: 'Error',
  },
  goBack: {
    id: 'settings.service.error.goBack',
    defaultMessage: 'Back to services',
  },
  availableServices: {
    id: 'settings.service.form.availableServices',
    defaultMessage: 'Available services',
  },
  errorMessage: {
    id: 'settings.service.error.message',
    defaultMessage: 'Could not load service recipe.',
  },
});

class ServiceError extends Component {
  render() {
    const { intl } = this.props;

    return (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            <Link to="/settings/recipes">
              {intl.formatMessage(messages.availableServices)}
            </Link>
          </span>
          <span className="separator" />
          <span className="settings__header-item">
            {intl.formatMessage(messages.headline)}
          </span>
        </div>
        <div className="settings__body">
          <Infobox type="danger" icon="alert">
            {intl.formatMessage(messages.errorMessage)}
          </Infobox>
        </div>
        <div className="settings__controls">
          <Button
            label={intl.formatMessage(messages.goBack)}
            htmlForm="form"
            onClick={() => window.history.back()}
          />
        </div>
      </div>
    );
  }
}

export default injectIntl(observer(ServiceError));
