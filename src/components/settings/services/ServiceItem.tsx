import { mdiBellOff, mdiMessageBulletedOff, mdiPower } from '@mdi/js';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import type ServiceModel from '../../../models/Service';
import Icon from '../../ui/icon';

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

interface IProps extends WrappedComponentProps {
  service: ServiceModel;
  goToServiceForm: () => void;
}

@observer
class ServiceItem extends Component<IProps> {
  render(): ReactElement {
    const {
      service,
      // toggleAction, // TODO: [TECH DEBT][PROP NOT USED IN COMPONENT] check it later
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
          {service.name === '' ? service.recipe.name : service.name}
        </td>
        <td className="service-table__column-info" onClick={goToServiceForm}>
          {service.isMuted && (
            <Icon
              icon={mdiBellOff}
              data-tooltip-id="tooltip-service-item"
              data-tooltip-content={intl.formatMessage(messages.tooltipIsMuted)}
            />
          )}
        </td>
        <td className="service-table__column-info" onClick={goToServiceForm}>
          {!service.isEnabled && (
            <Icon
              icon={mdiPower}
              data-tooltip-id="tooltip-service-item"
              data-tooltip-content={intl.formatMessage(
                messages.tooltipIsDisabled,
              )}
            />
          )}
        </td>
        <td className="service-table__column-info" onClick={goToServiceForm}>
          {!service.isNotificationEnabled && (
            <Icon
              icon={mdiMessageBulletedOff}
              data-tooltip-id="tooltip-service-item"
              data-tooltip-content={intl.formatMessage(
                messages.tooltipNotificationsDisabled,
              )}
            />
          )}
          <ReactTooltip
            id="tooltip-service-item"
            place="right"
            variant="dark"
            style={{ height: 'auto' }}
          />
        </td>
      </tr>
    );
  }
}

export default injectIntl(ServiceItem);
