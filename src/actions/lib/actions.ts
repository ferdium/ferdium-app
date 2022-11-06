export interface ActionDefinitions {
  [key: string]: {
    [key: string]: any;
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

export const createActionsFromDefinitions = <T>(
  actionDefinitions: ActionDefinitions,
  validate: any,
): T => {
  const actions = {};

  for (const actionName of Object.keys(actionDefinitions)) {
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
    action.notify = params => {
      for (const listener of action.listeners) {
        listener(params);
      }
    };
  }

  return actions as T;
};

export default (definitions, validate) => {
  const newActions = {};
  for (const scopeName of Object.keys(definitions)) {
    newActions[scopeName] = createActionsFromDefinitions(
      definitions[scopeName],
      validate,
    );
  }

  return newActions;
};
