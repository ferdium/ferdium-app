import { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';

import FeaturesStore from '../../../stores/FeaturesStore';
import TodosWebview from '../components/TodosWebview';
import ErrorBoundary from '../../../components/util/ErrorBoundary';
import { todosStore } from '..';
import { TODOS_MIN_WIDTH } from '../../../config';
import { todoActions } from '../actions';
import ServicesStore from '../../../stores/ServicesStore';

class TodosScreen extends Component {
  render() {
    if (
      !todosStore ||
      !todosStore.isFeatureActive ||
      todosStore.isTodosPanelForceHidden
    ) {
      return null;
    }

    return (
      <ErrorBoundary>
        <TodosWebview
          isTodosServiceActive={
            this.props.stores.services.isTodosServiceActive || false
          }
          isVisible={todosStore.isTodosPanelVisible}
          togglePanel={todoActions.toggleTodosPanel}
          handleClientMessage={todoActions.handleClientMessage}
          setTodosWebview={webview => todoActions.setTodosWebview({ webview })}
          width={todosStore.width}
          minWidth={TODOS_MIN_WIDTH}
          resize={width => todoActions.resize({ width })}
          userAgent={todosStore.userAgent}
          todoUrl={todosStore.todoUrl}
          isTodoUrlValid={todosStore.isTodoUrlValid}
        />
      </ErrorBoundary>
    );
  }
}

export default inject('stores', 'actions')(observer(TodosScreen));

TodosScreen.propTypes = {
  stores: PropTypes.shape({
    features: PropTypes.instanceOf(FeaturesStore).isRequired,
    services: PropTypes.instanceOf(ServicesStore).isRequired,
  }).isRequired,
};
