import PropTypes from 'prop-types';
import { ActionDefinitions } from './lib/actions';

export default <ActionDefinitions>{
  install: {
    recipeId: PropTypes.string.isRequired,
    update: PropTypes.bool,
  },
  update: {},
};
