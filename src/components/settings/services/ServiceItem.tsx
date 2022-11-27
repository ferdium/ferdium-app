import { Component, ReactElement } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { mdiBellOff, mdiMessageBulletedOff, mdiPower } from '@mdi/js';
import ServiceModel from '../../../models/Service';
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
      // toggleAction, //  TODO - [TECH DEBT][PROP NOT USED IN COMPONENT] check it later
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
        <td
          className="service-table__column-icon"
          onClick={goToServiceForm}
          role="gridcell"
        >
          <img
            src={service.icon}
            className={classnames({
              'service-table__icon': true,
              'has-custom-icon': service.hasCustomIcon,
            })}
            alt=""
          />
        </td>
        <td
          className="service-table__column-name"
          onClick={goToServiceForm}
          role="gridcell"
        >
          {service.name !== '' ? service.name : service.recipe.name}
        </td>
        <td
          className="service-table__column-info"
          onClick={goToServiceForm}
          role="gridcell"
        >
          {service.isMuted && (
            <Icon
              icon={mdiBellOff}
              data-tip={intl.formatMessage(messages.tooltipIsMuted)}
            />
          )}
        </td>
        <td
          className="service-table__column-info"
          onClick={goToServiceForm}
          role="gridcell"
        >
          {!service.isEnabled && (
            <Icon
              icon={mdiPower}
              data-tip={intl.formatMessage(messages.tooltipIsDisabled)}
            />
          )}
        </td>
        <td
          className="service-table__column-info"
          onClick={goToServiceForm}
          role="gridcell"
        >
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

export default injectIntl(ServiceItem);
