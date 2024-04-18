import ReleaseNotes from '../../components/settings/releaseNotes/ReleaseNotesDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';

const ReleaseNotesScreen = () => {
  return (
    <ErrorBoundary>
      <ReleaseNotes />
    </ErrorBoundary>
  );
};

export default ReleaseNotesScreen;
