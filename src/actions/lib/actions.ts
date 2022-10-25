import PropTypes from 'prop-types';

export interface ActionDefinitions {
  [key: string]: {
    [key: string]: PropTypes.InferType<any>;
  };
}

export interface Actions {
  [key: string]: {
    [key: string]: {
      (...args: any[]): void;
      listeners: Function[];
      notify: (params: any) => void;
      listen: (listener: (params: any) => void) => void;
      off: (listener: (params: any) => void) => void;
    };
  };
}

export const createActionsFromDefinitions = <T extends {}>(
  actionDefinitions: ActionDefinitions,
  validate: any,
): T => {
  const actions = {};
  // eslint-disable-next-line unicorn/no-array-for-each
  Object.keys(actionDefinitions).forEach(actionName => {
    const action = (params = {}) => {
      const schema = actionDefinitions[actionName];
      validate(schema, params, actionName);
      action.notify(params);
    };
    actions[actionName] = action;
    action.listeners = [];
    action.listen = listener => action.listeners.push(listener);
    action.off = listener => {
      const { listeners } = action;
      listeners.splice(listeners.indexOf(listener), 1);
    };
    action.notify = params =>
      // eslint-disable-next-line unicorn/no-array-for-each
      action.listeners.forEach(listener => listener(params));
  });
  return actions as T;
};

export default (definitions, validate) => {
  const newActions = {};
  // eslint-disable-next-line unicorn/no-array-for-each
  Object.keys(definitions).forEach(scopeName => {
    newActions[scopeName] = createActionsFromDefinitions(
      definitions[scopeName],
      validate,
    );
  });
  return newActions;
};
