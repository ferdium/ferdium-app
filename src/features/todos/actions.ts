import PropTypes from 'prop-types';
import { ReactElement } from 'react';
import { createActionsFromDefinitions } from '../../actions/lib/actions';

interface TodoActionsType {
  resize: (width: number) => void;
  toggleTodosPanel: () => void;
  toggleTodosFeatureVisibility: () => void;
  setTodosWebview: (webview: ReactElement) => void;
  handleHostMessage: (action: string, data: object) => void;
  handleClientMessage: (
    channel: string,
    message: { action: string; data: object },
  ) => void;
  openDevTools: () => void;
  reload: () => void;
}

export const todoActions = createActionsFromDefinitions<TodoActionsType>(
  {
    resize: {
      width: PropTypes.number.isRequired,
    },
    toggleTodosPanel: {},
    toggleTodosFeatureVisibility: {},
    setTodosWebview: {
      webview: PropTypes.instanceOf(Element).isRequired,
    },
    handleHostMessage: {
      action: PropTypes.string.isRequired,
      data: PropTypes.object,
    },
    handleClientMessage: {
      channel: PropTypes.string.isRequired,
      message: PropTypes.shape({
        action: PropTypes.string.isRequired,
        data: PropTypes.object,
      }),
    },
    openDevTools: {},
    reload: {},
  },
  PropTypes.checkPropTypes,
);

export default todoActions;
