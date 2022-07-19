import { inject, observer } from 'mobx-react';
import { Component, ReactPortal } from 'react';
import ReactDOM from 'react-dom';
import { Outlet } from 'react-router-dom';

import { StoresProps } from '../../@types/ferdium-components.types';
import Layout from '../../components/settings/releaseNotes/ReleaseNotesLayout';
import ErrorBoundary from '../../components/util/ErrorBoundary';

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
    return ReactDOM.createPortal(
      <ErrorBoundary>
        <Layout {...this.props}>
          <Outlet />
        </Layout>
      </ErrorBoundary>,
      this.el,
    );
  }
}

export default inject('stores', 'actions')(observer(SettingsContainer));
