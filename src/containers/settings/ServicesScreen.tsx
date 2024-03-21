import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import type { StoresProps } from '../../@types/ferdium-components.types';
import ServicesDashboard from '../../components/settings/services/ServicesDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';

interface IProps extends StoresProps {}

@inject('stores', 'actions')
@observer
class ServicesScreen extends Component<IProps> {
  componentWillUnmount(): void {
    this.props.actions.service.resetFilter();
    this.props.actions.service.resetStatus();
  }

  // TODO: [TECH DEBT] need to check it
  // deleteService(): void {
  //   this.props.actions.service.deleteService();
  //   this.props.actions.service.resetFilter();
  // }

  render(): ReactElement {
    const {
      // user,
      services,
      router,
    } = this.props.stores;
    const {
      // toggleService,
      filter,
      resetFilter,
    } = this.props.actions.service;
    const isLoading = services.allServicesRequest.isExecuting;
    const allServices =
      services.filterNeedle === null ? services.all : services.filtered;

    return (
      <ErrorBoundary>
        <ServicesDashboard
          // user={user.data} // TODO: [TECH DEBT][PROPS NOT EXIST IN COMPONENT] check it later
          services={allServices}
          status={services.actionStatus}
          // deleteService={() => this.deleteService()} // TODO: [TECH DEBT][PROPS NOT EXIST IN COMPONENT] check it later
          // toggleService={toggleService} // TODO: [TECH DEBT][PROPS NOT USED IN COMPONENT] check it later
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

export default ServicesScreen;
