import { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import { mdiBellOff, mdiMessageBulletedOff, mdiPower } from '@mdi/js';
import ServiceModel from '../../../models/Service';
import { Icon } from '../../ui/icon';

const messages = defineMessages({
  tooltipIsDisabled: {
    id: 'settings.services.tooltip.isDisabled',
    defaultMessage: 'Service is disabled',
  },
  tooltipNotificationsDisabled: {
    id: 'settings.services.tooltip.notificationsDisabled',
    defaultMessage: 'Notifications are disabled',
  },
  tooltipIsMuted: {
    id: 'settings.services.tooltip.isMuted',
    defaultMessage: 'All sounds are muted',
  },
});

class ServiceItem extends Component {
  static propTypes = {
    service: PropTypes.instanceOf(ServiceModel).isRequired,
    goToServiceForm: PropTypes.func.isRequired,
  };

  render() {
    const {
      service,
      // toggleAction,
      goToServiceForm,
    } = this.props;
    const { intl } = this.props;

    return (
      <tr
        className={classnames({
          'service-table__row': true,
          'service-table__row--disabled': !service.isEnabled,
        })}
      >
        <td className="service-table__column-icon" onClick={goToServiceForm}>
          <img
            src={service.icon}
            className={classnames({
              'service-table__icon': true,
              'has-custom-icon': service.hasCustomIcon,
            })}
            alt=""
          />
        </td>
        <td className="service-table__column-name" onClick={goToServiceForm}>
          {service.name !== '' ? service.name : service.recipe.name}
        </td>
        <td className="service-table__column-info" onClick={goToServiceForm}>
          {service.isMuted && (
            <Icon
              icon={mdiBellOff}
              data-tip={intl.formatMessage(messages.tooltipIsMuted)}
            />
          )}
        </td>
        <td className="service-table__column-info" onClick={goToServiceForm}>
          {!service.isEnabled && (
            <Icon
              icon={mdiPower}
              data-tip={intl.formatMessage(messages.tooltipIsDisabled)}
            />
          )}
        </td>
        <td className="service-table__column-info" onClick={goToServiceForm}>
          {!service.isNotificationEnabled && (
            <Icon
              icon={mdiMessageBulletedOff}
              data-tip={intl.formatMessage(
                messages.tooltipNotificationsDisabled,
              )}
            />
          )}
          <ReactTooltip place="top" type="dark" effect="solid" />
        </td>
      </tr>
    );
  }
}

export default injectIntl(observer(ServiceItem));
