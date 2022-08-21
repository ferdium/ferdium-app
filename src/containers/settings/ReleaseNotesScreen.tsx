import { Component, ReactElement } from 'react';

import ReleaseNotes from '../../components/settings/releaseNotes/ReleaseNotesDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';

class ReleaseNotesScreen extends Component {
  render(): ReactElement {
    return (
      <ErrorBoundary>
        <ReleaseNotes />
      </ErrorBoundary>
    );
  }
}

export default ReleaseNotesScreen;
