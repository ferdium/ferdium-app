import { Component, type ReactElement } from 'react';
import DownloadManager from '../../components/downloadManager/DownloadManagerDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';

class DownloadManagerScreen extends Component {
  render(): ReactElement {
    return (
      <ErrorBoundary>
        <DownloadManager {...this.props} />
      </ErrorBoundary>
    );
  }
}

export default DownloadManagerScreen;
