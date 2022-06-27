import { Component, ReactElement } from 'react';

import SupportFerdium from '../../components/settings/supportFerdium/SupportFerdiumDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';

class SupportScreen extends Component {
  render(): ReactElement {
    return (
      <ErrorBoundary>
        <SupportFerdium />
      </ErrorBoundary>
    );
  }
}

export default SupportScreen;
