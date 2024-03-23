import PropTypes from 'prop-types';

import { todoActions } from '../features/todos/actions';
import workspaces from '../features/workspaces/actions';
import app from './app';
import defineActions from './lib/actions';
import recipe from './recipe';
import recipePreview from './recipePreview';
import requests from './requests';
import service from './service';
import settings from './settings';
import ui from './ui';
import user from './user';

const actions = {
  service,
  recipe,
  recipePreview,
  ui,
  app,
  user,
  settings,
  requests,
};

export default Object.assign(
  defineActions(actions, PropTypes.checkPropTypes),
  { workspaces },
  { todos: todoActions },
);
