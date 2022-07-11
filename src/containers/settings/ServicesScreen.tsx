import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';

import { StoresProps } from '../../@types/ferdium-components.types';
import ServicesDashboard from '../../components/settings/services/ServicesDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';

class ServicesScreen extends Component<StoresProps> {
  componentWillUnmount(): void {
    this.props.actions.service.resetFilter();
    this.props.actions.service.resetStatus();
  }

  deleteService(): void {
    this.props.actions.service.deleteService();
    this.props.actions.service.resetFilter();
  }

  render(): ReactElement {
    const { user, services, router } = this.props.stores;
    const { toggleService, filter, resetFilter } = this.props.actions.service;
    const isLoading = services.allServicesRequest.isExecuting;

    let allServices = services.all;
    if (services.filterNeedle !== null) {
      allServices = services.filtered;
    }

    return (
      <ErrorBoundary>
        <ServicesDashboard
          user={user.data}
          services={allServices}
          status={services.actionStatus}
          deleteService={() => this.deleteService()}
          toggleService={toggleService}
          isLoading={isLoading}
          filterServices={filter}
          resetFilter={resetFilter}
          goTo={router.push}
          servicesRequestFailed={
            services.allServicesRequest.wasExecuted &&
            services.allServicesRequest.isError
          }
          retryServicesRequest={() => services.allServicesRequest.reload()}
          searchNeedle={services.filterNeedle}
        />
      </ErrorBoundary>
    );
  }
}

export default inject('stores', 'actions')(observer(ServicesScreen));
