import { Component, ReactElement } from 'react';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import DownloadManager from '../../components/downloadManager/DownloadManagerDashboard';

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
