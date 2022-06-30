import { inject, observer } from 'mobx-react';
import { Component, ReactPortal } from 'react';
import ReactDOM from 'react-dom';
import { Outlet } from 'react-router-dom';

import { StoresProps } from '../../@types/ferdium-components.types';
import Navigation from '../../components/settings/navigation/SettingsNavigation';
import Layout from '../../components/settings/SettingsLayout';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import { workspaceStore } from '../../features/workspaces';

class SettingsContainer extends Component<StoresProps> {
  portalRoot: any;

  el: HTMLDivElement;

  constructor(props: StoresProps) {
    super(props);

    this.portalRoot = document.querySelector('#portalContainer');
    this.el = document.createElement('div');
  }

  componentDidMount(): void {
    this.portalRoot.append(this.el);
  }

  componentWillUnmount(): void {
    this.el.remove();
  }

  render(): ReactPortal {
    const { stores } = this.props;
    const { closeSettings } = this.props.actions.ui;

    const navigation = (
      <Navigation
        serviceCount={stores.services.all.length}
        workspaceCount={workspaceStore.workspaces.length}
      />
    );

    console.log('settings window');

    return ReactDOM.createPortal(
      <ErrorBoundary>
        <Layout navigation={navigation} closeSettings={closeSettings}>
          <Outlet />
        </Layout>
      </ErrorBoundary>,
      this.el,
    );
  }
}

export default inject('stores', 'actions')(observer(SettingsContainer));
