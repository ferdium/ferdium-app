import { Component, ReactNode, ReactPortal } from 'react';
import ReactDOM from 'react-dom';
import { observer, inject } from 'mobx-react';

import { StoresProps } from 'src/@types/ferdium-components.types';

import Layout from '../../components/settings/SettingsLayout';
import Navigation from '../../components/settings/navigation/SettingsNavigation';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import { workspaceStore } from '../../features/workspaces';

interface SettingsContainerProps extends StoresProps {
  children: ReactNode;
}

class SettingsContainer extends Component<SettingsContainerProps> {
  portalRoot: any;

  el: HTMLDivElement;

  constructor(props: SettingsContainerProps) {
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
    const { children, stores } = this.props;
    const { closeSettings } = this.props.actions.ui;

    const navigation = (
      <Navigation
        serviceCount={stores.services.all.length}
        workspaceCount={workspaceStore.workspaces.length}
      />
    );

    return ReactDOM.createPortal(
      <ErrorBoundary>
        <Layout navigation={navigation} closeSettings={closeSettings}>
          {children}
        </Layout>
      </ErrorBoundary>,
      this.el,
    );
  }
}

export default inject('stores', 'actions')(observer(SettingsContainer));
