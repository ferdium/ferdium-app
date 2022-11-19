import { Webview } from 'react-electron-web-view';
import PropTypes from 'prop-types';
import { createActionsFromDefinitions } from '../../actions/lib/actions';

export interface TodoClientMessage {
  action: string;
  data: object;
}

interface TodoActionsType {
  resize: (width: number) => void;
  toggleTodosPanel: () => void;
  toggleTodosFeatureVisibility: () => void;
  setTodosWebview: (webview: Webview) => void;
  handleHostMessage: (action: string, data: object) => void;
  handleClientMessage: (channel: string, message: TodoClientMessage) => void;
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
