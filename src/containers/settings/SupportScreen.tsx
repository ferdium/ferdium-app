import SupportFerdium from '../../components/settings/supportFerdium/SupportFerdiumDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';

const SupportScreen = () => {
  return (
    <ErrorBoundary>
      <SupportFerdium />
    </ErrorBoundary>
  );
};

export default SupportScreen;
