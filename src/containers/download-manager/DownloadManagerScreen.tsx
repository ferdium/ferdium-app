import DownloadManager from '../../components/downloadManager/DownloadManagerDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';

const DownloadManagerScreen = ({ ...props }) => {
  return (
    <ErrorBoundary>
      <DownloadManager {...props} />
    </ErrorBoundary>
  );
};

export default DownloadManagerScreen;
