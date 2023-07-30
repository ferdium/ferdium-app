import PropTypes from 'prop-types';

import defineActions from './lib/actions';
import service from './service';
import recipe from './recipe';
import recipePreview from './recipePreview';
import ui from './ui';
import app from './app';
import user from './user';
import settings from './settings';
import requests from './requests';
import workspaces from '../features/workspaces/actions';
import { todoActions } from '../features/todos/actions';

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
