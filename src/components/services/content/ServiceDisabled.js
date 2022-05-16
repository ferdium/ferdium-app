import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';

import Button from '../../ui/button';
import { H1 } from '../../ui/headline';

const messages = defineMessages({
  headline: {
    id: 'service.disabledHandler.headline',
    defaultMessage: '{name} is disabled',
  },
  action: {
    id: 'service.disabledHandler.action',
    defaultMessage: 'Enable {name}',
  },
});

class ServiceDisabled extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    enable: PropTypes.func.isRequired,
  };

  render() {
    const { name, enable } = this.props;
    const { intl } = this.props;

    return (
      <div className="services__info-layer">
        <H1>{intl.formatMessage(messages.headline, { name })}</H1>
        <Button
          label={intl.formatMessage(messages.action, { name })}
          buttonType="inverted"
          onClick={() => enable()}
        />
      </div>
    );
  }
}

export default injectIntl(observer(ServiceDisabled));
