import { Component } from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';

import Supportferdium from '../../components/settings/supportferdium/SupportferdiumDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import AppStore from '../../stores/AppStore';

class SupportScreen extends Component {
  constructor(props) {
    super(props);

    this.openLink = this.openLink.bind(this);
  }

  openLink(url) {
    this.props.actions.app.openExternalUrl({ url });
  }

  render() {
    return (
      <ErrorBoundary>
        <Supportferdium openLink={this.openLink} />
      </ErrorBoundary>
    );
  }
}

SupportScreen.propTypes = {
  actions: PropTypes.shape({
    app: PropTypes.instanceOf(AppStore).isRequired,
  }).isRequired,
};

export default inject('actions')(SupportScreen);
