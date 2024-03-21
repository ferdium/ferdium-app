import { inject, observer } from 'mobx-react';
import { Component, type ReactElement, type ReactPortal } from 'react';
import ReactDOM from 'react-dom';
import { Outlet } from 'react-router-dom';
import type { StoresProps } from '../../@types/ferdium-components.types';
import Layout from '../../components/settings/SettingsLayout';
import Navigation from '../../components/settings/navigation/SettingsNavigation';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import { workspaceStore } from '../../features/workspaces';

interface IProps extends Partial<StoresProps> {}

@inject('stores', 'actions')
@observer
class SettingsContainer extends Component<IProps> {
  portalRoot: HTMLElement | null;

  el: HTMLDivElement;

  constructor(props: IProps) {
    super(props);

    this.portalRoot = document.querySelector('#portalContainer');
    this.el = document.createElement('div');
  }

  componentDidMount(): void {
    if (this.portalRoot) {
      this.portalRoot.append(this.el);
    }
  }

  componentWillUnmount(): void {
    this.el.remove();
  }

  render(): ReactPortal {
    const { stores } = this.props;
    const { closeSettings } = this.props.actions!.ui;

    const navigation: ReactElement = (
      <Navigation
        serviceCount={stores!.services.all.length}
        workspaceCount={workspaceStore.workspaces.length}
      />
    );

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

export default SettingsContainer;
