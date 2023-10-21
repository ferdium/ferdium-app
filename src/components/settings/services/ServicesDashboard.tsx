import { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { To } from 'history';
import SearchInput from '../../ui/SearchInput';
import Infobox from '../../ui/Infobox';
import Loader from '../../ui/loader';
import FAB from '../../ui/FAB';
import ServiceItem from './ServiceItem';
import Appear from '../../ui/effects/Appear';
import { H1 } from '../../ui/headline';
import Service from '../../../models/Service';

const messages = defineMessages({
  headline: {
    id: 'settings.services.headline',
    defaultMessage: 'Your services',
  },
  searchService: {
    id: 'settings.searchService',
    defaultMessage: 'Search service',
  },
  noServicesAdded: {
    id: 'settings.services.noServicesAdded',
    defaultMessage: 'Start by adding a service.',
  },
  noServiceFound: {
    id: 'settings.services.nothingFound',
    defaultMessage: 'Sorry, but no service matched your search term.',
  },
  discoverServices: {
    id: 'settings.services.discoverServices',
    defaultMessage: 'Discover services',
  },
  servicesRequestFailed: {
    id: 'settings.services.servicesRequestFailed',
    defaultMessage: 'Could not load your services',
  },
  tryReloadServices: {
    id: 'settings.account.tryReloadServices',
    defaultMessage: 'Try again',
  },
  updatedInfo: {
    id: 'settings.services.updatedInfo',
    defaultMessage: 'Your changes have been saved',
  },
  deletedInfo: {
    id: 'settings.services.deletedInfo',
    defaultMessage: 'Service has been deleted',
  },
});

interface IProps extends WrappedComponentProps {
  services: Service[];
  isLoading: boolean;
  // toggleService: any; // TODO: [TECH DEBT] check it later
  filterServices: any;
  resetFilter: () => void;
  goTo: (to: To, state?: any) => void;
  servicesRequestFailed: boolean;
  retryServicesRequest: () => void;
  status: any;
  searchNeedle: string | null;
}

@observer
class ServicesDashboard extends Component<IProps> {
  render(): ReactElement {
    const {
      services,
      isLoading,
      // toggleService, // TODO: [TECH DEBT] check it later
      filterServices,
      resetFilter,
      goTo,
      servicesRequestFailed,
      retryServicesRequest,
      status,
      searchNeedle = '',
      intl,
    } = this.props;

    return (
      <div className="settings__main">
        <div className="settings__header">
          <H1>{intl.formatMessage(messages.headline)}</H1>
        </div>
        <div className="settings__body">
          {(services.length > 0 || searchNeedle) && !isLoading && (
            <SearchInput
              placeholder={intl.formatMessage(messages.searchService)}
              onChange={needle => filterServices({ needle })}
              onReset={() => resetFilter()}
              autoFocus
            />
          )}
          {!isLoading && servicesRequestFailed && (
            <Infobox
              icon="alert"
              type="danger"
              ctaLabel={intl.formatMessage(messages.tryReloadServices)}
              ctaLoading={isLoading}
              ctaOnClick={retryServicesRequest}
            >
              {intl.formatMessage(messages.servicesRequestFailed)}
            </Infobox>
          )}

          {status.length > 0 && status.includes('updated') && (
            <Appear>
              <Infobox
                type="success"
                icon="checkbox-marked-circle-outline"
                dismissible
              >
                {intl.formatMessage(messages.updatedInfo)}
              </Infobox>
            </Appear>
          )}

          {status.length > 0 && status.includes('service-deleted') && (
            <Appear>
              <Infobox
                type="success"
                icon="checkbox-marked-circle-outline"
                dismissible
              >
                {intl.formatMessage(messages.deletedInfo)}
              </Infobox>
            </Appear>
          )}

          {!isLoading && services.length === 0 && !searchNeedle && (
            <div className="align-middle settings__empty-state">
              <p className="settings__empty-text">
                <span className="emoji">
                  <img src="./assets/images/emoji/star.png" alt="" />
                </span>
                {intl.formatMessage(messages.noServicesAdded)}
              </p>
              <Link to="/settings/recipes" className="button">
                {intl.formatMessage(messages.discoverServices)}
              </Link>
            </div>
          )}
          {!isLoading && services.length === 0 && searchNeedle && (
            <div className="align-middle settings__empty-state">
              <p className="settings__empty-text">
                <span className="emoji">
                  <img src="./assets/images/emoji/dontknow.png" alt="" />
                </span>
                {intl.formatMessage(messages.noServiceFound)}
              </p>
            </div>
          )}
          {isLoading ? (
            <Loader />
          ) : (
            <table className="service-table" role="grid">
              <tbody>
                {services.map(service => (
                  <ServiceItem
                    key={service.id}
                    service={service}
                    // TODO: [TECH DEBT][PROPS NOT USED IN COMPONENT] check it later
                    // toggleAction={() =>
                    //   toggleService({ serviceId: service.id })
                    // }
                    goToServiceForm={() =>
                      goTo(`/settings/services/edit/${service.id}`)
                    }
                  />
                ))}
              </tbody>
            </table>
          )}

          <FAB className="FAB-class">
            <Link to="/settings/recipes">+</Link>
          </FAB>
        </div>
      </div>
    );
  }
}

export default injectIntl(ServicesDashboard);
